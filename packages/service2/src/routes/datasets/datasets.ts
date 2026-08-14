import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { DatasetNotFoundError } from '../../services/datasets/datasets.service';

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

const datasetParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    id: { type: 'string', minLength: 1, maxLength: 512 }
  }
} as const;

const datasetQuerystringSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['db'],
  properties: {
    db: { type: 'string', enum: [...SOURCE_DBS] }
  }
} as const;

const datasetDetailResponseSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'sourceKey', 'db', 'title', 'type'],
  properties: {
    id: { type: 'string', minLength: 1 },
    sourceKey: { type: 'string', minLength: 1 },
    db: { type: 'string', enum: [...SOURCE_DBS] },
    title: { type: 'string', minLength: 1 },
    description: { type: 'string' },
    type: { type: 'string', enum: [...DATASET_CATEGORIES] },
    doi: { type: 'string', maxLength: 2048 },
    publisher: { type: 'string' },
    publishedAt: { type: 'string', format: 'date-time' },
    sourceUrl: { type: 'string', maxLength: 2048 },
    license: { type: 'string' }
  }
} as const;

const datasetRoute: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get(
    '/:id',
    {
      schema: {
        params: datasetParamsSchema,
        querystring: datasetQuerystringSchema,
        response: {
          200: datasetDetailResponseSchema
        }
      }
    },
    async (request) => {
      try {
        return await fastify.datasetService.getDatasetDetail({
          sourceKey: request.params.id,
          db: request.query.db
        });
      } catch (error) {
        if (error instanceof DatasetNotFoundError) {
          throw fastify.httpErrors.notFound(error.message);
        }

        throw error;
      }
    }
  );
};

export default datasetRoute;
