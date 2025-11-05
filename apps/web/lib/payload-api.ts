/**
 * Payload CMS Local API Client
 *
 * Direct database access using Payload's Local API (10-100x faster than HTTP)
 * Fully type-safe with generated TypeScript types
 *
 * Performance comparison:
 * - HTTP API: ~50-200ms per request (network + parsing overhead)
 * - Local API: ~5-20ms per request (direct database access)
 */

import { getPayload } from 'payload'
import config from '@payload-config'

// Payload CMS response format (native)
export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

// Single document response
export interface SingleDocResponse<T> {
  doc: T | null
}

// Import generated types from PayloadCMS
export type { Herb, Formula, Condition, Practitioner, Modality, Symptom, Review } from '@/types/payload-types'

// Re-export for backward compatibility
import type { Herb, Formula, Condition, Practitioner, Modality, Symptom, Review } from '@/types/payload-types'

// ==================== HERBS ====================

/**
 * Fetch herbs with pagination and optional search
 */
export async function getHerbs(
  page: number = 1,
  limit: number = 12,
  query?: string
): Promise<PaginatedResponse<Herb>> {
  const payload = await getPayload({ config })

  const whereConditions: any[] = [
    { _status: { equals: 'published' } }, // Only published herbs
  ]

  if (query) {
    whereConditions.push({
      or: [
        { title: { contains: query } },
        { 'botanicalInfo.scientificName': { contains: query } },
        { 'botanicalInfo.commonNames': { contains: query } },
      ],
    })
  }

  const result = await payload.find({
    collection: 'herbs',
    where: {
      and: whereConditions,
    },
    limit,
    page,
    sort: '-createdAt', // Newest first
  })

  return result as PaginatedResponse<Herb>
}

/**
 * Fetch a single herb by slug
 */
export async function getHerbBySlug(slug: string): Promise<Herb | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'herbs',
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 1,
    depth: 2, // Populate relationships (related formulas, conditions, etc.)
  })

  return (result.docs[0] as Herb) || null
}

/**
 * Fetch herb by ID
 */
export async function getHerbById(id: string): Promise<Herb | null> {
  const payload = await getPayload({ config })

  try {
    const herb = await payload.findByID({
      collection: 'herbs',
      id,
      depth: 2,
    })
    return herb as Herb
  } catch (error) {
    console.error(`Error fetching herb by ID ${id}:`, error)
    return null
  }
}

// ==================== FORMULAS ====================

/**
 * Fetch formulas with pagination and optional search
 */
export async function getFormulas(
  page: number = 1,
  limit: number = 12,
  query?: string
): Promise<PaginatedResponse<Formula>> {
  const payload = await getPayload({ config })

  const whereConditions: any[] = [
    { _status: { equals: 'published' } },
  ]

  if (query) {
    whereConditions.push({
      or: [
        { title: { contains: query } },
        { 'nameInfo.chineseName': { contains: query } },
        { 'nameInfo.pinyin': { contains: query } },
      ],
    })
  }

  const result = await payload.find({
    collection: 'formulas',
    where: {
      and: whereConditions,
    },
    limit,
    page,
    sort: '-createdAt',
  })

  return result as PaginatedResponse<Formula>
}

/**
 * Fetch a single formula by slug
 */
export async function getFormulaBySlug(slug: string): Promise<Formula | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'formulas',
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 1,
    depth: 2,
  })

  return (result.docs[0] as Formula) || null
}

// ==================== CONDITIONS ====================

/**
 * Fetch conditions with pagination and optional search
 */
export async function getConditions(
  page: number = 1,
  limit: number = 12,
  query?: string
): Promise<PaginatedResponse<Condition>> {
  const payload = await getPayload({ config })

  const whereConditions: any[] = [
    { _status: { equals: 'published' } },
  ]

  if (query) {
    whereConditions.push({
      or: [
        { title: { contains: query } },
        { description: { contains: query } },
        { 'symptoms.commonSymptoms': { contains: query } },
      ],
    })
  }

  const result = await payload.find({
    collection: 'conditions',
    where: {
      and: whereConditions,
    },
    limit,
    page,
    sort: 'title', // Alphabetical order
  })

  return result as PaginatedResponse<Condition>
}

/**
 * Fetch a single condition by slug
 */
export async function getConditionBySlug(slug: string): Promise<Condition | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'conditions',
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 1,
    depth: 2,
  })

  return (result.docs[0] as Condition) || null
}

// ==================== PRACTITIONERS ====================

/**
 * Fetch practitioners with pagination and optional location filter
 */
export async function getPractitioners(
  page: number = 1,
  limit: number = 12,
  location?: string
): Promise<PaginatedResponse<Practitioner>> {
  const payload = await getPayload({ config })

  const whereConditions: any[] = [
    { _status: { equals: 'published' } },
    { verificationStatus: { equals: 'verified' } }, // Only verified practitioners
  ]

  if (location) {
    whereConditions.push({
      or: [
        { 'contactInfo.address.city': { contains: location } },
        { 'contactInfo.address.state': { contains: location } },
        { 'contactInfo.address.country': { contains: location } },
      ],
    })
  }

  const result = await payload.find({
    collection: 'practitioners',
    where: {
      and: whereConditions,
    },
    limit,
    page,
    sort: 'name',
  })

  return result as PaginatedResponse<Practitioner>
}

/**
 * Fetch a single practitioner by slug
 */
export async function getPractitionerBySlug(slug: string): Promise<Practitioner | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'practitioners',
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 1,
    depth: 2,
  })

  return (result.docs[0] as Practitioner) || null
}

// ==================== MODALITIES ====================

/**
 * Fetch modalities with pagination
 */
export async function getModalities(
  page: number = 1,
  limit: number = 12
): Promise<PaginatedResponse<Modality>> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'modalities',
    where: {
      _status: { equals: 'published' },
    },
    limit,
    page,
    sort: 'name',
  })

  return result as PaginatedResponse<Modality>
}

/**
 * Fetch a single modality by slug
 */
export async function getModalityBySlug(slug: string): Promise<Modality | null> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'modalities',
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 1,
    depth: 2,
  })

  return (result.docs[0] as Modality) || null
}

// ==================== SYMPTOMS ====================

/**
 * Fetch symptoms with pagination and optional search
 */
export async function getSymptoms(
  page: number = 1,
  limit: number = 12,
  query?: string
): Promise<PaginatedResponse<Symptom>> {
  const payload = await getPayload({ config })

  const whereConditions: any[] = [
    { _status: { equals: 'published' } },
  ]

  if (query) {
    whereConditions.push({
      or: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    })
  }

  const result = await payload.find({
    collection: 'symptoms',
    where: {
      and: whereConditions,
    },
    limit,
    page,
    sort: 'title',
  })

  return result as PaginatedResponse<Symptom>
}

// ==================== REVIEWS ====================

/**
 * Fetch reviews for a specific entity
 */
export async function getReviewsForEntity(
  entityId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Review>> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'reviews',
    where: {
      and: [
        { reviewedEntity: { equals: entityId } },
        { moderationStatus: { equals: 'approved' } },
        { _status: { equals: 'published' } },
      ],
    },
    limit,
    page,
    sort: '-createdAt',
    depth: 1, // Populate author
  })

  return result as PaginatedResponse<Review>
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Fetch all slugs for a collection (used for sitemap generation)
 */
export async function getAllSlugs(
  collection: 'herbs' | 'formulas' | 'conditions' | 'practitioners' | 'modalities'
): Promise<string[]> {
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection,
      where: {
        _status: { equals: 'published' },
      },
      limit: 10000, // High limit for sitemap
      select: {
        slug: true,
      },
    })

    return result.docs.map((doc: any) => doc.slug).filter(Boolean)
  } catch (error) {
    console.error(`Error fetching slugs for ${collection}:`, error)
    return []
  }
}

/**
 * Search across multiple collections
 */
export async function searchGlobal(
  query: string,
  collections: Array<'herbs' | 'formulas' | 'conditions' | 'practitioners'> = [
    'herbs',
    'formulas',
    'conditions',
    'practitioners',
  ],
  limit: number = 5
): Promise<{
  herbs: Herb[]
  formulas: Formula[]
  conditions: Condition[]
  practitioners: Practitioner[]
}> {
  const payload = await getPayload({ config })

  const results = await Promise.all(
    collections.map(async (collectionName) => {
      try {
        const result = await payload.find({
          collection: collectionName,
          where: {
            and: [
              { _status: { equals: 'published' } },
              {
                or: [
                  { title: { contains: query } },
                ],
              },
            ],
          },
          limit,
        })
        return { collection: collectionName, docs: result.docs }
      } catch (error) {
        console.error(`Error searching ${collectionName}:`, error)
        return { collection: collectionName, docs: [] }
      }
    })
  )

  return results.reduce(
    (acc, { collection, docs }) => {
      acc[collection] = docs
      return acc
    },
    {} as any
  )
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(
  collection: 'herbs' | 'formulas' | 'conditions' | 'practitioners' | 'modalities'
): Promise<{ total: number }> {
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection,
      where: {
        _status: { equals: 'published' },
      },
      limit: 1, // Minimal query, we just need totalDocs
    })

    return { total: result.totalDocs }
  } catch (error) {
    console.error(`Error fetching stats for ${collection}:`, error)
    return { total: 0 }
  }
}

/**
 * Get featured/popular items (sorted by rating)
 */
export async function getFeaturedItems<T>(
  collection: 'herbs' | 'formulas',
  limit: number = 6
): Promise<T[]> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection,
    where: {
      _status: { equals: 'published' },
    },
    limit,
    sort: '-averageRating', // Highest rated first
  })

  return result.docs as T[]
}
