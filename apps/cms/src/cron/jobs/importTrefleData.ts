import type { Payload } from 'payload'
import { getTrefleClient } from '../../lib/trefle'
import { findOrCreateHerb } from '../../lib/herbDeduplication'

interface TrefleImportStats {
  plantsProcessed: number
  herbsCreated: number
  herbsUpdated: number
  herbsSkipped: number
  errors: number
  currentPage: number
  totalPages: number
  isComplete: boolean
}

/**
 * Progressive import of all Trefle plant data
 * Runs every minute, processes up to 120 plants per run (rate limit)
 */
export async function importTrefleDataJob(payload: Payload): Promise<void> {
  console.log('🌿 Starting Trefle progressive import...')

  const stats: TrefleImportStats = {
    plantsProcessed: 0,
    herbsCreated: 0,
    herbsUpdated: 0,
    herbsSkipped: 0,
    errors: 0,
    currentPage: 1,
    totalPages: 1,
    isComplete: false,
  }

  try {
    // Check if Trefle API is configured
    if (!process.env.TREFLE_API_KEY) {
      console.log('⏭️  Trefle API key not configured, skipping import')
      return
    }

    // Get or create import state
    const importState = await getImportState(payload)
    stats.currentPage = importState.currentPage

    console.log(`📄 Resuming from page ${stats.currentPage}`)

    const trefleClient = getTrefleClient()

    // Fetch plants from current page
    // Trefle returns 20 plants per page by default, so we'll fetch multiple pages per run
    // 120 requests/min ÷ 20 plants/page = 6 pages per run max (but we'll use 5 to be safe)
    const pagesPerRun = 5
    let plantsThisRun = 0

    for (let i = 0; i < pagesPerRun; i++) {
      const currentPage = stats.currentPage + i

      try {
        console.log(`📖 Fetching page ${currentPage}...`)

        const response = await trefleClient.client.get('/plants', {
          params: {
            page: currentPage,
          },
        })

        const { data, links, meta } = response.data

        if (!data || data.length === 0) {
          console.log('✅ No more plants to import - import complete!')
          stats.isComplete = true
          await updateImportState(payload, {
            currentPage: 1,
            isComplete: true,
            lastCompletedAt: new Date(),
          })
          break
        }

        stats.totalPages = meta.total ? Math.ceil(meta.total / 20) : currentPage
        console.log(`   Found ${data.length} plants (Page ${currentPage} of ~${stats.totalPages})`)

        // Process each plant
        for (const plant of data) {
          try {
            stats.plantsProcessed++
            plantsThisRun++

            // Check if this is a medicinal/edible plant (we want herbs, not all plants)
            if (!isHerbCandidate(plant)) {
              stats.herbsSkipped++
              continue
            }

            // Get detailed data for herb
            const enrichedData = await trefleClient.enrichHerbData({
              scientificName: plant.scientific_name,
              name: plant.common_name || plant.scientific_name,
            })

            if (!enrichedData) {
              console.log('  ⏭️  No Trefle data found')
              stats.herbsSkipped++
              continue
            }

            // Prepare herb data
            const slug = generateSlug(
              plant.common_name || plant.scientific_name
            )

            const herbData = {
              name: plant.common_name || plant.scientific_name,
              slug: slug,
              scientificName: plant.scientific_name,
              family: enrichedData.family,
              synonyms: enrichedData.synonyms,
              botanicalData: {
                trefleId: enrichedData.trefleId,
                trefleSlug: enrichedData.trefleSlug,
                lastSyncedAt: new Date(),
                trefleSyncAttempted: true,
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
              images: enrichedData.imageUrl
                ? [
                    {
                      url: enrichedData.imageUrl,
                      caption: `${plant.common_name || plant.scientific_name} - from Trefle botanical database`,
                      type: 'photograph',
                      source: 'Trefle',
                    },
                  ]
                : [],
              habitat:
                enrichedData.distributions?.native.length > 0
                  ? `Native to: ${enrichedData.distributions.native.slice(0, 5).join(', ')}`
                  : undefined,
              safetyInfo:
                enrichedData.toxicity && enrichedData.toxicity !== 'none'
                  ? {
                      warnings: [`Trefle toxicity: ${enrichedData.toxicity}`],
                    }
                  : undefined,
            }

            // Use deduplication to find or create herb
            const result = await findOrCreateHerb(payload, herbData, 'trefle')

            if (result.isNew) {
              stats.herbsCreated++
              console.log(`   ✅ Created: ${plant.scientific_name}`)
            } else if (result.wasUpdated) {
              stats.herbsUpdated++
              console.log(`   ✓ Updated: ${plant.scientific_name}`)
            } else {
              stats.herbsSkipped++
              console.log(`   ⏭️  Skipped (no changes): ${plant.scientific_name}`)
            }

            // Rate limiting: small delay between herb processing
            await new Promise((resolve) => setTimeout(resolve, 100))
          } catch (error) {
            console.error(
              `   ❌ Error processing ${plant.scientific_name}:`,
              error
            )
            stats.errors++
          }
        }

        // Update progress after each page
        await updateImportState(payload, {
          currentPage: currentPage + 1,
          lastRunAt: new Date(),
        })

        stats.currentPage = currentPage + 1

        // Add delay between page requests (rate limiting)
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`❌ Error fetching page ${currentPage}:`, error)
        stats.errors++
        break
      }
    }

    console.log('✅ Trefle import batch complete:', stats)

    // Log import results
    await payload.create({
      collection: 'import-logs',
      data: {
        type: 'trefle-progressive-import',
        results: stats,
        timestamp: new Date(),
      },
    })

    // Send notification if significant import occurred
    if (stats.herbsCreated > 50) {
      console.log(
        `📧 ${stats.herbsCreated} new herbs imported. Page ${stats.currentPage} of ~${stats.totalPages}.`
      )
    }

    if (stats.isComplete) {
      console.log('🎉 Trefle import complete! All plants have been imported.')
      // TODO: Send completion email to admins
    }
  } catch (error) {
    console.error('❌ Trefle import job failed:', error)
    throw error
  }
}

/**
 * Get current import state
 */
async function getImportState(
  payload: Payload
): Promise<{
  currentPage: number
  isComplete: boolean
  lastRunAt: Date | null
  lastCompletedAt: Date | null
}> {
  try {
    const state = await payload.findGlobal({
      slug: 'trefle-import-state',
    })

    return {
      currentPage: state.currentPage || 1,
      isComplete: state.isComplete || false,
      lastRunAt: state.lastRunAt ? new Date(state.lastRunAt) : null,
      lastCompletedAt: state.lastCompletedAt
        ? new Date(state.lastCompletedAt)
        : null,
    }
  } catch (error) {
    // State doesn't exist yet, create it
    try {
      await payload.updateGlobal({
        slug: 'trefle-import-state',
        data: {
          currentPage: 1,
          isComplete: false,
          lastRunAt: null,
          lastCompletedAt: null,
        },
      })
    } catch (createError) {
      console.error('Could not create import state:', createError)
    }

    return {
      currentPage: 1,
      isComplete: false,
      lastRunAt: null,
      lastCompletedAt: null,
    }
  }
}

/**
 * Update import state
 */
async function updateImportState(
  payload: Payload,
  updates: Partial<{
    currentPage: number
    isComplete: boolean
    lastRunAt: Date
    lastCompletedAt: Date
  }>
): Promise<void> {
  try {
    await payload.updateGlobal({
      slug: 'trefle-import-state',
      data: updates,
    })
  } catch (error) {
    console.error('Failed to update import state:', error)
  }
}

/**
 * Determine if a plant is a potential herb candidate
 * (medicinal, edible, or otherwise useful)
 */
function isHerbCandidate(plant: any): boolean {
  // Include if:
  // 1. Marked as edible or vegetable
  // 2. Has common name (suggests human use/recognition)
  // 3. Not a tree (we focus on herbs)
  // 4. Has any historical or practical use indicators

  if (plant.vegetable || plant.edible) {
    return true
  }

  if (plant.common_name && plant.common_name.length > 0) {
    return true
  }

  // Skip if explicitly marked as tree
  if (plant.specifications?.ligneous_type === 'tree') {
    return false
  }

  // Include herbs, subshrubs, and other non-woody plants
  if (
    plant.specifications?.growth_form &&
    ['herb', 'graminoid', 'subshrub', 'forb'].includes(
      plant.specifications.growth_form
    )
  ) {
    return true
  }

  // Default: include for review (will be draft status)
  return true
}

/**
 * Generate URL-friendly slug from plant name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Manually reset import to start from beginning
 */
export async function resetTrefleImport(payload: Payload): Promise<void> {
  await updateImportState(payload, {
    currentPage: 1,
    isComplete: false,
    lastRunAt: new Date(),
  })
  console.log('✅ Trefle import reset to page 1')
}

/**
 * Get import progress
 */
export async function getTrefleImportProgress(
  payload: Payload
): Promise<{
  currentPage: number
  isComplete: boolean
  lastRunAt: Date | null
  lastCompletedAt: Date | null
  estimatedPlantsRemaining: number
}> {
  const state = await getImportState(payload)

  // Trefle has ~500,000 plants, 20 per page = ~25,000 pages
  const estimatedTotalPages = 25000
  const estimatedPlantsRemaining =
    (estimatedTotalPages - state.currentPage) * 20

  return {
    ...state,
    estimatedPlantsRemaining: Math.max(0, estimatedPlantsRemaining),
  }
}
