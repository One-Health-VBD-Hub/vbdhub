import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import {
  SEARCH_QUERY_MODES,
  SearchQueryMode,
  SearchValidationError
} from '../../services/search/search.service';
import { buildCacheKey } from '../../common/cache-key';

const MAX_LIMIT = 50;
const MAX_WINDOW = 10_000;
const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;
const SEARCH_CACHE_TTL_MS = 60_000;

const DATASET_CATEGORIES = [
  'occurrence',
  'abundance',
  'traits',
  'proteomics',
  'epidemiology'
] as const;

const SOURCE_DBS = [
  'gbif',
  'proteomexchange',
  'vecdyn',
  'vectraits',
  'hub'
] as const;

const WKT_GEOMETRY_REGEX = /^(POLYGON|MULTIPOLYGON)\s*\(.+\)$/i;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const WKT_GEOMETRY_PATTERN =
  '^(?:$|(?:[Pp][Oo][Ll][Yy][Gg][Oo][Nn]|[Mm][Uu][Ll][Tt][Ii][Pp][Oo][Ll][Yy][Gg][Oo][Nn])\\s*\\(.+\\))$';

const searchRequestBodySchema = {
  type: 'object',
  properties: {
    query: { type: 'string', minLength: 1, maxLength: 500 },
    queryMode: {
      type: 'string',
      enum: [...SEARCH_QUERY_MODES],
      default: 'fulltext'
    },
    page: { type: 'integer', minimum: 1, default: DEFAULT_PAGE },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: MAX_LIMIT,
      default: DEFAULT_LIMIT
    },
    category: {
      type: 'array',
      items: { type: 'string', enum: [...DATASET_CATEGORIES] },
      uniqueItems: true,
      maxItems: 20
    },
    sourceDb: {
      type: 'array',
      items: { type: 'string', enum: [...SOURCE_DBS] },
      uniqueItems: true,
      maxItems: 20
    },
    publishedFrom: { type: 'string', format: 'date' },
    publishedTo: { type: 'string', format: 'date' },
    includeWithoutPublished: { type: 'boolean', default: false },
    geometry: {
      type: 'string',
      maxLength: 200_000,
      pattern: WKT_GEOMETRY_PATTERN
    },
    taxonomyGbifIds: {
      type: 'array',
      items: { type: 'integer', minimum: 1 },
      uniqueItems: true,
      maxItems: 500
    }
  },
  additionalProperties: false
} as const;

const searchResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'meta'],
  properties: {
    items: {
      type: 'array',
      maxItems: MAX_LIMIT,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'sourceKey', 'sourceDb', 'category', 'title'],
        properties: {
          id: { type: 'string', minLength: 1 },
          sourceKey: { type: 'string', minLength: 1 },
          sourceDb: { type: 'string', enum: [...SOURCE_DBS] },
          category: { type: 'string', enum: [...DATASET_CATEGORIES] },
          title: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          doi: { type: 'string', maxLength: 2_048 },
          publisher: { type: 'string' },
          publishedAt: { type: 'string', format: 'date-time' }
        }
      }
    },
    meta: {
      type: 'object',
      additionalProperties: false,
      required: [
        'page',
        'limit',
        'total',
        'totalPages',
        'hasNextPage',
        'hasPreviousPage'
      ],
      properties: {
        page: { type: 'integer', minimum: 1 },
        limit: { type: 'integer', minimum: 1, maximum: MAX_LIMIT },
        total: { type: 'integer', minimum: 0 },
        totalPages: { type: 'integer', minimum: 0 },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' }
      }
    }
  }
} as const;

const normalizeQuery = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw new SearchValidationError('query must be a string');
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseDateOnly = (value: unknown, fieldName: string): Date | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !ISO_DATE_REGEX.test(value)) {
    throw new SearchValidationError(
      `${fieldName} must be a valid ISO 8601 (YYYY-MM-DD) date string`
    );
  }

  // Parse as UTC midnight so date filters behave consistently across timezones.
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new SearchValidationError(
      `${fieldName} must be a valid ISO 8601 (YYYY-MM-DD) date string`
    );
  }

  return parsed;
};

const normalizeWkt = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new SearchValidationError('geometry must be a string');
  }

  const normalized = value.trim();
  // Cheap structural validation at route boundary; PostGIS does full validation.
  if (!WKT_GEOMETRY_REGEX.test(normalized)) {
    throw new SearchValidationError(
      'geometry must be a valid WKT Polygon or MultiPolygon'
    );
  }

  return normalized;
};

const searchNewRoute: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: searchRequestBodySchema,
        response: {
          200: searchResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const page = request.body.page ?? DEFAULT_PAGE;
        const limit = request.body.limit ?? DEFAULT_LIMIT;

        // Keep offset pagination bounded to avoid deep, expensive scans.
        if (limit * page > MAX_WINDOW) {
          throw new SearchValidationError(
            `limit * page must be <= ${MAX_WINDOW}. Refine your query or filters.`
          );
        }

        const query = normalizeQuery(request.body.query);
        const queryMode: SearchQueryMode = request.body.queryMode ?? 'fulltext';
        const publishedFrom = parseDateOnly(
          request.body.publishedFrom,
          'publishedFrom'
        );
        const publishedTo = parseDateOnly(
          request.body.publishedTo,
          'publishedTo'
        );

        if (publishedFrom && publishedTo && publishedFrom > publishedTo) {
          throw new SearchValidationError(
            'publishedFrom must be earlier than or equal to publishedTo'
          );
        }

        const category = request.body.category;
        const sourceDb = request.body.sourceDb;
        const taxonomyGbifIds = request.body.taxonomyGbifIds;
        const geometry = normalizeWkt(request.body.geometry);
        const includeWithoutPublished = request.body.includeWithoutPublished;

        const cacheKey = buildCacheKey('search-new', {
          query,
          queryMode,
          page,
          limit,
          category,
          sourceDb,
          publishedFrom,
          publishedTo,
          includeWithoutPublished,
          geometry,
          taxonomyGbifIds
        });

        const cached = await fastify.cache.get(cacheKey);
        if (cached !== undefined) {
          reply.header('x-cache', 'HIT');
          return cached;
        }

        const response = await fastify.searchService.search({
          query,
          queryMode,
          page,
          limit,
          category,
          sourceDb,
          publishedFrom,
          publishedTo,
          includeWithoutPublished,
          geometry,
          taxonomyGbifIds
        });

        await fastify.cache.set(cacheKey, response, SEARCH_CACHE_TTL_MS);
        reply.header('x-cache', 'MISS');

        return response;
      } catch (error) {
        // Surface expected validation failures as 400 responses.
        if (error instanceof SearchValidationError) {
          throw fastify.httpErrors.badRequest(error.message);
        }
        throw error;
      }
    }
  );
};

export default searchNewRoute;
