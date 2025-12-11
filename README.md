[![CLA assistant](https://cla-assistant.io/readme/badge/One-Health-VBD-Hub/vbdhub)](https://cla-assistant.io/One-Health-VBD-Hub/vbdhub)
<img alt="gitleaks badge" src="https://img.shields.io/badge/protected%20by-gitleaks-blue">

# VBD Hub Monorepo

This repository houses the VBD Hub applications managed with npm workspaces:
- `packages/web`: Next.js frontend.
- `packages/service`: NestJS backend API.

## Funding and affiliation
- Developed at [Imperial College London](https://www.imperial.ac.uk/), funded by Imperial College London, [DEFRA](https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs), and [UKRI (BBSRC)](https://www.ukri.org/councils/bbsrc/).

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
