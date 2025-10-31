/**
 * Import Trefle Plant Database - Payload Job
 *
 * Progressively imports all plants from Trefle's 1M+ plant database.
 * Creates herbs as drafts for manual review.
 *
 * WARNING: This will create hundreds of thousands of draft herbs!
 * Only enable if you want to import the entire botanical database.
 */

import type { PayloadHandler } from 'payload'
import { getTrefleClient } from '../lib/trefle'

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
  if (
    plant.specifications?.growth_habit &&
    goodHabits.includes(plant.specifications.growth_habit.toLowerCase())
  ) {
    return true
  }

  // Exclude trees
  if (
    plant.specifications?.growth_habit &&
    plant.specifications.growth_habit.toLowerCase() === 'tree'
  ) {
    return false
  }

  // Include everything else as draft for review
  return true
}

/**
 * Get import progress from global state
 */
async function getTrefleImportProgress(payload: any) {
  try {
    const importState = await payload.findGlobal({
      slug: 'trefle-import-state',
    })

    return {
      currentPage: importState?.currentPage || 1,
      recordsImported: importState?.recordsImported || 0,
      lastImportDate: importState?.lastImportDate || null,
      importStatus: importState?.importStatus || 'not_started',
      estimatedRemaining: Math.max(0, 1000000 - (importState?.recordsImported || 0)),
    }
  } catch (error) {
    console.error('Failed to get import progress:', error)
    return {
      currentPage: 1,
      recordsImported: 0,
      lastImportDate: null,
      importStatus: 'not_started',
      estimatedRemaining: 1000000,
    }
  }
}

/**
 * Update import progress in global state
 */
async function updateImportProgress(
  payload: any,
  updates: {
    currentPage?: number
    recordsImported?: number
    importStatus?: string
    errorMessage?: string
  }
) {
  try {
    await payload.updateGlobal({
      slug: 'trefle-import-state',
      data: {
        ...updates,
        lastImportDate: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to update import progress:', error)
  }
}

/**
 * Import Trefle Plant Database Job Handler
 */
export const importTrefleDataJob: PayloadHandler = async ({ payload }) => {
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
    const progress = await getTrefleImportProgress(payload)

    if (progress.importStatus === 'completed') {
      console.log('✅ Trefle import already complete')
      return
    }

    console.log(`📄 Resuming from page ${progress.currentPage}`)

    // Update status to in_progress
    await updateImportProgress(payload, { importStatus: 'in_progress' })

    let plantsProcessed = 0
    let plantsSkipped = 0
    let plantsCreated = 0

    // Fetch multiple pages per run
    for (let i = 0; i < PAGES_PER_RUN; i++) {
      const currentPage = progress.currentPage + i

      console.log(`📖 Fetching page ${currentPage}...`)

      const response = await client.getPlants(currentPage, PLANTS_PER_PAGE)

      if (!response.data || response.data.length === 0) {
        console.log('✅ Reached end of Trefle database')
        await updateImportProgress(payload, { importStatus: 'completed' })
        break
      }

      console.log(`   Found ${response.data.length} plants`)

      // Process each plant
      for (const plant of response.data) {
        try {
          plantsProcessed++

          // Filter for herb candidates
          if (!isHerbCandidate(plant)) {
            plantsSkipped++
            continue
          }

          // Check if already imported (by trefleId)
          const { docs: existing } = await payload.find({
            collection: 'herbs',
            where: {
              'botanicalInfo.trefleId': {
                equals: plant.id,
              },
            },
            limit: 1,
          })

          if (existing.length > 0) {
            plantsSkipped++
            continue
          }

          // Create herb as draft
          const slug =
            plant.slug || plant.scientific_name.toLowerCase().replace(/\s+/g, '-')

          await payload.create({
            collection: 'herbs',
            data: {
              title: plant.common_name || plant.scientific_name,
              slug,
              botanicalInfo: {
                scientificName: plant.scientific_name,
                family: plant.family,
                genus: plant.genus,
                species: plant.species,
                trefleId: plant.id,
                trefleSlug: plant.slug,
              },
              synonyms: plant.synonyms
                ? plant.synonyms.map((s: string) => ({
                    scientificName: s,
                    status: 'synonym',
                  }))
                : [],
              peerReviewStatus: 'draft', // Create as draft for manual review
              // Don't publish - leave as draft
              _status: 'draft',
            },
          })

          plantsCreated++
          console.log(`   ✅ Created: ${plant.common_name || plant.scientific_name}`)
        } catch (error) {
          console.error(
            `   ❌ Failed to import ${plant.scientific_name}:`,
            (error as Error).message
          )
        }
      }

      // Delay between pages to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Update progress
    const newPage = progress.currentPage + PAGES_PER_RUN
    const newTotalHerbs = progress.recordsImported + plantsCreated

    await updateImportProgress(payload, {
      currentPage: newPage,
      recordsImported: newTotalHerbs,
    })

    const duration = Math.round((Date.now() - startTime) / 1000)

    console.log(`
✅ Trefle import batch complete
   Pages processed: ${PAGES_PER_RUN}
   Plants processed: ${plantsProcessed}
   Herbs created: ${plantsCreated}
   Herbs skipped: ${plantsSkipped}
   Total herbs in DB: ${newTotalHerbs}
   Duration: ${duration}s
   Next page: ${newPage}
    `)

    // Log import summary
    await payload.create({
      collection: 'import-logs',
      data: {
        type: 'trefle-progressive-import',
        source: 'Trefle API',
        status: 'completed',
        recordsProcessed: plantsProcessed,
        recordsCreated: plantsCreated,
        recordsUpdated: 0,
        recordsFailed: 0,
        duration,
        summary: {
          pagesProcessed: PAGES_PER_RUN,
          plantsProcessed,
          plantsCreated,
          plantsSkipped,
          totalHerbsInDB: newTotalHerbs,
          nextPage: newPage,
        },
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('❌ Trefle import failed:', error)

    // Update status to error
    await updateImportProgress(payload, {
      importStatus: 'error',
      errorMessage: (error as Error).message,
    })

    // Log error
    await payload.create({
      collection: 'import-logs',
      data: {
        type: 'trefle-progressive-import',
        source: 'Trefle API',
        status: 'failed',
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsFailed: 1,
        errors: [(error as Error).message],
        timestamp: new Date().toISOString(),
      },
    })
  }
}

/**
 * Reset import to start from beginning
 * Can be called manually to restart the import
 */
export async function resetTrefleImport(payload: any) {
  await payload.updateGlobal({
    slug: 'trefle-import-state',
    data: {
      currentPage: 1,
      recordsImported: 0,
      importStatus: 'not_started',
      errorMessage: null,
      lastImportDate: new Date().toISOString(),
    },
  })
  console.log('🔄 Trefle import reset to page 1')
}
