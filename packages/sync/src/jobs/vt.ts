import { createPrismaClient } from '@vbdhub/db';
import type { Prisma } from '@prisma/client';
import type { JobDefinition } from '../types.js';

const VECTRAITS_BASE_URL = 'https://vectorbyte.crc.nd.edu/portal/api';
const VECTRAITS_SOURCE_DB = 'vectraits';
const VECTRAITS_CATEGORY = 'traits';

type SupportedTaxonRank =
  | 'kingdom'
  | 'phylum'
  | 'class'
  | 'order'
  | 'family'
  | 'genus'
  | 'species'
  | 'subspecies';

interface VecTraitsIdsResponse {
  ids: number[];
}

interface VecTraitsDatasetRow {
  Id?: number | string;
  DatasetID?: number;
  OriginalTraitName?: string;
  StandardisedTraitName?: string;
  OriginalTraitDef?: string;
  StandardisedTraitDef?: string;
  Habitat?: string;
  LabField?: string;
  Location?: string;
  LocationDate?: string;
  DOI?: string;
  Citation?: string;
  CuratedByCitation?: string;
  CuratedByDOI?: string;
  SubmittedBy?: string;
  ContributorEmail?: string;
  Interactor1?: string;
  Interactor2?: string;
  Latitude?: number | string | null;
  Longitude?: number | string | null;
  [key: string]: unknown;
}

interface VecTraitsDatasetResponse {
  count?: number;
  total?: number;
  page?: number;
  page_size?: number;
  per_page?: number;
  total_pages?: number;
  num_pages?: number;
  has_next?: boolean;
  next_page?: number | null;
  next?: string | null;
  previous?: string | null;
  results?: VecTraitsDatasetRow[];
  [key: string]: unknown;
}

interface GlobalNamesVerificationResponse {
  names?: GlobalNamesNameResult[];
}

interface GlobalNamesNameResult {
  name?: string;
  results?: GlobalNamesMatchResult[];
}

interface GlobalNamesMatchResult {
  dataSourceId?: number;
  sortScore?: number;
  taxonomicStatus?: string;
  isSynonym?: boolean;
  recordId?: string;
  currentRecordId?: string;
  currentCanonicalSimple?: string;
  currentCanonicalFull?: string;
  matchedCanonicalSimple?: string;
  matchedCanonicalFull?: string;
  currentName?: string;
  classificationPath?: string;
  classificationRanks?: string;
  classificationIds?: string;
}

interface Coordinate {
  lat: number;
  lon: number;
}

interface BoundingBox {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
}

interface ResolvedGbifTaxon {
  gbifTaxonId: number;
  scientificName: string;
  nameNorm: string;
  rank: SupportedTaxonRank | null;
  parentGbifTaxonId: number | null;
  kingdomId: number | null;
  phylumId: number | null;
  classId: number | null;
  orderId: number | null;
  familyId: number | null;
  genusId: number | null;
  ancestors: Array<{
    gbifTaxonId: number;
    scientificName: string;
    nameNorm: string;
    rank: SupportedTaxonRank | null;
    parentGbifTaxonId: number | null;
    kingdomId: number | null;
    phylumId: number | null;
    classId: number | null;
    orderId: number | null;
    familyId: number | null;
    genusId: number | null;
  }>;
}

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
  const res = await fetchJson<VecTraitsIdsResponse>(url, signal);
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
    const payload = await fetchJson<VecTraitsDatasetResponse>(url, signal);
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

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  return fetchJsonWithInit<T>(url, signal);
}

async function fetchJsonWithInit<T>(
  url: string,
  signal: AbortSignal,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    signal,
    ...init,
    headers: {
      accept: 'application/json',
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return (await response.json()) as T;
}

function getFirstNonEmpty(
  rows: VecTraitsDatasetRow[],
  getter: (row: VecTraitsDatasetRow) => string | undefined
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
  getter: (row: VecTraitsDatasetRow) => string | undefined
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
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, monthIndex, day, 0, 0, 0));
  return Number.isNaN(date.getTime()) ? null : date;
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
  if (typeof value === 'string') return Number(value);
  return Number.NaN;
}

function getBoundingBox(coords: Coordinate[]): BoundingBox | null {
  if (coords.length === 0) return null;

  let minLat = coords[0]!.lat;
  let maxLat = coords[0]!.lat;
  let minLon = coords[0]!.lon;
  let maxLon = coords[0]!.lon;

  for (const point of coords) {
    if (point.lat < minLat) minLat = point.lat;
    if (point.lat > maxLat) maxLat = point.lat;
    if (point.lon < minLon) minLon = point.lon;
    if (point.lon > maxLon) maxLon = point.lon;
  }

  return { minLat, minLon, maxLat, maxLon };
}

function normalizeNullableString(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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

function normalizeSpeciesName(value: string | undefined): string | null {
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
  if (speciesNames.length === 0) return 0;

  const queryNames = Array.from(
    new Set(
      speciesNames
        .map(normalizeTaxonQueryName)
        .filter((name) => name.length > 0 && name.toUpperCase() !== 'BLANK')
    )
  );
  if (queryNames.length === 0) return 0;

  const unresolvedNames = queryNames.filter(
    (name) => !taxonomyResolutionCache.has(name)
  );

  if (unresolvedNames.length > 0) {
    const resolvedFromApi = await resolveGbifTaxaFromNames(
      unresolvedNames,
      signal
    );
    for (const name of unresolvedNames) {
      taxonomyResolutionCache.set(name, resolvedFromApi.get(name) ?? null);
    }
  }

  const uniqueTaxonIds = new Set<number>();
  for (const name of queryNames) {
    const resolved = taxonomyResolutionCache.get(name);
    if (!resolved) continue;

    await upsertResolvedTaxon(prisma, resolved);
    uniqueTaxonIds.add(resolved.gbifTaxonId);
  }

  if (uniqueTaxonIds.size === 0) return 0;

  const created = await prisma.datasetTaxon.createMany({
    data: Array.from(uniqueTaxonIds, (gbifTaxonId) => ({
      datasetId,
      gbifTaxonId
    })),
    skipDuplicates: true
  });

  return created.count;
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

function normalizeTaxonQueryName(name: string): string {
  return name
    .replace(/\bcomplex\b/gi, '')
    .replace(/\bmorphological group\b/gi, '')
    .replace(/\bsp\.\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function resolveGbifTaxaFromNames(
  names: string[],
  signal: AbortSignal
): Promise<Map<string, ResolvedGbifTaxon | null>> {
  const body = {
    nameStrings: names,
    withAllMatches: true,
    withCapitalization: true,
    withUninomialFuzzyMatch: true,
    preferredSources: [11]
  };

  const response = await fetchJsonWithInit<GlobalNamesVerificationResponse>(
    'https://verifier.globalnames.org/api/v1/verifications',
    signal,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  const resultMap = new Map<string, ResolvedGbifTaxon | null>();
  for (const item of response.names ?? []) {
    const name = normalizeTaxonQueryName(item.name ?? '');
    if (!name) continue;
    const resolved = parseGlobalNamesGbifMatch(item.results ?? []);
    resultMap.set(name, resolved);
  }

  for (const name of names) {
    if (!resultMap.has(name)) resultMap.set(name, null);
  }

  return resultMap;
}

function parseGlobalNamesGbifMatch(
  matches: GlobalNamesMatchResult[]
): ResolvedGbifTaxon | null {
  const gbifMatches = matches.filter((match) => match.dataSourceId === 11);
  if (gbifMatches.length === 0) return null;

  const acceptedNonSynonym = gbifMatches
    .filter(
      (match) =>
        (match.taxonomicStatus ?? '').toLowerCase() === 'accepted' &&
        match.isSynonym === false
    )
    .sort((a, b) => (b.sortScore ?? 0) - (a.sortScore ?? 0));
  const best = acceptedNonSynonym[0];
  if (!best) return null;

  const focalId = parseGbifId(best.currentRecordId ?? best.recordId);
  if (!focalId) return null;

  const pathNames = splitPipe(best.classificationPath);
  const pathRanks = splitPipe(best.classificationRanks);
  const pathIds = splitPipe(best.classificationIds);

  const lineage = extractLineageIds(pathRanks, pathIds);
  const ancestryRows = extractAncestryRows(pathNames, pathRanks, pathIds);

  const focalNodeIndex = pathIds.findIndex((id) => parseGbifId(id) === focalId);
  const focalRank =
    focalNodeIndex >= 0 ? toSupportedTaxonRank(pathRanks[focalNodeIndex]) : null;
  const focalParentId =
    focalNodeIndex > 0 ? parseGbifId(pathIds[focalNodeIndex - 1]) : null;

  const scientificName =
    best.currentCanonicalFull ??
    best.matchedCanonicalFull ??
    best.currentCanonicalSimple ??
    best.matchedCanonicalSimple ??
    best.currentName ??
    pathNames[focalNodeIndex] ??
    `GBIF ${focalId}`;

  return {
    gbifTaxonId: focalId,
    scientificName,
    nameNorm: normalizeTaxonName(scientificName),
    rank: focalRank,
    parentGbifTaxonId: focalParentId,
    kingdomId: lineage.kingdomId,
    phylumId: lineage.phylumId,
    classId: lineage.classId,
    orderId: lineage.orderId,
    familyId: lineage.familyId,
    genusId: lineage.genusId,
    ancestors: ancestryRows.filter((row) => row.gbifTaxonId !== focalId)
  };
}

function splitPipe(value: string | undefined): string[] {
  if (!value) return [];
  return value.split('|').map((part) => part.trim());
}

function extractLineageIds(
  ranks: string[],
  ids: string[]
): {
  kingdomId: number | null;
  phylumId: number | null;
  classId: number | null;
  orderId: number | null;
  familyId: number | null;
  genusId: number | null;
} {
  let kingdomId: number | null = null;
  let phylumId: number | null = null;
  let classId: number | null = null;
  let orderId: number | null = null;
  let familyId: number | null = null;
  let genusId: number | null = null;

  for (let i = 0; i < ranks.length; i += 1) {
    const rank = toSupportedTaxonRank(ranks[i]);
    const id = parseGbifId(ids[i]);
    if (!rank || !id) continue;

    if (rank === 'kingdom') kingdomId = id;
    if (rank === 'phylum') phylumId = id;
    if (rank === 'class') classId = id;
    if (rank === 'order') orderId = id;
    if (rank === 'family') familyId = id;
    if (rank === 'genus') genusId = id;
  }

  return { kingdomId, phylumId, classId, orderId, familyId, genusId };
}

function extractAncestryRows(
  names: string[],
  ranks: string[],
  ids: string[]
): Array<{
  gbifTaxonId: number;
  scientificName: string;
  nameNorm: string;
  rank: SupportedTaxonRank | null;
  parentGbifTaxonId: number | null;
  kingdomId: number | null;
  phylumId: number | null;
  classId: number | null;
  orderId: number | null;
  familyId: number | null;
  genusId: number | null;
}> {
  const rows: Array<{
    gbifTaxonId: number;
    scientificName: string;
    nameNorm: string;
    rank: SupportedTaxonRank | null;
    parentGbifTaxonId: number | null;
    kingdomId: number | null;
    phylumId: number | null;
    classId: number | null;
    orderId: number | null;
    familyId: number | null;
    genusId: number | null;
  }> = [];

  let lastNumericId: number | null = null;
  let kingdomId: number | null = null;
  let phylumId: number | null = null;
  let classId: number | null = null;
  let orderId: number | null = null;
  let familyId: number | null = null;
  let genusId: number | null = null;

  for (let i = 0; i < ids.length; i += 1) {
    const gbifTaxonId = parseGbifId(ids[i]);
    if (!gbifTaxonId) continue;

    const scientificName = names[i] || `GBIF ${gbifTaxonId}`;
    const rank = toSupportedTaxonRank(ranks[i]);

    if (rank === 'kingdom') kingdomId = gbifTaxonId;
    if (rank === 'phylum') phylumId = gbifTaxonId;
    if (rank === 'class') classId = gbifTaxonId;
    if (rank === 'order') orderId = gbifTaxonId;
    if (rank === 'family') familyId = gbifTaxonId;
    if (rank === 'genus') genusId = gbifTaxonId;

    rows.push({
      gbifTaxonId,
      scientificName,
      nameNorm: normalizeTaxonName(scientificName),
      rank,
      parentGbifTaxonId: lastNumericId,
      kingdomId,
      phylumId,
      classId,
      orderId,
      familyId,
      genusId
    });
    lastNumericId = gbifTaxonId;
  }

  return rows;
}

function parseGbifId(value: string | undefined): number | null {
  if (!value) return null;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function toSupportedTaxonRank(rank: string | undefined): SupportedTaxonRank | null {
  if (!rank) return null;
  const normalized = rank.trim().toLowerCase();

  if (
    normalized === 'kingdom' ||
    normalized === 'phylum' ||
    normalized === 'class' ||
    normalized === 'order' ||
    normalized === 'family' ||
    normalized === 'genus' ||
    normalized === 'species' ||
    normalized === 'subspecies'
  ) {
    return normalized;
  }

  return null;
}

async function upsertResolvedTaxon(
  prisma: ReturnType<typeof createPrismaClient>,
  resolved: ResolvedGbifTaxon
): Promise<void> {
  for (const ancestor of resolved.ancestors) {
    await prisma.taxon.upsert({
      where: { gbifTaxonId: ancestor.gbifTaxonId },
      create: {
        gbifTaxonId: ancestor.gbifTaxonId,
        scientificName: ancestor.scientificName,
        nameNorm: ancestor.nameNorm,
        rank: ancestor.rank,
        parentGbifTaxonId: ancestor.parentGbifTaxonId,
        kingdomId: ancestor.kingdomId,
        phylumId: ancestor.phylumId,
        classId: ancestor.classId,
        orderId: ancestor.orderId,
        familyId: ancestor.familyId,
        genusId: ancestor.genusId
      },
      update: {
        scientificName: ancestor.scientificName,
        nameNorm: ancestor.nameNorm,
        rank: ancestor.rank,
        parentGbifTaxonId: ancestor.parentGbifTaxonId,
        kingdomId: ancestor.kingdomId,
        phylumId: ancestor.phylumId,
        classId: ancestor.classId,
        orderId: ancestor.orderId,
        familyId: ancestor.familyId,
        genusId: ancestor.genusId
      }
    });
  }

  await prisma.taxon.upsert({
    where: { gbifTaxonId: resolved.gbifTaxonId },
    create: {
      gbifTaxonId: resolved.gbifTaxonId,
      scientificName: resolved.scientificName,
      nameNorm: resolved.nameNorm,
      rank: resolved.rank,
      parentGbifTaxonId: resolved.parentGbifTaxonId,
      kingdomId: resolved.kingdomId,
      phylumId: resolved.phylumId,
      classId: resolved.classId,
      orderId: resolved.orderId,
      familyId: resolved.familyId,
      genusId: resolved.genusId
    },
    update: {
      scientificName: resolved.scientificName,
      nameNorm: resolved.nameNorm,
      rank: resolved.rank,
      parentGbifTaxonId: resolved.parentGbifTaxonId,
      kingdomId: resolved.kingdomId,
      phylumId: resolved.phylumId,
      classId: resolved.classId,
      orderId: resolved.orderId,
      familyId: resolved.familyId,
      genusId: resolved.genusId
    }
  });
}

async function upsertSpatialGeometry(
  prisma: ReturnType<typeof createPrismaClient>,
  datasetId: string,
  coordinates: Coordinate[]
): Promise<void> {
  if (coordinates.length === 0) {
    await prisma.$executeRaw`
      UPDATE "Dataset"
      SET "spatialGeom" = NULL
      WHERE "id" = ${datasetId}
    `;
    return;
  }

  const geoJson = JSON.stringify({
    type: 'MultiPoint',
    coordinates: coordinates.map((point) => [point.lon, point.lat])
  });

  await prisma.$executeRaw`
    UPDATE "Dataset"
    SET "spatialGeom" = ST_SetSRID(ST_GeomFromGeoJSON(${geoJson}), 4326)
    WHERE "id" = ${datasetId}
  `;
}
