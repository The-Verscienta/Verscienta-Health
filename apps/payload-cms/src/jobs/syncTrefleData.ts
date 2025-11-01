/**
 * Sync Trefle Botanical Data - Payload Job
 *
 * Enriches existing herbs with data from the Trefle botanical database.
 * Runs weekly to update herbs with scientific information.
 */

import type { PayloadHandler } from 'payload'
import { getTrefleClient } from '../lib/trefle'

const HERBS_PER_RUN = 30 // Process 30 herbs per run

/**
 * Sync single herb with Trefle data
 */
async function syncSingleHerbWithTrefle(
  payload: any,
  herbId: string | number
): Promise<{ success: boolean; message: string; enrichedData?: unknown }> {
  try {
    const client = getTrefleClient()
    if (!client) {
      return { success: false, message: 'Trefle client not initialized' }
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
    const lastSynced = herb.botanicalInfo?.lastSyncedAt
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

    console.log(`🔄 Syncing herb: ${herb.title} (${herb.botanicalInfo.scientificName})`)

    // Enrich with Trefle data
    const enrichedData = await client.enrichHerbData({
      scientificName: herb.botanicalInfo.scientificName,
      name: herb.title,
    })

    if (!enrichedData) {
      // Log validation report for manual review
      await payload.create({
        collection: 'validation-reports',
        data: {
          type: 'trefle-name-mismatch',
          collectionType: 'herbs',
          documentId: herbId.toString(),
          field: 'scientificName',
          currentValue: herb.botanicalInfo.scientificName,
          suggestedValue: null,
          severity: 'warning',
          message: `No Trefle match found for "${herb.botanicalInfo.scientificName}"`,
          timestamp: new Date().toISOString(),
        },
      })

      return { success: false, message: 'No Trefle match found' }
    }

    // Prepare update data
    const updateData: any = {
      botanicalInfo: {
        ...herb.botanicalInfo,
        scientificName: enrichedData.scientificName, // Use validated name
        family: enrichedData.family || herb.botanicalInfo.family,
        trefleId: enrichedData.trefleId,
        trefleSlug: enrichedData.trefleSlug,
        lastSyncedAt: new Date().toISOString(),
      },
      synonyms: enrichedData.synonyms
        ? enrichedData.synonyms.map((synonym: string) => ({
            scientificName: synonym,
            status: 'synonym',
          }))
        : herb.synonyms || [],
    }

    // Add distribution to native regions
    if (enrichedData.distributions?.native?.length > 0) {
      updateData.nativeRegion = enrichedData.distributions.native.map((region: string) => ({
        region,
      }))
    }

    // Add cultivation info
    if (enrichedData.growthHabit || enrichedData.toxicity) {
      updateData.cultivation = {
        ...herb.cultivation,
        growingConditions: enrichedData.growthHabit || herb.cultivation?.growingConditions,
      }
    }

    // Add safety info for toxicity
    if (enrichedData.toxicity && enrichedData.toxicity !== 'none') {
      updateData.safetyInfo = {
        ...herb.safetyInfo,
        warnings: `Trefle toxicity: ${enrichedData.toxicity}`,
      }
    }

    // Update herb with enriched data
    await payload.update({
      collection: 'herbs',
      id: herbId,
      data: updateData,
    })

    console.log(`   ✅ Enriched: ${herb.title}`)

    return {
      success: true,
      message: 'Herb enriched successfully',
      enrichedData,
    }
  } catch (error) {
    console.error(`❌ Failed to sync herb ${herbId}:`, error)
    return { success: false, message: (error as Error).message }
  }
}

/**
 * Sync Trefle Botanical Data Job Handler
 */
export const syncTrefleDataJob: PayloadHandler = async ({ payload }) => {
  const startTime = Date.now()

  try {
    console.log('🌿 Starting Trefle botanical data sync...')

    const client = getTrefleClient()
    if (!client) {
      console.log('⚠️ Trefle client not configured. Skipping sync.')
      return Response.json({ success: false, message: 'Trefle client not configured' }, { status: 200 })
    }

    // Find herbs that need syncing
    // Priority: Never synced OR last synced > 30 days ago
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { docs: herbs } = await payload.find({
      collection: 'herbs',
      where: {
        or: [
          {
            'botanicalInfo.trefleId': {
              exists: false,
            },
          },
          {
            'botanicalInfo.lastSyncedAt': {
              less_than: thirtyDaysAgo,
            },
          },
        ],
      },
      limit: HERBS_PER_RUN,
      sort: 'createdAt',
    })

    if (herbs.length === 0) {
      console.log('✅ No herbs need syncing')
      return Response.json({ success: true, message: 'No herbs need syncing' }, { status: 200 })
    }

    console.log(`📋 Found ${herbs.length} herbs to sync`)

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const herb of herbs) {
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

      // Small delay between herbs to respect rate limits
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
    await payload.create({
      collection: 'import-logs',
      data: {
        type: 'trefle-sync',
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
        timestamp: new Date().toISOString(),
      },
    })

    return Response.json({
      success: true,
      message: 'Trefle sync complete',
      data: {
        enriched: successCount,
        skipped: skipCount,
        errors: errorCount,
        duration,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('❌ Trefle sync failed:', error)

    // Log error
    await payload.create({
      collection: 'import-logs',
      data: {
        type: 'trefle-sync-error',
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

    return Response.json({
      success: false,
      message: 'Trefle sync failed',
      error: (error as Error).message,
    }, { status: 500 })
  }
}
