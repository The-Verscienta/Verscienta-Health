# PayloadCMS 3.0 Plugins and Hooks Documentation

**Last Updated:** 2025-01-20
**Payload Version:** 3.62.1

This document provides comprehensive documentation of all PayloadCMS plugins, hooks, and access control patterns used in the Verscienta Health platform.

---

## Table of Contents

1. [Payload Plugins](#payload-plugins)
2. [Collection Hooks](#collection-hooks)
3. [Access Control Patterns](#access-control-patterns)
4. [Plugin Integration Guide](#plugin-integration-guide)
5. [Troubleshooting Guide](#troubleshooting-guide)

---

## Payload Plugins

### Core Plugins

#### 1. PostgreSQL Database Adapter (`@payloadcms/db-postgres`)

**Version:** 3.62.1
**Purpose:** Database persistence layer for Payload CMS

**Configuration:**
```typescript
// apps/web/payload.config.ts
import { postgresAdapter } from '@payloadcms/db-postgres'

db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URL,
  },
  migrationDir: path.resolve(dirname, 'payload/migrations'),
  push: process.env.NODE_ENV !== 'production', // Auto-push in dev only
})
```

**Features:**
- Full PostgreSQL support with connection pooling
- Automatic schema migrations in development
- Manual migration control in production
- Supports complex relationships and queries
- ACID compliance for data integrity

**Migration Strategy:**
- **Development:** Auto-push enabled (`push: true`) - schema changes applied automatically
- **Production:** Manual migrations required (`push: false`) - use migration files for schema changes

**Related Files:**
- Configuration: `apps/web/payload.config.ts:30-36`
- Migrations: `apps/web/payload/migrations/` (auto-generated)

---

#### 2. Lexical Rich Text Editor (`@payloadcms/richtext-lexical`)

**Version:** 3.62.1
**Purpose:** Modern rich text editor for content fields

**Configuration:**
```typescript
// apps/web/payload.config.ts
import { lexicalEditor } from '@payloadcms/richtext-lexical'

editor: lexicalEditor({})
```

**Features:**
- Modern WYSIWYG editing experience
- Block-based content structure
- Extensible with custom nodes
- Markdown shortcuts
- Undo/redo support
- Accessibility compliant

**Usage in Collections:**
Used in richText fields across multiple collections:
- Herbs: `description`, `botanicalDescription`, `pharmacologicalEffects`
- Formulas: `description`, `preparationInstructions`, `dosage`
- Conditions: `description`, `conventionalTreatments`, `complementaryApproaches`
- And more...

**Related Files:**
- Configuration: `apps/web/payload.config.ts:37`

---

#### 3. Sharp Image Processing (`sharp`)

**Version:** 0.34.4
**Purpose:** High-performance image processing for uploads

**Configuration:**
```typescript
// apps/web/payload.config.ts
import sharp from 'sharp'

sharp,
```

**Features:**
- Automatic image resizing
- Format conversion (JPEG, PNG, WebP)
- Quality optimization
- Thumbnail generation
- Fast processing with libvips

**Image Sizes Configured:**
```typescript
// apps/web/payload/collections/Media.ts
imageSizes: [
  { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
  { name: 'card', width: 768, height: 1024, position: 'centre' },
  { name: 'tablet', width: 1024, height: undefined, position: 'centre' },
  { name: 'desktop', width: 1920, height: undefined, position: 'centre' },
]
```

**Related Files:**
- Configuration: `apps/web/payload.config.ts:38`
- Media Collection: `apps/web/payload/collections/Media.ts:16-44`

---

### Planned Plugins

#### Cloudflare R2 Storage (Planned)

**Status:** Commented out in configuration
**Purpose:** Cloud object storage for media files

**Future Configuration:**
```typescript
// To be implemented
plugins: [
  // Cloudflare R2 storage plugin will be added here
]
```

**Benefits:**
- Unlimited scalable storage
- Global CDN distribution
- Cost-effective (no egress fees)
- S3-compatible API

**Related Files:**
- Configuration placeholder: `apps/web/payload.config.ts:39`
- Media collection ready: `apps/web/payload/collections/Media.ts:17`

---

## Collection Hooks

### Hook Types Overview

Payload CMS supports multiple hook types at both collection and field levels:

1. **Collection-level Hooks:**
   - `beforeChange` - Runs before create/update operations
   - `afterChange` - Runs after create/update operations (used for side effects)
   - `beforeDelete` - Runs before delete operations
   - `afterDelete` - Runs after delete operations (used for cleanup)
   - `beforeRead` - Runs before read operations
   - `afterRead` - Runs after read operations

2. **Field-level Hooks:**
   - `beforeValidate` - Runs before field validation
   - `afterRead` - Runs after field is read

---

### Collections with Algolia Auto-Indexing

Four collections automatically sync to Algolia search index for full-text search capabilities.

#### 1. Herbs Collection

**Hooks:**
```typescript
// apps/web/payload/collections/Herbs.ts
hooks: {
  beforeChange: [
    async ({ data, req, operation }) => {
      // Auto-generate slug if not provided
      if (operation === 'create' && !data.slug && data.title) {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      }
      return data
    },
  ],
  afterChange: [algoliaAfterChangeHook],
  afterDelete: [algoliaAfterDeleteHook],
}
```

**Field-level Hook:**
```typescript
// Slug field auto-generation
{
  name: 'slug',
  hooks: {
    beforeValidate: [
      ({ data, value }) => {
        if (!value && data?.title) {
          return data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        }
        return value
      },
    ],
  },
}
```

**Purpose:**
- Auto-generate URL-friendly slugs from titles
- Index searchable herb data in Algolia
- Remove deleted herbs from search index

**Algolia Index Fields:**
- `scientificName`, `commonNames`, `title`, `slug`
- `tcmCategory`, `tcmTaste`, `tcmTemperature`
- `therapeuticUses`, `activeConstituents`

**Related Files:**
- Collection: `apps/web/payload/collections/Herbs.ts:743-758`
- Hook implementation: `apps/web/payload/hooks/algolia-sync.ts`

---

#### 2. Formulas Collection

**Hooks:**
```typescript
// apps/web/payload/collections/Formulas.ts
hooks: {
  beforeChange: [
    async ({ data, req, operation }) => {
      // Auto-generate slug if not provided
      if (operation === 'create' && !data.slug && data.title) {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      }
      return data
    },
  ],
  afterChange: [algoliaAfterChangeHook],
  afterDelete: [algoliaAfterDeleteHook],
}
```

**Purpose:**
- Auto-generate slugs for formulas
- Index formula data (name, ingredients, uses)
- Maintain search index consistency

**Algolia Index Fields:**
- `title`, `slug`, `tradition`, `category`
- `ingredients` (with herb relationships)
- `useCases`, `relatedConditions`

**Related Files:**
- Collection: `apps/web/payload/collections/Formulas.ts:266-281`

---

#### 3. Conditions Collection

**Hooks:**
```typescript
// apps/web/payload/collections/Conditions.ts
hooks: {
  afterChange: [algoliaAfterChangeHook],
  afterDelete: [algoliaAfterDeleteHook],
}
```

**Purpose:**
- Index health condition data for search
- No slug auto-generation (handled manually)

**Note:** No `beforeChange` hook - slugs must be provided manually or through admin UI.

**Algolia Index Fields:**
- `title`, `slug`, `category`, `severity`
- `symptoms`, `tcmPattern`, `westernDiagnosis`

**Related Files:**
- Collection: `apps/web/payload/collections/Conditions.ts:161-164`

---

#### 4. Practitioners Collection

**Hooks:**
```typescript
// apps/web/payload/collections/Practitioners.ts
hooks: {
  beforeChange: [
    async ({ data }) => {
      // Auto-populate city/state from first address
      if (data.addresses && data.addresses.length > 0) {
        data.city = data.addresses[0].city
        data.state = data.addresses[0].state
      }
      return data
    },
  ],
  afterChange: [algoliaAfterChangeHook],
  afterDelete: [algoliaAfterDeleteHook],
}
```

**Purpose:**
- Auto-populate city/state fields for easier filtering/search
- Index practitioner directory for location-based search
- Support geo-search capabilities

**Algolia Index Fields:**
- `businessName`, `practitionerName`, `slug`
- `city`, `state`, `specialties`
- `latitude`, `longitude` (for geo-search)

**Related Files:**
- Collection: `apps/web/payload/collections/Practitioners.ts:293-306`

---

### Collections with Custom Hooks

#### 5. Reviews Collection

**Hooks:**
```typescript
// apps/web/payload/collections/Reviews.ts
hooks: {
  beforeChange: [
    async ({ data }) => {
      // Auto-populate reviewedEntityType based on relationship
      if (data.reviewedEntity && typeof data.reviewedEntity === 'object') {
        const entityTypeMap = {
          herbs: 'herb',
          formulas: 'formula',
          practitioners: 'practitioner',
          modalities: 'modality',
        }
        data.reviewedEntityType =
          entityTypeMap[data.reviewedEntity.relationTo as keyof typeof entityTypeMap]
      }
      return data
    },
  ],
}
```

**Purpose:**
- Auto-populate `reviewedEntityType` field based on polymorphic relationship
- Simplifies queries and filtering by entity type
- Ensures data consistency

**Why This is Needed:**
The `reviewedEntity` field is a polymorphic relationship that can point to different collections. The `reviewedEntityType` field stores the collection name for easier filtering.

**Related Files:**
- Collection: `apps/web/payload/collections/Reviews.ts:101-117`

---

### Collections WITHOUT Hooks

The following collections have no hooks, by design:

#### 6. Users Collection
- **No hooks** - Authentication handled by Better Auth integration
- User management through Payload admin panel
- Role-based access control

#### 7. Media Collection
- **No hooks** - File uploads handled by Sharp plugin
- Image processing automatic via Sharp configuration
- Metadata stored with uploads

#### 8. Symptoms Collection
- **No hooks** - Simple data collection
- Used by AI symptom checker
- No auto-generation needed

#### 9. Modalities Collection
- **No hooks** - Healing modalities directory
- Manual data entry preferred

#### 10. AuditLogs Collection
- **No hooks** - Immutable audit trail
- System-level creation only
- Updates and deletes disabled via access control

#### 11. ImportLogs Collection
- **No hooks** - System logs for import jobs
- Created programmatically by cron jobs
- Admin-only access

#### 12. GrokInsights Collection
- **No hooks** - AI-generated insights storage
- Contains PHI data (user-specific)
- User can only read their own records

#### 13. ValidationReports Collection
- **No hooks** - Data quality validation logs
- System-generated reports
- Admin-only access

---

## Access Control Patterns

Verscienta Health uses a comprehensive role-based access control (RBAC) system with 15 reusable access control functions.

### Available Roles

```typescript
// Defined in Users collection
roles = ['admin', 'editor', 'practitioner', 'herbalist', 'user']
```

**Role Hierarchy:**
1. **admin** - Full system access, user management, all operations
2. **editor** - Content creation/editing, no user management
3. **practitioner** - Verified practitioners, directory listings
4. **herbalist** - Herbal content creation, formula management
5. **user** - Standard users, read-only content access

---

### Access Control Functions

All access control functions are centralized in `apps/web/payload/access/index.ts`.

#### Public Access

```typescript
// Anyone can read (including unauthenticated users)
export const isPublic: Access = () => true
```

**Used By:** Herbs, Formulas, Conditions, Practitioners, Media, Reviews, Users (read-only)

---

#### Authentication Required

```typescript
// Must be logged in (any role)
export const isAuthenticated: Access = ({ req: { user } }) => Boolean(user)
```

**Used By:** Herbs, Formulas, Conditions, Practitioners, Media (create/update)

---

#### Role-Based Access

```typescript
// Admin only
export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

// Admin or Editor
export const isAdminOrEditor: Access = ({ req: { user } }) =>
  user?.role === 'admin' || user?.role === 'editor'

// Admin, Editor, or Practitioner
export const isAdminOrEditorOrPractitioner: Access = ({ req: { user } }) =>
  user?.role === 'admin' ||
  user?.role === 'editor' ||
  user?.role === 'practitioner'
```

**Used By:**
- `isAdmin`: Delete operations, user management, audit logs
- `isAdminOrEditor`: Content moderation, publishing
- `isAdminOrEditorOrPractitioner`: Practitioner directory management

---

#### Ownership-Based Access

```typescript
// Admin or owner of the document
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  // Admins can access all
  if (user?.role === 'admin') return true

  // Users can only access their own records
  if (user?.id) {
    return {
      id: {
        equals: user.id,
      },
    }
  }

  return false
}
```

**Used By:** Users (update), user profile management

**How it Works:**
- Returns `true` for admins (access all records)
- Returns a query filter for regular users (only their records)
- Returns `false` for unauthenticated users

---

#### Review Ownership

```typescript
// Users can only edit their own reviews
export const isOwnReview: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true

  return {
    author: {
      equals: user.id,
    },
  }
}
```

**Used By:** Reviews (update)

**How it Works:**
- Admins can edit all reviews
- Users can only edit reviews where they are the author

---

#### HIPAA-Compliant PHI Access

```typescript
// Protected Health Information (PHI) access control
export const isPHIAuthorized: Access = ({ req: { user } }) => {
  // Admins can access all PHI for system maintenance
  if (user?.role === 'admin') return true

  // Practitioners can access PHI for their patients
  if (user?.role === 'practitioner') {
    return {
      practitionerId: {
        equals: user.id,
      },
    }
  }

  // Users can only access their own PHI
  if (user?.id) {
    return {
      userId: {
        equals: user.id,
      },
    }
  }

  return false
}
```

**Used By:** GrokInsights (AI symptom checker results)

**HIPAA Compliance Features:**
- User data isolated by userId
- Practitioner access scoped to their patients
- Admin access for system maintenance
- All access logged in AuditLogs collection

---

### Access Control by Collection

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| Herbs | Public | Authenticated | Authenticated | Admin |
| Formulas | Public | Authenticated | Authenticated | Admin |
| Conditions | Public | Authenticated | Authenticated | Admin |
| Practitioners | Public | Authenticated | Authenticated | Admin |
| Media | Public | Authenticated | Authenticated | Admin |
| Reviews | Public | Authenticated | Own Review | Admin |
| Users | Public | First User / Admin | Admin or Self | Admin |
| Symptoms | Public | Authenticated | Authenticated | Admin |
| Modalities | Public | Authenticated | Authenticated | Admin |
| GrokInsights | Admin or Self | Authenticated | Admin | Admin |
| AuditLogs | Admin | System | Never | Never |
| ImportLogs | Admin | System | Admin | Admin |
| ValidationReports | Admin | System | Admin | Admin |

---

### Field-Level Access Control

Some collections implement field-level access control for sensitive fields:

```typescript
// Example: Users collection - role field
{
  name: 'role',
  type: 'select',
  access: {
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
  },
}
```

**Purpose:** Only admins can set or change user roles.

**Other Field-Level Controls:**
- `betterAuthId` in Users: Read-only (system managed)
- `averageRating` in Herbs/Practitioners: Read-only (calculated)
- `reviewCount`: Read-only (calculated)
- `city`/`state` in Practitioners: Read-only (auto-populated)

---

## Plugin Integration Guide

### Adding a New Plugin

#### 1. Install the Plugin

```bash
pnpm add @payloadcms/plugin-name
```

#### 2. Import and Configure

```typescript
// apps/web/payload.config.ts
import { pluginName } from '@payloadcms/plugin-name'

export default buildConfig({
  // ... other config
  plugins: [
    pluginName({
      // Plugin configuration
    }),
  ],
})
```

#### 3. Update TypeScript Types (if needed)

```bash
pnpm payload generate:types
```

---

### Example: Adding Cloudflare R2 Storage

**Step 1: Install Plugin**
```bash
pnpm add @payloadcms/plugin-cloud-storage
pnpm add @aws-sdk/client-s3
```

**Step 2: Configure Environment Variables**
```bash
# .env.local
CLOUDFLARE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET=verscienta-media
CLOUDFLARE_R2_REGION=auto
```

**Step 3: Update Payload Config**
```typescript
// apps/web/payload.config.ts
import { cloudStorage } from '@payloadcms/plugin-cloud-storage'
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'

export default buildConfig({
  plugins: [
    cloudStorage({
      collections: {
        media: {
          adapter: s3Adapter({
            config: {
              endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
              region: process.env.CLOUDFLARE_R2_REGION || 'auto',
              credentials: {
                accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
                secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
              },
            },
            bucket: process.env.CLOUDFLARE_R2_BUCKET!,
          }),
        },
      },
    }),
  ],
})
```

**Step 4: Test Upload**
1. Start development server: `pnpm dev`
2. Navigate to `/admin/collections/media`
3. Upload a test image
4. Verify image appears in Cloudflare R2 bucket

---

### Example: Adding Search Plugin

**Step 1: Install Plugin**
```bash
pnpm add @payloadcms/plugin-search
```

**Step 2: Configure**
```typescript
// apps/web/payload.config.ts
import { searchPlugin } from '@payloadcms/plugin-search'

export default buildConfig({
  plugins: [
    searchPlugin({
      collections: ['herbs', 'formulas', 'conditions'],
      searchOverrides: {
        fields: [
          {
            name: 'search',
            type: 'text',
            admin: {
              hidden: true,
            },
          },
        ],
      },
    }),
  ],
})
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: Algolia Sync Failures

**Symptoms:**
- Collections not appearing in Algolia search
- Error logs showing Algolia API failures
- Search results out of date

**Diagnosis:**
```bash
# Check import logs
pnpm tsx apps/web/scripts/db/check-import-logs.ts

# Check Algolia configuration
echo $ALGOLIA_APP_ID
echo $ALGOLIA_ADMIN_API_KEY
```

**Solutions:**

1. **Missing Environment Variables:**
```bash
# Add to .env.local
ALGOLIA_APP_ID=your-app-id
ALGOLIA_ADMIN_API_KEY=your-admin-key
ALGOLIA_SEARCH_API_KEY=your-search-key
```

2. **Trigger Manual Sync:**
```bash
# Run Algolia sync cron job manually
pnpm tsx apps/web/lib/cron/sync-algolia.ts
```

3. **Check Hook Execution:**
```typescript
// Add debug logging to algolia-sync.ts
console.log('[Algolia] Processing document:', doc.id, doc.title)
```

**Prevention:**
- Enable Algolia sync cron job: Add `algolia` to `CRON_JOBS` environment variable
- Monitor import logs in admin panel
- Set up error alerting

---

#### Issue 2: Migration Conflicts in Production

**Symptoms:**
- Database schema out of sync with Payload config
- Errors on deployment: "Column does not exist"
- Migration files accumulating

**Diagnosis:**
```bash
# Check migration status
pnpm db:migrate:status

# Compare schema
pnpm tsx apps/web/scripts/db/check-schema.ts
```

**Solutions:**

1. **Generate Migration:**
```bash
# Create migration file
pnpm db:migrate

# Review generated SQL
cat apps/web/payload/migrations/YYYYMMDD_HHMMSS_migration_name.ts
```

2. **Apply Migration:**
```bash
# Backup database first!
pnpm db:backup

# Apply migration
pnpm db:migrate:up
```

3. **Rollback if Needed:**
```bash
# Rollback last migration
pnpm db:migrate:down

# Restore from backup if critical
pnpm db:restore:latest
```

**Prevention:**
- NEVER use `push: true` in production
- Always test migrations in staging first
- Keep migrations in version control
- Create backups before migrations

---

#### Issue 3: Payload Admin Panel Not Loading

**Symptoms:**
- White screen on `/admin`
- Build errors in development
- TypeScript errors

**Diagnosis:**
```bash
# Check build
pnpm build

# Check TypeScript
pnpm type-check

# Check logs
pnpm dev
```

**Solutions:**

1. **Clear Next.js Cache:**
```bash
# Windows
rd /s /q .next
pnpm dev

# macOS/Linux
rm -rf .next
pnpm dev
```

2. **Regenerate Payload Types:**
```bash
pnpm payload generate:types
```

3. **Check Environment Variables:**
```bash
# Verify DATABASE_URL is set
echo %DATABASE_URL%

# Verify PAYLOAD_SECRET is set
echo %PAYLOAD_SECRET%
```

4. **Check Dependencies:**
```bash
# Reinstall dependencies
pnpm install

# Check for version conflicts
pnpm list payload
```

**Prevention:**
- Keep Payload dependencies in sync (all 3.62.1)
- Use `pnpm` consistently (not npm or yarn)
- Don't modify auto-generated files

---

#### Issue 4: Image Upload Failures

**Symptoms:**
- "Failed to upload" errors in admin
- Images not appearing in media library
- Sharp processing errors

**Diagnosis:**
```bash
# Check Sharp installation
pnpm list sharp

# Check upload directory permissions
ls -la apps/web/public/media

# Check disk space
df -h
```

**Solutions:**

1. **Reinstall Sharp:**
```bash
pnpm remove sharp
pnpm add sharp
```

2. **Create Upload Directory:**
```bash
# Create media directory
mkdir -p apps/web/public/media

# Set permissions (macOS/Linux)
chmod 755 apps/web/public/media
```

3. **Check File Size Limits:**
```typescript
// Increase in payload.config.ts if needed
upload: {
  limits: {
    fileSize: 10000000, // 10MB
  },
}
```

4. **Switch to Cloud Storage:**
See [Plugin Integration Guide](#plugin-integration-guide) for Cloudflare R2 setup.

**Prevention:**
- Use Cloudflare R2 in production (unlimited storage)
- Set appropriate file size limits
- Monitor disk space on server

---

#### Issue 5: Hook Not Executing

**Symptoms:**
- Slug not auto-generating
- Algolia index not updating
- Data transformations not happening

**Diagnosis:**
```bash
# Add debug logging to hook
console.log('[Hook] beforeChange executing:', data)
```

**Solutions:**

1. **Check Hook Registration:**
```typescript
// Verify hook is in collection config
hooks: {
  beforeChange: [yourHook],  // ✅ Array format
  // NOT: beforeChange: yourHook,  // ❌ Wrong
}
```

2. **Check Hook Return Value:**
```typescript
// Hooks MUST return the data
beforeChange: [
  async ({ data }) => {
    // ... modifications
    return data  // ✅ IMPORTANT!
  },
]
```

3. **Check Hook Order:**
```typescript
// Hooks execute in array order
hooks: {
  beforeChange: [
    firstHook,   // Runs first
    secondHook,  // Runs second (receives result of first)
  ],
}
```

4. **Check Async/Await:**
```typescript
// Use async/await for async operations
beforeChange: [
  async ({ data }) => {
    await someAsyncOperation()
    return data
  },
]
```

**Prevention:**
- Always return modified data from hooks
- Test hooks in isolation first
- Use TypeScript for type safety
- Add debug logging during development

---

#### Issue 6: Access Control Not Working

**Symptoms:**
- Users seeing data they shouldn't
- "Access denied" for authorized users
- Role changes not taking effect

**Diagnosis:**
```bash
# Check user role in database
pnpm tsx apps/web/scripts/db/check-user-role.ts <user-email>

# Test access control function
console.log(isAdmin({ req: { user: testUser } }))
```

**Solutions:**

1. **Clear Session:**
```bash
# Have user log out and back in
# Or clear sessions manually
pnpm tsx apps/web/lib/cron/cleanup-sessions.ts
```

2. **Check Access Function:**
```typescript
// Verify function logic
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  console.log('User:', user)  // Debug
  console.log('User ID:', user?.id)
  console.log('User Role:', user?.role)

  if (user?.role === 'admin') return true
  if (user?.id) {
    return {
      id: {
        equals: user.id,
      },
    }
  }
  return false
}
```

3. **Check Field-Level Access:**
```typescript
// Some fields have separate access control
{
  name: 'role',
  access: {
    read: () => true,
    create: isAdmin,  // Only admins can set role
    update: isAdmin,
  },
}
```

**Prevention:**
- Test access control with multiple user roles
- Use query-based access for ownership checks
- Log access control decisions in development
- Review access patterns regularly

---

### Getting Help

**Internal Resources:**
- Payload Documentation: `apps/web/payload/README.md` (create if needed)
- Database Schema: `pnpm db:migrate:status`
- API Documentation: `http://localhost:3000/api-docs`

**External Resources:**
- Payload Docs: https://payloadcms.com/docs
- Payload Discord: https://discord.com/invite/payload
- GitHub Issues: https://github.com/payloadcms/payload/issues

**Debugging Tools:**
```bash
# Enable debug mode
DEBUG=payload:* pnpm dev

# Check Payload version
pnpm list payload

# Generate fresh types
pnpm payload generate:types

# Database console
psql $DATABASE_URL
```

---

## Best Practices

### Hook Development

1. **Always return data:**
```typescript
beforeChange: [
  async ({ data }) => {
    // ... modifications
    return data  // ✅ Required!
  },
]
```

2. **Use async/await for async operations:**
```typescript
beforeChange: [
  async ({ data }) => {
    await externalAPI.call()
    return data
  },
]
```

3. **Keep hooks focused:**
```typescript
// ✅ Good: One responsibility
beforeChange: [slugGenerationHook]

// ❌ Bad: Multiple responsibilities
beforeChange: [slugAndAlgoliaAndEmailHook]
```

4. **Use afterChange for side effects:**
```typescript
// ✅ Good: Algolia sync in afterChange
afterChange: [algoliaAfterChangeHook]

// ❌ Bad: Algolia sync in beforeChange (blocking)
beforeChange: [algoliaSync]  // Don't do this
```

---

### Access Control

1. **Use query-based access for ownership:**
```typescript
// ✅ Good: Returns query
return {
  userId: {
    equals: user.id,
  },
}

// ❌ Bad: Returns boolean (can't filter)
return user.id === doc.userId
```

2. **Admin bypass pattern:**
```typescript
// ✅ Consistent pattern
if (user?.role === 'admin') return true
// ... other checks
```

3. **Test with all roles:**
- Create test users for each role
- Test create, read, update, delete operations
- Verify query-based access returns correct results

---

### Plugin Integration

1. **Environment variable validation:**
```typescript
if (!process.env.REQUIRED_VAR) {
  throw new Error('REQUIRED_VAR must be set')
}
```

2. **Graceful degradation:**
```typescript
// If optional plugin fails, continue anyway
try {
  await optionalFeature()
} catch (error) {
  console.warn('Optional feature unavailable:', error)
}
```

3. **Keep plugins updated:**
```bash
# Check for updates
pnpm outdated

# Update Payload ecosystem
pnpm update @payloadcms/*
```

---

## Changelog

**2025-01-20:** Initial documentation created
- Documented all 13 collections
- Documented all hooks and access patterns
- Added plugin integration guide
- Added comprehensive troubleshooting guide

---

**Document Version:** 1.0.0
**Maintainer:** Verscienta Health Development Team
**Last Review:** 2025-01-20
