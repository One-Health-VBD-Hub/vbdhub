import { createPrismaClient } from '@vbdhub/db';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import {
  buildGlobalNamesRequestBody,
  linkDatasetTaxa as linkDatasetTaxaShared,
  resolveGbifTaxaFromNames as resolveGbifTaxaFromNamesShared,
  type ResolvedGbifTaxon
} from './shared/taxonomy.js';
import {
  globalNamesVerificationResponseSchema,
  nullableStringSchema
} from './shared/schemas.js';
import { fetchJson as fetchJsonShared, fetchJsonWithInit as fetchJsonWithInitShared } from './shared/http.js';
import {
  getBoundingBox as getBoundingBoxShared,
  upsertSpatialGeometry as upsertSpatialGeometryShared,
  type BoundingBox,
  type Coordinate
} from './shared/spatial.js';
import {
  normalizeNullableString as normalizeNullableStringShared,
  parseDateOnly as parseDateOnlyShared
} from './shared/values.js';
import type { JobDefinition } from '../types.js';

const VECTRAITS_BASE_URL = 'https://vectorbyte.crc.nd.edu/portal/api';
const VECTRAITS_SOURCE_DB = 'vectraits';
const VECTRAITS_CATEGORY = 'traits';

const vecTraitsIdsResponseSchema = z.looseObject({
  ids: z.array(z.coerce.number().int()).default([])
});

const vecTraitsDatasetRowSchema = z.looseObject({
  Id: z.union([z.coerce.number().int(), z.string()]).optional(),
  DatasetID: z.coerce.number().int().optional(),
  OriginalTraitName: nullableStringSchema.optional(),
  StandardisedTraitName: nullableStringSchema.optional(),
  OriginalTraitDef: nullableStringSchema.optional(),
  StandardisedTraitDef: nullableStringSchema.optional(),
  Habitat: nullableStringSchema.optional(),
  LabField: nullableStringSchema.optional(),
  Location: nullableStringSchema.optional(),
  LocationDate: nullableStringSchema.optional(),
  DOI: nullableStringSchema.optional(),
  Citation: nullableStringSchema.optional(),
  CuratedByCitation: nullableStringSchema.optional(),
  CuratedByDOI: nullableStringSchema.optional(),
  SubmittedBy: nullableStringSchema.optional(),
  ContributorEmail: nullableStringSchema.optional(),
  Interactor1: nullableStringSchema.optional(),
  Interactor2: nullableStringSchema.optional(),
  Latitude: z.union([z.number(), z.string(), z.null()]).optional(),
  Longitude: z.union([z.number(), z.string(), z.null()]).optional()
});

const vecTraitsDatasetResponseSchema = z.looseObject({
  count: z.coerce.number().int().optional(),
  total: z.coerce.number().int().optional(),
  page: z.coerce.number().int().optional(),
  page_size: z.coerce.number().int().optional(),
  per_page: z.coerce.number().int().optional(),
  total_pages: z.coerce.number().int().optional(),
  num_pages: z.coerce.number().int().optional(),
  has_next: z.boolean().optional(),
  next_page: z.coerce.number().int().nullable().optional(),
  next: nullableStringSchema.optional(),
  previous: nullableStringSchema.optional(),
  results: z.array(vecTraitsDatasetRowSchema).default([])
});

type VecTraitsDatasetRow = z.infer<typeof vecTraitsDatasetRowSchema>;
type VecTraitsDatasetResponse = z.infer<typeof vecTraitsDatasetResponseSchema>;

export const vtSyncJob: JobDefinition = {
  name: 'vt',
  description: 'Synchronise VecTraits records',
  async run({ logger, signal }) {
    if (signal.aborted) throw new Error('Job aborted before start');

    const prisma = createPrismaClient();
    const taxonomyResolutionCache = new Map<string, ResolvedGbifTaxon | null>();

    try {
      logger.info('Fetching VecTraits dataset IDs');
      const ids = await fetchVecTraitsDatasetIds(signal);
      logger.info({ count: ids.length }, 'VecTraits IDs fetched');

      for (const id of ids) {
        if (signal.aborted) throw new Error('Job aborted');

        try {
          const { rows, pagesFetched } = await fetchVecTraitsDatasetRows(
            id,
            signal
          );
          const coordinates = parseCoordinates(rows);
          const bbox = getBoundingBox(coordinates);
          const speciesNames = extractSpeciesNames(rows);

          const citation = getFirstNonEmpty(rows, (row) => row.Citation);
          const title = buildDatasetTitle(citation, id);
          const description = buildDescription(rows);
          const publisher =
            getFirstNonEmpty(rows, (row) => row.SubmittedBy) ??
            'VectorByte VecTraits';
          const doi = getFirstNonEmpty(rows, (row) => row.DOI);
          const publishedAt = parsePublishedAt(citation, rows);
          const homepageUrl = `https://vectorbyte.crc.nd.edu/vectraits-dataset/${id}`;
          const sourceKey = String(id);
          const temporalCoverage = parseLocationDateCoverage(rows);

          const rawPayload = buildRawPayload(rows, temporalCoverage);

          const dataset = await prisma.dataset.upsert({
            where: {
              sourceDb_sourceKey: {
                sourceDb: VECTRAITS_SOURCE_DB,
                sourceKey
              }
            },
            create: {
              sourceDb: VECTRAITS_SOURCE_DB,
              sourceKey,
              category: VECTRAITS_CATEGORY,
              title,
              description,
              homepageUrl,
              publisher,
              doi,
              publishedAt,
              raw: rawPayload,
              bboxMinLon: bbox?.minLon ?? null,
              bboxMinLat: bbox?.minLat ?? null,
              bboxMaxLon: bbox?.maxLon ?? null,
              bboxMaxLat: bbox?.maxLat ?? null
            },
            update: {
              category: VECTRAITS_CATEGORY,
              title,
              description,
              homepageUrl,
              publisher,
              doi,
              publishedAt,
              raw: rawPayload,
              bboxMinLon: bbox?.minLon ?? null,
              bboxMinLat: bbox?.minLat ?? null,
              bboxMaxLon: bbox?.maxLon ?? null,
              bboxMaxLat: bbox?.maxLat ?? null
            }
          });

          await upsertSpatialGeometry(prisma, dataset.id, coordinates);
          const linkedTaxa = await linkDatasetTaxa(
            prisma,
            dataset.id,
            speciesNames,
            signal,
            taxonomyResolutionCache
          );

          logger.info(
            {
              datasetId: dataset.id,
              sourceKey,
              pagesFetched,
              rows: rows.length,
              points: coordinates.length,
              taxaLinked: linkedTaxa,
              temporalStart: temporalCoverage.startDate?.toISOString() ?? null,
              temporalEnd: temporalCoverage.endDate?.toISOString() ?? null
            },
            'VecTraits dataset synchronised'
          );
        } catch (error) {
          logger.error(
            { err: error, sourceKey: id },
            'Failed to sync VecTraits dataset'
          );
        }
      }
    } finally {
      await prisma.$disconnect();
    }
  }
};

async function fetchVecTraitsDatasetIds(signal: AbortSignal): Promise<number[]> {
  const url =
    `${VECTRAITS_BASE_URL}/vectraits-explorer/?` +
    new URLSearchParams({
      page: '1',
      keywords: '',
      sort_column: 'DatasetID',
      sort_dir: 'asc'
    }).toString();
  const res = await fetchJson(url, signal, vecTraitsIdsResponseSchema);
  return res.ids ?? [];
}

async function fetchVecTraitsDatasetRows(
  datasetId: number,
  signal: AbortSignal
): Promise<{ rows: VecTraitsDatasetRow[]; pagesFetched: number }> {
  let page = 1;
  let pagesFetched = 0;

  const maxPages = 10_000;
  const uniqueRows = new Map<string, VecTraitsDatasetRow>();
  const rowsWithoutId: VecTraitsDatasetRow[] = [];
  const seenPageFingerprints = new Set<string>();

  while (true) {
    if (signal.aborted) throw new Error('Job aborted');
    pagesFetched += 1;
    if (pagesFetched > maxPages) {
      throw new Error(
        `Exceeded maximum VecTraits page limit (${maxPages}) for dataset ${datasetId}`
      );
    }

    const url = `${VECTRAITS_BASE_URL}/vectraits-dataset/${datasetId}/?${new URLSearchParams(
      { page: String(page) }
    ).toString()}`;
    const payload = await fetchJson(url, signal, vecTraitsDatasetResponseSchema);
    const pageRows = payload.results ?? [];

    const pageFingerprint = buildPageFingerprint(pageRows);
    if (seenPageFingerprints.has(pageFingerprint)) {
      break;
    }
    seenPageFingerprints.add(pageFingerprint);

    for (const row of pageRows) {
      const idValue = row.Id;
      const rowId =
        typeof idValue === 'number'
          ? String(idValue)
          : normalizeNullableString(idValue);
      if (rowId) {
        if (!uniqueRows.has(rowId)) uniqueRows.set(rowId, row);
      } else {
        rowsWithoutId.push(row);
      }
    }

    const nextPage = getNextPageNumber(payload, page);
    if (nextPage !== null) {
      page = nextPage;
      continue;
    }

    if (pageRows.length === 0) break;

    page += 1;
  }

  return {
    rows: [...uniqueRows.values(), ...rowsWithoutId],
    pagesFetched
  };
}

function buildPageFingerprint(rows: VecTraitsDatasetRow[]): string {
  if (rows.length === 0) return '0:empty';

  const first = rows[0];
  const last = rows[rows.length - 1];
  return `${rows.length}:${String(first?.Id ?? '')}:${String(last?.Id ?? '')}`;
}

function getNextPageNumber(
  payload: VecTraitsDatasetResponse,
  currentPage: number
): number | null {
  if (typeof payload.next_page === 'number') {
    if (Number.isInteger(payload.next_page) && payload.next_page > currentPage) {
      return payload.next_page;
    }
    return null;
  }

  if (payload.has_next === true) return currentPage + 1;
  if (payload.has_next === false) return null;

  const nextFromUrl = extractPageNumberFromNextUrl(payload.next);
  if (nextFromUrl !== null && nextFromUrl > currentPage) return nextFromUrl;

  const totalPages = firstFiniteInt(payload.total_pages, payload.num_pages);
  if (totalPages !== null) {
    return currentPage < totalPages ? currentPage + 1 : null;
  }

  const total = firstFiniteInt(payload.count, payload.total);
  const perPage = firstFiniteInt(payload.page_size, payload.per_page);
  if (total !== null && perPage !== null && perPage > 0) {
    const computedTotalPages = Math.ceil(total / perPage);
    return currentPage < computedTotalPages ? currentPage + 1 : null;
  }

  return null;
}

function extractPageNumberFromNextUrl(nextUrl: string | null | undefined): number | null {
  if (!nextUrl) return null;

  try {
    const url = new URL(nextUrl, VECTRAITS_BASE_URL);
    const page = Number(url.searchParams.get('page'));
    return Number.isInteger(page) && page > 0 ? page : null;
  } catch {
    return null;
  }
}

function firstFiniteInt(...values: Array<number | undefined>): number | null {
  for (const value of values) {
    if (typeof value !== 'number') continue;
    if (Number.isInteger(value)) return value;
  }
  return null;
}

async function fetchJson<T>(
  url: string,
  signal: AbortSignal,
  schema: z.ZodType<T>
): Promise<T> {
  return fetchJsonShared<T>(url, signal, schema);
}

async function fetchJsonWithInit<T>(
  url: string,
  signal: AbortSignal,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<T> {
  return fetchJsonWithInitShared<T>(url, signal, schema, init);
}

function getFirstNonEmpty(
  rows: VecTraitsDatasetRow[],
  getter: (row: VecTraitsDatasetRow) => unknown
): string | null {
  for (const row of rows) {
    const value = normalizeNullableString(getter(row));
    if (value) return value;
  }
  return null;
}

function buildDatasetTitle(citation: string | null, id: number): string {
  if (!citation) return `VecTraits dataset ${id}`;

  const extracted = extractTitleFromCitation(citation);
  if (extracted) return extracted;

  if (citation.length <= 255) return citation;
  return `${citation.slice(0, 252)}...`;
}

function extractTitleFromCitation(citation: string): string {
  const cleaned = citation
    .replace(/\(\s*table\s+[^)]*\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return '';

  const segments = cleaned
    .split(/\.\s+/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
  if (segments.length <= 1) return '';

  let start = 1;
  while (start < segments.length && isYearLikeSegment(segments[start]!)) {
    start += 1;
  }
  if (start >= segments.length) return '';

  const remaining = segments.slice(start);
  const titleParts: string[] = [];

  for (let i = 0; i < remaining.length; i += 1) {
    const segment = remaining[i]!.trim();
    if (!segment) continue;
    if (isLikelyJournalSegment(segment)) break;

    if (/^\d+$/.test(segment)) {
      const next = remaining[i + 1]?.trim();
      if (next && !isLikelyJournalSegment(next)) {
        titleParts.push(`${segment}. ${next}`);
        i += 1;
        continue;
      }
      break;
    }

    titleParts.push(segment);
  }

  return titleParts.join('. ').trim();
}

function isYearLikeSegment(segment: string): boolean {
  return /^(?:\(?\s*)?(?:18|19|20)\d{2}(?:\s*\)?)$/.test(segment.trim());
}

function isLikelyJournalSegment(segment: string): boolean {
  const normalized = segment.trim();
  if (!normalized) return false;

  if (/\bJournal\b/i.test(normalized)) return true;
  if (/^(?:J|Jrnl)\.?(\s|$)/i.test(normalized)) return true;
  if (/^(?:PLoS|Nature|Science|Proceedings|Proc\.)\b/i.test(normalized)) {
    return true;
  }
  if (/^[A-Z][A-Za-z.\-]*(?:\s+[A-Z][A-Za-z.\-]*){0,4}\s+\d/.test(normalized)) {
    return true;
  }

  return false;
}

function buildDescription(rows: VecTraitsDatasetRow[]): string | null {
  if (rows.length === 0) return null;

  const traits = collectUniqueValues(rows, (row) => row.OriginalTraitName);
  const habitats = collectUniqueValues(rows, (row) => row.Habitat);
  const environments = collectUniqueValues(rows, (row) => row.LabField);
  const locations = collectUniqueValues(rows, (row) => row.Location);

  const parts: string[] = [];
  if (traits.length > 0) parts.push(`Traits: ${traits.slice(0, 6).join(', ')}`);
  if (habitats.length > 0)
    parts.push(`Habitats: ${habitats.slice(0, 4).join(', ')}`);
  if (environments.length > 0)
    parts.push(`Environment: ${environments.slice(0, 3).join(', ')}`);
  if (locations.length > 0)
    parts.push(`Locations: ${locations.slice(0, 3).join(', ')}`);

  return parts.length > 0 ? parts.join(' | ') : null;
}

function buildRawPayload(
  rows: VecTraitsDatasetRow[],
  temporalCoverage: {
    startDate: Date | null;
    endDate: Date | null;
    dateCount: number;
  }
): Prisma.InputJsonValue {
  const traits = collectUniqueValues(rows, (row) => row.OriginalTraitName);
  const standardizedTraits = collectUniqueValues(
    rows,
    (row) => row.StandardisedTraitName
  );
  const habitats = collectUniqueValues(rows, (row) => row.Habitat);
  const labFieldValues = collectUniqueValues(rows, (row) => row.LabField);
  const locations = collectUniqueValues(rows, (row) => row.Location);
  const citation = getFirstNonEmpty(rows, (row) => row.Citation);
  const curatedByCitation = getFirstNonEmpty(rows, (row) => row.CuratedByCitation);
  const curatedByDoi = getFirstNonEmpty(rows, (row) => row.CuratedByDOI);
  const contributorEmail = getFirstNonEmpty(rows, (row) => row.ContributorEmail);
  const doi = getFirstNonEmpty(rows, (row) => row.DOI);

  const fieldNames = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row)))
  ).sort();

  return {
    rowCount: rows.length,
    availableFields: fieldNames,
    traits,
    standardisedTraits: standardizedTraits,
    habitats,
    labFieldValues,
    locationSample: locations.slice(0, 50),
    citation,
    curatedByCitation,
    curatedByDoi,
    contributorEmail,
    doi,
    temporalCoverage: {
      startDate: temporalCoverage.startDate
        ? temporalCoverage.startDate.toISOString().slice(0, 10)
        : null,
      endDate: temporalCoverage.endDate
        ? temporalCoverage.endDate.toISOString().slice(0, 10)
        : null,
      dateCount: temporalCoverage.dateCount
    }
  } satisfies Prisma.InputJsonObject;
}

function collectUniqueValues(
  rows: VecTraitsDatasetRow[],
  getter: (row: VecTraitsDatasetRow) => unknown
): string[] {
  return Array.from(
    new Set(
      rows
        .map((row) => normalizeNullableString(getter(row)))
        .filter((value): value is string => Boolean(value))
    )
  );
}

function parsePublishedAt(
  citation: string | null,
  rows: VecTraitsDatasetRow[]
): Date | null {
  const citationDate = parseCitationYear(citation);
  if (citationDate) return citationDate;

  const locationCoverage = parseLocationDateCoverage(rows);
  return locationCoverage.startDate;
}

function parseCitationYear(citation: string | null): Date | null {
  if (!citation) return null;

  const matches = citation.match(/\b(18|19|20)\d{2}\b/g);
  if (!matches || matches.length === 0) return null;

  for (const yearText of matches) {
    const year = Number(yearText);
    if (year >= 1800 && year <= 2100) {
      return new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    }
  }

  return null;
}

function parseLocationDateCoverage(rows: VecTraitsDatasetRow[]): {
  startDate: Date | null;
  endDate: Date | null;
  dateCount: number;
} {
  const uniqueDates = new Set<string>();
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  for (const row of rows) {
    const raw = normalizeNullableString(row.LocationDate);
    if (!raw) continue;
    uniqueDates.add(raw);

    const date = parseDateOnly(raw);
    if (!date) continue;
    if (!startDate || date < startDate) startDate = date;
    if (!endDate || date > endDate) endDate = date;
  }

  return { startDate, endDate, dateCount: uniqueDates.size };
}

function parseDateOnly(value: string | undefined): Date | null {
  return parseDateOnlyShared(value);
}

function parseCoordinates(rows: VecTraitsDatasetRow[]): Coordinate[] {
  const coordinates: Coordinate[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const lat = parseNumber(row.Latitude);
    const lon = parseNumber(row.Longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const key = `${lat},${lon}`;
    if (seen.has(key)) continue;
    seen.add(key);

    coordinates.push({ lat, lon });
  }

  return coordinates;
}

function parseNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) return Number.NaN;
    return Number(trimmed);
  }
  return Number.NaN;
}

function getBoundingBox(coords: Coordinate[]): BoundingBox | null {
  return getBoundingBoxShared(coords);
}

function normalizeNullableString(value: unknown): string | null {
  return normalizeNullableStringShared(value);
}

function extractSpeciesNames(rows: VecTraitsDatasetRow[]): string[] {
  const names = new Set<string>();

  for (const row of rows) {
    const candidates = [row.Interactor1, row.Interactor2];
    for (const candidate of candidates) {
      const normalized = normalizeSpeciesName(candidate);
      if (!normalized) continue;
      names.add(normalized);
    }
  }

  return Array.from(names);
}

function normalizeSpeciesName(value: unknown): string | null {
  const normalized = normalizeNullableString(value);
  if (!normalized) return null;

  const upper = normalized.toUpperCase();
  if (
    upper === 'NONE NONE' ||
    upper === 'NONE' ||
    upper === 'BLANK' ||
    upper === 'NA'
  ) {
    return null;
  }

  return normalized;
}

async function linkDatasetTaxa(
  prisma: ReturnType<typeof createPrismaClient>,
  datasetId: string,
  speciesNames: string[],
  signal: AbortSignal,
  taxonomyResolutionCache: Map<string, ResolvedGbifTaxon | null>
): Promise<number> {
  return linkDatasetTaxaShared(
    prisma,
    datasetId,
    speciesNames,
    signal,
    taxonomyResolutionCache,
    resolveGbifTaxaFromNames
  );
}

async function resolveGbifTaxaFromNames(
  names: string[],
  signal: AbortSignal
): Promise<Map<string, ResolvedGbifTaxon | null>> {
  return resolveGbifTaxaFromNamesShared(
    names,
    signal,
    (batchNames, batchSignal) =>
      fetchJsonWithInit(
        'https://verifier.globalnames.org/api/v1/verifications',
        batchSignal,
        globalNamesVerificationResponseSchema,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify(buildGlobalNamesRequestBody(batchNames))
        }
      )
  );
}

async function upsertSpatialGeometry(
  prisma: ReturnType<typeof createPrismaClient>,
  datasetId: string,
  coordinates: Coordinate[]
): Promise<void> {
  return upsertSpatialGeometryShared(prisma, datasetId, coordinates);
}
