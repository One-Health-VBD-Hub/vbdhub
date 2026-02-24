## VBD Hub Service
NestJS API for the VBD Hub platform (data ingest, search, and downstream integrations).

## Prerequisites
- Node.js 18+
- Install dependencies from the repo root: `npm install`
- Copy `.env.example` to `.env` and set real values (S3, Elasticsearch, etc.).

## Scripts
Run from `packages/service` or via workspace scripts at the repo root.

```bash
npm run start         # dev server
npm run start:dev     # dev server with watch
npm run start:prod    # run compiled dist
npm run build         # compile to dist
npm run lint          # eslint with --fix
npm run format        # prettier on source/tests
```

## Data sync jobs
After building (`npm run build`), execute sync jobs from `dist`:
```bash
node dist/jobs/sync gbif 15
node dist/jobs/sync vt 10
node dist/jobs/sync vd 10
node dist/jobs/sync hub 10
node dist/jobs/sync px 15
```

## Testing
```bash
npm run test          # unit
npm run test:watch
npm run test:cov
npm run test:e2e      # e2e config in test/jest-e2e.json
```

## Release/observability
- Sentry sourcemaps: `npm run sentry:sourcemaps` (requires Sentry auth/env).
