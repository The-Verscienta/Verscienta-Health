# Coolify Deployment Guide - Verscienta Health

**Last Updated**: November 2025
**Architecture**: Unified Next.js 15.4.3 + PayloadCMS 3.62.1
**Database**: PostgreSQL 17+

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [Domain & SSL Configuration](#domain--ssl-configuration)
7. [Post-Deployment Setup](#post-deployment-setup)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedures](#rollback-procedures)

---

## 🏗️ Architecture Overview

### Unified Application Structure

**Before Migration** (Strapi):
```
verscienta.com     → Next.js Frontend (apps/web)
api.verscienta.com → Strapi CMS (apps/strapi-cms)
```

**Current Architecture** (PayloadCMS):
```
verscienta.com     → Next.js + PayloadCMS (apps/web)
  ├─ /              → Frontend pages
  ├─ /admin         → Payload admin panel
  └─ /api           → Payload REST API
```

### Key Benefits

- ✅ **Single deployment** - One app instead of two
- ✅ **No CORS issues** - Same domain for frontend and backend
- ✅ **10-100x faster** - Local API instead of HTTP
- ✅ **Simplified infrastructure** - Fewer services to manage
- ✅ **Better security** - Admin panel protected by same firewall

---

## ✅ Prerequisites

### Required Services in Coolify

1. **PostgreSQL 17+** with pgvector extension
2. **Redis** (for rate limiting and caching)
3. **Node.js 22+** runtime

### External Services (Required)

1. **Cloudflare Account**
   - R2 bucket for media storage
   - Images service for optimization
   - DNS management

2. **Algolia Account**
   - Search indexing service

3. **Sentry Account** (Optional)
   - Error tracking and monitoring

4. **Better Auth** (Configured in app)
   - User authentication

---

## 🔐 Environment Variables

### 1. Create PostgreSQL Database in Coolify

1. Go to **Databases** → **+ New Database**
2. Select **PostgreSQL 17**
3. Name: `verscienta-health-db`
4. Enable **pgvector** extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

5. Copy the connection string from Coolify dashboard

### 2. Configure Application Environment Variables

In Coolify, go to your application → **Environment Variables** → Add these:

```bash
# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://user:password@postgres-host:5432/verscienta_health
DATABASE_URI=postgresql://user:password@postgres-host:5432/verscienta_health

# ============================================
# PAYLOAD CMS
# ============================================
PAYLOAD_SECRET=generate-a-secure-random-string-here-min-32-chars
PAYLOAD_PUBLIC_SERVER_URL=https://verscienta.com

# ============================================
# NEXT.JS
# ============================================
NEXT_PUBLIC_APP_URL=https://verscienta.com
NEXT_PUBLIC_CMS_URL=https://verscienta.com
NEXT_PUBLIC_SITE_URL=https://verscienta.com
NODE_ENV=production

# ============================================
# BETTER AUTH (Authentication)
# ============================================
BETTER_AUTH_SECRET=generate-another-secure-random-string-here
BETTER_AUTH_URL=https://verscienta.com
ENCRYPTION_KEY=generate-32-char-encryption-key-here

# ============================================
# CLOUDFLARE R2 (Media Storage)
# ============================================
CLOUDFLARE_R2_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-key
CLOUDFLARE_R2_BUCKET_NAME=verscienta-media
CLOUDFLARE_R2_PUBLIC_URL=https://media.verscienta.com

# ============================================
# CLOUDFLARE IMAGES (Image Optimization)
# ============================================
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_IMAGES_API_TOKEN=your-images-api-token
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id

# ============================================
# ALGOLIA (Search)
# ============================================
ALGOLIA_APP_ID=your-algolia-app-id
ALGOLIA_ADMIN_API_KEY=your-algolia-admin-key
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your-algolia-search-key
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=verscienta_health

# ============================================
# REDIS (Rate Limiting & Caching)
# ============================================
REDIS_URL=redis://redis-host:6379
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# ============================================
# SENTRY (Error Tracking) - Optional
# ============================================
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=verscienta-health
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# ============================================
# EMAIL (Notifications)
# ============================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM_EMAIL=noreply@verscienta.com
SMTP_FROM_NAME=Verscienta Health

# ============================================
# API KEYS (External Services)
# ============================================
TREFLE_API_KEY=your-trefle-api-key
PERENUAL_API_KEY=your-perenual-api-key
GROK_API_KEY=your-grok-api-key
```

### 3. Generate Secure Secrets

Use this command to generate secure random strings:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Or use online generator (ensure HTTPS):
# https://generate-secret.vercel.app/32
```

---

## 🗄️ Database Setup

### 1. Create Database in Coolify

1. **Databases** → **+ New Database**
2. **Type**: PostgreSQL 17
3. **Name**: `verscienta-health-db`
4. **Username**: `verscienta`
5. **Password**: Generate strong password
6. **Persistent Storage**: ✅ Enable
7. **Volume Size**: 10GB minimum (scale as needed)

### 2. Enable pgvector Extension

Connect to your database and run:

```sql
-- Enable pgvector for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### 3. Database Backup Configuration

Enable automated backups in Coolify:

1. Go to database → **Backups**
2. **Schedule**: Daily at 2 AM UTC
3. **Retention**: 7 days
4. **Destination**: S3-compatible storage (Cloudflare R2 recommended)

---

## 🚀 Application Deployment

### 1. Create Application in Coolify

1. **Applications** → **+ New Application**
2. **Source**: GitHub
3. **Repository**: `your-org/verscienta-health`
4. **Branch**: `main`
5. **Build Pack**: Nixpacks (auto-detected)

### 2. Build Configuration

#### **Build Command**

```bash
cd apps/web && pnpm install --frozen-lockfile && pnpm build
```

#### **Start Command**

```bash
cd apps/web && pnpm start
```

#### **Port**

```
3000
```

#### **Health Check**

```
GET / (HTTP 200)
```

### 3. Advanced Build Settings

In Coolify → Application → **Build**:

```yaml
# Nixpacks configuration
[phases.install]
cmds = [
  "curl -fsSL https://get.pnpm.io/install.sh | sh -",
  "pnpm config set store-dir ~/.pnpm-store"
]

[phases.build]
cmds = [
  "cd apps/web",
  "pnpm install --frozen-lockfile",
  "pnpm build"
]

[start]
cmd = "cd apps/web && pnpm start"
```

### 4. Resource Allocation

**Minimum Requirements**:
- **CPU**: 1 vCPU
- **Memory**: 2GB RAM
- **Disk**: 10GB

**Recommended for Production**:
- **CPU**: 2 vCPUs
- **Memory**: 4GB RAM
- **Disk**: 20GB SSD

### 5. Deploy!

Click **Deploy** and monitor the build logs.

Expected build time: **5-10 minutes**

---

## 🌐 Domain & SSL Configuration

### 1. Domain Setup in Cloudflare

Add DNS records:

```
Type    Name    Content                    Proxy Status
A       @       your-coolify-server-ip     Proxied (orange cloud)
CNAME   www     verscienta.com             Proxied
CNAME   media   r2-bucket-url.com          Proxied
```

### 2. SSL Configuration in Coolify

1. Go to Application → **Domains**
2. Add domain: `verscienta.com`
3. ✅ Enable **Generate SSL Certificate**
4. ✅ Enable **Force HTTPS**
5. Certificate type: **Let's Encrypt**

### 3. Verify SSL

```bash
curl -I https://verscienta.com
# Should return: HTTP/2 200
# Should include: strict-transport-security header
```

---

## ⚙️ Post-Deployment Setup

### 1. Create First Admin User

Since the Payload admin UI has compatibility issues with Next.js 15.4+, create the first user via database:

#### Option A: Use Coolify Database Console

1. Go to your PostgreSQL database in Coolify
2. Click **Console**
3. Run this SQL (replace the hash with your bcrypt hash from https://bcrypt-generator.com/):

```sql
INSERT INTO users (email, password, role, "createdAt", "updatedAt")
VALUES (
  'admin@verscienta.com',
  '$2a$10$YOUR_BCRYPT_HASH_HERE',  -- Generate at bcrypt-generator.com
  'admin',
  NOW(),
  NOW()
);
```

#### Option B: Use Database GUI

Connect with TablePlus, pgAdmin, or DBeaver using credentials from Coolify.

### 2. Verify Admin Access

1. Visit: `https://verscienta.com/admin/login`
2. Login with your credentials
3. Change password in Settings

### 3. Run Database Migrations

SSH into your Coolify server and run:

```bash
# Access your application container
docker exec -it <container-id> /bin/sh

# Run migrations
cd apps/web
pnpm payload migrate
```

### 4. Initial Data Seeding

Create seed data for development/staging:

```bash
# In application container
cd apps/web
node scripts/seed-data.js
```

### 5. Configure Cron Jobs

Create cron jobs in Coolify for background tasks:

#### **Algolia Sync** (Every 6 hours)
```bash
0 */6 * * * cd /app/apps/web && node scripts/cron/sync-algolia.js
```

#### **Database Backup** (Daily at 1 AM)
```bash
0 1 * * * cd /app/apps/web && node scripts/cron/backup-database.js
```

#### **Cleanup Cache** (Daily at 4 AM)
```bash
0 4 * * * cd /app/apps/web && node scripts/cron/cleanup-cache.js
```

#### **Send Digest Emails** (Weekly Monday 8 AM)
```bash
0 8 * * 1 cd /app/apps/web && node scripts/cron/send-digest.js
```

---

## 📊 Monitoring & Maintenance

### 1. Application Monitoring

#### Health Check Endpoint

Coolify automatically monitors: `GET /api/health`

Create the endpoint if it doesn't exist:

```typescript
// apps/web/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
```

#### Log Monitoring

View logs in Coolify:
1. Application → **Logs**
2. Filter by severity: Error, Warning, Info
3. Enable **Live Logs** during deployments

### 2. Performance Monitoring

#### Sentry Integration

Already configured in `sentry.client.config.ts` and `sentry.server.config.ts`

Monitor at: `https://sentry.io/organizations/your-org/projects/verscienta-health/`

#### Uptime Monitoring

Use Coolify's built-in monitoring or external services:
- **UptimeRobot**: https://uptimerobot.com
- **Better Uptime**: https://betteruptime.com
- **Pingdom**: https://www.pingdom.com

### 3. Database Monitoring

Monitor in Coolify:
1. Database → **Metrics**
2. Check:
   - Connection count
   - Query performance
   - Storage usage
   - Cache hit ratio

Optimize queries if needed:

```sql
-- Find slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;

-- Analyze table statistics
ANALYZE VERBOSE;
```

### 4. Backup Verification

Test backup restoration monthly:

```bash
# In Coolify, go to Database → Backups → Restore
# Select a recent backup
# Restore to a test database
# Verify data integrity
```

---

## 🔧 Troubleshooting

### Build Failures

#### Error: "ENOENT: no such file or directory"

**Cause**: Missing dependencies or incorrect build path

**Solution**:
```bash
# Clear build cache in Coolify
# Rebuild with --no-cache flag
cd apps/web
pnpm install --force
pnpm build
```

#### Error: "JavaScript heap out of memory"

**Cause**: Insufficient memory during build

**Solution**:
```bash
# In Coolify build command, add:
NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```

### Runtime Errors

#### Error: "Cannot connect to PostgreSQL"

**Cause**: Database not accessible from app container

**Solution**:
1. Check DATABASE_URL environment variable
2. Verify database is running in Coolify
3. Check network connectivity between services
4. Ensure database allows connections from app container IP

#### Error: "Missing Payload secret"

**Cause**: PAYLOAD_SECRET not set or incorrect

**Solution**:
1. Verify PAYLOAD_SECRET in environment variables
2. Regenerate with: `openssl rand -base64 32`
3. Redeploy application

#### Error: "Payload admin UI not working"

**Cause**: Known compatibility issue with Next.js 15.4+ and Payload 3.62.1

**Solution**:
- Use REST API instead: `https://verscienta.com/api/collections`
- Wait for Payload 3.63+ with Next.js 15.4+ support
- OR temporarily downgrade to Next.js 15.2.3 for admin access

### Performance Issues

#### Slow API Responses

**Diagnose**:
```bash
# Check database query performance
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

# Check active connections
SELECT count(*) FROM pg_stat_activity;
```

**Solutions**:
1. Add database indexes
2. Enable Redis caching
3. Optimize N+1 queries
4. Increase server resources

#### High Memory Usage

**Diagnose**:
```bash
# In application container
node -e "console.log(process.memoryUsage())"
```

**Solutions**:
1. Increase memory allocation in Coolify
2. Enable memory profiling in Node.js
3. Check for memory leaks in code
4. Optimize image processing

---

## 🔄 Rollback Procedures

### Quick Rollback

In Coolify:
1. Go to Application → **Deployments**
2. Find previous successful deployment
3. Click **Redeploy**
4. Monitor logs for successful rollback

### Database Rollback

If migration fails:

```bash
# Connect to database
psql $DATABASE_URL

# List migrations
SELECT * FROM payload_migrations ORDER BY batch DESC;

# Rollback last batch
DELETE FROM payload_migrations WHERE batch = (SELECT MAX(batch) FROM payload_migrations);

# Restore from backup if needed
# In Coolify: Database → Backups → Restore
```

### Full System Rollback

1. Redeploy application to previous version
2. Restore database from backup
3. Clear Redis cache
4. Verify functionality
5. Update DNS if domain changed

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Database backup completed
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Build passes locally
- [ ] Tests pass (if applicable)
- [ ] Payload collections synced
- [ ] Dependencies updated to compatible versions

### During Deployment

- [ ] Monitor build logs in Coolify
- [ ] Check for build errors
- [ ] Verify health check passes
- [ ] Monitor memory/CPU usage
- [ ] Check application logs for errors

### Post-Deployment

- [ ] Verify main site loads: `https://verscienta.com`
- [ ] Test API endpoints: `https://verscienta.com/api/herbs`
- [ ] Check admin panel: `https://verscienta.com/admin`
- [ ] Verify database connectivity
- [ ] Test media uploads (Cloudflare R2)
- [ ] Verify search functionality (Algolia)
- [ ] Check cron jobs scheduled
- [ ] Monitor Sentry for errors
- [ ] Test user authentication flow
- [ ] Verify SSL certificate
- [ ] Update documentation
- [ ] Notify team of deployment

---

## 🆘 Support & Resources

### Documentation

- **Coolify Docs**: https://coolify.io/docs
- **PayloadCMS Docs**: https://payloadcms.com/docs
- **Next.js Docs**: https://nextjs.org/docs

### Project Documentation

- `CLAUDE.md` - AI assistant context
- `PAYLOAD_MIGRATION.md` - Strapi to Payload migration guide
- `NEXT_PRIORITIES.md` - Current development priorities
- `TODO_MASTER.md` - Full project roadmap

### Getting Help

1. **Check logs** in Coolify first
2. **Review this guide** for common issues
3. **Search GitHub issues**: https://github.com/payloadcms/payload/issues
4. **Coolify Discord**: https://coolify.io/discord
5. **Create issue** in project repository

---

## 📝 Notes

### Known Issues

1. **Payload Admin UI**: Has compatibility issues with Next.js 15.4+
   - Workaround: Use REST API or temporarily downgrade to 15.2.3

2. **Sentry + Turbopack**: Requires Next.js 15.4.1+ for full compatibility
   - Current: Using Next.js 15.4.3 ✅

3. **Sharp Image Processing**: Requires careful version management
   - Current: Using Sharp 0.34.4 via Next.js ✅

### Best Practices

1. **Always backup** before major deployments
2. **Test in staging** before production
3. **Monitor logs** for first 24 hours after deployment
4. **Keep dependencies updated** but test compatibility first
5. **Document changes** in CHANGELOG.md
6. **Use environment-specific** secrets (dev/staging/prod)

---

**Deployment Guide Version**: 1.0
**Last Updated**: November 2025
**Maintained By**: Development Team
**Next Review**: December 2025
