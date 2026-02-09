import fp from 'fastify-plugin';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

export default fp(
  async (fastify) => {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL
    });
    const prisma = new PrismaClient({ adapter });

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
