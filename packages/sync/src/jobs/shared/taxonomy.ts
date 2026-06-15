import { createPrismaClient } from '@vbdhub/db';
import ky from 'ky';
import { z } from 'zod';
import { nullableStringSchema } from './schemas.js';

const GBIF_DATASOURCE_ID = 11;
const GLOBAL_NAMES_VERIFICATION_URL =
  'https://verifier.globalnames.org/api/v1/verifications';
const RETRYABLE_HTTP_STATUSES = [429, 500, 502, 503, 504];

export interface ResolveGbifTaxaOptions {
  batchSize?: number;
  retryAttempts?: number;
}

export type SupportedTaxonRank =
  | 'kingdom'
  | 'phylum'
  | 'class'
  | 'order'
  | 'family'
  | 'genus'
  | 'species'
  | 'subspecies';

interface ResolvedTaxonRow {
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
}

export interface ResolvedGbifTaxon extends ResolvedTaxonRow {
  ancestors: ResolvedTaxonRow[];
}

const globalNamesMatchResultSchema = z.looseObject({
  dataSourceId: z.number().optional(),
  sortScore: z.number().optional(),
  taxonomicStatus: nullableStringSchema.optional(),
  isSynonym: z.boolean().optional(),
  recordId: nullableStringSchema.optional(),
  currentRecordId: nullableStringSchema.optional(),
  currentCanonicalSimple: nullableStringSchema.optional(),
  currentCanonicalFull: nullableStringSchema.optional(),
  matchedCanonicalSimple: nullableStringSchema.optional(),
  matchedCanonicalFull: nullableStringSchema.optional(),
  currentName: nullableStringSchema.optional(),
  classificationPath: nullableStringSchema.optional(),
  classificationRanks: nullableStringSchema.optional(),
  classificationIds: nullableStringSchema.optional()
});

const globalNamesNameResultSchema = z.looseObject({
  name: nullableStringSchema.optional(),
  results: z.array(globalNamesMatchResultSchema).default([]),
  bestResult: globalNamesMatchResultSchema.optional()
});

const globalNamesVerificationResponseSchema = z.looseObject({
  names: z.array(globalNamesNameResultSchema).default([])
});

type GlobalNamesMatchResult = z.infer<typeof globalNamesMatchResultSchema>;
type GlobalNamesVerificationResponse = z.infer<
  typeof globalNamesVerificationResponseSchema
>;

function buildGlobalNamesRequestBody(nameStrings: string[]): {
  nameStrings: string[];
  withRelaxedFuzzyMatch: true;
  withCapitalization: true;
  withUninomialFuzzyMatch: true;
  dataSources: [11];
} {
  return {
    nameStrings,
    withRelaxedFuzzyMatch: true,
    withCapitalization: true,
    withUninomialFuzzyMatch: true,
    dataSources: [11]
  };
}

async function resolveGbifTaxaFromNames(
  names: string[],
  signal: AbortSignal,
  options?: ResolveGbifTaxaOptions
): Promise<Map<string, ResolvedGbifTaxon | null>> {
  const resultMap = new Map<string, ResolvedGbifTaxon | null>();
  const batchSize = Math.max(1, options?.batchSize ?? (names.length || 1));

  for (let i = 0; i < names.length; i += batchSize) {
    const batch = names.slice(i, i + batchSize);
    if (batch.length === 0) continue;

    const response = await fetchGlobalNamesBatch(batch, signal, options);
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
  }

  for (const name of names) {
    if (!resultMap.has(name)) resultMap.set(name, null);
  }

  return resultMap;
}

async function fetchGlobalNamesBatch(
  nameStrings: string[],
  signal: AbortSignal,
  options?: ResolveGbifTaxaOptions
): Promise<GlobalNamesVerificationResponse> {
  const retryAttempts = options?.retryAttempts ?? 1;

  return ky
    .post(GLOBAL_NAMES_VERIFICATION_URL, {
      signal,
      json: buildGlobalNamesRequestBody(nameStrings),
      retry:
        retryAttempts > 1
          ? {
              limit: retryAttempts - 1,
              methods: ['post'],
              statusCodes: RETRYABLE_HTTP_STATUSES
            }
          : 0
    })
    .json(globalNamesVerificationResponseSchema);
}

export async function linkDatasetTaxa(
  prisma: ReturnType<typeof createPrismaClient>,
  datasetId: string,
  speciesNames: string[],
  signal: AbortSignal,
  taxonomyResolutionCache: Map<string, ResolvedGbifTaxon | null>,
  options?: ResolveGbifTaxaOptions
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
      signal,
      options
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

function parseGlobalNamesGbifMatch(
  matches: GlobalNamesMatchResult[]
): ResolvedGbifTaxon | null {
  const gbifMatches = matches.filter(
    (match) => match.dataSourceId === GBIF_DATASOURCE_ID
  );
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
    focalNodeIndex >= 0
      ? toSupportedTaxonRank(pathRanks[focalNodeIndex])
      : null;
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

function splitPipe(value: string | null | undefined): string[] {
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
): ResolvedTaxonRow[] {
  const rows: ResolvedTaxonRow[] = [];

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

function parseGbifId(value: string | null | undefined): number | null {
  if (!value) return null;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function toSupportedTaxonRank(
  rank: string | null | undefined
): SupportedTaxonRank | null {
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
    await upsertTaxonRow(prisma, ancestor);
  }

  await upsertTaxonRow(prisma, resolved);
}

async function upsertTaxonRow(
  prisma: ReturnType<typeof createPrismaClient>,
  row: ResolvedTaxonRow
): Promise<void> {
  const data = {
    scientificName: row.scientificName,
    nameNorm: row.nameNorm,
    rank: row.rank,
    parentGbifTaxonId: row.parentGbifTaxonId,
    kingdomId: row.kingdomId,
    phylumId: row.phylumId,
    classId: row.classId,
    orderId: row.orderId,
    familyId: row.familyId,
    genusId: row.genusId
  };

  await prisma.taxon.upsert({
    where: { gbifTaxonId: row.gbifTaxonId },
    create: {
      gbifTaxonId: row.gbifTaxonId,
      ...data
    },
    update: data
  });
}
