/**
 * Strapi CMS API Client
 *
 * Adapter that transforms Strapi responses to match Payload CMS format
 * This allows frontend code to remain unchanged after migration
 */

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'

// Payload CMS response format (what the frontend expects)
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

// Strapi response format (what Strapi returns)
interface StrapiResponse<T> {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

interface FetchOptions {
  next?: NextFetchRequestConfig
  cache?: RequestCache
}

/**
 * Transform Strapi response to Payload format
 */
function transformStrapiResponse<T>(strapiResponse: StrapiResponse<T>): PaginatedResponse<T> {
  const { data, meta } = strapiResponse
  const { page, pageSize, pageCount, total } = meta.pagination

  return {
    docs: data,
    totalDocs: total,
    limit: pageSize,
    totalPages: pageCount,
    page: page,
    pagingCounter: (page - 1) * pageSize + 1,
    hasPrevPage: page > 1,
    hasNextPage: page < pageCount,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < pageCount ? page + 1 : null,
  }
}

/**
 * Generic fetch function for Strapi API
 */
async function fetchFromStrapi<T>(
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

    const strapiResponse: StrapiResponse<T> = await response.json()
    return transformStrapiResponse(strapiResponse)
  } catch (error) {
    console.error(`Error fetching from Strapi CMS (${endpoint}):`, error)
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
    'pagination[page]': page.toString(),
    'pagination[pageSize]': limit.toString(),
  })

  if (query) {
    params.append('filters[title][$containsi]', query)
  }

  return fetchFromStrapi(`herbs?${params.toString()}`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  })
}

/**
 * Fetch a single herb by slug
 */
export async function getHerbBySlug(slug: string): Promise<{ docs: unknown[] }> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'pagination[limit]': '1',
  })

  const response = await fetchFromStrapi(`herbs?${params.toString()}`, {
    next: { revalidate: 3600 },
  })

  return { docs: response.docs }
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
    'pagination[page]': page.toString(),
    'pagination[pageSize]': limit.toString(),
  })

  if (query) {
    params.append('filters[title][$containsi]', query)
  }

  return fetchFromStrapi(`formulas?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
}

/**
 * Fetch a single formula by slug
 */
export async function getFormulaBySlug(slug: string): Promise<{ docs: unknown[] }> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'pagination[limit]': '1',
  })

  const response = await fetchFromStrapi(`formulas?${params.toString()}`, {
    next: { revalidate: 3600 },
  })

  return { docs: response.docs }
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
    'pagination[page]': page.toString(),
    'pagination[pageSize]': limit.toString(),
  })

  if (query) {
    params.append('filters[title][$containsi]', query)
  }

  return fetchFromStrapi(`conditions?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
}

/**
 * Fetch a single condition by slug
 */
export async function getConditionBySlug(slug: string): Promise<{ docs: unknown[] }> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'pagination[limit]': '1',
  })

  const response = await fetchFromStrapi(`conditions?${params.toString()}`, {
    next: { revalidate: 3600 },
  })

  return { docs: response.docs }
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
    'pagination[page]': page.toString(),
    'pagination[pageSize]': limit.toString(),
  })

  if (location) {
    params.append('filters[address][city][$containsi]', location)
  }

  return fetchFromStrapi(`practitioners?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
}

/**
 * Fetch a single practitioner by slug
 */
export async function getPractitionerBySlug(slug: string): Promise<{ docs: unknown[] }> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'pagination[limit]': '1',
  })

  const response = await fetchFromStrapi(`practitioners?${params.toString()}`, {
    next: { revalidate: 3600 },
  })

  return { docs: response.docs }
}

/**
 * Fetch modalities with pagination
 */
export async function getModalities(
  page: number = 1,
  limit: number = 12
): Promise<PaginatedResponse<unknown>> {
  const params = new URLSearchParams({
    'pagination[page]': page.toString(),
    'pagination[pageSize]': limit.toString(),
  })

  return fetchFromStrapi(`modalities?${params.toString()}`, {
    next: { revalidate: 3600 },
  })
}

/**
 * Fetch a single modality by slug
 */
export async function getModalityBySlug(slug: string): Promise<{ docs: unknown[] }> {
  const params = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'pagination[limit]': '1',
  })

  const response = await fetchFromStrapi(`modalities?${params.toString()}`, {
    next: { revalidate: 3600 },
  })

  return { docs: response.docs }
}

/**
 * Fetch all slugs for a collection (used for sitemap generation)
 */
export async function getAllSlugs(
  collection: 'herbs' | 'formulas' | 'conditions' | 'practitioners' | 'modalities'
): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      'pagination[pageSize]': '1000',
      'fields[0]': 'slug',
    })

    const response = await fetchFromStrapi<{ slug: string }>(
      `${collection}?${params.toString()}`,
      { next: { revalidate: 86400 } } // Revalidate daily
    )
    return response.docs.map((doc) => doc.slug)
  } catch (error) {
    console.error(`Error fetching slugs for ${collection}:`, error)
    return []
  }
}
