import { createPrismaClient } from '@vbdhub/db';
import type { Prisma } from '@prisma/client';
import type { JobDefinition } from '../types.js';

const PX_BASE_URL = 'https://proteomecentral.proteomexchange.org/api/proxi/v0.1';
const PX_SOURCE_DB = 'proteomexchange';
const PX_CATEGORY = 'proteomics';
const PX_DEFAULT_PAGE_SIZE = 1000;
const PX_DEFAULT_DETAIL_CONCURRENCY = 6;

type PxCompactDatasetRow = [
  unknown?,
  unknown?,
  unknown?,
  unknown?,
  unknown?,
  unknown?,
  unknown?,
  unknown?,
  unknown?,
  unknown?,
  unknown?
];

interface PxCompactResponse {
  datasets?: PxCompactDatasetRow[];
  result_set?: {
    n_available_pages?: number;
    n_available_rows?: number;
    n_rows_returned?: number;
    page_number?: number;
    page_size?: number;
  };
  status?: {
    description?: string;
    error_code?: string | null;
    status?: string;
    status_code?: number;
  };
}

interface PxCompactDataset {
  accession: string;
  title: string | null;
  repository: string | null;
  speciesSummary: string | null;
  sdrf: string | null;
  fileSummary: string | null;
  instrumentSummary: string | null;
  publicationSummary: string | null;
  labHead: string | null;
  announceDate: string | null;
  keywordSummary: string | null;
}

interface PxTerm {
  accession?: string;
  cv_param_group?: string;
  name?: string;
  value?: string;
  value_accession?: string;
}

interface PxTermGroup {
  terms?: PxTerm[];
}

interface PxDetailResponse {
  contacts?: PxTermGroup[];
  datasetFiles?: PxTerm[];
  description?: string;
  fullDatasetLinks?: PxTerm[];
  identifiers?: PxTerm[];
  instruments?: PxTerm[];
  keywords?: PxTerm[];
  modifications?: PxTerm[];
  publications?: PxTermGroup[];
  species?: PxTermGroup[];
  title?: string;
}

interface PxStatusErrorPayload {
  description?: string;
  error_code?: string;
  status?: string;
  status_code?: number;
  repository?: string;
}

interface PxSyncOptions {
  pageSize: number;
  startPage: number;
  maxPages: number | null;
  datasetLimit: number | null;
  detailConcurrency: number;
}

class PxApiError extends Error {
  readonly status: number;
  readonly errorCode: string | null;
  readonly details: PxStatusErrorPayload | null;

  constructor(
    message: string,
    status: number,
    errorCode: string | null,
    details: PxStatusErrorPayload | null
  ) {
    super(message);
    this.name = 'PxApiError';
    this.status = status;
    this.errorCode = errorCode;
    this.details = details;
  }
}

export const pxSyncJob: JobDefinition = {
  name: 'px',
  description: 'Synchronise ProteomeXchange records',
  async run({ logger, signal }) {
    if (signal.aborted) throw new Error('Job aborted before start');

    const prisma = createPrismaClient();
    const options = loadOptionsFromEnv();
    const counters = {
      scanned: 0,
      synced: 0,
      skipped: 0,
      failed: 0
    };

    try {
      logger.info(
        {
          pageSize: options.pageSize,
          startPage: options.startPage,
          maxPages: options.maxPages,
          datasetLimit: options.datasetLimit,
          detailConcurrency: options.detailConcurrency
        },
        'Starting ProteomeXchange synchronisation'
      );

      const firstPage = await fetchCompactDatasetPage(
        options.startPage,
        options.pageSize,
        signal
      );
      const availablePages = getAvailablePageCount(firstPage, options.pageSize);
      const lastPageExclusive = getLastPageExclusive(
        options.startPage,
        availablePages,
        options.maxPages
      );

      if (options.startPage >= availablePages) {
        logger.warn(
          {
            startPage: options.startPage,
            availablePages
          },
          'Start page is beyond available pages; nothing to sync'
        );
        return;
      }

      for (let page = options.startPage; page < lastPageExclusive; page += 1) {
        if (signal.aborted) throw new Error('Job aborted');

        const response =
          page === options.startPage
            ? firstPage
            : await fetchCompactDatasetPage(page, options.pageSize, signal);
        const compactDatasets = extractCompactDatasets(response.datasets ?? []);

        let datasetsToProcess = compactDatasets;
        if (options.datasetLimit !== null) {
          const remaining = options.datasetLimit - counters.scanned;
          if (remaining <= 0) break;
          datasetsToProcess = compactDatasets.slice(0, remaining);
        }

        if (datasetsToProcess.length === 0) {
          logger.info({ page }, 'No datasets returned on page');
          continue;
        }

        counters.scanned += datasetsToProcess.length;
        await runWithConcurrency(
          datasetsToProcess,
          options.detailConcurrency,
          async (compactDataset) => {
            if (signal.aborted) throw new Error('Job aborted');

            try {
              const detail = await fetchPxDatasetDetail(
                compactDataset.accession,
                signal
              );
              const speciesNames = extractSpeciesNames(detail);
              const dataset = await upsertDataset(prisma, compactDataset, detail);
              const taxaLinked = await linkDatasetTaxa(
                prisma,
                dataset.id,
                speciesNames
              );

              counters.synced += 1;
              logger.debug(
                {
                  sourceKey: compactDataset.accession,
                  datasetId: dataset.id,
                  taxaLinked
                },
                'ProteomeXchange dataset synchronised'
              );
            } catch (error) {
              if (isIgnorablePxError(error)) {
                counters.skipped += 1;
                logger.warn(
                  {
                    sourceKey: compactDataset.accession,
                    err: error
                  },
                  'Skipping ProteomeXchange dataset'
                );
                return;
              }

              counters.failed += 1;
              logger.error(
                {
                  sourceKey: compactDataset.accession,
                  err: error
                },
                'Failed to sync ProteomeXchange dataset'
              );
            }
          }
        );

        logger.info(
          {
            page,
            pageSize: options.pageSize,
            rowsReturned: datasetsToProcess.length,
            scanned: counters.scanned,
            synced: counters.synced,
            skipped: counters.skipped,
            failed: counters.failed,
            availablePages
          },
          'ProteomeXchange sync progress'
        );

        if (
          options.datasetLimit !== null &&
          counters.scanned >= options.datasetLimit
        ) {
          break;
        }
      }

      logger.info(
        {
          scanned: counters.scanned,
          synced: counters.synced,
          skipped: counters.skipped,
          failed: counters.failed
        },
        'ProteomeXchange synchronisation complete'
      );
    } finally {
      await prisma.$disconnect();
    }
  }
};

function loadOptionsFromEnv(): PxSyncOptions {
  return {
    pageSize: parsePositiveIntEnv('PX_PAGE_SIZE', PX_DEFAULT_PAGE_SIZE),
    startPage: parseNonNegativeIntEnv('PX_START_PAGE', 0),
    maxPages: parseOptionalPositiveIntEnv('PX_MAX_PAGES'),
    datasetLimit: parseOptionalPositiveIntEnv('PX_DATASET_LIMIT'),
    detailConcurrency: parsePositiveIntEnv(
      'PX_DETAIL_CONCURRENCY',
      PX_DEFAULT_DETAIL_CONCURRENCY
    )
  };
}

function parsePositiveIntEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseNonNegativeIntEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseOptionalPositiveIntEnv(name: string): number | null {
  const value = process.env[name];
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getAvailablePageCount(
  response: PxCompactResponse,
  pageSize: number
): number {
  const fromPages = response.result_set?.n_available_pages;
  if (Number.isFinite(fromPages) && fromPages && fromPages > 0) return fromPages;

  const fromRows = response.result_set?.n_available_rows;
  if (Number.isFinite(fromRows) && fromRows && fromRows > 0) {
    return Math.ceil(fromRows / pageSize);
  }

  return 1;
}

function getLastPageExclusive(
  startPage: number,
  availablePages: number,
  maxPages: number | null
): number {
  if (maxPages === null) return availablePages;
  return Math.min(availablePages, startPage + maxPages);
}

async function fetchCompactDatasetPage(
  pageNumber: number,
  pageSize: number,
  signal: AbortSignal
): Promise<PxCompactResponse> {
  const params = new URLSearchParams({
    resultType: 'compact',
    pageSize: String(pageSize),
    pageNumber: String(pageNumber)
  });

  return fetchJson<PxCompactResponse>(
    `${PX_BASE_URL}/datasets?${params.toString()}`,
    signal
  );
}

function extractCompactDatasets(
  rows: PxCompactDatasetRow[]
): PxCompactDataset[] {
  const datasets: PxCompactDataset[] = [];
  for (const row of rows) {
    const parsed = parseCompactDatasetRow(row);
    if (parsed) datasets.push(parsed);
  }
  return datasets;
}

function parseCompactDatasetRow(row: PxCompactDatasetRow): PxCompactDataset | null {
  const accession = normalizeNullableString(row[0]);
  if (!accession) return null;

  return {
    accession,
    title: normalizeNullableString(row[1]),
    repository: normalizeNullableString(row[2]),
    speciesSummary: normalizeNullableString(row[3]),
    sdrf: normalizeNullableString(row[4]),
    fileSummary: normalizeNullableString(row[5]),
    instrumentSummary: normalizeNullableString(row[6]),
    publicationSummary: normalizeNullableString(row[7]),
    labHead: normalizeNullableString(row[8]),
    announceDate: normalizeNullableString(row[9]),
    keywordSummary: normalizeNullableString(row[10])
  };
}

async function fetchPxDatasetDetail(
  accession: string,
  signal: AbortSignal
): Promise<PxDetailResponse> {
  return fetchJson<PxDetailResponse>(
    `${PX_BASE_URL}/datasets/${encodeURIComponent(accession)}`,
    signal
  );
}

async function upsertDataset(
  prisma: ReturnType<typeof createPrismaClient>,
  compact: PxCompactDataset,
  detail: PxDetailResponse
) {
  const sourceKey = compact.accession;
  const title = normalizeNullableString(detail.title) ?? compact.title ?? sourceKey;
  const description =
    normalizeNullableString(detail.description) ?? compact.publicationSummary;
  const doi = extractDoi(detail);
  const homepageUrl = extractHomepageUrl(detail, sourceKey);
  const publishedAt = parseDateOnly(compact.announceDate);
  const publisher =
    compact.repository ?? extractContactAffiliation(detail.contacts) ?? 'ProteomeXchange';
  const speciesNames = extractSpeciesNames(detail);
  const instruments = extractInstrumentNames(detail, compact.instrumentSummary);
  const keywords = extractKeywords(detail, compact.keywordSummary);

  const rawPayload = toInputJsonValue({
    compact,
    detail,
    normalized: {
      species: speciesNames,
      instruments,
      keywords
    }
  });

  return prisma.dataset.upsert({
    where: {
      sourceDb_sourceKey: {
        sourceDb: PX_SOURCE_DB,
        sourceKey
      }
    },
    create: {
      sourceDb: PX_SOURCE_DB,
      sourceKey,
      category: PX_CATEGORY,
      title,
      description,
      homepageUrl,
      doi,
      publisher,
      publishedAt,
      raw: rawPayload,
      bboxMinLon: null,
      bboxMinLat: null,
      bboxMaxLon: null,
      bboxMaxLat: null
    },
    update: {
      category: PX_CATEGORY,
      title,
      description,
      homepageUrl,
      doi,
      publisher,
      publishedAt,
      raw: rawPayload,
      bboxMinLon: null,
      bboxMinLat: null,
      bboxMaxLon: null,
      bboxMaxLat: null
    }
  });
}

async function linkDatasetTaxa(
  prisma: ReturnType<typeof createPrismaClient>,
  datasetId: string,
  speciesNames: string[]
): Promise<number> {
  await prisma.datasetTaxon.deleteMany({
    where: { datasetId }
  });

  if (speciesNames.length === 0) return 0;

  const queryNames = Array.from(
    new Set(
      speciesNames
        .map(normalizeTaxonName)
        .filter((name) => name.length > 0 && name.toUpperCase() !== 'BLANK')
    )
  );

  if (queryNames.length === 0) return 0;

  const matchedTaxa = await prisma.taxon.findMany({
    where: {
      nameNorm: {
        in: queryNames
      }
    },
    select: {
      gbifTaxonId: true
    }
  });

  if (matchedTaxa.length === 0) return 0;

  const created = await prisma.datasetTaxon.createMany({
    data: matchedTaxa.map((taxon) => ({
      datasetId,
      gbifTaxonId: taxon.gbifTaxonId
    })),
    skipDuplicates: true
  });

  return created.count;
}

function extractSpeciesNames(detail: PxDetailResponse): string[] {
  const values: string[] = [];

  for (const group of detail.species ?? []) {
    for (const term of group.terms ?? []) {
      const name = (term.name ?? '').toLowerCase();
      if (
        term.accession !== 'MS:1001469' &&
        !name.includes('scientific name')
      ) {
        continue;
      }

      const termValue = getTermValue(term);
      if (!termValue) continue;

      const cleaned = cleanupSpeciesName(termValue);
      if (cleaned) values.push(cleaned);
    }
  }

  return Array.from(new Set(values));
}

function cleanupSpeciesName(value: string): string | null {
  const cleaned = value.replace(/\s+\([^)]*\)\s*$/, '').trim();
  if (!cleaned) return null;
  return cleaned;
}

function extractHomepageUrl(detail: PxDetailResponse, sourceKey: string): string {
  const urls = [
    ...extractTermUrls(detail.fullDatasetLinks),
    ...extractTermUrls(detail.identifiers)
  ];
  const firstUrl = urls[0];
  if (firstUrl) return firstUrl;

  return `https://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=${encodeURIComponent(
    sourceKey
  )}`;
}

function extractTermUrls(terms: PxTerm[] | undefined): string[] {
  const urls: string[] = [];

  for (const term of terms ?? []) {
    const value = getTermValue(term);
    if (!value) continue;
    if (/^https?:\/\//i.test(value)) {
      urls.push(value);
    }
  }

  return urls;
}

function extractDoi(detail: PxDetailResponse): string | null {
  const candidateTerms = [
    ...(detail.identifiers ?? []),
    ...flattenTermGroups(detail.publications)
  ];

  for (const term of candidateTerms) {
    const value = getTermValue(term);
    if (!value) continue;

    const name = (term.name ?? '').toLowerCase();
    if (
      term.accession === 'MS:1001922' ||
      name.includes('digital object identifier') ||
      /^10\.\S+/.test(value)
    ) {
      return value;
    }
  }

  return null;
}

function extractContactAffiliation(contacts: PxTermGroup[] | undefined): string | null {
  for (const term of flattenTermGroups(contacts)) {
    if (term.accession !== 'MS:1000590') continue;
    const value = getTermValue(term);
    if (value) return value;
  }

  return null;
}

function extractInstrumentNames(
  detail: PxDetailResponse,
  compactSummary: string | null
): string[] {
  const values = detail.instruments
    ?.map((term) => normalizeNullableString(term.name ?? getTermValue(term)))
    .filter((value): value is string => value !== null) ?? [];

  if (values.length > 0) return Array.from(new Set(values));
  if (!compactSummary) return [];
  return [compactSummary];
}

function extractKeywords(
  detail: PxDetailResponse,
  compactSummary: string | null
): string[] {
  const values = new Set<string>();

  for (const term of detail.keywords ?? []) {
    const value = getTermValue(term);
    if (!value) continue;

    for (const token of splitCommaSeparated(value)) {
      values.add(token);
    }
  }

  if (values.size === 0 && compactSummary) {
    for (const token of splitCommaSeparated(compactSummary)) {
      values.add(token);
    }
  }

  return Array.from(values);
}

function splitCommaSeparated(input: string): string[] {
  return input
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function flattenTermGroups(groups: PxTermGroup[] | undefined): PxTerm[] {
  const result: PxTerm[] = [];
  for (const group of groups ?? []) {
    for (const term of group.terms ?? []) {
      result.push(term);
    }
  }
  return result;
}

function getTermValue(term: PxTerm): string | null {
  return normalizeNullableString(term.value ?? term.value_accession);
}

function normalizeNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

function parseDateOnly(value: string | null): Date | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;

  const parsed = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function normalizeTaxonName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bcomplex\b/g, '')
    .replace(/\bmorphological group\b/g, '')
    .replace(/\bsp\.\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function isIgnorablePxError(error: unknown): error is PxApiError {
  if (!(error instanceof PxApiError)) return false;
  return (
    error.errorCode === 'DatasetNotYetReleased' ||
    error.errorCode === 'NoSuchIdentifier'
  );
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  return fetchJsonWithInit<T>(url, signal, undefined);
}

async function fetchJsonWithInit<T>(
  url: string,
  signal: AbortSignal,
  init: RequestInit | undefined
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    signal,
    headers: {
      accept: 'application/json',
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    let payload: PxStatusErrorPayload | null = null;
    try {
      payload = (await response.json()) as PxStatusErrorPayload;
    } catch {
      payload = null;
    }

    const message =
      payload?.description ??
      `Request failed with status ${response.status} ${response.statusText}`;
    throw new PxApiError(
      message,
      response.status,
      payload?.error_code ?? null,
      payload
    );
  }

  return (await response.json()) as T;
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  if (items.length === 0) return;

  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  let index = 0;

  const runners = Array.from({ length: workerCount }, async () => {
    while (true) {
      const currentIndex = index;
      index += 1;
      if (currentIndex >= items.length) break;
      await worker(items[currentIndex] as T);
    }
  });

  await Promise.all(runners);
}
