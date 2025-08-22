FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
#COPY prisma ./prisma/

RUN npm ci

# Copy the rest of your source code
COPY . .

RUN npm run build

# Remove devDependencies
RUN npm prune --production

FROM node:22-alpine as runtime

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Default command uses environment variables with defaults
# When the container starts, it will run:
#   node dist/jobs/sync <DB> <CONCURRENCY> <MODE>
# with DB defaulting to 'gbif' and CONCURRENCY defaulting to 1 if not set.
CMD ["sh", "-c", "node dist/jobs/sync ${DB:-gbif} ${CONCURRENCY:-1} ${MODE}"]