import fp from 'fastify-plugin';
import { createPrismaClient, PrismaClient } from '@vbdhub/db';

export default fp(
  async (fastify) => {
    const prisma = createPrismaClient();

    fastify.decorate('prisma', prisma);

    fastify.addHook('onClose', async (fastifyInstance) => {
      await fastifyInstance.prisma.$disconnect();
    });
  },
  { name: 'prisma' }
);

// When using .decorate you have to specify added properties for TypeScript
declare module 'fastify' {
  export interface FastifyInstance {
    prisma: PrismaClient;
  }
}
