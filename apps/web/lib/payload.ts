/**
 * Payload CMS API client utilities
 * Provides typed methods for fetching data from Payload CMS
 */

const PAYLOAD_API_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

// Basic collection type interfaces
export interface Herb {
  id: string
  title: string
  slug: string
  scientificName?: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

export interface Formula {
  id: string
  title: string
  slug: string
  description?: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

export interface Condition {
  id: string
  title: string
  slug: string
  description?: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

export interface Practitioner {
  id: string
  name: string
  slug: string
  bio?: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

export interface Modality {
  id: string
  title: string
  slug: string
  description?: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

export interface PayloadResponse<T> {
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

export interface PayloadSingleResponse<T> {
  doc: T
}

interface FetchOptions {
  page?: number
  limit?: number
  where?: Record<string, unknown>
  sort?: string
  depth?: number
}

/**
 * Generic fetch function for Payload collections
 */
async function fetchFromPayload<T>(
  collection: string,
  options: FetchOptions = {}
): Promise<PayloadResponse<T>> {
  const { page = 1, limit = 12, where, sort, depth = 1 } = options

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    depth: depth.toString(),
  })

  if (where) {
    params.append('where', JSON.stringify(where))
  }

  if (sort) {
    params.append('sort', sort)
  }

  const url = `${PAYLOAD_API_URL}/api/${collection}?${params.toString()}`

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${collection}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${collection}:`, error)
    throw error
  }
}

/**
 * Fetch a single document by slug
 */
async function fetchBySlug<T>(
  collection: string,
  slug: string,
  depth: number = 2
): Promise<T | null> {
  try {
    const response = await fetchFromPayload<T>(collection, {
      where: { slug: { equals: slug } },
      limit: 1,
      depth,
    })

    return response.docs[0] || null
  } catch (error) {
    console.error(`Error fetching ${collection} by slug ${slug}:`, error)
    return null
  }
}

/**
 * Fetch herbs with optional filters
 */
export async function getHerbs(options: FetchOptions = {}) {
  return fetchFromPayload<Herb>('herbs', options)
}

/**
 * Fetch a single herb by slug
 */
export async function getHerbBySlug(slug: string) {
  return fetchBySlug<Herb>('herbs', slug)
}

/**
 * Fetch formulas with optional filters
 */
export async function getFormulas(options: FetchOptions = {}) {
  return fetchFromPayload<Formula>('formulas', options)
}

/**
 * Fetch a single formula by slug
 */
export async function getFormulaBySlug(slug: string) {
  return fetchBySlug<Formula>('formulas', slug)
}

/**
 * Fetch conditions with optional filters
 */
export async function getConditions(options: FetchOptions = {}) {
  return fetchFromPayload<Condition>('conditions', options)
}

/**
 * Fetch a single condition by slug
 */
export async function getConditionBySlug(slug: string) {
  return fetchBySlug<Condition>('conditions', slug)
}

/**
 * Fetch practitioners with optional filters
 */
export async function getPractitioners(options: FetchOptions = {}) {
  return fetchFromPayload<Practitioner>('practitioners', options)
}

/**
 * Fetch a single practitioner by slug
 */
export async function getPractitionerBySlug(slug: string) {
  return fetchBySlug<Practitioner>('practitioners', slug)
}

/**
 * Fetch modalities with optional filters
 */
export async function getModalities(options: FetchOptions = {}) {
  return fetchFromPayload<Modality>('modalities', options)
}

/**
 * Fetch a single modality by slug
 */
export async function getModalityBySlug(slug: string) {
  return fetchBySlug<Modality>('modalities', slug)
}

/**
 * Search across multiple collections
 */
export async function searchAll(query: string, page: number = 1) {
  const searchWhere = {
    or: [
      { title: { contains: query } },
      { description: { contains: query } },
    ],
  }

  const [herbs, formulas, conditions] = await Promise.all([
    fetchFromPayload('herbs', { where: searchWhere, page, limit: 6 }),
    fetchFromPayload('formulas', { where: searchWhere, page, limit: 6 }),
    fetchFromPayload('conditions', { where: searchWhere, page, limit: 6 }),
  ])

  return {
    herbs: herbs.docs,
    formulas: formulas.docs,
    conditions: conditions.docs,
    total: herbs.totalDocs + formulas.totalDocs + conditions.totalDocs,
  }
}
