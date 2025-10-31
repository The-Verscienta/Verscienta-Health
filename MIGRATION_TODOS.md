# Strapi → Payload CMS Migration Checklist

## Migration Status: In Progress
**Started**: 2025-10-31
**Target Completion**: TBD

---

## Phase 1: Payload CMS Setup

### 1.1 Initial Setup
- [ ] Install and initialize Payload CMS with TypeScript and PostgreSQL
- [ ] Configure Payload environment variables and configs
- [ ] Create Cloudflare Images upload adapter for Payload

---

## Phase 2: Collections & Fields Migration (13 collections)

### 2.1 Core Collections (Priority 1)
- [ ] Migrate **Herb** collection (40+ fields, 15 components)
  - [ ] Convert botanical-info component
  - [ ] Convert TCM properties component
  - [ ] Convert common names and synonyms
  - [ ] Convert native region and cultivation
  - [ ] Convert active constituents
  - [ ] Convert clinical studies
  - [ ] Convert dosage and preparation methods
  - [ ] Convert safety info and drug interactions
  - [ ] Convert media (images, videos, photo gallery)
  - [ ] Set up relationships: conditions, related herbs, substitutes

- [ ] Migrate **Formula** collection
  - [ ] Convert ingredient component with herb relations
  - [ ] Set up preparation instructions and dosage
  - [ ] Configure relationships: herbs, conditions
  - [ ] Convert use-case component

- [ ] Migrate **Condition** collection
  - [ ] Convert TCM pattern fields
  - [ ] Convert Western diagnosis fields
  - [ ] Convert symptom-item component
  - [ ] Set up relationships: herbs, formulas, symptoms

- [ ] Migrate **Symptom** collection
  - [ ] Convert red flag warnings
  - [ ] Convert TCM and Western interpretations
  - [ ] Convert common-cause component
  - [ ] Set up relationships: conditions, herbs

### 2.2 Directory Collections (Priority 2)
- [ ] Migrate **Practitioner** collection
  - [ ] Convert credential component
  - [ ] Convert specialty component
  - [ ] Convert language component
  - [ ] Convert address component (geographic data)
  - [ ] Convert insurance-provider component
  - [ ] Convert pricing component
  - [ ] Implement verification workflow (pending/verified/suspended)
  - [ ] Set up relationships: modalities, user account

- [ ] Migrate **Modality** collection
  - [ ] Convert benefit component
  - [ ] Convert certification-body component
  - [ ] Convert excels-at component
  - [ ] Convert treatment-approach component
  - [ ] Set up relationships: conditions, herbs, practitioners

- [ ] Migrate **Review** collection
  - [ ] Implement polymorphic relations (relationTo array)
  - [ ] Set up moderation workflow states
  - [ ] Configure relationships: user, reviewed entities

### 2.3 Utility Collections (Priority 3)
- [ ] Migrate **Grok-Insight** collection
  - [ ] Convert AI insights fields
  - [ ] Convert recommendation component
  - [ ] Convert follow-up-question component
  - [ ] Set up session tracking
  - [ ] Set up token usage monitoring
  - [ ] Configure relationships: herbs, conditions, user

- [ ] Migrate **Audit-Log** collection
  - [ ] Implement HIPAA-compliant immutable logs
  - [ ] Set up 30+ action types
  - [ ] Configure security monitoring fields
  - [ ] Ensure PHI access tracking

- [ ] Migrate **Import-Log** collection
  - [ ] Convert Trefle/Perenual sync tracking
  - [ ] Set up performance metrics fields

- [ ] Migrate **Validation-Report** collection
  - [ ] Convert field-level validation tracking
  - [ ] Convert validation issue component
  - [ ] Set up severity levels

- [ ] Convert **Trefle-Import-State** to Payload global
  - [ ] Convert pagination state fields
  - [ ] Set up single-instance global

---

## Phase 3: Authentication & Access Control

### 3.1 User Authentication
- [ ] Set up Payload's built-in auth system
- [ ] Configure user roles: Public, Authenticated, Admin
- [ ] Handle integration with existing better-auth (if needed)

### 3.2 Access Control
- [ ] Define collection-level permissions
- [ ] Set up field-level access control for sensitive data
- [ ] Configure API key authentication for external services

---

## Phase 4: Custom Integrations

### 4.1 Trefle API Integration
- [ ] Port `src/lib/trefle.ts` to Payload project (494 lines)
  - [ ] Maintain rate limiting (120 req/min)
  - [ ] Preserve search, enrichment, validation functions
  - [ ] Keep TypeScript types

### 4.2 Payload Jobs (Cron → Jobs)
- [ ] Convert **syncTrefleData** cron to Payload Job
  - [ ] Set weekly schedule (Wednesday 3:00 AM)
  - [ ] Port enrichment logic (30 herbs per run)
  - [ ] Maintain validation report creation
  - [ ] Track sync timestamps

- [ ] Convert **importTrefleData** cron to Payload Job
  - [ ] Set minute schedule (disabled by default)
  - [ ] Port progressive import logic (20 plants per batch)
  - [ ] Maintain state management
  - [ ] Keep ENABLE_TREFLE_IMPORT flag

### 4.3 Algolia Search Integration
- [ ] Create afterChange hook for **Herbs** collection
  - [ ] Auto-index on create/update/delete
  - [ ] Configure searchable attributes
  - [ ] Set up population strategy

- [ ] Create afterChange hook for **Formulas** collection
- [ ] Create afterChange hook for **Conditions** collection
- [ ] Create afterChange hook for **Practitioners** collection
- [ ] Implement bulk indexing utility
- [ ] Configure Algolia indices settings

---

## Phase 5: API Layer

### 5.1 Payload API Configuration
- [ ] Configure pagination (default: 25, max: 100)
- [ ] Set up custom endpoints (if needed)
- [ ] Enable/disable endpoints per collection
- [ ] Configure CORS settings
- [ ] Set up rate limiting

### 5.2 Frontend API Client
- [ ] Delete `apps/web/lib/strapi-api.ts`
- [ ] Create `apps/web/lib/payload-api.ts`
  - [ ] Implement getHerbs()
  - [ ] Implement getHerbBySlug()
  - [ ] Implement getFormulas()
  - [ ] Implement getFormulaBySlug()
  - [ ] Implement getConditions()
  - [ ] Implement getConditionBySlug()
  - [ ] Implement getSymptoms()
  - [ ] Implement getPractitioners()
  - [ ] Implement getModalities()
  - [ ] Implement getReviews()

- [ ] Update `NEXT_PUBLIC_CMS_URL` environment variable

---

## Phase 6: Frontend Refactoring

### 6.1 Update API Imports
- [ ] Search for all `@/lib/strapi-api` imports
- [ ] Replace with `@/lib/payload-api` imports
- [ ] Update TypeScript types from `packages/api-types`

### 6.2 Update Response Format Handling
- [ ] Refactor: `data.attributes` → direct fields on `doc`
- [ ] Refactor: `data.id` → `doc.id`
- [ ] Refactor: `meta.pagination` → root level `pagination`
- [ ] Update nested relation access patterns

### 6.3 Update Components/Pages
- [ ] Update `/app/[lang]/contact/page.tsx`
- [ ] Update `/app/[lang]/profile/page.tsx`
- [ ] Update `/app/[lang]/register/page.tsx`
- [ ] Update `/app/[lang]/settings/page.tsx`
- [ ] Update `/app/[lang]/symptom-checker/page.tsx`
- [ ] Update herb listing/detail pages
- [ ] Update formula listing/detail pages
- [ ] Update condition listing/detail pages
- [ ] Update practitioner listing/detail pages
- [ ] Update modality listing/detail pages

---

## Phase 7: Testing & Validation

### 7.1 Collection CRUD Testing
- [ ] Test Herb collection (create, read, update, delete)
- [ ] Test Formula collection CRUD
- [ ] Test Condition collection CRUD
- [ ] Test Symptom collection CRUD
- [ ] Test Practitioner collection CRUD
- [ ] Test Modality collection CRUD
- [ ] Test Review collection CRUD
- [ ] Test Grok-Insight collection CRUD
- [ ] Test Audit-Log collection CRUD
- [ ] Test Import-Log collection CRUD
- [ ] Test Validation-Report collection CRUD
- [ ] Test Trefle-Import-State global

### 7.2 Relationship Testing
- [ ] Test many-to-many relationships (Herb ↔ Condition)
- [ ] Test one-to-one relationships (Practitioner → User)
- [ ] Test polymorphic relationships (Review system)
- [ ] Test self-referencing relationships (Herb ↔ Herb)

### 7.3 Media & Upload Testing
- [ ] Test image upload to Cloudflare Images
- [ ] Test R2 fallback storage
- [ ] Test image optimization/transformation
- [ ] Test photo gallery functionality
- [ ] Test CDN delivery

### 7.4 Integration Testing
- [ ] Test Trefle syncTrefleData job
- [ ] Test Trefle importTrefleData job
- [ ] Test Algolia auto-indexing (create)
- [ ] Test Algolia auto-indexing (update)
- [ ] Test Algolia auto-indexing (delete)
- [ ] Test bulk Algolia indexing

### 7.5 Authentication Testing
- [ ] Test user registration
- [ ] Test user login/logout
- [ ] Test role-based access control
- [ ] Test API key authentication

### 7.6 Frontend Integration Testing
- [ ] Test all herb pages (listing, detail, search)
- [ ] Test all formula pages
- [ ] Test all condition pages
- [ ] Test all practitioner pages
- [ ] Test all modality pages
- [ ] Test symptom checker functionality
- [ ] Test pagination across all listings
- [ ] Test filtering and search
- [ ] Test image rendering from Cloudflare
- [ ] End-to-end user flows (browse → detail → review)

---

## Phase 8: Migration Completion

### 8.1 Cleanup
- [ ] Delete `apps/strapi-cms/` directory
- [ ] Remove Strapi dependencies from root `package.json`
- [ ] Remove Strapi dependencies from pnpm-workspace.yaml (if listed)
- [ ] Update `turbo.json` build pipeline
  - [ ] Remove strapi-cms from build tasks
  - [ ] Add payload-cms to build tasks
- [ ] Clean up Strapi-specific environment variables
- [ ] Remove Strapi from `.gitignore` entries (if any)

### 8.2 Documentation
- [ ] Update `docs/CLAUDE.md` with Payload migration notes
- [ ] Document new Payload collections
- [ ] Document Payload Jobs (Trefle sync)
- [ ] Document Algolia hooks
- [ ] Update API documentation
- [ ] Update developer setup guide (`README.md`)
- [ ] Create Payload admin user guide
- [ ] Document content type schemas

### 8.3 Deployment
- [ ] Update Coolify deployment configuration
- [ ] Configure production PostgreSQL database
- [ ] Set up production environment variables
  - [ ] Database credentials
  - [ ] Cloudflare credentials
  - [ ] Algolia credentials
  - [ ] Trefle API key
  - [ ] Payload secret keys
- [ ] Test production build locally
- [ ] Deploy to staging environment
- [ ] Run full QA on staging
- [ ] Deploy to production
- [ ] Monitor production logs for errors
- [ ] Verify all integrations working in production

---

## Success Criteria

- ✅ All 13 collections migrated with full functionality
- ✅ All 32 components converted to Payload fields/blocks
- ✅ All relationships working correctly
- ✅ Trefle integration ported to Payload Jobs
- ✅ Algolia auto-indexing working via hooks
- ✅ Frontend fully refactored to use Payload API
- ✅ All tests passing (CRUD, integrations, frontend)
- ✅ Cloudflare media upload working
- ✅ Production deployment successful
- ✅ Strapi completely removed
- ✅ Documentation updated

---

## Notes

### Important Considerations
- This project previously migrated FROM Payload TO Strapi (Oct 2025)
- Now migrating back to Payload with lessons learned
- No content exists in Strapi yet - clean slate migration
- Preserve all business logic (Trefle, Algolia, audit logs)

### Key Differences: Strapi v5 → Payload v3
- **Components**: Strapi components → Payload fields/blocks/groups
- **Relations**: Similar but different syntax
- **Hooks**: Strapi lifecycle → Payload hooks
- **Jobs**: Strapi cron → Payload jobs API
- **Auth**: Different permission systems
- **API**: Different response formats

### Rollback Plan
- Keep Strapi codebase until Payload is fully tested
- Can revert git commits if issues arise
- Maintain database backups before production cutover

---

## Current Status: Phase 1 - Initial Setup
**Last Updated**: 2025-10-31
**Next Steps**: Install Payload CMS and configure initial setup
