# Strapi → Payload CMS Migration Status

**Migration Started**: 2025-10-31
**Current Status**: Phase 2 - Collections Migration (60% Complete)

---

## Executive Summary

We're migrating from Strapi CMS 5.28.0 to Payload CMS 3.62.0. The migration includes:
- **13 collections** with 200+ fields total
- **32 Strapi components** → Payload fields/blocks/groups
- **Custom integrations**: Trefle API, Algolia search, Cloudflare storage
- **Cron jobs** → Payload Jobs API
- **Frontend refactoring**: Next.js 16 with new API client

---

## ✅ Completed (Phase 1 & 2A)

### Phase 1: Initial Setup
- ✅ Payload CMS 3.62.0 installed with all dependencies
- ✅ Next.js integration configured (`apps/payload-cms/`)
- ✅ TypeScript configuration
- ✅ Development environment setup
- ✅ Basic directory structure created

### Phase 2A: Core Collections (60% Complete)
- ✅ **Users** collection - Basic auth with role-based access
- ✅ **Media** collection - Upload with image sizes, Cloudflare-ready
- ✅ **Herbs** collection - Complete with 40+ fields, all 15 components migrated:
  - Botanical info, TCM properties, common names, synonyms
  - Native regions, cultivation info, active constituents
  - Clinical studies, dosage, preparation methods
  - Safety info, drug interactions, images, videos
  - Relationships: related herbs, substitutes, conditions
- ✅ **Formulas** collection - Complete with ingredient system:
  - Herb relationships within ingredients array
  - TCM role system (chief, deputy, assistant, envoy)
  - Use cases, preparation, dosage
- ✅ **Conditions** collection - Complete with TCM patterns:
  - Symptoms, severity, category
  - TCM patterns, Western diagnosis
  - Relationships: herbs, formulas, symptoms

---

## 🚧 In Progress (Phase 2B)

### Collections with Ready Templates
All code templates are prepared in `PAYLOAD_COLLECTION_TEMPLATES.md`:

1. **Symptoms** - Template ready
   - Red flags, TCM/Western interpretations
   - Common causes, severity levels
   - Relationships: conditions, herbs

2. **Practitioners** - Template ready
   - Credentials, specialties, languages
   - Address management with geolocation
   - Insurance, pricing
   - Verification workflow
   - Relationships: user, modalities

3. **Modalities** - Template ready
   - Benefits, certification bodies
   - Treatment approaches
   - Relationships: conditions, herbs

4. **Reviews** - Template ready
   - **Polymorphic relations** (herbs/formulas/practitioners/modalities)
   - Moderation workflow
   - Helpfulness tracking

5. **Grok-Insights** - Template ready
   - AI-generated insights
   - Session tracking, token monitoring
   - Recommendations, follow-up questions
   - Relationships: herbs, conditions, user

6. **Audit-Logs** - Template ready
   - HIPAA-compliant immutable logs
   - 30+ action types
   - Security monitoring

7. **Import-Logs** - Schema ready (needs template creation)
   - Trefle/Perenual sync tracking
   - Performance metrics

8. **Validation-Reports** - Schema ready (needs template creation)
   - Data quality tracking
   - Field-level validation

9. **Trefle-Import-State** (Global) - Template ready
   - Progressive import state
   - Pagination tracking

---

## 📋 Next Immediate Steps

### Step 1: Complete Collection Migration (1-2 days)
```bash
# 1. Copy templates from PAYLOAD_COLLECTION_TEMPLATES.md
# 2. Create each collection file:
apps/payload-cms/src/collections/Symptoms.ts
apps/payload-cms/src/collections/Practitioners.ts
apps/payload-cms/src/collections/Modalities.ts
apps/payload-cms/src/collections/Reviews.ts
apps/payload-cms/src/collections/GrokInsights.ts
apps/payload-cms/src/collections/AuditLogs.ts
apps/payload-cms/src/collections/ImportLogs.ts
apps/payload-cms/src/collections/ValidationReports.ts

# 3. Create global:
apps/payload-cms/src/globals/TrefleImportState.ts

# 4. Update payload.config.ts to import all collections
```

### Step 2: Database Setup (1 hour)
**Option A: Cloud PostgreSQL (Recommended for quick start)**
```bash
# Use Supabase, Neon, or Vercel Postgres
# Get connection string and update .env:
DATABASE_URI=postgresql://user:password@host:5432/database
```

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL 17
# Create database:
createdb verscienta_payload
# Update .env with local connection
```

### Step 3: Run Migrations & Test (30 mins)
```bash
cd apps/payload-cms
pnpm payload migrate
pnpm dev  # Start on http://localhost:3001/admin
```

### Step 4: Port Trefle Integration (2-3 hours)
```bash
# 1. Copy Trefle library:
cp apps/strapi-cms/src/lib/trefle.ts apps/payload-cms/src/lib/trefle.ts

# 2. Create Payload Jobs:
apps/payload-cms/src/jobs/syncTrefleData.ts
apps/payload-cms/src/jobs/importTrefleData.ts

# 3. Update payload.config.ts with jobs configuration
```

### Step 5: Algolia Hooks (2-3 hours)
```typescript
// Create: apps/payload-cms/src/hooks/algolia-sync.ts
// Add afterChange hooks to:
// - Herbs
// - Formulas
// - Conditions
// - Practitioners
```

### Step 6: Cloudflare Upload Adapter (1-2 hours)
```typescript
// Option A: Use existing S3 plugin (already configured in payload.config.ts)
// Option B: Custom Cloudflare Images adapter
// apps/payload-cms/src/uploads/cloudflare-images.ts
```

---

## 📂 Current Project Structure

```
apps/payload-cms/
├── app/                          # Next.js app directory
│   ├── (payload)/
│   │   ├── admin/                # Payload admin UI
│   │   └── api/                  # Payload REST API
│   ├── layout.tsx
│   └── globals.css
├── src/
│   ├── collections/              # ✅ 5/13 collections created
│   │   ├── Users.ts              # ✅
│   │   ├── Media.ts              # ✅
│   │   ├── Herbs.ts              # ✅
│   │   ├── Formulas.ts           # ✅
│   │   ├── Conditions.ts         # ✅
│   │   ├── Symptoms.ts           # ⏳ Template ready
│   │   ├── Practitioners.ts      # ⏳ Template ready
│   │   ├── Modalities.ts         # ⏳ Template ready
│   │   ├── Reviews.ts            # ⏳ Template ready
│   │   ├── GrokInsights.ts       # ⏳ Template ready
│   │   ├── AuditLogs.ts          # ⏳ Template ready
│   │   ├── ImportLogs.ts         # ⏳ Pending
│   │   └── ValidationReports.ts  # ⏳ Pending
│   ├── globals/                  # Global configs
│   │   └── TrefleImportState.ts  # ⏳ Template ready
│   ├── hooks/                    # Algolia, lifecycle hooks
│   │   └── algolia-sync.ts       # ⏳ Pending
│   ├── jobs/                     # Background jobs (cron replacement)
│   │   ├── syncTrefleData.ts     # ⏳ Pending
│   │   └── importTrefleData.ts   # ⏳ Pending
│   ├── lib/                      # Utilities
│   │   └── trefle.ts             # ⏳ Copy from Strapi
│   ├── uploads/                  # Custom upload adapters
│   │   └── cloudflare-images.ts  # ⏳ Optional
│   └── payload.config.ts         # ✅ Main config (needs updates)
├── .env                          # ✅ Configured (needs DATABASE_URI)
├── .env.example                  # ✅
├── package.json                  # ✅
├── tsconfig.json                 # ✅
└── next.config.mjs               # ✅
```

---

## 🔄 Frontend Integration (Phase 5-6)

### Current Frontend Setup
- **Framework**: Next.js 16.0.0 with App Router
- **Current API**: `apps/web/lib/strapi-api.ts`
- **Affected Pages**:
  - `/app/[lang]/contact/page.tsx`
  - `/app/[lang]/profile/page.tsx`
  - `/app/[lang]/register/page.tsx`
  - `/app/[lang]/settings/page.tsx`
  - `/app/[lang]/symptom-checker/page.tsx`
  - Herb/Formula/Condition listing & detail pages

### Migration Plan
1. **Create**: `apps/web/lib/payload-api.ts`
2. **Replace all**: `import { ... } from '@/lib/strapi-api'`
3. **Update response handling**:
   - Strapi: `data.attributes.fieldName`
   - Payload: `doc.fieldName`
   - Strapi: `meta.pagination`
   - Payload: `pagination` (root level)

---

## 📊 Migration Metrics

| Metric | Progress | Status |
|--------|----------|--------|
| Collections | 5/13 (38%) | 🟡 In Progress |
| Components Migrated | 15/32 (47%) | 🟡 In Progress |
| Custom Integrations | 0/3 (0%) | 🔴 Not Started |
| Frontend Refactoring | 0% | 🔴 Not Started |
| Testing | 0% | 🔴 Not Started |
| Overall Migration | ~30% | 🟡 In Progress |

---

## ⏰ Estimated Timeline

| Phase | Tasks | Time Estimate | Status |
|-------|-------|---------------|--------|
| 1 | Initial Setup | 4 hours | ✅ Complete |
| 2A | Core Collections (5) | 1 day | ✅ Complete |
| 2B | Remaining Collections (8) | 1-2 days | 🚧 40% |
| 3 | Auth & Access Control | 2 hours | ⏳ Pending |
| 4 | Custom Integrations | 1 day | ⏳ Pending |
| 5 | API Layer | 3 hours | ⏳ Pending |
| 6 | Frontend Refactoring | 2-3 days | ⏳ Pending |
| 7 | Testing | 1-2 days | ⏳ Pending |
| 8 | Cleanup & Deploy | 1 day | ⏳ Pending |
| **Total** | **Full Migration** | **7-10 days** | **~30%** |

---

## 🎯 Success Criteria

- [ ] All 13 collections migrated with full functionality
- [ ] All 32 components converted to Payload fields/blocks
- [ ] All relationships working correctly
- [ ] Trefle integration ported to Payload Jobs
- [ ] Algolia auto-indexing working via hooks
- [ ] Frontend fully refactored to use Payload API
- [ ] All tests passing (CRUD, integrations, frontend)
- [ ] Cloudflare media upload working
- [ ] Production deployment successful
- [ ] Strapi completely removed
- [ ] Documentation updated

---

## 🔗 Key Files & Resources

- **Main Config**: `apps/payload-cms/src/payload.config.ts`
- **Collection Templates**: `PAYLOAD_COLLECTION_TEMPLATES.md`
- **Todo Tracking**: `MIGRATION_TODOS.md`
- **Payload Docs**: https://payloadcms.com/docs
- **Strapi Schemas**: `apps/strapi-cms/src/api/*/content-types/*/schema.json`
- **Strapi Components**: `apps/strapi-cms/src/components/**/*.json`

---

## 🚀 Quick Start Guide

To continue the migration:

```bash
# 1. Navigate to payload-cms directory
cd apps/payload-cms

# 2. Copy collection templates and create files
# (Use PAYLOAD_COLLECTION_TEMPLATES.md as reference)

# 3. Set up database
# Update .env with your PostgreSQL connection string

# 4. Run migrations
pnpm payload migrate

# 5. Start dev server
pnpm dev

# 6. Access admin panel
# Open http://localhost:3001/admin
# Create your first admin user

# 7. Test collection creation
# Try creating a Herb, Formula, or Condition

# 8. Continue with remaining collections
```

---

## ⚠️ Important Notes

1. **Database Required**: PostgreSQL must be set up before running `pnpm dev`
2. **No Content Loss**: Original Strapi data is safe - we're building in parallel
3. **Payload 3.x Changes**: Different from Payload 2.x, uses Next.js integration
4. **Component Mapping**:
   - Simple components (1-3 fields) → `group` fields
   - Complex components (4+ fields) → `array` fields
   - Repeatable components → `array` fields with `fields` inside
5. **Relations**: Payload uses `relationship` field type (simpler than Strapi)
6. **Polymorphic**: Reviews use `relationTo: ['herbs', 'formulas', ...]` array

---

## 🐛 Known Issues & Solutions

### Issue: "Cannot connect to Postgres"
**Solution**: Update `.env` with valid `DATABASE_URI`

### Issue: "Module not found" errors
**Solution**: Run `pnpm install` in `apps/payload-cms`

### Issue: Build errors for Next.js
**Solution**: Ensure Node.js >= 18.20.2

### Issue: TypeScript errors
**Solution**: Run `pnpm generate:types` after creating collections

---

## 📞 Next Steps Summary

**Immediate** (Today):
1. Set up PostgreSQL database
2. Update DATABASE_URI in .env
3. Run `pnpm payload migrate`
4. Test Payload admin at http://localhost:3001/admin

**Short-term** (This Week):
1. Complete remaining 8 collections using templates
2. Port Trefle library and create Payload Jobs
3. Set up Algolia hooks
4. Test all CRUD operations

**Medium-term** (Next Week):
1. Create frontend `payload-api.ts`
2. Refactor all frontend API calls
3. Update components and pages
4. Run integration tests

**Final** (Week 3):
1. Deploy to staging
2. Full QA testing
3. Production cutover
4. Remove Strapi

---

**Last Updated**: 2025-10-31
**Next Review**: After completing Phase 2B (remaining collections)
