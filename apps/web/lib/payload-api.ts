/**
 * Payload CMS API Client
 *
 * Direct client for Payload CMS API with no transformation needed.
 * Payload natively returns the format our frontend expects.
 */

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

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

interface FetchOptions {
  next?: NextFetchRequestConfig
  cache?: RequestCache
  depth?: number
}

/**
 * Generic fetch function for Payload API
 */
async function fetchFromPayload<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<PaginatedResponse<T>> {
  const url = `${CMS_URL}/api/${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: options.next,
      ...(options.cache && { cache: options.cache }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch from ${endpoint}: ${response.statusText}`)
    }

    const data: PaginatedResponse<T> = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching from Payload CMS (${endpoint}):`, error)
    throw error
  }
}

/**
 * Fetch single document from Payload API
 */
async function fetchSingleFromPayload<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T | null> {
  const url = `${CMS_URL}/api/${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: options.next,
      ...(options.cache && { cache: options.cache }),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch from ${endpoint}: ${response.statusText}`)
    }

    const data: T = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching from Payload CMS (${endpoint}):`, error)
    throw error
  }
}

/**
 * Build Payload query parameters
 */
function buildQueryParams(params: Record<string, any>): URLSearchParams {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString())
    }
  })

  return searchParams
}

// ==================== HERBS ====================

export interface Herb {
  id: string
  title: string
  slug: string
  description?: string
  featuredImage?: string
  botanicalInfo?: {
    scientificName?: string
    family?: string
    genus?: string
    species?: string
    partsUsed?: string[]
    trefleId?: number
  }
  tcmProperties?: {
    tcmTaste?: string[]
    tcmTemperature?: string
    tcmMeridians?: string[]
    tcmCategory?: string
  }
  therapeuticUses?: string
  averageRating?: number
  reviewCount?: number
  commonNames?: Array<{ name: string; language?: string }>
  conservationStatus?: string
  _status?: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

/**
 * Fetch herbs with pagination and optional search
 */
export async function getHerbs(
  page: number = 1,
  limit: number = 12,
  query?: string,
  options?: FetchOptions
): Promise<PaginatedResponse<Herb>> {
  const params = buildQueryParams({
    page,
    limit,
    ...(query && { 'where[title][contains]': query }),
    'where[_status][equals]': 'published',
  })

  return fetchFromPayload<Herb>(`herbs?${params.toString()}`, {
    next: { revalidate: 3600 }, // Revalidate every hour
    ...options,
  })
}

/**
 * Fetch a single herb by slug
 */
export async function getHerbBySlug(
  slug: string,
  options?: FetchOptions
): Promise<Herb | null> {
  const params = buildQueryParams({
    'where[slug][equals]': slug,
    'where[_status][equals]': 'published',
    limit: 1,
    depth: options?.depth || 2,
  })

  const response = await fetchFromPayload<Herb>(`herbs?${params.toString()}`, {
    next: { revalidate: 3600 },
    ...options,
  })

  return response.docs[0] || null
}

/**
 * Fetch herb by ID
 */
export async function getHerbById(
  id: string,
  options?: FetchOptions
): Promise<Herb | null> {
  return fetchSingleFromPayload<Herb>(`herbs/${id}`, {
    next: { revalidate: 3600 },
    ...options,
  })
}

// ==================== FORMULAS ====================

export interface Formula {
  id: string
  title: string
  slug: string
  description?: string
  chineseName?: string
  pinyin?: string
  category?: string
  tradition?: string
  ingredients?: Array<{
    herb: string | Herb
    quantity?: number
    unit?: string
    role?: string
  }>
  averageRating?: number
  reviewCount?: number
  _status?: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

/**
 * Fetch formulas with pagination and optional search
 */
export async function getFormulas(
  page: number = 1,
  limit: number = 12,
  query?: string,
  options?: FetchOptions
): Promise<PaginatedResponse<Formula>> {
  const params = buildQueryParams({
    page,
    limit,
    ...(query && { 'where[title][contains]': query }),
    'where[_status][equals]': 'published',
  })

  return fetchFromPayload<Formula>(`formulas?${params.toString()}`, {
    next: { revalidate: 3600 },
    ...options,
  })
}

/**
 * Fetch a single formula by slug
 */
export async function getFormulaBySlug(
  slug: string,
  options?: FetchOptions
): Promise<Formula | null> {
  const params = buildQueryParams({
    'where[slug][equals]': slug,
    'where[_status][equals]': 'published',
    limit: 1,
    depth: options?.depth || 2,
  })

  const response = await fetchFromPayload<Formula>(`formulas?${params.toString()}`, {
    next: { revalidate: 3600 },
    ...options,
  })

  return response.docs[0] || null
}

// ==================== CONDITIONS ====================

export interface Condition {
  id: string
  title: string
  slug: string
  description?: string
  category?: string
  severity?: string
  icdCode?: string
  tcmPattern?: string
  westernDiagnosis?: string
  symptoms?: Array<string | any>
  _status?: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

/**
 * Fetch conditions with pagination and optional search
 */
export async function getConditions(
  page: number = 1,
  limit: number = 12,
  query?: string,
  options?: FetchOptions
): Promise<PaginatedResponse<Condition>> {
  const params = buildQueryParams({
    page,
    limit,
    ...(query && { 'where[title][contains]': query }),
    'where[_status][equals]': 'published',
  })

  return fetchFromPayload<Condition>(`conditions?${params.toString()}`, {
    next: { revalidate: 3600 },
    ...options,
  })
}

/**
 * Fetch a single condition by slug
 */
export async function getConditionBySlug(
  slug: string,
  options?: FetchOptions
): Promise<Condition | null> {
  const params = buildQueryParams({
    'where[slug][equals]': slug,
    'where[_status][equals]': 'published',
    limit: 1,
    depth: options?.depth || 2,
  })

  const response = await fetchFromPayload<Condition>(`conditions?${params.toString()}`, {
    next: { revalidate: 3600 },
    ...options,
  })

  return response.docs[0] || null
}

// ==================== PRACTITIONERS ====================

export interface Practitioner {
  id: string
  fullName: string
  slug: string
  email?: string
  phone?: string
  bio?: string
  businessName?: string
  verificationStatus?: 'pending' | 'verified' | 'rejected' | 'suspended'
  specialties?: Array<{ specialty: string }>
  languages?: Array<{ language: string }>
  addresses?: Array<{
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
    latitude?: number
    longitude?: number
  }>
  city?: string
  state?: string
  country?: string
  averageRating?: number
  reviewCount?: number
  yearsOfExperience?: number
  _status?: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

/**
 * Fetch practitioners with pagination and optional filters
 */
export async function getPractitioners(
  page: number = 1,
  limit: number = 12,
  location?: string,
  options?: FetchOptions
): Promise<PaginatedResponse<Practitioner>> {
  const params = buildQueryParams({
    page,
    limit,
    ...(location && { 'where[city][contains]': location }),
    'where[_status][equals]': 'published',
    'where[verificationStatus][equals]': 'verified',
  })

  return fetchFromPayload<Practitioner>(`practitioners?${params.toString()}`, {
    next: { revalidate: 3600 },
    ...options,
  })
}

/**
 * Fetch a single practitioner by slug
 */
export async function getPractitionerBySlug(
  slug: string,
  options?: FetchOptions
): Promise<Practitioner | null> {
  const params = buildQueryParams({
    'where[slug][equals]': slug,
    'where[_status][equals]': 'published',
    limit: 1,
    depth: options?.depth || 2,
  })

  const response = await fetchFromPayload<Practitioner>(`practitioners?${params.toString()}`, {
    next: { revalidate: 3600 },
    ...options,
  })

  return response.docs[0] || null
}

// ==================== MODALITIES ====================

export interface Modality {
  id: string
  title: string
  slug: string
  description?: string
  category?: string
  _status?: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

/**
 * Fetch modalities with pagination
 */
export async function getModalities(
  page: number = 1,
  limit: number = 12,
  options?: FetchOptions
): Promise<PaginatedResponse<Modality>> {
  const params = buildQueryParams({
    page,
    limit,
    'where[_status][equals]': 'published',
  })

  return fetchFromPayload<Modality>(`modalities?${params.toString()}`, {
    next: { revalidate: 3600 },
    ...options,
  })
}

/**
 * Fetch a single modality by slug
 */
export async function getModalityBySlug(
  slug: string,
  options?: FetchOptions
): Promise<Modality | null> {
  const params = buildQueryParams({
    'where[slug][equals]': slug,
    'where[_status][equals]': 'published',
    limit: 1,
    depth: options?.depth || 2,
  })

  const response = await fetchFromPayload<Modality>(`modalities?${params.toString()}`, {
    next: { revalidate: 3600 },
    ...options,
  })

  return response.docs[0] || null
}

// ==================== SYMPTOMS ====================

export interface Symptom {
  id: string
  title: string
  slug: string
  description?: string
  severity?: string
  redFlags?: string[]
  _status?: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

/**
 * Fetch symptoms with pagination
 */
export async function getSymptoms(
  page: number = 1,
  limit: number = 12,
  query?: string,
  options?: FetchOptions
): Promise<PaginatedResponse<Symptom>> {
  const params = buildQueryParams({
    page,
    limit,
    ...(query && { 'where[title][contains]': query }),
    'where[_status][equals]': 'published',
  })

  return fetchFromPayload<Symptom>(`symptoms?${params.toString()}`, {
    next: { revalidate: 3600 },
    ...options,
  })
}

// ==================== REVIEWS ====================

export interface Review {
  id: string
  rating: number
  title?: string
  content?: string
  reviewedEntity: string | Herb | Formula | Practitioner | Modality
  entityType?: string
  author?: string
  moderationStatus?: 'pending' | 'approved' | 'rejected' | 'flagged'
  _status?: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

/**
 * Fetch reviews for a specific entity
 */
export async function getReviewsForEntity(
  entityId: string,
  page: number = 1,
  limit: number = 10,
  options?: FetchOptions
): Promise<PaginatedResponse<Review>> {
  const params = buildQueryParams({
    page,
    limit,
    'where[reviewedEntity][equals]': entityId,
    'where[moderationStatus][equals]': 'approved',
    'where[_status][equals]': 'published',
    sort: '-createdAt',
  })

  return fetchFromPayload<Review>(`reviews?${params.toString()}`, {
    next: { revalidate: 300 }, // Revalidate every 5 minutes
    ...options,
  })
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Fetch all slugs for a collection (used for static site generation)
 */
export async function getAllSlugs(
  collection: 'herbs' | 'formulas' | 'conditions' | 'practitioners' | 'modalities'
): Promise<string[]> {
  try {
    const params = buildQueryParams({
      limit: 1000,
      'where[_status][equals]': 'published',
    })

    const response = await fetchFromPayload<{ slug: string }>(
      `${collection}?${params.toString()}`,
      { next: { revalidate: 86400 } } // Revalidate daily
    )

    return response.docs.map((doc) => doc.slug).filter(Boolean)
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
  const results = await Promise.all(
    collections.map(async (collection) => {
      const params = buildQueryParams({
        limit,
        'where[title][contains]': query,
        'where[_status][equals]': 'published',
      })

      try {
        const response = await fetchFromPayload<any>(`${collection}?${params.toString()}`, {
          cache: 'no-store',
        })
        return { collection, docs: response.docs }
      } catch (error) {
        console.error(`Error searching ${collection}:`, error)
        return { collection, docs: [] }
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
    const params = buildQueryParams({
      limit: 0, // Don't return docs, just count
      'where[_status][equals]': 'published',
    })

    const response = await fetchFromPayload<any>(`${collection}?${params.toString()}`, {
      next: { revalidate: 3600 },
    })

    return { total: response.totalDocs }
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
  limit: number = 6,
  options?: FetchOptions
): Promise<T[]> {
  const params = buildQueryParams({
    limit,
    'where[_status][equals]': 'published',
    sort: '-averageRating',
  })

  const response = await fetchFromPayload<T>(`${collection}?${params.toString()}`, {
    next: { revalidate: 7200 }, // Revalidate every 2 hours
    ...options,
  })

  return response.docs
}
