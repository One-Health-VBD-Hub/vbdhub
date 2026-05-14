# @vbdhub/db

Shared Prisma package for the monorepo.

## Commands

```bash
pnpm --filter @vbdhub/db run prisma:generate
pnpm --filter @vbdhub/db run prisma:migrate:dev
pnpm --filter @vbdhub/db run prisma:migrate:deploy
```

## Usage

```ts
import { PrismaClient, createPrismaClient } from '@vbdhub/db';

const prisma = createPrismaClient();
// or
const direct = new PrismaClient();
```
