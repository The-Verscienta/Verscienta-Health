# Database Index Deployment Checklist

**Created**: 2025-10-20
**Status**: Ready for Production Deployment
**Migration File**: `apps/web/prisma/migrations/001_add_performance_indexes.sql`

---

## Overview

This document provides step-by-step instructions for deploying 17 performance indexes to the production PostgreSQL database.

**Total Indexes**: 17 B-tree indexes
**Estimated Index Size**: ~5-10MB (for 10,000 users)
**Expected Performance Gains**:
- User role queries: ~90% faster
- Session cleanup: ~95% faster
- Security monitoring: ~85% faster
- Verification cleanup: ~90% faster

---

## Pre-Deployment Checklist

- [ ] Database backup completed
- [ ] Migration file reviewed: `apps/web/prisma/migrations/001_add_performance_indexes.sql`
- [ ] Prisma schema verified: All indexes present in `schema.prisma`
- [ ] Production database credentials available
- [ ] Maintenance window scheduled (if needed - indexes created concurrently with `IF NOT EXISTS`)

---

## Deployment Methods

### Method 1: Prisma Migrate (Recommended)

```bash
# From apps/web directory
cd apps/web

# Review migration
cat prisma/migrations/001_add_performance_indexes.sql

# Deploy to production (dry run first)
pnpm prisma migrate deploy --preview-feature

# Deploy to production (actual)
DATABASE_URL="postgresql://..." pnpm prisma migrate deploy
```

### Method 2: Direct SQL Execution

```bash
# Connect to production database
psql "postgresql://user:pass@host:port/database"

# Execute migration
\i apps/web/prisma/migrations/001_add_performance_indexes.sql

# Verify indexes created
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('User', 'Account', 'Session', 'Verification')
ORDER BY tablename, indexname;
```

### Method 3: Supabase Dashboard

1. Log into Supabase dashboard
2. Navigate to SQL Editor
3. Paste contents of `001_add_performance_indexes.sql`
4. Click "Run"
5. Verify with index query (see verification section)

---

## Index Summary

### User Table (5 indexes)
```sql
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_emailVerified_idx" ON "User"("emailVerified");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX "User_scheduledForDeletion_idx" ON "User"("scheduledForDeletion");
```

**Use Cases**: Admin queries, email verification flows, HIPAA compliance

---

### Account Table (3 indexes)
```sql
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Account_providerId_idx" ON "Account"("providerId");
CREATE INDEX "Account_createdAt_idx" ON "Account"("createdAt");
```

**Use Cases**: User account lookups, OAuth provider filtering, account history

---

### Session Table (6 indexes)
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

### Verification Table (3 indexes)
```sql
CREATE INDEX "Verification_expiresAt_idx" ON "Verification"("expiresAt");
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");
CREATE INDEX "Verification_createdAt_idx" ON "Verification"("createdAt");
```

**Use Cases**: Magic link validation, expired token cleanup, verification analytics

---

## Post-Deployment Verification

### 1. Verify All Indexes Created

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('User', 'Account', 'Session', 'Verification')
ORDER BY tablename, indexname;
```

**Expected**: 17 indexes listed (plus unique constraint indexes)

---

### 2. Check Index Sizes

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid::regclass)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename IN ('User', 'Account', 'Session', 'Verification')
ORDER BY pg_relation_size(indexrelid::regclass) DESC;
```

**Expected**: Each index ~100KB to 2MB depending on table size

---

### 3. Monitor Index Usage (After 24 Hours)

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
WHERE tablename IN ('User', 'Account', 'Session', 'Verification')
ORDER BY idx_scan DESC;
```

**Expected**: `Session_expiresAt_idx` and `Verification_expiresAt_idx` should have high scan counts from cron jobs

---

## Performance Testing

### Before Deployment Benchmark

```sql
-- Session cleanup query (BEFORE indexes)
EXPLAIN ANALYZE
DELETE FROM "Session" WHERE "expiresAt" < NOW();

-- Verification cleanup query (BEFORE indexes)
EXPLAIN ANALYZE
DELETE FROM "Verification" WHERE "expiresAt" < NOW();

-- Admin user query (BEFORE indexes)
EXPLAIN ANALYZE
SELECT * FROM "User" WHERE role = 'admin';
```

### After Deployment Benchmark

Run same queries after deployment and compare:
- Execution time should be 80-95% faster
- Query plan should show "Index Scan" instead of "Seq Scan"

---

## Rollback Procedure

If you need to remove indexes (rarely necessary):

```sql
-- Rollback all indexes
DROP INDEX IF EXISTS "User_role_idx";
DROP INDEX IF EXISTS "User_emailVerified_idx";
DROP INDEX IF EXISTS "User_createdAt_idx";
DROP INDEX IF EXISTS "User_deletedAt_idx";
DROP INDEX IF EXISTS "User_scheduledForDeletion_idx";
DROP INDEX IF EXISTS "Account_userId_idx";
DROP INDEX IF EXISTS "Account_providerId_idx";
DROP INDEX IF EXISTS "Account_createdAt_idx";
DROP INDEX IF EXISTS "Session_userId_idx";
DROP INDEX IF EXISTS "Session_expiresAt_idx";
DROP INDEX IF EXISTS "Session_ipAddress_idx";
DROP INDEX IF EXISTS "Session_createdAt_idx";
DROP INDEX IF EXISTS "Session_userId_expiresAt_idx";
DROP INDEX IF EXISTS "Session_userId_createdAt_idx";
DROP INDEX IF EXISTS "Verification_expiresAt_idx";
DROP INDEX IF EXISTS "Verification_identifier_idx";
DROP INDEX IF EXISTS "Verification_createdAt_idx";

-- Update statistics
ANALYZE "User";
ANALYZE "Account";
ANALYZE "Session";
ANALYZE "Verification";
```

---

## Maintenance Recommendations

### Immediate (Post-Deployment)
- [ ] Verify all 17 indexes created successfully
- [ ] Check index sizes (should be < 20MB total)
- [ ] Monitor slow query log for improvements

### Weekly (First Month)
- [ ] Check index usage statistics (ensure high scan counts)
- [ ] Monitor query performance improvements
- [ ] Verify cron jobs are faster

### Monthly (Ongoing)
- [ ] Run `ANALYZE` on tables to update statistics
- [ ] Review unused indexes (if any scan count = 0)
- [ ] Monitor index bloat and rebuild if needed:
  ```sql
  REINDEX INDEX CONCURRENTLY "Session_expiresAt_idx";
  ```

---

## Expected Impact by Feature

| Feature | Query Type | Before | After | Improvement |
|---------|-----------|--------|-------|-------------|
| **Session Cleanup Cron** | DELETE expired sessions | Seq Scan | Index Scan | ~95% faster |
| **Verification Cleanup** | DELETE expired tokens | Seq Scan | Index Scan | ~90% faster |
| **Admin Dashboard** | Filter by role | Seq Scan | Index Scan | ~90% faster |
| **Security Monitoring** | IP-based queries | Seq Scan | Index Scan | ~85% faster |
| **User Growth Analytics** | Sort by createdAt | Sort + Seq Scan | Index Scan | ~80% faster |

---

## Related Documentation

- [DATABASE_INDEXES.md](./DATABASE_INDEXES.md) - Detailed index documentation
- [TODO_MASTER.md](./TODO_MASTER.md) - Project task tracking
- [BUILD_FIXES_2025-10-20.md](./BUILD_FIXES_2025-10-20.md) - Recent build fixes

---

## Deployment Status

- [x] Migration file created: `001_add_performance_indexes.sql`
- [x] Prisma schema updated with @@index directives
- [x] Deployment documentation created
- [ ] **PENDING**: Production deployment (user will execute)
- [ ] **PENDING**: Post-deployment verification
- [ ] **PENDING**: Performance monitoring (first 30 days)

---

**Questions or Issues?** Contact the development team or create an issue in the repository.
