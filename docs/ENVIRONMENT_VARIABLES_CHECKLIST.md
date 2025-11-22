# Environment Variables Checklist - Verscienta Health

**Last Updated**: 2025-01-20
**Version**: 2.0
**Architecture**: Next.js 15.4.3 + PayloadCMS 3.62.1

---

## 📋 Quick Reference

**Total Variables**: 80+
**Required for Basic Operation**: 20
**Required for Full Features**: 45+
**Optional**: 35+

---

## ✅ Deployment Checklist

Use this checklist when deploying to ensure all necessary environment variables are configured.

### 🔴 Critical - Required for App to Start

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `PAYLOAD_SECRET` - Payload CMS secret (32+ chars)
- [ ] `PAYLOAD_PUBLIC_SERVER_URL` - Public app URL
- [ ] `BETTER_AUTH_SECRET` - Authentication secret
- [ ] `BETTER_AUTH_URL` - Auth service URL
- [ ] `ENCRYPTION_KEY` - Data encryption key (32 chars)
- [ ] `NEXT_PUBLIC_APP_URL` - Public app URL
- [ ] `NODE_ENV` - Environment (development/production)

**Minimum 8 variables required to start the application.**

### 🟠 High Priority - Required for Core Features

#### Authentication & Security
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth (if using)
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- [ ] `GITHUB_CLIENT_ID` - GitHub OAuth (if using)
- [ ] `GITHUB_CLIENT_SECRET` - GitHub OAuth secret
- [ ] `SESSION_TIMEOUT` - Session expiration (86400)
- [ ] `PHI_SESSION_TIMEOUT` - PHI page timeout (900)
- [ ] `REQUIRE_MFA_FOR_ADMIN` - MFA requirement (true)

#### Media & Storage
- [ ] `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account
- [ ] `CLOUDFLARE_ACCESS_KEY_ID` - R2 access key
- [ ] `CLOUDFLARE_SECRET_ACCESS_KEY` - R2 secret key
- [ ] `CLOUDFLARE_BUCKET_NAME` - R2 bucket name
- [ ] `CLOUDFLARE_IMAGES_API_TOKEN` - Images API token
- [ ] `CLOUDFLARE_IMAGES_ENABLED` - Enable optimization (true)

#### Search
- [ ] `ALGOLIA_APP_ID` - Algolia application ID
- [ ] `ALGOLIA_ADMIN_API_KEY` - Admin key for indexing
- [ ] `NEXT_PUBLIC_ALGOLIA_APP_ID` - Public app ID
- [ ] `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY` - Public search key

#### Caching & Rate Limiting
- [ ] `REDIS_URL` - Redis/DragonflyDB connection URL

#### Email
- [ ] `RESEND_API_KEY` - Resend email service key
- [ ] `RESEND_FROM_EMAIL` - Sender email address
- [ ] `ADMIN_EMAIL` - Admin notification email

**Additional 26 variables for full core functionality.**

### 🟡 Medium Priority - Enhanced Features

#### AI Features
- [ ] `GROK_API_KEY` - Grok AI for symptom checker
- [ ] `GROK_API_URL` - API endpoint (optional)
- [ ] `GROK_MODEL` - Model selection (optional)

#### External APIs
- [ ] `TREFLE_API_KEY` - Botanical data
- [ ] `PERENUAL_API_KEY` - Plant care data

#### Bot Protection
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile
- [ ] `TURNSTILE_SECRET_KEY` - Turnstile secret

#### Error Tracking
- [ ] `SENTRY_DSN` - Sentry error tracking
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Public Sentry DSN
- [ ] `SENTRY_ORG` - Sentry organization
- [ ] `SENTRY_PROJECT` - Sentry project name

**Additional 11 variables for enhanced features.**

### 🟢 Optional - Advanced Configuration

#### Database Advanced
- [ ] `DATABASE_PROVIDER` - Provider type (custom/aws-rds/etc)
- [ ] `DATABASE_ENCRYPTION_KEY` - Column encryption key

#### Redis Advanced
- [ ] `REDIS_HOST` - Individual host parameter
- [ ] `REDIS_PORT` - Individual port parameter
- [ ] `REDIS_PASSWORD` - Redis password
- [ ] `REDIS_DB` - Database number
- [ ] `REDIS_TLS` - Enable TLS (true/false)
- [ ] `REDIS_TLS_MIN_VERSION` - Minimum TLS version
- [ ] `REDIS_TLS_MAX_VERSION` - Maximum TLS version
- [ ] `CERT_MONITOR_ENABLED` - Certificate monitoring
- [ ] `CERT_EXPIRY_WARNING_DAYS` - Warning threshold
- [ ] `CERT_EXPIRY_CRITICAL_DAYS` - Critical threshold
- [ ] `ALERT_EMAIL` - Certificate alert email

#### Mobile App (Future)
- [ ] `MOBILE_OFFLINE_MODE` - Enable offline mode
- [ ] `MOBILE_PUSH_NOTIFICATIONS` - Enable push notifications
- [ ] `MIN_SUPPORTED_APP_VERSION` - Minimum version
- [ ] `ALLOWED_CORS_ORIGINS` - Mobile CORS origins

#### Development
- [ ] `PORT` - Server port (default: 3000)
- [ ] `DEBUG` - Debug logging
- [ ] `NEXT_TELEMETRY_DISABLED` - Disable telemetry

**Additional 20+ optional variables for advanced configuration.**

---

## 📚 Detailed Variable Documentation

### 1. Database Configuration

#### `DATABASE_URL` (Required)
- **Description**: PostgreSQL connection string
- **Format**: `postgresql://user:password@host:5432/database`
- **Example**: `postgresql://verscienta:pass123@localhost:5432/verscienta_health`
- **Notes**:
  - Must use PostgreSQL 17+
  - Requires pgvector extension
  - Production should use SSL: `?sslmode=verify-full`

#### `DATABASE_PROVIDER` (Optional)
- **Description**: Database hosting provider
- **Options**: `custom`, `aws-rds`, `digitalocean`, `supabase`, `render`
- **Default**: `custom`
- **Usage**: Helps detect encryption-at-rest capabilities

#### `DATABASE_ENCRYPTION_KEY` (Optional - HIPAA)
- **Description**: Key for column-level encryption
- **Format**: 32-character base64 string
- **Generate**: `openssl rand -base64 32`
- **Usage**: Encrypts sensitive PHI fields

---

### 2. Payload CMS Configuration

#### `PAYLOAD_SECRET` (Required)
- **Description**: Secret key for Payload CMS
- **Format**: Random string 32+ characters
- **Generate**: `openssl rand -base64 32`
- **Security**: Keep secret, rotate periodically

#### `PAYLOAD_PUBLIC_SERVER_URL` (Required)
- **Description**: Public URL where app is accessible
- **Format**: Full URL with protocol
- **Example**: `https://verscienta.com`
- **Notes**: Used for generating absolute URLs

---

### 3. Next.js Configuration

#### `NEXT_PUBLIC_APP_URL` (Required)
- **Description**: Public-facing application URL
- **Format**: Full URL with protocol
- **Example**: `https://verscienta.com`
- **Exposed**: ✅ Available in browser

#### `NEXT_PUBLIC_WEB_URL` (Required)
- **Description**: Web app URL (usually same as APP_URL)
- **Format**: Full URL with protocol
- **Example**: `https://verscienta.com`

#### `NEXT_PUBLIC_CMS_URL` (Required)
- **Description**: CMS URL (same as app in unified architecture)
- **Format**: Full URL with protocol
- **Example**: `https://verscienta.com`

#### `NODE_ENV` (Required)
- **Description**: Node environment
- **Options**: `development`, `production`, `test`
- **Default**: `development`
- **Usage**: Controls optimizations and logging

#### `PORT` (Optional)
- **Description**: Server port
- **Default**: `3000`
- **Notes**: Usually auto-configured by hosting platform

---

### 4. Authentication (Better Auth)

#### `BETTER_AUTH_SECRET` (Required)
- **Description**: Session signing secret
- **Format**: Random string 32+ characters
- **Generate**: `openssl rand -base64 32`
- **Security**: Critical for session security

#### `BETTER_AUTH_URL` (Required)
- **Description**: Authentication service URL
- **Format**: Full URL with protocol
- **Example**: `https://verscienta.com`

#### `ENCRYPTION_KEY` (Required)
- **Description**: Encryption key for sensitive data
- **Format**: Exactly 32 characters
- **Generate**: `openssl rand -hex 16`
- **Usage**: Encrypts tokens and sensitive fields

#### OAuth Providers (Optional)

##### `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- **Description**: Google OAuth credentials
- **Get From**: Google Cloud Console
- **Setup**: https://console.cloud.google.com/
- **Scopes**: email, profile

##### `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`
- **Description**: GitHub OAuth credentials
- **Get From**: GitHub Developer Settings
- **Setup**: https://github.com/settings/developers
- **Scopes**: user:email

---

### 5. Cloudflare Services

#### R2 Storage (Media Files)

##### `CLOUDFLARE_ACCOUNT_ID` (Required)
- **Description**: Cloudflare account ID
- **Find**: Cloudflare Dashboard → Account ID in URL

##### `CLOUDFLARE_ACCESS_KEY_ID` (Required)
- **Description**: R2 S3-compatible access key
- **Find**: R2 → Manage R2 API Tokens

##### `CLOUDFLARE_SECRET_ACCESS_KEY` (Required)
- **Description**: R2 S3-compatible secret key
- **Security**: Keep secret, rotate if compromised

##### `CLOUDFLARE_BUCKET_NAME` (Required)
- **Description**: R2 bucket name for media storage
- **Example**: `verscienta-media`
- **Setup**: Create in Cloudflare R2 dashboard

##### `CLOUDFLARE_ACCOUNT_HASH` (Required)
- **Description**: Account hash for image URLs
- **Find**: Cloudflare Images → Account Hash
- **Usage**: Constructs image delivery URLs

#### Cloudflare Images (Optimization)

##### `CLOUDFLARE_IMAGES_ENABLED` (Required)
- **Description**: Enable Cloudflare Images optimization
- **Options**: `true`, `false`
- **Cost**: $5/month for 100K images

##### `CLOUDFLARE_IMAGES_API_TOKEN` (Required if enabled)
- **Description**: API token for Cloudflare Images
- **Generate**: Cloudflare Dashboard → API Tokens
- **Permissions**: Cloudflare Images Edit

##### `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID` (Required if enabled)
- **Description**: Public account ID for image delivery
- **Exposed**: ✅ Available in browser

##### `NEXT_PUBLIC_CLOUDFLARE_IMAGES_DELIVERY_URL` (Required if enabled)
- **Description**: Image delivery CDN URL
- **Default**: `https://imagedelivery.net`
- **Usage**: Base URL for optimized images

#### Cloudflare Turnstile (Bot Protection)

##### `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Optional)
- **Description**: Turnstile site key (CAPTCHA alternative)
- **Get From**: Cloudflare Turnstile dashboard
- **Exposed**: ✅ Available in browser

##### `TURNSTILE_SECRET_KEY` (Optional)
- **Description**: Turnstile secret key for verification
- **Security**: Keep secret, server-side only

---

### 6. Algolia Search

#### `ALGOLIA_APP_ID` (Required)
- **Description**: Algolia application ID
- **Get From**: Algolia Dashboard → API Keys
- **Usage**: Identifies your Algolia app

#### `ALGOLIA_ADMIN_API_KEY` (Required)
- **Description**: Admin API key for indexing
- **Security**: Keep secret, server-side only
- **Permissions**: Write access to indices

#### `NEXT_PUBLIC_ALGOLIA_APP_ID` (Required)
- **Description**: Public application ID
- **Exposed**: ✅ Available in browser
- **Usage**: Client-side search

#### `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY` (Required)
- **Description**: Public search-only API key
- **Exposed**: ✅ Available in browser
- **Security**: Read-only, safe to expose

---

### 7. Redis / DragonflyDB (Caching & Rate Limiting)

#### Option 1: Connection URL (Recommended)

##### `REDIS_URL` (Required)
- **Description**: Complete Redis connection URL
- **Format**: `redis://[user:password@]host:port[/db]`
- **Examples**:
  - Plain: `redis://localhost:6379`
  - With password: `redis://:mypassword@redis-host:6379`
  - With TLS: `rediss://:mypassword@redis-host:6379`
- **Notes**: `rediss://` enables TLS automatically

#### Option 2: Individual Parameters (Fallback)

##### `REDIS_HOST` (Optional)
- **Description**: Redis server hostname
- **Default**: `localhost`

##### `REDIS_PORT` (Optional)
- **Description**: Redis server port
- **Default**: `6379`

##### `REDIS_PASSWORD` (Optional)
- **Description**: Redis authentication password
- **Security**: Required in production

##### `REDIS_DB` (Optional)
- **Description**: Redis database number
- **Default**: `0`
- **Range**: 0-15

#### TLS Configuration (Production)

##### `REDIS_TLS` (Optional)
- **Description**: Enable TLS/SSL encryption
- **Options**: `true`, `false`
- **Default**: `false`
- **Required**: Production environments

##### `REDIS_TLS_MIN_VERSION` (Optional)
- **Description**: Minimum TLS version
- **Options**: `TLSv1.2`, `TLSv1.3`
- **Default**: `TLSv1.2`
- **Compliance**: HIPAA requires TLSv1.2+

##### `REDIS_TLS_MAX_VERSION` (Optional)
- **Description**: Maximum TLS version
- **Options**: `TLSv1.2`, `TLSv1.3`
- **Default**: `TLSv1.3`

#### Certificate Monitoring

##### `CERT_MONITOR_ENABLED` (Optional)
- **Description**: Monitor TLS certificate expiration
- **Options**: `true`, `false`
- **Default**: `true` in production

##### `CERT_EXPIRY_WARNING_DAYS` (Optional)
- **Description**: Warning threshold (days before expiry)
- **Default**: `30`
- **Usage**: Sends warning alerts

##### `CERT_EXPIRY_CRITICAL_DAYS` (Optional)
- **Description**: Critical threshold (days before expiry)
- **Default**: `7`
- **Usage**: Sends urgent alerts

##### `ALERT_EMAIL` (Optional)
- **Description**: Email for certificate alerts
- **Example**: `admin@verscienta.com`
- **Usage**: Receives expiration notifications

---

### 8. Email Service (Resend)

#### `RESEND_API_KEY` (Required)
- **Description**: Resend email service API key
- **Get From**: https://resend.com/api-keys
- **Format**: `re_xxxxxxxxxx`
- **Usage**: Sends all transactional emails

#### `RESEND_FROM_EMAIL` (Required)
- **Description**: Sender email address
- **Format**: `name@domain.com` or `Name <name@domain.com>`
- **Example**: `Verscienta Health <noreply@verscienta.com>`
- **Requirements**: Domain must be verified in Resend

#### `ADMIN_EMAIL` (Required)
- **Description**: Admin email for notifications
- **Example**: `admin@verscienta.com`
- **Usage**: Receives alerts, security notifications, contact form

---

### 9. AI Services (Grok AI / xAI)

#### `GROK_API_KEY` (Required for AI features)
- **Description**: Grok AI API key from xAI
- **Get From**: https://console.x.ai/
- **Usage**: Powers symptom checker and AI recommendations
- **Cost**: ~$5-10 per 1M tokens

#### `GROK_API_URL` (Optional)
- **Description**: Grok API endpoint URL
- **Default**: `https://api.x.ai/v1/chat/completions`
- **Override**: Only if using custom endpoint

#### `GROK_MODEL` (Optional)
- **Description**: Grok model to use
- **Options**: `grok-beta`, `grok-1`, `grok-2`
- **Default**: `grok-beta`
- **Notes**: Newer models may have different pricing

---

### 10. External APIs (Botanical Data)

#### `TREFLE_API_KEY` (Optional)
- **Description**: Trefle botanical database API key for 1M+ plant species
- **Get From**: https://trefle.io/
- **Usage**: Enriches herb data with botanical info, scientific name validation, distribution data, toxicity info
- **Free Tier**: 120 requests/minute, 5,000 requests/day
- **Features**:
  - Scientific name validation
  - Distribution data (native/introduced regions)
  - Plant images, taxonomy, growth data
  - Edibility and toxicity information
  - Enhanced retry logic with circuit breaker
- **Related Docs**: `docs/TREFLE_RETRY_LOGIC.md`, `docs/TREFLE_INTEGRATION.md`
- **Example**: `TREFLE_API_KEY=your-trefle-api-key-here`

#### `TREFLE_API_URL` (Optional)
- **Description**: Trefle API base URL (use default unless using custom endpoint)
- **Default**: `https://trefle.io/api/v1`
- **Usage**: Override for testing or custom Trefle endpoints
- **Example**: `TREFLE_API_URL=https://trefle.io/api/v1`

#### `PERENUAL_API_KEY` (Optional)
- **Description**: Perenual plant care API key for 10,000+ species
- **Get From**: https://perenual.com/docs/api
- **Usage**: Plant care and cultivation data, TCM pattern analysis
- **Free Tier**: 60 requests/minute, unlimited requests/day
- **Features**:
  - Cultivation guides (watering, sunlight, soil)
  - Pest and disease information
  - Hardiness zones and care levels
  - Enhanced retry logic with circuit breaker
- **Related Docs**: `docs/API_RETRY_LOGIC.md`, `docs/PERENUAL_IMPLEMENTATION_COMPLETE.md`
- **Example**: `PERENUAL_API_KEY=your-perenual-api-key-here`

#### `PERENUAL_API_URL` (Optional)
- **Description**: Perenual API base URL (use default unless using custom endpoint)
- **Default**: `https://perenual.com/api`
- **Usage**: Override for testing or custom Perenual endpoints
- **Example**: `PERENUAL_API_URL=https://perenual.com/api`

---

### 11. Error Tracking (Sentry)

#### `SENTRY_DSN` (Optional but Recommended)
- **Description**: Sentry Data Source Name (server-side)
- **Get From**: Sentry.io → Project Settings → Client Keys
- **Format**: `https://[key]@[org].ingest.sentry.io/[project]`
- **Usage**: Tracks server-side errors

#### `NEXT_PUBLIC_SENTRY_DSN` (Optional but Recommended)
- **Description**: Sentry DSN (client-side)
- **Exposed**: ✅ Available in browser
- **Usage**: Tracks client-side errors

#### `SENTRY_ORG` (Optional)
- **Description**: Sentry organization slug
- **Example**: `verscienta-health`

#### `SENTRY_PROJECT` (Optional)
- **Description**: Sentry project name
- **Example**: `web-app`

#### `SENTRY_AUTH_TOKEN` (Optional)
- **Description**: Auth token for source map uploads
- **Usage**: Enables readable stack traces
- **Generate**: Sentry → Settings → Auth Tokens

---

### 12. Security & HIPAA Compliance

#### `SESSION_TIMEOUT` (Required)
- **Description**: General session timeout (seconds)
- **Default**: `86400` (24 hours)
- **HIPAA**: Should be ≤24 hours

#### `PHI_SESSION_TIMEOUT` (Required)
- **Description**: PHI page idle timeout (seconds)
- **Default**: `900` (15 minutes)
- **HIPAA**: Recommended ≤15 minutes for PHI access

#### `REQUIRE_MFA_FOR_ADMIN` (Required)
- **Description**: Require MFA for admin users
- **Options**: `true`, `false`
- **Default**: `true`
- **HIPAA**: Should be `true`

#### `REQUIRE_MFA_FOR_PHI_ACCESS` (Optional)
- **Description**: Require MFA for PHI access
- **Options**: `true`, `false`
- **Default**: `false`
- **Recommendation**: Set to `true` in production

---

### 13. Mobile App Configuration (Future)

#### `MOBILE_OFFLINE_MODE` (Optional)
- **Description**: Enable offline mode in mobile apps
- **Options**: `true`, `false`
- **Default**: `false`
- **Status**: Planned feature

#### `MOBILE_PUSH_NOTIFICATIONS` (Optional)
- **Description**: Enable push notifications
- **Options**: `true`, `false`
- **Default**: `false`
- **Status**: Planned feature

#### `MIN_SUPPORTED_APP_VERSION` (Optional)
- **Description**: Minimum supported mobile app version
- **Format**: Semantic version (e.g., `1.0.0`)
- **Usage**: Forces updates for old app versions

#### `ALLOWED_CORS_ORIGINS` (Optional)
- **Description**: Additional CORS origins for mobile apps
- **Format**: Comma-separated list
- **Example**: `verscienta-app://,capacitor://localhost`

---

### 14. Analytics (Optional)

#### `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` (Optional)
- **Description**: Vercel Analytics ID
- **Usage**: Automatically enabled on Vercel
- **Exposed**: ✅ Available in browser

---

### 15. Development & Debugging

#### `DEBUG` (Optional)
- **Description**: Enable debug logging
- **Format**: Module patterns (e.g., `payload:*`)
- **Usage**: Development troubleshooting
- **Production**: Should be disabled

#### `NEXT_TELEMETRY_DISABLED` (Optional)
- **Description**: Disable Next.js telemetry
- **Options**: `1` (disabled), `0` (enabled)
- **Privacy**: Disables anonymous usage data

---

## 🔒 Security Best Practices

### Secret Generation

**Generate strong secrets:**
```bash
# 32-character base64 secret
openssl rand -base64 32

# 32-character hex secret
openssl rand -hex 16

# UUID
uuidgen
```

### Secret Management

1. **Never commit secrets** to version control
2. **Use .env.local** for local development
3. **Rotate secrets regularly** (quarterly)
4. **Use different secrets** for each environment
5. **Restrict access** to production secrets
6. **Enable 2FA** on service accounts

### Environment Separation

| Environment | DATABASE_URL | Secrets | Access |
|-------------|--------------|---------|--------|
| Development | Local/staging DB | Development secrets | All developers |
| Staging | Staging DB | Staging secrets | QA team |
| Production | Production DB | Production secrets | Ops team only |

---

## 📝 Environment Variable Templates

### Development (.env.local)
```bash
# Minimal setup for local development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/verscienta_dev
PAYLOAD_SECRET=dev-secret-change-in-production-minimum-32-characters
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
BETTER_AUTH_SECRET=dev-auth-secret-change-in-production
BETTER_AUTH_URL=http://localhost:3000
ENCRYPTION_KEY=dev-encryption-key-32-chars!!
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXT_PUBLIC_CMS_URL=http://localhost:3000
NODE_ENV=development
```

### Staging
```bash
# Full feature set with staging credentials
DATABASE_URL=postgresql://user:pass@staging-db:5432/verscienta_staging
PAYLOAD_SECRET=[staging-secret-32-chars]
PAYLOAD_PUBLIC_SERVER_URL=https://staging.verscienta.com
# ... all other variables with staging values
```

### Production
```bash
# Production with all security features enabled
DATABASE_URL=postgresql://user:pass@prod-db:5432/verscienta_prod?sslmode=verify-full
PAYLOAD_SECRET=[production-secret-32-chars]
PAYLOAD_PUBLIC_SERVER_URL=https://verscienta.com
REQUIRE_MFA_FOR_ADMIN=true
REQUIRE_MFA_FOR_PHI_ACCESS=true
REDIS_TLS=true
# ... all other variables with production values
```

---

## 🚨 Common Issues

### Missing Required Variables

**Error**: `Error: Missing required environment variable: DATABASE_URL`

**Solution**:
1. Check `.env` or `.env.local` file exists
2. Verify variable is defined
3. Restart dev server after adding variables

### Invalid Format

**Error**: `Error: Invalid database URL format`

**Solution**: Check URL format:
- ✅ `postgresql://user:pass@host:5432/db`
- ❌ `postgres://...` (wrong protocol)
- ❌ Missing port number
- ❌ Special characters not URL-encoded

### Secret Too Short

**Error**: `Error: PAYLOAD_SECRET must be at least 32 characters`

**Solution**: Generate longer secret:
```bash
openssl rand -base64 32
```

### SSL/TLS Errors

**Error**: `Error: self signed certificate in certificate chain`

**Solution**: For development only:
```bash
DATABASE_URL=postgresql://...?sslmode=disable
```

**Production**: Never disable SSL, fix certificate chain instead.

---

## 📞 Support

### Documentation
- Main README: `../README.md`
- Deployment Guide: `./COOLIFY_DEPLOYMENT_GUIDE.md`
- Claude AI Context: `./CLAUDE.md`

### External Resources
- Payload CMS Docs: https://payloadcms.com/docs
- Next.js Docs: https://nextjs.org/docs
- Better Auth Docs: https://www.better-auth.com/docs

---

**Document Version**: 2.0
**Last Updated**: 2025-01-20
**Maintained By**: Development Team
**Next Review**: February 2025
