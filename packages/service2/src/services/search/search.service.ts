import { PrismaClient } from '@vbdhub/db';
import type { DatasetCategory, Prisma, SourceDb } from '@prisma/client';

const MAX_TEXT_MATCH_CANDIDATES = 50_000;

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
  country?: string[];
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

const normalizeInclusiveDateUpperBound = (date: Date): Date => {
  // Build an exclusive upper bound at next-day midnight to keep date filtering inclusive.
  const upperBound = new Date(date);
  upperBound.setUTCDate(upperBound.getUTCDate() + 1);
  upperBound.setUTCHours(0, 0, 0, 0);
  return upperBound;
};

const emptyResult = ({ page, limit }: SearchInput): SearchResult => ({
  items: [],
  meta: {
    page,
    limit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: page > 1
  }
});

export const buildSearchService = ({ prisma }: { prisma: PrismaClient }) => {
  const search = async (input: SearchInput): Promise<SearchResult> => {
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
        if (!fullTextMatchIds.length) return emptyResult(input);
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
      andConditions.push({
        taxa: {
          some: {
            gbifTaxonId: {
              in: input.taxonomyGbifIds
            }
          }
        }
      });
    }

    if (input.country?.length) {
      // Country can be present in different raw metadata keys across source datasets.
      const countryFilters: Prisma.DatasetWhereInput[] = input.country.flatMap(
        (country) => [
          {
            raw: {
              path: ['country'],
              string_contains: country,
              mode: 'insensitive'
            }
          },
          {
            raw: {
              path: ['countryCoverage'],
              string_contains: country,
              mode: 'insensitive'
            }
          },
          {
            raw: {
              path: ['countries'],
              string_contains: country,
              mode: 'insensitive'
            }
          }
        ]
      );

      if (countryFilters.length) andConditions.push({ OR: countryFilters });
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
      if (!intersectingIds.length) return emptyResult(input);
      andConditions.push({ id: { in: intersectingIds.map((row) => row.id) } });
    }

    const where: Prisma.DatasetWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};
    const skip = (input.page - 1) * input.limit;

    // Execute count + page query in one transaction for consistency.
    const [total, datasets] = await prisma.$transaction([
      prisma.dataset.count({ where }),
      prisma.dataset.findMany({
        where,
        skip,
        take: input.limit,
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

    const totalPages = Math.ceil(total / input.limit);

    return {
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
      })),
      meta: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages,
        hasNextPage: totalPages > 0 && input.page < totalPages,
        hasPreviousPage: input.page > 1
      }
    };
  };

  return { search };
};

export type SearchService = ReturnType<typeof buildSearchService>;
