# --- dev deps for build (has @swc/*, typescript, nest cli, etc.) ---
FROM node:20-slim AS deps-dev
WORKDIR /app
# root lockfile + target workspace manifest
COPY package.json package-lock.json ./
COPY packages/service/package.json packages/service/package.json
# install INCLUDING dev deps for the workspace
RUN npm ci --workspaces --include-workspace-root=false

# --- build the service ---
FROM node:20-slim AS builder
WORKDIR /app
# source code
COPY . .
# bring in node_modules from deps-dev so build has dev deps
COPY --from=deps-dev /app/node_modules /app/node_modules
# build ONLY this workspace
RUN npm run --workspace @vbdhub/service build

# --- prod deps only for runtime (small image) ---
FROM node:20-slim AS deps-prod
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/service/package.json packages/service/package.json
RUN npm ci --omit=dev --workspaces --include-workspace-root=false

# --- runtime image ---
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# hoisted prod node_modules
COPY --from=deps-prod /app/node_modules /app/node_modules
# service files
COPY packages/service/package*.json /app/packages/service/
COPY --from=builder /app/packages/service/dist /app/packages/service/dist
WORKDIR /app/packages/service

# Default command uses environment variables with defaults
# When the container starts, it will run:
#   node dist/jobs/sync <DB> <CONCURRENCY> <MODE>
# with DB defaulting to 'gbif' and CONCURRENCY defaulting to 1 if not set.
CMD ["sh", "-c", "node dist/jobs/sync ${DB:-gbif} ${CONCURRENCY:-1} ${MODE}"]