import { createPrismaClient } from '@vbdhub/db';
import type { DatasetCategory, Prisma } from '@prisma/client';
import ky, { HTTPError } from 'ky';
import { z } from 'zod';
import {
  buildGlobalNamesRequestBody,
  linkDatasetTaxa,
  resolveGbifTaxaFromNames as resolveGbifTaxaFromNamesShared,
  type ResolvedGbifTaxon
} from './shared/taxonomy.js';
import {
  globalNamesVerificationResponseSchema,
  nullableStringSchema
} from './shared/schemas.js';
import {
  normalizeNullableString,
  parseDateOnly
} from './shared/normalization.js';
import type { JobDefinition } from '../types.js';

const PX_BASE_URL = 'https://proteomecentral.proteomexchange.org/api/proxi/v0.1';
const PX_SOURCE_DB = 'proteomexchange';
const PX_CATEGORY: DatasetCategory = 'proteomics';
const PX_DEFAULT_PAGE_SIZE = 500;
const PX_DEFAULT_DETAIL_CONCURRENCY = 2;
const GLOBALNAMES_RETRY_ATTEMPTS = 4;
const GLOBALNAMES_BATCH_SIZE = 1000;
const RETRYABLE_HTTP_STATUSES = new Set([429, 500, 502, 503, 504]);

const pxCompactDatasetRowSchema = z.array(z.unknown()).min(1);

const pxCompactResponseSchema = z.looseObject({
  datasets: z.array(pxCompactDatasetRowSchema).default([]),
  result_set: z
    .object({
      n_available_pages: z.coerce.number().int().positive().optional(),
      n_available_rows: z.coerce.number().int().positive().optional(),
      n_rows_returned: z.coerce.number().int().nonnegative().optional(),
      page_number: z.coerce.number().int().positive().optional(),
      page_size: z.coerce.number().int().positive().optional()
    })
    .optional(),
  status: z
    .object({
      description: z.string().optional(),
      error_code: z.string().nullable().optional(),
      status: z.string().optional(),
      status_code: z.coerce.number().int().optional()
    })
    .optional()
});

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

const pxTermSchema = z.object({
  accession: nullableStringSchema,
  cv_param_group: nullableStringSchema,
  name: nullableStringSchema,
  value: nullableStringSchema,
  value_accession: nullableStringSchema
});

const pxTermGroupSchema = z.object({
  terms: z.array(pxTermSchema).default([])
});

const pxDetailResponseSchema = z.object({
  contacts: z.array(pxTermGroupSchema).default([]),
  datasetFiles: z.array(pxTermSchema).default([]),
  description: nullableStringSchema,
  fullDatasetLinks: z.array(pxTermSchema).default([]),
  identifiers: z.array(pxTermSchema).default([]),
  instruments: z.array(pxTermSchema).default([]),
  keywords: z.array(pxTermSchema).default([]),
  modifications: z.array(pxTermSchema).default([]),
  publications: z.array(pxTermGroupSchema).default([]),
  species: z.array(pxTermGroupSchema).default([]),
  title: nullableStringSchema
});

const pxStatusErrorPayloadSchema = z.looseObject({
  description: z.string().optional(),
  error_code: z.string().optional(),
  status: z.string().optional(),
  status_code: z.coerce.number().int().optional(),
  repository: z.string().optional()
});

type PxCompactDatasetRow = z.infer<typeof pxCompactDatasetRowSchema>;
type PxCompactResponse = z.infer<typeof pxCompactResponseSchema>;
type PxTerm = z.infer<typeof pxTermSchema>;
type PxTermGroup = z.infer<typeof pxTermGroupSchema>;
type PxDetailResponse = z.infer<typeof pxDetailResponseSchema>;
type PxStatusErrorPayload = z.infer<typeof pxStatusErrorPayloadSchema>;

interface PxSyncOptions {
  pageSize: number;
  startPage: number;
  maxPages: number | null;
  datasetLimit: number | null;
  detailConcurrency: number;
}

export const pxSyncJob: JobDefinition = {
  name: 'px',
  description: 'Synchronise ProteomeXchange records',
  async run({ logger, signal }) {
    if (signal.aborted) throw new Error('Job aborted before start');

    const prisma = createPrismaClient();
    const taxonomyResolutionCache = new Map<string, ResolvedGbifTaxon | null>();
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
              if (isHumanOnlyDataset(speciesNames)) {
                counters.skipped += 1;
                logger.debug(
                  {
                    sourceKey: compactDataset.accession,
                    speciesNames
                  },
                  'Skipping human-only ProteomeXchange dataset'
                );
                return;
              }
              const dataset = await upsertDataset(prisma, compactDataset, detail);
              const taxaLinked = await linkDatasetTaxa(
                prisma,
                dataset.id,
                speciesNames,
                signal,
                taxonomyResolutionCache,
                resolveGbifTaxaFromNames
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

  return ky(
    `${PX_BASE_URL}/datasets?${params.toString()}`,
    { signal }
  ).json(pxCompactResponseSchema);
}

function extractCompactDatasets(
  rows: PxCompactDatasetRow[]
): PxCompactDataset[] {
  return rows.flatMap((row) => {
    const dataset = parseCompactDatasetRow(row);
    return dataset ? [dataset] : [];
  });
}

function parseCompactDatasetRow(row: unknown): PxCompactDataset | null {
  const parsed = pxCompactDatasetRowSchema.safeParse(row);
  if (!parsed.success) return null;

  const values = parsed.data;
  const accession = normalizeNullableString(values[0]);
  if (!accession) return null;

  return {
    accession,
    title: normalizeNullableString(values[1]),
    repository: normalizeNullableString(values[2]),
    speciesSummary: normalizeNullableString(values[3]),
    sdrf: normalizeNullableString(values[4]),
    fileSummary: normalizeNullableString(values[5]),
    instrumentSummary: normalizeNullableString(values[6]),
    publicationSummary: normalizeNullableString(values[7]),
    labHead: normalizeNullableString(values[8]),
    announceDate: normalizeNullableString(values[9]),
    keywordSummary: normalizeNullableString(values[10])
  };
}

async function fetchPxDatasetDetail(
  accession: string,
  signal: AbortSignal
): Promise<PxDetailResponse> {
  try {
    return await ky(
      `${PX_BASE_URL}/datasets/${encodeURIComponent(accession)}`,
      { signal }
    ).json(pxDetailResponseSchema);
  } catch (error) {
    if (!(error instanceof HTTPError)) throw error;

    let payload: PxStatusErrorPayload | null = null;
    try {
      const parsed = pxStatusErrorPayloadSchema.safeParse(
        await error.response.json()
      );
      payload = parsed.success ? parsed.data : null;
    } catch {
      payload = null;
    }

    throw Object.assign(
      new Error(
        payload?.description ??
          `Request failed with status ${error.response.status} ${error.response.statusText}`
      ),
      {
        name: 'PxHttpError',
        status: error.response.status,
        errorCode: payload?.error_code ?? null
      }
    );
  }
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

  const rawPayload: Prisma.InputJsonObject = {
    compact: toRawCompact(compact),
    detail: toRawDetail(detail),
    normalized: {
      species: speciesNames,
      instruments,
      keywords
    }
  };
  const datasetData = {
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
  };

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
      ...datasetData
    },
    update: datasetData
  });
}

async function resolveGbifTaxaFromNames(
  names: string[],
  signal: AbortSignal
): Promise<Map<string, ResolvedGbifTaxon | null>> {
  return resolveGbifTaxaFromNamesShared(
    names,
    signal,
    (batchNames, batchSignal) =>
      ky
        .post('https://verifier.globalnames.org/api/v1/verifications', {
          signal: batchSignal,
          json: buildGlobalNamesRequestBody(batchNames),
          retry: {
            limit: GLOBALNAMES_RETRY_ATTEMPTS - 1,
            methods: ['post'],
            statusCodes: [...RETRYABLE_HTTP_STATUSES]
          }
        })
        .json(globalNamesVerificationResponseSchema),
    {
      batchSize: GLOBALNAMES_BATCH_SIZE
    }
  );
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

function isHumanOnlyDataset(speciesNames: string[]): boolean {
  if (speciesNames.length !== 1) return false;

  const firstSpecies = speciesNames[0];
  if (!firstSpecies) return false;

  const normalized = cleanupSpeciesName(firstSpecies)?.toLowerCase();
  if (!normalized) return false;

  return normalized === 'homo sapiens';
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

function toRawCompact(compact: PxCompactDataset): Prisma.InputJsonObject {
  return {
    accession: compact.accession,
    title: compact.title,
    repository: compact.repository,
    speciesSummary: compact.speciesSummary,
    sdrf: compact.sdrf,
    fileSummary: compact.fileSummary,
    instrumentSummary: compact.instrumentSummary,
    publicationSummary: compact.publicationSummary,
    labHead: compact.labHead,
    announceDate: compact.announceDate,
    keywordSummary: compact.keywordSummary
  };
}

function toRawDetail(detail: PxDetailResponse): Prisma.InputJsonObject {
  return {
    contacts: detail.contacts.map(toRawTermGroup),
    datasetFiles: detail.datasetFiles.map(toRawTerm),
    description: detail.description,
    fullDatasetLinks: detail.fullDatasetLinks.map(toRawTerm),
    identifiers: detail.identifiers.map(toRawTerm),
    instruments: detail.instruments.map(toRawTerm),
    keywords: detail.keywords.map(toRawTerm),
    modifications: detail.modifications.map(toRawTerm),
    publications: detail.publications.map(toRawTermGroup),
    species: detail.species.map(toRawTermGroup),
    title: detail.title
  };
}

function toRawTermGroup(group: PxTermGroup): Prisma.InputJsonObject {
  return {
    terms: group.terms.map(toRawTerm)
  };
}

function toRawTerm(term: PxTerm): Prisma.InputJsonObject {
  return {
    accession: term.accession,
    cv_param_group: term.cv_param_group,
    name: term.name,
    value: term.value,
    value_accession: term.value_accession
  };
}

function flattenTermGroups(groups: PxTermGroup[] | undefined): PxTerm[] {
  return (groups ?? []).flatMap((group) => group.terms ?? []);
}

function getTermValue(term: PxTerm): string | null {
  return normalizeNullableString(term.value ?? term.value_accession);
}

function getErrorCode(error: unknown): string | null {
  if (!(error instanceof Error)) return null;
  const { errorCode } = error as { errorCode?: unknown };
  return typeof errorCode === 'string' ? errorCode : null;
}

function isIgnorablePxError(error: unknown): boolean {
  const errorCode = getErrorCode(error);
  return (
    errorCode === 'DatasetNotYetReleased' ||
    errorCode === 'NoSuchIdentifier'
  );
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
      const item = items[currentIndex];
      if (item === undefined) break;
      await worker(item);
    }
  });

  await Promise.all(runners);
}
