# Coolify Deployment Checklist ✅

**Last Updated**: November 2025
**Application**: Verscienta Health (Next.js 15.4.3 + PayloadCMS 3.62.1)
**Architecture**: Unified monolithic application

---

## 🚀 Quick Deployment Summary

### Application Type
- **Framework**: Next.js 15.4.3 (App Router)
- **CMS**: PayloadCMS 3.62.1 (integrated)
- **Runtime**: Node.js 22+
- **Package Manager**: pnpm 9.15.0
- **Build Output**: Standalone mode

### Required Services
1. ✅ **PostgreSQL 17+** with pgvector extension
2. ✅ **Redis 7+** for caching and rate limiting
3. ✅ **Cloudflare R2** for media storage (S3-compatible)
4. ✅ **Algolia** for search (optional but recommended)

---

## ✅ Pre-Deployment Verification

### 1. Core Files Present
- [x] `apps/web/Dockerfile` - Production Docker configuration
- [x] `apps/web/.dockerignore` - Build optimization
- [x] `apps/web/next.config.ts` - Standalone mode enabled
- [x] `apps/web/package.json` - All dependencies listed
- [x] `apps/web/.env.example` - Complete environment template
- [x] `docker-compose.yml` - Local testing configuration
- [x] `pnpm-lock.yaml` - Locked dependencies

### 2. Application Configuration
- [x] **Standalone mode**: Enabled in production
- [x] **Health endpoint**: `/api/health` (used by Docker healthcheck)
- [x] **TypeScript errors**: Fixed in source code
- [x] **Build errors**: None (`.next/types/` errors are expected)
- [x] **Deprecated code**: Removed (apps/payload-cms, apps/strapi-cms)

### 3. Docker Configuration
- [x] Multi-stage build for optimization
- [x] Non-root user (nextjs:1001)
- [x] Health check configured
- [x] Proper WORKDIR setup
- [x] Signal handling with dumb-init

### 4. Database Setup
- [x] Migrations directory exists (`apps/web/payload/migrations/`)
- [x] Payload config includes postgres adapter
- [x] Auto-migration on startup configured
- [x] Connection pooling ready

---

## 📋 Coolify Deployment Steps

### Step 1: Create PostgreSQL Database

1. In Coolify, create a new **PostgreSQL** service
2. Version: **PostgreSQL 17** (latest)
3. Enable **pgvector** extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Note the connection string (provided by Coolify)

### Step 2: Create Redis Service

1. Create a new **Redis** service
2. Version: **Redis 7** (alpine)
3. No authentication needed for internal network (optional: enable auth)
4. Note the connection URL

### Step 3: Create Application

1. **Create New Resource** → **Git Repository**
2. Repository: `https://github.com/your-org/verscienta-health`
3. Branch: `main`
4. Build Pack: **Dockerfile**
5. Dockerfile Location: `apps/web/Dockerfile`
6. Context: Repository root

### Step 4: Configure Build Settings

**Build Command**: Not needed (Dockerfile handles it)
**Start Command**: Not needed (Dockerfile CMD handles it)
**Port**: `3000`
**Health Check Path**: `/api/health`

### Step 5: Environment Variables

Copy all variables from `apps/web/.env.example` and configure:

#### Critical Variables (Must Set)
```bash
# Application
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://verscienta.com
PAYLOAD_PUBLIC_SERVER_URL=https://verscienta.com

# Database (from Coolify PostgreSQL service)
DATABASE_URL=postgresql://user:pass@postgres:5432/db

# Secrets (generate secure random strings)
PAYLOAD_SECRET=<32+ character random string>
BETTER_AUTH_SECRET=<32+ character random string>

# Redis (from Coolify Redis service)
REDIS_URL=redis://redis:6379

# Cloudflare (required for media storage)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_ACCESS_KEY_ID=your-r2-access-key
CLOUDFLARE_SECRET_ACCESS_KEY=your-r2-secret-key
CLOUDFLARE_BUCKET_NAME=verscienta-media

# Algolia (for search)
ALGOLIA_APP_ID=your-app-id
ALGOLIA_ADMIN_API_KEY=your-admin-key
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your-search-key
```

#### Optional Variables
```bash
# Image optimization
CLOUDFLARE_IMAGES_ENABLED=true
CLOUDFLARE_IMAGES_API_TOKEN=your-token

# Email
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=noreply@verscienta.com

# AI
GROK_API_KEY=your-grok-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Step 6: Domain Configuration

1. Add your domain: `verscienta.com`
2. Enable **HTTPS** (Let's Encrypt)
3. Set **SSL/TLS mode**: Full (strict)
4. Coolify automatically handles certificates

### Step 7: Deploy

1. Click **Deploy**
2. Monitor build logs
3. Wait for health check to pass
4. Access application at your domain

---

## 🔧 Post-Deployment Tasks

### 1. Create First Admin User

Access the Payload admin panel at `https://verscienta.com/admin` and create your first user.

### 2. Verify Services

```bash
# Check application health
curl https://verscienta.com/api/health

# Check admin panel
curl https://verscienta.com/admin

# Check frontend
curl https://verscienta.com
```

### 3. Configure Cloudflare R2

1. Create R2 bucket: `verscienta-media`
2. Set CORS policy for uploads
3. Configure custom domain (optional)

### 4. Setup Algolia Index

1. Create index: `verscienta_health`
2. Configure searchable attributes
3. Set ranking criteria

### 5. Monitor Logs

In Coolify, monitor application logs for:
- Successful database connection
- Payload migrations completed
- No runtime errors

---

## 🐛 Troubleshooting

### Build Fails with TypeScript Errors

**Issue**: `.next/types/` generated files have type errors
**Solution**: Already handled by `typescript.ignoreBuildErrors: true` in next.config.ts
**Status**: Expected behavior, no action needed

### Database Connection Fails

**Issue**: Cannot connect to PostgreSQL
**Check**:
- DATABASE_URL format is correct
- PostgreSQL service is running in Coolify
- Network connectivity between services

### Health Check Fails

**Issue**: Container marked unhealthy
**Check**:
- Application is running on port 3000
- `/api/health` endpoint is accessible
- No startup errors in logs

### Payload Admin Not Loading

**Issue**: 404 or blank page at /admin
**Check**:
- Database migrations ran successfully
- PAYLOAD_SECRET is set correctly
- No errors in application logs

### Build Takes Too Long

**Issue**: Docker build exceeds time limit
**Solution**:
- Increase Coolify build timeout
- Check .dockerignore excludes node_modules
- Verify multi-stage build is working

---

## 📊 Resource Requirements

### Minimum (Development/Testing)
- **CPU**: 1 vCPU
- **RAM**: 2 GB
- **Storage**: 10 GB
- **Database**: Shared PostgreSQL

### Recommended (Production)
- **CPU**: 2 vCPUs
- **RAM**: 4 GB
- **Storage**: 20 GB
- **Database**: Dedicated PostgreSQL with 2 GB RAM

### High Traffic (Scaling)
- **CPU**: 4+ vCPUs
- **RAM**: 8+ GB
- **Storage**: 50+ GB
- **Database**: Dedicated with connection pooling

---

## 🔐 Security Checklist

- [ ] All secrets generated with cryptographically secure random
- [ ] DATABASE_URL uses SSL in production
- [ ] Redis password set (if exposed)
- [ ] Cloudflare R2 bucket not publicly accessible
- [ ] Admin panel protected (HTTPS + strong passwords)
- [ ] Environment variables not committed to Git
- [ ] Sentry configured for error tracking
- [ ] Rate limiting enabled via Redis

---

## 🎯 Deployment Verification

After deployment, verify all functionality:

```bash
# Health check
✅ curl https://verscienta.com/api/health
   Expected: {"status":"healthy"}

# Frontend
✅ curl -I https://verscienta.com
   Expected: HTTP 200

# Admin panel
✅ curl -I https://verscienta.com/admin
   Expected: HTTP 200

# API endpoint
✅ curl https://verscienta.com/admin/api/herbs?limit=1
   Expected: JSON response with herbs data
```

---

## 📚 Additional Resources

- **Deployment Guide**: `docs/COOLIFY_DEPLOYMENT_GUIDE.md`
- **Environment Setup**: `apps/web/.env.example`
- **Architecture**: `docs/CLAUDE.md`
- **Docker Compose**: `docker-compose.yml` (local testing)

---

## ✅ Ready for Deployment

If all items above are checked, your application is **ready for Coolify deployment**!

**Estimated deployment time**: 10-15 minutes (first deployment)
**Estimated build time**: 3-5 minutes
