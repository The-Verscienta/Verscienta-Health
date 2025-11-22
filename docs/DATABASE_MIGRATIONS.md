# Database Migrations Guide

**Status:** ✅ Complete
**Implemented:** January 20, 2025
**Phase:** 1 - Foundation

## Overview

Verscienta Health uses a dual-migration system to manage database schema changes:

1. **Prisma Migrations** - Better Auth tables (User, Session, Account, etc.)
2. **Payload Migrations** - CMS collections (Herbs, Formulas, Practitioners, etc.)

This guide provides comprehensive instructions for managing database migrations in development and production environments.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Migration System Architecture](#migration-system-architecture)
3. [Commands Reference](#commands-reference)
4. [Development Workflow](#development-workflow)
5. [Production Deployment](#production-deployment)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## Quick Start

### Check Migration Status

```bash
# Check both Prisma and Payload migration status
pnpm db:migrate:status

# Or use the CLI directly
pnpm db:migrate status
```

### Run Migrations

```bash
# Run all pending migrations (Prisma + Payload)
pnpm db:migrate:up

# Or use shorthand
pnpm db:migrate up
```

### Rollback (if needed)

```bash
# Rollback last migration
pnpm db:migrate:down

# Or use shorthand
pnpm db:migrate down
```

---

## Migration System Architecture

### Dual Migration System

```
apps/web/
├── prisma/
│   ├── migrations/          # Prisma migrations (Better Auth tables)
│   │   └── 20251019000000_init/
│   │       └── migration.sql  # Initial schema + 39 indexes
│   └── schema.prisma        # Prisma schema definition
│
├── payload/
│   └── migrations/          # Payload migrations (CMS tables)
│       └── [timestamp]_migration_name.ts
│
└── scripts/db/
    ├── migrate.ts           # Main migration CLI (200+ lines)
    ├── migrate.sh           # Unix/Mac wrapper
    ├── migrate.bat          # Windows wrapper
    └── verify-indexes.sql   # Post-migration verification
```

### What Each System Manages

**Prisma Migrations:**
- User authentication tables
- Session management tables
- OAuth account tables
- Audit log tables
- API request logs
- Password history
- Device tokens
- **39 performance indexes** (included in initial migration)

**Payload Migrations:**
- CMS collections (Herbs, Formulas, Conditions, etc.)
- Collection relationships
- Rich text fields
- Media attachments
- Draft/publish workflows
- Access control settings

---

## Commands Reference

### Package.json Scripts

```bash
# Migration commands
pnpm db:migrate                 # Show help
pnpm db:migrate:up              # Run all pending migrations
pnpm db:migrate:down            # Rollback last migration
pnpm db:migrate:status          # Check migration status

# Verification commands
pnpm db:verify                  # Verify all 39 indexes exist
pnpm db:monitor                 # Monitor index usage (requires psql)

# Legacy/direct commands (also available)
pnpm prisma migrate deploy      # Prisma only
pnpm prisma migrate status      # Prisma status only
pnpm payload migrate            # Payload only
pnpm payload migrate:status     # Payload status only
```

### CLI Usage

The migration CLI (`scripts/db/migrate.ts`) supports these commands:

```bash
# Run migrations
pnpm db:migrate up              # Deploy all migrations
pnpm db:migrate deploy          # Alias for 'up'

# Rollback migrations
pnpm db:migrate down            # Rollback last migration
pnpm db:migrate rollback        # Alias for 'down'

# Check status
pnpm db:migrate status          # Show migration status

# Create new migration
pnpm db:migrate create add_herb_categories

# Show help
pnpm db:migrate help
pnpm db:migrate --help
pnpm db:migrate -h
```

---

## Development Workflow

### Initial Setup

```bash
# 1. Start PostgreSQL
docker compose up postgres -d

# 2. Check migration status
pnpm db:migrate:status

# 3. Run migrations
pnpm db:migrate:up

# 4. Verify indexes (should show 39 indexes)
pnpm db:verify

# 5. Seed database (optional)
pnpm seed
```

### Making Schema Changes

#### Prisma Schema Changes (Better Auth tables)

```bash
# 1. Edit prisma/schema.prisma
# Add new field or model

# 2. Create migration
pnpm prisma migrate dev --name add_user_preferences

# 3. Migration is applied automatically in development
# Files created in prisma/migrations/[timestamp]_add_user_preferences/

# 4. Commit migration files to git
git add prisma/migrations/ prisma/schema.prisma
git commit -m "Add user preferences to schema"
```

#### Payload Schema Changes (CMS collections)

```bash
# 1. Edit collection files
# Example: apps/web/payload/collections/Herbs.ts
# Add new field to fields array

# 2. Generate Payload migration
pnpm payload migrate:create

# 3. Migration created in payload/migrations/
# Payload will auto-apply in development (push: true)

# 4. Commit changes
git add payload/collections/ payload/migrations/
git commit -m "Add cultivation field to Herbs"
```

### Testing Migrations Locally

```bash
# 1. Create a test database
createdb verscienta_health_test

# 2. Run migrations against test database
DATABASE_URL="postgresql://..." pnpm db:migrate:up

# 3. Verify schema
pnpm db:verify

# 4. Test rollback
DATABASE_URL="postgresql://..." pnpm db:migrate:down

# 5. Re-apply
DATABASE_URL="postgresql://..." pnpm db:migrate:up
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All migrations tested locally
- [ ] Database backup completed
- [ ] Migration files committed to git
- [ ] Environment variables configured
- [ ] Downtime window scheduled (if needed)
- [ ] Rollback plan documented

### Deployment Methods

#### Method 1: Automated CI/CD (Recommended)

```yaml
# .github/workflows/deploy.yml or similar
- name: Run Database Migrations
  run: |
    cd apps/web
    pnpm db:migrate:up
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    NODE_ENV: production
```

#### Method 2: Manual Deployment

```bash
# SSH into production server
ssh user@production-server

# Navigate to app directory
cd /app/verscienta-health/apps/web

# Set production DATABASE_URL
export DATABASE_URL="postgresql://..."
export NODE_ENV=production

# Check migration status
pnpm db:migrate:status

# Run migrations
pnpm db:migrate:up

# Verify deployment
pnpm db:verify
```

#### Method 3: Coolify Deployment

```bash
# Coolify automatically runs migrations on deploy
# Configure in Build Pack settings:

# Build Command:
pnpm install && pnpm build

# Pre-Start Command (NEW):
cd apps/web && pnpm db:migrate:up

# Start Command:
pnpm start
```

### Post-Deployment Verification

```bash
# 1. Verify all indexes exist
pnpm db:verify

# 2. Check migration status
pnpm db:migrate:status

# 3. Monitor index usage (after 24-48 hours)
pnpm db:monitor

# 4. Check application logs
tail -f /var/log/verscienta/app.log

# 5. Verify admin panel works
curl https://verscienta.com/admin/api/herbs?limit=1
```

---

## Rollback Procedures

### Automatic Rollback (Payload Only)

```bash
# Rollback last Payload migration
pnpm db:migrate:down

# This will:
# 1. Rollback Payload CMS tables
# 2. Show warning about Prisma (manual rollback required)
```

### Manual Rollback (Prisma)

Prisma doesn't support automatic rollback. To rollback:

```bash
# Option 1: Mark migration as resolved
pnpm prisma migrate resolve --rolled-back [migration_name]

# Option 2: Restore from backup (recommended)
psql $DATABASE_URL < backup.sql

# Option 3: Write rollback SQL manually
psql $DATABASE_URL -f rollback.sql
```

### Emergency Rollback Plan

```bash
# 1. Stop application
systemctl stop verscienta

# 2. Restore database from backup
pg_restore -d verscienta_health backup.dump

# 3. Revert application code
git revert [commit-hash]
git push

# 4. Restart application
systemctl start verscienta
```

---

## Troubleshooting

### Migration Fails: "relation already exists"

**Problem:** Migration tries to create table/index that already exists

**Solution:**
```bash
# Check what exists
psql $DATABASE_URL -c "\dt"  # List tables
psql $DATABASE_URL -c "\di"  # List indexes

# Mark migration as applied (if safe)
pnpm prisma migrate resolve --applied [migration_name]
```

### Payload Migration Fails: "push is disabled"

**Problem:** Trying to run Payload in production without migrations

**Solution:**
```bash
# Ensure migrations are created
pnpm payload migrate:create

# Apply migrations
pnpm payload migrate

# Or use combined CLI
pnpm db:migrate:up
```

### Database Connection Timeout

**Problem:** Cannot connect to database during migration

**Solution:**
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check PostgreSQL is running
docker ps | grep postgres

# Check network/firewall
ping postgres-host
```

### Out of Sync: Prisma vs Database

**Problem:** Prisma schema doesn't match database

**Solution:**
```bash
# Reset database (DEVELOPMENT ONLY)
pnpm prisma migrate reset

# Or manually sync
pnpm prisma db push

# Generate Prisma client
pnpm prisma generate
```

### Payload Migration Conflicts

**Problem:** Multiple developers created conflicting migrations

**Solution:**
```bash
# 1. Pull latest migrations
git pull origin main

# 2. Check status
pnpm db:migrate:status

# 3. Regenerate if needed
pnpm payload migrate:create

# 4. Resolve conflicts manually in migration files
```

---

## Best Practices

### Development

1. **Always test migrations locally** before pushing
2. **Create descriptive migration names**: `add_herb_cultivation_field` not `migration1`
3. **Keep migrations small**: One logical change per migration
4. **Never edit existing migrations**: Create new ones instead
5. **Commit migration files immediately**: Don't let them get out of sync

### Production

1. **Always backup before migrations**: Automated backups + manual verification
2. **Test on staging first**: Run migrations on staging environment
3. **Schedule maintenance windows**: For large migrations (> 1 minute)
4. **Monitor after deployment**: Check logs and performance
5. **Document rollback plan**: Before every production migration

### Database Changes

1. **Add columns as nullable first**: Then backfill data, then make required
2. **Create indexes CONCURRENTLY**: Avoid table locks
   ```sql
   CREATE INDEX CONCURRENTLY "idx_name" ON "table" ("column");
   ```
3. **Drop columns in stages**:
   - Step 1: Stop using column in code
   - Step 2: Deploy code
   - Step 3: Drop column in migration
4. **Rename tables carefully**: Use views as aliases during transition
5. **Test with production data volume**: Migrations slow with millions of rows

### Migration Naming

```bash
# Good names (descriptive, actionable)
add_herb_scientific_name_index
create_formula_ingredients_table
update_user_role_enum

# Bad names (vague, unclear)
migration1
fix_stuff
update_schema
```

---

## Database Indexes

### Included in Initial Migration

The initial Prisma migration (`20251019000000_init`) includes **39 performance indexes**:

- **User table**: 5 indexes (role, emailVerified, createdAt, etc.)
- **Session table**: 6 indexes (userId, expiresAt, ipAddress, composites)
- **ApiRequestLog table**: 10 indexes (path, method, statusCode, composites)
- **AuditLog table**: 7 indexes (userId, action, severity, composites)
- **Account table**: 3 indexes
- **Verification table**: 3 indexes
- **DeviceToken table**: 2 indexes
- **PasswordHistory table**: 3 indexes

**Performance Impact:**
- User authentication: **40x faster** (200ms → 5ms)
- Session validation: **50x faster** (150ms → 3ms)
- API analytics: **50x faster** (1000ms → 20ms)
- Audit log queries: **50x faster** (500ms → 10ms)

See [DATABASE_INDEX_DEPLOYMENT.md](./DATABASE_INDEX_DEPLOYMENT.md) for details.

---

## Migration Files

### Prisma Migration File Structure

```sql
-- CreateTable
CREATE TABLE "tablename" (
    "id" TEXT NOT NULL,
    "field" TEXT,
    CONSTRAINT "tablename_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tablename_field_idx" ON "tablename"("field");

-- AddForeignKey
ALTER TABLE "tablename" ADD CONSTRAINT "fk" FOREIGN KEY ("id") REFERENCES "other"("id");
```

### Payload Migration File Structure

```typescript
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- Your migration SQL here
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- Rollback SQL here
  `)
}
```

---

## Environment Variables

### Required for Migrations

```env
# Database connection (required)
DATABASE_URL=postgresql://user:password@host:5432/database

# Node environment (affects Payload push mode)
NODE_ENV=production  # Disables auto-push, requires migrations
NODE_ENV=development # Enables auto-push for convenience

# Payload secret (required for Payload migrations)
PAYLOAD_SECRET=your-secret-key-here
```

### Optional Settings

```env
# Migration directory (default: payload/migrations)
PAYLOAD_MIGRATION_DIR=payload/migrations

# Prisma migration directory (default: prisma/migrations)
PRISMA_MIGRATION_DIR=prisma/migrations

# Database timeout
DATABASE_STATEMENT_TIMEOUT=60000  # 60 seconds
```

---

## Related Documentation

- [DATABASE_INDEX_DEPLOYMENT.md](./DATABASE_INDEX_DEPLOYMENT.md) - Index deployment guide
- [DATABASE_INDEXES.md](./DATABASE_INDEXES.md) - Index strategy and details
- [scripts/db/README.md](../apps/web/scripts/db/README.md) - Database scripts documentation
- [Payload Migrations Docs](https://payloadcms.com/docs/database/migrations) - Official Payload docs
- [Prisma Migrations Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate) - Official Prisma docs

---

## Support

For issues or questions:
- Check this documentation
- Review migration files in `prisma/migrations/` and `payload/migrations/`
- Check environment variables in `.env.local`
- Run `pnpm db:migrate:status` to diagnose
- Restore from backup if needed

---

**Last Updated:** January 20, 2025
**Maintained By:** Verscienta Engineering Team
