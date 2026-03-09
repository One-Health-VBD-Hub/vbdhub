import fp from 'fastify-plugin';
import {
  buildDatasetService,
  DatasetService
} from '../services/datasets/datasets.service';

export default fp(
  async (fastify) => {
    fastify.decorate(
      'datasetService',
      buildDatasetService({ prisma: fastify.prisma, cache: fastify.cache })
    );
  },
  { name: 'datasets', dependencies: ['prisma', 'cache'] }
);

declare module 'fastify' {
  export interface FastifyInstance {
    datasetService: DatasetService;
  }
}
