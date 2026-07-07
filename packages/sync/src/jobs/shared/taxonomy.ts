import { createPrismaClient } from '@vbdhub/db';
import ky from 'ky';
import { z } from 'zod';
import { nullableStringSchema } from './schemas.js';

const GBIF_DATASOURCE_ID = 11;
const GLOBAL_NAMES_VERIFICATION_URL = 'https://verifier.globalnames.org/api/v1/verifications';
const RETRYABLE_HTTP_STATUSES = [429, 500, 502, 503, 504];
const supportedTaxonRanks = [
  'kingdom',
  'phylum',
  'class',
  'order',
  'family',
  'genus',
  'species',
  'subspecies'
] as const;
const supportedTaxonRankSet = new Set<string>(supportedTaxonRanks);

export interface ResolveGbifTaxaOptions {
  batchSize?: number;
  retryAttempts?: number;
}

export type SupportedTaxonRank = (typeof supportedTaxonRanks)[number];

interface TaxonUpsertRow {
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

export interface ResolvedGbifTaxon {
  taxon: TaxonUpsertRow;
  ancestors: TaxonUpsertRow[];
}

interface TaxonLineage {
  kingdomId: number | null;
  phylumId: number | null;
  classId: number | null;
  orderId: number | null;
  familyId: number | null;
  genusId: number | null;
}

interface ParsedGbifClassification {
  lineage: TaxonLineage;
  taxonRows: TaxonUpsertRow[];
  matchedRank: SupportedTaxonRank | null;
  parentGbifTaxonId: number | null;
  matchedPathName: string | undefined;
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
type GlobalNamesVerificationResponse = z.infer<typeof globalNamesVerificationResponseSchema>;

function buildGlobalNamesRequestBody(nameStrings: string[]) {
  return {
    nameStrings,
    // These relaxed options help source metadata names resolve despite common
    // qualifiers like "complex", casing drift, or incomplete uninomial names.
    withRelaxedFuzzyMatch: true,
    withCapitalization: true,
    withUninomialFuzzyMatch: true,
    dataSources: [GBIF_DATASOURCE_ID] as const
  };
}

async function resolveGbifTaxaFromNames(
  names: string[],
  options?: ResolveGbifTaxaOptions
): Promise<Map<string, ResolvedGbifTaxon | null>> {
  const resultMap = new Map<string, ResolvedGbifTaxon | null>();
  const batchSize = Math.max(1, options?.batchSize ?? (names.length || 1));

  for (let i = 0; i < names.length; i += batchSize) {
    const batch = names.slice(i, i + batchSize);
    if (batch.length === 0) continue;

    const response = await fetchGlobalNamesBatch(batch, options);
    for (const item of response.names ?? []) {
      const name = normalizeTaxonQueryName(item.name ?? '');
      if (!name) continue;
      const matches =
        item.results && item.results.length > 0
          ? item.results
          : item.bestResult
            ? [item.bestResult]
            : [];
      const resolved = resolveGlobalNamesGbifMatch(matches);
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
  options?: ResolveGbifTaxaOptions
): Promise<GlobalNamesVerificationResponse> {
  const retryAttempts = options?.retryAttempts ?? 1;

  return ky
    .post(GLOBAL_NAMES_VERIFICATION_URL, {
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

  const unresolvedNames = queryNames.filter((name) => !taxonomyResolutionCache.has(name));

  if (unresolvedNames.length > 0) {
    // Cache both hits and misses for the lifetime of a job so repeated species
    // across datasets do not repeatedly call Global Names.
    const resolvedFromApi = await resolveGbifTaxaFromNames(unresolvedNames, options);
    for (const name of unresolvedNames) {
      taxonomyResolutionCache.set(name, resolvedFromApi.get(name) ?? null);
    }
  }

  const uniqueTaxonIds = new Set<number>();
  for (const name of queryNames) {
    const resolved = taxonomyResolutionCache.get(name);
    if (!resolved) continue;

    await upsertResolvedTaxon(prisma, resolved);
    uniqueTaxonIds.add(resolved.taxon.gbifTaxonId);
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
  return cleanTaxonName(name).toLowerCase();
}

function normalizeTaxonQueryName(name: string): string {
  return cleanTaxonName(name);
}

function cleanTaxonName(name: string): string {
  return (
    name
      // Source systems often include non-taxonomic qualifiers that reduce match
      // quality against the GBIF backbone.
      .replace(/\bcomplex\b/gi, '')
      .replace(/\bmorphological group\b/gi, '')
      .replace(/\bsp\.\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function resolveGlobalNamesGbifMatch(matches: GlobalNamesMatchResult[]): ResolvedGbifTaxon | null {
  const match = findBestAcceptedGbifMatch(matches);
  if (!match) return null;

  const gbifTaxonId = parseGbifId(match.currentRecordId ?? match.recordId);
  if (!gbifTaxonId) return null;

  const classification = parseGbifClassification(match, gbifTaxonId);
  const scientificName = chooseScientificName(match, classification.matchedPathName, gbifTaxonId);

  return {
    taxon: {
      gbifTaxonId,
      scientificName,
      nameNorm: normalizeTaxonName(scientificName),
      rank: classification.matchedRank,
      parentGbifTaxonId: classification.parentGbifTaxonId,
      ...classification.lineage
    },
    ancestors: classification.taxonRows.filter((row) => row.gbifTaxonId !== gbifTaxonId)
  };
}

function findBestAcceptedGbifMatch(
  matches: GlobalNamesMatchResult[]
): GlobalNamesMatchResult | undefined {
  // The local taxonomy table is GBIF-only, so ignore other Global Names
  // datasources and synonym records even if they score highly.
  return matches
    .filter(
      (match) =>
        match.dataSourceId === GBIF_DATASOURCE_ID &&
        (match.taxonomicStatus ?? '').toLowerCase() === 'accepted' &&
        match.isSynonym === false
    )
    .sort((a, b) => (b.sortScore ?? 0) - (a.sortScore ?? 0))[0];
}

function chooseScientificName(
  match: GlobalNamesMatchResult,
  pathName: string | undefined,
  gbifTaxonId: number
): string {
  return (
    match.currentCanonicalFull ??
    match.matchedCanonicalFull ??
    match.currentCanonicalSimple ??
    match.matchedCanonicalSimple ??
    match.currentName ??
    pathName ??
    `GBIF ${gbifTaxonId}`
  );
}

function splitPipe(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split('|').map((part) => part.trim());
}

function parseGbifClassification(
  match: GlobalNamesMatchResult,
  gbifTaxonId: number
): ParsedGbifClassification {
  const pathNames = splitPipe(match.classificationPath);
  const pathRanks = splitPipe(match.classificationRanks);
  const pathIds = splitPipe(match.classificationIds);
  const { lineage, taxonRows } = buildTaxonRowsFromClassification(pathNames, pathRanks, pathIds);
  const nodeIndex = pathIds.findIndex((id) => parseGbifId(id) === gbifTaxonId);

  return {
    lineage,
    taxonRows,
    matchedRank: nodeIndex >= 0 ? toSupportedTaxonRank(pathRanks[nodeIndex]) : null,
    parentGbifTaxonId: nodeIndex > 0 ? parseGbifId(pathIds[nodeIndex - 1]) : null,
    matchedPathName: pathNames[nodeIndex]
  };
}

function buildTaxonRowsFromClassification(
  names: string[],
  ranks: string[],
  ids: string[]
): { lineage: TaxonLineage; taxonRows: TaxonUpsertRow[] } {
  const taxonRows: TaxonUpsertRow[] = [];
  let lastNumericId: number | null = null;
  const lineage: TaxonLineage = {
    kingdomId: null,
    phylumId: null,
    classId: null,
    orderId: null,
    familyId: null,
    genusId: null
  };

  for (let i = 0; i < ids.length; i += 1) {
    const gbifTaxonId = parseGbifId(ids[i]);
    if (!gbifTaxonId) continue;

    const scientificName = names[i] || `GBIF ${gbifTaxonId}`;
    const rank = toSupportedTaxonRank(ranks[i]);

    switch (rank) {
      case 'kingdom':
        lineage.kingdomId = gbifTaxonId;
        break;
      case 'phylum':
        lineage.phylumId = gbifTaxonId;
        break;
      case 'class':
        lineage.classId = gbifTaxonId;
        break;
      case 'order':
        lineage.orderId = gbifTaxonId;
        break;
      case 'family':
        lineage.familyId = gbifTaxonId;
        break;
      case 'genus':
        lineage.genusId = gbifTaxonId;
        break;
    }

    // Each row gets the lineage accumulated up to that point; those denormalized
    // IDs power "under family/genus/etc." queries without recursive SQL.
    taxonRows.push({
      gbifTaxonId,
      scientificName,
      nameNorm: normalizeTaxonName(scientificName),
      rank,
      parentGbifTaxonId: lastNumericId,
      ...lineage
    });
    lastNumericId = gbifTaxonId;
  }

  return { lineage, taxonRows };
}

function parseGbifId(value: string | null | undefined): number | null {
  if (!value) return null;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function toSupportedTaxonRank(rank: string | null | undefined): SupportedTaxonRank | null {
  if (!rank) return null;
  const normalized = rank.trim().toLowerCase();

  return supportedTaxonRankSet.has(normalized) ? (normalized as SupportedTaxonRank) : null;
}

async function upsertResolvedTaxon(
  prisma: ReturnType<typeof createPrismaClient>,
  resolved: ResolvedGbifTaxon
): Promise<void> {
  for (const ancestor of resolved.ancestors) {
    await upsertTaxonRow(prisma, ancestor);
  }

  await upsertTaxonRow(prisma, resolved.taxon);
}

async function upsertTaxonRow(
  prisma: ReturnType<typeof createPrismaClient>,
  row: TaxonUpsertRow
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
