# VBD Hub Monorepo

This repository houses the VBD Hub applications managed with npm workspaces:
- `packages/web`: Next.js frontend.
- `packages/service`: NestJS backend API.

## Prerequisites
- Node.js 18+ and npm.
- Local environment files for each package (copy from each package’s `.env.example`).

## Getting Started
```bash
npm install
# run from the repo root
npm run dev:web       # starts the Next.js app
npm run dev:service   # starts the NestJS service
```

## Structure
- `packages/web/` – Frontend app (see `packages/web/README.md` for details).
- `packages/service/` – Backend service (see `packages/service/README.md` for details).
- `.github/workflows/` – CI (includes Gitleaks secret scanning).

## Development Notes
- Uses Prettier settings defined in `package.json`.
- Git ignores local `.env` files; keep real secrets out of git.
- CI runs Gitleaks on pushes and pull requests; configure secrets in GitHub settings if needed.
