/**
 * Algolia Index Sync Cron Job
 *
 * Periodically syncs all Payload collections to Algolia search indexes.
 * Ensures search indexes stay up-to-date even if real-time hooks fail.
 *
 * Schedule: Every 6 hours
 * Collections: herbs, formulas, conditions, practitioners
 *
 * Note: Real-time sync via Payload hooks is the primary mechanism.
 * This cron job serves as a backup to catch any missed updates and
 * handle bulk re-indexing scenarios.
 *
 * Usage:
 *   - Add to cron/index.ts for automatic scheduling
 *   - Or run manually: pnpm tsx lib/cron/sync-algolia.ts
 *   - Or run via API: POST /api/cron/sync-algolia
 */

import cron from 'node-cron'
import { getPayload } from 'payload'
import config from '@payload-config'
import { bulkIndexToAlgolia, ALGOLIA_SETTINGS, configureAlgoliaIndex } from '@/payload/hooks/algolia-sync'

/**
 * Collections to sync to Algolia
 */
const COLLECTIONS_TO_SYNC = [
  'herbs',
  'formulas',
  'conditions',
  'practitioners',
] as const

/**
 * Batch size for bulk indexing
 * Smaller batches reduce memory usage but take longer
 */
const BATCH_SIZE = parseInt(process.env.ALGOLIA_SYNC_BATCH_SIZE || '100', 10)

/**
 * Interface for sync result
 */
interface SyncResult {
  collection: string
  indexed: number
  errors: number
  duration: number
  success: boolean
  error?: string
}

/**
 * Interface for overall sync summary
 */
interface SyncSummary {
  totalCollections: number
  successfulCollections: number
  failedCollections: number
  totalIndexed: number
  totalErrors: number
  totalDuration: number
  results: SyncResult[]
}

/**
 * Sync a single collection to Algolia
 */
async function syncCollection(payload: any, collectionSlug: string): Promise<SyncResult> {
  const startTime = Date.now()

  try {
    console.log(`[Algolia Sync] 🔄 Syncing ${collectionSlug}...`)

    // First, ensure index settings are configured
    const settings = ALGOLIA_SETTINGS[collectionSlug as keyof typeof ALGOLIA_SETTINGS]
    if (settings) {
      await configureAlgoliaIndex(collectionSlug, settings)
      console.log(`[Algolia Sync]    ✅ Index settings configured for ${collectionSlug}`)
    }

    // Bulk index all published documents
    const { indexed, errors } = await bulkIndexToAlgolia(payload, collectionSlug, BATCH_SIZE)

    const duration = Date.now() - startTime
    const success = errors === 0

    console.log(
      `[Algolia Sync] ${success ? '✅' : '⚠️'} ${collectionSlug}: ${indexed} indexed, ${errors} errors (${duration}ms)`
    )

    return {
      collection: collectionSlug,
      indexed,
      errors,
      duration,
      success,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error(`[Algolia Sync] ❌ ${collectionSlug} failed:`, errorMessage)

    return {
      collection: collectionSlug,
      indexed: 0,
      errors: 0,
      duration,
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Run full Algolia sync across all collections
 */
async function runAlgoliaSync(): Promise<SyncSummary> {
  const syncStartTime = Date.now()

  console.log(`[Algolia Sync] 🚀 Starting Algolia index sync...`)
  console.log(`[Algolia Sync]    Collections: ${COLLECTIONS_TO_SYNC.join(', ')}`)
  console.log(`[Algolia Sync]    Batch size: ${BATCH_SIZE}`)
  console.log(`[Algolia Sync]    Environment: ${process.env.NODE_ENV || 'development'}`)

  try {
    // Get Payload instance
    const payload = await getPayload({ config })

    // Sync each collection sequentially to avoid overwhelming Algolia API
    const results: SyncResult[] = []

    for (const collection of COLLECTIONS_TO_SYNC) {
      const result = await syncCollection(payload, collection)
      results.push(result)

      // Small delay between collections to respect rate limits
      if (collection !== COLLECTIONS_TO_SYNC[COLLECTIONS_TO_SYNC.length - 1]) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    // Calculate summary statistics
    const totalDuration = Date.now() - syncStartTime
    const successfulCollections = results.filter((r) => r.success).length
    const failedCollections = results.filter((r) => !r.success).length
    const totalIndexed = results.reduce((sum, r) => sum + r.indexed, 0)
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0)

    const summary: SyncSummary = {
      totalCollections: COLLECTIONS_TO_SYNC.length,
      successfulCollections,
      failedCollections,
      totalIndexed,
      totalErrors,
      totalDuration,
      results,
    }

    // Log summary
    console.log(`\n[Algolia Sync] ✅ Sync complete!`)
    console.log(`[Algolia Sync]    Total collections: ${summary.totalCollections}`)
    console.log(`[Algolia Sync]    Successful: ${summary.successfulCollections}`)
    console.log(`[Algolia Sync]    Failed: ${summary.failedCollections}`)
    console.log(`[Algolia Sync]    Total indexed: ${summary.totalIndexed}`)
    console.log(`[Algolia Sync]    Total errors: ${summary.totalErrors}`)
    console.log(`[Algolia Sync]    Duration: ${summary.totalDuration}ms`)

    // Send monitoring event if configured
    await sendMonitoringEvent({
      event: 'algolia_sync_complete',
      summary,
      timestamp: new Date().toISOString(),
    })

    return summary
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Algolia Sync] ❌ Sync failed:`, error)

    // Send error alert
    await sendMonitoringEvent({
      event: 'algolia_sync_error',
      error: errorMessage,
      timestamp: new Date().toISOString(),
    })

    throw error
  }
}

/**
 * Send monitoring/alerting event
 */
async function sendMonitoringEvent(data: any): Promise<void> {
  const webhookUrl = process.env.MONITORING_WEBHOOK_URL

  if (!webhookUrl) {
    return // Monitoring not configured
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (error) {
    // Don't throw - monitoring failures shouldn't block the sync
    console.error('[Algolia Sync] Failed to send monitoring event:', error)
  }
}

/**
 * Schedule Algolia sync job
 *
 * Runs every 6 hours: 12:00 AM, 6:00 AM, 12:00 PM, 6:00 PM
 */
export function scheduleAlgoliaSync() {
  // Cron expression: "0 */6 * * *" = Every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      await runAlgoliaSync()
    } catch (error) {
      console.error('[Algolia Sync] Scheduled sync failed:', error)
      // Error already logged in runAlgoliaSync
    }
  })

  console.log(`[Algolia Sync] ✅ Sync job scheduled (every 6 hours, batch size: ${BATCH_SIZE})`)
}

/**
 * Run sync immediately (for manual execution)
 */
if (require.main === module) {
  runAlgoliaSync()
    .then((summary) => {
      console.log('\n[Algolia Sync] Manual sync completed successfully')
      console.log(JSON.stringify(summary, null, 2))
      process.exit(summary.failedCollections > 0 ? 1 : 0)
    })
    .catch((error) => {
      console.error('\n[Algolia Sync] Manual sync failed:', error)
      process.exit(1)
    })
}

export { runAlgoliaSync, syncCollection, type SyncResult, type SyncSummary }
