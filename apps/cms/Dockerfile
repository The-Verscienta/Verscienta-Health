# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all package.json files for dependency installation
COPY apps/cms/package.json ./apps/cms/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/cms ./apps/cms

# Build the Payload CMS application
RUN pnpm --filter cms build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm in production stage
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 payloadcms

# Copy built application and dependencies
COPY --from=builder --chown=payloadcms:nodejs /app/apps/cms/dist ./dist
COPY --from=builder --chown=payloadcms:nodejs /app/apps/cms/package.json ./package.json
COPY --from=builder --chown=payloadcms:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=payloadcms:nodejs /app/apps/cms/build ./build

USER payloadcms

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/server.js"]
