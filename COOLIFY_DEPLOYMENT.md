# Coolify Deployment Guide - Verscienta Health

This guide covers deploying Verscienta Health to a server running Coolify with full mobile app support.

> **Last Updated:** January 2025
> **Status:** Production-ready with mobile infrastructure
> **New Features:** Mobile API, Push Notifications, Dynamic Sitemap, Analytics

## ⚠️ Critical Pre-Deployment Requirements

Before deploying, you MUST:
1. ✅ Add health check endpoint to CMS (already done!)
2. ✅ Run Prisma migration for device tokens (Step 5.5)
3. ✅ Review and set all required environment variables
4. ✅ Configure Cloudflare R2 storage
5. ✅ Set up Algolia search indexes
6. ✅ Configure Resend for email delivery
7. ✅ Build shared packages (@verscienta/api-types, @verscienta/api-client)

## 📋 Overview

**Deployment Platform:** Coolify (Self-hosted)
**Architecture:** Monorepo (Turborepo + pnpm) with mobile app support
**Services Required:**

- Next.js Frontend (Port 3000) with mobile APIs
- Payload CMS Backend (Port 3001)
- PostgreSQL 17+ Database
- Redis (recommended for production rate limiting)

**Key Technologies:**
- Better Auth (authentication with Prisma)
- Algolia (search)
- Cloudflare R2 (media storage)
- Resend (email delivery)
- Payload CMS (headless CMS)
- Vercel Analytics & Speed Insights
- Mobile API infrastructure (React Native, Expo, Flutter ready)

**Mobile Features (New!):**
- 📱 Type-safe API client (`@verscienta/api-client`)
- 📝 Shared TypeScript types (`@verscienta/api-types`)
- 🔔 Push notification support (iOS APNs, Android FCM)
- 📡 Offline sync API for mobile apps
- 🖼️ Mobile-optimized image API
- 📱 App configuration API with feature flags
- 🗺️ Dynamic sitemap generation with CMS data

---

## 📝 Important Environment Variable Notes

This guide uses the correct environment variables as found in `.env.example`:

**Authentication:**
- ✅ `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` (Better Auth v1.3+)
- ✅ Legacy support for `AUTH_SECRET` and `AUTH_URL` (if needed)
- ✅ Uses Prisma with Better Auth

**CMS Connection:**
- ✅ `PAYLOAD_PUBLIC_SERVER_URL` - Backend URL for API calls
- ✅ `NEXT_PUBLIC_CMS_URL` - Frontend reference to CMS
- ✅ `NEXT_PUBLIC_APP_URL` for CORS and metadata

**Email:**
- ✅ Resend API (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)
- ✅ Not generic SMTP

**Storage:**
- ✅ Cloudflare R2 with S3-compatible API (`@payloadcms/storage-s3`)
- ✅ Not direct Cloudflare Images API
- ✅ `CLOUDFLARE_IMAGES_ENABLED=false` for mobile image optimization

**Rate Limiting:**
- ✅ Redis/Upstash recommended for production
- ✅ `REDIS_URL` and `REDIS_TOKEN`

**Mobile Apps (New!):**
- ✅ `MOBILE_OFFLINE_MODE` - Enable offline sync support
- ✅ `MOBILE_PUSH_NOTIFICATIONS` - Enable push notification endpoints
- ✅ `MIN_SUPPORTED_APP_VERSION` - Force update mechanism
- ✅ CORS configured for Capacitor, React Native, Expo origins

---

## 🔧 Prerequisites

### Server Requirements

- **OS:** Ubuntu 22.04 LTS (recommended) or Debian 11+
- **RAM:** Minimum 4GB, recommended 8GB+
- **CPU:** 2+ cores
- **Storage:** 20GB+ SSD
- **Coolify:** Latest version installed
- **Docker:** Installed and running

### Domain Setup

You'll need two domains/subdomains:

- `verscienta.com` - Frontend (Next.js)
- `backend.verscienta.com` - Backend (Payload CMS)

Or use a single domain with reverse proxy paths:

- `yourdomain.com` - Frontend
- `yourdomain.com/cms` - Backend

---

## 📦 Step 1: Prepare Your Repository

### 1.1 Push to Git Repository

Ensure your code is pushed to a Git repository (GitHub, GitLab, Gitea, etc.)

```bash
git add .
git commit -m "Prepare for Coolify deployment"
git push origin main
```

### 1.2 Create Required Files

Coolify uses Docker, so we need Dockerfiles for each service.

---

## 🐳 Step 2: Docker Configuration (Already Included)

**Note:** Dockerfiles are already present in the repository at:
- `apps/web/Dockerfile` (Frontend)
- `apps/cms/Dockerfile` (Backend)

These Dockerfiles include:
- ✅ Multi-stage builds for optimization
- ✅ Non-root user setup for security
- ✅ Health check endpoints
- ✅ Proper file permissions
- ✅ Standalone Next.js output (already configured)

**No additional Dockerfile setup is needed.** The Next.js config already has `output: 'standalone'` enabled (apps/web/next.config.ts:9).

---

## 🔌 Step 2.5: Payload CMS Plugins (Already Configured)

The CMS includes the following official Payload plugins:

### **1. Cloud Storage Plugin (`@payloadcms/storage-s3`)**
- Uploads media files to Cloudflare R2 (S3-compatible storage)
- Automatically handles image resizing (thumbnail, medium, large, hero)
- **Status:** ✅ Configured in `apps/cms/payload.config.ts`
- **Required Env Vars:** See Step 4.2 below

### **2. SEO Plugin (`@payloadcms/plugin-seo`)**
- Provides SEO management UI for content editors
- Auto-generates meta titles, descriptions, Open Graph tags
- Includes preview of how content appears in Google/social media
- **Collections:** herbs, conditions, formulas, practitioners, modalities, symptoms, reviews
- **Status:** ✅ Configured in `apps/cms/payload.config.ts`

Both plugins are production-ready and require no additional setup beyond environment variables.

**Installed Dependencies:**
```json
{
  "@payloadcms/storage-s3": "^3.59.1",
  "@payloadcms/plugin-seo": "^3.59.1",
  "@aws-sdk/client-s3": "^3.906.0"
}
```

**Key Features:**
- ✅ Media files automatically uploaded to R2 on save
- ✅ SEO fields appear in edit view for all content
- ✅ Image variants (thumbnail, medium, large, hero) auto-generated
- ✅ SEO preview shows Google/Facebook/Twitter appearance

---

## 🗄️ Step 3: Set Up PostgreSQL Database

### 3.1 Create Database in Coolify

1. Go to Coolify dashboard
2. Navigate to **Databases**
3. Click **+ New Database**
4. Select **PostgreSQL 17**
5. Configure:
   - **Name:** `verscienta-db`
   - **Username:** `verscienta_user`
   - **Password:** Generate a strong password
   - **Database Name:** `verscienta_health`
6. Click **Deploy**

### 3.2 Note Database Connection Details

Coolify will provide you with:

- **Host:** Internal Docker network hostname
- **Port:** Usually 5432
- **Database:** verscienta_health
- **User:** verscienta_user
- **Password:** [generated password]

Connection string format:

```
postgresql://verscienta_user:PASSWORD@HOST:5432/verscienta_health
```

---

## 🚀 Step 4: Deploy Backend (Payload CMS)

### 4.1 Create New Service in Coolify

1. Go to **Projects** → **+ New Resource**
2. Select **Docker Compose** or **Dockerfile**
3. Choose **Dockerfile** option
4. Connect your Git repository
5. Set **Dockerfile Location:** `apps/cms/Dockerfile`
6. Set **Build Context:** `.` (root of repo)

### 4.2 Configure Environment Variables

Add these environment variables in Coolify:

```env
# Server
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://verscienta_user:PASSWORD@verscienta-db:5432/verscienta_health

# Database provider (for encryption detection)
# Options: 'aws-rds', 'digitalocean', 'supabase', 'render', 'custom'
DATABASE_PROVIDER=custom

# Payload CMS
PAYLOAD_SECRET=<generate-a-secure-random-string-64-chars>
PAYLOAD_PUBLIC_SERVER_URL=https://backend.verscienta.com

# Algolia Search
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_ADMIN_API_KEY=your_algolia_admin_key

# Cloudflare R2 Storage (for media uploads)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_BUCKET_NAME=verscienta-media
CLOUDFLARE_ACCOUNT_HASH=your_account_hash

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@verscienta.com

# Frontend URL (for CORS) - Use NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_APP_URL=https://verscienta.com
```

**Important Notes:**
- The CMS uses `NEXT_PUBLIC_APP_URL` for CORS configuration, not `FRONTEND_URL`
- Email is sent via Resend, not generic SMTP
- Media storage uses Cloudflare R2 (S3-compatible), not the Images API directly

### 4.3 Configure Domain

1. Set **Domain:** `backend.verscienta.com`
2. Enable **HTTPS** (Let's Encrypt)
3. Click **Deploy**

### 4.4 Run Database Migrations

After deployment, run migrations:

1. Go to the CMS service in Coolify
2. Click **Terminal**
3. Run:

```bash
# Run database migrations (production)
pnpm db:migrate

# Note: db:push is for development only - never use in production
```

**Important:** The `db:push` command is for development only. Always use `db:migrate` in production to properly track schema changes.

---

## 🌐 Step 5: Deploy Frontend (Next.js)

### 5.1 Create New Service in Coolify

1. Go to **Projects** → **+ New Resource**
2. Select **Dockerfile**
3. Connect your Git repository
4. Set **Dockerfile Location:** `apps/web/Dockerfile`
5. Set **Build Context:** `.` (root of repo)

### 5.2 Configure Environment Variables

Add these environment variables:

```env
# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://verscienta.com
NEXT_PUBLIC_WEB_URL=https://verscienta.com
PORT=3000

# Payload CMS API
PAYLOAD_PUBLIC_SERVER_URL=https://backend.verscienta.com
NEXT_PUBLIC_CMS_URL=https://backend.verscienta.com

# Database (for Better Auth and Prisma)
DATABASE_URL=postgresql://verscienta_user:PASSWORD@verscienta-db:5432/verscienta_health

# Better Auth (v1.3+)
BETTER_AUTH_SECRET=<generate-a-secure-random-string-64-chars>
BETTER_AUTH_URL=https://verscienta.com

# Legacy Auth Variables (if needed for compatibility)
# AUTH_SECRET=<generate-a-secure-random-string-64-chars>
# AUTH_URL=https://verscienta.com

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Algolia Search
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_algolia_search_key

# Cloudflare (for images)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_ACCOUNT_HASH=your_account_hash
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_IMAGES_ENABLED=false  # For mobile image optimization API

# Grok AI (xAI)
GROK_API_KEY=your_grok_api_key

# Email (Resend - for Better Auth magic links)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@verscienta.com

# Cloudflare Turnstile (CAPTCHA - Optional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Redis/Upstash (Rate Limiting - Recommended for Production)
REDIS_URL=your_upstash_redis_url
REDIS_TOKEN=your_upstash_redis_token

# Security & HIPAA Compliance (Optional but Recommended)
SESSION_TIMEOUT=86400  # 24 hours
PHI_SESSION_TIMEOUT=900  # 15 minutes for PHI pages
REQUIRE_MFA_FOR_ADMIN=true
REQUIRE_MFA_FOR_PHI_ACCESS=false

# Mobile App Configuration (New!)
MOBILE_OFFLINE_MODE=true  # Enable offline sync API
MOBILE_PUSH_NOTIFICATIONS=true  # Enable push notification endpoints
# MIN_SUPPORTED_APP_VERSION=1.0.0  # Optional: force update mechanism

# CORS for Mobile Apps (comma-separated, optional - middleware handles defaults)
# ALLOWED_CORS_ORIGINS=verscienta-app://,capacitor://localhost
```

**Important Notes:**
- Better Auth v1.3+ uses `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`
- Both `PAYLOAD_PUBLIC_SERVER_URL` and `NEXT_PUBLIC_CMS_URL` should point to backend
- Email is sent via Resend, not generic SMTP
- Redis/Upstash is highly recommended for production rate limiting
- For HIPAA compliance, consider enabling MFA for PHI access
- **Mobile features require database migration** (see Step 5.5)

### 5.3 Configure Domain

1. Set **Domain:** `verscienta.com`
2. Enable **HTTPS** (Let's Encrypt)
3. Click **Deploy**

### 5.4 Generate Prisma Client (Post-Deployment)

After the frontend is deployed, you may need to generate the Prisma client for Better Auth:

1. Go to the web service in Coolify
2. Click **Terminal**
3. Run:

```bash
npx prisma generate
```

This is typically handled during the build process, but if you encounter database connection issues, regenerate the Prisma client.

### 5.5 Run Database Migration for Device Tokens (Required for Mobile Features)

**Critical:** Mobile push notification support requires a database migration to add the `DeviceToken` table.

1. Go to the web service in Coolify
2. Click **Terminal**
3. Run the migration:

```bash
# Method 1: Development (quick - for dev/staging)
npx prisma db push

# Method 2: Production (recommended - creates migration file)
npx prisma migrate deploy
```

**What this does:**
- Creates `DeviceToken` table for storing push notification tokens
- Adds relation to `User` table (optional - devices can register before login)
- Creates indexes for `userId` and `platform` for performance
- Enables cascading delete (tokens removed when user deleted)

**Verify migration:**

```bash
# Check table exists
npx prisma studio

# Or test the endpoint
curl -X POST https://verscienta.com/api/mobile/register-device \
  -H "Content-Type: application/json" \
  -d '{"deviceToken":"test","platform":"ios"}'
```

**If migration fails:**
- Check database connection (`DATABASE_URL`)
- Ensure Prisma Client was generated (`npx prisma generate`)
- Review migration file: `apps/web/prisma/migrations/`
- See troubleshooting: `MIGRATION_DEVICE_TOKENS.md`

---

## 🔄 Step 6: Set Up Automatic Deployments

### 6.1 Configure Webhooks

1. In each service, go to **Webhooks**
2. Copy the webhook URL
3. Add to your Git repository (GitHub, GitLab, etc.)
4. Configure to trigger on `push` to `main` branch

### 6.2 Build Configuration

Coolify will automatically:

- Pull latest code on git push
- Build Docker images
- Deploy new containers
- Run health checks

---

## ⚠️ Step 7: Add Health Check Endpoint for CMS (Critical)

**IMPORTANT:** The CMS Dockerfile includes a health check that references `/api/health`, but this endpoint doesn't exist yet. You need to add it before deployment.

### 7.1 Add Health Endpoint to CMS

Edit `apps/cms/src/server.ts` and add a health check endpoint:

```typescript
// Add this after the root redirect and before start()
app.get('/api/health', (_, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'verscienta-cms',
  })
})
```

The complete server.ts should look like:

```typescript
import { config } from 'dotenv'
import express from 'express'
import payload from 'payload'
import configPayload from '../payload.config.js'

const app = express()
const PORT = process.env.PORT || 3001

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})

// Health check endpoint for Docker
app.get('/api/health', (_, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'verscienta-cms',
  })
})

const start = async () => {
  // Initialize Payload
  await payload.init({
    config: configPayload,
  })

  // Add your own express routes here

  app.listen(PORT, async () => {
    payload.logger.info(`Server listening on port ${PORT}`)
    payload.logger.info(`Admin URL: http://localhost:${PORT}/admin`)
  })
}

start()
```

### 7.2 Commit and Push

```bash
git add apps/cms/src/server.ts
git commit -m "Add health check endpoint for CMS"
git push
```

---

## 🔧 Step 8: Post-Deployment Configuration

### 8.1 Create Admin User

1. Access Payload CMS: `https://backend.verscienta.com/admin`
2. Create your first admin account
3. This will be your super admin with full access

### 8.2 Verify CORS Configuration

The Payload CMS CORS is configured via the `NEXT_PUBLIC_APP_URL` environment variable in `apps/cms/payload.config.ts` (line 84).

Ensure the environment variable is set correctly to your frontend domain.

### 8.3 Set Up Algolia Indexes

1. Go to Algolia dashboard
2. Create indexes:
   - `verscienta_herbs`
   - `verscienta_formulas`
   - `verscienta_conditions`
   - `verscienta_practitioners`
   - `verscienta_modalities`
3. Configure searchable attributes (see SETUP_GUIDE.md)

### 8.4 Test the Application

**Core Features:**
1. Visit `https://verscienta.com`
2. Test authentication (login/register)
3. Create a test herb entry in CMS
4. Verify it appears on frontend
5. Test search functionality
6. Test AI symptom checker

**Mobile Features (New!):**

7. **Test Mobile APIs:**
   ```bash
   # Device registration
   curl -X POST https://verscienta.com/api/mobile/register-device \
     -H "Content-Type: application/json" \
     -d '{"deviceToken":"test-token-123","platform":"ios"}'

   # Mobile sync
   curl -X POST https://verscienta.com/api/mobile/sync \
     -H "Content-Type: application/json" \
     -d '{"collections":["herbs"]}'

   # App configuration
   curl https://verscienta.com/api/mobile/config

   # Image optimization
   curl "https://verscienta.com/api/images?url=https://example.com/image.jpg&w=400&q=80&f=webp"
   ```

8. **Test Dynamic Sitemap:**
   - Visit: `https://verscienta.com/server-sitemap.xml`
   - Verify individual herb/formula/condition URLs are listed
   - Check `lastmod` dates are accurate
   - Submit to Google Search Console

9. **Test Analytics (if deployed on Vercel):**
   - Analytics should automatically track page views
   - Speed Insights should report Web Vitals

---

## 📊 Step 9: Monitoring & Logging

### 9.1 Coolify Built-in Monitoring

Coolify provides:

- Container health status
- Resource usage (CPU, RAM, disk)
- Logs viewer
- Restart policies

### 9.2 Application Logging

Both applications log to stdout/stderr, which Coolify captures.

To view logs:

1. Go to service in Coolify
2. Click **Logs**
3. Filter by time range or search keywords

### 9.3 Set Up Alerts (Optional)

Configure Coolify to send alerts:

- Email notifications
- Webhook notifications
- Discord/Slack integration

---

## 🔐 Step 10: Security Best Practices

### 10.1 Environment Variables

- ✅ Use strong, random secrets (64+ characters)
- ✅ Never commit secrets to Git
- ✅ Rotate secrets periodically
- ✅ Use different secrets for staging/production

### 10.2 Database Security

- ✅ Use strong database passwords
- ✅ Restrict database access to application containers only
- ✅ Enable SSL/TLS for database connections
- ✅ Set up regular backups
- ✅ Configure `DATABASE_PROVIDER` for encryption at rest detection

### 10.3 Network Security

- ✅ Use HTTPS only (enforced by Coolify/Let's Encrypt)
- ✅ Configure firewall rules
- ✅ Use Cloudflare for DDoS protection (optional)
- ✅ Enable rate limiting with Redis/Upstash

### 10.4 HIPAA Compliance Considerations

- ✅ Enable session timeouts (especially for PHI pages)
- ✅ Consider enabling MFA for admin and PHI access
- ✅ Enable audit logging
- ✅ Use encrypted database connections
- ✅ Implement proper access controls

---

## 🔄 Step 11: Backup & Recovery

### 11.1 Database Backups

Coolify can automatically backup PostgreSQL:

1. Go to database service
2. Navigate to **Backups**
3. Configure:
   - Frequency (daily recommended)
   - Retention (30 days recommended)
   - Storage location

### 11.2 Manual Backup

```bash
# SSH into your server
ssh user@your-server.com

# Backup database (or use the pnpm command)
docker exec verscienta-db pg_dump -U verscienta_user verscienta_health > backup-$(date +%Y%m%d).sql

# Or from within the CMS container:
pnpm db:backup

# Download backup
scp user@your-server.com:backup-*.sql ./backups/
```

### 11.3 Restore from Backup

```bash
# Upload backup to server
scp backup.sql user@your-server.com:~/

# Restore
docker exec -i verscienta-db psql -U verscienta_user verscienta_health < backup.sql
```

---

## 🚨 Step 12: Troubleshooting

### Application won't start

1. Check logs in Coolify
2. Verify all environment variables are set
3. Check database connection
4. Ensure ports are not conflicting

### Database connection errors

1. Verify DATABASE_URL is correct
2. Check database service is running
3. Verify Docker network connectivity
4. Check database credentials

### Build failures

1. Check Dockerfile syntax
2. Verify pnpm-lock.yaml is committed
3. Check Node.js version (should be 20+)
4. Review build logs for specific errors

### 502 Bad Gateway

1. Check if application is running
2. Verify port configuration
3. Check reverse proxy settings in Coolify
4. Review application logs

---

## 📈 Step 13: Performance Optimization

### 13.1 Enable Caching

Add Redis for session storage:

1. Deploy Redis in Coolify
2. Update Better Auth config to use Redis
3. Configure Next.js caching

### 13.2 CDN Configuration

Use Cloudflare as CDN:

1. Point DNS to Cloudflare
2. Enable caching rules
3. Configure page rules
4. Use Cloudflare R2 for media storage (already configured)

### 13.3 Resource Limits

Set appropriate Docker resource limits in Coolify:

- **Frontend:** 1GB RAM, 1 CPU
- **Backend:** 2GB RAM, 1 CPU
- **Database:** 2GB RAM, 1 CPU

### 13.4 Enable Redis for Production

Use Upstash Redis for:
- Rate limiting
- Session storage
- Caching

Set the `REDIS_URL` and `REDIS_TOKEN` environment variables.

---

## 🔄 Step 14: Scaling

### Horizontal Scaling

Coolify supports multiple replicas:

1. Go to service settings
2. Increase **Replicas** count
3. Coolify will load balance automatically

### Vertical Scaling

1. Increase server resources (RAM, CPU)
2. Adjust Docker resource limits
3. Restart services

---

## 📞 Support

### Coolify Documentation

- https://coolify.io/docs

### Verscienta Health

- Email: support@verscientahealth.com
- Documentation: See README.md and SETUP_GUIDE.md

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Server with Coolify installed and configured
- [ ] Git repository pushed and accessible
- [ ] PostgreSQL 17+ database created in Coolify
- [ ] Algolia account and indexes created
- [ ] **Cloudflare R2 bucket created and configured** (for S3 storage plugin)
- [ ] Resend API key obtained
- [ ] Redis/Upstash account created (optional but recommended)
- [ ] **Critical:** Health check endpoint added to CMS (already done!)
- [ ] **New:** Shared packages built (`@verscienta/api-types`, `@verscienta/api-client`)

### Backend (CMS) Deployment
- [ ] CMS service created in Coolify
- [ ] Dockerfile location set: `apps/cms/Dockerfile`
- [ ] Build context set: `.` (root)
- [ ] All CMS environment variables configured
- [ ] Domain configured: `backend.verscienta.com`
- [ ] SSL/HTTPS enabled
- [ ] CMS deployed successfully
- [ ] Database migrations run (`pnpm db:migrate`)
- [ ] Health endpoint accessible: `/api/health`
- [ ] Admin user created

### Frontend (Web) Deployment
- [ ] Web service created in Coolify
- [ ] Dockerfile location set: `apps/web/Dockerfile`
- [ ] Build context set: `.` (root)
- [ ] All web environment variables configured (including mobile vars)
- [ ] Domain configured: `verscienta.com`
- [ ] SSL/HTTPS enabled
- [ ] Frontend deployed successfully
- [ ] Prisma client generated (if needed)
- [ ] **New:** Device token migration run (`npx prisma migrate deploy`)
- [ ] Health endpoint accessible: `/api/health`

### Post-Deployment Configuration
- [ ] Algolia indexes populated
- [ ] Test authentication (login/register)
- [ ] Test content creation in CMS
- [ ] **Test SEO plugin** - Create content and verify SEO tab appears
- [ ] Test search functionality
- [ ] Test AI symptom checker
- [ ] **Verify media uploads work (Cloudflare R2)** - Upload image in CMS
- [ ] Test email delivery (Resend)
- [ ] OAuth providers configured (if using)
- [ ] Rate limiting tested (Redis)

### Operations
- [ ] Automatic deployments via webhooks configured
- [ ] Database backups scheduled
- [ ] Monitoring and alerts configured
- [ ] Logs accessible and reviewed
- [ ] DNS configured correctly
- [ ] Cloudflare CDN configured (optional)
- [ ] Security headers verified
- [ ] HIPAA compliance measures enabled (if applicable)

### Final Verification
- [ ] All services running and healthy
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] All features working as expected
- [ ] Backup and restore tested
- [ ] Security audit completed

---

**Deployment Status:** Production-ready after completing checklist! 🚀

**Important Reminders:**
1. Never use `db:push` in production (use `db:migrate`)
2. Always use strong, random secrets (64+ characters)
3. Enable Redis for production rate limiting
4. Configure proper session timeouts for HIPAA compliance
5. Test backup restoration before going live
