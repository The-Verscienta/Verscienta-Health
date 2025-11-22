/**
 * Sync Trefle Botanical Data Cron Job
 *
 * Enriches existing herbs with data from the Trefle botanical database (1M+ species).
 * Runs weekly to update herbs with scientific validation, distribution data, and toxicity info.
 *
 * Schedule: Every Wednesday at 3:00 AM
 * Processing: 100 herbs per run
 * Priority: Never synced OR last synced > 30 days ago
 *
 * Features:
 * - Scientific name validation against Trefle database
 * - Distribution data (native/introduced regions)
 * - Toxicity and edibility information
 * - Plant images, taxonomy, growth data
 * - Enhanced retry logic with circuit breaker
 * - Statistics tracking
 *
 * @see docs/TREFLE_RETRY_LOGIC.md
 * @see docs/TREFLE_INTEGRATION.md
 */

import cron from 'node-cron'
import { getPayload } from 'payload'
import config from '@payload-config'
import { trefleClientEnhanced } from '@/lib/trefle'

const HERBS_PER_RUN = 100 // Process 100 herbs per run
const SYNC_INTERVAL_DAYS = 30 // Re-sync herbs older than 30 days

/**
 * Sync single herb with Trefle data
 */
export async function syncSingleHerbWithTrefle(
  payload: any,
  herbId: string
): Promise<{ success: boolean; message: string; enrichedData?: any }> {
  try {
    if (!trefleClientEnhanced.isConfigured()) {
      return { success: false, message: 'Trefle client not configured' }
    }

    // Get herb data
    const herb = await payload.findByID({
      collection: 'herbs',
      id: herbId,
    })

    if (!herb || !herb.botanicalInfo?.scientificName) {
      return { success: false, message: 'Herb not found or missing scientific name' }
    }

    // Skip if recently synced (within 30 days)
    const lastSynced = herb.botanicalInfo?.lastTrefleSyncAt
    if (lastSynced) {
      const daysSinceSync = Math.floor(
        (Date.now() - new Date(lastSynced).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceSync < SYNC_INTERVAL_DAYS) {
        return {
          success: true,
          message: `Skipped: Last synced ${daysSinceSync} days ago`,
        }
      }
    }

    console.log(`[Trefle Sync] 🔄 Syncing herb: ${herb.title} (${herb.botanicalInfo.scientificName})`)

    // Enrich with Trefle data
    const enrichedData = await trefleClientEnhanced.enrichHerbData({
      scientificName: herb.botanicalInfo.scientificName,
      name: herb.title,
    })

    if (!enrichedData) {
      // Log validation report for manual review
      await payload.create({
        collection: 'validationReports',
        data: {
          type: 'Trefle Name Mismatch',
          collectionType: 'Herb',
          documentId: herbId,
          field: 'scientificName',
          currentValue: herb.botanicalInfo.scientificName,
          suggestedValue: null,
          severity: 'warning',
          message: `No Trefle match found for "${herb.botanicalInfo.scientificName}"`,
        },
      })

      return { success: false, message: 'No Trefle match found' }
    }

    // Update herb with enriched data
    await payload.update({
      collection: 'herbs',
      id: herbId,
      data: {
        botanicalInfo: {
          ...herb.botanicalInfo,
          scientificName: enrichedData.scientificName, // Use validated name
          family: enrichedData.family || herb.botanicalInfo.family,
          synonyms: enrichedData.synonyms || herb.botanicalInfo.synonyms,
          trefleId: enrichedData.trefleId,
          trefleSlug: enrichedData.trefleSlug,
          lastTrefleSyncAt: new Date(),
          trefleData: {
            author: enrichedData.author,
            year: enrichedData.year,
            bibliography: enrichedData.bibliography,
            synonyms: enrichedData.synonyms,
            distributions: enrichedData.distributions,
            edible: enrichedData.edible,
            ediblePart: enrichedData.ediblePart,
            vegetable: enrichedData.vegetable,
            toxicity: enrichedData.toxicity,
            growthHabit: enrichedData.growthHabit,
            growthForm: enrichedData.growthForm,
            growthRate: enrichedData.growthRate,
            averageHeight: enrichedData.averageHeight,
            maximumHeight: enrichedData.maximumHeight,
            flowerColor: enrichedData.flowerColor,
            foliageColor: enrichedData.foliageColor,
            fruitColor: enrichedData.fruitColor,
            sources: enrichedData.sources,
          },
        },
        // Add Trefle image if herb has no images
        ...(enrichedData.imageUrl &&
          (!herb.photoGallery || herb.photoGallery.length === 0) && {
            photoGallery: [
              {
                url: enrichedData.imageUrl,
                caption: `${herb.title} - from Trefle botanical database`,
                type: 'photograph',
                source: 'Trefle',
              },
            ],
          }),
        // Add distribution to habitat field if not already set
        ...(enrichedData.distributions?.native?.length > 0 &&
          !herb.habitat && {
            habitat: `Native to: ${enrichedData.distributions.native.slice(0, 5).join(', ')}`,
          }),
        // Add toxicity warning
        ...(enrichedData.toxicity &&
          enrichedData.toxicity !== 'none' && {
            safetyInfo: {
              ...herb.safetyInfo,
              warnings: [
                ...(herb.safetyInfo?.warnings || []),
                `Trefle toxicity level: ${enrichedData.toxicity}`,
              ],
            },
          }),
      },
    })

    console.log(`[Trefle Sync]    ✅ Enriched: ${herb.title}`)

    return {
      success: true,
      message: 'Herb enriched successfully',
      enrichedData,
    }
  } catch (error: any) {
    console.error(`[Trefle Sync] ❌ Failed to sync herb ${herbId}:`, error)
    return { success: false, message: error.message }
  }
}

/**
 * Sync Trefle Botanical Data Cron Job
 */
export async function syncTrefleData(): Promise<void> {
  const startTime = Date.now()

  try {
    console.log('[Trefle Sync] 🌿 Starting Trefle botanical data sync...')

    if (!trefleClientEnhanced.isConfigured()) {
      console.log('[Trefle Sync] ⚠️ Trefle client not configured. Skipping sync.')
      return
    }

    const payload = await getPayload({ config })

    // Find herbs that need syncing
    // Priority: Never synced OR last synced > 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - SYNC_INTERVAL_DAYS)

    const herbs = await payload.find({
      collection: 'herbs',
      where: {
        or: [
          {
            'botanicalInfo.trefleId': {
              exists: false,
            },
          },
          {
            'botanicalInfo.lastTrefleSyncAt': {
              less_than: thirtyDaysAgo,
            },
          },
        ],
      },
      limit: HERBS_PER_RUN,
      sort: 'createdAt',
    })

    if (herbs.docs.length === 0) {
      console.log('[Trefle Sync] ✅ No herbs need syncing')
      return
    }

    console.log(`[Trefle Sync] 📋 Found ${herbs.docs.length} herbs to sync`)

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const herb of herbs.docs) {
      const result = await syncSingleHerbWithTrefle(payload, herb.id)

      if (result.success) {
        if (result.message.startsWith('Skipped')) {
          skipCount++
        } else {
          successCount++
        }
      } else {
        errorCount++
      }

      // Small delay between herbs (600ms)
      await new Promise((resolve) => setTimeout(resolve, 600))
    }

    const duration = Math.round((Date.now() - startTime) / 1000)

    // Get statistics from enhanced client
    const stats = trefleClientEnhanced.getStats()
    const circuitState = trefleClientEnhanced.getCircuitState()

    console.log(`
[Trefle Sync] ✅ Sync complete
   Duration: ${duration}s
   Enriched: ${successCount}
   Skipped: ${skipCount}
   Errors: ${errorCount}
   API Stats:
     - Total Requests: ${stats.totalRequests}
     - Success Rate: ${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%
     - Avg Response Time: ${stats.avgResponseTimeMs}ms
     - Circuit State: ${circuitState}
    `)

    // Log import summary
    await payload.create({
      collection: 'importLogs',
      data: {
        type: 'Trefle Sync',
        source: 'Trefle API',
        status: errorCount > 0 ? 'partial' : 'success',
        recordsProcessed: successCount + skipCount + errorCount,
        recordsImported: successCount,
        recordsFailed: errorCount,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        details: `Enriched ${successCount}, Skipped ${skipCount}, Errors ${errorCount}. Circuit: ${circuitState}, Success Rate: ${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%`,
      },
    })
  } catch (error: any) {
    console.error('[Trefle Sync] ❌ Sync failed:', error)

    const payload = await getPayload({ config })

    // Log error
    await payload.create({
      collection: 'importLogs',
      data: {
        type: 'Trefle Sync Error',
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
 * Get Trefle sync progress
 */
export async function getTrefleSyncProgress(payload: any): Promise<{
  totalHerbs: number
  herbsSynced: number
  herbsNeedingSync: number
  lastSyncAt: Date | null
  circuitState: string
  apiStats: any
}> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - SYNC_INTERVAL_DAYS)

  // Total herbs
  const totalResult = await payload.find({
    collection: 'herbs',
    limit: 0,
  })

  // Herbs synced
  const syncedResult = await payload.find({
    collection: 'herbs',
    where: {
      'botanicalInfo.trefleId': {
        exists: true,
      },
    },
    limit: 0,
  })

  // Herbs needing sync
  const needingSyncResult = await payload.find({
    collection: 'herbs',
    where: {
      or: [
        {
          'botanicalInfo.trefleId': {
            exists: false,
          },
        },
        {
          'botanicalInfo.lastTrefleSyncAt': {
            less_than: thirtyDaysAgo,
          },
        },
      ],
    },
    limit: 0,
  })

  // Get last sync log
  const lastSyncLog = await payload.find({
    collection: 'importLogs',
    where: {
      type: {
        equals: 'Trefle Sync',
      },
    },
    sort: '-createdAt',
    limit: 1,
  })

  return {
    totalHerbs: totalResult.totalDocs,
    herbsSynced: syncedResult.totalDocs,
    herbsNeedingSync: needingSyncResult.totalDocs,
    lastSyncAt: lastSyncLog.docs[0]?.completedAt || null,
    circuitState: trefleClientEnhanced.getCircuitState(),
    apiStats: trefleClientEnhanced.getStats(),
  }
}

/**
 * Schedule the Trefle sync cron job
 */
export function scheduleTrefleSync(): void {
  if (!trefleClientEnhanced.isConfigured()) {
    console.log('[Trefle Sync] Cron job not scheduled (API key not configured)')
    return
  }

  // Run every Wednesday at 3:00 AM
  cron.schedule('0 3 * * 3', async () => {
    console.log('[Trefle Sync] Cron job triggered')
    await syncTrefleData()
  })

  console.log('[Trefle Sync] ✓ Scheduled: Sync Trefle Botanical Data (every Wednesday at 3:00 AM)')
}
