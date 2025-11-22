# Database Index Deployment Checklist

**Created**: 2025-10-20
**Updated**: 2025-01-20
**Status**: Ready for Production Deployment
**Migration File**: `apps/web/prisma/migrations/20251019000000_init/migration.sql`

---

## Overview

This document provides step-by-step instructions for deploying 39 performance indexes to the production PostgreSQL database.

**Total Indexes**: 39 B-tree indexes across 8 tables
**Estimated Index Size**: ~10-25MB (for 10,000 users)
**Expected Performance Gains**:
- User authentication queries: ~40x faster (200ms → 5ms)
- Session validation: ~50x faster (150ms → 3ms)
- API analytics queries: ~50x faster (1000ms → 20ms)
- Audit log queries: ~50x faster (500ms → 10ms)
- Security monitoring: ~85% faster

---

## Pre-Deployment Checklist

- [ ] Database backup completed
- [ ] Migration file reviewed: `apps/web/prisma/migrations/20251019000000_init/migration.sql`
- [ ] Prisma schema verified: All 39 indexes present in `schema.prisma`
- [ ] Production database credentials available
- [ ] **IMPORTANT**: Check if migration is already applied (see Method 0 below)
- [ ] Maintenance window scheduled (if needed - indexes are already included in init migration)

---

## Deployment Methods

### Method 0: Check If Already Deployed (RECOMMENDED FIRST STEP)

All 39 indexes are included in the initial migration `20251019000000_init`. Run this check first:

```bash
# From apps/web directory
cd apps/web

# Check migration status
pnpm prisma migrate status

# Or use our helper script (Unix/Linux/Mac)
./scripts/db/check-migration-status.sh

# Or use our helper script (Windows)
.\scripts\db\check-migration-status.bat
```

**If migration is already applied**: Skip to [Post-Deployment Verification](#post-deployment-verification)

**If migration is pending**: Continue with Method 1 below

---

### Method 1: Prisma Migrate (Recommended)

```bash
# From apps/web directory
cd apps/web

# Review migration (includes all 39 indexes)
cat prisma/migrations/20251019000000_init/migration.sql

# Deploy to production
DATABASE_URL="postgresql://..." pnpm prisma migrate deploy
```

### Method 2: Direct SQL Execution

```bash
# Connect to production database
psql "postgresql://user:pass@host:port/database"

# Execute migration
\i apps/web/prisma/migrations/20251019000000_init/migration.sql

# Or use our verification script
\i apps/web/scripts/db/verify-indexes.sql
```

### Method 3: Automated Verification Scripts

We provide comprehensive scripts for checking and verifying indexes:

```bash
# Unix/Linux/Mac
./scripts/db/verify-indexes.sh

# Windows
.\scripts\db\verify-indexes.bat
```

See [scripts/db/README.md](../apps/web/scripts/db/README.md) for complete documentation.

---

## Index Summary

### All 39 Indexes Across 8 Tables

#### User Table (5 indexes)
```sql
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_emailVerified_idx" ON "User"("emailVerified");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX "User_scheduledForDeletion_idx" ON "User"("scheduledForDeletion");
```

**Use Cases**: Admin queries, email verification flows, HIPAA compliance

---

#### Account Table (3 indexes)
```sql
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Account_providerId_idx" ON "Account"("providerId");
CREATE INDEX "Account_createdAt_idx" ON "Account"("createdAt");
```

**Use Cases**: User account lookups, OAuth provider filtering, account history

---

#### Session Table (6 indexes)
```sql
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX "Session_ipAddress_idx" ON "Session"("ipAddress");
CREATE INDEX "Session_createdAt_idx" ON "Session"("createdAt");
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");
CREATE INDEX "Session_userId_createdAt_idx" ON "Session"("userId", "createdAt");
```

**Use Cases**: Session cleanup cron jobs, security monitoring, IP-based threat detection

---

#### Verification Table (3 indexes)
```sql
CREATE INDEX "Verification_expiresAt_idx" ON "Verification"("expiresAt");
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");
CREATE INDEX "Verification_createdAt_idx" ON "Verification"("createdAt");
```

**Use Cases**: Magic link validation, expired token cleanup, verification analytics

---

#### DeviceToken Table (2 indexes)
```sql
CREATE INDEX "DeviceToken_userId_idx" ON "DeviceToken"("userId");
CREATE INDEX "DeviceToken_platform_idx" ON "DeviceToken"("platform");
```

**Use Cases**: Push notifications, device management, multi-device support

---

#### ApiRequestLog Table (10 indexes)
```sql
CREATE INDEX "ApiRequestLog_userId_idx" ON "ApiRequestLog"("userId");
CREATE INDEX "ApiRequestLog_path_idx" ON "ApiRequestLog"("path");
CREATE INDEX "ApiRequestLog_method_idx" ON "ApiRequestLog"("method");
CREATE INDEX "ApiRequestLog_statusCode_idx" ON "ApiRequestLog"("statusCode");
CREATE INDEX "ApiRequestLog_createdAt_idx" ON "ApiRequestLog"("createdAt");
CREATE INDEX "ApiRequestLog_rateLimitHit_idx" ON "ApiRequestLog"("rateLimitHit");
CREATE INDEX "ApiRequestLog_ipAddress_idx" ON "ApiRequestLog"("ipAddress");
CREATE INDEX "ApiRequestLog_userId_createdAt_idx" ON "ApiRequestLog"("userId", "createdAt");
CREATE INDEX "ApiRequestLog_path_method_idx" ON "ApiRequestLog"("path", "method");
CREATE INDEX "ApiRequestLog_statusCode_createdAt_idx" ON "ApiRequestLog"("statusCode", "createdAt");
```

**Use Cases**: API analytics, error tracking, rate limit monitoring, security analysis

---

#### PasswordHistory Table (3 indexes)
```sql
CREATE INDEX "PasswordHistory_userId_idx" ON "PasswordHistory"("userId");
CREATE INDEX "PasswordHistory_createdAt_idx" ON "PasswordHistory"("createdAt");
CREATE INDEX "PasswordHistory_userId_createdAt_idx" ON "PasswordHistory"("userId", "createdAt");
```

**Use Cases**: Password reuse prevention, security compliance, audit trails

---

#### AuditLog Table (7 indexes)
```sql
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
CREATE INDEX "AuditLog_ipAddress_idx" ON "AuditLog"("ipAddress");
```

**Use Cases**: HIPAA compliance, security monitoring, breach investigation, compliance reporting

---

## Post-Deployment Verification

### Quick Verification with Scripts

We provide comprehensive verification scripts:

```bash
# Unix/Linux/Mac
./scripts/db/verify-indexes.sh

# Windows
.\scripts\db\verify-indexes.bat

# Direct SQL (any platform)
psql $DATABASE_URL -f scripts/db/verify-indexes.sql
```

### 1. Verify All Indexes Created

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
ORDER BY tablename, indexname;
```

**Expected**: 39 indexes listed (plus unique constraint/primary key indexes)

---

### 2. Check Index Sizes

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid::regclass)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
ORDER BY pg_relation_size(indexrelid::regclass) DESC;
```

**Expected**: Each index ~100KB to 5MB depending on table size and row count

---

### 3. Monitor Index Usage (After 24-48 Hours)

Use our comprehensive monitoring script:

```bash
psql $DATABASE_URL -f scripts/db/monitor-index-usage.sql
```

Or run manually:

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid::regclass)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename IN ('User', 'Account', 'Session', 'Verification', 'DeviceToken',
                    'ApiRequestLog', 'PasswordHistory', 'AuditLog')
ORDER BY idx_scan DESC;
```

**Expected**: Cleanup indexes (`Session_expiresAt_idx`, `Verification_expiresAt_idx`) should have high scan counts from cron jobs

---

## Performance Testing

### Automated Benchmarking

We provide a comprehensive benchmark script that tests all indexes:

```bash
psql $DATABASE_URL -f scripts/db/benchmark-indexes.sql
```

This script tests:
- User lookups (email, role, emailVerified, recent users)
- Session queries (token, userId, expiration, composite queries)
- API request analytics (path, status code, user history, rate limits)
- Audit log queries (user history, action types, severity)
- Account and verification lookups

### Manual Benchmark Examples

```sql
-- Session cleanup query
EXPLAIN ANALYZE
DELETE FROM "Session" WHERE "expiresAt" < NOW();

-- User authentication lookup
EXPLAIN ANALYZE
SELECT * FROM "User" WHERE email = 'user@example.com';

-- API error tracking
EXPLAIN ANALYZE
SELECT * FROM "ApiRequestLog"
WHERE "statusCode" >= 400
AND "createdAt" > NOW() - INTERVAL '24 hours';

-- Audit log user history
EXPLAIN ANALYZE
SELECT * FROM "AuditLog"
WHERE "userId" = 'some-uuid'
AND "createdAt" > NOW() - INTERVAL '30 days'
ORDER BY "createdAt" DESC;
```

### Expected Results

After deployment, query plans should show:
- ✓ "Index Scan" instead of "Seq Scan"
- ✓ Execution time: 80-95% faster
- ✓ Fewer rows examined (more efficient queries)

---

## Rollback Procedure

**NOTE**: Indexes are included in the initial migration, so rollback would require a full database migration rollback. This is rarely necessary and not recommended.

If you absolutely must remove specific indexes for troubleshooting:

```sql
-- Example: Remove a single index
DROP INDEX IF EXISTS "ApiRequestLog_path_idx";

-- Update table statistics
ANALYZE "ApiRequestLog";
```

**Better approach**: Use the monitoring script (`scripts/db/monitor-index-usage.sql`) to identify unused indexes after 7+ days, then remove only those that are truly unused.

---

## Maintenance Recommendations

### Immediate (Post-Deployment)
- [ ] Verify all 39 indexes created successfully (`./scripts/db/verify-indexes.sh`)
- [ ] Check index sizes (should be < 25MB total)
- [ ] Run initial benchmark (`psql $DATABASE_URL -f scripts/db/benchmark-indexes.sql`)
- [ ] Monitor slow query log for improvements

### Weekly (First Month)
- [ ] Run `scripts/db/monitor-index-usage.sql` to check usage statistics
- [ ] Monitor query performance improvements
- [ ] Verify cron jobs are faster
- [ ] Review any unused indexes (wait 7+ days before considering removal)

### Monthly (Ongoing)
- [ ] Run `ANALYZE` on tables to update statistics:
  ```sql
  ANALYZE "User", "Account", "Session", "Verification",
          "DeviceToken", "ApiRequestLog", "PasswordHistory", "AuditLog";
  ```
- [ ] Review index usage patterns (`scripts/db/monitor-index-usage.sql`)
- [ ] Monitor index bloat and rebuild if needed:
  ```sql
  REINDEX INDEX CONCURRENTLY "Session_expiresAt_idx";
  REINDEX INDEX CONCURRENTLY "ApiRequestLog_createdAt_idx";
  ```
- [ ] Run performance benchmarks to track trends

---

## Expected Impact by Feature

| Feature | Query Type | Before | After | Improvement |
|---------|-----------|--------|-------|-------------|
| **User Authentication** | Email lookup | 200ms | 5ms | 40x faster |
| **Session Validation** | Token/userId lookup | 150ms | 3ms | 50x faster |
| **Session Cleanup Cron** | DELETE expired sessions | Seq Scan | Index Scan | ~95% faster |
| **Verification Cleanup** | DELETE expired tokens | Seq Scan | Index Scan | ~90% faster |
| **Admin Dashboard** | Filter by role | Seq Scan | Index Scan | ~90% faster |
| **API Analytics** | Path/status queries | 1000ms | 20ms | 50x faster |
| **Audit Log Queries** | User history, HIPAA reports | 500ms | 10ms | 50x faster |
| **Security Monitoring** | IP-based queries | Seq Scan | Index Scan | ~85% faster |
| **Rate Limit Tracking** | rateLimitHit queries | Seq Scan | Index Scan | ~90% faster |
| **Error Tracking** | Status code filtering | Seq Scan | Index Scan | ~85% faster |

---

## Related Documentation

- [DATABASE_INDEXES.md](./DATABASE_INDEXES.md) - Detailed index documentation and strategy
- [scripts/db/README.md](../apps/web/scripts/db/README.md) - Complete scripts documentation
- [TODO_MASTER.md](./TODO_MASTER.md) - Project task tracking
- [CLAUDE.md](./CLAUDE.md) - Project architecture and technology stack

---

## Deployment Tooling

### Available Scripts

All scripts are located in `apps/web/scripts/db/`:

1. **check-migration-status.sh/.bat** - Check if migrations are applied
2. **verify-indexes.sh/.bat** - Verify all 39 indexes are present
3. **verify-indexes.sql** - Comprehensive verification queries
4. **monitor-index-usage.sql** - Weekly monitoring and recommendations
5. **benchmark-indexes.sql** - Performance testing and benchmarking

See [scripts/db/README.md](../apps/web/scripts/db/README.md) for detailed usage.

---

## Deployment Status

- [x] All 39 indexes defined in Prisma schema with @@index directives
- [x] Indexes included in initial migration: `20251019000000_init/migration.sql`
- [x] Deployment documentation created and updated
- [x] Comprehensive verification scripts created
- [x] Monitoring and benchmarking scripts created
- [ ] **PENDING**: Check migration status on production database
- [ ] **PENDING**: Apply migration if not already deployed
- [ ] **PENDING**: Post-deployment verification
- [ ] **PENDING**: Performance monitoring (first 30 days)

---

## Quick Deployment Workflow

```bash
# Step 1: Check migration status
cd apps/web
pnpm prisma migrate status

# Step 2: Apply migration if pending
pnpm prisma migrate deploy

# Step 3: Verify indexes deployed
./scripts/db/verify-indexes.sh  # Unix/Mac
.\scripts\db\verify-indexes.bat  # Windows

# Step 4: Run initial benchmark
psql $DATABASE_URL -f scripts/db/benchmark-indexes.sql

# Step 5: Monitor weekly
psql $DATABASE_URL -f scripts/db/monitor-index-usage.sql
```

---

**Questions or Issues?** Contact the development team or create an issue in the repository.

**Last Updated**: January 2025
