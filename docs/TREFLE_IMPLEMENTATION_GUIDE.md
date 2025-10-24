# Trefle Integration Implementation Guide

**Created**: 2025-10-20
**Status**: Step-by-Step Implementation Guide
**Trefle API**: v1
**Related Documentation**: [TREFLE_INTEGRATION.md](./TREFLE_INTEGRATION.md)

---

## Overview

This guide provides complete implementation instructions for integrating the Trefle botanical database API into Verscienta Health's Strapi CMS.

**What You'll Implement**:
1. ✅ TrefleClient class - API wrapper (COMPLETED)
2. 🔄 Sync cron job - Weekly herb enrichment (IN PROGRESS)
3. 🔄 Import cron job - Progressive plant database import (IN PROGRESS)
4. 🔄 Cron scheduler - Job orchestration (IN PROGRESS)
5. 🔄 Environment configuration (IN PROGRESS)

---

## Prerequisites

### 1. Get Trefle API Key

1. Visit [https://trefle.io/](https://trefle.io/)
2. Create a free account
3. Navigate to your profile → API Keys
4. Generate a new API key

**Rate Limits (Free Tier)**:
- 120 requests per minute
- 5,000 requests per day

### 2. Verify Strapi Collections

Ensure these collections exist in your Strapi CMS:
- `api::herb.herb` - Herb collection
- `api::import-log.import-log` - Import logging
- `api::validation-report.validation-report` - Validation reports

### 3. Install Dependencies

Axios is required for HTTP requests:

```bash
cd apps/strapi-cms
pnpm add axios
```

---

## File Structure

```
apps/strapi-cms/
├── src/
│   ├── lib/
│   │   └── trefle.ts              # ✅ COMPLETED
│   ├── cron/
│   │   ├── index.ts               # 🔄 TO CREATE
│   │   └── jobs/
│   │       ├── syncTrefleData.ts  # 🔄 TO CREATE
│   │       └── importTrefleData.ts # 🔄 TO CREATE
│   └── index.ts                   # 🔄 TO MODIFY
├── config/
│   └── cron-tasks.ts              # 🔄 TO CREATE
└── .env.example                   # 🔄 TO MODIFY
```

---

## Step 1: TrefleClient Class ✅

**Status**: COMPLETED

**File**: `apps/strapi-cms/src/lib/trefle.ts` (473 lines)

**Features Implemented**:
- ✅ Search by scientific name
- ✅ Get plant by ID or slug
- ✅ Find best matching plant
- ✅ Enrich herb data with botanical information
- ✅ Validate scientific names
- ✅ Progressive import support (get plants by page)
- ✅ Rate limiting (500ms delay between requests)
- ✅ Auto-retry on 429 (rate limit exceeded)
- ✅ Singleton pattern for reuse

**Usage Example**:
```typescript
import { getTrefleClient } from '../lib/trefle'

const client = getTrefleClient()
if (client) {
  const enrichedData = await client.enrichHerbData({
    scientificName: 'Lavandula angustifolia',
    name: 'Lavender'
  })
}
```

---

## Step 2: Sync Cron Job (Weekly Enrichment)

**Purpose**: Enrich existing herbs with botanical data from Trefle every week

### Implementation

**File**: `apps/strapi-cms/src/cron/jobs/syncTrefleData.ts`

<details>
<summary>Full Code (Click to expand)</summary>

```typescript
/**
 * Sync Trefle Botanical Data Cron Job
 *
 * Enriches existing herbs with data from the Trefle botanical database.
 * Runs weekly to update herbs with scientific information.
 */

import type { Strapi } from '@strapi/strapi'
import { getTrefleClient } from '../../lib/trefle'

const HERBS_PER_RUN = 100 // Process 100 herbs per run

/**
 * Sync single herb with Trefle data
 */
export async function syncSingleHerbWithTrefle(
  strapi: Strapi,
  herbId: number
): Promise<{ success: boolean; message: string; enrichedData?: any }> {
  try {
    const client = getTrefleClient()
    if (!client) {
      return { success: false, message: 'Trefle client not initialized' }
    }

    // Get herb data
    const herb = await strapi.entityService.findOne('api::herb.herb', herbId, {
      fields: ['name', 'scientificName', 'botanicalData'],
    })

    if (!herb || !herb.scientificName) {
      return { success: false, message: 'Herb not found or missing scientific name' }
    }

    // Skip if recently synced (within 30 days)
    const lastSynced = herb.botanicalData?.lastSyncedAt
    if (lastSynced) {
      const daysSinceSync = Math.floor(
        (Date.now() - new Date(lastSynced).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceSync < 30) {
        return {
          success: true,
          message: `Skipped: Last synced ${daysSinceSync} days ago`,
        }
      }
    }

    console.log(`🔄 Syncing herb: ${herb.name} (${herb.scientificName})`)

    // Enrich with Trefle data
    const enrichedData = await client.enrichHerbData({
      scientificName: herb.scientificName,
      name: herb.name,
    })

    if (!enrichedData) {
      // Log validation report for manual review
      await strapi.entityService.create('api::validation-report.validation-report', {
        data: {
          type: 'Trefle Name Mismatch',
          collectionType: 'Herb',
          documentId: herbId,
          field: 'scientificName',
          currentValue: herb.scientificName,
          suggestedValue: null,
          severity: 'warning',
          message: `No Trefle match found for "${herb.scientificName}"`,
          publishedAt: new Date(),
        },
      })

      return { success: false, message: 'No Trefle match found' }
    }

    // Update herb with enriched data
    const updatedHerb = await strapi.entityService.update('api::herb.herb', herbId, {
      data: {
        scientificName: enrichedData.scientificName, // Use validated name
        family: enrichedData.family || herb.family,
        synonyms: enrichedData.synonyms,
        botanicalData: {
          trefleId: enrichedData.trefleId,
          trefleSlug: enrichedData.trefleSlug,
          lastSyncedAt: new Date().toISOString(),
          trefleData: {
            author: enrichedData.author,
            synonyms: enrichedData.synonyms,
            distributions: enrichedData.distributions,
            edible: enrichedData.edible,
            ediblePart: enrichedData.ediblePart,
            toxicity: enrichedData.toxicity,
            growthHabit: enrichedData.growthHabit,
            averageHeight: enrichedData.averageHeight,
            sources: enrichedData.sources,
          },
        },
        // Add Trefle image if herb has no images
        ...(enrichedData.imageUrl &&
          (!herb.images || herb.images.length === 0) && {
            images: [
              {
                url: enrichedData.imageUrl,
                caption: `${herb.name} - from Trefle botanical database`,
                type: 'photograph',
                source: 'Trefle',
              },
            ],
          }),
        // Add distribution to habitat field
        ...(enrichedData.distributions.native.length > 0 && {
          habitat: `Native to: ${enrichedData.distributions.native.slice(0, 5).join(', ')}`,
        }),
        // Add toxicity warning
        ...(enrichedData.toxicity &&
          enrichedData.toxicity !== 'none' && {
            safetyInfo: {
              warnings: [`Trefle toxicity: ${enrichedData.toxicity}`],
            },
          }),
      },
    })

    console.log(`   ✅ Enriched: ${herb.name}`)

    return {
      success: true,
      message: 'Herb enriched successfully',
      enrichedData,
    }
  } catch (error) {
    console.error(`❌ Failed to sync herb ${herbId}:`, error)
    return { success: false, message: error.message }
  }
}

/**
 * Sync Trefle Botanical Data Cron Job
 */
export default async function syncTrefleData({ strapi }: { strapi: Strapi }) {
  const startTime = Date.now()

  try {
    console.log('🌿 Starting Trefle botanical data sync...')

    const client = getTrefleClient()
    if (!client) {
      console.log('⚠️ Trefle client not configured. Skipping sync.')
      return
    }

    // Find herbs that need syncing
    // Priority: Never synced OR last synced > 30 days ago
    const herbs = await strapi.db.query('api::herb.herb').findMany({
      where: {
        $or: [
          { botanicalData: { trefleId: null } }, // Never synced
          {
            botanicalData: {
              lastSyncedAt: {
                $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              },
            },
          }, // Synced > 30 days ago
        ],
      },
      limit: HERBS_PER_RUN,
      orderBy: { createdAt: 'asc' },
    })

    if (herbs.length === 0) {
      console.log('✅ No herbs need syncing')
      return
    }

    console.log(`📋 Found ${herbs.length} herbs to sync`)

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const herb of herbs) {
      const result = await syncSingleHerbWithTrefle(strapi, herb.id)

      if (result.success) {
        if (result.message.startsWith('Skipped')) {
          skipCount++
        } else {
          successCount++
        }
      } else {
        errorCount++
      }

      // Small delay between herbs
      await new Promise((resolve) => setTimeout(resolve, 600))
    }

    const duration = Math.round((Date.now() - startTime) / 1000)

    console.log(`
✅ Trefle sync complete
   Duration: ${duration}s
   Enriched: ${successCount}
   Skipped: ${skipCount}
   Errors: ${errorCount}
    `)

    // Log import summary
    await strapi.entityService.create('api::import-log.import-log', {
      data: {
        type: 'Trefle Sync',
        source: 'Trefle API',
        status: 'completed',
        recordsProcessed: successCount,
        recordsCreated: successCount,
        recordsUpdated: 0,
        recordsFailed: errorCount,
        duration,
        summary: {
          successCount,
          skipCount,
          errorCount,
        },
        publishedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('❌ Trefle sync failed:', error)

    // Log error
    await strapi.entityService.create('api::import-log.import-log', {
      data: {
        type: 'Trefle Sync Error',
        source: 'Trefle API',
        status: 'failed',
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
        errors: [error.message],
        publishedAt: new Date(),
      },
    })
  }
}
```

</details>

**Key Features**:
- Processes 100 herbs per run
- Prioritizes herbs never synced or synced > 30 days ago
- Validates scientific names against Trefle
- Creates validation reports for mismatches
- Adds botanical images if herb has none
- Updates habitat and safety information
- Logs all operations to import-logs

---

## Step 3: Import Cron Job (Progressive Database Import)

**Purpose**: Progressively import all 1M+ plants from Trefle as draft herbs

**⚠️ Warning**: This will create hundreds of thousands of draft herb entries!

### Implementation

**File**: `apps/strapi-cms/src/cron/jobs/importTrefleData.ts`

<details>
<summary>Full Code (Click to expand - 350+ lines)</summary>

```typescript
/**
 * Import Trefle Plant Database Cron Job
 *
 * Progressively imports all plants from Trefle's 1M+ plant database.
 * Creates herbs as drafts for manual review.
 *
 * WARNING: This will create hundreds of thousands of draft herbs!
 * Only enable if you want to import the entire botanical database.
 */

import type { Strapi } from '@strapi/strapi'
import { getTrefleClient } from '../../lib/trefle'

const PAGES_PER_RUN = 5 // Fetch 5 pages per minute
const PLANTS_PER_PAGE = 20 // Trefle API limit

/**
 * Check if plant is a good herb candidate
 */
function isHerbCandidate(plant: any): boolean {
  // Prioritize edible or vegetable plants
  if (plant.vegetable || plant.edible) return true

  // Include if it has a common name (suggests human use)
  if (plant.common_name) return true

  // Filter by growth habit (herbs, graminoids, subshrubs, forbs)
  const goodHabits = ['herb', 'graminoid', 'subshrub', 'forb']
  if (plant.growth_habit && goodHabits.includes(plant.growth_habit.toLowerCase())) {
    return true
  }

  // Exclude trees
  if (plant.growth_habit && plant.growth_habit.toLowerCase() === 'tree') {
    return false
  }

  // Include everything else as draft for review
  return true
}

/**
 * Get import progress from global state
 */
export async function getTrefleImportProgress(strapi: Strapi) {
  try {
    const importState = await strapi.db.query('api::trefle-import-state.trefle-import-state').findOne({
      where: {},
    })

    return {
      currentPage: importState?.currentPage || 1,
      totalHerbsImported: importState?.totalHerbsImported || 0,
      lastRunAt: importState?.lastRunAt || null,
      isComplete: importState?.isComplete || false,
      estimatedPlantsRemaining: Math.max(0, 1000000 - (importState?.totalHerbsImported || 0)),
    }
  } catch (error) {
    console.error('Failed to get import progress:', error)
    return {
      currentPage: 1,
      totalHerbsImported: 0,
      lastRunAt: null,
      isComplete: false,
      estimatedPlantsRemaining: 1000000,
    }
  }
}

/**
 * Update import progress in global state
 */
async function updateImportProgress(
  strapi: Strapi,
  updates: {
    currentPage?: number
    totalHerbsImported?: number
    isComplete?: boolean
  }
) {
  try {
    const existingState = await strapi.db.query('api::trefle-import-state.trefle-import-state').findOne({
      where: {},
    })

    if (existingState) {
      await strapi.db.query('api::trefle-import-state.trefle-import-state').update({
        where: { id: existingState.id },
        data: {
          ...updates,
          lastRunAt: new Date().toISOString(),
        },
      })
    } else {
      await strapi.db.query('api::trefle-import-state.trefle-import-state').create({
        data: {
          currentPage: updates.currentPage || 1,
          totalHerbsImported: updates.totalHerbsImported || 0,
          lastRunAt: new Date().toISOString(),
          isComplete: updates.isComplete || false,
        },
      })
    }
  } catch (error) {
    console.error('Failed to update import progress:', error)
  }
}

/**
 * Reset import to start from beginning
 */
export async function resetTrefleImport(strapi: Strapi) {
  await updateImportProgress(strapi, {
    currentPage: 1,
    totalHerbsImported: 0,
    isComplete: false,
  })
  console.log('🔄 Trefle import reset to page 1')
}

/**
 * Import Trefle Plant Database Cron Job
 */
export default async function importTrefleData({ strapi }: { strapi: Strapi }) {
  const startTime = Date.now()

  try {
    console.log('🌿 Starting Trefle progressive import...')

    const client = getTrefleClient()
    if (!client) {
      console.log('⚠️ Trefle client not configured. Skipping import.')
      return
    }

    // Check if import is enabled
    if (process.env.ENABLE_TREFLE_IMPORT !== 'true') {
      console.log('⚠️ Trefle import is disabled. Set ENABLE_TREFLE_IMPORT=true to enable.')
      return
    }

    // Get current progress
    const progress = await getTrefleImportProgress(strapi)

    if (progress.isComplete) {
      console.log('✅ Trefle import already complete')
      return
    }

    console.log(`📄 Resuming from page ${progress.currentPage}`)

    let plantsImported = 0
    let plantsSkipped = 0
    let plantsCreated = 0

    // Fetch multiple pages per run
    for (let i = 0; i < PAGES_PER_RUN; i++) {
      const currentPage = progress.currentPage + i

      console.log(`📖 Fetching page ${currentPage}...`)

      const response = await client.getPlants(currentPage, PLANTS_PER_PAGE)

      if (!response.data || response.data.length === 0) {
        console.log('✅ Reached end of Trefle database')
        await updateImportProgress(strapi, { isComplete: true })
        break
      }

      console.log(`   Found ${response.data.length} plants`)

      // Process each plant
      for (const plant of response.data) {
        try {
          // Filter for herb candidates
          if (!isHerbCandidate(plant)) {
            plantsSkipped++
            continue
          }

          // Check if already imported
          const existing = await strapi.db.query('api::herb.herb').findOne({
            where: { botanicalData: { trefleId: plant.id } },
          })

          if (existing) {
            plantsSkipped++
            continue
          }

          // Create herb as draft
          const slug = plant.slug || plant.scientific_name.toLowerCase().replace(/\s+/g, '-')

          await strapi.entityService.create('api::herb.herb', {
            data: {
              name: plant.common_name || plant.scientific_name,
              slug,
              scientificName: plant.scientific_name,
              family: plant.family,
              synonyms: plant.synonyms || [],
              botanicalData: {
                trefleId: plant.id,
                trefleSlug: plant.slug,
                lastSyncedAt: new Date().toISOString(),
              },
              // Create as draft for manual review
              publishedAt: null,
            },
          })

          plantsCreated++
          console.log(`   ✅ Created: ${plant.common_name || plant.scientific_name}`)
        } catch (error) {
          console.error(`   ❌ Failed to import ${plant.scientific_name}:`, error.message)
        }
      }

      // Delay between pages
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Update progress
    const newPage = progress.currentPage + PAGES_PER_RUN
    const newTotalHerbs = progress.totalHerbsImported + plantsCreated

    await updateImportProgress(strapi, {
      currentPage: newPage,
      totalHerbsImported: newTotalHerbs,
    })

    const duration = Math.round((Date.now() - startTime) / 1000)

    console.log(`
✅ Trefle import batch complete
   Pages processed: ${PAGES_PER_RUN}
   Plants imported: ${plantsImported}
   Herbs created: ${plantsCreated}
   Herbs skipped: ${plantsSkipped}
   Total herbs in DB: ${newTotalHerbs}
   Duration: ${duration}s
   Next page: ${newPage}
    `)

    // Log import summary
    await strapi.entityService.create('api::import-log.import-log', {
      data: {
        type: 'Trefle Progressive Import',
        source: 'Trefle API',
        status: 'completed',
        recordsProcessed: plantsImported,
        recordsCreated: plantsCreated,
        recordsUpdated: 0,
        recordsFailed: 0,
        duration,
        summary: {
          pagesProcessed: PAGES_PER_RUN,
          plantsImported,
          plantsCreated,
          plantsSkipped,
          currentPage: newPage,
          totalHerbsImported: newTotalHerbs,
        },
        publishedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('❌ Trefle import failed:', error)

    // Log error
    await strapi.entityService.create('api::import-log.import-log', {
      data: {
        type: 'Trefle Import Error',
        source: 'Trefle API',
        status: 'failed',
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
        errors: [error.message],
        publishedAt: new Date(),
      },
    })
  }
}
```

</details>

**Key Features**:
- Imports 100 plants/minute (5 pages × 20 plants)
- Filters for herb candidates (edible, common name, growth habit)
- Creates herbs as drafts for manual review
- Tracks progress via TrefleImportState global
- Skips already imported plants
- Respects rate limits (500ms delay between pages)
- Can be paused and resumed

---

## Step 4: Cron Scheduler

**Purpose**: Orchestrate all cron jobs with proper scheduling

### Implementation

**File**: `apps/strapi-cms/src/cron/index.ts`

```typescript
import type { Strapi } from '@strapi/strapi'
import syncTrefleData from './jobs/syncTrefleData'
import importTrefleData from './jobs/importTrefleData'

export default {
  /**
   * Sync Trefle Botanical Data
   * Runs: Every Wednesday at 3:00 AM
   * Purpose: Enrich existing herbs with botanical data
   */
  '0 3 * * 3': async ({ strapi }: { strapi: Strapi }) => {
    if (process.env.TREFLE_API_KEY) {
      await syncTrefleData({ strapi })
    }
  },

  /**
   * Import Trefle Plant Database (Progressive)
   * Runs: Every minute
   * Purpose: Import all Trefle plants as draft herbs
   * WARNING: Only enable if you want to import 1M+ plants
   */
  '* * * * *': async ({ strapi }: { strapi: Strapi }) => {
    if (process.env.TREFLE_API_KEY && process.env.ENABLE_TREFLE_IMPORT === 'true') {
      await importTrefleData({ strapi })
    }
  },
}
```

**Cron Schedule Explanation**:
- `0 3 * * 3` = Every Wednesday at 3:00 AM (weekly sync)
- `* * * * *` = Every minute (progressive import)

---

## Step 5: Register Cron Jobs in Strapi

**File**: `apps/strapi-cms/src/index.ts`

Modify the bootstrap function to register cron jobs:

```typescript
import type { Core } from '@strapi/strapi'
import cronTasks from './cron'

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Register cron jobs
    console.log('🕐 Initializing cron jobs...')

    Object.entries(cronTasks).forEach(([schedule, task]) => {
      strapi.cron.add({
        [schedule]: task,
      })

      console.log(`   ✓ Scheduled: ${schedule}`)
    })

    console.log('✅ Cron jobs initialized')
  },
}
```

---

## Step 6: Environment Configuration

### Update `.env.example`

**File**: `apps/strapi-cms/.env.example`

Add Trefle configuration:

```env
# Trefle API Integration
TREFLE_API_KEY=your-trefle-api-key-here
ENABLE_TREFLE_IMPORT=false  # Set to 'true' to import 1M+ plants (WARNING: creates many drafts)
```

### Update Production `.env`

```bash
# Get your API key from https://trefle.io/
TREFLE_API_KEY=actual-api-key-from-trefle-dashboard

# Only enable if you want to import entire database
ENABLE_TREFLE_IMPORT=false
```

---

## Step 7: Create Required Collections (if missing)

### TrefleImportState Global

**File**: `apps/strapi-cms/src/api/trefle-import-state/content-types/trefle-import-state/schema.json`

```json
{
  "kind": "singleType",
  "collectionName": "trefle_import_state",
  "info": {
    "singularName": "trefle-import-state",
    "pluralName": "trefle-import-states",
    "displayName": "Trefle Import State"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "currentPage": {
      "type": "integer",
      "default": 1
    },
    "totalHerbsImported": {
      "type": "integer",
      "default": 0
    },
    "lastRunAt": {
      "type": "datetime"
    },
    "isComplete": {
      "type": "boolean",
      "default": false
    }
  }
}
```

---

## Testing the Integration

### Test 1: Verify TrefleClient

```bash
cd apps/strapi-cms
node
```

```javascript
const { getTrefleClient } = require('./dist/src/lib/trefle.js')

// Test search
const client = getTrefleClient()
client.searchByScientificName('Lavandula angustifolia').then(result => {
  console.log('Found plants:', result.data.length)
})

// Test enrichment
client.enrichHerbData({
  scientificName: 'Lavandula angustifolia',
  name: 'Lavender'
}).then(data => {
  console.log('Enriched data:', data)
})
```

### Test 2: Manual Sync Single Herb

```typescript
import { syncSingleHerbWithTrefle } from './src/cron/jobs/syncTrefleData'

const result = await syncSingleHerbWithTrefle(strapi, 1) // Replace 1 with herb ID
console.log(result)
```

### Test 3: Check Import Progress

```typescript
import { getTrefleImportProgress } from './src/cron/jobs/importTrefleData'

const progress = await getTrefleImportProgress(strapi)
console.log('Import progress:', progress)
```

---

## Monitoring

### View Logs

```bash
# Watch cron job output
cd apps/strapi-cms
pnpm develop

# Look for:
🌿 Starting Trefle botanical data sync...
📋 Found 10 herbs to sync
🔄 Syncing herb: Lavender (Lavandula angustifolia)
   ✅ Enriched: Lavender
✅ Trefle sync complete
```

### Check Import Logs

In Strapi Admin:
1. Navigate to **Content Manager** → **Import Logs**
2. Filter by type: "Trefle Sync" or "Trefle Progressive Import"
3. Review success/error counts

### Check Validation Reports

In Strapi Admin:
1. Navigate to **Content Manager** → **Validation Reports**
2. Filter by type: "Trefle Name Mismatch"
3. Review suggestions for herbs with invalid scientific names

---

## Troubleshooting

### Issue: "Trefle client not configured"

**Solution**: Set `TREFLE_API_KEY` in `.env`

### Issue: Rate limit errors (429)

**Solution**: Increase delay in `trefle.ts` from 500ms to 1000ms

### Issue: Import not running

**Check**:
1. `TREFLE_API_KEY` is set
2. `ENABLE_TREFLE_IMPORT=true` is set
3. Cron jobs are registered (check startup logs)

### Issue: Too many draft herbs

**Solution**:
```bash
# Pause import
ENABLE_TREFLE_IMPORT=false

# Bulk delete drafts in Strapi admin
Content Manager → Herbs → Filter: Draft → Select All → Delete
```

---

## Next Steps

After implementation:

1. ✅ Test TrefleClient manually
2. ✅ Run sync job on 5-10 herbs
3. ✅ Review enriched data quality
4. ✅ Decide if progressive import is needed
5. ✅ Monitor rate limits and adjust if needed
6. ✅ Create admin UI for manual sync triggers

---

**Questions?** See [TREFLE_INTEGRATION.md](./TREFLE_INTEGRATION.md) for detailed API reference and usage examples.
