import { createPrismaClient } from '@vbdhub/db';

const GBIF_DATASOURCE_ID = 11;

export type SupportedTaxonRank =
  | 'kingdom'
  | 'phylum'
  | 'class'
  | 'order'
  | 'family'
  | 'genus'
  | 'species'
  | 'subspecies';

export interface GlobalNamesMatchResult {
  dataSourceId?: number | undefined;
  sortScore?: number | undefined;
  taxonomicStatus?: string | null | undefined;
  isSynonym?: boolean | undefined;
  recordId?: string | null | undefined;
  currentRecordId?: string | null | undefined;
  currentCanonicalSimple?: string | null | undefined;
  currentCanonicalFull?: string | null | undefined;
  matchedCanonicalSimple?: string | null | undefined;
  matchedCanonicalFull?: string | null | undefined;
  currentName?: string | null | undefined;
  classificationPath?: string | null | undefined;
  classificationRanks?: string | null | undefined;
  classificationIds?: string | null | undefined;
}

export interface GlobalNamesNameResult {
  name?: string | null | undefined;
  results?: GlobalNamesMatchResult[] | undefined;
  bestResult?: GlobalNamesMatchResult | undefined;
}

export interface GlobalNamesVerificationResponse {
  names?: GlobalNamesNameResult[] | undefined;
}

export interface ResolvedGbifTaxon {
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

export function buildGlobalNamesRequestBody(nameStrings: string[]): {
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

export async function resolveGbifTaxaFromNames(
  names: string[],
  signal: AbortSignal,
  fetchBatch: (
    batchNames: string[],
    signal: AbortSignal
  ) => Promise<GlobalNamesVerificationResponse>,
  options?: {
    batchSize?: number;
  }
): Promise<Map<string, ResolvedGbifTaxon | null>> {
  const resultMap = new Map<string, ResolvedGbifTaxon | null>();
  const batchSize = Math.max(1, options?.batchSize ?? (names.length || 1));

  for (let i = 0; i < names.length; i += batchSize) {
    const batch = names.slice(i, i + batchSize);
    if (batch.length === 0) continue;

    const response = await fetchBatch(batch, signal);
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

export async function linkDatasetTaxa(
  prisma: ReturnType<typeof createPrismaClient>,
  datasetId: string,
  speciesNames: string[],
  signal: AbortSignal,
  taxonomyResolutionCache: Map<string, ResolvedGbifTaxon | null>,
  resolveTaxa: (
    names: string[],
    signal: AbortSignal
  ) => Promise<Map<string, ResolvedGbifTaxon | null>>
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
    const resolvedFromApi = await resolveTaxa(unresolvedNames, signal);
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

export function normalizeTaxonName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bcomplex\b/g, '')
    .replace(/\bmorphological group\b/g, '')
    .replace(/\bsp\.\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeTaxonQueryName(name: string): string {
  return name
    .replace(/\bcomplex\b/gi, '')
    .replace(/\bmorphological group\b/gi, '')
    .replace(/\bsp\.\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseGlobalNamesGbifMatch(
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

export function splitPipe(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split('|').map((part) => part.trim());
}

export function extractLineageIds(
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

export function extractAncestryRows(
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

export function parseGbifId(value: string | null | undefined): number | null {
  if (!value) return null;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export function toSupportedTaxonRank(
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

export async function upsertResolvedTaxon(
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
