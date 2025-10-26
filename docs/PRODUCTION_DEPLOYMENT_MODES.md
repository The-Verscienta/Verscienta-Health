# Production Deployment Modes - Next.js 16

**Status**: ✅ Configured
**Last Updated**: 2025-10-26
**Priority**: High (Production deployment configuration)

## Overview

This document explains the different deployment modes for the Next.js application and how to use them correctly.

## The Problem

**Error encountered**:
```
⚠ "next start" does not work with "output: standalone" configuration
TypeError: Cannot destructure property 'lang' of '(intermediate value)' as it is undefined
```

**Root cause**: Using `next start` with `output: 'standalone'` creates incompatibilities where:
1. The middleware redirects don't execute properly
2. Pages render without proper route params
3. The i18n routing breaks

## Deployment Modes

### 1. Local Development (Recommended)

**Command**: `npm run dev`

**Configuration**: No special configuration needed

**Use case**: Daily development work

**Example**:
```bash
cd apps/web
npm run dev
# Server runs on http://localhost:3000
```

### 2. Local Production Testing

**Command**: `npm run build && npm start`

**Configuration**: `output: undefined` (default Next.js mode)

**Use case**: Testing production build locally before deployment

**Example**:
```bash
cd apps/web
npm run build
npm start
# Server runs on http://localhost:3000
```

### 3. Docker/Containerized Production

**Command**: `node .next/standalone/server.js`

**Configuration**: `output: 'standalone'` (enabled with `DOCKER=true` env var)

**Use case**: Production deployment in Docker containers, Kubernetes, or similar

**Example**:
```bash
# Build with Docker mode
cd apps/web
DOCKER=true npm run build

# Run standalone server
node .next/standalone/server.js
```

**Dockerfile example**:
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
ENV DOCKER=true
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Configuration Details

### `next.config.ts` (Current Configuration)

```typescript
output: process.env.NODE_ENV === 'production' && process.env.DOCKER === 'true'
  ? 'standalone'
  : undefined,
```

**Logic**:
- **Development** (`npm run dev`): `output: undefined` ✅
- **Local Production** (`npm start`): `output: undefined` ✅
- **Docker Production** (`DOCKER=true`): `output: 'standalone'` ✅

### Environment Variables

```bash
# Local development (default)
NODE_ENV=development  # Set automatically by 'npm run dev'

# Local production testing
NODE_ENV=production   # Set automatically by 'npm run build'
# No DOCKER variable = uses default Next.js mode

# Docker production
NODE_ENV=production
DOCKER=true           # Enables standalone output
```

## Deployment Commands Reference

| Environment | Build Command | Run Command | Output Mode |
|-------------|---------------|-------------|-------------|
| **Local Dev** | `npm run dev` | N/A (dev server) | N/A |
| **Local Prod** | `npm run build` | `npm start` | Default |
| **Docker Prod** | `DOCKER=true npm run build` | `node .next/standalone/server.js` | Standalone |
| **Vercel** | Automatic | Automatic | Serverless |
| **Netlify** | `npm run build` | Automatic | Static/SSR hybrid |

## Testing the Fix

### Test Local Development
```bash
cd apps/web
npm run dev
curl -I http://localhost:3000/
# Should see: HTTP/1.1 307 Temporary Redirect
# Location: /en
```

### Test Local Production
```bash
cd apps/web
npm run build
npm start
curl -I http://localhost:3000/
# Should see: HTTP/1.1 307 Temporary Redirect
# Location: /en
# No "Cannot destructure property 'lang'" error
```

### Test Docker Production
```bash
cd apps/web
DOCKER=true npm run build
ls .next/standalone/  # Should exist
node .next/standalone/server.js &
curl -I http://localhost:3000/
# Should see: HTTP/1.1 307 Temporary Redirect
# Location: /en
```

## Common Issues & Solutions

### Issue 1: "next start" doesn't work

**Symptom**: `⚠ "next start" does not work with "output: standalone"`

**Solution**:
- For local testing: Remove `DOCKER=true` and rebuild
- For production: Use `node .next/standalone/server.js` instead

### Issue 2: `lang` destructuring error

**Symptom**: `Cannot destructure property 'lang' of undefined`

**Cause**: Standalone mode with `next start` breaks middleware

**Solution**: Use correct deployment mode for your environment (see table above)

### Issue 3: Middleware not redirecting

**Symptom**: Accessing `/` doesn't redirect to `/en`

**Cause**: Incorrect deployment mode

**Solution**: Verify `output` configuration matches your deployment method

## Middleware Configuration

The middleware (`middleware.ts`) uses **Node.js runtime** (not Edge Runtime) to support ioredis for distributed rate limiting:

```typescript
export const runtime = 'nodejs'
```

This configuration is **compatible with all deployment modes**:
- ✅ Local development
- ✅ Local production (`next start`)
- ✅ Standalone production (`node .next/standalone/server.js`)
- ✅ Vercel (automatically uses Node.js runtime)

## Production Deployment Checklist

Before deploying to production:

- [ ] Set appropriate environment variables
  - [ ] `NODE_ENV=production`
  - [ ] `DOCKER=true` (if using Docker)
  - [ ] `REDIS_URL` (for distributed rate limiting)
  - [ ] `DATABASE_URL` (for Prisma)
  - [ ] `BETTER_AUTH_SECRET`
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `NEXT_PUBLIC_CMS_URL`

- [ ] Verify build command
  - [ ] Local: `npm run build`
  - [ ] Docker: `DOCKER=true npm run build`

- [ ] Verify start command
  - [ ] Local: `npm start`
  - [ ] Docker: `node .next/standalone/server.js`

- [ ] Test deployment
  - [ ] `/` redirects to `/en` (or default locale)
  - [ ] Rate limiting works
  - [ ] i18n routing works for all locales
  - [ ] No `lang` destructuring errors

## Files Modified

### `next.config.ts`
```typescript
// Before
output: 'standalone',

// After
output: process.env.NODE_ENV === 'production' && process.env.DOCKER === 'true'
  ? 'standalone'
  : undefined,
```

This change makes the deployment mode **environment-aware** and prevents the `next start` + `standalone` incompatibility.

## References

- [Next.js Standalone Output](https://nextjs.org/docs/app/api-reference/next-config-js/output#automatically-copying-traced-files)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Docker with Next.js](https://nextjs.org/docs/app/building-your-application/deploying/docker)

## Related Documentation

- `API_RATE_LIMITING.md` - Rate limiting configuration (requires Node.js runtime)
- `middleware.ts` - Middleware configuration with `runtime = 'nodejs'`
- `DEPLOYMENT_QUICKSTART.md` - Quick deployment guide

---

**Last Updated**: 2025-10-26
**Maintained By**: Verscienta Health Development Team
**Review Schedule**: Before each production deployment
