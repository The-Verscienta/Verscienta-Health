/**
 * Import Trefle Plant Database Cron Job
 *
 * Progressively imports all plants from Trefle's 1M+ plant database.
 * Creates herbs as drafts for manual review.
 *
 * WARNING: This will create hundreds of thousands of draft herbs!
 * Only enable if you want to import the entire botanical database.
 */

import type { Core } from '@strapi/strapi'
import { getTrefleClient, type TreflePlant } from '../../lib/trefle'

const PAGES_PER_RUN = 5 // Fetch 5 pages per minute
const PLANTS_PER_PAGE = 20 // Trefle API limit

/**
 * Check if plant is a good herb candidate
 */
function isHerbCandidate(plant: TreflePlant): boolean {
  // Prioritize edible or vegetable plants
  if (plant.vegetable || plant.edible) return true

  // Include if it has a common name (suggests human use)
  if (plant.common_name) return true

  // Filter by growth habit (herbs, graminoids, subshrubs, forbs)
  const specifications = plant.specifications as any
  if (specifications?.growth_habit) {
    const goodHabits = ['herb', 'graminoid', 'subshrub', 'forb']
    if (goodHabits.includes(specifications.growth_habit.toLowerCase())) {
      return true
    }

    // Exclude trees
    if (specifications.growth_habit.toLowerCase() === 'tree') {
      return false
    }
  }

  // Include everything else as draft for review
  return true
}

/**
 * Get import progress from global state
 */
export async function getTrefleImportProgress(strapi: Core.Strapi) {
  try {
    // Note: This will need the TrefleImportState collection to be created
    const importState = await strapi.db
      .query('api::trefle-import-state.trefle-import-state')
      .findOne({
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
  strapi: Core.Strapi,
  updates: {
    currentPage?: number
    totalHerbsImported?: number
    isComplete?: boolean
  }
) {
  try {
    const existingState = await strapi.db
      .query('api::trefle-import-state.trefle-import-state')
      .findOne({
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
export async function resetTrefleImport(strapi: Core.Strapi) {
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
export default async function importTrefleData({ strapi }: { strapi: Core.Strapi }) {
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
      // Only log this once per hour to avoid spam
      const lastLog = (global as any).__trefleImportDisabledLog || 0
      if (Date.now() - lastLog > 3600000) {
        console.log('⚠️ Trefle import is disabled. Set ENABLE_TREFLE_IMPORT=true to enable.')
        ;(global as any).__trefleImportDisabledLog = Date.now()
      }
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
          plantsImported++

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
              // Note: synonyms omitted during import, will be added during sync
              botanicalData: {
                trefleId: plant.id,
                trefleSlug: plant.slug,
                lastSyncedAt: new Date().toISOString(),
              },
              // Create as draft for manual review
              publishedAt: null,
            } as any,
          })

          plantsCreated++
          console.log(`   ✅ Created: ${plant.common_name || plant.scientific_name}`)
        } catch (error) {
          console.error(`   ❌ Failed to import ${plant.scientific_name}:`, (error as Error).message)
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
        type: 'trefle-progressive-import',
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
      } as any,
    })
  } catch (error) {
    console.error('❌ Trefle import failed:', error)

    // Log error
    await strapi.entityService.create('api::import-log.import-log', {
      data: {
        type: 'other',
        source: 'Trefle API',
        status: 'failed',
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
        errors: [(error as Error).message],
        publishedAt: new Date(),
      } as any,
    })
  }
}
