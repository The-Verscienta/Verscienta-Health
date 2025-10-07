import { algoliasearch } from 'algoliasearch'
import type { Payload } from 'payload'

const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID || '',
  process.env.ALGOLIA_ADMIN_API_KEY || ''
)

interface SyncStats {
  herbs: number
  formulas: number
  conditions: number
  practitioners: number
  errors: number
}

export async function syncAlgoliaJob(payload: Payload): Promise<void> {
  console.log('🔄 Starting Algolia index sync...')

  const stats: SyncStats = {
    herbs: 0,
    formulas: 0,
    conditions: 0,
    practitioners: 0,
    errors: 0,
  }

  try {
    // Sync Herbs
    await syncCollection(payload, 'herbs', 'herbs_index', stats)

    // Sync Formulas
    await syncCollection(payload, 'formulas', 'formulas_index', stats)

    // Sync Conditions
    await syncCollection(payload, 'conditions', 'conditions_index', stats)

    // Sync Practitioners
    await syncCollection(payload, 'practitioners', 'practitioners_index', stats)

    console.log('✅ Algolia sync complete:', stats)

    // Log sync results
    await payload.create({
      collection: 'import-logs',
      data: {
        type: 'algolia-sync',
        results: stats,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('❌ Algolia sync failed:', error)
    throw error
  }
}

async function syncCollection(
  payload: Payload,
  collection: string,
  indexName: string,
  stats: SyncStats
): Promise<void> {
  try {
    console.log(`📤 Syncing ${collection} to Algolia...`)

    // Fetch all published documents
    const { docs } = await payload.find({
      collection: collection as any,
      where: {
        status: {
          equals: 'published',
        },
      },
      limit: 10000,
    })

    if (docs.length === 0) {
      console.log(`  ⏭️  No published ${collection} to sync`)
      return
    }

    // Transform documents for Algolia
    const records = docs.map((doc) => transformForAlgolia(doc, collection))

    // Get Algolia index
    const index = (algoliaClient as any).initIndex(indexName)

    // Replace all objects in the index
    await index.replaceAllObjects(records, {
      autoGenerateObjectIDIfNotExist: false,
    })

    stats[collection as keyof SyncStats] = docs.length
    console.log(`  ✓ Synced ${docs.length} ${collection}`)
  } catch (error) {
    console.error(`  ❌ Failed to sync ${collection}:`, error)
    stats.errors++
  }
}

function transformForAlgolia(doc: any, collection: string): any {
  // Base fields common to all collections
  const base = {
    objectID: doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    status: doc.status,
    publishedAt: doc.publishedAt,
    _collection: collection,
  }

  // Collection-specific fields
  switch (collection) {
    case 'herbs':
      return {
        ...base,
        scientificName: doc.scientificName,
        commonNames: doc.commonNames || [],
        pinyinName: doc.pinyinName,
        chineseName: doc.chineseName,
        tcmProperties: {
          temperature: doc.tcm_properties?.temperature,
          taste: doc.tcm_properties?.taste || [],
          meridians: doc.tcm_properties?.meridians || [],
          actions: doc.tcm_properties?.actions || [],
        },
        safetyRating: doc.safety_info?.rating,
        tags: doc.tags || [],
      }

    case 'formulas':
      return {
        ...base,
        tradition: doc.tradition,
        pinyinName: doc.pinyinName,
        chineseName: doc.chineseName,
        category: doc.category,
        ingredients: doc.ingredients?.length || 0,
        conditions: doc.conditions || [],
      }

    case 'conditions':
      return {
        ...base,
        westernName: doc.westernName,
        tcmName: doc.tcmName,
        category: doc.category,
        severity: doc.severity,
        affectedSystems: doc.affected_systems || [],
        symptoms: doc.symptoms || [],
      }

    case 'practitioners':
      return {
        ...base,
        credentials: doc.credentials || [],
        specialties: doc.specialties || [],
        location: doc.location,
        city: doc.city,
        state: doc.state,
        country: doc.country,
        verified: doc.verified,
        acceptingPatients: doc.accepting_patients,
        rating: doc.average_rating || 0,
        reviewCount: doc.review_count || 0,
      }

    default:
      return base
  }
}
