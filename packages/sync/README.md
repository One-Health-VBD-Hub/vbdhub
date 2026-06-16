# @vbdhub/sync

Simple TypeScript package for synchronisation jobs.

## Usage

CLI:

```bash
pnpm --filter @vbdhub/sync run build
pnpm --filter @vbdhub/sync run sync --list
pnpm --filter @vbdhub/sync run sync --job hub
pnpm --filter @vbdhub/sync run sync:hub
```

Railway cron style:

```bash
pnpm --filter @vbdhub/sync run sync --job hub
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
