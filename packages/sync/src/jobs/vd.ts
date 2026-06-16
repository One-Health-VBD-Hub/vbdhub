import { createPrismaClient, type DatasetCategory, type Prisma } from '@vbdhub/db';
import ky from 'ky';
import { z } from 'zod';
import { linkDatasetTaxa, type ResolvedGbifTaxon } from './shared/taxonomy.js';
import { nullableStringSchema } from './shared/schemas.js';
import {
  getBoundingBox,
  upsertSpatialGeometry,
  type BoundingBox,
  type Coordinate
} from './shared/spatial.js';
import { normalizeNullableString, parseDateOnly } from './shared/normalization.js';
import type { JobDefinition } from '../types.js';

const VECDYN_BASE_URL = 'https://vectorbyte.crc.nd.edu/portal/api';
const VECDYN_SOURCE_DB = 'vecdyn';
const VECDYN_CATEGORY: DatasetCategory = 'abundance';

const vecDynIdsResponseSchema = z.looseObject({
  ids: z.array(z.coerce.number().int()).default([])
});

const vecDynDetailResultsSchema = z.looseObject({
  Id: z.coerce.number().int().optional(),
  Species: z
    .array(z.string())
    .nullish()
    .transform((value) => value ?? []),
  Years: z
    .array(z.string())
    .nullish()
    .transform((value) => value ?? []),
  CollectionMethods: z
    .array(z.string())
    .nullish()
    .transform((value) => value ?? []),
  Tags: z
    .array(z.string())
    .nullish()
    .transform((value) => value ?? [])
});

const vecDynDetailResponseSchema = z.looseObject({
  results: vecDynDetailResultsSchema.nullish()
});

const vecDynMapResponseSchema = z.array(
  z.tuple([z.union([z.string(), z.number()]), z.union([z.string(), z.number()])])
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

const vecDynCsvResponseSchema = z.looseObject({
  count: z.coerce.number().int(),
  digitized_from_graph: z.union([z.boolean(), z.string()]).optional(),
  consistent_data: vecDynCsvConsistentDataSchema.optional()
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
  async run({ logger }) {
    const prisma = createPrismaClient();
    const taxonomyResolutionCache = new Map<string, ResolvedGbifTaxon | null>();

    try {
      logger.info('Fetching VecDyn dataset IDs');
      const ids = await fetchVecDynDatasetIds();
      logger.info({ count: ids.length }, 'VecDyn IDs fetched');

      for (const id of ids) {
        try {
          const detail = await ky(`${VECDYN_BASE_URL}/vecdyn-detail/${id}`).json(
            vecDynDetailResponseSchema
          );
          // The CSV rows are paged, but this job only needs page-level metadata.
          const csv = await ky(
            `${VECDYN_BASE_URL}/vecdyncsv/?${new URLSearchParams({
              page: '1',
              piids: String(id)
            }).toString()}`
          ).json(vecDynCsvResponseSchema);
          const speciesByDate = await ky(
            `${VECDYN_BASE_URL}/vecdyn-detail-species-by-date/${id}`
          ).json(vecDynSpeciesByDateResponseSchema);
          const mapData = await ky(`${VECDYN_BASE_URL}/vecdyn-get-map-data/${id}`).json(
            vecDynMapResponseSchema
          );

          const coordinates = parseCoordinates(mapData);
          const bbox = getBoundingBox(coordinates);
          const speciesNames = extractSpeciesNamesFromDetail(detail);
          const temporalCoverage = parseTemporalCoverageFromSpeciesByDate(speciesByDate);

          const publishedAt =
            temporalCoverage.startDate ?? parsePublishedAtFromYears(detail.results?.Years);
          const title = csv.consistent_data?.title?.trim() || `VecDyn dataset ${id}`;
          const description =
            normalizeNullableString(csv.consistent_data?.description) ??
            buildDescription(csv.consistent_data);
          const publisher = csv.consistent_data?.contact_affiliation?.trim() || 'VectorByte VecDyn';
          const doi = normalizeNullableString(csv.consistent_data?.doi);
          const homepageUrl = `https://vectorbyte.crc.nd.edu/portal/dataset/${id}`;
          const sourceKey = String(id);

          const rawPayload = {
            detail: detail.results ?? null,
            csv: {
              count: csv.count ?? null,
              rowCount: csv.count,
              digitizedFromGraph: csv.digitized_from_graph ?? null,
              consistentData: csv.consistent_data ?? null
            },
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
          } as unknown as Prisma.InputJsonObject;
          const datasetData = {
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
              ...datasetData
            },
            update: datasetData
          });

          await upsertSpatialGeometry(prisma, dataset.id, coordinates);
          const linkedTaxa = await linkDatasetTaxa(
            prisma,
            dataset.id,
            speciesNames,
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
          logger.error({ err: error, sourceKey: id }, 'Failed to sync VecDyn dataset');
        }
      }
    } finally {
      await prisma.$disconnect();
    }
  }
};

async function fetchVecDynDatasetIds(): Promise<number[]> {
  // The paged data.results changes by page, but ids contains the full inventory.
  const url =
    `${VECDYN_BASE_URL}/vecdynbyprovider/?` +
    new URLSearchParams({
      page: '1',
      keywords: '',
      sort_column: 'Id',
      sort_dir: 'asc'
    }).toString();
  return (await ky(url).json(vecDynIdsResponseSchema)).ids;
}

function parseCoordinates(raw: VecDynMapResponse): Coordinate[] {
  const parsed: Coordinate[] = [];

  for (const entry of raw) {
    const lat = parseCoordinateNumber(entry[0]);
    const lon = parseCoordinateNumber(entry[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    parsed.push({ lat, lon });
  }

  return parsed;
}

function parseCoordinateNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  const trimmed = value.trim();
  if (trimmed.length === 0) return Number.NaN;
  return Number(trimmed);
}

function parsePublishedAtFromYears(years: string[] | undefined): Date | null {
  if (!years || years.length === 0) return null;
  const year = Number(years[0]);
  if (!Number.isInteger(year) || year < 0) return null;
  return new Date(Date.UTC(year, 0, 1, 0, 0, 0));
}

function extractSpeciesNamesFromDetail(detail: VecDynDetailResponse): string[] {
  const names = detail.results?.Species ?? [];
  return names.filter((name) => {
    const trimmed = name.trim();
    return trimmed.length > 0 && trimmed.toUpperCase() !== 'BLANK';
  });
}

function parseTemporalCoverageFromSpeciesByDate(speciesByDate: VecDynSpeciesByDateResponse): {
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
