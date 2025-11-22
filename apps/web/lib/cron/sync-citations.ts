/**
 * Citation Sync Cron Job
 *
 * Automatically fetches and updates evidence-based research citations from PubMed
 * for herbs and formulas. Runs weekly to keep citations current.
 *
 * Schedule: Weekly on Sunday at 2:00 AM
 * Rate Limit: Respects PubMed API limits (3 req/s without key, 10 req/s with key)
 *
 * Environment Variables:
 * - NCBI_API_KEY: Optional API key for higher rate limits
 * - CITATION_SYNC_ENABLED: Set to 'false' to disable (default: true)
 * - CITATION_SYNC_SCHEDULE: Custom cron schedule (default: '0 2 * * 0')
 * - CITATION_MAX_PER_RUN: Max items to process per run (default: 50)
 */

import * as cron from 'node-cron'
import {
  fetchHerbCitations,
  fetchFormulaCitations,
  updateHerbCitations,
  updateFormulaCitations,
  needsCitationRefresh,
  getCitationStats,
} from '../citations'
import { getPayload } from 'payload'
import config from '@payload-config'

// ============================================================================
// Configuration
// ============================================================================

const ENABLED = process.env.CITATION_SYNC_ENABLED !== 'false'
const SCHEDULE = process.env.CITATION_SYNC_SCHEDULE || '0 2 * * 0' // Sunday at 2 AM
const MAX_PER_RUN = parseInt(process.env.CITATION_MAX_PER_RUN || '50', 10)
const DELAY_BETWEEN_ITEMS_MS = 500 // Be polite to PubMed API

// ============================================================================
// Citation Sync Job
// ============================================================================

/**
 * Sync citations for herbs that need updating
 */
async function syncHerbCitations(): Promise<{
  processed: number
  updated: number
  failed: number
  errors: string[]
}> {
  console.log('[Citation Sync] Starting herb citation sync...')

  const result = {
    processed: 0,
    updated: 0,
    failed: 0,
    errors: [] as string[],
  }

  try {
    const payload = await getPayload({ config })

    // Get published herbs that need citation updates
    const herbs = await payload.find({
      collection: 'herbs',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: MAX_PER_RUN * 2, // Get more than we need so we can filter
      sort: '-updatedAt', // Newest first
    })

    console.log(`[Citation Sync] Found ${herbs.docs.length} published herbs`)

    // Filter to herbs that need updates (>24 hours old or no citations)
    const herbsToUpdate = herbs.docs
      .filter((herb) => {
        const lastUpdated = herb.citationsLastUpdated as string | undefined
        return needsCitationRefresh(lastUpdated)
      })
      .slice(0, MAX_PER_RUN) // Limit to max per run

    console.log(
      `[Citation Sync] ${herbsToUpdate.length} herbs need citation updates (max: ${MAX_PER_RUN})`
    )

    // Process each herb
    for (const herb of herbsToUpdate) {
      try {
        console.log(`[Citation Sync] Fetching citations for: ${herb.title}`)

        const herbId = String(herb.id)

        // Fetch citations from PubMed
        const citations = await fetchHerbCitations(herbId, {
          maxResults: 10,
          minYear: 2010,
          qualityThreshold: 60,
        })

        if (citations.length > 0) {
          // Update herb with citations
          await updateHerbCitations(herbId, citations)
          console.log(`[Citation Sync] ✓ Updated ${herb.title} with ${citations.length} citations`)
          result.updated++
        } else {
          console.log(`[Citation Sync] ○ No citations found for ${herb.title}`)
        }

        result.processed++

        // Delay between items to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_ITEMS_MS))
      } catch (error) {
        const errorMsg = `Failed to sync citations for ${herb.title}: ${error}`
        console.error(`[Citation Sync] ✗ ${errorMsg}`)
        result.errors.push(errorMsg)
        result.failed++
      }
    }

    console.log(
      `[Citation Sync] Herb sync complete: ${result.processed} processed, ${result.updated} updated, ${result.failed} failed`
    )

    return result
  } catch (error) {
    console.error('[Citation Sync] Herb sync error:', error)
    throw error
  }
}

/**
 * Sync citations for formulas that need updating
 */
async function syncFormulaCitations(): Promise<{
  processed: number
  updated: number
  failed: number
  errors: string[]
}> {
  console.log('[Citation Sync] Starting formula citation sync...')

  const result = {
    processed: 0,
    updated: 0,
    failed: 0,
    errors: [] as string[],
  }

  try {
    const payload = await getPayload({ config })

    // Get published formulas that need citation updates
    const formulas = await payload.find({
      collection: 'formulas',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: MAX_PER_RUN * 2,
      sort: '-updatedAt',
    })

    console.log(`[Citation Sync] Found ${formulas.docs.length} published formulas`)

    // Filter to formulas that need updates
    const formulasToUpdate = formulas.docs
      .filter((formula) => {
        const lastUpdated = formula.citationsLastUpdated as string | undefined
        return needsCitationRefresh(lastUpdated)
      })
      .slice(0, MAX_PER_RUN)

    console.log(
      `[Citation Sync] ${formulasToUpdate.length} formulas need citation updates (max: ${MAX_PER_RUN})`
    )

    // Process each formula
    for (const formula of formulasToUpdate) {
      try {
        console.log(`[Citation Sync] Fetching citations for: ${formula.title}`)

        const formulaId = String(formula.id)

        // Fetch citations from PubMed
        const citations = await fetchFormulaCitations(formulaId, {
          maxResults: 10,
          minYear: 2010,
          qualityThreshold: 60,
        })

        if (citations.length > 0) {
          // Update formula with citations
          await updateFormulaCitations(formulaId, citations)
          console.log(
            `[Citation Sync] ✓ Updated ${formula.title} with ${citations.length} citations`
          )
          result.updated++
        } else {
          console.log(`[Citation Sync] ○ No citations found for ${formula.title}`)
        }

        result.processed++

        // Delay between items
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_ITEMS_MS))
      } catch (error) {
        const errorMsg = `Failed to sync citations for ${formula.title}: ${error}`
        console.error(`[Citation Sync] ✗ ${errorMsg}`)
        result.errors.push(errorMsg)
        result.failed++
      }
    }

    console.log(
      `[Citation Sync] Formula sync complete: ${result.processed} processed, ${result.updated} updated, ${result.failed} failed`
    )

    return result
  } catch (error) {
    console.error('[Citation Sync] Formula sync error:', error)
    throw error
  }
}

/**
 * Run complete citation sync job
 */
async function runCitationSync(): Promise<void> {
  console.log('\n[Citation Sync] ========================================')
  console.log('[Citation Sync] Starting weekly citation sync job')
  console.log('[Citation Sync] ========================================\n')

  const startTime = Date.now()

  try {
    // Get initial stats
    console.log('[Citation Sync] Current statistics:')
    const herbStats = await getCitationStats('herbs')
    const formulaStats = await getCitationStats('formulas')

    console.log(
      `[Citation Sync]   Herbs: ${herbStats.withCitations}/${herbStats.total} have citations (${herbStats.totalCitations} total, avg ${herbStats.avgCitationsPerDoc.toFixed(1)} per herb)`
    )
    console.log(
      `[Citation Sync]   Formulas: ${formulaStats.withCitations}/${formulaStats.total} have citations (${formulaStats.totalCitations} total, avg ${formulaStats.avgCitationsPerDoc.toFixed(1)} per formula)`
    )
    console.log('')

    // Sync herbs
    const herbResult = await syncHerbCitations()

    // Sync formulas
    const formulaResult = await syncFormulaCitations()

    // Get final stats
    console.log('\n[Citation Sync] Final statistics:')
    const finalHerbStats = await getCitationStats('herbs')
    const finalFormulaStats = await getCitationStats('formulas')

    console.log(
      `[Citation Sync]   Herbs: ${finalHerbStats.withCitations}/${finalHerbStats.total} have citations (${finalHerbStats.totalCitations} total, avg ${finalHerbStats.avgCitationsPerDoc.toFixed(1)} per herb)`
    )
    console.log(
      `[Citation Sync]   Formulas: ${finalFormulaStats.withCitations}/${finalFormulaStats.total} have citations (${finalFormulaStats.totalCitations} total, avg ${finalFormulaStats.avgCitationsPerDoc.toFixed(1)} per formula)`
    )

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log('\n[Citation Sync] ========================================')
    console.log('[Citation Sync] Citation sync complete!')
    console.log(`[Citation Sync]   Total processed: ${herbResult.processed + formulaResult.processed}`)
    console.log(`[Citation Sync]   Total updated: ${herbResult.updated + formulaResult.updated}`)
    console.log(`[Citation Sync]   Total failed: ${herbResult.failed + formulaResult.failed}`)
    console.log(`[Citation Sync]   Duration: ${duration}s`)
    console.log('[Citation Sync] ========================================\n')

    // Log errors if any
    if (herbResult.errors.length > 0 || formulaResult.errors.length > 0) {
      console.error('[Citation Sync] Errors:')
      for (const error of [...herbResult.errors, ...formulaResult.errors]) {
        console.error(`[Citation Sync]   - ${error}`)
      }
    }
  } catch (error) {
    console.error('[Citation Sync] Fatal error:', error)
    throw error
  }
}

/**
 * Schedule citation sync cron job
 */
export function scheduleCitationSync(): void {
  if (!ENABLED) {
    console.log('[Citation Sync] Citation sync is disabled (CITATION_SYNC_ENABLED=false)')
    return
  }

  console.log(`[Citation Sync] Scheduling citation sync: ${SCHEDULE}`)
  console.log(`[Citation Sync] Max items per run: ${MAX_PER_RUN}`)
  console.log(`[Citation Sync] API key: ${process.env.NCBI_API_KEY ? 'configured' : 'not set (using rate-limited access)'}`)

  cron.schedule(SCHEDULE, async () => {
    try {
      await runCitationSync()
    } catch (error) {
      console.error('[Citation Sync] Cron job failed:', error)
      // TODO: Send notification (email/Slack) about sync failure
    }
  })

  console.log('[Citation Sync] Citation sync cron job scheduled')
}

/**
 * Run citation sync immediately (for testing)
 */
export async function runCitationSyncNow(): Promise<void> {
  if (!ENABLED) {
    throw new Error('Citation sync is disabled')
  }

  return runCitationSync()
}

/**
 * Manual execution support
 * Usage: pnpm tsx lib/cron/sync-citations.ts
 */
if (require.main === module) {
  console.log('[Citation Sync] Manual execution mode\n')

  runCitationSyncNow()
    .then(() => {
      console.log('[Citation Sync] ✅ Manual sync complete')
      process.exit(0)
    })
    .catch((error) => {
      console.error('[Citation Sync] ❌ Manual sync failed:', error)
      process.exit(1)
    })
}
