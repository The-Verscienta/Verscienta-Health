# Strapi to PayloadCMS Migration Guide

This guide covers migrating all content from Strapi CMS to PayloadCMS 3.0.

## Prerequisites

1. **PostgreSQL Running**
   ```bash
   docker compose up postgres -d
   ```

2. **Strapi CMS Accessible**
   - Ensure Strapi is running at `http://localhost:1337` (or set `STRAPI_URL`)
   - Create a Strapi API token with read access to all collections

3. **Environment Variables**
   ```bash
   # In apps/web/.env.local
   STRAPI_URL=http://localhost:1337
   STRAPI_API_TOKEN=your_strapi_api_token_here
   DATABASE_URL=postgresql://verscienta_user:changeme123@localhost:5432/verscienta_health
   PAYLOAD_SECRET=your-secret-key
   ```

## Migration Process

### Step 1: Dry Run (Recommended)

Test the migration without making changes:

```bash
cd apps/web
pnpm tsx scripts/migrate-strapi-to-payload.ts --dry-run
```

This will:
- ✅ Connect to both Strapi and Payload
- ✅ Fetch all records from Strapi
- ✅ Transform data to Payload format
- ✅ Show what would be migrated
- ❌ **Not create any records** in Payload

### Step 2: Migrate Specific Collection (Test)

Test with a single collection first:

```bash
# Migrate only herbs
pnpm tsx scripts/migrate-strapi-to-payload.ts --collection=herb

# Migrate only practitioners
pnpm tsx scripts/migrate-strapi-to-payload.ts --collection=practitioner
```

### Step 3: Full Migration

Migrate all collections:

```bash
pnpm tsx scripts/migrate-strapi-to-payload.ts
```

### Step 4: Verify Migration

Check the Payload admin panel:
- Navigate to `http://localhost:3000/admin`
- Login with your credentials
- Verify all collections have data

## Migration Order

Collections are migrated in this order (to handle relationships):

1. **Media** (`upload` → `media`) - Upload files first
2. **Users** (`user` → `users`) - User accounts
3. **Herbs** (`herb` → `herbs`) - Herb database
4. **Practitioners** (`practitioner` → `practitioners`) - Practitioner directory
5. **Formulas** (`formula` → `formulas`) - Herbal formulas
6. **Conditions** (`condition` → `conditions`) - Health conditions
7. **Symptoms** (`symptom` → `symptoms`) - Symptoms database
8. **Modalities** (`modality` → `modalities`) - Healing modalities
9. **Reviews** (`review` → `reviews`) - User reviews

## Data Transformations

### Herbs (`herb` → `herbs`)
- Maps Strapi `name` → Payload `title`
- Transforms `scientificName`, `family`, `genus` to `botanicalInfo` group
- Converts `tcmTaste`, `tcmTemperature` to `tcmProperties` group
- Maps `featuredImage` relation to Payload media ID
- Converts `publishedAt` to `_status: 'published'`

### Practitioners (`practitioner` → `practitioners`)
- Maps `businessName`, `practitionerName`
- Transforms addresses array with geolocation
- Converts certifications with dates
- Maps specialties and languages
- Links to Better Auth users via `user` field

### Formulas (`formula` → `formulas`)
- Maps ingredients with herb relationships
- Converts preparation methods
- Transforms dosage instructions
- Links related herbs (requires ID mapping)

### Reviews (`review` → `reviews`)
- Links to user via Better Auth
- Polymorphic relationship to reviewed entity (herb/formula/practitioner/modality)
- Maps moderation status
- Converts helpful votes

## Options

### Batch Size

Control how many records are fetched per page:

```bash
BATCH_SIZE=50 pnpm tsx scripts/migrate-strapi-to-payload.ts
```

Default: 100 records per batch

### Specific Collection

Migrate only one collection:

```bash
pnpm tsx scripts/migrate-strapi-to-payload.ts --collection=herb
```

Available collections:
- `herb` → `herbs`
- `formula` → `formulas`
- `condition` → `conditions`
- `symptom` → `symptoms`
- `modality` → `modalities`
- `practitioner` → `practitioners`
- `review` → `reviews`
- `user` → `users`
- `upload` → `media`

## Troubleshooting

### "Failed to fetch collection"
- Verify Strapi is running
- Check `STRAPI_URL` environment variable
- Ensure Strapi API token has correct permissions

### "Database connection failed"
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check database credentials

### "Payload not initialized"
- Ensure `payload.config.ts` is valid
- Check `PAYLOAD_SECRET` is set
- Verify TypeScript compilation works

### Relationship Mapping Issues

Some fields require manual ID mapping after migration:
- **Herb relationships** in formulas (ingredients)
- **User relationships** in reviews and practitioners
- **Media relationships** for images

You may need to run a second pass to update these relationships.

## Post-Migration

### 1. Verify Algolia Indexing

Check that all published records were indexed to Algolia:

```bash
# Check Algolia dashboard or run:
curl -X GET \
  "https://YOUR_APP_ID-dsn.algolia.net/1/indexes/herbs_development" \
  -H "X-Algolia-API-Key: YOUR_ADMIN_API_KEY" \
  -H "X-Algolia-Application-Id: YOUR_APP_ID"
```

### 2. Test Payload Admin

- Browse all collections
- Create a test record
- Update existing records
- Delete test records
- Verify draft/published workflow

### 3. Update Frontend

After migration, update your Next.js app to use Payload Local API:

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'

// Server Component
export default async function HerbsPage() {
  const payload = await getPayload({ config })

  const { docs: herbs } = await payload.find({
    collection: 'herbs',
    where: {
      _status: { equals: 'published' }
    },
    limit: 10
  })

  return <div>{/* Render herbs */}</div>
}
```

### 4. Disable Strapi

Once migration is verified:

```bash
# Stop Strapi container
docker compose stop cms

# Or remove entirely
docker compose rm cms
```

## Rollback

If you need to rollback the migration:

1. **Truncate Payload tables** in PostgreSQL:
   ```sql
   TRUNCATE TABLE herbs CASCADE;
   TRUNCATE TABLE practitioners CASCADE;
   -- etc for all tables
   ```

2. **Re-enable Strapi**:
   ```bash
   docker compose up cms -d
   ```

3. **Clear Algolia indices**:
   Use Algolia dashboard to clear development indices

## Performance Tips

- Use `--dry-run` first to estimate time
- Migrate during low-traffic periods
- Monitor database connection pool
- Watch for memory usage with large collections
- Consider migrating in batches by collection

## Support

If you encounter issues:

1. Check migration logs for specific errors
2. Review the `errors` array in the migration summary
3. Use `--dry-run` to debug transformation logic
4. Test with `--collection=herb` for a small dataset first
