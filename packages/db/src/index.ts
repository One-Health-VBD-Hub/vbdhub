import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

export { PrismaClient };

export function createPrismaClient(
  connectionString = process.env.DATABASE_URL
): PrismaClient {
  if (!connectionString)
    throw new Error('DATABASE_URL must be set to create a Prisma client');

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}
