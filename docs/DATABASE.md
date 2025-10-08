# Database Configuration & Best Practices

This document describes PostgreSQL configuration and best practices for the Verscienta Health platform using Payload CMS.

## Table of Contents

- [Overview](#overview)
- [PostgreSQL Setup](#postgresql-setup)
- [Connection Pooling](#connection-pooling)
- [Migrations](#migrations)
- [Performance Optimization](#performance-optimization)
- [Security & HIPAA Compliance](#security--hipaa-compliance)
- [Backup & Recovery](#backup--recovery)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Overview

**Database**: PostgreSQL 14+ (Recommended: PostgreSQL 15 or 16)
**ORM**: Drizzle ORM (via Payload CMS)
**Adapter**: `@payloadcms/db-postgres`
**Connection**: `postgres` npm package with connection pooling

### Why PostgreSQL?

- **ACID Compliance**: Full transactional integrity
- **JSON Support**: Native JSONB for flexible document storage
- **Full-Text Search**: Built-in FTS capabilities
- **Geospatial**: PostGIS for practitioner location queries
- **Extensions**: pgcrypto for HIPAA-compliant encryption

## PostgreSQL Setup

### Installation

**macOS (Homebrew)**:
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows**:
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

**Docker** (Development):
```bash
docker run --name verscienta-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=verscienta_health \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Database Creation

```sql
-- Create database
CREATE DATABASE verscienta_health;

-- Create user with password
CREATE USER verscienta_user WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE verscienta_health TO verscienta_user;

-- Enable required extensions
\c verscienta_health
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "cube";      -- For geospatial queries
CREATE EXTENSION IF NOT EXISTS "earthdistance";  -- For distance calculations
```

### Connection String

Format:
```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

Example (Development):
```
DATABASE_URL=postgresql://verscienta_user:password@localhost:5432/verscienta_health
```

Example (Production with SSL):
```
DATABASE_URL=postgresql://user:pass@prod-host:5432/db?sslmode=require&pool_timeout=30
```

## Connection Pooling

### Current Configuration

Located in `apps/cms/payload.config.ts`:

```typescript
db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URL,
    // Connection pooling best practices
    max: process.env.NODE_ENV === 'production' ? 20 : 10,  // Max connections
    min: process.env.NODE_ENV === 'production' ? 5 : 2,     // Min connections
    idleTimeoutMillis: 30000,        // Close idle after 30s
    connectionTimeoutMillis: 5000,   // Connection attempt timeout
    maxUses: 7500,                   // Recycle after 7500 uses
    allowExitOnIdle: process.env.NODE_ENV !== 'production',
  },
  push: process.env.NODE_ENV === 'development',  // Auto-push schema changes
  migrationDir: './migrations',  // Migration directory
}),
```

### Why These Settings?

**Max Connections (20 in production)**:
- PostgreSQL default is 100 connections
- Reserve ~20 for each app instance
- Prevents connection exhaustion under high load
- Adjust based on your hosting limits

**Min Connections (5 in production)**:
- Keeps warm connections ready
- Reduces latency for first requests
- Balance between performance and resource usage

**Idle Timeout (30 seconds)**:
- Closes unused connections to free resources
- Prevents stale connection accumulation
- Recommended for cloud deployments

**Connection Timeout (5 seconds)**:
- Fails fast if database is unavailable
- Prevents request timeouts cascading
- User gets error instead of hanging

**Max Uses (7500)**:
- Recycles connections periodically
- Prevents memory leaks in long-running connections
- Recommended by postgres npm package

### External Connection Pooling (Recommended for Production)

For production, use a dedicated connection pooler like **PgBouncer** or **Supabase Pooler**:

**PgBouncer Configuration**:
```ini
[databases]
verscienta_health = host=localhost port=5432 dbname=verscienta_health

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3
```

**Benefits**:
- Handles 1000s of client connections with small server pool
- Transaction-level pooling for better concurrency
- Separate pooling from application logic
- Better for serverless deployments

**Connection String with PgBouncer**:
```
DATABASE_URL=postgresql://user:pass@pgbouncer-host:6432/verscienta_health?pgbouncer=true
```

## Migrations

### Directory Structure

```
apps/cms/
├── migrations/              # Payload CMS migrations
│   ├── 001_enable_encryption.sql
│   └── [timestamp]_migration_name.ts
└── src/db/migrations/      # Custom migrations
    └── add-indexes.sql
```

### Running Migrations

**Generate Migration** (Payload):
```bash
cd apps/cms
pnpm payload migrate:create
```

**Run Migrations**:
```bash
pnpm db:migrate        # Run all pending migrations
pnpm payload migrate   # Payload's migrate command
```

**Check Migration Status**:
```bash
pnpm payload migrate:status
```

### Migration Best Practices

1. **Always Use Transactions**:
```sql
BEGIN;

-- Your migration SQL here
ALTER TABLE herbs ADD COLUMN new_field TEXT;

COMMIT;
```

2. **Add Rollback Scripts**:
```sql
-- Migration: Add new_field
-- Up
ALTER TABLE herbs ADD COLUMN new_field TEXT;

-- Down
ALTER TABLE herbs DROP COLUMN new_field;
```

3. **Test on Staging First**:
- Never run migrations directly on production
- Test on staging with production-sized data
- Verify rollback works

4. **Use `IF EXISTS` / `IF NOT EXISTS`**:
```sql
CREATE INDEX IF NOT EXISTS idx_herbs_status ON herbs(status);
ALTER TABLE herbs ADD COLUMN IF NOT EXISTS new_field TEXT;
```

5. **Add Indexes Concurrently**:
```sql
-- Doesn't lock table for writes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_herbs_name ON herbs(name);
```

6. **Set Statement Timeouts**:
```sql
-- Prevent long-running migrations
SET statement_timeout = '30s';
```

### HIPAA Encryption Migration

Run the encryption migration for PHI compliance:

```bash
# 1. Set encryption key
export DATABASE_ENCRYPTION_KEY="your-32-byte-encryption-key-here"

# 2. Backup database
pg_dump -U verscienta_user verscienta_health > backup_$(date +%Y%m%d).sql

# 3. Run migration
psql -U verscienta_user -d verscienta_health -f migrations/001_enable_encryption.sql

# 4. Verify
psql -U verscienta_user -d verscienta_health -c "SELECT extname FROM pg_extension WHERE extname='pgcrypto';"
```

## Performance Optimization

### Indexes

Located in `apps/cms/src/db/migrations/add-indexes.sql`.

**Key Indexes Created**:

```sql
-- Full-text search
CREATE INDEX idx_herbs_full_text ON herbs
  USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- Geospatial for practitioners
CREATE INDEX idx_practitioners_location ON practitioners
  USING gist(ll_to_earth(latitude::double precision, longitude::double precision));

-- JSON fields
CREATE INDEX idx_herbs_tcm_properties ON herbs USING gin ((tcm_properties::jsonb));

-- Partial indexes for active records
CREATE INDEX idx_herbs_active ON herbs(id, name) WHERE status = 'published';
```

### Query Optimization Tips

1. **Use `EXPLAIN ANALYZE`**:
```sql
EXPLAIN ANALYZE
SELECT * FROM herbs WHERE status = 'published' ORDER BY created_at DESC LIMIT 20;
```

2. **Enable Query Logging** (temporarily):
```sql
-- In postgresql.conf
log_min_duration_statement = 1000  # Log queries > 1 second
```

3. **Use Connection Pooling**: Already configured (see above)

4. **Optimize JSON Queries**:
```sql
-- Good: Uses GIN index
SELECT * FROM herbs WHERE tcm_properties @> '{"taste": ["bitter"]}';

-- Bad: Doesn't use index
SELECT * FROM herbs WHERE tcm_properties::text LIKE '%bitter%';
```

5. **Batch Inserts**:
```typescript
// Good: Single transaction
await payload.db.drizzle.insert(herbs).values(batchData)

// Bad: Individual inserts
for (const herb of data) {
  await payload.create({ collection: 'herbs', data: herb })
}
```

### Vacuum & Analyze

**Auto-vacuum** (enabled by default):
```sql
-- Check autovacuum settings
SHOW autovacuum;
SHOW autovacuum_analyze_threshold;
```

**Manual vacuum** (if needed):
```bash
# Analyze tables for query planner
pnpm db:analyze

# Or via psql
psql -U verscienta_user -d verscienta_health -c "VACUUM ANALYZE;"
```

### Monitoring Slow Queries

```sql
-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slowest queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Security & HIPAA Compliance

### Encryption at Rest

**Database-Level Encryption**:
- Preferred: Use cloud provider encryption (AWS RDS, GCP Cloud SQL, Azure Database)
- Fallback: Column-level encryption with `pgcrypto` (see `001_enable_encryption.sql`)

**Key Management**:
```bash
# Generate secure encryption key (32 bytes)
openssl rand -base64 32

# Store in environment
DATABASE_ENCRYPTION_KEY=your-generated-key-here
```

### Encryption in Transit

**Require SSL Connections**:

In `postgresql.conf`:
```conf
ssl = on
ssl_cert_file = '/path/to/server.crt'
ssl_key_file = '/path/to/server.key'
```

Connection string:
```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Access Control

**Role-Based Access**:

```sql
-- Create read-only role for analytics
CREATE ROLE analytics_readonly;
GRANT CONNECT ON DATABASE verscienta_health TO analytics_readonly;
GRANT USAGE ON SCHEMA public TO analytics_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_readonly;

-- Create app role with limited privileges
CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE verscienta_health TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

### Audit Logging

```sql
-- Enable statement logging
ALTER DATABASE verscienta_health SET log_statement = 'mod';  -- Log all modifications
ALTER DATABASE verscienta_health SET log_connections = on;
ALTER DATABASE verscienta_health SET log_disconnections = on;

-- Application-level auditing (see AuditLogs collection)
-- Logs: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, PRINT
```

### Row-Level Security (Optional)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE symptom_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_isolation ON symptom_submissions
  FOR ALL
  USING (user_id = current_setting('app.current_user_id'));
```

## Backup & Recovery

### Backup Strategy

**Daily Full Backups**:
```bash
#!/bin/bash
# Backup script: backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DB_NAME="verscienta_health"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup with compression
pg_dump -U verscienta_user -d $DB_NAME \
  --format=custom \
  --compress=9 \
  --file=$BACKUP_DIR/backup_$DATE.dump

# Backup schema only (for reference)
pg_dump -U verscienta_user -d $DB_NAME \
  --schema-only \
  --file=$BACKUP_DIR/schema_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.dump" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.dump"
```

**Cron Schedule**:
```cron
# Daily backup at 2 AM
0 2 * * * /path/to/backup-db.sh >> /var/log/postgres-backup.log 2>&1
```

**Cloud Backups**:
- **AWS RDS**: Automated backups with point-in-time recovery
- **GCP Cloud SQL**: Daily backups with 7-day retention (configurable)
- **Azure Database**: Automated backups with geo-redundancy

### Restore Process

**Full Restore**:
```bash
# 1. Drop existing database (be careful!)
dropdb -U postgres verscienta_health

# 2. Create new database
createdb -U postgres verscienta_health

# 3. Restore from backup
pg_restore -U verscienta_user -d verscienta_health backup_20250108.dump

# 4. Verify
psql -U verscienta_user -d verscienta_health -c "\dt"
```

**Point-in-Time Recovery** (WAL-based):
```bash
# Requires WAL archiving enabled in postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
```

### Disaster Recovery Checklist

- [ ] Regular backups tested monthly
- [ ] Backups stored in separate geographic location
- [ ] Encryption keys backed up separately
- [ ] Recovery procedure documented and tested
- [ ] RTO (Recovery Time Objective): < 4 hours
- [ ] RPO (Recovery Point Objective): < 15 minutes

## Monitoring

### Key Metrics to Monitor

**Connection Pool**:
```sql
SELECT
  numbackends AS active_connections,
  max_conn - numbackends AS available_connections,
  max_conn AS max_connections
FROM (
  SELECT count(*) AS numbackends FROM pg_stat_activity
) a,
(SELECT setting::int AS max_conn FROM pg_settings WHERE name='max_connections') b;
```

**Database Size**:
```sql
SELECT
  pg_database.datname AS database,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;
```

**Table Sizes**:
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

**Active Queries**:
```sql
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query,
  query_start
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;
```

**Cache Hit Ratio** (should be > 99%):
```sql
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_ratio
FROM pg_statio_user_tables;
```

### Alerting Thresholds

- **CPU Usage**: Alert if > 80% for 5 minutes
- **Memory**: Alert if < 10% available
- **Disk Space**: Alert if < 20% free
- **Connection Pool**: Alert if > 90% utilization
- **Replication Lag**: Alert if > 10 seconds (for replicas)
- **Slow Queries**: Alert if query > 5 seconds

### Tools

- **pg_stat_statements**: Query performance analysis
- **pgAdmin**: GUI for database management
- **Grafana + Prometheus**: Metrics visualization
- **DataDog/New Relic**: APM with PostgreSQL integration

## Troubleshooting

### Connection Issues

**Error: "FATAL: too many connections"**

Solution:
```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Increase max_connections (requires restart)
-- In postgresql.conf:
max_connections = 200

-- Or use connection pooling (recommended)
```

**Error: "Connection timeout"**

Solution:
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Check firewall rules
sudo ufw status

# Check pg_hba.conf for access rules
cat /etc/postgresql/16/main/pg_hba.conf
```

### Performance Issues

**Slow Queries**:
1. Check if indexes are being used: `EXPLAIN ANALYZE your_query`
2. Run `VACUUM ANALYZE` on affected tables
3. Check for table bloat: `SELECT * FROM pg_stat_user_tables WHERE n_dead_tup > 1000;`

**High CPU Usage**:
1. Identify expensive queries: Check `pg_stat_statements`
2. Look for missing indexes
3. Check for runaway queries: `SELECT * FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '1 minute';`

**Disk Space Full**:
```bash
# Find largest tables
SELECT
  schemaname || '.' || tablename AS table,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

# Clean up old WAL files
SELECT pg_switch_wal();
SELECT pg_archivecleanup('/path/to/wal', '000000010000000000000010');
```

### Migration Failures

**Error: "Lock timeout"**:
```sql
-- Migration failed due to lock
-- Increase lock timeout
SET lock_timeout = '10s';

-- Or use CONCURRENTLY for index creation
CREATE INDEX CONCURRENTLY idx_name ON table(column);
```

**Error: "Constraint violation"**:
```sql
-- Check for data that violates constraint
SELECT * FROM table WHERE column IS NULL;  -- For NOT NULL constraint
SELECT column, count(*) FROM table GROUP BY column HAVING count(*) > 1;  -- For UNIQUE constraint
```

## Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [Payload CMS Database Docs](https://payloadcms.com/docs/database/postgres)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
