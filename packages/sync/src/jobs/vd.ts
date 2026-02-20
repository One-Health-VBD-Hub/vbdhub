import { createPrismaClient } from '@vbdhub/db';
import type { Prisma } from '@prisma/client';
import type { JobDefinition } from '../types.js';

const VECDYN_BASE_URL = 'https://vectorbyte.crc.nd.edu/portal/api';
const VECDYN_SOURCE_DB = 'vecdyn';
const VECDYN_CATEGORY = 'abundance';

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

export const vdSyncJob: JobDefinition = {
  name: 'vd',
  description: 'Synchronise VecDyn records',
  async run({ logger, signal }) {
    if (signal.aborted) throw new Error('Job aborted before start');

    const prisma = createPrismaClient();
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
            csv.consistent_data?.title?.trim() ||
            `VecDyn dataset ${id}`;
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
            speciesNames
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
  const response = await fetch(url, {
    signal,
    headers: { accept: 'application/json' }
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

function buildDescription(consistentData: VecDynCsvConsistentData | undefined): string | null {
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
      gpsObfuscationInfo: normalizeNullableString(consistentData?.gps_obfuscation_info),
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

async function linkDatasetTaxa(
  prisma: ReturnType<typeof createPrismaClient>,
  datasetId: string,
  speciesNames: string[]
): Promise<number> {
  if (speciesNames.length === 0) return 0;

  const normalized = Array.from(
    new Set(
      speciesNames.map(normalizeTaxonName).filter((name) => name.length > 0)
    )
  );
  if (normalized.length === 0) return 0;

  const taxa = await prisma.taxon.findMany({
    where: { nameNorm: { in: normalized } },
    select: { gbifTaxonId: true, nameNorm: true }
  });

  const byNameNorm = new Map<string, number[]>();
  for (const taxon of taxa) {
    const existing = byNameNorm.get(taxon.nameNorm);
    if (existing) {
      existing.push(taxon.gbifTaxonId);
    } else {
      byNameNorm.set(taxon.nameNorm, [taxon.gbifTaxonId]);
    }
  }

  const uniqueTaxonIds = new Set<number>();
  for (const nameNorm of normalized) {
    const ids = byNameNorm.get(nameNorm);
    if (!ids || ids.length !== 1) continue;
    uniqueTaxonIds.add(ids[0]!);
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
