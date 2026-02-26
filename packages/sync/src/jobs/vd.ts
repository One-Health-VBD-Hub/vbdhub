import { createPrismaClient } from '@vbdhub/db';
import type { Prisma } from '@prisma/client';
import type { JobDefinition } from '../types.js';

const VECDYN_BASE_URL = 'https://vectorbyte.crc.nd.edu/portal/api';
const VECDYN_SOURCE_DB = 'vecdyn';
const VECDYN_CATEGORY = 'abundance';

type SupportedTaxonRank =
  | 'kingdom'
  | 'phylum'
  | 'class'
  | 'order'
  | 'family'
  | 'genus'
  | 'species'
  | 'subspecies';

interface VecDynIdsResponse {
  ids: number[];
}

interface VecDynDetailResults {
  Id?: number;
  Species?: string[];
  Years?: string[];
  CollectionMethods?: string[];
  Tags?: string[];
  [key: string]: unknown;
}

interface VecDynDetailResponse {
  results?: VecDynDetailResults;
  [key: string]: unknown;
}

type VecDynMapResponse = [string, string][];

interface VecDynCsvConsistentData {
  email?: string;
  title?: string;
  description?: string;
  datasetid?: number;
  sample_unit?: string;
  submittedby?: string;
  contact_name?: string;
  sample_stage?: string;
  sample_location?: string;
  contributoremail?: string;
  species_id_method?: string;
  contact_affiliation?: string;
  digitized_from_graph?: string;
  gps_obfuscation_info?: string;
  date_uncertainty_due_to_graph?: string;
  curatedbycitation?: string;
  curatedbydoi?: string;
  location_description?: string;
  doi?: string;
  citation?: string;
  [key: string]: unknown;
}

interface VecDynCsvResult {
  species?: string;
  sample_start_date?: string;
  sample_end_date?: string;
  sample_value?: string;
  sample_sex?: string;
  sample_lat_dd?: string;
  sample_long_dd?: string;
  sampling_method?: string;
  [key: string]: unknown;
}

interface VecDynCsvResponse {
  count?: number;
  digitized_from_graph?: boolean | string;
  consistent_data?: VecDynCsvConsistentData;
  results?: VecDynCsvResult[];
  [key: string]: unknown;
}

type VecDynSpeciesByDateResponse = Record<string, Record<string, number>>;

interface GlobalNamesVerificationResponse {
  names?: GlobalNamesNameResult[];
}

interface GlobalNamesNameResult {
  name?: string;
  results?: GlobalNamesMatchResult[];
  bestResult?: GlobalNamesMatchResult;
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

export const vdSyncJob: JobDefinition = {
  name: 'vd',
  description: 'Synchronise VecDyn records',
  async run({ logger, signal }) {
    if (signal.aborted) throw new Error('Job aborted before start');

    const prisma = createPrismaClient();
    const taxonomyResolutionCache = new Map<string, ResolvedGbifTaxon | null>();

    try {
      logger.info('Fetching VecDyn dataset IDs');
      const ids = await fetchVecDynDatasetIds(signal);
      logger.info({ count: ids.length }, 'VecDyn IDs fetched');

      for (const id of ids) {
        if (signal.aborted) throw new Error('Job aborted');

        try {
          const detail = await fetchJson<VecDynDetailResponse>(
            `${VECDYN_BASE_URL}/vecdyn-detail/${id}`,
            signal
          );
          const csv = await fetchJson<VecDynCsvResponse>(
            `${VECDYN_BASE_URL}/vecdyncsv/?${new URLSearchParams({
              page: '1',
              piids: String(id)
            }).toString()}`,
            signal
          );
          const speciesByDate = await fetchJson<VecDynSpeciesByDateResponse>(
            `${VECDYN_BASE_URL}/vecdyn-detail-species-by-date/${id}`,
            signal
          );
          const mapData = await fetchJson<VecDynMapResponse>(
            `${VECDYN_BASE_URL}/vecdyn-get-map-data/${id}`,
            signal
          );

          const coordinates = parseCoordinates(mapData);
          const bbox = getBoundingBox(coordinates);
          const speciesNames = extractSpeciesNamesFromDetail(detail);
          const temporalCoverage = parseTemporalCoverageFromSpeciesByDate(
            speciesByDate
          );

          const publishedAt =
            temporalCoverage.startDate ??
            parsePublishedAtFromYears(detail.results?.Years);
          const title =
            csv.consistent_data?.title?.trim() || `VecDyn dataset ${id}`;
          const description =
            normalizeNullableString(csv.consistent_data?.description) ??
            buildDescription(csv.consistent_data);
          const publisher =
            csv.consistent_data?.contact_affiliation?.trim() ||
            'VectorByte VecDyn';
          const doi = normalizeNullableString(csv.consistent_data?.doi);
          const homepageUrl = `https://vectorbyte.crc.nd.edu/portal/dataset/${id}`;
          const sourceKey = String(id);

          const rawPayload = {
            detail,
            csvMeta: buildCsvRawMeta(csv),
            temporalCoverage: {
              startDate: temporalCoverage.startDate
                ? temporalCoverage.startDate.toISOString().slice(0, 10)
                : null,
              endDate: temporalCoverage.endDate
                ? temporalCoverage.endDate.toISOString().slice(0, 10)
                : null,
              dateCount: temporalCoverage.dateCount,
              speciesCount: temporalCoverage.speciesCount
            },
            mapPointCount: coordinates.length
          } as Prisma.InputJsonValue;

          const dataset = await prisma.dataset.upsert({
            where: {
              sourceDb_sourceKey: {
                sourceDb: VECDYN_SOURCE_DB,
                sourceKey
              }
            },
            create: {
              sourceDb: VECDYN_SOURCE_DB,
              sourceKey,
              category: VECDYN_CATEGORY,
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
              category: VECDYN_CATEGORY,
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
              points: coordinates.length,
              taxaLinked: linkedTaxa,
              temporalStart: temporalCoverage.startDate?.toISOString() ?? null,
              temporalEnd: temporalCoverage.endDate?.toISOString() ?? null
            },
            'VecDyn dataset synchronised'
          );
        } catch (error) {
          logger.error(
            { err: error, sourceKey: id },
            'Failed to sync VecDyn dataset'
          );
        }
      }
    } finally {
      await prisma.$disconnect();
    }
  }
};

async function fetchVecDynDatasetIds(signal: AbortSignal): Promise<number[]> {
  const url =
    `${VECDYN_BASE_URL}/vecdynbyprovider/?` +
    new URLSearchParams({
      page: '1',
      keywords: '',
      sort_column: 'Id',
      sort_dir: 'asc'
    }).toString();
  const res = await fetchJson<VecDynIdsResponse>(url, signal);
  return res.ids ?? [];
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

function parseCoordinates(raw: VecDynMapResponse): Coordinate[] {
  const parsed: Coordinate[] = [];

  for (const entry of raw) {
    const lat = Number(entry[0]);
    const lon = Number(entry[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    parsed.push({ lat, lon });
  }

  return parsed;
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

function parsePublishedAtFromYears(years: string[] | undefined): Date | null {
  if (!years || years.length === 0) return null;
  const year = Number(years[0]);
  if (!Number.isInteger(year) || year < 0) return null;
  return new Date(Date.UTC(year, 0, 1, 0, 0, 0));
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

function extractSpeciesNamesFromDetail(detail: VecDynDetailResponse): string[] {
  const names = detail.results?.Species ?? [];
  return names.filter((name) => {
    const trimmed = name.trim();
    return trimmed.length > 0 && trimmed.toUpperCase() !== 'BLANK';
  });
}

function parseTemporalCoverageFromSpeciesByDate(
  speciesByDate: VecDynSpeciesByDateResponse
): {
  startDate: Date | null;
  endDate: Date | null;
  dateCount: number;
  speciesCount: number;
} {
  const uniqueDates = new Set<string>();
  const species = Object.keys(speciesByDate);

  for (const byDate of Object.values(speciesByDate)) {
    for (const date of Object.keys(byDate)) uniqueDates.add(date);
  }

  let startDate: Date | null = null;
  let endDate: Date | null = null;

  for (const dateText of uniqueDates) {
    const date = parseDateOnly(dateText);
    if (!date) continue;
    if (!startDate || date < startDate) startDate = date;
    if (!endDate || date > endDate) endDate = date;
  }

  return {
    startDate,
    endDate,
    dateCount: uniqueDates.size,
    speciesCount: species.length
  };
}

function buildDescription(
  consistentData: VecDynCsvConsistentData | undefined
): string | null {
  if (!consistentData) return null;

  const parts = [
    normalizeNullableString(consistentData.location_description),
    normalizeNullableString(consistentData.sample_location),
    normalizeNullableString(consistentData.sample_stage),
    normalizeNullableString(consistentData.sample_unit),
    normalizeNullableString(consistentData.species_id_method)
  ].filter((value): value is string => Boolean(value));

  if (parts.length === 0) return null;
  return parts.join(' | ');
}

function normalizeNullableString(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildCsvRawMeta(csv: VecDynCsvResponse): Prisma.InputJsonObject {
  const rowCount = csv.results?.length ?? 0;
  const consistentData = csv.consistent_data;

  return {
    count: csv.count ?? null,
    rowCount,
    digitized_from_graph: csv.digitized_from_graph ?? null,
    consistent_data: (consistentData ?? null) as Prisma.InputJsonValue,
    extracted: {
      citation: normalizeNullableString(consistentData?.citation),
      contributorEmail: normalizeNullableString(consistentData?.contributoremail),
      contactName: normalizeNullableString(consistentData?.contact_name),
      sampleStage: normalizeNullableString(consistentData?.sample_stage),
      sampleUnit: normalizeNullableString(consistentData?.sample_unit),
      speciesIdMethod: normalizeNullableString(consistentData?.species_id_method),
      gpsObfuscationInfo: normalizeNullableString(
        consistentData?.gps_obfuscation_info
      ),
      dateUncertaintyDueToGraph: parseBoolish(
        normalizeNullableString(consistentData?.date_uncertainty_due_to_graph)
      ),
      curatedByCitation: normalizeNullableString(consistentData?.curatedbycitation),
      curatedByDoi: normalizeNullableString(consistentData?.curatedbydoi)
    } satisfies Prisma.InputJsonObject
  };
}

function parseBoolish(value: string | null): boolean | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
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

async function resolveGbifTaxaFromNames(
  names: string[],
  signal: AbortSignal
): Promise<Map<string, ResolvedGbifTaxon | null>> {
  const body = {
    nameStrings: names,
    withRelaxedFuzzyMatch: true,
    withCapitalization: true,
    withUninomialFuzzyMatch: true,
    dataSources: [11]
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
    const matches =
      item.results && item.results.length > 0
        ? item.results
        : item.bestResult
          ? [item.bestResult]
          : [];
    const resolved = parseGlobalNamesGbifMatch(matches);
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
