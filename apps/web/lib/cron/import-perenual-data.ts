/**
 * Perenual Plant Database Import Cron Job
 *
 * Progressively imports plant data from Perenual API into PayloadCMS
 * Enriches existing herbs with cultivation and pest management data
 *
 * Schedule: Every minute (when enabled)
 * - Imports ~40 plants per run (2 pages × 20 plants)
 * - Completes full 10,000+ plant import in ~5 hours
 * - Automatically resumes from last position on restart
 * - Smart deduplication merges with existing herbs
 *
 * Enable: Set ENABLE_PERENUAL_IMPORT=true in .env
 *
 * Features:
 * - Progressive state tracking
 * - Rate limiting (1 second between requests)
 * - **Enhanced retry logic with exponential backoff** (NEW)
 * - **Timeout handling (10 second default)** (NEW)
 * - **Circuit breaker pattern to prevent cascading failures** (NEW)
 * - **Retry statistics tracking** (NEW)
 * - Automatic retry on errors
 * - Deduplication with Trefle imports
 * - Creates herbs as drafts for review
 * - Logs import progress to ImportLogs collection
 *
 * @see docs/PERENUAL_INTEGRATION.md
 * @see docs/API_RETRY_LOGIC.md for retry strategy details
 */

import cron from 'node-cron'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  perenualClientEnhanced as perenualClient,
  type PerenualSpeciesDetail,
} from '@/lib/perenual'
import { createOrUpdateHerb } from '@/lib/herbDeduplication'

const ENABLE_IMPORT = process.env.ENABLE_PERENUAL_IMPORT === 'true'
const PAGES_PER_RUN = 2 // Import 2 pages per run (40 plants)
const PAGE_SIZE = 20 // Perenual's default page size

/**
 * Import state tracking
 */
interface PerenualImportState {
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
async function getImportState(payload: any): Promise<PerenualImportState> {
  try {
    const globalData = await payload.findGlobal({
      slug: 'perenualImportState',
    })

    if (globalData) {
      return globalData as PerenualImportState
    }
  } catch (error) {
    console.log('[Perenual Import] No existing state found, creating new')
  }

  // Create initial state
  const initialState: PerenualImportState = {
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
async function updateImportState(payload: any, state: Partial<PerenualImportState>): Promise<void> {
  try {
    await payload.updateGlobal({
      slug: 'perenualImportState',
      data: {
        ...state,
        lastRunAt: new Date(),
      },
    })
  } catch (error) {
    console.error('[Perenual Import] Failed to update state:', error)
  }
}

/**
 * Map Perenual species to Payload Herb schema
 */
function mapPerenualToHerb(species: PerenualSpeciesDetail): any {
  const enrichmentData = perenualClient.extractEnrichmentData(species)

  // Build herb object
  const herb: any = {
    title: species.common_name,
    slug: species.common_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),

    description: species.description || undefined,

    botanicalInfo: {
      scientificName: species.scientific_name[0] || species.common_name,
      family: enrichmentData.family,
      perenualId: enrichmentData.perenualId,
      lastPerenualSyncAt: enrichmentData.lastPerenualSyncAt,
      synonyms: species.scientific_name.slice(1), // Additional scientific names as synonyms
      origin: enrichmentData.origin,

      perenualData: {
        medicinal: enrichmentData.medicinal,
        edible: enrichmentData.edible,
        poisonous: enrichmentData.poisonous,
        attracts: enrichmentData.attracts,
        dimension: species.dimension,
        type: species.type,
        flowerColor: species.flower_color,
        leafColor: species.leaf_color,
      },
    },

    cultivation: {
      cycle: enrichmentData.cultivation.cycle,
      watering: enrichmentData.cultivation.watering,
      wateringPeriod: enrichmentData.cultivation.wateringPeriod,
      sunlight: enrichmentData.cultivation.sunlight,
      soil: enrichmentData.cultivation.soil,
      hardiness: enrichmentData.cultivation.hardiness,
      maintenance: enrichmentData.cultivation.maintenance,
      careLevel: enrichmentData.cultivation.careLevel,
      growthRate: enrichmentData.cultivation.growthRate,
      indoor: enrichmentData.cultivation.indoor,
      droughtTolerant: enrichmentData.cultivation.droughtTolerant,
      saltTolerant: enrichmentData.cultivation.saltTolerant,
      propagation: enrichmentData.cultivation.propagation,
    },

    cultivation_notes: buildCultivationNotes(species),
    pest_management: buildPestManagement(species),

    safetyInfo: {
      warnings: buildSafetyWarnings(enrichmentData),
    },
  }

  // Add image if available
  if (enrichmentData.imageUrl) {
    herb.photoGallery = [
      {
        url: enrichmentData.imageUrl,
        caption: `${species.common_name} - from Perenual plant database`,
        type: 'photograph',
        source: 'Perenual',
      },
    ]
  }

  return herb
}

/**
 * Build cultivation notes from species data
 */
function buildCultivationNotes(species: PerenualSpeciesDetail): string {
  const notes: string[] = []

  notes.push('# Cultivation Guide\n')

  if (species.watering) {
    notes.push(`**Watering:** ${species.watering}`)
    if (species.watering_period) {
      notes.push(`  - Period: ${species.watering_period}`)
    }
  }

  if (species.sunlight && species.sunlight.length > 0) {
    notes.push(`\n**Sunlight:** ${species.sunlight.join(', ')}`)
  }

  if (species.soil && species.soil.length > 0) {
    notes.push(`\n**Soil:** ${species.soil.join(', ')}`)
  }

  if (species.hardiness?.min && species.hardiness?.max) {
    notes.push(`\n**Hardiness Zones:** ${species.hardiness.min} - ${species.hardiness.max}`)
  }

  if (species.care_level) {
    notes.push(`\n**Care Level:** ${species.care_level}`)
  }

  if (species.maintenance) {
    notes.push(`**Maintenance:** ${species.maintenance}`)
  }

  if (species.growth_rate) {
    notes.push(`**Growth Rate:** ${species.growth_rate}`)
  }

  if (species.propagation && species.propagation.length > 0) {
    notes.push(`\n**Propagation Methods:** ${species.propagation.join(', ')}`)
  }

  if (species.indoor) {
    notes.push(`\n✓ **Can be grown indoors**`)
  }

  if (species.drought_tolerant) {
    notes.push(`✓ **Drought tolerant**`)
  }

  if (species.salt_tolerant) {
    notes.push(`✓ **Salt tolerant**`)
  }

  if (species.attracts && species.attracts.length > 0) {
    notes.push(`\n**Attracts:** ${species.attracts.join(', ')}`)
  }

  return notes.join('\n')
}

/**
 * Build pest management information
 */
function buildPestManagement(species: PerenualSpeciesDetail): string | undefined {
  if (!species.pest_susceptibility || species.pest_susceptibility.length === 0) {
    return undefined
  }

  const pests: string[] = []

  pests.push('# Common Pests and Diseases\n')
  pests.push('This plant may be susceptible to the following pests and diseases:\n')

  for (const pest of species.pest_susceptibility) {
    pests.push(`- ${pest}`)
  }

  pests.push('\n*Note: For detailed pest information and treatment solutions, see the care guide.*')

  return pests.join('\n')
}

/**
 * Build safety warnings
 */
function buildSafetyWarnings(enrichmentData: ReturnType<typeof perenualClient.extractEnrichmentData>): string[] {
  const warnings: string[] = []

  if (enrichmentData.poisonous.toHumans) {
    warnings.push('⚠️ **Toxic to humans** - Do not ingest')
  } else {
    warnings.push('✓ Non-toxic to humans')
  }

  if (enrichmentData.poisonous.toPets) {
    warnings.push('⚠️ **Toxic to pets** - Keep away from animals')
  } else {
    warnings.push('✓ Non-toxic to pets')
  }

  if (enrichmentData.medicinal) {
    warnings.push('ℹ️ **Medicinal plant** - Consult healthcare provider before use')
  }

  if (enrichmentData.edible) {
    warnings.push('✓ Edible plant')
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
    console.log(`[Perenual Import] 📖 Fetching page ${page}...`)

    // Fetch page from Perenual API
    const response = await perenualClient.getSpeciesList(page, PAGE_SIZE)

    if (!response.data || response.data.length === 0) {
      console.log(`[Perenual Import] Page ${page} is empty`)
      return stats
    }

    console.log(`[Perenual Import]    Found ${response.data.length} plants`)

    // Process each species
    for (const species of response.data) {
      try {
        // Fetch detailed species data
        const detailsResponse = await perenualClient.getSpeciesDetails(species.id)

        // Filter out non-medicinal plants (optional)
        const filterNonMedicinal = process.env.PERENUAL_FILTER_MEDICINAL === 'true'
        if (filterNonMedicinal && !detailsResponse.medicinal) {
          console.log(`[Perenual Import]   ⊘ Skipped: ${species.common_name} (not medicinal)`)
          stats.skipped++
          continue
        }

        // Map to herb schema
        const herbData = mapPerenualToHerb(detailsResponse)

        // Create or update herb with deduplication
        const result = await createOrUpdateHerb(payload, herbData, 'perenual')

        if (result.created) {
          console.log(`[Perenual Import]   ✅ Created: ${species.common_name}`)
          stats.created++
        } else {
          console.log(`[Perenual Import]   ✓ Updated: ${species.common_name} (merged with existing)`)
          stats.updated++
        }
      } catch (error: any) {
        console.error(`[Perenual Import]   ❌ Error processing ${species.common_name}:`, error.message)
        stats.errors++
      }
    }

    return stats
  } catch (error: any) {
    console.error(`[Perenual Import] Failed to import page ${page}:`, error.message)
    stats.errors++
    return stats
  }
}

/**
 * Main import function
 */
export async function importPerenualData(): Promise<void> {
  if (!ENABLE_IMPORT) {
    console.log('[Perenual Import] Import disabled (ENABLE_PERENUAL_IMPORT=false)')
    return
  }

  if (!perenualClient.isConfigured()) {
    console.log('[Perenual Import] Perenual API key not configured')
    return
  }

  const payload = await getPayload({ config })

  try {
    console.log('[Perenual Import] 🌱 Starting progressive import...')

    // Get current state
    const state = await getImportState(payload)

    if (state.isComplete) {
      console.log('[Perenual Import] Import already complete!')
      return
    }

    console.log(`[Perenual Import] 📄 Resuming from page ${state.currentPage}`)

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

    // Log to ImportLogs collection
    await payload.create({
      collection: 'importLogs',
      data: {
        type: 'Perenual Progressive Import',
        source: 'Perenual API',
        status: totalErrors > 0 ? 'partial' : 'success',
        recordsProcessed: totalCreated + totalUpdated + totalSkipped,
        recordsImported: totalCreated + totalUpdated,
        recordsFailed: totalErrors,
        startedAt: new Date(),
        completedAt: new Date(),
        details: `Page ${state.currentPage} to ${newPage - 1}: Created ${totalCreated}, Updated ${totalUpdated}, Skipped ${totalSkipped}, Errors ${totalErrors}`,
      },
    })

    console.log(`[Perenual Import] ✅ Batch complete:`)
    console.log(`   Created: ${totalCreated}`)
    console.log(`   Updated: ${totalUpdated}`)
    console.log(`   Skipped: ${totalSkipped}`)
    console.log(`   Errors: ${totalErrors}`)
    console.log(`   Next page: ${newPage}`)
  } catch (error: any) {
    console.error('[Perenual Import] Import failed:', error)

    // Log error
    await payload.create({
      collection: 'importLogs',
      data: {
        type: 'Perenual Sync Error',
        source: 'Perenual API',
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
export async function getPerenualImportProgress(payload: any): Promise<{
  currentPage: number
  isComplete: boolean
  herbsCreated: number
  herbsUpdated: number
  lastRunAt: Date
  estimatedPlantsRemaining: number
  circuitState: string
  apiStats: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    retriedRequests: number
    totalRetries: number
    timeoutErrors: number
    networkErrors: number
    rateLimitErrors: number
    circuitBreakerTrips: number
    avgResponseTimeMs: number
  }
}> {
  const state = await getImportState(payload)

  // Estimate plants remaining (assuming ~10,000 total plants)
  const estimatedTotal = 10000
  const plantsProcessed = (state.currentPage - 1) * PAGE_SIZE
  const plantsRemaining = Math.max(0, estimatedTotal - plantsProcessed)

  // Get client stats
  const apiStats = perenualClient.getStats()
  const circuitState = perenualClient.getCircuitState()

  return {
    currentPage: state.currentPage,
    isComplete: state.isComplete,
    herbsCreated: state.herbsCreated,
    herbsUpdated: state.herbsUpdated,
    lastRunAt: state.lastRunAt,
    estimatedPlantsRemaining: plantsRemaining,
    circuitState,
    apiStats,
  }
}

/**
 * Reset import state (start over)
 */
export async function resetPerenualImport(payload: any): Promise<void> {
  await updateImportState(payload, {
    currentPage: 1,
    totalPlants: 0,
    herbsCreated: 0,
    herbsUpdated: 0,
    herbsSkipped: 0,
    isComplete: false,
    errors: 0,
  })

  console.log('[Perenual Import] Import state reset - will restart from page 1')
}

/**
 * Schedule the cron job
 */
export function schedulePerenualImport(): void {
  if (!ENABLE_IMPORT) {
    console.log('[Perenual Import] Cron job not scheduled (import disabled)')
    return
  }

  if (!perenualClient.isConfigured()) {
    console.log('[Perenual Import] Cron job not scheduled (API key not configured)')
    return
  }

  // Run every minute
  cron.schedule('* * * * *', async () => {
    console.log('[Perenual Import] Cron job triggered')
    await importPerenualData()
  })

  console.log('[Perenual Import] ✓ Scheduled: Import Perenual Plant Database (every minute)')
}
