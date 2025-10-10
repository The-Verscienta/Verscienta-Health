# Production stage
FROM node:20-alpine AS runner

# Install curl for healthchecks and pnpm
RUN apk add --no-cache curl && \
    corepack enable && corepack prepare pnpm@9.15.0 --activate

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

# Install dependencies (including devDependencies for TypeScript)
# Payload CMS needs tsx to run TypeScript server
# Skip prepare scripts (husky) to avoid git hooks
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY --chown=payloadcms:nodejs packages ./packages
COPY --chown=payloadcms:nodejs apps/cms ./apps/cms

USER payloadcms

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV NODE_OPTIONS="--no-deprecation"

EXPOSE 3001

# Start the application using tsx via npx (no symlinks needed)
WORKDIR /app/apps/cms
CMD ["npx", "tsx", "src/server.ts"]
