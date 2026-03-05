import fp from 'fastify-plugin';
import {
  buildSearchService,
  SearchService
} from '../services/search/search.service';

export default fp(
  async (fastify) => {
    fastify.decorate(
      'searchService',
      buildSearchService({ prisma: fastify.prisma, cache: fastify.cache })
    );
  },
  { name: 'search', dependencies: ['prisma', 'cache'] }
);

declare module 'fastify' {
  export interface FastifyInstance {
    searchService: SearchService;
  }
}
