import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import type { DatasetCategory, SourceDb } from '@prisma/client';
import {
  SEARCH_QUERY_MODES,
  SearchQueryMode,
  SearchValidationError
} from '../../services/search/search.service';

const MAX_LIMIT = 50;
const MAX_WINDOW = 10_000;
const DEFAULT_LIMIT = 20;
const DEFAULT_PAGE = 1;

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

const searchRequestBodySchema = {
  type: 'object',
  properties: {
    query: { type: 'string', minLength: 1, maxLength: 500 },
    queryMode: { type: 'string', enum: [...SEARCH_QUERY_MODES] },
    page: { type: 'integer', minimum: 1, default: DEFAULT_PAGE },
    limit: { type: 'integer', minimum: 1, maximum: MAX_LIMIT, default: DEFAULT_LIMIT },
    category: {
      type: 'array',
      items: { type: 'string', enum: [...DATASET_CATEGORIES] },
      maxItems: 20
    },
    sourceDb: {
      type: 'array',
      items: { type: 'string', enum: [...SOURCE_DBS] },
      maxItems: 20
    },
    publishedFrom: { type: 'string', format: 'date' },
    publishedTo: { type: 'string', format: 'date' },
    includeWithoutPublished: { type: 'boolean' },
    geometry: { type: 'string', maxLength: 200_000 },
    country: {
      type: 'array',
      items: { type: 'string', minLength: 1, maxLength: 100 },
      maxItems: 200
    },
    taxonomyGbifIds: {
      type: 'array',
      items: { type: 'integer', minimum: 1 },
      maxItems: 500
    }
  },
  additionalProperties: false
} as const;

const searchResponseSchema = {
  type: 'object',
  required: ['items', 'meta'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'sourceKey', 'sourceDb', 'category', 'title'],
        properties: {
          id: { type: 'string' },
          sourceKey: { type: 'string' },
          sourceDb: { type: 'string', enum: [...SOURCE_DBS] },
          category: { type: 'string', enum: [...DATASET_CATEGORIES] },
          title: { type: 'string' },
          description: { type: 'string' },
          doi: { type: 'string' },
          publisher: { type: 'string' },
          publishedAt: { type: 'string', format: 'date-time' }
        }
      }
    },
    meta: {
      type: 'object',
      required: [
        'page',
        'limit',
        'total',
        'totalPages',
        'hasNextPage',
        'hasPreviousPage'
      ],
      properties: {
        page: { type: 'integer' },
        limit: { type: 'integer' },
        total: { type: 'integer' },
        totalPages: { type: 'integer' },
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

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new SearchValidationError(
      `${fieldName} must be a valid ISO 8601 (YYYY-MM-DD) date string`
    );
  }

  return parsed;
};

const dedupeStringArray = (values: readonly string[] | undefined): string[] | undefined => {
  if (!values?.length) return undefined;
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
};

const dedupeIntArray = (values: readonly number[] | undefined): number[] | undefined => {
  if (!values?.length) return undefined;
  return Array.from(new Set(values));
};

const normalizeWkt = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new SearchValidationError('geometry must be a string');
  }

  const normalized = value.trim();
  if (!WKT_GEOMETRY_REGEX.test(normalized)) {
    throw new SearchValidationError(
      'geometry must be a valid WKT Polygon or MultiPolygon'
    );
  }

  return normalized;
};

const searchRoute: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        tags: ['search'],
        summary: 'Search datasets',
        description:
          'Search dataset metadata with full-text query and structured filters.',
        body: searchRequestBodySchema,
        response: {
          200: searchResponseSchema
        }
      }
    },
    async (request) => {
      try {
        const page = request.body.page ?? DEFAULT_PAGE;
        const limit = request.body.limit ?? DEFAULT_LIMIT;

        if (limit * page > MAX_WINDOW) {
          throw new SearchValidationError(
            `limit * page must be <= ${MAX_WINDOW}. Refine your query or filters.`
          );
        }

        const query = normalizeQuery(request.body.query);
        const queryMode: SearchQueryMode = request.body.queryMode ?? 'fulltext';
        const publishedFrom = parseDateOnly(request.body.publishedFrom, 'publishedFrom');
        const publishedTo = parseDateOnly(request.body.publishedTo, 'publishedTo');

        if (publishedFrom && publishedTo && publishedFrom > publishedTo) {
          throw new SearchValidationError(
            'publishedFrom must be earlier than or equal to publishedTo'
          );
        }

        const category = dedupeStringArray(request.body.category) as
          | DatasetCategory[]
          | undefined;
        const sourceDb = dedupeStringArray(request.body.sourceDb) as
          | SourceDb[]
          | undefined;
        const country = dedupeStringArray(request.body.country);
        const taxonomyGbifIds = dedupeIntArray(request.body.taxonomyGbifIds);
        const geometry = normalizeWkt(request.body.geometry);

        return await fastify.searchService.search({
          query,
          queryMode,
          page,
          limit,
          category,
          sourceDb,
          publishedFrom,
          publishedTo,
          includeWithoutPublished: request.body.includeWithoutPublished,
          geometry,
          country,
          taxonomyGbifIds
        });
      } catch (error) {
        if (error instanceof SearchValidationError) {
          throw fastify.httpErrors.badRequest(error.message);
        }
        throw error;
      }
    }
  );
};

export default searchRoute;
