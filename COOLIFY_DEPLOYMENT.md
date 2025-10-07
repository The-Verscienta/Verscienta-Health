# Coolify Deployment Guide - Verscienta Health

This guide covers deploying Verscienta Health to a server running Coolify.

## 📋 Overview

**Deployment Platform:** Coolify (Self-hosted)
**Architecture:** Monorepo (Turborepo + pnpm)
**Services Required:**

- Next.js Frontend (Port 3000)
- Payload CMS Backend (Port 3001)
- PostgreSQL 17+ Database
- Redis (optional, for caching)

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

## 🐳 Step 2: Create Docker Configuration

### 2.1 Frontend Dockerfile (`apps/web/Dockerfile`)

Create this file:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Set working directory
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web

# Build the application
RUN pnpm --filter web build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy necessary files
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the application
CMD ["node", "apps/web/server.js"]
```

### 2.2 Backend Dockerfile (`apps/cms/Dockerfile`)

Create this file:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Set working directory
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/cms/package.json ./apps/cms/
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/cms ./apps/cms

# Build the application
RUN pnpm --filter cms build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy built application
COPY --from=builder /app/apps/cms/dist ./dist
COPY --from=builder /app/apps/cms/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start the application
CMD ["node", "dist/server.js"]
```

### 2.3 Update Next.js Config

Update `apps/web/next.config.ts` to enable standalone output:

```typescript
export default {
  // ... existing config
  output: 'standalone',
  // ... rest of config
}
```

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

# Payload CMS
PAYLOAD_SECRET=<generate-a-secure-random-string-64-chars>

# Algolia
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_ADMIN_KEY=your_algolia_admin_key

# Cloudflare Images
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_IMAGES_API_TOKEN=your_cloudflare_token

# Email (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=cms@verscienta.com

# Frontend URL (for CORS)
FRONTEND_URL=https://verscienta.com

# Nominatim (Geocoding)
NOMINATIM_USER_AGENT=Verscienta Health App
```

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
pnpm db:push
```

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
PORT=3000

# Payload CMS API
NEXT_PUBLIC_CMS_URL=https://backend.verscienta.com

# Database (for Better Auth)
DATABASE_URL=postgresql://verscienta_user:PASSWORD@verscienta-db:5432/verscienta_health

# Better Auth
BETTER_AUTH_SECRET=<generate-a-secure-random-string-64-chars>
BETTER_AUTH_URL=https://verscienta.com

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Algolia Search
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_algolia_search_key

# Cloudflare Images
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
NEXT_PUBLIC_CLOUDFLARE_IMAGES_URL=https://imagedelivery.net/your_hash

# Grok AI
GROK_API_KEY=your_grok_api_key

# Email (for Better Auth)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM=noreply@verscienta.com

# Cloudflare Turnstile (Optional)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

### 5.3 Configure Domain

1. Set **Domain:** `verscienta.com`
2. Enable **HTTPS** (Let's Encrypt)
3. Click **Deploy**

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

## 🔧 Step 7: Post-Deployment Configuration

### 7.1 Create Admin User

1. Access Payload CMS: `https://backend.verscienta.com/admin`
2. Create your first admin account
3. This will be your super admin with full access

### 7.2 Configure CORS

Ensure Payload CMS allows requests from your frontend domain.

In `apps/cms/payload.config.ts`, the CORS is configured via `FRONTEND_URL` env variable.

### 7.3 Set Up Algolia Indexes

1. Go to Algolia dashboard
2. Create indexes:
   - `verscienta_herbs`
   - `verscienta_formulas`
   - `verscienta_conditions`
   - `verscienta_practitioners`
   - `verscienta_modalities`
3. Configure searchable attributes (see SETUP_GUIDE.md)

### 7.4 Test the Application

1. Visit `https://verscienta.com`
2. Test authentication (login/register)
3. Create a test herb entry in CMS
4. Verify it appears on frontend
5. Test search functionality
6. Test AI symptom checker

---

## 📊 Step 8: Monitoring & Logging

### 8.1 Coolify Built-in Monitoring

Coolify provides:

- Container health status
- Resource usage (CPU, RAM, disk)
- Logs viewer
- Restart policies

### 8.2 Application Logging

Both applications log to stdout/stderr, which Coolify captures.

To view logs:

1. Go to service in Coolify
2. Click **Logs**
3. Filter by time range or search keywords

### 8.3 Set Up Alerts (Optional)

Configure Coolify to send alerts:

- Email notifications
- Webhook notifications
- Discord/Slack integration

---

## 🔐 Security Best Practices

### 8.1 Environment Variables

- ✅ Use strong, random secrets (64+ characters)
- ✅ Never commit secrets to Git
- ✅ Rotate secrets periodically
- ✅ Use different secrets for staging/production

### 8.2 Database Security

- ✅ Use strong database passwords
- ✅ Restrict database access to application containers only
- ✅ Enable SSL/TLS for database connections
- ✅ Set up regular backups

### 8.3 Network Security

- ✅ Use HTTPS only (enforced by Coolify/Let's Encrypt)
- ✅ Configure firewall rules
- ✅ Use Cloudflare for DDoS protection (optional)
- ✅ Enable rate limiting

---

## 🔄 Backup & Recovery

### 9.1 Database Backups

Coolify can automatically backup PostgreSQL:

1. Go to database service
2. Navigate to **Backups**
3. Configure:
   - Frequency (daily recommended)
   - Retention (30 days recommended)
   - Storage location

### 9.2 Manual Backup

```bash
# SSH into your server
ssh user@your-server.com

# Backup database
docker exec verscienta-db pg_dump -U verscienta_user verscienta_health > backup-$(date +%Y%m%d).sql

# Download backup
scp user@your-server.com:backup-*.sql ./backups/
```

### 9.3 Restore from Backup

```bash
# Upload backup to server
scp backup.sql user@your-server.com:~/

# Restore
docker exec -i verscienta-db psql -U verscienta_user verscienta_health < backup.sql
```

---

## 🚨 Troubleshooting

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

## 📈 Performance Optimization

### 10.1 Enable Caching

Add Redis for session storage:

1. Deploy Redis in Coolify
2. Update Better Auth config to use Redis
3. Configure Next.js caching

### 10.2 CDN Configuration

Use Cloudflare as CDN:

1. Point DNS to Cloudflare
2. Enable caching rules
3. Configure page rules
4. Enable Cloudflare Images

### 10.3 Resource Limits

Set appropriate Docker resource limits in Coolify:

- **Frontend:** 1GB RAM, 1 CPU
- **Backend:** 2GB RAM, 1 CPU
- **Database:** 2GB RAM, 1 CPU

---

## 🔄 Scaling

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

- [ ] Server with Coolify installed
- [ ] Git repository connected to Coolify
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Dockerfiles created and tested
- [ ] Backend (CMS) deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Algolia indexes configured
- [ ] SSL/HTTPS enabled
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Test all functionality
- [ ] DNS configured correctly
- [ ] OAuth providers configured (if using)

---

**Deployment Status:** Ready for production with Coolify! 🚀
