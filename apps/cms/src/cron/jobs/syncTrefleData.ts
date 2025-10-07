import type { Payload } from 'payload'
import { getTrefleClient } from '../../lib/trefle'

interface TrefleSyncStats {
  processed: number
  enriched: number
  validated: number
  skipped: number
  errors: number
  newImages: number
  newSynonyms: number
}

export async function syncTrefleDataJob(payload: Payload): Promise<void> {
  console.log('🌿 Starting Trefle API data sync...')

  const stats: TrefleSyncStats = {
    processed: 0,
    enriched: 0,
    validated: 0,
    skipped: 0,
    errors: 0,
    newImages: 0,
    newSynonyms: 0,
  }

  try {
    // Check if Trefle API is configured
    if (!process.env.TREFLE_API_KEY) {
      console.log('⏭️  Trefle API key not configured, skipping sync')
      return
    }

    const trefleClient = getTrefleClient()

    // Get herbs that need enrichment
    // Priority 1: Herbs without trefleId (never synced)
    // Priority 2: Herbs synced more than 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const herbs = await payload.find({
      collection: 'herbs',
      where: {
        and: [
          {
            status: {
              equals: 'published',
            },
          },
          {
            or: [
              {
                'botanicalData.trefleId': {
                  exists: false,
                },
              },
              {
                'botanicalData.lastSyncedAt': {
                  less_than: thirtyDaysAgo.toISOString(),
                },
              },
            ],
          },
        ],
      },
      limit: 100, // Process 100 herbs per run to respect API limits
      sort: 'createdAt',
    })

    console.log(`📊 Found ${herbs.docs.length} herbs to process`)

    for (const herb of herbs.docs) {
      try {
        stats.processed++

        console.log(
          `🔍 Processing: ${herb.name} (${herb.scientificName || 'no scientific name'})`
        )

        // Skip herbs without scientific name
        if (!herb.scientificName) {
          console.log('  ⏭️  Skipping - no scientific name')
          stats.skipped++
          continue
        }

        // Validate scientific name first
        const validation = await trefleClient.validateScientificName(
          herb.scientificName
        )

        if (validation.valid) {
          stats.validated++
          console.log(
            `  ✓ Scientific name validated: ${validation.matchedName}`
          )
        } else if (validation.suggestions.length > 0) {
          console.log(
            `  ⚠️  Scientific name not found. Suggestions: ${validation.suggestions.slice(0, 3).join(', ')}`
          )

          // Log potential name issues for manual review
          await payload.create({
            collection: 'validation-reports',
            data: {
              type: 'trefle-name-mismatch',
              issues: [
                {
                  herbId: herb.id,
                  herbName: herb.name,
                  field: 'scientificName',
                  issue: `Scientific name not found in Trefle. Suggestions: ${validation.suggestions.slice(0, 3).join(', ')}`,
                  severity: 'warning',
                },
              ],
              errorCount: 0,
              warningCount: 1,
              totalChecked: 1,
              timestamp: new Date(),
            },
          })
        }

        // Enrich herb data with Trefle
        const enrichedData = await trefleClient.enrichHerbData({
          scientificName: herb.scientificName,
          name: herb.name,
        })

        if (!enrichedData) {
          console.log('  ⏭️  No Trefle data found')
          stats.skipped++

          // Update to mark as attempted
          await payload.update({
            collection: 'herbs',
            id: herb.id,
            data: {
              botanicalData: {
                ...herb.botanicalData,
                lastSyncedAt: new Date(),
                trefleSyncAttempted: true,
              },
            },
          })

          continue
        }

        stats.enriched++

        // Check for new images
        if (enrichedData.imageUrl && !herb.images?.length) {
          stats.newImages++
          console.log(`  📷 Found new image: ${enrichedData.imageUrl}`)
        }

        // Check for new synonyms
        if (
          enrichedData.synonyms.length > 0 &&
          (!herb.synonyms || herb.synonyms.length === 0)
        ) {
          stats.newSynonyms++
          console.log(`  📝 Found ${enrichedData.synonyms.length} synonyms`)
        }

        // Prepare update data
        const updateData: any = {
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
        }

        // Update family if not already set
        if (enrichedData.family && !herb.family) {
          updateData.family = enrichedData.family
        }

        // Add synonyms if not already set
        if (
          enrichedData.synonyms.length > 0 &&
          (!herb.synonyms || herb.synonyms.length === 0)
        ) {
          updateData.synonyms = enrichedData.synonyms
        }

        // Add image if not already set
        if (enrichedData.imageUrl && !herb.images?.length) {
          updateData.images = [
            {
              url: enrichedData.imageUrl,
              caption: `${herb.name} - from Trefle botanical database`,
              type: 'photograph',
              source: 'Trefle',
            },
          ]
        }

        // Add native distribution to habitat if available
        if (
          enrichedData.distributions?.native.length &&
          !herb.habitat?.includes('Native to')
        ) {
          const nativeRegions = enrichedData.distributions.native
            .slice(0, 5)
            .join(', ')
          const habitatAddition = `Native to: ${nativeRegions}`

          updateData.habitat = herb.habitat
            ? `${herb.habitat}\n\n${habitatAddition}`
            : habitatAddition
        }

        // Add toxicity warning to safety info if applicable
        if (enrichedData.toxicity && enrichedData.toxicity !== 'none') {
          updateData.safetyInfo = {
            ...herb.safetyInfo,
            warnings: [
              ...(herb.safetyInfo?.warnings || []),
              `Trefle toxicity: ${enrichedData.toxicity}`,
            ],
          }
        }

        // Update herb
        await payload.update({
          collection: 'herbs',
          id: herb.id,
          data: updateData,
        })

        console.log(`  ✅ Enriched successfully`)

        // Small delay to respect API rate limits
        await new Promise((resolve) => setTimeout(resolve, 600))
      } catch (error) {
        console.error(`  ❌ Error processing ${herb.name}:`, error)
        stats.errors++

        // Log error but continue with next herb
        try {
          await payload.create({
            collection: 'import-logs',
            data: {
              type: 'trefle-sync-error',
              results: {
                herbId: herb.id,
                herbName: herb.name,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
              timestamp: new Date(),
            },
          })
        } catch (logError) {
          console.error('Failed to log error:', logError)
        }
      }
    }

    console.log('✅ Trefle sync complete:', stats)

    // Log sync results
    await payload.create({
      collection: 'import-logs',
      data: {
        type: 'trefle-sync',
        results: stats,
        timestamp: new Date(),
      },
    })

    // Send notification if significant enrichment occurred
    if (stats.enriched > 10) {
      console.log(
        `📧 ${stats.enriched} herbs enriched. Consider reviewing new data.`
      )
      // TODO: Send email notification to admins
    }
  } catch (error) {
    console.error('❌ Trefle sync job failed:', error)
    throw error
  }
}

/**
 * Manually trigger Trefle sync for a specific herb
 */
export async function syncSingleHerbWithTrefle(
  payload: Payload,
  herbId: string
): Promise<{
  success: boolean
  message: string
  enrichedData?: any
}> {
  try {
    if (!process.env.TREFLE_API_KEY) {
      return {
        success: false,
        message: 'Trefle API key not configured',
      }
    }

    const herb = await payload.findByID({
      collection: 'herbs',
      id: herbId,
    })

    if (!herb.scientificName) {
      return {
        success: false,
        message: 'Herb does not have a scientific name',
      }
    }

    const trefleClient = getTrefleClient()
    const enrichedData = await trefleClient.enrichHerbData({
      scientificName: herb.scientificName,
      name: herb.name,
    })

    if (!enrichedData) {
      return {
        success: false,
        message: 'No matching data found in Trefle database',
      }
    }

    // Update herb with enriched data
    await payload.update({
      collection: 'herbs',
      id: herbId,
      data: {
        botanicalData: {
          ...herb.botanicalData,
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
      },
    })

    return {
      success: true,
      message: 'Herb successfully enriched with Trefle data',
      enrichedData,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
