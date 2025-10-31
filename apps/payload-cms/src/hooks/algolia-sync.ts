/**
 * Algolia Sync Hooks
 *
 * Auto-indexes content to Algolia on create/update/delete operations.
 * Used by Herbs, Formulas, Conditions, and Practitioners collections.
 */

import { algoliasearch } from 'algoliasearch'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

/**
 * Initialize Algolia client
 */
function getAlgoliaClient() {
  const appId = process.env.ALGOLIA_APP_ID
  const adminApiKey = process.env.ALGOLIA_ADMIN_API_KEY

  if (!appId || !adminApiKey) {
    console.warn('⚠️ Algolia credentials not configured. Skipping indexing.')
    return null
  }

  return algoliasearch(appId, adminApiKey)
}

/**
 * Transform document for Algolia indexing
 * Flattens nested structures and removes unnecessary fields
 */
function transformDocumentForAlgolia(doc: any, collectionName: string): any {
  // Base object with common fields
  const algoliaDoc: any = {
    objectID: doc.id,
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    _status: doc._status,
    collectionType: collectionName,
  }

  // Collection-specific transformations
  switch (collectionName) {
    case 'herbs':
      return {
        ...algoliaDoc,
        description: doc.description,
        scientificName: doc.botanicalInfo?.scientificName,
        family: doc.botanicalInfo?.family,
        genus: doc.botanicalInfo?.genus,
        partsUsed: doc.botanicalInfo?.partsUsed,
        tcmCategory: doc.tcmProperties?.tcmCategory,
        tcmTaste: doc.tcmProperties?.tcmTaste,
        tcmTemperature: doc.tcmProperties?.tcmTemperature,
        tcmMeridians: doc.tcmProperties?.tcmMeridians,
        therapeuticUses: doc.therapeuticUses,
        conservationStatus: doc.conservation?.conservationStatus,
        averageRating: doc.averageRating || 0,
        reviewCount: doc.reviewCount || 0,
        searchTags: doc.searchTags || [],
        // Add common names for search
        commonNames: doc.commonNames?.map((cn: any) => cn.name) || [],
      }

    case 'formulas':
      return {
        ...algoliaDoc,
        description: doc.description,
        chineseName: doc.chineseName,
        pinyin: doc.pinyin,
        category: doc.category,
        traditionalUse: doc.traditionalUse,
        tcmPattern: doc.tcmPattern,
        ingredientCount: doc.ingredients?.length || 0,
        averageRating: doc.averageRating || 0,
        reviewCount: doc.reviewCount || 0,
      }

    case 'conditions':
      return {
        ...algoliaDoc,
        description: doc.description,
        category: doc.category,
        severity: doc.severity,
        icdCode: doc.icdCode,
        tcmPattern: doc.tcmPattern,
        westernDiagnosis: doc.westernDiagnosis,
      }

    case 'practitioners':
      return {
        ...algoliaDoc,
        fullName: doc.fullName,
        email: doc.email,
        phone: doc.phone,
        bio: doc.bio,
        city: doc.city,
        state: doc.state,
        country: doc.country,
        verificationStatus: doc.verificationStatus,
        specialties: doc.specialties?.map((s: any) => s.specialty) || [],
        languages: doc.languages?.map((l: any) => l.language) || [],
        averageRating: doc.averageRating || 0,
        reviewCount: doc.reviewCount || 0,
        yearsOfExperience: doc.yearsOfExperience,
        // Add geolocation for geo search
        _geoloc: doc.addresses?.[0]?.latitude && doc.addresses?.[0]?.longitude
          ? {
              lat: doc.addresses[0].latitude,
              lng: doc.addresses[0].longitude,
            }
          : undefined,
      }

    default:
      return algoliaDoc
  }
}

/**
 * AfterChange Hook - Indexes document to Algolia after create/update
 */
export const algoliaAfterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  collection,
}) => {
  try {
    const client = getAlgoliaClient()
    if (!client) return doc

    const collectionName = collection.slug
    const indexName = `${collectionName}_${process.env.NODE_ENV || 'development'}`

    const index = client.initIndex(indexName)

    // Only index published documents (or all if no _status field)
    if (doc._status && doc._status !== 'published') {
      console.log(`⏩ Skipping Algolia index for draft ${collectionName}:${doc.id}`)
      // Delete from Algolia if it exists (was published, now draft)
      await index.deleteObject(doc.id).catch(() => {
        // Ignore errors if object doesn't exist
      })
      return doc
    }

    // Transform document for Algolia
    const algoliaDoc = transformDocumentForAlgolia(doc, collectionName)

    // Index to Algolia
    await index.saveObject(algoliaDoc, {
      autoGenerateObjectIDIfNotExist: false,
    })

    console.log(`✅ Indexed to Algolia: ${collectionName}:${doc.id}`)
  } catch (error) {
    console.error(`❌ Failed to index to Algolia:`, error)
    // Don't throw - we don't want indexing failures to block document saves
  }

  return doc
}

/**
 * AfterDelete Hook - Removes document from Algolia after deletion
 */
export const algoliaAfterDeleteHook: CollectionAfterDeleteHook = async ({
  doc,
  req,
  collection,
}) => {
  try {
    const client = getAlgoliaClient()
    if (!client) return doc

    const collectionName = collection.slug
    const indexName = `${collectionName}_${process.env.NODE_ENV || 'development'}`

    const index = client.initIndex(indexName)

    // Delete from Algolia
    await index.deleteObject(doc.id)

    console.log(`✅ Deleted from Algolia: ${collectionName}:${doc.id}`)
  } catch (error) {
    console.error(`❌ Failed to delete from Algolia:`, error)
    // Don't throw - we don't want indexing failures to block document deletes
  }

  return doc
}

/**
 * Bulk index all documents in a collection to Algolia
 * Useful for initial indexing or re-indexing after schema changes
 */
export async function bulkIndexToAlgolia(
  payload: any,
  collectionSlug: string,
  batchSize = 100
): Promise<{ indexed: number; errors: number }> {
  try {
    const client = getAlgoliaClient()
    if (!client) {
      console.warn('⚠️ Algolia not configured. Skipping bulk index.')
      return { indexed: 0, errors: 0 }
    }

    const indexName = `${collectionSlug}_${process.env.NODE_ENV || 'development'}`
    const index = client.initIndex(indexName)

    let page = 1
    let hasNextPage = true
    let totalIndexed = 0
    let totalErrors = 0

    console.log(`🔄 Starting bulk index for ${collectionSlug}...`)

    while (hasNextPage) {
      // Fetch documents
      const { docs, hasNextPage: more } = await payload.find({
        collection: collectionSlug,
        limit: batchSize,
        page,
        where: {
          _status: {
            equals: 'published',
          },
        },
      })

      if (docs.length === 0) break

      // Transform for Algolia
      const algoliaObjects = docs.map((doc: any) =>
        transformDocumentForAlgolia(doc, collectionSlug)
      )

      // Batch index
      try {
        await index.saveObjects(algoliaObjects, {
          autoGenerateObjectIDIfNotExist: false,
        })
        totalIndexed += algoliaObjects.length
        console.log(`   ✅ Indexed batch ${page} (${algoliaObjects.length} documents)`)
      } catch (error) {
        console.error(`   ❌ Failed to index batch ${page}:`, error)
        totalErrors += docs.length
      }

      hasNextPage = more
      page++

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log(`\n✅ Bulk index complete for ${collectionSlug}`)
    console.log(`   Indexed: ${totalIndexed}`)
    console.log(`   Errors: ${totalErrors}`)

    return { indexed: totalIndexed, errors: totalErrors }
  } catch (error) {
    console.error(`❌ Bulk index failed for ${collectionSlug}:`, error)
    throw error
  }
}

/**
 * Configure Algolia index settings
 * Sets up searchable attributes, ranking, and facets
 */
export async function configureAlgoliaIndex(
  collectionSlug: string,
  settings: any
): Promise<void> {
  try {
    const client = getAlgoliaClient()
    if (!client) {
      console.warn('⚠️ Algolia not configured. Skipping index configuration.')
      return
    }

    const indexName = `${collectionSlug}_${process.env.NODE_ENV || 'development'}`
    const index = client.initIndex(indexName)

    await index.setSettings(settings)

    console.log(`✅ Configured Algolia index: ${indexName}`)
  } catch (error) {
    console.error(`❌ Failed to configure Algolia index:`, error)
    throw error
  }
}

/**
 * Recommended Algolia settings for each collection
 */
export const ALGOLIA_SETTINGS = {
  herbs: {
    searchableAttributes: [
      'title',
      'scientificName',
      'commonNames',
      'searchTags',
      'description',
      'tcmCategory',
      'family',
    ],
    attributesForFaceting: [
      'filterOnly(tcmCategory)',
      'filterOnly(tcmTaste)',
      'filterOnly(tcmTemperature)',
      'filterOnly(conservationStatus)',
      'filterOnly(_status)',
    ],
    customRanking: ['desc(averageRating)', 'desc(reviewCount)', 'desc(updatedAt)'],
    ranking: [
      'typo',
      'geo',
      'words',
      'filters',
      'proximity',
      'attribute',
      'exact',
      'custom',
    ],
  },

  formulas: {
    searchableAttributes: ['title', 'chineseName', 'pinyin', 'description', 'category'],
    attributesForFaceting: [
      'filterOnly(category)',
      'filterOnly(tcmPattern)',
      'filterOnly(_status)',
    ],
    customRanking: ['desc(averageRating)', 'desc(reviewCount)', 'desc(updatedAt)'],
  },

  conditions: {
    searchableAttributes: ['title', 'description', 'tcmPattern', 'westernDiagnosis'],
    attributesForFaceting: [
      'filterOnly(category)',
      'filterOnly(severity)',
      'filterOnly(_status)',
    ],
    customRanking: ['desc(updatedAt)'],
  },

  practitioners: {
    searchableAttributes: [
      'fullName',
      'bio',
      'specialties',
      'languages',
      'city',
      'state',
    ],
    attributesForFaceting: [
      'filterOnly(verificationStatus)',
      'filterOnly(specialties)',
      'filterOnly(languages)',
      'filterOnly(state)',
      'filterOnly(country)',
    ],
    customRanking: ['desc(averageRating)', 'desc(reviewCount)', 'desc(yearsOfExperience)'],
    // Enable geo search
    ranking: [
      'geo',
      'typo',
      'words',
      'filters',
      'proximity',
      'attribute',
      'exact',
      'custom',
    ],
  },
}
