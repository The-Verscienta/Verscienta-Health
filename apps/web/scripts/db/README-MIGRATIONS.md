# Database Migrations - Quick Reference

Quick reference for database migration commands and workflows.

## Quick Commands

```bash
# Check what needs to run
pnpm db:migrate:status

# Run all pending migrations
pnpm db:migrate:up

# Rollback last migration (Payload only)
pnpm db:migrate:down

# Verify indexes deployed
pnpm db:verify
```

## Common Workflows

### First Time Setup

```bash
# 1. Start database
docker compose up postgres -d

# 2. Check status
pnpm db:migrate:status

# 3. Run migrations
pnpm db:migrate:up

# 4. Verify
pnpm db:verify

# 5. Seed data (optional)
pnpm seed
```

### Adding a New Field (Prisma)

```bash
# 1. Edit prisma/schema.prisma
# Add field to model

# 2. Create migration
pnpm prisma migrate dev --name add_user_avatar

# 3. Commit
git add prisma/
git commit -m "Add user avatar field"
```

### Adding a New Field (Payload)

```bash
# 1. Edit collection file
# Example: payload/collections/Herbs.ts

# 2. Generate migration
pnpm payload migrate:create

# 3. Test in development
pnpm dev  # Auto-applies with push: true

# 4. Commit
git add payload/
git commit -m "Add cultivation field to Herbs"
```

### Production Deployment

```bash
# Before deployment
1. Backup database
2. Test on staging
3. Review migrations

# Deploy
export DATABASE_URL="postgresql://..."
export NODE_ENV=production
pnpm db:migrate:up

# After deployment
pnpm db:verify
pnpm db:monitor
```

## Migration System

### Two Systems

1. **Prisma**: Better Auth tables (User, Session, Account)
2. **Payload**: CMS tables (Herbs, Formulas, Practitioners)

### Files Location

```
apps/web/
├── prisma/migrations/         # Prisma migrations
│   └── 20251019000000_init/  # Initial + 39 indexes
└── payload/migrations/        # Payload migrations
    └── [timestamp]_name.ts
```

## Environment Setup

### Development

```env
DATABASE_URL=postgresql://user:password@localhost:5432/verscienta_health
NODE_ENV=development  # Enables Payload auto-push
```

### Production

```env
DATABASE_URL=postgresql://user:password@host:5432/verscienta_health
NODE_ENV=production  # Requires explicit migrations
PAYLOAD_SECRET=your-secret-key
```

## Troubleshooting

### "relation already exists"

```bash
# Check what exists
psql $DATABASE_URL -c "\dt"

# Mark as applied if safe
pnpm prisma migrate resolve --applied [name]
```

### "push is disabled"

```bash
# Create Payload migration first
pnpm payload migrate:create

# Then apply
pnpm payload migrate
```

### Out of sync

```bash
# Development only - reset and reapply
pnpm prisma migrate reset

# Production - restore from backup
```

## Best Practices

1. ✅ Always backup before production migrations
2. ✅ Test locally first
3. ✅ Create descriptive migration names
4. ✅ Keep migrations small (one change per migration)
5. ✅ Never edit existing migrations
6. ✅ Commit migration files immediately
7. ✅ Add nullable columns first, backfill, then make required
8. ✅ Create indexes CONCURRENTLY in production

## Database Indexes

Initial migration includes **39 indexes**:

- User authentication: 40x faster
- Session validation: 50x faster
- API analytics: 50x faster
- Audit logs: 50x faster

See `docs/DATABASE_INDEX_DEPLOYMENT.md` for details.

## Full Documentation

See `docs/DATABASE_MIGRATIONS.md` for comprehensive guide.

## Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm db:migrate` | Show help |
| `pnpm db:migrate:up` | Run pending migrations |
| `pnpm db:migrate:down` | Rollback last migration |
| `pnpm db:migrate:status` | Check migration status |
| `pnpm db:verify` | Verify indexes |
| `pnpm db:monitor` | Monitor index usage |
| `pnpm prisma migrate dev --name X` | Create Prisma migration |
| `pnpm payload migrate:create` | Create Payload migration |

## Support

Questions? Check:
- `docs/DATABASE_MIGRATIONS.md` - Full guide
- `docs/DATABASE_INDEX_DEPLOYMENT.md` - Index deployment
- `scripts/db/README.md` - Database scripts

Or run: `pnpm db:migrate help`
