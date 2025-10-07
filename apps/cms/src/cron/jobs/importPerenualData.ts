import type { Payload } from 'payload'
import { findOrCreateHerb } from '../../lib/herbDeduplication'
import { getPerenualClient } from '../../lib/perenual'

interface PerenualImportStats {
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
 * Progressive import of Perenual plant data
 * Runs every minute, processes plants while respecting rate limits
 * Checks for duplicates with Trefle imports
 */
export async function importPerenualDataJob(payload: Payload): Promise<void> {
  console.log('🌱 Starting Perenual progressive import...')

  const stats: PerenualImportStats = {
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
    // Check if Perenual API is configured
    if (!process.env.PERENUAL_API_KEY) {
      console.log('⏭️  Perenual API key not configured, skipping import')
      return
    }

    // Get or create import state
    const importState = await getImportState(payload)
    stats.currentPage = importState.currentPage

    console.log(`📄 Resuming from page ${stats.currentPage}`)

    const perenualClient = getPerenualClient()

    // Perenual free tier: process fewer pages per run
    const pagesPerRun = 2 // Conservative to respect rate limits

    for (let i = 0; i < pagesPerRun; i++) {
      const currentPage = stats.currentPage + i

      try {
        console.log(`📖 Fetching page ${currentPage}...`)

        // Search all plants (empty query returns paginated list)
        const response = await perenualClient.searchPlants('', currentPage)

        if (!response.data || response.data.length === 0) {
          console.log('✅ No more plants to import - import complete!')
          stats.isComplete = true
          await updateImportState(payload, {
            currentPage: 1,
            isComplete: true,
            lastCompletedAt: new Date(),
          })
          break
        }

        stats.totalPages = response.last_page
        console.log(
          `   Found ${response.data.length} plants (Page ${currentPage} of ${stats.totalPages})`
        )

        // Process each plant
        for (const plant of response.data) {
          try {
            stats.plantsProcessed++

            // Check if this is a medicinal/edible/cultivation-worthy plant
            if (!isHerbCandidate(plant)) {
              stats.herbsSkipped++
              continue
            }

            console.log(`🔍 Processing: ${plant.common_name} (${plant.scientific_name.join(', ')})`)

            // Get detailed data
            const enrichedData = await perenualClient.enrichHerbData({
              scientificName: plant.scientific_name[0],
              name: plant.common_name,
            })

            if (!enrichedData) {
              console.log('  ⏭️  No Perenual data found')
              stats.herbsSkipped++
              continue
            }

            // Prepare herb data
            const herbData = {
              name: enrichedData.commonName || plant.common_name,
              scientificName: plant.scientific_name[0],
              family: enrichedData.family,
              synonyms: plant.scientific_name.slice(1), // Other scientific names as synonyms
              botanicalData: {
                perenualId: enrichedData.perenualId,
                lastPerenualSyncAt: new Date(),
                perenualData: {
                  origin: enrichedData.origin,
                  medicinal: enrichedData.medicinal,
                  toxicity: enrichedData.toxicity,
                  attracts: enrichedData.attracts,
                },
              },
              cultivation: {
                cycle: enrichedData.cultivation?.cycle,
                watering: enrichedData.cultivation?.watering,
                wateringPeriod: enrichedData.cultivation?.wateringPeriod,
                sunlight: enrichedData.cultivation?.sunlight,
                soil: enrichedData.cultivation?.soil,
                hardiness: enrichedData.cultivation?.hardiness,
                maintenance: enrichedData.cultivation?.maintenance,
                careLevel: enrichedData.cultivation?.careLevel,
                growthRate: enrichedData.cultivation?.growthRate,
                indoor: enrichedData.cultivation?.indoor,
                droughtTolerant: enrichedData.cultivation?.droughtTolerant,
                saltTolerant: enrichedData.cultivation?.saltTolerant,
                propagation: enrichedData.propagation,
                pruning: enrichedData.pruning,
              },
              images: enrichedData.imageUrl
                ? [
                    {
                      url: enrichedData.imageUrl,
                      caption: `${plant.common_name} - from Perenual plant database`,
                      type: 'photograph',
                      source: 'Perenual',
                    },
                  ]
                : [],
              safetyInfo: {
                warnings: [
                  ...(enrichedData.toxicity?.toHumans
                    ? [`Toxicity to humans: ${enrichedData.toxicity.toHumans > 0 ? 'Yes' : 'No'}`]
                    : []),
                  ...(enrichedData.toxicity?.toPets
                    ? [`Toxicity to pets: ${enrichedData.toxicity.toPets > 0 ? 'Yes' : 'No'}`]
                    : []),
                ],
              },
              cultivation_notes: enrichedData.careGuide,
              pest_management:
                enrichedData.pests.length > 0
                  ? enrichedData.pests
                      .map(
                        (pest) =>
                          `**${pest.name}** (${pest.scientificName}):\n${pest.description}\n\n*Solution:* ${pest.solution}`
                      )
                      .join('\n\n---\n\n')
                  : undefined,
            }

            // Use deduplication to find or create herb
            const result = await findOrCreateHerb(payload, herbData, 'perenual')

            if (result.isNew) {
              stats.herbsCreated++
              console.log(`  ✅ Created: ${plant.common_name}`)
            } else if (result.wasUpdated) {
              stats.herbsUpdated++
              console.log(`  ✓ Updated: ${plant.common_name}`)
            } else {
              stats.herbsSkipped++
              console.log(`  ⏭️  Skipped (no changes): ${plant.common_name}`)
            }

            // Rate limiting: delay between plant processing
            await new Promise((resolve) => setTimeout(resolve, 200))
          } catch (error) {
            console.error(`  ❌ Error processing ${plant.common_name}:`, error)
            stats.errors++
          }
        }

        // Update progress after each page
        await updateImportState(payload, {
          currentPage: currentPage + 1,
          lastRunAt: new Date(),
        })

        stats.currentPage = currentPage + 1

        // Delay between pages (rate limiting)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`❌ Error fetching page ${currentPage}:`, error)
        stats.errors++
        break
      }
    }

    console.log('✅ Perenual import batch complete:', stats)

    // Log import results
    await payload.create({
      collection: 'import-logs',
      data: {
        type: 'perenual-progressive-import',
        results: stats,
        timestamp: new Date(),
      },
    })

    // Send notification if significant import occurred
    if (stats.herbsCreated > 20) {
      console.log(
        `📧 ${stats.herbsCreated} new herbs imported from Perenual. Page ${stats.currentPage} of ${stats.totalPages}.`
      )
    }

    if (stats.isComplete) {
      console.log('🎉 Perenual import complete! All plants have been imported.')
    }
  } catch (error) {
    console.error('❌ Perenual import job failed:', error)
    throw error
  }
}

/**
 * Get current import state
 */
async function getImportState(payload: Payload): Promise<{
  currentPage: number
  isComplete: boolean
  lastRunAt: Date | null
  lastCompletedAt: Date | null
}> {
  try {
    const state = await payload.findGlobal({
      slug: 'perenual-import-state',
    })

    return {
      currentPage: state.currentPage || 1,
      isComplete: state.isComplete || false,
      lastRunAt: state.lastRunAt ? new Date(state.lastRunAt) : null,
      lastCompletedAt: state.lastCompletedAt ? new Date(state.lastCompletedAt) : null,
    }
  } catch (_error) {
    // State doesn't exist yet
    try {
      await payload.updateGlobal({
        slug: 'perenual-import-state',
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
      slug: 'perenual-import-state',
      data: updates,
    })
  } catch (error) {
    console.error('Failed to update import state:', error)
  }
}

/**
 * Determine if a plant is a herb candidate
 */
function isHerbCandidate(plant: any): boolean {
  // Include if medicinal, edible, or has cultivation value
  // Perenual marks medicinal plants explicitly
  if (plant.cycle === 'perennial' || plant.cycle === 'annual') {
    return true
  }

  // Common herbs usually have watering/sunlight info
  if (plant.watering && plant.sunlight) {
    return true
  }

  // Include all for now (will be drafts for review)
  return true
}

/**
 * Manually reset import
 */
export async function resetPerenualImport(payload: Payload): Promise<void> {
  await updateImportState(payload, {
    currentPage: 1,
    isComplete: false,
    lastRunAt: new Date(),
  })
  console.log('✅ Perenual import reset to page 1')
}

/**
 * Get import progress
 */
export async function getPerenualImportProgress(payload: Payload): Promise<{
  currentPage: number
  isComplete: boolean
  lastRunAt: Date | null
  lastCompletedAt: Date | null
  estimatedPlantsRemaining: number
}> {
  const state = await getImportState(payload)

  // Perenual has ~10,000 plants
  const estimatedTotalPages = 500 // Rough estimate
  const estimatedPlantsRemaining = Math.max(0, (estimatedTotalPages - state.currentPage) * 20)

  return {
    ...state,
    estimatedPlantsRemaining,
  }
}
