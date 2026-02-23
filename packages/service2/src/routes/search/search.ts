import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import type { DatasetCategory, SourceDb } from '@prisma/client';
import { SearchValidationError } from '../../services/search/search.service';

const MAX_LIMIT = 50;
const MAX_WINDOW = 10_000;

const LEGACY_CATEGORIES = [
  'trait',
  'abundance',
  'occurrence',
  'proteomic',
  'genomic',
  'microarray',
  'transcriptomic',
  'epidemiological'
] as const;

const LEGACY_DATABASES = ['px', 'vd', 'vt', 'gbif', 'ncbi', 'hub'] as const;

type LegacyCategory = (typeof LEGACY_CATEGORIES)[number];
type LegacyDatabase = (typeof LEGACY_DATABASES)[number];

const LEGACY_TO_CANONICAL_CATEGORY: Partial<Record<LegacyCategory, DatasetCategory>> =
  {
    trait: 'traits',
    abundance: 'abundance',
    occurrence: 'occurrence',
    proteomic: 'proteomics',
    epidemiological: 'epidemiology'
  };

const LEGACY_TO_CANONICAL_SOURCE_DB: Partial<Record<LegacyDatabase, SourceDb>> = {
  px: 'proteomexchange',
  vd: 'vecdyn',
  vt: 'vectraits',
  gbif: 'gbif',
  hub: 'hub'
};

const CANONICAL_TO_LEGACY_CATEGORY: Record<DatasetCategory, LegacyCategory> = {
  occurrence: 'occurrence',
  abundance: 'abundance',
  traits: 'trait',
  proteomics: 'proteomic',
  epidemiology: 'epidemiological'
};

const CANONICAL_TO_LEGACY_SOURCE_DB: Record<SourceDb, LegacyDatabase> = {
  gbif: 'gbif',
  proteomexchange: 'px',
  vecdyn: 'vd',
  vectraits: 'vt',
  hub: 'hub'
};

const WKT_GEOMETRY_REGEX = /^(POLYGON|MULTIPOLYGON)\s*\(.+\)$/i;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/;

const legacySearchQuerySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['limit', 'page'],
  properties: {
    query: { type: 'string', minLength: 1, maxLength: 500 },
    exact: { type: 'boolean' },
    limit: { type: 'integer', minimum: 1, maximum: MAX_LIMIT },
    page: { type: 'integer', minimum: 1 },
    category: { type: 'string' },
    database: { type: 'string' },
    publishedFrom: { type: 'string' },
    publishedTo: { type: 'string' },
    withoutPublished: { type: 'boolean' },
    geometry: { type: 'string', maxLength: 200_000 },
    taxonomy: { type: 'string' }
  }
} as const;

const legacySearchResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['count', 'hits'],
  properties: {
    count: { type: 'integer', minimum: 0 },
    hits: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'db', 'title', 'type'],
        properties: {
          id: { type: 'string' },
          db: { type: 'string', enum: [...LEGACY_DATABASES] },
          title: { type: 'string' },
          description: { type: 'string' },
          doi: { type: 'string' },
          type: { type: 'string', enum: [...LEGACY_CATEGORIES] },
          published: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
} as const;

const parseCsv = (value: unknown, fieldName: string): string[] | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new SearchValidationError(`${fieldName} must be a CSV string`);
  }

  const parsed = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  return parsed.length > 0 ? Array.from(new Set(parsed)) : undefined;
};

const dedupeStringArray = (
  values: readonly string[] | undefined
): string[] | undefined => {
  if (!values?.length) return undefined;
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
};

const dedupeIntArray = (
  values: readonly number[] | undefined
): number[] | undefined => {
  if (!values?.length) return undefined;
  return Array.from(new Set(values));
};

const parseDateFlexible = (value: unknown, fieldName: string): Date | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw new SearchValidationError(
      `${fieldName} must be a valid ISO 8601 date string`
    );
  }

  const isDateOnly = ISO_DATE_REGEX.test(value);
  const isDateTime = ISO_DATE_TIME_REGEX.test(value);
  if (!isDateOnly && !isDateTime) {
    throw new SearchValidationError(
      `${fieldName} must be a valid ISO 8601 date string`
    );
  }

  const parsed = isDateOnly
    ? new Date(`${value}T00:00:00.000Z`)
    : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new SearchValidationError(
      `${fieldName} must be a valid ISO 8601 date string`
    );
  }

  return parsed;
};

const normalizeQuery = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw new SearchValidationError('query must be a string');
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
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

const validateLegacyCategoryArray = (
  values: string[] | undefined
): LegacyCategory[] | undefined => {
  if (!values?.length) return undefined;

  const allowed = new Set(LEGACY_CATEGORIES);
  const invalid = values.filter((value) => !allowed.has(value as LegacyCategory));
  if (invalid.length > 0) {
    throw new SearchValidationError(
      `category contains invalid values: ${invalid.join(', ')}`
    );
  }

  return values as LegacyCategory[];
};

const validateLegacyDatabaseArray = (
  values: string[] | undefined
): LegacyDatabase[] | undefined => {
  if (!values?.length) return undefined;

  const allowed = new Set(LEGACY_DATABASES);
  const invalid = values.filter((value) => !allowed.has(value as LegacyDatabase));
  if (invalid.length > 0) {
    throw new SearchValidationError(
      `database contains invalid values: ${invalid.join(', ')}`
    );
  }

  return values as LegacyDatabase[];
};

const parseLegacyTaxonomyCsv = (value: unknown): number[] | undefined => {
  const raw = parseCsv(value, 'taxonomy');
  if (!raw?.length) return undefined;

  const parsed = raw.map((entry) => Number.parseInt(entry, 10));
  const hasInvalid = parsed.some(
    (entry) => Number.isNaN(entry) || !Number.isInteger(entry) || entry < 1
  );
  if (hasInvalid) {
    throw new SearchValidationError(
      'taxonomy must contain positive GBIF taxon IDs'
    );
  }

  return dedupeIntArray(parsed);
};

const legacySearchRoute: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get(
    '/',
    {
      schema: {
        querystring: legacySearchQuerySchema,
        response: {
          200: legacySearchResponseSchema
        }
      }
    },
    async (request) => {
      try {
        const page = request.query.page;
        const limit = request.query.limit;

        if (limit * page > MAX_WINDOW) {
          throw new SearchValidationError(
            `limit * page must be <= ${MAX_WINDOW}. Refine your query or filters.`
          );
        }

        const publishedFrom = parseDateFlexible(
          request.query.publishedFrom,
          'publishedFrom'
        );
        const publishedTo = parseDateFlexible(
          request.query.publishedTo,
          'publishedTo'
        );
        if (publishedFrom && publishedTo && publishedFrom > publishedTo) {
          throw new SearchValidationError(
            'publishedFrom must be earlier than or equal to publishedTo'
          );
        }

        const legacyCategories = validateLegacyCategoryArray(
          parseCsv(request.query.category, 'category')
        );
        const legacyDatabases = validateLegacyDatabaseArray(
          parseCsv(request.query.database, 'database')
        );

        const mappedCategories = dedupeStringArray(
          legacyCategories
            ?.map((category) => LEGACY_TO_CANONICAL_CATEGORY[category])
            .filter((value): value is DatasetCategory => Boolean(value))
        ) as DatasetCategory[] | undefined;

        const mappedSourceDbs = dedupeStringArray(
          legacyDatabases
            ?.map((database) => LEGACY_TO_CANONICAL_SOURCE_DB[database])
            .filter((value): value is SourceDb => Boolean(value))
        ) as SourceDb[] | undefined;

        if (legacyCategories?.length && !mappedCategories?.length) {
          return { count: 0, hits: [] };
        }

        if (legacyDatabases?.length && !mappedSourceDbs?.length) {
          return { count: 0, hits: [] };
        }

        const response = await fastify.searchService.search({
          query: normalizeQuery(request.query.query),
          queryMode: request.query.exact ? 'exact' : 'fulltext',
          page,
          limit,
          category: mappedCategories,
          sourceDb: mappedSourceDbs,
          publishedFrom,
          publishedTo,
          includeWithoutPublished: request.query.withoutPublished,
          geometry: normalizeWkt(request.query.geometry),
          taxonomyGbifIds: parseLegacyTaxonomyCsv(request.query.taxonomy)
        });

        return {
          count: response.meta.total,
          hits: response.items.map((item) => ({
            id: item.sourceKey,
            db: CANONICAL_TO_LEGACY_SOURCE_DB[item.sourceDb],
            title: item.title,
            description: item.description,
            doi: item.doi,
            type: CANONICAL_TO_LEGACY_CATEGORY[item.category],
            published: item.publishedAt
          }))
        };
      } catch (error) {
        if (error instanceof SearchValidationError) {
          throw fastify.httpErrors.badRequest(error.message);
        }
        throw error;
      }
    }
  );
};

export default legacySearchRoute;
