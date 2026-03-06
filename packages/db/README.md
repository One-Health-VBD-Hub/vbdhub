# @vbdhub/db

Shared Prisma package for the monorepo.

## Commands

```bash
npm run prisma:generate --workspace=@vbdhub/db
npm run prisma:migrate:dev --workspace=@vbdhub/db
npm run prisma:migrate:deploy --workspace=@vbdhub/db
```

## Usage

```ts
import { PrismaClient, createPrismaClient } from '@vbdhub/db';

const prisma = createPrismaClient();
// or
const direct = new PrismaClient();
```
