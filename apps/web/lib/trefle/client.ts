/**
 * Trefle API Client with Basic Retry Logic
 *
 * Trefle provides botanical data for 1M+ plant species including:
 * - Scientific name validation
 * - Distribution data (native/introduced regions)
 * - Plant images
 * - Taxonomy (family, genus, author)
 * - Toxicity and edibility information
 * - Growth data (habit, height, form)
 *
 * Features:
 * - Rate limiting (500ms delay between requests)
 * - Response caching (24 hours for plant data)
 * - Basic retry logic with exponential backoff
 * - Error handling and logging
 *
 * @see https://docs.trefle.io/
 * @see lib/trefle/client-enhanced.ts for advanced features
 */

import { cacheKeys, cacheTTL, getCombinedCache, setCombinedCache } from '@/lib/cache'

const TREFLE_API_URL = process.env.TREFLE_API_URL || 'https://trefle.io/api/v1'
const TREFLE_API_KEY = process.env.TREFLE_API_KEY
const DEFAULT_PAGE_SIZE = 20 // Trefle's default

/**
 * Trefle Plant Data Types
 */
export interface TreflePlant {
  id: number
  common_name: string | null
  slug: string
  scientific_name: string
  year: number
  bibliography: string
  author: string
  status: string
  rank: string
  family_common_name: string | null
  genus_id: number
  image_url: string | null
  synonyms: string[]
  genus: string
  family: string
  links: {
    self: string
    plant: string
    genus: string
  }
}

export interface TreflePlantDetail extends TreflePlant {
  main_species: {
    id: number
    common_name: string | null
    slug: string
    scientific_name: string
    year: number
    bibliography: string
    author: string
    status: string
    rank: string
    family_common_name: string | null
    image_url: string | null
    synonyms: string[]
    genus: string
    family: string
    distribution: {
      native: string[]
      introduced: string[]
    }
    edible: boolean
    edible_part: string[]
    vegetable: boolean
    observations: string
    flower: {
      color: string[]
      conspicuous: boolean
    }
    foliage: {
      texture: string
      color: string[]
      leaf_retention: boolean
    }
    fruit_or_seed: {
      conspicuous: boolean
      color: string[]
      shape: string
      seed_persistence: boolean
    }
    growth: {
      description: string
      sowing: string
      days_to_harvest: number
      row_spacing: {
        cm: number
      }
      spread: {
        cm: number
      }
      ph_maximum: number
      ph_minimum: number
      light: number
      atmospheric_humidity: number
      growth_months: string[]
      bloom_months: string[]
      fruit_months: string[]
      minimum_precipitation: {
        mm: number
      }
      maximum_precipitation: {
        mm: number
      }
      minimum_root_depth: {
        cm: number
      }
      minimum_temperature: {
        deg_c: number
      }
      maximum_temperature: {
        deg_c: number
      }
      soil_nutriments: number
      soil_salinity: number
      soil_texture: number
      soil_humidity: number
    }
    specifications: {
      ligneous_type: string
      growth_form: string
      growth_habit: string
      growth_rate: string
      average_height: {
        cm: number
      }
      maximum_height: {
        cm: number
      }
      nitrogen_fixation: string
      shape_and_orientation: string
      toxicity: string
    }
  }
  sources: Array<{
    id: string
    name: string
    url: string
    citation: string
    last_update: string
  }>
}

export interface TrefleListResponse {
  data: TreflePlant[]
  links: {
    self: string
    first: string
    last: string
    next?: string
    prev?: string
  }
  meta: {
    total: number
  }
}

export interface TrefleError {
  error: string
  message?: string
}

/**
 * Custom error class for Trefle API errors
 */
export class TrefleAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public type: string = 'api_error'
  ) {
    super(message)
    this.name = 'TrefleAPIError'
  }
}

/**
 * Rate limiter for Trefle API
 * Ensures minimum 500ms delay between requests (120 requests/minute limit)
 */
class RateLimiter {
  private lastRequestTime: number = 0
  private minDelay: number = 500 // 500ms = 120 requests/minute

  async throttle(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.minDelay) {
      const delayNeeded = this.minDelay - timeSinceLastRequest
      console.log(`[Trefle Client] Rate limiting: waiting ${delayNeeded}ms`)
      await new Promise(resolve => setTimeout(resolve, delayNeeded))
    }

    this.lastRequestTime = Date.now()
  }
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry on client errors (4xx except 429)
      if (
        error instanceof TrefleAPIError &&
        error.statusCode >= 400 &&
        error.statusCode < 500 &&
        error.statusCode !== 429
      ) {
        throw error
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw error
      }

      // Calculate delay with exponential backoff + jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000

      console.log(`[Trefle Client] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

/**
 * Trefle API Client Class
 */
export class TrefleClient {
  private apiKey: string
  private apiUrl: string
  private rateLimiter: RateLimiter

  constructor(apiKey?: string, apiUrl?: string) {
    this.apiKey = apiKey || TREFLE_API_KEY || ''
    this.apiUrl = apiUrl || TREFLE_API_URL
    this.rateLimiter = new RateLimiter()

    if (!this.apiKey) {
      console.warn('[Trefle Client] API key not configured. Set TREFLE_API_KEY environment variable.')
    }
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * Make an API request with rate limiting and error handling
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new TrefleAPIError('Trefle API key not configured', 500, 'configuration_error')
    }

    // Apply rate limiting
    await this.rateLimiter.throttle()

    const makeRequestFn = async () => {
      // Build URL with query parameters
      const url = new URL(`${this.apiUrl}${endpoint}`)
      url.searchParams.append('token', this.apiKey)

      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })

      console.log(`[Trefle Client] GET ${endpoint}`)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        try {
          const errorData: TrefleError = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          // If error response is not JSON, use default message
        }

        // Special handling for rate limits
        if (response.status === 429) {
          console.log('[Trefle Client] Rate limit reached. Waiting 60 seconds...')
          await new Promise(resolve => setTimeout(resolve, 60000))
          throw new TrefleAPIError(errorMessage, response.status, 'rate_limit_error')
        }

        throw new TrefleAPIError(errorMessage, response.status)
      }

      const data = await response.json()
      return data as T
    }

    // Retry with exponential backoff
    return retryWithBackoff(makeRequestFn, 3, 1000)
  }

  /**
   * Search plants by name (scientific or common)
   */
  async searchPlants(query: string, page: number = 1, pageSize: number = DEFAULT_PAGE_SIZE): Promise<TrefleListResponse> {
    return this.makeRequest<TrefleListResponse>('/plants/search', {
      q: query,
      page,
      limit: pageSize,
    })
  }

  /**
   * Search plants by scientific name
   */
  async searchByScientificName(scientificName: string): Promise<TrefleListResponse> {
    return this.searchPlants(scientificName)
  }

  /**
   * Get plant details by ID
   */
  async getPlantById(plantId: number): Promise<{ data: TreflePlantDetail }> {
    return this.makeRequest<{ data: TreflePlantDetail }>(`/plants/${plantId}`)
  }

  /**
   * Get plant details by slug
   */
  async getPlantBySlug(slug: string): Promise<{ data: TreflePlantDetail }> {
    return this.makeRequest<{ data: TreflePlantDetail }>(`/plants/${slug}`)
  }

  /**
   * Get plants list (for progressive import)
   */
  async getPlants(page: number = 1, pageSize: number = DEFAULT_PAGE_SIZE): Promise<TrefleListResponse> {
    return this.makeRequest<TrefleListResponse>('/plants', {
      page,
      limit: pageSize,
    })
  }

  /**
   * Get plants with caching
   */
  async getPlantsCached(
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE,
    ttl: number = cacheTTL.algoliaSync
  ): Promise<TrefleListResponse> {
    const cacheKey = `trefle:plants:${page}:${pageSize}`

    // Check cache first
    const cached = await getCombinedCache<TrefleListResponse>(cacheKey)
    if (cached) {
      console.log(`[Trefle Client] Cache hit for page ${page}`)
      return cached
    }

    // Fetch from API
    const response = await this.getPlants(page, pageSize)

    // Cache the response
    await setCombinedCache(cacheKey, response, ttl)

    return response
  }

  /**
   * Get plant details with caching
   */
  async getPlantByIdCached(
    plantId: number,
    ttl: number = cacheTTL.algoliaSync
  ): Promise<{ data: TreflePlantDetail }> {
    const cacheKey = `trefle:plant:${plantId}`

    // Check cache first
    const cached = await getCombinedCache<{ data: TreflePlantDetail }>(cacheKey)
    if (cached) {
      console.log(`[Trefle Client] Cache hit for plant ${plantId}`)
      return cached
    }

    // Fetch from API
    const response = await getPlantById(plantId)

    // Cache the response
    await setCombinedCache(cacheKey, response, ttl)

    return response
  }

  /**
   * Find best matching plant by scientific name
   * Returns the first exact or closest match
   */
  async findBestMatch(scientificName: string, commonName?: string): Promise<TreflePlant | null> {
    try {
      // First try exact scientific name match
      const results = await this.searchByScientificName(scientificName)

      if (results.data.length > 0) {
        // Look for exact match
        const exactMatch = results.data.find(
          plant => plant.scientific_name.toLowerCase() === scientificName.toLowerCase()
        )

        if (exactMatch) return exactMatch

        // Return first result as closest match
        return results.data[0]
      }

      // Try common name if provided
      if (commonName) {
        const commonResults = await this.searchPlants(commonName)
        if (commonResults.data.length > 0) {
          return commonResults.data[0]
        }
      }

      return null
    } catch (error) {
      console.error('[Trefle Client] Error finding best match:', error)
      return null
    }
  }

  /**
   * Enrich herb data with Trefle information
   */
  async enrichHerbData(herb: {
    scientificName: string
    name: string
  }): Promise<any | null> {
    try {
      const plant = await this.findBestMatch(herb.scientificName, herb.name)

      if (!plant) {
        return null
      }

      // Get full plant details
      const detailsResponse = await this.getPlantById(plant.id)
      const details = detailsResponse.data

      // Extract enrichment data
      return this.extractEnrichmentData(details)
    } catch (error) {
      console.error('[Trefle Client] Error enriching herb data:', error)
      return null
    }
  }

  /**
   * Validate scientific name against Trefle
   */
  async validateScientificName(scientificName: string): Promise<{
    valid: boolean
    suggestions: string[]
    match: TreflePlant | null
  }> {
    try {
      const results = await this.searchByScientificName(scientificName)

      if (results.data.length === 0) {
        return {
          valid: false,
          suggestions: [],
          match: null,
        }
      }

      const exactMatch = results.data.find(
        plant => plant.scientific_name.toLowerCase() === scientificName.toLowerCase()
      )

      if (exactMatch) {
        return {
          valid: true,
          suggestions: [],
          match: exactMatch,
        }
      }

      // Return suggestions from similar matches
      const suggestions = results.data
        .slice(0, 3)
        .map(plant => plant.scientific_name)

      return {
        valid: false,
        suggestions,
        match: results.data[0],
      }
    } catch (error) {
      console.error('[Trefle Client] Error validating scientific name:', error)
      return {
        valid: false,
        suggestions: [],
        match: null,
      }
    }
  }

  /**
   * Extract enrichment data from plant details
   */
  extractEnrichmentData(plant: TreflePlantDetail): any {
    const mainSpecies = plant.main_species

    return {
      trefleId: plant.id,
      trefleSlug: plant.slug,
      scientificName: plant.scientific_name,
      author: plant.author,
      year: plant.year,
      bibliography: plant.bibliography,
      family: plant.family,
      genus: plant.genus,
      synonyms: mainSpecies.synonyms || [],
      commonName: plant.common_name,
      familyCommonName: plant.family_common_name,
      distributions: mainSpecies.distribution || { native: [], introduced: [] },
      edible: mainSpecies.edible || false,
      ediblePart: mainSpecies.edible_part || [],
      vegetable: mainSpecies.vegetable || false,
      toxicity: mainSpecies.specifications?.toxicity || 'none',
      growthHabit: mainSpecies.specifications?.growth_habit,
      growthForm: mainSpecies.specifications?.growth_form,
      growthRate: mainSpecies.specifications?.growth_rate,
      averageHeight: mainSpecies.specifications?.average_height,
      maximumHeight: mainSpecies.specifications?.maximum_height,
      flowerColor: mainSpecies.flower?.color || [],
      foliageColor: mainSpecies.foliage?.color || [],
      fruitColor: mainSpecies.fruit_or_seed?.color || [],
      imageUrl: plant.image_url,
      sources: plant.sources || [],
      lastSyncedAt: new Date(),
    }
  }
}

/**
 * Default Trefle client instance
 */
export const trefleClient = new TrefleClient()

/**
 * Helper functions for backwards compatibility
 */

export async function searchPlants(query: string, page: number = 1): Promise<TrefleListResponse> {
  return trefleClient.searchPlants(query, page)
}

export async function getPlantData(plantId: number): Promise<{ data: TreflePlantDetail }> {
  return trefleClient.getPlantByIdCached(plantId)
}

export async function validateScientificName(scientificName: string) {
  return trefleClient.validateScientificName(scientificName)
}

export async function enrichHerbWithTrefle(herb: { scientificName: string; name: string }) {
  return trefleClient.enrichHerbData(herb)
}
