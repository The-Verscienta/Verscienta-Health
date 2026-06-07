# Verscienta Health - Production Dockerfile
# Next.js 15.4.3 + PayloadCMS 3.62.1 Unified Application

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for all workspaces
COPY apps/web/package.json ./apps/web/
COPY packages/api-types/package.json ./packages/api-types/ 2>/dev/null || true
COPY packages/api-client/package.json ./packages/api-client/ 2>/dev/null || true

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Builder
# ============================================
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy shared packages (if they exist)
COPY packages ./packages 2>/dev/null || true

# Copy application source
COPY apps/web ./apps/web

# Build shared packages first (if they exist)
RUN pnpm --filter @verscienta/api-types build 2>/dev/null || true
RUN pnpm --filter @verscienta/api-client build 2>/dev/null || true

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Payload types before build
WORKDIR /app/apps/web
RUN pnpm payload generate:types || echo "Payload types generation skipped"

# Build the application
RUN pnpm build

# ============================================
# Stage 3: Migrator (release/init job)
# ============================================
# The runner stage below is a minimal Next.js standalone image and intentionally
# does NOT contain the Prisma/Payload CLIs or full node_modules, so it cannot run
# migrations itself. This stage reuses the builder (full deps + source + both
# prisma/migrations and payload/migrations) to apply migrations.
#
# Run it to completion as a release/init step BEFORE the runner serves traffic:
#   docker build --target migrator -t verscienta-migrator .
#   docker run --rm -e DATABASE_URL=... verscienta-migrator
# It runs `prisma migrate deploy` then `payload migrate` and exits non-zero on
# any failure (see apps/web/scripts/db/migrate.ts), which must abort the rollout.
# Payload `push` is OFF in production, so the schema is never auto-mutated on boot.
FROM builder AS migrator
WORKDIR /app/apps/web
ENV NODE_ENV=production
CMD ["pnpm", "db:migrate:up"]

# ============================================
# Stage 4: Runner (Production)
# ============================================
# IMPORTANT: deploy the `migrator` stage (above) as a release/init job that must
# succeed before this runner starts. This minimal image only serves traffic.
FROM node:22-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    wget \
    dumb-init

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built application
# Next.js standalone mode output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy Payload-related files
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/payload ./apps/web/payload
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/payload.config.ts ./apps/web/payload.config.ts

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "apps/web/server.js"]
