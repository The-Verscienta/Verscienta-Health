import { algoliasearch } from 'algoliasearch'
import type { CollectionAfterChangeHook } from 'payload'

const client = algoliasearch(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_API_KEY!)

/**
 * Sync Payload documents to Algolia search index
 * @param indexName - The base name of the Algolia index (will be prefixed with 'verscienta_')
 */
export const algoliaSync = (indexName: string): CollectionAfterChangeHook => {
  return async ({ doc, operation, req }) => {
    // Skip if Algolia is not configured
    if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_API_KEY) {
      console.warn('Algolia not configured, skipping sync')
      return
    }

    const index = (client as any).initIndex(`verscienta_${indexName}`)

    try {
      if (operation === 'create' || operation === 'update') {
        // Only index published content
        if (doc.status === 'published') {
          const searchableDoc = transformDocForAlgolia(doc, indexName)

          await index.saveObject(searchableDoc)
          console.log(`✓ Synced ${indexName}/${doc.id} to Algolia`)
        } else {
          // Remove from index if not published
          await index.deleteObject(doc.id).catch(() => {
            // Object might not exist, ignore error
          })
          console.log(`✓ Removed ${indexName}/${doc.id} from Algolia (unpublished)`)
        }
      } else if (operation === 'delete') {
        await index.deleteObject(doc.id).catch(() => {})
        console.log(`✓ Deleted ${indexName}/${doc.id} from Algolia`)
      }
    } catch (error) {
      console.error(`✗ Failed to sync ${indexName}/${doc.id} to Algolia:`, error)
      // Don't throw - we don't want to prevent document saves if Algolia fails
    }
  }
}

/**
 * Transform Payload document into Algolia-friendly format
 */
function transformDocForAlgolia(doc: any, collection: string): any {
  const baseDoc = {
    objectID: doc.id,
    title: doc.title || doc.name,
    slug: doc.slug,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    _collection: collection,
  }

  // Collection-specific transformations
  switch (collection) {
    case 'herbs':
      return {
        ...baseDoc,
        description: extractPlainText(doc.description),
        scientificName: doc.botanicalInfo?.scientificName,
        commonNames: doc.botanicalInfo?.commonNames?.map((cn: any) => cn.name) || [],
        family: doc.botanicalInfo?.family,
        westernProperties: doc.westernProperties || [],
        tcmTaste: doc.tcmProperties?.tcmTaste || [],
        tcmTemperature: doc.tcmProperties?.tcmTemperature,
        tcmMeridians: doc.tcmProperties?.tcmMeridians || [],
        partsUsed: doc.botanicalInfo?.partsUsed || [],
        conservationStatus: doc.conservationStatus,
        therapeuticUses: extractPlainText(doc.therapeuticUses),
        imageUrl: doc.featuredImage?.cloudflareUrl || doc.featuredImage?.url,
        averageRating: doc.averageRating,
        reviewCount: doc.reviewCount,
      }

    case 'formulas':
      return {
        ...baseDoc,
        description: extractPlainText(doc.description),
        shortDescription: doc.shortDescription,
        tradition: doc.tradition,
        category: doc.category,
        ingredients: doc.ingredients
          ?.map((ing: any) => ing.herb?.title || ing.herb)
          .filter(Boolean),
        useCases: doc.useCases?.map((uc: any) => uc.useCase).filter(Boolean),
      }

    case 'conditions':
      return {
        ...baseDoc,
        description: extractPlainText(doc.description),
        category: doc.category,
        severity: doc.severity,
        symptoms: doc.symptoms?.map((s: any) => s.symptom).filter(Boolean),
        tcmPattern: doc.tcmPattern,
        westernDiagnosis: doc.westernDiagnosis,
      }

    case 'practitioners':
      return {
        ...baseDoc,
        name: doc.name,
        bio: extractPlainText(doc.bio),
        modalities: doc.modalities?.map((m: any) => m.title || m).filter(Boolean),
        specialties: doc.specialties?.map((s: any) => s.specialty).filter(Boolean),
        practiceType: doc.practiceType,
        verificationStatus: doc.verificationStatus,
        city: doc.address?.city,
        state: doc.address?.state,
        country: doc.address?.country,
        _geoloc:
          doc.address?.latitude && doc.address?.longitude
            ? {
                lat: doc.address.latitude,
                lng: doc.address.longitude,
              }
            : undefined,
        averageRating: doc.averageRating,
        featured: doc.featured,
      }

    default:
      return baseDoc
  }
}

/**
 * Extract plain text from richText fields
 */
function extractPlainText(richText: any): string {
  if (!richText) return ''

  if (typeof richText === 'string') return richText

  // Handle Lexical editor format
  if (richText.root && richText.root.children) {
    return richText.root.children
      .map((child: any) => extractTextFromNode(child))
      .join(' ')
      .trim()
  }

  return ''
}

function extractTextFromNode(node: any): string {
  if (node.type === 'text') {
    return node.text || ''
  }

  if (node.children) {
    return node.children.map((child: any) => extractTextFromNode(child)).join(' ')
  }

  return ''
}
