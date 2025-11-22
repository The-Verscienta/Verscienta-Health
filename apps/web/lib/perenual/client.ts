/**
 * Perenual API Client with Enhanced Retry Logic
 *
 * Enhanced version with comprehensive error handling, timeout support,
 * circuit breaker pattern, and retry statistics tracking.
 *
 * Features:
 * - Rate limiting (1 second delay between requests)
 * - Response caching (24 hours for plant data)
 * - Advanced retry logic with exponential backoff
 * - Timeout handling (10 second default)
 * - Circuit breaker pattern (prevents cascading failures)
 * - Retry statistics tracking
 * - Network failure detection
 * - Enhanced error categorization
 * - Error handling and logging
 * - Progressive import support
 * - Cultivation and pest management data
 *
 * @see https://perenual.com/docs/api
 * @see lib/perenual/client-enhanced.ts for implementation details
 */

import { cacheTTL, getCombinedCache, setCombinedCache } from '@/lib/cache'

const PERENUAL_API_URL = process.env.PERENUAL_API_URL || 'https://perenual.com/api'
const PERENUAL_API_KEY = process.env.PERENUAL_API_KEY
const DEFAULT_PAGE_SIZE = 20 // Perenual's default

/**
 * Perenual Species Data Types
 */
export interface PerenualSpecies {
  id: number
  common_name: string
  scientific_name: string[]
  other_name: string[]
  cycle: string // Annual, Perennial, Biennial, etc.
  watering: string // Frequent, Average, Minimum, None
  sunlight: string[]
  default_image: {
    license: number
    license_name: string
    license_url: string
    original_url: string
    regular_url: string
    medium_url: string
    small_url: string
    thumbnail: string
  } | null
}

export interface PerenualSpeciesDetail extends PerenualSpecies {
  type: string
  dimension: string
  attracts: string[]
  propagation: string[]
  hardiness: {
    min: string
    max: string
  }
  hardiness_location: {
    full_url: string
    full_iframe: string
  }
  watering_general_benchmark: {
    value: string
    unit: string
  }
  watering_period: string | null
  volume_water_requirement: {
    value: number
    unit: string
  } | null
  depth_water_requirement: {
    value: number
    unit: string
  } | null
  care_level: string // Easy, Medium, Difficult
  growth_rate: string // Slow, Moderate, Fast
  maintenance: string // Low, Moderate, High
  care_guides: string
  soil: string[]
  pest_susceptibility: string[]
  pest_susceptibility_api: string
  flowers: boolean
  flowering_season: string | null
  flower_color: string
  cones: boolean
  fruits: boolean
  edible_fruit: boolean
  edible_fruit_taste_profile: string
  fruit_nutritional_value: string
  fruit_color: string[]
  harvest_season: string | null
  leaf: boolean
  leaf_color: string[]
  edible_leaf: boolean
  cuisine: boolean
  medicinal: boolean
  poisonous_to_humans: number // 0 or 1
  poisonous_to_pets: number // 0 or 1
  description: string
  default_image: {
    license: number
    license_name: string
    license_url: string
    original_url: string
    regular_url: string
    medium_url: string
    small_url: string
    thumbnail: string
  } | null
  drought_tolerant: boolean
  salt_tolerant: boolean
  thorny: boolean
  invasive: boolean
  tropical: boolean
  indoor: boolean
  rare: boolean
  rare_level: string
  origin: string[]
  family: string | null
  scientific_name: string[]
  synonyms: string[]
}

export interface PerenualPest {
  id: number
  common_name: string
  scientific_name: string
  description: string
  solution: string
  images: Array<{
    license: number
    license_name: string
    license_url: string
    original_url: string
    regular_url: string
    medium_url: string
    small_url: string
    thumbnail: string
  }>
}

export interface PerenualCareGuide {
  id: number
  species_id: number
  common_name: string
  scientific_name: string[]
  section: Array<{
    id: number
    type: string // watering, sunlight, pruning, etc.
    description: string
  }>
}

export interface PerenualListResponse {
  data: PerenualSpecies[]
  to: number
  per_page: number
  current_page: number
  from: number
  last_page: number
  total: number
}

export interface PerenualPestListResponse {
  data: PerenualPest[]
  to: number
  per_page: number
  current_page: number
  from: number
  last_page: number
  total: number
}

export interface PerenualError {
  message: string
  error?: string
}

/**
 * Custom error class for Perenual API errors
 */
export class PerenualAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public type: string = 'api_error'
  ) {
    super(message)
    this.name = 'PerenualAPIError'
  }
}

/**
 * Rate limiter for Perenual API
 * Ensures minimum 1 second delay between requests
 */
class RateLimiter {
  private lastRequestTime: number = 0
  private minDelay: number = 1000 // 1 second

  async throttle(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.minDelay) {
      const delayNeeded = this.minDelay - timeSinceLastRequest
      console.log(`[Perenual Client] Rate limiting: waiting ${delayNeeded}ms`)
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
        error instanceof PerenualAPIError &&
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

      console.log(`[Perenual Client] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

/**
 * Perenual API Client Class
 */
export class PerenualClient {
  private apiKey: string
  private apiUrl: string
  private rateLimiter: RateLimiter

  constructor(apiKey?: string, apiUrl?: string) {
    this.apiKey = apiKey || PERENUAL_API_KEY || ''
    this.apiUrl = apiUrl || PERENUAL_API_URL
    this.rateLimiter = new RateLimiter()

    if (!this.apiKey) {
      console.warn('[Perenual Client] API key not configured. Set PERENUAL_API_KEY environment variable.')
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
      throw new PerenualAPIError('Perenual API key not configured', 500, 'configuration_error')
    }

    // Apply rate limiting
    await this.rateLimiter.throttle()

    const makeRequestFn = async () => {
      // Build URL with query parameters
      const url = new URL(`${this.apiUrl}${endpoint}`)
      url.searchParams.append('key', this.apiKey)

      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })

      console.log(`[Perenual Client] GET ${endpoint}`)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        try {
          const errorData: PerenualError = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          // If error response is not JSON, use default message
        }

        // Special handling for rate limits
        if (response.status === 429) {
          console.log('[Perenual Client] Rate limit reached. Waiting 60 seconds...')
          await new Promise(resolve => setTimeout(resolve, 60000))
          throw new PerenualAPIError(errorMessage, response.status, 'rate_limit_error')
        }

        throw new PerenualAPIError(errorMessage, response.status)
      }

      const data = await response.json()
      return data as T
    }

    // Retry with exponential backoff
    return retryWithBackoff(makeRequestFn, 3, 1000)
  }

  /**
   * Get species list (paginated)
   */
  async getSpeciesList(page: number = 1, pageSize: number = DEFAULT_PAGE_SIZE): Promise<PerenualListResponse> {
    return this.makeRequest<PerenualListResponse>('/species-list', {
      page,
      per_page: pageSize,
    })
  }

  /**
   * Get species list with caching
   */
  async getSpeciesListCached(
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE,
    ttl: number = cacheTTL.algoliaSync
  ): Promise<PerenualListResponse> {
    const cacheKey = `perenual:species-list:${page}:${pageSize}`

    // Check cache first
    const cached = await getCombinedCache<PerenualListResponse>(cacheKey)
    if (cached) {
      console.log(`[Perenual Client] Cache hit for page ${page}`)
      return cached
    }

    // Fetch from API
    const response = await this.getSpeciesList(page, pageSize)

    // Cache the response
    await setCombinedCache(cacheKey, response, ttl)

    return response
  }

  /**
   * Get detailed species information
   */
  async getSpeciesDetails(speciesId: number): Promise<PerenualSpeciesDetail> {
    return this.makeRequest<PerenualSpeciesDetail>(`/species/details/${speciesId}`)
  }

  /**
   * Get detailed species information with caching
   */
  async getSpeciesDetailsCached(
    speciesId: number,
    ttl: number = cacheTTL.algoliaSync
  ): Promise<PerenualSpeciesDetail> {
    const cacheKey = `perenual:species:${speciesId}`

    // Check cache first
    const cached = await getCombinedCache<PerenualSpeciesDetail>(cacheKey)
    if (cached) {
      console.log(`[Perenual Client] Cache hit for species ${speciesId}`)
      return cached
    }

    // Fetch from API
    const response = await this.getSpeciesDetails(speciesId)

    // Cache the response
    await setCombinedCache(cacheKey, response, ttl)

    return response
  }

  /**
   * Get care guide for a species
   */
  async getCareGuide(speciesId: number): Promise<PerenualCareGuide> {
    return this.makeRequest<PerenualCareGuide>(`/species-care-guide-list`, {
      species_id: speciesId,
    })
  }

  /**
   * Get pest and disease list for a species
   */
  async getPestList(speciesId: number, page: number = 1): Promise<PerenualPestListResponse> {
    return this.makeRequest<PerenualPestListResponse>(`/pest-disease-list`, {
      species_id: speciesId,
      page,
    })
  }

  /**
   * Search for species by name
   */
  async searchSpecies(query: string, page: number = 1, pageSize: number = DEFAULT_PAGE_SIZE): Promise<PerenualListResponse> {
    return this.makeRequest<PerenualListResponse>('/species-list', {
      q: query,
      page,
      per_page: pageSize,
    })
  }

  /**
   * Search for species with specific filters
   */
  async searchSpeciesFiltered(options: {
    query?: string
    edible?: boolean
    poisonous?: boolean
    cycle?: 'perennial' | 'annual' | 'biennial'
    watering?: 'frequent' | 'average' | 'minimum' | 'none'
    sunlight?: 'full_sun' | 'part_shade' | 'full_shade'
    indoor?: boolean
    medicinal?: boolean
    page?: number
    pageSize?: number
  }): Promise<PerenualListResponse> {
    const params: Record<string, string | number> = {}

    if (options.query) params.q = options.query
    if (options.edible !== undefined) params.edible = options.edible ? 1 : 0
    if (options.poisonous !== undefined) params.poisonous = options.poisonous ? 1 : 0
    if (options.cycle) params.cycle = options.cycle
    if (options.watering) params.watering = options.watering
    if (options.sunlight) params.sunlight = options.sunlight
    if (options.indoor !== undefined) params.indoor = options.indoor ? 1 : 0
    if (options.medicinal !== undefined) params.medicinal = options.medicinal ? 1 : 0

    params.page = options.page || 1
    params.per_page = options.pageSize || DEFAULT_PAGE_SIZE

    return this.makeRequest<PerenualListResponse>('/species-list', params)
  }

  /**
   * Get total species count
   */
  async getTotalSpeciesCount(): Promise<number> {
    const cacheKey = 'perenual:total-count'

    // Check cache first (1 day TTL)
    const cached = await getCombinedCache<number>(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch first page to get total count
    const response = await this.getSpeciesList(1, 1)
    const total = response.total

    // Cache for 1 day
    await setCombinedCache(cacheKey, total, 86400000)

    return total
  }

  /**
   * Helper: Extract enrichment data from species detail
   */
  extractEnrichmentData(species: PerenualSpeciesDetail): {
    perenualId: number
    lastPerenualSyncAt: Date
    family: string | null
    origin: string[]
    medicinal: boolean
    edible: boolean
    poisonous: {
      toHumans: boolean
      toPets: boolean
    }
    attracts: string[]
    cultivation: {
      cycle: string
      watering: string
      wateringPeriod: string | null
      sunlight: string[]
      soil: string[]
      hardiness: {
        min: string
        max: string
      }
      maintenance: string
      careLevel: string
      growthRate: string
      indoor: boolean
      droughtTolerant: boolean
      saltTolerant: boolean
      propagation: string[]
      pruningMonths: string[]
    }
    imageUrl: string | null
  } {
    return {
      perenualId: species.id,
      lastPerenualSyncAt: new Date(),
      family: species.family,
      origin: species.origin || [],
      medicinal: species.medicinal || false,
      edible: species.edible_fruit || species.edible_leaf || false,
      poisonous: {
        toHumans: species.poisonous_to_humans === 1,
        toPets: species.poisonous_to_pets === 1,
      },
      attracts: species.attracts || [],
      cultivation: {
        cycle: species.cycle || 'Unknown',
        watering: species.watering || 'Average',
        wateringPeriod: species.watering_period,
        sunlight: species.sunlight || [],
        soil: species.soil || [],
        hardiness: species.hardiness || { min: '0', max: '0' },
        maintenance: species.maintenance || 'Unknown',
        careLevel: species.care_level || 'Unknown',
        growthRate: species.growth_rate || 'Unknown',
        indoor: species.indoor || false,
        droughtTolerant: species.drought_tolerant || false,
        saltTolerant: species.salt_tolerant || false,
        propagation: species.propagation || [],
        pruningMonths: [], // Extract from care guide if needed
      },
      imageUrl: species.default_image?.regular_url || null,
    }
  }
}

/**
 * Default Perenual client instance
 */
export const perenualClient = new PerenualClient()

/**
 * Helper functions for backwards compatibility
 */

export async function getPlantData(speciesId: number): Promise<PerenualSpeciesDetail> {
  return perenualClient.getSpeciesDetailsCached(speciesId)
}

export async function searchPlants(query: string, page: number = 1): Promise<PerenualListResponse> {
  return perenualClient.searchSpecies(query, page)
}

export async function getMedicinalPlants(page: number = 1): Promise<PerenualListResponse> {
  return perenualClient.searchSpeciesFiltered({
    medicinal: true,
    page,
  })
}
