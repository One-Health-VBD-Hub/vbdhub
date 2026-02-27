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

const VECDYN_BASE_URL = 'https://vectorbyte.crc.nd.edu/portal/api';
const VECDYN_SOURCE_DB = 'vecdyn';
const VECDYN_CATEGORY = 'abundance';

const vecDynIdsResponseSchema = z.looseObject({
  ids: z.array(z.coerce.number().int()).default([])
});

const vecDynDetailResultsSchema = z.looseObject({
  Id: z.coerce.number().int().optional(),
  Species: z.array(z.string()).default([]),
  Years: z.array(z.string()).default([]),
  CollectionMethods: z.array(z.string()).default([]),
  Tags: z.array(z.string()).default([])
});

const vecDynDetailResponseSchema = z.looseObject({
  results: vecDynDetailResultsSchema.optional()
});

const vecDynMapResponseSchema = z.array(
  z.tuple([
    z.union([z.string(), z.number()]),
    z.union([z.string(), z.number()])
  ])
);

const vecDynCsvConsistentDataSchema = z.looseObject({
  email: nullableStringSchema.optional(),
  title: nullableStringSchema.optional(),
  description: nullableStringSchema.optional(),
  datasetid: z.coerce.number().int().optional(),
  sample_unit: nullableStringSchema.optional(),
  submittedby: nullableStringSchema.optional(),
  contact_name: nullableStringSchema.optional(),
  sample_stage: nullableStringSchema.optional(),
  sample_location: nullableStringSchema.optional(),
  contributoremail: nullableStringSchema.optional(),
  species_id_method: nullableStringSchema.optional(),
  contact_affiliation: nullableStringSchema.optional(),
  digitized_from_graph: nullableStringSchema.optional(),
  gps_obfuscation_info: nullableStringSchema.optional(),
  date_uncertainty_due_to_graph: nullableStringSchema.optional(),
  curatedbycitation: nullableStringSchema.optional(),
  curatedbydoi: nullableStringSchema.optional(),
  location_description: nullableStringSchema.optional(),
  doi: nullableStringSchema.optional(),
  citation: nullableStringSchema.optional()
});

const vecDynCsvResultSchema = z.looseObject({
  species: nullableStringSchema.optional(),
  sample_start_date: nullableStringSchema.optional(),
  sample_end_date: nullableStringSchema.optional(),
  sample_value: nullableStringSchema.optional(),
  sample_sex: nullableStringSchema.optional(),
  sample_lat_dd: nullableStringSchema.optional(),
  sample_long_dd: nullableStringSchema.optional(),
  sampling_method: nullableStringSchema.optional()
});

const vecDynCsvResponseSchema = z.looseObject({
  count: z.coerce.number().int().optional(),
  digitized_from_graph: z.union([z.boolean(), z.string()]).optional(),
  consistent_data: vecDynCsvConsistentDataSchema.optional(),
  results: z.array(vecDynCsvResultSchema).default([])
});

const vecDynSpeciesByDateResponseSchema = z.record(
  z.string(),
  z.record(z.string(), z.coerce.number())
);

type VecDynDetailResponse = z.infer<typeof vecDynDetailResponseSchema>;
type VecDynMapResponse = z.infer<typeof vecDynMapResponseSchema>;
type VecDynCsvConsistentData = z.infer<typeof vecDynCsvConsistentDataSchema>;
type VecDynCsvResponse = z.infer<typeof vecDynCsvResponseSchema>;
type VecDynSpeciesByDateResponse = z.infer<typeof vecDynSpeciesByDateResponseSchema>;

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
          const detail = await fetchJson(
            `${VECDYN_BASE_URL}/vecdyn-detail/${id}`,
            signal,
            vecDynDetailResponseSchema
          );
          const csv = await fetchJson(
            `${VECDYN_BASE_URL}/vecdyncsv/?${new URLSearchParams({
              page: '1',
              piids: String(id)
            }).toString()}`,
            signal,
            vecDynCsvResponseSchema
          );
          const speciesByDate = await fetchJson(
            `${VECDYN_BASE_URL}/vecdyn-detail-species-by-date/${id}`,
            signal,
            vecDynSpeciesByDateResponseSchema
          );
          const mapData = await fetchJson(
            `${VECDYN_BASE_URL}/vecdyn-get-map-data/${id}`,
            signal,
            vecDynMapResponseSchema
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

          const rawPayload: Prisma.InputJsonObject = {
            detail: buildVecDynDetailRaw(detail),
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
          };

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
  const res = await fetchJson(url, signal, vecDynIdsResponseSchema);
  return res.ids ?? [];
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
  return getBoundingBoxShared(coords);
}

function parsePublishedAtFromYears(years: string[] | undefined): Date | null {
  if (!years || years.length === 0) return null;
  const year = Number(years[0]);
  if (!Number.isInteger(year) || year < 0) return null;
  return new Date(Date.UTC(year, 0, 1, 0, 0, 0));
}

function parseDateOnly(value: string | undefined): Date | null {
  return parseDateOnlyShared(value);
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

function normalizeNullableString(value: unknown): string | null {
  return normalizeNullableStringShared(value);
}

function buildVecDynDetailRaw(detail: VecDynDetailResponse): Prisma.InputJsonObject {
  const results = detail.results;

  return {
    id: results?.Id ?? null,
    species: results?.Species ?? [],
    years: results?.Years ?? [],
    collectionMethods: results?.CollectionMethods ?? [],
    tags: results?.Tags ?? []
  };
}

function buildCsvRawMeta(csv: VecDynCsvResponse): Prisma.InputJsonObject {
  const rowCount = csv.results?.length ?? 0;
  const consistentData = csv.consistent_data;

  return {
    count: csv.count ?? null,
    rowCount,
    digitized_from_graph: csv.digitized_from_graph ?? null,
    consistent_data: buildConsistentDataRaw(consistentData),
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

function buildConsistentDataRaw(
  consistentData: VecDynCsvConsistentData | undefined
): Prisma.InputJsonObject | null {
  if (!consistentData) return null;

  return {
    email: normalizeNullableString(consistentData.email),
    title: normalizeNullableString(consistentData.title),
    description: normalizeNullableString(consistentData.description),
    datasetid: consistentData.datasetid ?? null,
    sample_unit: normalizeNullableString(consistentData.sample_unit),
    submittedby: normalizeNullableString(consistentData.submittedby),
    contact_name: normalizeNullableString(consistentData.contact_name),
    sample_stage: normalizeNullableString(consistentData.sample_stage),
    sample_location: normalizeNullableString(consistentData.sample_location),
    contributoremail: normalizeNullableString(consistentData.contributoremail),
    species_id_method: normalizeNullableString(consistentData.species_id_method),
    contact_affiliation: normalizeNullableString(consistentData.contact_affiliation),
    digitized_from_graph: normalizeNullableString(consistentData.digitized_from_graph),
    gps_obfuscation_info: normalizeNullableString(consistentData.gps_obfuscation_info),
    date_uncertainty_due_to_graph: normalizeNullableString(
      consistentData.date_uncertainty_due_to_graph
    ),
    curatedbycitation: normalizeNullableString(consistentData.curatedbycitation),
    curatedbydoi: normalizeNullableString(consistentData.curatedbydoi),
    location_description: normalizeNullableString(consistentData.location_description),
    doi: normalizeNullableString(consistentData.doi),
    citation: normalizeNullableString(consistentData.citation)
  };
}

function parseBoolish(value: string | null): boolean | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
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
