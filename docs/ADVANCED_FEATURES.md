# Advanced Features Documentation

This document covers the advanced features implemented in the Verscienta Health platform, including caching, security, database optimization, and automation.

## Table of Contents

- [Caching System](#caching-system)
- [Multi-Factor Authentication](#multi-factor-authentication)
- [Audit Logging](#audit-logging)
- [Database Optimization](#database-optimization)
- [Automation & Cron Jobs](#automation--cron-jobs)
- [Trefle Data Enrichment](#trefle-data-enrichment)
- [Perenual Cultivation Data](#perenual-cultivation-data)

---

## Caching System

Verscienta implements a multi-layer caching strategy to optimize performance and reduce database load.

### DragonflyDB Configuration

**What is DragonflyDB?**
DragonflyDB is a modern, high-performance, drop-in replacement for Redis that's designed for cloud workloads. It offers:

- **25x higher throughput** than Redis on a single instance
- **Lower latency** and memory footprint
- **Full Redis compatibility** (works with all Redis clients)
- **Vertical scalability** (utilizes all CPU cores efficiently)
- **Persistence** with snapshots and append-only file (AOF)

**Environment Variables:**

```bash
# DragonflyDB Configuration
REDIS_HOST=localhost          # DragonflyDB host
REDIS_PORT=6379               # Default port
REDIS_PASSWORD=your-password  # Optional but recommended
REDIS_DB=0                    # Database number (0-15)
```

**Quick Setup (Docker):**

```bash
# Basic deployment
docker run -d --name dragonfly -p 6379:6379 \
  docker.dragonflydb.io/dragonflydb/dragonfly

# Production deployment with password and persistence
docker run -d --name dragonfly -p 6379:6379 \
  -v /data/dragonfly:/data \
  docker.dragonflydb.io/dragonflydb/dragonfly \
  --requirepass=your-secure-password \
  --dir /data --dbfilename dump.rdb
```

**Coolify Deployment:**

1. Create new service → DragonflyDB
2. Set password via environment variable
3. Configure persistent volume for `/data`
4. Expose port 6379 internally (no public exposure needed)

**Features:**

- Self-hosted with full control
- Automatic cache expiration (TTL)
- Rate limiting per endpoint
- LRU in-memory cache for hot data
- High availability ready
- TLS encryption support

### Cache Implementation

#### Basic Caching

```typescript
import { withCache, cacheKeys, cacheTTL } from '@/lib/cache'

// Cache a database query
const herb = await withCache(cacheKeys.herb(slug), cacheTTL.herb, async () => {
  return await payload.findByID({
    collection: 'herbs',
    id: herbId,
  })
})
```

#### Cache Keys

Predefined cache key patterns:

- `herb:{slug}` - Individual herb data (1 hour TTL)
- `formula:{slug}` - Individual formula data (1 hour TTL)
- `search:{query}` - Search results (15 minutes TTL)
- `ai:{hash}` - AI response cache (24 hours TTL)

#### Cache Invalidation

```typescript
import { invalidateCache, invalidatePattern } from '@/lib/cache'

// Invalidate single key
await invalidateCache(cacheKeys.herb(slug))

// Invalidate pattern
await invalidatePattern('herb:*')
```

### Rate Limiting

Applied to API routes via middleware:

```typescript
// apps/web/middleware.ts
import { rateLimitMiddleware } from '@/middleware/cache'

export async function middleware(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await rateLimitMiddleware(request)
  if (rateLimitResult) return rateLimitResult

  // ... other middleware
}
```

**Rate Limits:**

- API endpoints: 100 requests per 10 minutes
- AI endpoints: 20 requests per 10 minutes
- Search endpoints: 50 requests per 10 minutes

### LRU In-Memory Cache

For frequently accessed data (hot path optimization):

```typescript
import { lruCache } from '@/lib/cache'

const cachedData = lruCache.get(key)
if (!cachedData) {
  const data = await fetchData()
  lruCache.set(key, data)
}
```

### Cache Cleanup

Automated cache cleanup runs daily at 4 AM via cron job:

- Removes expired Redis keys
- Clears old temporary files
- Frees disk space
- See: `apps/cms/src/cron/jobs/cleanupCache.ts`

---

## Multi-Factor Authentication

MFA implementation using TOTP (Time-based One-Time Passwords) for admin and practitioner accounts.

### Setup

**Environment Variables:**

```bash
# better-auth configuration
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://verscienta.com
```

### MFA Setup Flow

1. **User initiates MFA setup** (from account settings):

```typescript
import { setupMFA } from '@/lib/mfa'

const { secret, qrCodeUrl, backupCodes } = await setupMFA(userId)
```

2. **User scans QR code** with authenticator app (Google Authenticator, Authy, etc.)

3. **User verifies setup** with first code:

```typescript
import { verifyMFA } from '@/lib/mfa'

const result = await verifyMFA(userId, code)
if (result.success) {
  // Enable MFA for user account
}
```

### MFA Verification

During login, after password verification:

```typescript
// apps/web/app/api/auth/mfa/verify/route.ts
POST /api/auth/mfa/verify
{
  "userId": "user-id",
  "code": "123456"
}
```

### Backup Codes

8 single-use backup codes generated during setup:

- Stored encrypted in database
- Can be used if authenticator is unavailable
- Regenerate via account settings

### API Endpoints

- `POST /api/auth/mfa/setup` - Initialize MFA setup
- `POST /api/auth/mfa/verify` - Verify TOTP code
- `POST /api/auth/mfa/disable` - Disable MFA
- `POST /api/auth/mfa/backup-codes` - Regenerate backup codes

---

## Audit Logging

Comprehensive audit trail for security and compliance.

### Tracked Events

**Automatic (via hooks):**

- Create/Update/Delete operations on all collections
- Changes tracked with before/after values
- IP address and user agent captured

**Manual (security events):**

- Login attempts (success/failure)
- MFA events (setup, verification, disable)
- Password changes
- Permission changes
- Data exports

### AuditLogs Collection

**Schema:**

```typescript
{
  user: relationship // User who performed action
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export'
  resource: string // Collection name
  resourceId: string // Document ID
  changes: object // Fields changed
  oldValues: object // Previous values
  newValues: object // New values
  ipAddress: string
  userAgent: string
  metadata: object // Additional context
  severity: 'low' | 'medium' | 'high' | 'critical'
  success: boolean
  errorMessage: string // If action failed
  timestamp: date
}
```

### Audit Log Implementation

Automatic logging via Payload hooks:

```typescript
// apps/cms/src/collections/Herbs.ts
import { auditLogAfterChange, auditLogAfterDelete } from '@/hooks/auditLog'

const Herbs: CollectionConfig = {
  slug: 'herbs',
  hooks: {
    afterChange: [auditLogAfterChange],
    afterDelete: [auditLogAfterDelete],
  },
  // ... fields
}
```

Manual security event logging:

```typescript
import { logSecurityEvent } from '@/hooks/auditLog'

await logSecurityEvent(
  payload,
  userId,
  'password_change',
  {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  },
  'high'
)
```

### Querying Audit Logs

**Via Payload Admin:**

- Navigate to Audit Logs collection
- Filter by user, action, resource, severity, date range

**Via API:**

```typescript
const logs = await payload.find({
  collection: 'audit-logs',
  where: {
    and: [
      {
        user: { equals: userId },
      },
      {
        severity: { in: ['high', 'critical'] },
      },
      {
        createdAt: {
          greater_than: oneWeekAgo,
        },
      },
    ],
  },
  sort: '-createdAt',
  limit: 100,
})
```

### Compliance

Audit logs support compliance with:

- HIPAA (Health Insurance Portability and Accountability Act)
- GDPR (General Data Protection Regulation)
- SOC 2 (Service Organization Control 2)

**Retention:** Audit logs are retained for 7 years (configurable).

---

## Database Optimization

Comprehensive database indexing and full-text search implementation.

### Database Indexes

Migration file: `apps/cms/src/db/migrations/add-indexes.sql`

#### Index Types

**1. Standard Indexes**

```sql
CREATE INDEX idx_herbs_status ON herbs(status);
CREATE INDEX idx_herbs_slug ON herbs(slug);
```

**2. Composite Indexes**

```sql
CREATE INDEX idx_herbs_status_published
  ON herbs(status, published_at DESC);
```

**3. GIN Indexes (JSONB fields)**

```sql
CREATE INDEX idx_herbs_tcm_properties
  ON herbs USING gin ((tcm_properties::jsonb));
```

**4. Full-Text Search Indexes**

```sql
CREATE INDEX idx_herbs_full_text ON herbs
  USING gin(to_tsvector('english',
    coalesce(name, '') || ' ' ||
    coalesce(scientific_name, '') || ' ' ||
    coalesce(description, '')
  ));
```

**5. Geospatial Indexes**

```sql
CREATE INDEX idx_practitioners_location ON practitioners
  USING gist(
    ll_to_earth(
      coalesce(latitude, 0)::double precision,
      coalesce(longitude, 0)::double precision
    )
  );
```

**6. Partial Indexes** (optimized for common queries)

```sql
CREATE INDEX idx_herbs_active ON herbs(id, name)
  WHERE status = 'published';
```

### Applying Migrations

**Development:**

```bash
psql $DATABASE_URL < apps/cms/src/db/migrations/add-indexes.sql
```

**Production:**

```bash
# Via Coolify or your deployment platform
# Connect to database and run migration
```

### PostgreSQL Full-Text Search

Alternative to Algolia for cost efficiency.

#### Basic Search

```typescript
import { fullTextSearch } from '@/lib/search'

const results = await fullTextSearch(payload, {
  query: 'ginseng',
  collection: 'herbs',
  limit: 20,
  page: 1,
})
```

#### Advanced Search (with ranking)

```typescript
import { advancedFullTextSearch } from '@/lib/search'

const results = await advancedFullTextSearch(payload, {
  query: 'immune support',
  collection: 'herbs',
  limit: 20,
})
```

Results are ranked by relevance using `ts_rank()`.

#### TCM Property Search

```typescript
import { searchHerbsByTCMProperties } from '@/lib/search'

const results = await searchHerbsByTCMProperties(
  payload,
  {
    temperature: ['Warm', 'Hot'],
    taste: ['Sweet', 'Pungent'],
    meridians: ['Lung', 'Spleen'],
  },
  20,
  1
)
```

#### Geospatial Search (Practitioners)

```typescript
import { searchPractitionersByLocation } from '@/lib/search'

const practitioners = await searchPractitionersByLocation(
  payload,
  37.7749, // latitude
  -122.4194, // longitude
  50, // radius in km
  20 // limit
)
```

#### Autocomplete

```typescript
import { autocompleteSearch } from '@/lib/search'

const suggestions = await autocompleteSearch(
  payload,
  'gin', // user input
  'herbs',
  10
)
```

### Query Performance

Expected query times with indexes:

- Simple lookups (by ID/slug): < 5ms
- Full-text search: < 50ms
- TCM property filters: < 30ms
- Geospatial queries: < 100ms
- Complex joins: < 200ms

---

## Automation & Cron Jobs

Scheduled background jobs for maintenance and data management.

### Cron System

Located in: `apps/cms/src/cron/`

**Initialization:**

```typescript
// apps/cms/src/server.ts
import { initializeCronJobs } from './cron'

await initializeCronJobs(payload)
```

### Available Jobs

#### 1. Sync Algolia Index

**Schedule:** Every 6 hours
**File:** `jobs/syncAlgolia.ts`

Synchronizes Payload CMS data with Algolia search indexes.

**Features:**

- Syncs herbs, formulas, conditions, practitioners
- Replaces all objects (full sync)
- Transforms data for optimal search
- Logs sync statistics

**Manual trigger:**

```typescript
import { triggerJob } from '@/cron'
await triggerJob(payload, 'Sync Algolia Index')
```

#### 2. Validate Herb Data

**Schedule:** Daily at 2 AM
**File:** `jobs/validateHerbData.ts`

Validates data integrity and quality.

**Validation Rules:**

- Scientific name format (`Genus species`)
- TCM temperature properties
- TCM taste properties
- Contraindications format
- Required fields presence

**Output:**

- Validation report saved to `validation-reports` collection
- Email alert for critical errors (if configured)

**Sample Validation Rules:**

```typescript
{
  field: 'scientificName',
  validator: (value: string) => /^[A-Z][a-z]+ [a-z]+( [a-z]+)?$/.test(value),
  message: 'Invalid scientific name format'
}
```

#### 3. Import External Data

**Schedule:** Weekly on Sunday at 3 AM
**File:** `jobs/importExternalData.ts`

Imports data from external sources.

**Data Sources:**

- PubChem (chemical compounds)
- TCM databases (configurable)
- CSV files
- APIs

**Features:**

- Duplicate detection by scientific name
- Creates drafts (requires manual review)
- Maps external data to herb schema
- Tracks import statistics

**Configuration:**

```bash
# Enable data import
ENABLE_DATA_IMPORT=true
ENABLE_PUBCHEM_IMPORT=true
```

**Adding New Sources:**

```typescript
// apps/cms/src/cron/jobs/importExternalData.ts
const dataSources: ExternalDataSource[] = [
  {
    name: 'TCM Database',
    url: 'https://example.com/tcm-data.csv',
    type: 'csv',
    mapper: mapTCMData,
    enabled: true,
  },
]

function mapTCMData(data: any): any {
  return {
    name: data.herb_name,
    scientificName: data.botanical_name,
    description: data.description,
    // ... map other fields
  }
}
```

#### 4. Cleanup Cache

**Schedule:** Daily at 4 AM
**File:** `jobs/cleanupCache.ts`

Removes expired cache entries and temporary files.

**Tasks:**

- Delete expired Redis keys
- Clear old rate limit entries
- Remove temporary files older than 24 hours
- Free disk space

#### 5. Backup Database

**Schedule:** Daily at 1 AM
**File:** `jobs/backupDatabase.ts`

Creates PostgreSQL database backups.

**Features:**

- Uses `pg_dump` for consistent backups
- Optional compression (gzip)
- Optional cloud upload (S3, R2)
- Retention policy (keeps last 7 backups)

**Configuration:**

```bash
# Enable auto backup
ENABLE_AUTO_BACKUP=true

# Backup settings
BACKUP_DIR=./backups
COMPRESS_BACKUPS=true
BACKUP_UPLOAD_ENABLED=false
BACKUP_RETENTION_COUNT=7
```

**Manual Backup:**

```typescript
await triggerJob(payload, 'Backup Database')
```

#### 6. Generate Sitemap

**Schedule:** Daily at 5 AM
**File:** `jobs/generateSitemap.ts`

Generates XML sitemap for SEO.

**Features:**

- Static pages (/, /herbs, /about, etc.)
- Dynamic pages from CMS collections
- Proper priority and changefreq settings
- Sitemap index for multiple sitemaps
- Optionally pings search engines

**Configuration:**

```bash
SITEMAP_DIR=./public
PING_SEARCH_ENGINES=true
```

**Output:** `public/sitemap.xml`

#### 7. Send Digest Emails

**Schedule:** Weekly on Monday at 8 AM
**File:** `jobs/sendDigestEmails.ts`

Sends weekly digest emails to subscribers.

**Features:**

- Gathers content from past 7 days
- Beautiful HTML email template
- Batch sending (100 emails per batch)
- Rate limit protection

**Configuration:**

```bash
ENABLE_DIGEST_EMAILS=true
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@verscienta.com
```

**Email Sections:**

- New herbs
- New formulas
- New conditions
- New practitioners

**Subscriber Management:**
Users opt in via account preferences:

```typescript
preferences: {
  weeklyDigest: true
}
```

### Job Management

#### List All Jobs

```typescript
import { listCronJobs } from '@/cron'

const jobs = listCronJobs()
// Returns: [{ name, schedule, enabled, nextRun }]
```

#### Manual Job Trigger

```typescript
import { triggerJob } from '@/cron'

const result = await triggerJob(payload, 'Validate Herb Data')
console.log(result.success, result.duration)
```

#### View Job Logs

Job execution results are logged to the `import-logs` collection:

```typescript
const logs = await payload.find({
  collection: 'import-logs',
  where: {
    type: { equals: 'algolia-sync' },
  },
  sort: '-timestamp',
  limit: 10,
})
```

### Monitoring & Alerts

**Success Metrics:**

- Job completion time
- Records processed
- Errors encountered

**Failure Handling:**

- Errors logged to console
- Job execution continues for other jobs
- TODO: Email alerts for critical failures

### Best Practices

1. **Test jobs manually** before relying on schedule:

   ```bash
   pnpm --filter @verscienta/cms dev
   # Then in another terminal
   curl -X POST http://localhost:3001/api/cron/trigger/validate-herb-data
   ```

2. **Monitor job execution** via logs collection

3. **Set appropriate schedules** to avoid peak traffic times

4. **Enable backups** in production:

   ```bash
   ENABLE_AUTO_BACKUP=true
   ```

5. **Configure alerts** for critical job failures

---

## Environment Variables Reference

Complete list of environment variables for advanced features:

```bash
# DragonflyDB/Redis Caching
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password
REDIS_DB=0

# MFA
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://verscienta.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Backup
ENABLE_AUTO_BACKUP=true
BACKUP_DIR=./backups
COMPRESS_BACKUPS=true
BACKUP_UPLOAD_ENABLED=false
BACKUP_RETENTION_COUNT=7

# Data Import
ENABLE_DATA_IMPORT=true
ENABLE_PUBCHEM_IMPORT=true

# Email
ENABLE_DIGEST_EMAILS=true
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@verscienta.com

# Sitemap
SITEMAP_DIR=./public
PING_SEARCH_ENGINES=true

# Algolia
ALGOLIA_APP_ID=your-app-id
ALGOLIA_ADMIN_API_KEY=your-admin-key
```

---

## Trefle Data Enrichment

Automated botanical data enrichment using the Trefle API, a free database with over 1 million plant entries.

### Overview

The Trefle integration provides:

- **Scientific name validation** against botanical database
- **Automated herb enrichment** with images, distributions, toxicity data
- **Progressive import** of 1M+ plants from Trefle
- **Validation reports** for data quality assurance

### Environment Variables

```bash
# Trefle API Configuration
TREFLE_API_KEY=your-trefle-api-key-here

# Enable progressive import (optional)
# WARNING: This will import 1M+ plants as draft herbs
ENABLE_TREFLE_IMPORT=false
```

**Get API Key:**

1. Visit [trefle.io](https://trefle.io/)
2. Create free account
3. Generate API key from dashboard

### Features

#### 1. Herb Enrichment (Weekly Sync)

Automatically enriches existing herbs with:

- ✅ Scientific name validation
- 🌍 Native and introduced distributions
- 🖼️ Botanical images
- 📝 Synonyms and taxonomy
- ⚠️ Toxicity information
- 🍃 Edibility data
- 📏 Growth characteristics
- 📚 Source citations

**Schedule:** Wednesday at 3 AM
**Processes:** 100 herbs per run
**Priority:** Herbs never synced or synced >30 days ago

#### 2. Progressive Import (Every Minute)

Imports all Trefle plants into your database:

- 🔄 Runs every minute when enabled
- 📊 ~100 plants per run (respects 120 req/min rate limit)
- 📝 Creates herbs as **drafts** for review
- 📈 Tracks progress via global state
- ⏱️ Completes in ~7 days of continuous running

**⚠️ Warning:** This creates hundreds of thousands of draft herbs! Test on staging first.

### Data Enrichment Examples

**Before Enrichment:**

```typescript
{
  name: "Lavender",
  scientificName: "Lavandula angustifolia",
  family: null,
  synonyms: [],
  images: []
}
```

**After Enrichment:**

```typescript
{
  name: "Lavender",
  scientificName: "Lavandula angustifolia",
  family: "Lamiaceae",
  synonyms: ["Lavandula officinalis", "Lavandula vera"],
  images: [{
    url: "https://bs.plantnet.org/image/...",
    source: "Trefle"
  }],
  botanicalData: {
    trefleId: 123456,
    trefleSlug: "lavandula-angustifolia",
    lastSyncedAt: "2025-01-15T10:00:00Z",
    trefleData: {
      author: "Mill.",
      distributions: {
        native: ["Mediterranean", "Europe"],
        introduced: ["North America", "Australia"]
      },
      toxicity: "none",
      edible: false,
      growthHabit: "subshrub",
      averageHeight: 60 // cm
    }
  }
}
```

### Monitoring

#### Import Logs

View sync and import results:

```
CMS Admin → System → Import Logs

Filter by:
- "Trefle Sync" - Weekly enrichment results
- "Trefle Progressive Import" - Import batch results
- "Trefle Sync Error" - Error details
```

#### Validation Reports

Review scientific name issues:

```
CMS Admin → System → Validation Reports

Filter by:
- "Trefle Name Mismatch" - Name validation issues with suggestions
```

#### Import Progress

Check progressive import status:

```
CMS Admin → System → Trefle Import State

View:
- Current page
- Plants imported
- Herbs created/updated
- Last run timestamp
```

### Manual Operations

#### Trigger Sync Job

```typescript
// Via API
POST /api/cron/trigger
{
  "jobName": "Sync Trefle Botanical Data"
}
```

#### Sync Single Herb

```typescript
import { syncSingleHerbWithTrefle } from '@/cron/jobs/syncTrefleData'

const result = await syncSingleHerbWithTrefle(payload, herbId)
if (result.success) {
  console.log('Enriched:', result.enrichedData)
}
```

#### Check Import Progress

```typescript
import { getTrefleImportProgress } from '@/cron/jobs/importTrefleData'

const progress = await getTrefleImportProgress(payload)
console.log(`Page ${progress.currentPage}, ${progress.estimatedPlantsRemaining} plants remaining`)
```

#### Reset Import

```typescript
import { resetTrefleImport } from '@/cron/jobs/importTrefleData'

await resetTrefleImport(payload)
// Import restarts from page 1
```

### Rate Limiting

Trefle API limits:

- **120 requests per minute**
- **5000 requests per day** (free tier)

Our implementation:

- ✅ 500ms delay between requests (built-in)
- ✅ Auto-retry on 429 rate limit (60s wait)
- ✅ Batch processing within limits
- ✅ Progress tracking for resumable imports

### Best Practices

1. **Test on Staging First** - Import creates many drafts
2. **Monitor Import Logs** - Check for errors regularly
3. **Review Validation Reports** - Fix scientific name issues
4. **Enable Selectively** - Use sync for enrichment, import only if needed
5. **Clean Up Drafts** - Review and delete non-medicinal plants
6. **Archive Old Logs** - Clean up logs >30 days old

### Configuration in Cron Jobs

```typescript
// Sync Trefle Botanical Data (Weekly)
{
  name: 'Sync Trefle Botanical Data',
  schedule: '0 3 * * 3', // Wednesday at 3 AM
  job: syncTrefleDataJob,
  enabled: !!process.env.TREFLE_API_KEY,
}

// Import Trefle Plant Database (Every Minute)
{
  name: 'Import Trefle Plant Database',
  schedule: '* * * * *', // Every minute
  job: importTrefleDataJob,
  enabled: !!process.env.TREFLE_API_KEY &&
           process.env.ENABLE_TREFLE_IMPORT === 'true',
}
```

### Troubleshooting

**Issue: No herbs enriched**

1. Check `TREFLE_API_KEY` is set
2. Verify sync job is enabled in cron logs
3. Ensure herbs meet criteria (no trefleId or >30 days old)

**Issue: Rate limit errors**

1. Implementation auto-retries after 60s
2. Reduce `pagesPerRun` in import job if persistent
3. Check Trefle dashboard for usage

**Issue: Import stuck**

1. Check import state: System → Trefle Import State
2. Reset if needed: `resetTrefleImport(payload)`
3. Review error logs for issues

**Issue: Too many drafts**

1. Pause import: `ENABLE_TREFLE_IMPORT=false`
2. Review and delete non-herbs
3. Modify `isHerbCandidate()` filter for stricter criteria

### Resources

- **Full Documentation:** [Trefle Integration Guide](./TREFLE_INTEGRATION.md)
- **Trefle API Docs:** https://docs.trefle.io/
- **Sign Up:** https://trefle.io/
- **Rate Limits:** https://docs.trefle.io/docs/guides/rate-limiting

---

## Perenual Cultivation Data

Automated cultivation and pest management data using the Perenual API, a database with over 10,000 plant species.

### Overview

The Perenual integration provides:

- **Cultivation information** - Watering, sunlight, soil, hardiness
- **Pest management** - Common pests and treatment solutions
- **Care guides** - Detailed growing instructions
- **Progressive import** - Imports 10,000+ plants from Perenual
- **Smart deduplication** - Automatically merges with Trefle data

### Environment Variables

```bash
# Perenual API Configuration
PERENUAL_API_KEY=your-perenual-api-key-here

# Enable progressive import (optional)
# WARNING: This will import 10,000+ plants as draft herbs
ENABLE_PERENUAL_IMPORT=false
```

**Get API Key:**

1. Visit [perenual.com/docs/api](https://perenual.com/docs/api)
2. Create free account
3. Generate API key from dashboard

### Features

#### Cultivation Data

Enriches herbs with:

- 💧 Watering requirements and frequency
- ☀️ Sunlight needs (full sun, partial shade, etc.)
- 🌱 Soil preferences and pH
- ❄️ USDA hardiness zones
- 📅 Lifecycle (annual, perennial, biennial)
- 🌿 Growth rate and maintenance level
- 🏠 Indoor growing suitability

#### Pest Management

- 🐛 Common pest identification
- 💊 Treatment solutions (organic & chemical)
- 🔬 Scientific pest names
- 📸 Visual identification guides

#### Propagation & Care

- ✂️ Pruning schedule and frequency
- 🌱 Propagation methods (seeds, cuttings, division)
- 🔧 Maintenance level (low, medium, high)

### Deduplication System

Both Trefle and Perenual imports use intelligent deduplication:

**Prevents Duplicates:**

```typescript
// Checks for existing herbs by:
- Scientific name (primary)
- Trefle ID
- Perenual ID
- Common name (secondary)

// Merge strategy:
- Keep existing non-null values
- Combine arrays without duplicates
- Append text fields with separator
- Track both trefleData and perenualData
```

**Example Merge:**

```typescript
// Existing herb from Trefle
{
  scientificName: "Lavandula angustifolia",
  botanicalData: { trefleId: 123, trefleData: {...} }
}

// New data from Perenual
{
  scientificName: "Lavandula angustifolia",
  cultivation: { watering: "Average", sunlight: ["Full sun"] }
}

// Merged result
{
  scientificName: "Lavandula angustifolia",
  botanicalData: {
    trefleId: 123,
    perenualId: 456,
    trefleData: {...},
    perenualData: {...}
  },
  cultivation: { watering: "Average", sunlight: ["Full sun"] }
}
```

### Configuration

```typescript
// Import Perenual Plant Database (Every Minute)
{
  name: 'Import Perenual Plant Database',
  schedule: '* * * * *', // Every minute
  job: importPerenualDataJob,
  enabled: !!process.env.PERENUAL_API_KEY &&
           process.env.ENABLE_PERENUAL_IMPORT === 'true',
}
```

### Manual Operations

#### Check Import Progress

```typescript
import { getPerenualImportProgress } from '@/cron/jobs/importPerenualData'

const progress = await getPerenualImportProgress(payload)
console.log(`Page ${progress.currentPage}, ${progress.estimatedPlantsRemaining} plants remaining`)
```

#### Reset Import

```typescript
import { resetPerenualImport } from '@/cron/jobs/importPerenualData'
await resetPerenualImport(payload)
```

#### Bulk Deduplication

```typescript
import { bulkDeduplicate } from '@/lib/herbDeduplication'

const stats = await bulkDeduplicate(payload)
console.log(`Merged: ${stats.merged}, Deleted: ${stats.deleted}`)
```

### Monitoring

#### Import Logs

```
CMS Admin → System → Import Logs
Filter by: "Perenual Progressive Import"
```

#### Import State

```
CMS Admin → System → Perenual Import State

View:
- Current page
- Plants imported
- Herbs created/updated
- Last run timestamp
```

### Troubleshooting

**Issue: Duplicate herbs created**

1. Run bulk deduplication: `bulkDeduplicate(payload)`
2. Check scientific name variations
3. Review merge logs for conflicts

**Issue: Data not merging**

1. Verify both API keys are set
2. Check import logs for errors
3. Review `herbDeduplication.ts` merge logic

**Issue: Import running but no herbs**

1. Check herb candidate filter in import job
2. Verify plants meet inclusion criteria
3. Review import logs for skipped plants

### Best Practices

1. **Enable one at a time** - Test Trefle first, then Perenual
2. **Monitor merge quality** - Review merged herbs regularly
3. **Run cleanup monthly** - Use `bulkDeduplicate()` for maintenance
4. **Archive old logs** - Clean up logs >30 days old
5. **Standardize names** - Use accepted scientific nomenclature

### Resources

- **Full Documentation:** [Perenual Integration Guide](./PERENUAL_INTEGRATION.md)
- **Perenual API Docs:** https://perenual.com/docs/api
- **Sign Up:** https://perenual.com/docs/api
- **Deduplication Code:** `apps/cms/src/lib/herbDeduplication.ts`

---

## Performance Metrics

Expected performance improvements with advanced features:

| Metric                    | Before | After | Improvement   |
| ------------------------- | ------ | ----- | ------------- |
| Herb page load            | 800ms  | 150ms | 81% faster    |
| Search query              | 500ms  | 50ms  | 90% faster    |
| Database queries          | 200ms  | 20ms  | 90% faster    |
| Cache hit rate            | 0%     | 85%   | N/A           |
| API rate limit violations | Common | Rare  | 95% reduction |

---

## Security Checklist

- [ ] MFA enabled for all admin accounts
- [ ] MFA enabled for practitioner accounts
- [ ] Audit logging enabled on all collections
- [ ] Rate limiting configured on API routes
- [ ] Database backups running daily
- [ ] Redis password protected (or using Upstash)
- [ ] Sensitive environment variables secured
- [ ] HTTPS enforced in production
- [ ] Audit logs reviewed weekly

---

## Troubleshooting

### DragonflyDB Connection Issues

**Problem:** "Failed to connect to DragonflyDB"

**Solution:**

1. Verify DragonflyDB is running: `docker ps | grep dragonfly`
2. Check `REDIS_HOST` and `REDIS_PORT` are correct
3. Verify password if configured
4. Check network connectivity: `telnet REDIS_HOST REDIS_PORT`
5. Check Docker logs: `docker logs dragonfly`
6. Verify firewall rules allow connection on port 6379

### MFA Setup Fails

**Problem:** "Invalid verification code"

**Solution:**

1. Ensure system time is synchronized (NTP)
2. QR code generated correctly
3. User entered 6-digit code (not backup code)
4. Token not expired (30-second window)

### Cron Jobs Not Running

**Problem:** Jobs don't execute on schedule

**Solution:**

1. Verify cron system initialized in `server.ts`
2. Check job `enabled` flag is `true`
3. Validate cron schedule syntax
4. Check server logs for errors
5. Trigger job manually to test

### Database Migration Fails

**Problem:** Index creation fails

**Solution:**

1. Check PostgreSQL version (17+ required)
2. Ensure extensions installed (`earthdistance`, `cube`)
3. Verify database user has CREATE INDEX permission
4. Check for conflicting index names
5. Run migrations one at a time

---

## Additional Resources

- [Redis Documentation](https://redis.io/docs/)
- [Upstash Documentation](https://docs.upstash.com/)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [better-auth Documentation](https://better-auth.com/)
- [Payload CMS Hooks](https://payloadcms.com/docs/hooks/overview)
- [Node-cron Syntax](https://github.com/node-cron/node-cron#cron-syntax)
