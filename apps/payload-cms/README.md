# Verscienta Health - Payload CMS

Modern headless CMS built with Payload 3.62 and Next.js 15 for managing comprehensive herbal medicine and wellness content.

## 🎯 Overview

This CMS manages:
- **13 Collections**: 200+ fields total
- **1 Global**: Trefle import state
- **Automated Jobs**: Trefle botanical data sync
- **Search Integration**: Algolia auto-indexing
- **Media**: Cloudflare Images/R2 upload

## 📊 Collections

### Core Content
- **Herbs** (40+ fields) - Comprehensive herbal database with TCM properties, safety info, clinical studies
- **Formulas** - Traditional herbal formulas with ingredient system
- **Conditions** - Health conditions with TCM patterns
- **Symptoms** - Symptom database for AI checker

### Directory
- **Practitioners** - Verified practitioner directory with geolocation
- **Modalities** - Treatment modalities and certifications

### User-Generated
- **Reviews** - Polymorphic reviews (herbs/formulas/practitioners/modalities)
- **Grok-Insights** - AI-generated health insights

### System
- **Users** - Authentication with role-based access
- **Media** - File uploads with image processing
- **Audit-Logs** - HIPAA-compliant immutable logs
- **Import-Logs** - Data import tracking
- **Validation-Reports** - Data quality monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- PostgreSQL 17+

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URI and other credentials

# Run migrations
pnpm payload migrate

# Start development server
pnpm dev

# Open admin panel
# http://localhost:3001/admin
```

### First Time Setup

1. **Create Admin User**: Visit http://localhost:3001/admin and create your first user
2. **Test Collections**: Try creating a Herb, Formula, or Condition
3. **Test API**: `curl http://localhost:3001/api/herbs`

## 📁 Project Structure

```
apps/payload-cms/
├── app/                      # Next.js app directory
│   ├── (payload)/
│   │   ├── admin/            # Payload admin UI
│   │   └── api/              # REST API routes
│   ├── layout.tsx
│   └── globals.css
├── src/
│   ├── collections/          # Collection definitions (13)
│   │   ├── Users.ts
│   │   ├── Media.ts
│   │   ├── Herbs.ts          # Largest - 700+ lines
│   │   ├── Formulas.ts
│   │   ├── Conditions.ts
│   │   ├── Symptoms.ts
│   │   ├── Practitioners.ts
│   │   ├── Modalities.ts
│   │   ├── Reviews.ts        # Polymorphic relations
│   │   ├── GrokInsights.ts
│   │   ├── AuditLogs.ts
│   │   ├── ImportLogs.ts
│   │   └── ValidationReports.ts
│   ├── globals/              # Global configs
│   │   └── TrefleImportState.ts
│   ├── hooks/                # Lifecycle hooks
│   │   └── algolia-sync.ts   # (to be created)
│   ├── jobs/                 # Background jobs
│   │   ├── syncTrefleData.ts # Weekly Trefle sync
│   │   └── importTrefleData.ts # Progressive import
│   ├── lib/                  # Utilities
│   │   └── trefle.ts         # Trefle API client
│   └── payload.config.ts     # Main configuration
├── .env                      # Environment variables
├── .env.example              # Environment template
├── nixpacks.toml             # Coolify deployment config
├── package.json
├── tsconfig.json
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables

Required:
```bash
# Payload
PAYLOAD_SECRET=your-secret-key
PAYLOAD_PUBLIC_SERVER_URL=https://cms.your-domain.com
DATABASE_URI=postgresql://user:pass@host:5432/database

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_IMAGES_API_TOKEN=
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
CLOUDFLARE_BUCKET_NAME=
CLOUDFLARE_ACCOUNT_HASH=

# Algolia
ALGOLIA_APP_ID=
ALGOLIA_ADMIN_API_KEY=

# Trefle API
TREFLE_API_KEY=
ENABLE_TREFLE_IMPORT=false  # Set true to enable progressive import
```

### Database Schema

After running migrations, you'll have:

**Core Tables:**
- `users`, `media`, `herbs`, `formulas`, `conditions`, `symptoms`

**Directory Tables:**
- `practitioners`, `modalities`, `reviews`

**System Tables:**
- `grok_insights`, `audit_logs`, `import_logs`, `validation_reports`

**Globals:**
- `trefle_import_state`

**System:**
- `payload_migrations`, `payload_preferences`
- Plus junction tables for many-to-many relationships

## 🔌 API Usage

### REST API

All collections are accessible via REST API:

```bash
# Get all herbs
GET /api/herbs?limit=25&page=1

# Get herb by slug
GET /api/herbs?where[slug][equals]=ginseng

# Get herb with relationships
GET /api/herbs/[id]?depth=2

# Search herbs
GET /api/herbs?where[title][contains]=ginseng

# Create herb (requires authentication)
POST /api/herbs
Authorization: Bearer YOUR_TOKEN
```

### GraphQL (Optional)

GraphQL endpoint available at `/api/graphql`

Schema auto-generated from collections.

### Authentication

```bash
# Login
POST /api/users/login
{
  "email": "user@example.com",
  "password": "password"
}

# Get current user
GET /api/users/me
Authorization: Bearer YOUR_TOKEN
```

## 🤖 Background Jobs

### Trefle Sync Job

Enriches herbs with botanical data from Trefle API.

**Schedule**: Every Wednesday at 3:00 AM
**Processes**: 30 herbs per run
**Features**:
- Validates scientific names
- Adds synonyms, distributions
- Creates validation reports for mismatches
- Logs all operations

**Manual trigger**:
```bash
pnpm payload jobs:run sync-trefle-data
```

### Trefle Import Job

Progressive import of 1M+ plants from Trefle database.

**Schedule**: Every minute (when enabled)
**Processes**: 20 plants per batch
**Status**: Disabled by default (set `ENABLE_TREFLE_IMPORT=true` to enable)

⚠️ **Warning**: Will create hundreds of thousands of draft herbs!

## 🔍 Search Integration

Algolia hooks auto-index content on changes:

**Indexed Collections:**
- Herbs
- Formulas
- Conditions
- Practitioners

**Hook**: `afterChange` on each collection
**Operations**: Create, Update, Delete automatically sync to Algolia

## 📦 Deployment

### Coolify (Recommended)

Uses Nixpacks for automatic detection:

1. Create PostgreSQL service in Coolify
2. Create new application from GitHub repo
3. Set environment variables
4. Deploy!

**Build**: Automatic via Nixpacks
**Port**: 3001
**Health Check**: `/api/health`

See [COOLIFY_DEPLOYMENT.md](../../COOLIFY_DEPLOYMENT.md) for detailed guide.

### Docker

```bash
docker build -t verscienta-cms .
docker run -p 3001:3001 \
  -e DATABASE_URI=postgresql://... \
  -e PAYLOAD_SECRET=... \
  verscienta-cms
```

### Manual

```bash
pnpm install --prod
pnpm build
pnpm start
```

## 🧪 Development

### Scripts

```bash
# Development
pnpm dev                    # Start dev server (port 3001)
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm payload migrate        # Run migrations
pnpm payload migrate:create # Create new migration
pnpm payload migrate:status # Check migration status

# Type Generation
pnpm generate:types         # Generate TypeScript types
pnpm generate:importmap     # Generate import map

# Jobs
pnpm payload jobs:run sync-trefle-data   # Manual job trigger
```

### Adding New Collections

1. Create `src/collections/YourCollection.ts`
2. Import in `src/payload.config.ts`
3. Add to `collections` array
4. Run `pnpm payload migrate`
5. Restart dev server

### Adding New Jobs

1. Create `src/jobs/yourJob.ts`
2. Export handler: `export const yourJob: PayloadHandler = async ({ payload }) => { ... }`
3. Add to `payload.config.ts` jobs configuration
4. Deploy

## 🔒 Access Control

**Roles:**
- `admin` - Full access to all collections
- `user` - Can create content, reviews
- `public` - Read-only access to published content

**Collections:**
- Read: Public (published content only)
- Create: Authenticated users
- Update: Content owners + admins
- Delete: Admins only

**Special Cases:**
- Audit Logs: Immutable (create-only, admin read)
- Grok Insights: Users can only see their own
- Practitioners: Verification workflow (pending → verified)

## 📈 Performance

### Optimizations

- Indexed fields: `slug`, `userId`, `sessionId`, etc.
- Pagination: Default 25, max 100 per page
- Depth control: Limit relationship population
- Caching: Built-in Next.js caching

### Monitoring

- Server logs: `pnpm logs`
- Database queries: Enable query logging in development
- Job execution: Check `import_logs` collection
- Errors: Check `audit_logs` for security events

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URI` in `.env`
- Verify PostgreSQL is running
- Test connection: `psql $DATABASE_URI`

### "Migration failed"
- Ensure database is empty on first run
- Check database permissions
- Try: `pnpm payload migrate:create`

### "Module not found"
- Run `pnpm install`
- Check `pnpm-lock.yaml` is committed
- Clear cache: `rm -rf .next node_modules`

### "Port already in use"
- Change port in `.env`: `PORT=3002`
- Kill process: Windows `netstat -ano | findstr :3001`

## 📚 Resources

- **Payload Docs**: https://payloadcms.com/docs
- **API Reference**: https://payloadcms.com/docs/rest-api
- **Jobs API**: https://payloadcms.com/docs/jobs
- **Access Control**: https://payloadcms.com/docs/access-control
- **Migration Guide**: [../MIGRATION_STATUS.md](../../MIGRATION_STATUS.md)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Run migrations if schema changed
5. Commit with descriptive message
6. Push and create PR

## 📄 License

Proprietary - Verscienta Health

---

**Questions?** Check the main [README](../../README.md) or [MIGRATION_STATUS.md](../../MIGRATION_STATUS.md)
