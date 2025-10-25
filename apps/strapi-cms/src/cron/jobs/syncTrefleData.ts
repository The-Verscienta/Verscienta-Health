/**
 * Sync Trefle Botanical Data Cron Job
 *
 * Enriches existing herbs with data from the Trefle botanical database.
 * Runs weekly to update herbs with scientific information.
 */

import type { Core } from '@strapi/strapi'
import { getTrefleClient } from '../../lib/trefle'

const HERBS_PER_RUN = 30 // Process 30 herbs per run

/**
 * Sync single herb with Trefle data
 */
export async function syncSingleHerbWithTrefle(
  strapi: Core.Strapi,
  herbId: number
): Promise<{ success: boolean; message: string; enrichedData?: unknown }> {
  try {
    const client = getTrefleClient()
    if (!client) {
      return { success: false, message: 'Trefle client not initialized' }
    }

    // Get herb data
    const herb = (await strapi.entityService.findOne('api::herb.herb', herbId)) as any

    if (!herb || !herb.scientificName) {
      return { success: false, message: 'Herb not found or missing scientific name' }
    }

    // Skip if recently synced (within 30 days)
    const lastSynced = herb.botanicalData?.lastSyncedAt
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

    console.log(`🔄 Syncing herb: ${herb.name} (${herb.scientificName})`)

    // Enrich with Trefle data
    const enrichedData = await client.enrichHerbData({
      scientificName: herb.scientificName,
      name: herb.name,
    })

    if (!enrichedData) {
      // Log validation report for manual review
      await strapi.entityService.create('api::validation-report.validation-report', {
        data: {
          type: 'trefle-name-mismatch',
          collectionType: 'Herb',
          documentId: herbId.toString(),
          field: 'scientificName',
          currentValue: herb.scientificName,
          suggestedValue: null,
          severity: 'warning',
          message: `No Trefle match found for "${herb.scientificName}"`,
          publishedAt: new Date(),
        } as any,
      })

      return { success: false, message: 'No Trefle match found' }
    }

    // Prepare update data
    const updateData: any = {
      scientificName: enrichedData.scientificName, // Use validated name
      family: enrichedData.family || herb.family,
      synonyms: enrichedData.synonyms,
      botanicalData: {
        trefleId: enrichedData.trefleId,
        trefleSlug: enrichedData.trefleSlug,
        lastSyncedAt: new Date().toISOString(),
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
    }

    // Add Trefle image if herb has no images
    if (enrichedData.imageUrl && (!herb.images || herb.images.length === 0)) {
      updateData.images = [
        {
          url: enrichedData.imageUrl,
          caption: `${herb.name} - from Trefle botanical database`,
          type: 'photograph',
          source: 'Trefle',
        },
      ]
    }

    // Add distribution to habitat field
    if (enrichedData.distributions.native.length > 0) {
      updateData.habitat = `Native to: ${enrichedData.distributions.native.slice(0, 5).join(', ')}`
    }

    // Add toxicity warning
    if (enrichedData.toxicity && enrichedData.toxicity !== 'none') {
      updateData.safetyInfo = {
        warnings: [`Trefle toxicity: ${enrichedData.toxicity}`],
      }
    }

    // Update herb with enriched data
    await strapi.entityService.update('api::herb.herb', herbId, {
      data: updateData,
    })

    console.log(`   ✅ Enriched: ${herb.name}`)

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
 * Sync Trefle Botanical Data Cron Job
 */
export default async function syncTrefleData({ strapi }: { strapi: Core.Strapi }) {
  const startTime = Date.now()

  try {
    console.log('🌿 Starting Trefle botanical data sync...')

    const client = getTrefleClient()
    if (!client) {
      console.log('⚠️ Trefle client not configured. Skipping sync.')
      return
    }

    // Find herbs that need syncing
    // Priority: Never synced OR last synced > 30 days ago
    const herbs = await strapi.db.query('api::herb.herb').findMany({
      where: {
        $or: [
          { botanicalData: { trefleId: null } }, // Never synced
          {
            botanicalData: {
              lastSyncedAt: {
                $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              },
            },
          }, // Synced > 30 days ago
        ],
      },
      limit: HERBS_PER_RUN,
      orderBy: { createdAt: 'asc' },
    })

    if (herbs.length === 0) {
      console.log('✅ No herbs need syncing')
      return
    }

    console.log(`📋 Found ${herbs.length} herbs to sync`)

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const herb of herbs) {
      const result = await syncSingleHerbWithTrefle(strapi, herb.id)

      if (result.success) {
        if (result.message.startsWith('Skipped')) {
          skipCount++
        } else {
          successCount++
        }
      } else {
        errorCount++
      }

      // Small delay between herbs
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
    await strapi.entityService.create('api::import-log.import-log', {
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
        publishedAt: new Date(),
      } as any,
    })
  } catch (error) {
    console.error('❌ Trefle sync failed:', error)

    // Log error
    await strapi.entityService.create('api::import-log.import-log', {
      data: {
        type: 'trefle-sync-error',
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
