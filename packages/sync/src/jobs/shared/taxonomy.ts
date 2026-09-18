import { createPrismaClient } from '@vbdhub/db';
import ky from 'ky';
import { z } from 'zod';

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

interface ResolvedGbifTaxon {
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

// Global Names API returns empty strings for some fields when they are not available,
// but we want to treat those as undefined in our TypeScript types. This schema transforms empty strings to undefined.
const emptyStringToUndefinedSchema = z
  .string()
  .trim()
  .transform((value) => value || undefined);

const globalNamesMatchResultSchema = z.object({
  dataSourceId: z.int(),
  sortScore: z.number(),
  taxonomicStatus: z.enum(['Accepted', 'Synonym', 'N/A']),
  currentRecordId: emptyStringToUndefinedSchema,
  currentCanonicalSimple: emptyStringToUndefinedSchema,
  currentCanonicalFull: emptyStringToUndefinedSchema,
  matchedCanonicalSimple: emptyStringToUndefinedSchema.optional(),
  matchedCanonicalFull: emptyStringToUndefinedSchema.optional(),
  currentName: emptyStringToUndefinedSchema,
  classificationPath: emptyStringToUndefinedSchema.optional(),
  classificationRanks: emptyStringToUndefinedSchema.optional(),
  classificationIds: emptyStringToUndefinedSchema.optional()
});

const globalNamesVerificationResponseSchema = z.object({
  names: z.array(
    z.object({
      name: z.string().trim().min(1),
      results: z.array(globalNamesMatchResultSchema).default([]),
      bestResults: z.array(globalNamesMatchResultSchema).default([]),
      bestResult: globalNamesMatchResultSchema.optional()
    })
  )
});

type GlobalNamesMatchResult = z.infer<typeof globalNamesMatchResultSchema>;
type GlobalNamesVerificationResponse = z.infer<typeof globalNamesVerificationResponseSchema>;

async function resolveGbifTaxaFromNames(
  names: string[],
  options?: ResolveGbifTaxaOptions
): Promise<Map<string, ResolvedGbifTaxon | null>> {
  const resultMap = new Map<string, ResolvedGbifTaxon | null>();
  const batchSize = Math.max(1, options?.batchSize ?? 1000);

  for (let i = 0; i < names.length; i += batchSize) {
    const batch = names.slice(i, i + batchSize);
    const response = await fetchGlobalNamesBatch(batch, options);
    if (response.names.length !== batch.length) {
      throw new Error(`GN returned ${response.names.length} results for ${batch.length} names`);
    }

    for (const item of response.names) {
      const name = stripQualifiersFromTaxonName(item.name);
      if (!name) continue;

      let matches = item.results;
      if (matches.length === 0) matches = item.bestResults;
      if (matches.length === 0 && item.bestResult) matches = [item.bestResult];

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
      json: {
        nameStrings,
        // withRelaxedFuzzyMatch: true,
        withCapitalization: true,
        // withUninomialFuzzyMatch: true,
        dataSources: [GBIF_DATASOURCE_ID]
      },
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

export function createDatasetTaxaLinker(
  prisma: ReturnType<typeof createPrismaClient>,
  options?: ResolveGbifTaxaOptions
): (datasetId: string, speciesNames: string[]) => Promise<number> {
  // Caches resolved taxa for the lifetime of a job so repeated species across datasets do not repeatedly call Global Names API
  const taxonResolutionCache = new Map<string, ResolvedGbifTaxon | null>();
  // Caches persisted taxa IDs for the lifetime of a job so repeated matched species across datasets do not repeatedly upsert the same taxon
  const persistedTaxonIds = new Set<number>();

  // Links are additive: existing dataset-taxon links are retained when names disappear.
  return async function linkDatasetTaxa(datasetId, speciesNames) {
    if (speciesNames.length === 0) return 0;

    const cleanedNames = Array.from(
      new Set(
        speciesNames
          .map(stripQualifiersFromTaxonName)
          .filter((name) => name.length > 0 && name.toUpperCase() !== 'BLANK')
      )
    );
    if (cleanedNames.length === 0) return 0;

    const unresolvedNames = cleanedNames.filter((name) => !taxonResolutionCache.has(name));

    // If we have any unresolved names, we need to resolve them first
    if (unresolvedNames.length > 0) {
      const resolvedNames = await resolveGbifTaxaFromNames(unresolvedNames, options);
      for (const name of unresolvedNames) {
        taxonResolutionCache.set(name, resolvedNames.get(name) ?? null);
      }
    }

    const uniqueTaxonIds = new Set<number>();
    for (const name of cleanedNames) {
      const resolvedTaxon = taxonResolutionCache.get(name);
      if (!resolvedTaxon) continue;

      const { gbifTaxonId } = resolvedTaxon.taxon;

      if (!persistedTaxonIds.has(gbifTaxonId)) {
        // Creates or updates the taxon and its ancestors in the local taxonomy table, so that
        // the dataset-taxon link can be created
        await upsertResolvedTaxon(prisma, resolvedTaxon);
        persistedTaxonIds.add(gbifTaxonId);
      }

      uniqueTaxonIds.add(gbifTaxonId);
    }

    if (uniqueTaxonIds.size === 0) return 0;

    // Create missing dataset-taxon links in bulk, skipping duplicates
    await prisma.datasetTaxon.createMany({
      data: Array.from(uniqueTaxonIds, (gbifTaxonId) => ({
        datasetId,
        gbifTaxonId
      })),
      skipDuplicates: true
    });

    return uniqueTaxonIds.size;
  };
}

function normalizeTaxonSearchName(name: string): string {
  return stripQualifiersFromTaxonName(name).toLowerCase();
}

function stripQualifiersFromTaxonName(name: string): string {
  return (
    name
      // These source qualifiers reduce matching quality against the GBIF backbone.
      .replace(/\bcomplex\b/gi, '') // converts e.g. "Asteraceae complex" to "Asteraceae"
      .replace(/\bmorphological group\b/gi, '') // converts e.g. "Asteraceae morphological group" to "Asteraceae"
      .replace(/\bsp\./gi, '') // converts e.g. "Asteraceae sp." to "Asteraceae"
      .replace(/\s+/g, ' ') // collapse multiple spaces
      .trim() // trim leading/trailing spaces
  );
}

function resolveGlobalNamesGbifMatch(matches: GlobalNamesMatchResult[]): ResolvedGbifTaxon | null {
  const match = findBestAcceptedGbifMatch(matches);
  if (!match) return null;

  const gbifTaxonId = parseGbifId(match.currentRecordId);
  if (!gbifTaxonId) return null;

  const classification = parseGbifClassification(match, gbifTaxonId);
  const scientificName = chooseScientificName(match, classification.matchedPathName, gbifTaxonId);

  return {
    taxon: {
      gbifTaxonId,
      scientificName,
      nameNorm: normalizeTaxonSearchName(scientificName),
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
  return matches
    .filter((match) => {
      if (match.dataSourceId !== GBIF_DATASOURCE_ID) return false;

      return (
        match.taxonomicStatus === 'Accepted' ||
        (match.taxonomicStatus === 'Synonym' && parseGbifId(match.currentRecordId) !== null)
      );
    })
    .sort((a, b) => b.sortScore - a.sortScore)[0];
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

function splitPipe(value?: string): string[] {
  return value?.split('|').map((part) => part.trim()) ?? [];
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
      nameNorm: normalizeTaxonSearchName(scientificName),
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
