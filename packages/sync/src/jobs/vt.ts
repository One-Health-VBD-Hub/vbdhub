import { createPrismaClient, type DatasetCategory, type Prisma } from '@vbdhub/db';
import ky from 'ky';
import { Temporal } from 'temporal-polyfill';
import { z } from 'zod';
import { createDatasetTaxaLinker } from './shared/taxonomy.js';
import { upsertSpatialGeometry, type Coordinate } from './shared/spatial.js';
import type { JobDefinition, TemporalCoverage } from '../types.js';

const VECTRAITS_BASE_URL = 'https://vectorbyte.crc.nd.edu/portal/api';
const DB_NAME = 'vectraits';
const DB_CATEGORY: DatasetCategory = 'traits';

const vecTraitsDatasetRowSchema = z.object({
  OriginalTraitName: z.string().trim().nullable(),
  Habitat: z.string().trim().nullable(),
  LabField: z.string().trim().nullable(),
  Location: z.string().trim(),
  LocationDate: z.iso
    .date()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)), // always in YYYY-MM-DD
  DOI: z.string().trim().nullable(),
  Citation: z.string().trim(),
  CuratedByCitation: z.string().trim().nullable(),
  CuratedByDOI: z.string().trim().nullable(),
  SubmittedBy: z.string().trim(),
  ContributorEmail: z.email().trim(),
  Interactor1: z.string().trim().nullable(),
  Interactor2: z.string().trim().nullable(),
  Latitude: z.number().nullable(),
  Longitude: z.number().nullable()
});

const vecTraitsDatasetResponseSchema = z.object({
  results: z.array(vecTraitsDatasetRowSchema)
});

type VecTraitsDatasetRow = z.infer<typeof vecTraitsDatasetRowSchema>;

export const vtSyncJob: JobDefinition = {
  name: 'vt',
  async run({ logger }) {
    const prisma = createPrismaClient();
    const linkDatasetTaxa = createDatasetTaxaLinker(prisma);

    try {
      logger.info('Fetching VecTraits dataset IDs');
      const ids = await fetchVecTraitsDatasetIds();
      logger.info({ count: ids.length }, 'VecTraits IDs fetched');

      for (const id of ids) {
        try {
          const rows: VecTraitsDatasetRow[] = await fetchVecTraitsDatasetRows(id);
          const coordinates = parseCoordinates(rows);
          const speciesNames = extractSpeciesNames(rows);

          const citation = getFirstNonEmpty(rows, (row) => row.Citation);
          const title = buildVtDatasetTitle(citation, id);
          const description = buildVtDescription(rows);
          const publisher =
            getFirstNonEmpty(rows, (row) => row.SubmittedBy) ?? 'VectorByte VecTraits';
          const doi = getFirstNonEmpty(rows, (row) => row.DOI);
          const temporalCoverage = parseLocationDateCoverage(rows);
          const publishedAt = doi
            ? await fetchDoiPublicationDate(doi)
            : parseCitationYear(citation);
          const sourceUrl = `https://vectorbyte.crc.nd.edu/vectraits-dataset/${id}`;
          const sourceKey = String(id);

          const datasetData = {
            category: DB_CATEGORY,
            title,
            description,
            sourceUrl,
            publisher,
            doi,
            publishedAt,
            raw: buildRawPayload(rows, temporalCoverage)
          };

          const dataset = await prisma.dataset.upsert({
            where: {
              sourceDb_sourceKey: {
                sourceDb: DB_NAME,
                sourceKey
              }
            },
            create: {
              sourceDb: DB_NAME,
              sourceKey,
              ...datasetData
            },
            update: datasetData
          });

          await upsertSpatialGeometry(prisma, dataset.id, coordinates);
          const linkedTaxa = await linkDatasetTaxa(dataset.id, speciesNames);

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
  const schema = z.object({
    ids: z.array(z.number().int())
  });

  // The explorer data.results is paged, but ids contains the full inventory.
  const url = `${VECTRAITS_BASE_URL}/vectraits-explorer/?page=1&sort_column=DatasetID&sort_dir=asc`;

  return (await ky(url).json(schema)).ids;
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
  getter: (row: VecTraitsDatasetRow) => string | null
): string | null {
  for (const row of rows) {
    const value = getter(row);
    if (value) return value;
  }
  return null;
}

function buildVtDatasetTitle(citation: string | null, id: number): string {
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
    const segment = remaining[i]!;
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

function buildVtDescription(rows: VecTraitsDatasetRow[]): string | null {
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
      startDate: temporalCoverage.startDate?.toISOString().slice(0, 10) ?? null,
      endDate: temporalCoverage.endDate?.toISOString().slice(0, 10) ?? null
    }
  } satisfies Prisma.InputJsonObject;
}

function collectUniqueValues(
  rows: VecTraitsDatasetRow[],
  getter: (row: VecTraitsDatasetRow) => string | null
): string[] {
  return Array.from(new Set(rows.map(getter).filter((value): value is string => Boolean(value))));
}

async function fetchDoiPublicationDate(doi: string): Promise<Date | null> {
  const schema = z.object({
    issued: z
      .object({
        'date-parts': z.array(z.array(z.number().int()))
      })
      .optional()
  });

  const metadata = await ky('https://citation.doi.org/metadata', {
    searchParams: { doi }
  }).json(schema);
  const [year, month = 1, day = 1] = metadata.issued?.['date-parts'][0] ?? [];
  if (!year) return null;

  const date = Temporal.PlainDate.from({ year, month, day }, { overflow: 'reject' });
  return new Date(date.toZonedDateTime('UTC').epochMilliseconds);
}

function parseCitationYear(citation: string | null): Date | null {
  const yearText = citation?.match(/\b(18|19|20)\d{2}\b/g)?.[0];
  if (!yearText) return null;

  return new Date(Date.UTC(Number(yearText), 0, 1));
}

function parseLocationDateCoverage(rows: VecTraitsDatasetRow[]): TemporalCoverage {
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  for (const row of rows) {
    const date = row.LocationDate;
    if (!date) continue;
    if (!startDate || date < startDate) startDate = date;
    if (!endDate || date > endDate) endDate = date;
  }

  return { startDate, endDate };
}

function parseCoordinates(rows: VecTraitsDatasetRow[]): Coordinate[] {
  const coordinates: Coordinate[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const { Latitude: lat, Longitude: lon } = row;
    if (lat === null || lon === null) continue;

    const key = `${lat},${lon}`;
    if (seen.has(key)) continue;
    seen.add(key);

    coordinates.push({ lat, lon });
  }

  return coordinates;
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

// necessary because the API returns sentinel values for missing species names
function normalizeSpeciesName(value: string | null): string | null {
  if (!value) return null;

  const upper = value.toUpperCase();
  if (upper === 'NONE NONE' || upper === 'NONE' || upper === 'BLANK' || upper === 'NA') return null;

  return value;
}
