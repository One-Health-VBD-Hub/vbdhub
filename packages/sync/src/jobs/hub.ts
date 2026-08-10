import { createPrismaClient, type DatasetCategory, type Prisma } from '@vbdhub/db';
import { parse } from 'csv-parse';
import { createDatasetTaxaLinker } from './shared/taxonomy.js';
import { upsertSpatialGeometry, type Coordinate } from './shared/spatial.js';
import { normalizeNullableString, parseDateOnly } from './shared/normalization.js';
import { createHubStorageClient, type HubBucketObject } from './shared/storage.js';
import type { JobDefinition } from '../types.js';

const HUB_SOURCE_DB = 'hub';

const categoryMap: Record<string, DatasetCategory> = {
  abundance: 'abundance',
  epidemiology: 'epidemiology',
  occurrence: 'occurrence',
  proteomics: 'proteomics',
  traits: 'traits'
};

const metadataFieldAliases = {
  title: ['title'],
  description: ['description'],
  doi: ['doi'],
  sourceUrl: ['homepageurl', 'homepage', 'url'],
  license: ['license', 'licence'],
  publisher: ['contactaffiliation', 'publisher', 'submittedby'],
  publishedAt: ['publishedat', 'publicationdate', 'dateusedforstatistics', 'year']
} as const;

const personFieldAliases = {
  contactName: ['contactname'],
  contactAffiliation: ['contactaffiliation'],
  email: ['email'],
  contributorEmail: ['contributoremail'],
  submittedBy: ['submittedby']
} as const;

const taxonIdFieldAliases = {
  gbif: ['taxonidgbif'],
  ncbi: ['taxonidncbi']
} as const;

const speciesFieldAliases = ['scientificname', 'species'];
const genusFieldAliases = ['genus'];
const latitudeFieldAliases = ['latitude', 'lat', 'decimallatitude', 'samplelatdd'];
const longitudeFieldAliases = ['longitude', 'lon', 'lng', 'decimallongitude', 'samplelongdd'];
const yearFieldAliases = ['year'];
const dateFieldAliases = ['dateusedforstatistics', 'dateofonset', 'publishedat', 'publicationdate'];

interface HubDatasetFile {
  object: HubBucketObject;
  category: DatasetCategory;
  sourceKey: string;
}

interface DatasetSnapshot {
  sourceKey: string;
  category: DatasetCategory;
  title: string;
  description: string | null;
  publisher: string | null;
  sourceUrl: string | null;
  doi: string | null;
  license: string | null;
  publishedAt: Date | null;
  speciesNames: string[];
  coordinates: Coordinate[];
  recordCount: number;
  raw: Prisma.InputJsonObject;
}

interface DatasetAccumulator {
  title: string | null;
  description: string | null;
  publisher: string | null;
  sourceUrl: string | null;
  doi: string | null;
  license: string | null;
  publishedAt: Date | null;
  speciesNames: Set<string>;
  coordinates: Coordinate[];
  years: Set<number>;
  recordCount: number;
  firstRow: Record<string, string> | null;
}

export const hubSyncJob: JobDefinition = {
  name: 'hub',
  async run({ logger }) {
    const prisma = createPrismaClient();

    const {
      S3_BUCKET_NAME: bucket,
      S3_ACCESS_KEY_ID: accessKey,
      S3_SECRET_ACCESS_KEY: secretKey
    } = process.env;

    if (!bucket || !accessKey || !secretKey) {
      throw new Error('Hub storage client not configured');
    }

    const storage = createHubStorageClient({
      accessKey,
      secretKey,
      bucket
    });
    const linkDatasetTaxa = createDatasetTaxaLinker(prisma);

    try {
      logger.info('Starting hub synchronisation');

      const objects = await storage.listObjects();
      const datasets = collectDatasetFiles(objects);

      logger.info({ objects: objects.length, datasets: datasets.length }, 'Hub inventory complete');

      for (const dataset of datasets) {
        try {
          const snapshot = await processDataset(storage, dataset);
          const datasetRecord = await upsertDataset(prisma, snapshot);
          await upsertSpatialGeometry(prisma, datasetRecord.id, snapshot.coordinates);

          const taxaLinked = await linkDatasetTaxa(datasetRecord.id, snapshot.speciesNames);

          logger.info(
            {
              datasetId: datasetRecord.id,
              sourceKey: snapshot.sourceKey,
              category: snapshot.category,
              records: snapshot.recordCount,
              points: snapshot.coordinates.length,
              speciesNames: snapshot.speciesNames.length,
              taxaLinked
            },
            'Hub dataset synchronised'
          );
        } catch (error) {
          logger.error({ err: error, key: dataset.object.key }, 'Failed to sync hub dataset');
        }
      }
    } finally {
      await prisma.$disconnect();
    }
  }
};

function collectDatasetFiles(objects: HubBucketObject[]): HubDatasetFile[] {
  return objects
    .filter((object) => object.key.toLowerCase().endsWith('.csv'))
    .map((object) => {
      const { category, sourceKey } = parseDatasetPath(object.key);
      return { object, category, sourceKey };
    })
    .sort((a, b) => a.object.key.localeCompare(b.object.key));
}

function parseDatasetPath(objectKey: string): {
  category: DatasetCategory;
  sourceKey: string;
} {
  // Hub storage is intentionally treated as one CSV per top-level category
  // folder; nested paths would make sourceKey derivation ambiguous.
  const [rawCategory, ...rest] = objectKey.split('/').filter(Boolean);

  if (!rawCategory || rest.length !== 1) {
    throw new Error(`Expected dataset path like "<category>/<file>.csv", received "${objectKey}"`);
  }

  const category = categoryMap[rawCategory.toLowerCase()];
  if (!category) {
    throw new Error(`Unsupported hub category "${rawCategory}" in "${objectKey}"`);
  }

  const sourceKey = rest[0]!.replace(/\.csv$/i, '');
  if (!sourceKey) {
    throw new Error(`Could not derive source key from "${objectKey}"`);
  }

  return { category, sourceKey };
}

async function processDataset(
  storage: ReturnType<typeof createHubStorageClient>,
  dataset: HubDatasetFile
): Promise<DatasetSnapshot> {
  const stream = await storage.getObjectStream(dataset.object.key);

  const accumulator: DatasetAccumulator = {
    title: null,
    description: null,
    publisher: null,
    sourceUrl: null,
    doi: null,
    license: null,
    publishedAt: null,
    speciesNames: new Set<string>(),
    coordinates: [],
    years: new Set<number>(),
    recordCount: 0,
    firstRow: null
  };

  await parseCsv(stream, accumulator);

  const coordinates = dedupeCoordinates(accumulator.coordinates);
  // Prefer explicit metadata dates, then row years, then the object timestamp as
  // a last-resort proxy for legacy CSVs.
  const publishedAt =
    accumulator.publishedAt ??
    derivePublishedAtFromYears(accumulator.years) ??
    dataset.object.lastModified;

  return {
    sourceKey: dataset.sourceKey,
    category: dataset.category,
    title: accumulator.title ?? humanizeSourceKey(dataset.sourceKey),
    description: accumulator.description,
    publisher: accumulator.publisher,
    sourceUrl: accumulator.sourceUrl,
    doi: accumulator.doi,
    license: accumulator.license,
    publishedAt,
    speciesNames: Array.from(accumulator.speciesNames).sort(),
    coordinates,
    recordCount: accumulator.recordCount,
    raw: {
      object: {
        key: dataset.object.key,
        size: dataset.object.size,
        etag: dataset.object.etag,
        lastModified: dataset.object.lastModified?.toISOString() ?? null
      },
      recordCount: accumulator.recordCount,
      years: Array.from(accumulator.years).sort((a, b) => a - b),
      contacts: {
        contactName: accumulator.firstRow
          ? getFirstString(accumulator.firstRow, personFieldAliases.contactName)
          : null,
        contactAffiliation: accumulator.firstRow
          ? getFirstString(accumulator.firstRow, personFieldAliases.contactAffiliation)
          : null,
        email: accumulator.firstRow
          ? getFirstString(accumulator.firstRow, personFieldAliases.email)
          : null,
        contributorEmail: accumulator.firstRow
          ? getFirstString(accumulator.firstRow, personFieldAliases.contributorEmail)
          : null,
        submittedBy: accumulator.firstRow
          ? getFirstString(accumulator.firstRow, personFieldAliases.submittedBy)
          : null
      },
      taxonIds: {
        gbif: accumulator.firstRow
          ? getFirstString(accumulator.firstRow, taxonIdFieldAliases.gbif)
          : null,
        ncbi: accumulator.firstRow
          ? getFirstString(accumulator.firstRow, taxonIdFieldAliases.ncbi)
          : null
      }
    }
  };
}

async function parseCsv(
  stream: NodeJS.ReadableStream,
  accumulator: DatasetAccumulator
): Promise<void> {
  // Hub CSVs come from varied contributors, so parsing is deliberately tolerant
  // and field matching happens after header normalization.
  const parser = parse({
    columns: true,
    bom: true,
    trim: true,
    skip_empty_lines: true,
    relax_column_count: true
  });
  stream.pipe(parser);

  for await (const record of parser) {
    absorbRecord(accumulator, normalizeRecord(record as Record<string, unknown>));
  }
}

function absorbRecord(accumulator: DatasetAccumulator, record: Record<string, string>): void {
  accumulator.recordCount += 1;
  accumulator.firstRow ??= record;

  accumulator.title ??= getFirstString(record, metadataFieldAliases.title);
  accumulator.description ??= getFirstString(record, metadataFieldAliases.description);
  accumulator.publisher ??=
    getFirstString(record, metadataFieldAliases.publisher) ??
    getFirstString(record, personFieldAliases.contactAffiliation);
  accumulator.sourceUrl ??= getFirstString(record, metadataFieldAliases.sourceUrl);
  accumulator.doi ??= getFirstString(record, metadataFieldAliases.doi);
  accumulator.license ??= getFirstString(record, metadataFieldAliases.license);
  accumulator.publishedAt ??= extractDate(record, metadataFieldAliases.publishedAt);

  const speciesName = extractSpeciesName(record);
  if (speciesName) accumulator.speciesNames.add(speciesName);

  const coordinate = extractCoordinate(record);
  if (coordinate) accumulator.coordinates.push(coordinate);

  const year = extractYear(record);
  if (year !== null) accumulator.years.add(year);
}

function normalizeRecord(record: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [normalizeFieldName(key), stringifyCell(value)])
  );
}

function stringifyCell(value: unknown): string {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
}

async function upsertDataset(
  prisma: ReturnType<typeof createPrismaClient>,
  snapshot: DatasetSnapshot
) {
  const datasetData = {
    category: snapshot.category,
    title: snapshot.title,
    description: snapshot.description,
    sourceUrl: snapshot.sourceUrl,
    doi: snapshot.doi,
    publisher: snapshot.publisher,
    license: snapshot.license,
    publishedAt: snapshot.publishedAt,
    raw: snapshot.raw
  };

  return prisma.dataset.upsert({
    where: {
      sourceDb_sourceKey: {
        sourceDb: HUB_SOURCE_DB,
        sourceKey: snapshot.sourceKey
      }
    },
    create: {
      sourceDb: HUB_SOURCE_DB,
      sourceKey: snapshot.sourceKey,
      ...datasetData
    },
    update: datasetData
  });
}

function extractSpeciesName(record: Record<string, string>): string | null {
  const direct = getFirstString(record, speciesFieldAliases);
  if (direct) return direct;

  const genus = getFirstString(record, genusFieldAliases);
  const species = getFirstString(record, ['species']);
  if (!genus) return null;
  if (species && species.toLowerCase() !== genus.toLowerCase()) {
    return `${genus} ${species}`.trim();
  }

  return genus;
}

function extractCoordinate(record: Record<string, string>): Coordinate | null {
  const latitude = getFirstNumber(record, latitudeFieldAliases);
  const longitude = getFirstNumber(record, longitudeFieldAliases);
  if (latitude === null || longitude === null) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { lat: latitude, lon: longitude };
}

function extractYear(record: Record<string, string>): number | null {
  const directYear = getFirstNumber(record, yearFieldAliases);
  if (directYear !== null && directYear >= 1000 && directYear <= 3000) return directYear;

  const dated = extractDate(record, dateFieldAliases);
  return dated ? dated.getUTCFullYear() : null;
}

function extractDate(record: Record<string, string>, aliases: readonly string[]): Date | null {
  for (const alias of aliases) {
    const value = normalizeNullableString(record[alias]);
    if (!value) continue;

    const parsedDateOnly = parseDateOnly(value);
    if (parsedDateOnly) return parsedDateOnly;

    if (/^\d{4}$/.test(value)) {
      return new Date(Date.UTC(Number(value), 0, 1));
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function derivePublishedAtFromYears(years: Set<number>): Date | null {
  if (years.size === 0) return null;
  const latestYear = Math.max(...years);
  return new Date(Date.UTC(latestYear, 0, 1));
}

function getFirstString(record: Record<string, string>, aliases: readonly string[]): string | null {
  for (const alias of aliases) {
    const value = normalizeNullableString(record[alias]);
    if (value) return value;
  }

  return null;
}

function getFirstNumber(record: Record<string, string>, aliases: readonly string[]): number | null {
  const value = getFirstString(record, aliases);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeFieldName(field: string): string {
  // Collapse variants like "Sample Lat DD", "sample_lat_dd", and
  // "sample-lat-dd" to the same alias key.
  return field.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function humanizeSourceKey(sourceKey: string): string {
  const lastSegment = sourceKey.split(':').pop() ?? sourceKey;
  return lastSegment
    .split(/[-_]+/)
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(' ');
}

function dedupeCoordinates(coordinates: Coordinate[]): Coordinate[] {
  const seen = new Set<string>();
  const unique: Coordinate[] = [];

  for (const coordinate of coordinates) {
    const key = `${coordinate.lat},${coordinate.lon}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(coordinate);
  }

  return unique;
}
