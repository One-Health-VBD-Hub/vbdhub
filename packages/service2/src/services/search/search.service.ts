import { PrismaClient } from '@vbdhub/db';

export const buildSearchService = ({prisma}: { prisma: PrismaClient }) => {
  return {};
};

export type SearchService = ReturnType<typeof buildSearchService>;
