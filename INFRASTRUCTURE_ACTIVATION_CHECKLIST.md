# Infrastructure Activation Checklist

**Quick reference for enabling production features**
**No Coolify deployment required - Just configuration!**

---

## 🎯 Quick Start (45 minutes total)

### 1. Sentry Error Tracking (10 min)

```bash
# 1. Sign up at https://sentry.io/signup/
# 2. Create project: Next.js → verscienta-health
# 3. Copy DSN from project settings
# 4. Add to .env.local:

SENTRY_DSN=https://abc123@o123.ingest.sentry.io/456
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123.ingest.sentry.io/456
SENTRY_ORG=your-org-name
SENTRY_PROJECT=verscienta-health
```

**Test**:
```bash
pnpm dev
# Create test page that throws error
# Click button, check Sentry dashboard
```

✅ **Status**: Configured in code, needs DSN only

---

### 2. Cloudflare Images ($5/month) (15 min)

```bash
# 1. Login to Cloudflare Dashboard
# 2. Images → Enable Cloudflare Images → Subscribe ($5/month)
# 3. Get credentials:
#    - Account ID: Dashboard → Account Home
#    - API Token: Profile → API Tokens → Create (Edit Cloudflare Images)
#    - Account Hash: Images → Overview → imagedelivery.net URL
# 4. Add to .env.local:

CLOUDFLARE_IMAGES_ENABLED=true
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_IMAGES_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_HASH=your-hash
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your-account-id
NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net
```

**Test**:
```bash
pnpm dev
# Go to http://localhost:3000/admin
# Upload image in Media collection
# Verify URL: https://imagedelivery.net/HASH/ID/public
```

✅ **Status**: Fully implemented, needs credentials only

---

### 3. Database Indexes (Auto-deploys)

**No action needed locally!**

✅ **Status**: 17 indexes defined in `prisma/schema.prisma`

Will auto-create when you run:
```bash
pnpm prisma migrate deploy  # On Coolify deployment
```

**Models with indexes**:
- User (5 indexes)
- Account (3 indexes)
- Session (6 indexes - most critical)
- Verification (2 indexes)
- PasswordHistory (1 index)

**Performance impact**:
- 10-100x faster queries
- Real-time security monitoring
- Efficient cleanup jobs

---

## 📋 Complete Environment Variables

Add these to `.env.local` for testing:

```bash
# ============================================
# SENTRY ERROR TRACKING
# ============================================
SENTRY_DSN=your-server-dsn
NEXT_PUBLIC_SENTRY_DSN=your-client-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=verscienta-health
# SENTRY_AUTH_TOKEN=optional-for-source-maps

# ============================================
# CLOUDFLARE IMAGES
# ============================================
CLOUDFLARE_IMAGES_ENABLED=true
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_IMAGES_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_HASH=your-hash
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your-account-id
NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net
```

---

## ✅ Testing Checklist

### Local Testing (Before Coolify)

**Sentry**:
- [ ] DSN added to `.env.local`
- [ ] App starts without errors: `pnpm dev`
- [ ] Test error shows in Sentry dashboard
- [ ] Session replay captures user actions

**Cloudflare Images**:
- [ ] Credentials added to `.env.local`
- [ ] App starts without errors: `pnpm dev`
- [ ] Image upload works in Payload admin
- [ ] Image URL uses `imagedelivery.net`
- [ ] Variants work: `/w=800`, `/format=webp`

**Database**:
- [ ] Schema file contains indexes
- [ ] `pnpm prisma generate` runs successfully
- [ ] Local queries work normally

---

## 🚀 Coolify Deployment (When Ready)

### Add Environment Variables to Coolify

1. Open Coolify project
2. Go to **Environment** tab
3. Add all variables from above
4. Save and redeploy

### Verify After Deployment

**Sentry**:
```bash
# Trigger an error on production
# Check Sentry dashboard for event
# Verify environment = "production"
# Check session replays are working
```

**Cloudflare Images**:
```bash
# Upload image via /admin
# Check image URL format
# Test variants: /w=800, /format=webp
# Verify CDN delivery (fast global access)
```

**Database Indexes**:
```bash
# SSH to Coolify PostgreSQL or use psql
psql $DATABASE_URL
\di  # List all indexes
# Should see 17+ indexes on User, Account, Session, etc.
```

---

## 💰 Monthly Costs

| Service | Plan | Cost |
|---------|------|------|
| Sentry | Developer | $26/month |
| Sentry | Team (recommended) | $80/month |
| Cloudflare Images | Standard | $5/month |
| Database Indexes | Free | $0 |
| **Minimum Total** | - | **$31/month** |
| **Recommended Total** | - | **$85/month** |

**ROI**:
- Sentry: Catch and fix bugs 10x faster
- Cloudflare Images: Save $100-500/month on bandwidth
- Database Indexes: 10-100x faster queries, better UX

---

## 🎯 What's Already Done

### ✅ Implemented in Code
- Database indexes (17 total)
- Sentry client & server config
- Cloudflare Images integration
- Rate limiting
- Content moderation
- Access logging

### 🔧 Just Needs Configuration
- Sentry DSN (from sentry.io)
- Cloudflare credentials (from dashboard)
- Environment variables (copy/paste)

### 🚀 Auto-Deploys
- Database indexes (on first migration)
- Sentry source maps (on build)
- Cloudflare Images (on first upload)

---

## 📝 Quick Command Reference

```bash
# Test locally
pnpm dev

# Check database indexes
pnpm prisma format
pnpm prisma generate

# Check Sentry integration
grep -r "SENTRY" .env.local

# Check Cloudflare Images
grep -r "CLOUDFLARE_IMAGES" .env.local

# Deploy to production (when ready)
# Just add env vars to Coolify and redeploy!
```

---

## ✨ Summary

**Time to enable**: 45 minutes
**Deployment required**: No (just configuration)
**Cost**: $31-85/month
**Benefit**: Production-grade error tracking, image CDN, database performance

**You're ready when**:
- ✅ Sentry DSN configured
- ✅ Cloudflare Images credentials added
- ✅ Tested locally with real credentials
- 🚀 Environment variables ready for Coolify

**Next step**: Add env vars to Coolify whenever you're ready to deploy!
