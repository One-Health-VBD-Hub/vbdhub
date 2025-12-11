## VBD Hub Web
Next.js frontend for the VBD Hub platform (maps, resources, and account flows).

## Prerequisites
- Node.js 18+
- Install dependencies from the repo root: `npm install`
- Copy `.env.example` to `.env` and set public client values (API URL, Stytch, Mapbox, Sentry).

## Running locally
From `packages/web` (or use `npm run dev:web` at the repo root):
```bash
npm run dev
```
App runs on `http://localhost:3000` by default.

## Scripts
```bash
npm run dev      # local dev
npm run build    # production build
npm run start    # start built app
npm run lint     # eslint
npm run sitemap  # generate sitemap/robots
npm run knip     # unused code/deps check
```

## Notes
- Built with Next.js 16, Tailwind CSS 4, React 19, and TanStack Query 5.
- Sentry is configured via `sentry.*.config.ts`; ensure env vars are set before building/starting.
