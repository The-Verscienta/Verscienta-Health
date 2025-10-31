# 🚀 Coolify Deployment Guide - Payload CMS

## Overview

Deploy Payload CMS to Coolify with PostgreSQL database. This setup gives you a production-ready CMS with automatic SSL, backups, and monitoring.

---

## Step 1: Set Up PostgreSQL on Coolify

### Option A: Add New PostgreSQL Service

1. **Log into your Coolify dashboard**
2. **Go to your project** (or create new one: "Verscienta Health")
3. **Add New Resource** → **Database** → **PostgreSQL**
4. **Configure:**
   - Name: `verscienta-postgres`
   - PostgreSQL Version: `17` (or latest)
   - Database Name: `verscienta_health`
   - Username: `verscienta_user`
   - Password: (generate secure password or use Coolify's)
   - Memory Limit: `512MB` (adjust based on your needs)
5. **Deploy** and wait for it to start

### Option B: Use Existing PostgreSQL

If you already have a PostgreSQL instance:
1. Note the connection details
2. Create a new database: `verscienta_health`
3. Create a user with full permissions on that database

---

## Step 2: Get Database Connection String

After PostgreSQL is deployed, Coolify will provide:

**Internal Connection String** (for apps in Coolify):
```
postgresql://verscienta_user:PASSWORD@verscienta-postgres:5432/verscienta_health
```

**External Connection String** (for local development):
```
postgresql://verscienta_user:PASSWORD@your-server.com:PORT/verscienta_health
```

**Copy this connection string** - you'll need it!

---

## Step 3: Update Local .env for Testing

Update `apps/payload-cms/.env`:

```bash
# Payload
PAYLOAD_SECRET=your-strong-secret-key-here
PAYLOAD_PUBLIC_SERVER_URL=https://cms.your-domain.com  # Your future domain
NODE_ENV=development

# Database (Coolify PostgreSQL)
DATABASE_URI=postgresql://verscienta_user:PASSWORD@your-server.com:PORT/verscienta_health

# Cloudflare Images
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_IMAGES_API_TOKEN=your-api-token
CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net

# Cloudflare R2
CLOUDFLARE_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_BUCKET_NAME=verscienta-media
CLOUDFLARE_ACCOUNT_HASH=your-account-hash

# Algolia
ALGOLIA_APP_ID=your-app-id
ALGOLIA_ADMIN_API_KEY=your-admin-key
ALGOLIA_SEARCH_API_KEY=your-search-key

# Trefle API
TREFLE_API_KEY=your-trefle-key
ENABLE_TREFLE_IMPORT=false
```

---

## Step 4: Run Migrations Locally (Against Coolify DB)

```bash
cd apps/payload-cms

# This will create all tables in your Coolify PostgreSQL
pnpm payload migrate

# Expected output:
# ✓ Connected to database
# ✓ Creating migration: verscienta_health_YYYYMMDDHHMMSS
# ✓ Creating tables for all 13 collections...
# ✓ Migrations complete!
```

---

## Step 5: Test Locally (Optional)

```bash
# Still in apps/payload-cms
pnpm dev

# Open http://localhost:3001/admin
# Create your first admin user
# Test creating content
```

---

## Step 6: Deploy Payload to Coolify

### A. Prepare the Repository

Your repo is already set up! Make sure to commit everything:

```bash
git add .
git commit -m "Add Payload CMS configuration"
git push
```

### B. Create New Application in Coolify

1. **In Coolify** → **Add New Resource** → **Application**
2. **Select your Git provider** (GitHub, GitLab, etc.)
3. **Select repository**: `verscienta-health`
4. **Configure Build:**
   - Name: `verscienta-payload-cms`
   - Branch: `main`
   - Build Pack: `nixpacks` or `dockerfile`
   - Build Command: `pnpm install && pnpm --filter @verscienta/payload-cms build`
   - Start Command: `pnpm --filter @verscienta/payload-cms start`
   - Base Directory: `/` (root)
   - Port: `3001`

### C. Set Environment Variables in Coolify

Add all environment variables from your `.env`:

**Critical Variables:**
```
PAYLOAD_SECRET=your-strong-secret-key
PAYLOAD_PUBLIC_SERVER_URL=https://cms.your-domain.com
NODE_ENV=production
PORT=3001

# Database (use INTERNAL connection string)
DATABASE_URI=postgresql://verscienta_user:PASSWORD@verscienta-postgres:5432/verscienta_health

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_IMAGES_API_TOKEN=...
CLOUDFLARE_IMAGES_DELIVERY_URL=...
CLOUDFLARE_ACCESS_KEY_ID=...
CLOUDFLARE_SECRET_ACCESS_KEY=...
CLOUDFLARE_BUCKET_NAME=...
CLOUDFLARE_ACCOUNT_HASH=...

# Algolia
ALGOLIA_APP_ID=...
ALGOLIA_ADMIN_API_KEY=...
ALGOLIA_SEARCH_API_KEY=...

# Trefle
TREFLE_API_KEY=...
ENABLE_TREFLE_IMPORT=false

# Frontend
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com
```

### D. Configure Domain

1. **Add Custom Domain** in Coolify: `cms.your-domain.com`
2. **SSL Certificate**: Coolify auto-generates via Let's Encrypt
3. **DNS**: Point your domain to Coolify server IP

### E. Deploy!

1. **Click "Deploy"** in Coolify
2. **Monitor build logs**
3. **Wait for deployment** (first build takes 5-10 minutes)
4. **Access**: https://cms.your-domain.com/admin

---

## Step 7: Create Admin User on Production

Option A: **Via API** (first user signup is open):
```bash
curl -X POST https://cms.your-domain.com/api/users/first-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@your-domain.com",
    "password": "your-secure-password",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

Option B: **Via Admin Panel**:
1. Visit https://cms.your-domain.com/admin
2. You'll see "Create First User" page
3. Fill in details
4. Click "Create"

---

## Step 8: Deploy Frontend (Next.js) to Coolify

### A. Create Frontend Application

1. **Coolify** → **Add Application**
2. **Same repository**: `verscienta-health`
3. **Configure:**
   - Name: `verscienta-web`
   - Branch: `main`
   - Build Command: `pnpm install && pnpm --filter @verscienta/web build`
   - Start Command: `pnpm --filter @verscienta/web start`
   - Port: `3000`

### B. Set Frontend Environment Variables

```
NODE_ENV=production
PORT=3000

# App URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_CMS_URL=https://cms.your-domain.com

# Database (for better-auth)
DATABASE_URL=postgresql://verscienta_user:PASSWORD@verscienta-postgres:5432/verscienta_health

# Better Auth
BETTER_AUTH_SECRET=your-auth-secret
BETTER_AUTH_URL=https://your-domain.com

# Algolia (public keys)
NEXT_PUBLIC_ALGOLIA_APP_ID=...
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=...

# Grok API
GROK_API_KEY=...
```

### C. Configure Domain & Deploy

1. **Domain**: `your-domain.com`
2. **Deploy**
3. **Access**: https://your-domain.com

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Coolify Server                      │
│                                                      │
│  ┌──────────────────┐      ┌────────────────────┐  │
│  │  PostgreSQL      │◄─────┤  Payload CMS       │  │
│  │  verscienta_health│      │  (Next.js app)     │  │
│  │  Port: 5432      │      │  Port: 3001        │  │
│  └──────────────────┘      └────────────────────┘  │
│                                      ▲              │
│                                      │              │
│                             ┌────────┴─────────┐   │
│                             │  Next.js Frontend│   │
│                             │  Port: 3000      │   │
│                             └──────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
           │                          │
           │ SSL/HTTPS                │ SSL/HTTPS
           ▼                          ▼
    cms.your-domain.com        your-domain.com
```

---

## 🔧 Post-Deployment Configuration

### 1. Verify Migrations

SSH into Coolify container or use Coolify's terminal:

```bash
# Check migration status
cd /app
pnpm payload migrate:status

# Should show all migrations as "up"
```

### 2. Test API Endpoints

```bash
# Test collection access
curl https://cms.your-domain.com/api/herbs

# Test authentication
curl https://cms.your-domain.com/api/users/me
```

### 3. Set Up Backups

In Coolify:
1. Go to PostgreSQL resource
2. Enable **Automatic Backups**
3. Configure backup schedule (daily recommended)
4. Test restore procedure

### 4. Enable Monitoring

- **Coolify Metrics**: Built-in CPU, memory, disk monitoring
- **Logs**: Real-time logs in Coolify dashboard
- **Alerts**: Configure Discord/Slack/email alerts for downtime

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All code committed and pushed to Git
- [ ] `.env.example` files updated with all required variables
- [ ] Build tested locally
- [ ] Migrations tested against Coolify DB

### Coolify Setup
- [ ] PostgreSQL service deployed and running
- [ ] Database migrations completed
- [ ] Payload CMS app created and configured
- [ ] Environment variables set in Coolify
- [ ] Domain configured (SSL enabled)

### Post-Deployment
- [ ] Admin user created in production
- [ ] Can access admin panel
- [ ] Can create/edit content
- [ ] API endpoints responding
- [ ] Frontend deployed (if doing full stack)
- [ ] Frontend can fetch from CMS API
- [ ] Backups configured
- [ ] Monitoring enabled

---

## 🐛 Troubleshooting

### Build Fails

**Check logs in Coolify:**
- Look for dependency errors
- Check Node.js version (should be 18+)
- Verify build commands are correct
- Check `pnpm-lock.yaml` is committed

**Common fixes:**
```bash
# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "Update lockfile"
git push
```

### Can't Connect to Database

- Verify DATABASE_URI in environment variables
- Check PostgreSQL service is running in Coolify
- Use INTERNAL connection string (not external) in Coolify
- Check database name, username, password are correct

### Migration Errors

```bash
# SSH into Coolify container
cd /app/apps/payload-cms

# Check migration status
pnpm payload migrate:status

# Force create migrations
pnpm payload migrate:create

# Run migrations
pnpm payload migrate
```

### 502 Bad Gateway

- App didn't start properly
- Check logs for errors
- Verify PORT environment variable (should be 3001)
- Check start command is correct

### "Cannot find module" Errors

- Missing dependencies
- Run: `pnpm install --frozen-lockfile`
- Check all workspace dependencies are correct

---

## 📈 Scaling Considerations

### Database
- Start with 512MB memory for PostgreSQL
- Scale up based on usage
- Add read replicas for high traffic
- Enable connection pooling (PgBouncer)

### Payload CMS
- Start with 512MB-1GB RAM
- Scale horizontally (multiple instances)
- Use Redis for session storage (optional)
- Enable caching for API responses

### Cloudflare Images
- Handles scaling automatically
- CDN for global delivery
- Automatic optimization

---

## 💰 Cost Estimate

**Assuming Coolify on a VPS:**

- VPS (4GB RAM, 2 vCPU): ~$10-20/month
- Coolify: Free (self-hosted)
- PostgreSQL: Included in VPS
- Payload CMS: Included in VPS
- Cloudflare Images: ~$5/month (100k images)
- Domain: ~$10/year

**Total: ~$15-25/month** for full stack

---

## 🎯 Next Steps After Deployment

1. ✅ Database & Payload deployed on Coolify
2. 📋 Port Trefle integration (background jobs)
3. 📋 Set up Algolia search
4. 📋 Deploy frontend
5. 📋 Configure CI/CD for automatic deployments
6. 📋 Set up monitoring and alerts

---

## 📚 Resources

- **Coolify Docs**: https://coolify.io/docs
- **Payload Docs**: https://payloadcms.com/docs
- **Your Coolify Dashboard**: Your instance URL
- **GitHub Repo**: https://github.com/[your-username]/verscienta-health

---

**Ready to deploy? Start with Step 1 - setting up PostgreSQL on Coolify!** 🚀
