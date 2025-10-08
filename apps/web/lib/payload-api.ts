/**
 * Payload CMS API Client
 *
 * Centralized client for fetching data from Payload CMS
 */

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

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

interface FetchOptions {
  next?: NextFetchRequestConfig
  cache?: RequestCache
}

/**
 * Generic fetch function for Payload CMS API
 */
async function fetchFromPayload<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${CMS_URL}/api/${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: options.next,
      cache: options.cache || 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch from ${endpoint}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching from Payload CMS (${endpoint}):`, error)
    throw error
  }
}

/**
 * Fetch herbs with pagination and optional search
 */
export async function getHerbs(
  page: number = 1,
  limit: number = 12,
  query?: string
): Promise<PaginatedResponse<unknown>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  if (query) {
    params.append('where[title][contains]', query)
  }

  return fetchFromPayload(`herbs?${params.toString()}`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  })
}

/**
 * Fetch a single herb by slug
 */
export async function getHerbBySlug(slug: string): Promise<{ docs: unknown[] }> {
  const params = new URLSearchParams({
    where: JSON.stringify({ slug: { equals: slug } }),
    limit: '1',
  })

  return fetchFromPayload(`herbs?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
}

/**
 * Fetch formulas with pagination and optional search
 */
export async function getFormulas(
  page: number = 1,
  limit: number = 12,
  query?: string
): Promise<PaginatedResponse<unknown>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  if (query) {
    params.append('where[title][contains]', query)
  }

  return fetchFromPayload(`formulas?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
}

/**
 * Fetch a single formula by slug
 */
export async function getFormulaBySlug(slug: string): Promise<{ docs: unknown[] }> {
  const params = new URLSearchParams({
    where: JSON.stringify({ slug: { equals: slug } }),
    limit: '1',
  })

  return fetchFromPayload(`formulas?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
}

/**
 * Fetch conditions with pagination and optional search
 */
export async function getConditions(
  page: number = 1,
  limit: number = 12,
  query?: string
): Promise<PaginatedResponse<unknown>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  if (query) {
    params.append('where[title][contains]', query)
  }

  return fetchFromPayload(`conditions?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
}

/**
 * Fetch a single condition by slug
 */
export async function getConditionBySlug(slug: string): Promise<{ docs: unknown[] }> {
  const params = new URLSearchParams({
    where: JSON.stringify({ slug: { equals: slug } }),
    limit: '1',
  })

  return fetchFromPayload(`conditions?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
}

/**
 * Fetch practitioners with pagination and optional filters
 */
export async function getPractitioners(
  page: number = 1,
  limit: number = 12,
  location?: string
): Promise<PaginatedResponse<unknown>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  if (location) {
    params.append('where[address.city][contains]', location)
  }

  return fetchFromPayload(`practitioners?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
}

/**
 * Fetch a single practitioner by slug
 */
export async function getPractitionerBySlug(slug: string): Promise<{ docs: unknown[] }> {
  const params = new URLSearchParams({
    where: JSON.stringify({ slug: { equals: slug } }),
    limit: '1',
  })

  return fetchFromPayload(`practitioners?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
}

/**
 * Fetch modalities with pagination
 */
export async function getModalities(
  page: number = 1,
  limit: number = 12
): Promise<PaginatedResponse<unknown>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  return fetchFromPayload(`modalities?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
}

/**
 * Fetch a single modality by slug
 */
export async function getModalityBySlug(slug: string): Promise<{ docs: unknown[] }> {
  const params = new URLSearchParams({
    where: JSON.stringify({ slug: { equals: slug } }),
    limit: '1',
  })

  return fetchFromPayload(`modalities?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
}

/**
 * Fetch all slugs for a collection (used for sitemap generation)
 */
export async function getAllSlugs(
  collection: 'herbs' | 'formulas' | 'conditions' | 'practitioners' | 'modalities'
): Promise<string[]> {
  try {
    const response = await fetchFromPayload<PaginatedResponse<{ slug: string }>>(
      `${collection}?limit=1000&select=slug`,
      { next: { revalidate: 86400 } } // Revalidate daily
    )
    return response.docs.map((doc) => doc.slug)
  } catch (error) {
    console.error(`Error fetching slugs for ${collection}:`, error)
    return []
  }
}
