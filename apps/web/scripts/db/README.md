# Database Scripts Guide

This directory contains database maintenance, verification, and monitoring scripts for the Verscienta Health platform.

## 📋 Overview

All scripts are provided in both Unix/Linux/Mac (`.sh`) and Windows (`.bat`) formats for cross-platform compatibility.

## 🗂️ Available Scripts

### 1. Migration Status Check

**Purpose**: Verify that all Prisma migrations have been applied to the database

**Files**:
- `check-migration-status.sh` (Unix/Linux/Mac)
- `check-migration-status.bat` (Windows)

**Usage**:
```bash
# Unix/Linux/Mac
./scripts/db/check-migration-status.sh

# Windows
.\scripts\db\check-migration-status.bat
```

**What it does**:
- Checks if `DATABASE_URL` is configured
- Runs `prisma migrate status` to show pending/applied migrations
- Provides next steps based on migration status

**When to run**:
- Before deploying to production
- After pulling new code that includes migrations
- When troubleshooting database issues

---

### 2. Index Verification

**Purpose**: Verify that all 39 performance indexes are deployed and functioning

**Files**:
- `verify-indexes.sql` (SQL queries)
- `verify-indexes.sh` (Unix/Linux/Mac runner)
- `verify-indexes.bat` (Windows runner)

**Usage**:
```bash
# Unix/Linux/Mac
./scripts/db/verify-indexes.sh

# Windows
.\scripts\db\verify-indexes.bat

# Direct psql (any platform)
psql $DATABASE_URL -f scripts/db/verify-indexes.sql
```

**What it checks**:
- ✅ Migration history and status
- ✅ Index count by table (expected: 39 indexes)
- ✅ All indexes with their definitions
- ✅ Index sizes
- ✅ Index usage statistics
- ✅ Missing indexes detection
- ✅ Table statistics

**Expected index counts**:
- User: 5 indexes
- Account: 3 indexes
- Session: 6 indexes
- Verification: 3 indexes
- DeviceToken: 2 indexes
- ApiRequestLog: 10 indexes
- PasswordHistory: 3 indexes
- AuditLog: 7 indexes
- **TOTAL: 39 indexes** (plus unique/primary key indexes)

**When to run**:
- After running migrations
- After deploying to a new environment
- Monthly for verification

---

### 3. Index Usage Monitoring

**Purpose**: Monitor index effectiveness and identify unused or low-usage indexes

**Files**:
- `monitor-index-usage.sql`

**Usage**:
```bash
psql $DATABASE_URL -f scripts/db/monitor-index-usage.sql
```

**What it reports**:
- 📊 Database uptime (context for statistics)
- 📈 Index usage statistics with scan counts
- ⚠️  Unused indexes (0 scans)
- ⚠️  Low usage indexes (< 100 scans)
- 📋 Table scan statistics (sequential vs index scans)
- 💡 Index efficiency (scans per MB)
- 🔍 Composite index usage
- 🗜️ Index bloat detection
- ✅ Actionable recommendations

**When to run**:
- Weekly for production monitoring
- After major feature releases
- When investigating performance issues
- Wait at least 7 days after deployment before acting on recommendations

**Interpreting results**:
- `✓ ACTIVE` = Index is being used frequently (good)
- `✓ MODERATE` = Index has moderate usage (acceptable)
- `⚠️  LOW USAGE` = Index rarely used, monitor closely
- `⚠️  UNUSED` = Index never used, consider dropping after 7+ days
- `pct_index_scans > 95%` = Optimal for large tables

---

### 4. Performance Benchmarking

**Purpose**: Benchmark query performance with indexes to measure improvements

**Files**:
- `benchmark-indexes.sql`

**Usage**:
```bash
psql $DATABASE_URL -f scripts/db/benchmark-indexes.sql
```

**What it benchmarks**:
1. **User Lookups**: Email, role, emailVerified, recent users
2. **Session Queries**: Token lookup, user sessions, active sessions
3. **API Request Log**: Path queries, failed requests, user history, rate limits
4. **Audit Log**: User history, action types, severity filtering
5. **Account Lookups**: Provider lookups, user accounts
6. **Verification Tokens**: Expired tokens, identifier lookups

**When to run**:
- Before deploying indexes (baseline)
- After deploying indexes (comparison)
- Monthly for performance tracking
- When investigating slow queries

**Reading benchmark results**:
- Look for `Index Scan` vs `Seq Scan` in EXPLAIN ANALYZE output
- `Index Scan` = ✓ Good (index is being used)
- `Seq Scan` = ⚠️  Warning (no index, or table too small)
- **Execution times**:
  - < 1ms = Excellent
  - < 10ms = Good
  - < 100ms = Acceptable
  - \> 100ms = Needs optimization

---

## 🚀 Quick Start: Index Deployment

### Step 1: Check Migration Status
```bash
# Unix/Linux/Mac
./scripts/db/check-migration-status.sh

# Windows
.\scripts\db\check-migration-status.bat
```

### Step 2: Apply Migrations (if pending)
```bash
pnpm prisma migrate deploy
```

### Step 3: Verify Indexes
```bash
# Unix/Linux/Mac
./scripts/db/verify-indexes.sh

# Windows
.\scripts\db\verify-indexes.bat
```

### Step 4: Benchmark Performance
```bash
psql $DATABASE_URL -f scripts/db/benchmark-indexes.sql
```

### Step 5: Monitor Usage (weekly)
```bash
psql $DATABASE_URL -f scripts/db/monitor-index-usage.sql
```

---

## 🔧 Troubleshooting

### "DATABASE_URL is not set"
**Solution**: Create `.env.local` in `apps/web/` with:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/verscienta_health
```

### "psql not found"
**Solutions**:
1. Install PostgreSQL client tools
2. Or use Prisma: `pnpm prisma db execute --file scripts/db/verify-indexes.sql --stdin`

### "Permission denied" (Unix/Linux/Mac)
**Solution**: Make scripts executable:
```bash
chmod +x scripts/db/*.sh
```

### Migrations are pending
**Solution**: Apply migrations:
```bash
pnpm prisma migrate deploy  # Production
pnpm prisma migrate dev     # Development
```

### Indexes are missing
**Cause**: Migration hasn't been applied yet

**Solution**:
1. Verify schema: `cat prisma/schema.prisma | grep "@@index"`
2. Check migrations: `ls prisma/migrations/`
3. Apply migration: `pnpm prisma migrate deploy`
4. Verify deployment: `./scripts/db/verify-indexes.sh`

### Index shows 0 scans
**Normal if**:
- Index was just created (< 24 hours ago)
- Application hasn't run queries using that index yet
- Table is empty or very small

**Action**: Wait 24-48 hours, then re-run monitoring script

---

## 📊 Index Strategy

### All 39 Indexes

#### User Table (5 indexes)
1. `User_email_key` - Unique constraint for login
2. `User_role_idx` - Role-based queries
3. `User_emailVerified_idx` - Verification status checks
4. `User_createdAt_idx` - Recent user queries
5. `User_deletedAt_idx` - Soft delete filtering

#### Account Table (3 indexes)
1. `Account_providerId_accountId_key` - OAuth provider lookup
2. `Account_userId_idx` - User's linked accounts
3. `Account_providerId_idx` - Provider-specific queries

#### Session Table (6 indexes)
1. `Session_token_key` - Unique session token lookup
2. `Session_userId_idx` - User's active sessions
3. `Session_expiresAt_idx` - Expired session cleanup
4. `Session_ipAddress_idx` - Security monitoring
5. `Session_userId_expiresAt_idx` - Composite: Active user sessions
6. `Session_userId_createdAt_idx` - Composite: Recent user sessions

#### Verification Table (3 indexes)
1. `Verification_identifier_value_key` - Unique token lookup
2. `Verification_expiresAt_idx` - Expired token cleanup
3. `Verification_identifier_idx` - User verification history

#### DeviceToken Table (2 indexes)
1. `DeviceToken_token_key` - Unique device token
2. `DeviceToken_userId_idx` - User's registered devices

#### ApiRequestLog Table (10 indexes)
1. `ApiRequestLog_userId_idx` - User request history
2. `ApiRequestLog_path_idx` - Endpoint analytics
3. `ApiRequestLog_method_idx` - HTTP method filtering
4. `ApiRequestLog_statusCode_idx` - Error tracking
5. `ApiRequestLog_createdAt_idx` - Time-based queries
6. `ApiRequestLog_rateLimitHit_idx` - Rate limit monitoring
7. `ApiRequestLog_ipAddress_idx` - IP-based analytics
8. `ApiRequestLog_userId_createdAt_idx` - Composite: User activity timeline
9. `ApiRequestLog_path_method_idx` - Composite: Endpoint-specific stats
10. `ApiRequestLog_statusCode_createdAt_idx` - Composite: Error trends

#### PasswordHistory Table (3 indexes)
1. `PasswordHistory_userId_idx` - Password reuse checking
2. `PasswordHistory_createdAt_idx` - Recent password changes
3. `PasswordHistory_userId_createdAt_idx` - Composite: User password timeline

#### AuditLog Table (7 indexes)
1. `AuditLog_userId_idx` - User audit trail
2. `AuditLog_action_idx` - Action-based queries
3. `AuditLog_createdAt_idx` - Time-based audit queries
4. `AuditLog_severity_idx` - High-priority event filtering
5. `AuditLog_userId_createdAt_idx` - Composite: User activity timeline
6. `AuditLog_action_createdAt_idx` - Composite: Action trends
7. `AuditLog_ipAddress_idx` - IP-based security tracking

---

## 🔐 Security & Compliance

### HIPAA Compliance
- ✅ Indexes improve audit log query performance (required for compliance)
- ✅ Session cleanup indexes enable automatic expired session removal
- ✅ IP address indexes support security monitoring and breach detection

### Performance Benefits
- **Expected improvements**:
  - User login: 200ms → 5ms (40x faster)
  - Session validation: 150ms → 3ms (50x faster)
  - Audit log queries: 500ms → 10ms (50x faster)
  - API analytics: 1000ms → 20ms (50x faster)

---

## 📅 Maintenance Schedule

### Daily
- Automatic: PostgreSQL collects index usage statistics

### Weekly
- Run `monitor-index-usage.sql` to track effectiveness
- Review unused/low-usage indexes

### Monthly
- Run `benchmark-indexes.sql` to track performance trends
- Review index bloat and consider REINDEX if needed

### After Major Releases
- Run `verify-indexes.sql` to ensure all indexes are present
- Run `benchmark-indexes.sql` to verify performance

---

## 🎯 Performance Targets

### Index Scan Ratios
- Large tables (> 10,000 rows): > 95% index scans
- Medium tables (1,000-10,000 rows): > 80% index scans
- Small tables (< 1,000 rows): Sequential scans acceptable

### Query Performance
- Authentication queries: < 10ms
- API request logging: < 5ms
- Audit log queries: < 50ms
- Analytics queries: < 100ms

---

## 📚 Additional Resources

- **Prisma Documentation**: https://www.prisma.io/docs/concepts/components/prisma-migrate
- **PostgreSQL Indexes**: https://www.postgresql.org/docs/current/indexes.html
- **Index Strategy Guide**: `docs/DATABASE_INDEXES.md`
- **Deployment Guide**: `docs/DATABASE_INDEX_DEPLOYMENT.md`

---

**Last Updated**: January 2025
**Maintained By**: Verscienta Development Team
**Questions?** See docs/DATABASE_INDEXES.md for comprehensive guide
