/**
 * Trefle Plant Database Import Cron Job
 *
 * Progressively imports all 1M+ plants from Trefle botanical database.
 * Creates herbs as drafts for manual review and validation.
 *
 * Schedule: Every minute (when enabled)
 * Processing: ~100 plants per run (5 pages × 20 plants)
 * Rate Limit: 120 requests/minute (Trefle free tier)
 * Total Time: ~7 days continuous running for complete import
 *
 * WARNING: This will create hundreds of thousands of draft herbs!
 * Only enable if you want to import the entire botanical database.
 *
 * Enable: Set ENABLE_TREFLE_IMPORT=true in .env
 *
 * Features:
 * - Progressive state tracking
 * - Rate limiting (500ms between requests)
 * - Enhanced retry logic with exponential backoff
 * - Timeout handling (10 second default)
 * - Circuit breaker pattern to prevent cascading failures
 * - Retry statistics tracking
 * - Automatic retry on errors
 * - Deduplication with existing herbs
 * - Creates herbs as drafts for review
 * - Logs import progress to ImportLogs collection
 *
 * @see docs/TREFLE_RETRY_LOGIC.md
 * @see docs/TREFLE_INTEGRATION.md
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { trefleClientEnhanced, type TreflePlant } from '@/lib/trefle'
import { createOrUpdateHerb } from '@/lib/herbDeduplication'

const ENABLE_IMPORT = process.env.ENABLE_TREFLE_IMPORT === 'true'
const PAGES_PER_RUN = 5 // Import 5 pages per run (100 plants)
const PAGE_SIZE = 20 // Trefle's default page size

/**
 * Import state tracking
 */
interface TrefleImportState {
  currentPage: number
  totalPlants: number
  herbsCreated: number
  herbsUpdated: number
  herbsSkipped: number
  lastRunAt: Date
  isComplete: boolean
  errors: number
}

/**
 * Get or create import state from global
 */
async function getImportState(payload: any): Promise<TrefleImportState> {
  try {
    const globalData = await payload.findGlobal({
      slug: 'trefleImportState',
    })

    if (globalData) {
      return globalData as TrefleImportState
    }
  } catch (error) {
    console.log('[Trefle Import] No existing state found, creating new')
  }

  // Create initial state
  const initialState: TrefleImportState = {
    currentPage: 1,
    totalPlants: 0,
    herbsCreated: 0,
    herbsUpdated: 0,
    herbsSkipped: 0,
    lastRunAt: new Date(),
    isComplete: false,
    errors: 0,
  }

  return initialState
}

/**
 * Update import state
 */
async function updateImportState(payload: any, state: Partial<TrefleImportState>): Promise<void> {
  try {
    await payload.updateGlobal({
      slug: 'trefleImportState',
      data: {
        ...state,
        lastRunAt: new Date(),
      },
    })
  } catch (error) {
    console.error('[Trefle Import] Failed to update state:', error)
  }
}

/**
 * Check if plant is a good herb candidate
 */
function isHerbCandidate(plant: TreflePlant): boolean {
  // Prioritize edible or vegetable plants
  if (plant.common_name && plant.common_name.toLowerCase().includes('vegetable')) return true

  // Include if it has a common name (suggests human use)
  if (plant.common_name) return true

  // Include everything else as draft for review
  return true
}

/**
 * Map Trefle plant to Payload Herb schema
 */
async function mapTrefleToHerb(plant: TreflePlant, plantDetails: any): Promise<any> {
  const enrichmentData = trefleClientEnhanced.extractEnrichmentData(plantDetails)

  // Build herb object
  const herb: any = {
    title: plant.common_name || plant.scientific_name,
    slug: plant.slug || plant.scientific_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),

    botanicalInfo: {
      scientificName: plant.scientific_name,
      family: enrichmentData.family,
      synonyms: enrichmentData.synonyms,
      trefleId: enrichmentData.trefleId,
      trefleSlug: enrichmentData.trefleSlug,
      lastTrefleSyncAt: enrichmentData.lastSyncedAt,

      trefleData: {
        author: enrichmentData.author,
        year: enrichmentData.year,
        bibliography: enrichmentData.bibliography,
        synonyms: enrichmentData.synonyms,
        distributions: enrichmentData.distributions,
        edible: enrichmentData.edible,
        ediblePart: enrichmentData.ediblePart,
        vegetable: enrichmentData.vegetable,
        toxicity: enrichmentData.toxicity,
        growthHabit: enrichmentData.growthHabit,
        growthForm: enrichmentData.growthForm,
        growthRate: enrichmentData.growthRate,
        averageHeight: enrichmentData.averageHeight,
        maximumHeight: enrichmentData.maximumHeight,
        flowerColor: enrichmentData.flowerColor,
        foliageColor: enrichmentData.foliageColor,
        fruitColor: enrichmentData.fruitColor,
        sources: enrichmentData.sources,
      },
    },

    safetyInfo: {
      warnings: buildSafetyWarnings(enrichmentData),
    },
  }

  // Add image if available
  if (enrichmentData.imageUrl) {
    herb.photoGallery = [
      {
        url: enrichmentData.imageUrl,
        caption: `${plant.common_name || plant.scientific_name} - from Trefle botanical database`,
        type: 'photograph',
        source: 'Trefle',
      },
    ]
  }

  // Add habitat info if available
  if (enrichmentData.distributions?.native?.length > 0) {
    herb.habitat = `Native to: ${enrichmentData.distributions.native.slice(0, 5).join(', ')}`
  }

  return herb
}

/**
 * Build safety warnings
 */
function buildSafetyWarnings(enrichmentData: ReturnType<typeof trefleClientEnhanced.extractEnrichmentData>): string[] {
  const warnings: string[] = []

  if (enrichmentData.toxicity && enrichmentData.toxicity !== 'none') {
    warnings.push(`⚠️ Trefle toxicity level: ${enrichmentData.toxicity}`)
  } else {
    warnings.push('✓ Non-toxic according to Trefle database')
  }

  if (enrichmentData.edible) {
    warnings.push('✓ Edible plant')
    if (enrichmentData.ediblePart && enrichmentData.ediblePart.length > 0) {
      warnings.push(`Edible parts: ${enrichmentData.ediblePart.join(', ')}`)
    }
  }

  if (enrichmentData.vegetable) {
    warnings.push('✓ Vegetable plant')
  }

  return warnings
}

/**
 * Import plants from a single page
 */
async function importPage(payload: any, page: number): Promise<{
  created: number
  updated: number
  skipped: number
  errors: number
}> {
  const stats = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  }

  try {
    console.log(`[Trefle Import] 📖 Fetching page ${page}...`)

    // Fetch page from Trefle API
    const response = await trefleClientEnhanced.getPlants(page, PAGE_SIZE)

    if (!response.data || response.data.length === 0) {
      console.log(`[Trefle Import] Page ${page} is empty`)
      return stats
    }

    console.log(`[Trefle Import]    Found ${response.data.length} plants`)

    // Process each plant
    for (const plant of response.data) {
      try {
        // Filter for herb candidates
        if (!isHerbCandidate(plant)) {
          console.log(`[Trefle Import]   ⊘ Skipped: ${plant.common_name || plant.scientific_name} (not a candidate)`)
          stats.skipped++
          continue
        }

        // Fetch detailed plant data
        const detailsResponse = await trefleClientEnhanced.getPlantById(plant.id)

        // Map to herb schema
        const herbData = await mapTrefleToHerb(plant, detailsResponse.data)

        // Create or update herb with deduplication
        const result = await createOrUpdateHerb(payload, herbData, 'trefle')

        if (result.created) {
          console.log(`[Trefle Import]   ✅ Created: ${plant.common_name || plant.scientific_name}`)
          stats.created++
        } else {
          console.log(`[Trefle Import]   ✓ Updated: ${plant.common_name || plant.scientific_name} (merged with existing)`)
          stats.updated++
        }
      } catch (error: any) {
        console.error(`[Trefle Import]   ❌ Error processing ${plant.common_name || plant.scientific_name}:`, error.message)
        stats.errors++
      }
    }

    return stats
  } catch (error: any) {
    console.error(`[Trefle Import] Failed to import page ${page}:`, error.message)
    stats.errors++
    return stats
  }
}

/**
 * Main import function
 */
export async function importTrefleData(): Promise<void> {
  if (!ENABLE_IMPORT) {
    console.log('[Trefle Import] Import disabled (ENABLE_TREFLE_IMPORT=false)')
    return
  }

  if (!trefleClientEnhanced.isConfigured()) {
    console.log('[Trefle Import] Trefle API key not configured')
    return
  }

  const payload = await getPayload({ config })

  try {
    console.log('[Trefle Import] 🌱 Starting progressive import...')

    // Get current state
    const state = await getImportState(payload)

    if (state.isComplete) {
      console.log('[Trefle Import] Import already complete!')
      return
    }

    console.log(`[Trefle Import] 📄 Resuming from page ${state.currentPage}`)

    // Import multiple pages
    let totalCreated = 0
    let totalUpdated = 0
    let totalSkipped = 0
    let totalErrors = 0

    for (let i = 0; i < PAGES_PER_RUN; i++) {
      const currentPage = state.currentPage + i

      const stats = await importPage(payload, currentPage)

      totalCreated += stats.created
      totalUpdated += stats.updated
      totalSkipped += stats.skipped
      totalErrors += stats.errors
    }

    // Update state
    const newPage = state.currentPage + PAGES_PER_RUN

    await updateImportState(payload, {
      currentPage: newPage,
      herbsCreated: state.herbsCreated + totalCreated,
      herbsUpdated: state.herbsUpdated + totalUpdated,
      herbsSkipped: state.herbsSkipped + totalSkipped,
      errors: state.errors + totalErrors,
    })

    // Get statistics from enhanced client
    const apiStats = trefleClientEnhanced.getStats()
    const circuitState = trefleClientEnhanced.getCircuitState()

    // Log to ImportLogs collection
    await payload.create({
      collection: 'importLogs',
      data: {
        type: 'Trefle Progressive Import',
        source: 'Trefle API',
        status: totalErrors > 0 ? 'partial' : 'success',
        recordsProcessed: totalCreated + totalUpdated + totalSkipped,
        recordsImported: totalCreated + totalUpdated,
        recordsFailed: totalErrors,
        startedAt: new Date(),
        completedAt: new Date(),
        details: `Page ${state.currentPage} to ${newPage - 1}: Created ${totalCreated}, Updated ${totalUpdated}, Skipped ${totalSkipped}, Errors ${totalErrors}. Circuit: ${circuitState}, Success Rate: ${((apiStats.successfulRequests / apiStats.totalRequests) * 100).toFixed(1)}%`,
      },
    })

    console.log(`[Trefle Import] ✅ Batch complete:`)
    console.log(`   Created: ${totalCreated}`)
    console.log(`   Updated: ${totalUpdated}`)
    console.log(`   Skipped: ${totalSkipped}`)
    console.log(`   Errors: ${totalErrors}`)
    console.log(`   Next page: ${newPage}`)
    console.log(`   API Stats:`)
    console.log(`     - Total Requests: ${apiStats.totalRequests}`)
    console.log(`     - Success Rate: ${((apiStats.successfulRequests / apiStats.totalRequests) * 100).toFixed(1)}%`)
    console.log(`     - Circuit State: ${circuitState}`)
  } catch (error: any) {
    console.error('[Trefle Import] Import failed:', error)

    // Log error
    await payload.create({
      collection: 'importLogs',
      data: {
        type: 'Trefle Import Error',
        source: 'Trefle API',
        status: 'error',
        recordsProcessed: 0,
        recordsImported: 0,
        recordsFailed: 1,
        startedAt: new Date(),
        completedAt: new Date(),
        errorMessage: error.message,
        details: error.stack,
      },
    })
  }
}

/**
 * Get import progress
 */
export async function getTrefleImportProgress(payload: any): Promise<{
  currentPage: number
  isComplete: boolean
  herbsCreated: number
  herbsUpdated: number
  lastRunAt: Date
  estimatedPlantsRemaining: number
  circuitState: string
  apiStats: any
}> {
  const state = await getImportState(payload)

  // Estimate plants remaining (assuming ~1,000,000 total plants)
  const estimatedTotal = 1000000
  const plantsProcessed = (state.currentPage - 1) * PAGE_SIZE
  const plantsRemaining = Math.max(0, estimatedTotal - plantsProcessed)

  return {
    currentPage: state.currentPage,
    isComplete: state.isComplete,
    herbsCreated: state.herbsCreated,
    herbsUpdated: state.herbsUpdated,
    lastRunAt: state.lastRunAt,
    estimatedPlantsRemaining: plantsRemaining,
    circuitState: trefleClientEnhanced.getCircuitState(),
    apiStats: trefleClientEnhanced.getStats(),
  }
}

/**
 * Reset import state (start over)
 */
export async function resetTrefleImport(payload: any): Promise<void> {
  await updateImportState(payload, {
    currentPage: 1,
    totalPlants: 0,
    herbsCreated: 0,
    herbsUpdated: 0,
    herbsSkipped: 0,
    isComplete: false,
    errors: 0,
  })

  console.log('[Trefle Import] Import state reset - will restart from page 1')
}

/**
 * Schedule the cron job
 */
export function scheduleTrefleImport(): void {
  if (!ENABLE_IMPORT) {
    console.log('[Trefle Import] Cron job not scheduled (import disabled)')
    return
  }

  if (!trefleClientEnhanced.isConfigured()) {
    console.log('[Trefle Import] Cron job not scheduled (API key not configured)')
    return
  }

  console.log('[Trefle Import] ✓ Scheduled: Import Trefle Plant Database (every minute)')
}
