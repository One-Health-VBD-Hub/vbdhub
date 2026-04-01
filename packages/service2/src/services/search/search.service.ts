import { PrismaClient } from '@vbdhub/db';
import type { DatasetCategory, Prisma, SourceDb } from '@prisma/client';
import type Keyv from 'keyv';
import { normalizeWktForGbif } from './geometry';
import {
  getCachedGbifDatasetDetail,
  type DatasetDetail
} from '../datasets/datasets.service';

const MAX_TEXT_MATCH_CANDIDATES = 50_000;
const GBIF_API_BASE_URL = 'https://api.gbif.org/v1/';
const GBIF_REQUEST_TIMEOUT_MS = 10_000;
const GBIF_OCCURRENCE_FACET_LIMIT = 1_200_000;
const GBIF_DETAIL_CONCURRENCY = 8;
const GBIF_OCCURRENCE_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const TAXON_DESCENDANT_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export const SEARCH_QUERY_MODES = ['fulltext', 'contains', 'exact'] as const;
export type SearchQueryMode = (typeof SEARCH_QUERY_MODES)[number];

export class SearchValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SearchValidationError';
  }
}

export interface SearchInput {
  query?: string;
  queryMode?: SearchQueryMode;
  page: number;
  limit: number;
  category?: DatasetCategory[];
  sourceDb?: SourceDb[];
  publishedFrom?: Date;
  publishedTo?: Date;
  includeWithoutPublished?: boolean;
  geometry?: string;
  taxonomyGbifIds?: number[];
}

export interface SearchDatasetResultItem {
  [key: string]: unknown;
  id: string;
  sourceKey: string;
  sourceDb: SourceDb;
  category: DatasetCategory;
  title: string;
  description?: string;
  doi?: string;
  publisher?: string;
  publishedAt?: string;
}

export interface SearchResult {
  [key: string]: unknown;
  items: SearchDatasetResultItem[];
  meta: {
    [key: string]: unknown;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ProviderWindow {
  skip: number;
  take: number;
}

interface ProviderResult {
  items: SearchDatasetResultItem[];
  total: number;
}

interface GbifOccurrenceFacetCount {
  name: string;
}

interface GbifOccurrenceSearchResponse {
  count?: number;
  facets?: Array<{
    counts?: GbifOccurrenceFacetCount[];
  }>;
}

const normalizeInclusiveDateUpperBound = (date: Date): Date => {
  // Build an exclusive upper bound at next-day midnight to keep date filtering inclusive.
  const upperBound = new Date(date);
  upperBound.setUTCDate(upperBound.getUTCDate() + 1);
  upperBound.setUTCHours(0, 0, 0, 0);
  return upperBound;
};

const toMeta = ({
  page,
  limit,
  total
}: {
  page: number;
  limit: number;
  total: number;
}) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: totalPages > 0 && page < totalPages,
    hasPreviousPage: page > 1
  };
};

const emptyProviderResult = (): ProviderResult => ({ items: [], total: 0 });

const toIsoDateStringOrUndefined = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

const mapGbifDatasetToResult = ({
  key,
  detail
}: {
  key: string;
  detail?: DatasetDetail | null;
}): SearchDatasetResultItem => ({
  id: `gbif:${key}`,
  sourceKey: key,
  sourceDb: 'gbif',
  category: 'occurrence',
  title: detail?.title || 'Untitled dataset',
  description: detail?.description ?? undefined,
  doi: detail?.doi ?? undefined,
  publisher: detail?.publisher ?? undefined,
  publishedAt: toIsoDateStringOrUndefined(detail?.publishedAt)
});

const formatGbifModifiedRange = ({
  publishedFrom,
  publishedTo
}: {
  publishedFrom: Date | undefined;
  publishedTo: Date | undefined;
}): string | undefined => {
  if (!publishedFrom && !publishedTo) return undefined;

  const from = publishedFrom ? publishedFrom.toISOString().slice(0, 10) : '*';
  const to = publishedTo ? publishedTo.toISOString().slice(0, 10) : '*';
  return `${from},${to}`;
};

const fetchGbifJson = async <T>(
  url: URL,
  options?: { allow404?: boolean }
): Promise<T | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GBIF_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json' }
    });

    if (options?.allow404 && response.status === 404) {
      return null;
    }

    if (response.status === 400) {
      throw new SearchValidationError(
        'GBIF rejected search filters. Refine query, geometry, taxonomy, or date filters.'
      );
    }

    if (!response.ok) {
      throw new Error(`GBIF request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
};

const mapWithConcurrency = async <T, R>({
  values,
  concurrency,
  mapper
}: {
  values: T[];
  concurrency: number;
  mapper: (value: T) => Promise<R>;
}): Promise<R[]> => {
  if (values.length === 0) return [];

  const results = new Array<R>(values.length);
  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      if (currentIndex >= values.length) return;
      results[currentIndex] = await mapper(values[currentIndex]);
    }
  };

  const workers = Array.from(
    { length: Math.min(concurrency, values.length) },
    () => worker()
  );
  await Promise.all(workers);

  return results;
};

export const buildSearchService = ({
  prisma,
  cache
}: {
  prisma: PrismaClient;
  cache: Keyv;
}) => {
  const expandTaxonomyGbifIds = async (
    taxonomyGbifIds: number[]
  ): Promise<number[]> => {
    const normalizedTaxonomyGbifIds = [...new Set(taxonomyGbifIds)].sort(
      (a, b) => a - b
    );
    const cacheKey = `search:taxonomy:expanded:${normalizedTaxonomyGbifIds.join(',')}`;
    const cached = await cache.get<number[]>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const matchingTaxa = await prisma.taxon.findMany({
      where: {
        OR: [
          { gbifTaxonId: { in: normalizedTaxonomyGbifIds } },
          { kingdomId: { in: normalizedTaxonomyGbifIds } },
          { phylumId: { in: normalizedTaxonomyGbifIds } },
          { classId: { in: normalizedTaxonomyGbifIds } },
          { orderId: { in: normalizedTaxonomyGbifIds } },
          { familyId: { in: normalizedTaxonomyGbifIds } },
          { genusId: { in: normalizedTaxonomyGbifIds } }
        ]
      },
      select: {
        gbifTaxonId: true
      }
    });

    const expandedTaxonomyGbifIds = [...new Set(matchingTaxa.map((taxon) => taxon.gbifTaxonId))]
      .sort((a, b) => a - b);
    await cache.set(cacheKey, expandedTaxonomyGbifIds, TAXON_DESCENDANT_CACHE_TTL_MS);
    return expandedTaxonomyGbifIds;
  };

  const searchLocalProvider = async ({
    input,
    window
  }: {
    input: SearchInput;
    window: ProviderWindow;
  }): Promise<ProviderResult> => {
    if (input.sourceDb && input.sourceDb.length === 0) {
      return emptyProviderResult();
    }

    // Build filters incrementally so each optional criterion composes with AND semantics.
    const andConditions: Prisma.DatasetWhereInput[] = [];

    if (input.query) {
      if (input.queryMode === 'fulltext') {
        let fullTextMatchIds: { id: string }[];
        try {
          // Use PostgreSQL FTS for ranking-ready token search over key text fields.
          fullTextMatchIds = await prisma.$queryRaw<{ id: string }[]>`
            SELECT "id"
            FROM "Dataset"
            WHERE to_tsvector(
              'english',
              concat_ws(
                ' ',
                coalesce("title", ''),
                coalesce("description", ''),
                coalesce("publisher", ''),
                coalesce("doi", ''),
                coalesce("sourceKey", '')
              )
            ) @@ websearch_to_tsquery('english', ${input.query})
            LIMIT ${MAX_TEXT_MATCH_CANDIDATES}
          `;
        } catch {
          // Invalid tsquery syntax should be a client error, not an internal failure.
          throw new SearchValidationError(
            'query is not valid for full-text search'
          );
        }

        // Short-circuit avoids running count/findMany when FTS produced no candidates.
        if (!fullTextMatchIds.length) return emptyProviderResult();
        andConditions.push({ id: { in: fullTextMatchIds.map((row) => row.id) } });
      } else {
        const stringFilter =
          input.queryMode === 'exact'
            ? { equals: input.query, mode: 'insensitive' as const }
            : { contains: input.query, mode: 'insensitive' as const };

        andConditions.push({
          OR: [
            { title: stringFilter },
            { description: stringFilter },
            { publisher: stringFilter },
            { doi: stringFilter },
            { sourceKey: stringFilter }
          ]
        });
      }
    }

    if (input.category?.length) {
      andConditions.push({ category: { in: input.category } });
    }

    if (input.sourceDb?.length) {
      andConditions.push({ sourceDb: { in: input.sourceDb } });
    }

    if (input.publishedFrom || input.publishedTo) {
      const range: Prisma.DateTimeNullableFilter<'Dataset'> = {};
      if (input.publishedFrom) range.gte = input.publishedFrom;
      // `lt next day` implements an inclusive `publishedTo` for date-only inputs.
      if (input.publishedTo)
        range.lt = normalizeInclusiveDateUpperBound(input.publishedTo);

      if (input.includeWithoutPublished) {
        andConditions.push({
          OR: [{ publishedAt: range }, { publishedAt: null }]
        });
      } else {
        andConditions.push({ publishedAt: range });
      }
    }

    if (input.taxonomyGbifIds?.length) {
      const expandedTaxonomyGbifIds = await expandTaxonomyGbifIds(
        input.taxonomyGbifIds
      );
      if (!expandedTaxonomyGbifIds.length) return emptyProviderResult();

      andConditions.push({
        taxa: {
          some: {
            gbifTaxonId: {
              in: expandedTaxonomyGbifIds
            }
          }
        }
      });
    }

    if (input.geometry) {
      let intersectingIds: { id: string }[];
      try {
        // Spatial filtering is delegated to PostGIS using intersection semantics.
        intersectingIds = await prisma.$queryRaw<{ id: string }[]>`
          SELECT "id"
          FROM "Dataset"
          WHERE "spatialGeom" IS NOT NULL
            AND ST_Intersects(
              "spatialGeom",
              ST_SetSRID(ST_GeomFromText(${input.geometry}), 4326)
            )
        `;
      } catch {
        throw new SearchValidationError(
          'geometry must be a valid WKT Polygon or MultiPolygon'
        );
      }

      // No spatial hits means no need to execute paginated query.
      if (!intersectingIds.length) return emptyProviderResult();
      andConditions.push({ id: { in: intersectingIds.map((row) => row.id) } });
    }

    const where: Prisma.DatasetWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    if (window.take <= 0) {
      return {
        total: await prisma.dataset.count({ where }),
        items: []
      };
    }

    // Execute count + page query in one transaction for consistency.
    const [total, datasets] = await prisma.$transaction([
      prisma.dataset.count({ where }),
      prisma.dataset.findMany({
        where,
        skip: window.skip,
        take: window.take,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          sourceKey: true,
          sourceDb: true,
          category: true,
          title: true,
          description: true,
          doi: true,
          publisher: true,
          publishedAt: true
        }
      })
    ]);

    return {
      total,
      items: datasets.map((dataset) => ({
        id: dataset.id,
        sourceKey: dataset.sourceKey,
        sourceDb: dataset.sourceDb,
        category: dataset.category,
        title: dataset.title?.trim() || 'Untitled dataset',
        description: dataset.description ?? undefined,
        doi: dataset.doi ?? undefined,
        publisher: dataset.publisher ?? undefined,
        publishedAt: dataset.publishedAt?.toISOString()
      }))
    };
  };

  const fetchGbifOccurrenceDatasetKeys = async ({
    input
  }: {
    input: SearchInput;
  }): Promise<string[]> => {
    const query = input.query?.trim();
    const gbifGeometry = input.geometry
      ? normalizeWktForGbif(input.geometry)
      : undefined;
    const modifiedRange = formatGbifModifiedRange({
      publishedFrom: input.publishedFrom,
      publishedTo: input.publishedTo
    });
    const taxonomy = input.taxonomyGbifIds?.length
      ? [...input.taxonomyGbifIds].sort((a, b) => a - b).join(',')
      : '';
    const cacheKey = [
      `q=${query ?? ''}`,
      `geometry=${gbifGeometry ?? ''}`,
      `modified=${modifiedRange ?? ''}`,
      `taxonomy=${taxonomy}`
    ].join('|');
    const scopedCacheKey = `search:gbif:occurrence-keys:${cacheKey}`;

    const cached = await cache.get<string[]>(scopedCacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const seen = new Set<string>();

    const url = new URL('occurrence/search', GBIF_API_BASE_URL);
    url.searchParams.set('limit', '0');
    url.searchParams.set('facet', 'datasetKey');
    url.searchParams.set('facetLimit', String(GBIF_OCCURRENCE_FACET_LIMIT));
    // Keep GBIF results spatially usable by requiring coordinate-bearing occurrences.
    url.searchParams.set('hasCoordinate', 'true');
    // Occurrence API supports free-text q only; exact/contains modes are treated as q.
    if (query) url.searchParams.set('q', query);
    if (gbifGeometry) url.searchParams.set('geometry', gbifGeometry);
    // Approximate publishedFrom/publishedTo using occurrence "modified" range.
    if (modifiedRange) url.searchParams.set('modified', modifiedRange);
    input.taxonomyGbifIds?.forEach((taxonId) =>
      url.searchParams.append('taxonKey', String(taxonId))
    );

    const response = await fetchGbifJson<GbifOccurrenceSearchResponse>(url);
    const counts = response?.facets?.[0]?.counts ?? [];
    for (const count of counts) {
      if (!count.name) continue;
      seen.add(count.name);
    }

    const result = Array.from(seen);
    await cache.set(scopedCacheKey, result, GBIF_OCCURRENCE_CACHE_TTL_MS);
    return result;
  };

  const fetchGbifDatasetDetail = (key: string): Promise<DatasetDetail | null> =>
    getCachedGbifDatasetDetail({ cache, sourceKey: key });

  const searchGbifProvider = async ({
    input,
    window
  }: {
    input: SearchInput;
    window: ProviderWindow;
  }): Promise<ProviderResult> => {
    if (input.category?.length && !input.category.includes('occurrence')) {
      return emptyProviderResult();
    }

    const allDatasetKeys = await fetchGbifOccurrenceDatasetKeys({ input });
    if (allDatasetKeys.length === 0) return emptyProviderResult();

    const pageKeys =
      window.take > 0
        ? allDatasetKeys.slice(window.skip, window.skip + window.take)
        : [];

    const details = await mapWithConcurrency({
      values: pageKeys,
      concurrency: GBIF_DETAIL_CONCURRENCY,
      mapper: async (key) => fetchGbifDatasetDetail(key)
    });

    return {
      total: allDatasetKeys.length,
      items: pageKeys.map((key, index) =>
        mapGbifDatasetToResult({
          key,
          detail: details[index]
        })
      )
    };
  };

  const search = async (input: SearchInput): Promise<SearchResult> => {
    const skip = (input.page - 1) * input.limit;
    const gbifRequested = !input.sourceDb || input.sourceDb.includes('gbif');
    const localRequested =
      !input.sourceDb || input.sourceDb.some((db) => db !== 'gbif');

    const nonGbifSourceDbs = input.sourceDb?.filter((db) => db !== 'gbif');
    const localInput: SearchInput = {
      ...input,
      sourceDb:
        localRequested && input.sourceDb
          ? nonGbifSourceDbs && nonGbifSourceDbs.length > 0
            ? nonGbifSourceDbs
            : []
          : undefined
    };

    if (!gbifRequested) {
      const local = await searchLocalProvider({
        input: localInput,
        window: { skip, take: input.limit }
      });
      return {
        items: local.items,
        meta: toMeta({
          page: input.page,
          limit: input.limit,
          total: local.total
        })
      };
    }

    if (!localRequested) {
      const gbifOnly = await searchGbifProvider({
        input,
        window: { skip, take: input.limit }
      });
      return {
        items: gbifOnly.items,
        meta: toMeta({
          page: input.page,
          limit: input.limit,
          total: gbifOnly.total
        })
      };
    }

    // Mixed-source pagination uses a deterministic source-priority ordering:
    // local provider first, then GBIF provider.
    const local = await searchLocalProvider({
      input: localInput,
      window: { skip, take: input.limit }
    });

    let gbifWindow: ProviderWindow = { skip: 0, take: 0 };
    if (skip >= local.total) {
      gbifWindow = { skip: skip - local.total, take: input.limit };
    } else {
      gbifWindow = { skip: 0, take: Math.max(0, input.limit - local.items.length) };
    }

    const gbif = await searchGbifProvider({
      input,
      window: gbifWindow
    });

    const total = local.total + gbif.total;
    const items =
      skip >= local.total ? gbif.items : [...local.items, ...gbif.items];

    return {
      items,
      meta: toMeta({
        page: input.page,
        limit: input.limit,
        total
      })
    };
  };

  return { search };
};

export type SearchService = ReturnType<typeof buildSearchService>;
