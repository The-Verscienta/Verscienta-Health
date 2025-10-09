# Production stage
FROM node:20-alpine AS runner

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Set working directory
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 payloadcms

# Copy workspace configuration files
COPY --chown=payloadcms:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy all package.json files
COPY --chown=payloadcms:nodejs apps/cms/package.json ./apps/cms/
COPY --chown=payloadcms:nodejs apps/web/package.json ./apps/web/
COPY --chown=payloadcms:nodejs packages/api-types/package.json ./packages/api-types/
COPY --chown=payloadcms:nodejs packages/api-client/package.json ./packages/api-client/

# Install dependencies (production only)
# Skip prepare scripts (husky) in production
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy source code
COPY --chown=payloadcms:nodejs packages ./packages
COPY --chown=payloadcms:nodejs apps/cms ./apps/cms

USER payloadcms

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application using Payload's built-in server
CMD ["pnpm", "--filter", "cms", "start"]
