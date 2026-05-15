## VBD Hub Web
Next.js frontend for the VBD Hub platform (maps, resources, and account flows).

## Prerequisites
- Node.js 18+
- Install dependencies from the repo root: `pnpm install`
- Copy `.env.example` to `.env` and set public client values (API URL, Stytch, Mapbox, Sentry).

## Running locally
From `packages/web` (or use `pnpm run dev:web` at the repo root):
```bash
pnpm run dev
```
App runs on `http://localhost:3000` by default.

## Scripts
```bash
pnpm run dev      # local dev
pnpm run build    # production build
pnpm run start    # start built app
pnpm run lint     # eslint
pnpm run sitemap  # generate sitemap/robots
pnpm run knip     # unused code/deps check
```

## Notes
- Built with Next.js 16, Tailwind CSS 4, React 19, and TanStack Query 5.
- Sentry is configured via `sentry.*.config.ts`; ensure env vars are set before building/starting.
