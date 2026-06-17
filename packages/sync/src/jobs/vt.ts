import { createPrismaClient, type DatasetCategory, type Prisma } from '@vbdhub/db';
import ky from 'ky';
import { z } from 'zod';
import { linkDatasetTaxa, type ResolvedGbifTaxon } from './shared/taxonomy.js';
import { nullableStringSchema } from './shared/schemas.js';
import { getBoundingBox, upsertSpatialGeometry, type Coordinate } from './shared/spatial.js';
import { normalizeNullableString, parseDateOnly } from './shared/normalization.js';
import type { JobDefinition } from '../types.js';

const VECTRAITS_BASE_URL = 'https://vectorbyte.crc.nd.edu/portal/api';
const VECTRAITS_SOURCE_DB = 'vectraits';
const VECTRAITS_CATEGORY: DatasetCategory = 'traits';

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

const vecTraitsDatasetResponseSchema = z.object({
  results: z.array(vecTraitsDatasetRowSchema).default([])
});

type VecTraitsDatasetRow = z.infer<typeof vecTraitsDatasetRowSchema>;
type TemporalCoverage = {
  startDate: Date | null;
  endDate: Date | null;
  dateCount: number;
};

export const vtSyncJob: JobDefinition = {
  name: 'vt',
  description: 'Synchronise VecTraits records',
  async run({ logger }) {
    const prisma = createPrismaClient();
    const taxonomyResolutionCache = new Map<string, ResolvedGbifTaxon | null>();

    try {
      logger.info('Fetching VecTraits dataset IDs');
      const ids = await fetchVecTraitsDatasetIds();
      logger.info({ count: ids.length }, 'VecTraits IDs fetched');

      for (const id of ids) {
        try {
          const rows = await fetchVecTraitsDatasetRows(id);
          const coordinates = parseCoordinates(rows);
          const bbox = getBoundingBox(coordinates);
          const speciesNames = extractSpeciesNames(rows);

          const citation = getFirstNonEmpty(rows, (row) => row.Citation);
          const title = buildDatasetTitle(citation, id);
          const description = buildDescription(rows);
          const publisher =
            getFirstNonEmpty(rows, (row) => row.SubmittedBy) ?? 'VectorByte VecTraits';
          const doi = getFirstNonEmpty(rows, (row) => row.DOI);
          const temporalCoverage = parseLocationDateCoverage(rows);
          const publishedAt = parsePublishedAt(citation, temporalCoverage.startDate);
          const homepageUrl = `https://vectorbyte.crc.nd.edu/vectraits-dataset/${id}`;
          const sourceKey = String(id);
          const datasetData = {
            category: VECTRAITS_CATEGORY,
            title,
            description,
            homepageUrl,
            publisher,
            doi,
            publishedAt,
            raw: buildRawPayload(rows, temporalCoverage),
            bboxMinLon: bbox?.minLon ?? null,
            bboxMinLat: bbox?.minLat ?? null,
            bboxMaxLon: bbox?.maxLon ?? null,
            bboxMaxLat: bbox?.maxLat ?? null
          };

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
              rows: rows.length,
              points: coordinates.length,
              taxaLinked: linkedTaxa,
              temporalStart: temporalCoverage.startDate?.toISOString() ?? null,
              temporalEnd: temporalCoverage.endDate?.toISOString() ?? null
            },
            'VecTraits dataset synchronised'
          );
        } catch (error) {
          logger.error({ err: error, sourceKey: id }, 'Failed to sync VecTraits dataset');
        }
      }
    } finally {
      await prisma.$disconnect();
    }
  }
};

async function fetchVecTraitsDatasetIds(): Promise<number[]> {
  // The explorer data.results is paged, but ids contains the full inventory.
  const url =
    `${VECTRAITS_BASE_URL}/vectraits-explorer/?` +
    new URLSearchParams({
      page: '1',
      sort_column: 'DatasetID',
      sort_dir: 'asc'
    }).toString();
  return (await ky(url).json(vecTraitsIdsResponseSchema)).ids;
}

async function fetchVecTraitsDatasetRows(datasetId: number): Promise<VecTraitsDatasetRow[]> {
  // This endpoint returns all rows in one response; page parameters are ignored.
  return (
    await ky(`${VECTRAITS_BASE_URL}/vectraits-dataset/${datasetId}/`).json(
      vecTraitsDatasetResponseSchema
    )
  ).results;
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

  // Citations usually start with authors/year and end with journal metadata.
  // Keep the middle title-like segments until the text looks like a journal.
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
  const traits = collectUniqueValues(rows, (row) => row.OriginalTraitName);
  const habitats = collectUniqueValues(rows, (row) => row.Habitat);
  const environments = collectUniqueValues(rows, (row) => row.LabField);
  const locations = collectUniqueValues(rows, (row) => row.Location);

  return (
    [
      traits.length ? `Traits: ${traits.slice(0, 6).join(', ')}` : null,
      habitats.length ? `Habitats: ${habitats.slice(0, 4).join(', ')}` : null,
      environments.length ? `Environment: ${environments.slice(0, 3).join(', ')}` : null,
      locations.length ? `Locations: ${locations.slice(0, 3).join(', ')}` : null
    ]
      .filter((part): part is string => Boolean(part))
      .join(' | ') || null
  );
}

function buildRawPayload(
  rows: VecTraitsDatasetRow[],
  temporalCoverage: TemporalCoverage
): Prisma.InputJsonObject {
  const traits = collectUniqueValues(rows, (row) => row.OriginalTraitName);
  const habitats = collectUniqueValues(rows, (row) => row.Habitat);
  const labFieldValues = collectUniqueValues(rows, (row) => row.LabField);
  const locations = collectUniqueValues(rows, (row) => row.Location);
  const citation = getFirstNonEmpty(rows, (row) => row.Citation);
  const curatedByCitation = getFirstNonEmpty(rows, (row) => row.CuratedByCitation);
  const curatedByDoi = getFirstNonEmpty(rows, (row) => row.CuratedByDOI);
  const contributorEmail = getFirstNonEmpty(rows, (row) => row.ContributorEmail);
  const doi = getFirstNonEmpty(rows, (row) => row.DOI);

  return {
    rowCount: rows.length,
    traits,
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

function parsePublishedAt(citation: string | null, fallbackDate: Date | null): Date | null {
  return parseCitationYear(citation) ?? fallbackDate;
}

function parseCitationYear(citation: string | null): Date | null {
  for (const yearText of citation?.match(/\b(18|19|20)\d{2}\b/g) ?? []) {
    const year = Number(yearText);
    if (year >= 1800 && year <= 2100) {
      return new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    }
  }

  return null;
}

function parseLocationDateCoverage(rows: VecTraitsDatasetRow[]): TemporalCoverage {
  const uniqueDates = new Set<string>();
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  for (const row of rows) {
    const raw = normalizeNullableString(row.LocationDate);
    if (!raw) continue;
    uniqueDates.add(raw);

    // Keep the distinct raw date count even when a source date is not strict
    // YYYY-MM-DD and cannot be used for range bounds.
    const date = parseDateOnly(raw);
    if (!date) continue;
    if (!startDate || date < startDate) startDate = date;
    if (!endDate || date > endDate) endDate = date;
  }

  return { startDate, endDate, dateCount: uniqueDates.size };
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
  if (upper === 'NONE NONE' || upper === 'NONE' || upper === 'BLANK' || upper === 'NA') {
    return null;
  }

  return normalized;
}
