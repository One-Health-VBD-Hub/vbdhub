import fp from 'fastify-plugin';
import {
  buildSearchService,
  SearchService
} from '../services/search/search.service';

export default fp(
  async (fastify) => {
    fastify.decorate(
      'searchService',
      buildSearchService({ prisma: fastify.prisma })
    );
  },
  { name: 'search', dependencies: ['prisma'] }
);

declare module 'fastify' {
  export interface FastifyInstance {
    searchService: SearchService;
  }
}
