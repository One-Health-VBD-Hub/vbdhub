# @vbdhub/sync

Simple TypeScript package for synchronisation jobs.

## Usage

CLI:

```bash
npm run build --workspace=@vbdhub/sync
npm run sync --workspace=@vbdhub/sync -- --list
npm run sync --workspace=@vbdhub/sync -- --job hub
npm run sync:hub --workspace=@vbdhub/sync
```

Railway cron style:

```bash
npm run sync --workspace=@vbdhub/sync -- --job hub
# or with env
SYNC_JOB=hub npm run sync --workspace=@vbdhub/sync
```

Programmatic:

```ts
import pino from 'pino';
import { runJob } from '@vbdhub/sync';

const abortController = new AbortController();
const logger = pino({ name: 'sync-worker' });

await runJob('gbif', { signal: abortController.signal, logger });
```

Available jobs:
- `gbif`
- `hub`
- `px`
- `vd`
- `vt`

## Add a job

1. Add a file under `src/jobs`.
2. Export a `JobDefinition`.
3. Register it in `src/job-registry.ts`.
