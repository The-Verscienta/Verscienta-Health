/**
 * Trefle API Client - Enhanced with Advanced Resilience Features
 *
 * Comprehensive Trefle client with timeout handling, circuit breaker pattern,
 * enhanced retry logic, and statistics tracking for robust API interactions.
 *
 * Features:
 * - Timeout handling (10-second default)
 * - Circuit breaker pattern (prevents cascading failures)
 * - Enhanced retry logic with smart error categorization
 * - Statistics tracking (10 metrics)
 * - Rate limiting (500ms delay, 120 requests/minute)
 * - Network failure detection
 * - Enhanced error categorization
 *
 * @see https://docs.trefle.io/
 * @see docs/API_RETRY_LOGIC_TREFLE.md for detailed documentation
 */

import type {
  TreflePlant,
  TreflePlantDetail,
  TrefleListResponse,
  TrefleError,
} from './client'
import { cacheKeys, cacheTTL, getCombinedCache, setCombinedCache } from '@/lib/cache'

const TREFLE_API_URL = process.env.TREFLE_API_URL || 'https://trefle.io/api/v1'
const TREFLE_API_KEY = process.env.TREFLE_API_KEY
const DEFAULT_PAGE_SIZE = 20
const DEFAULT_TIMEOUT_MS = 10000 // 10 seconds

/**
 * Enhanced Error Classes
 */
export class TrefleAPIError extends Error {
  public retryable: boolean = true

  constructor(
    message: string,
    public statusCode: number,
    public type: string = 'api_error'
  ) {
    super(message)
    this.name = 'TrefleAPIError'

    // 4xx errors (except 429) are not retryable
    if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
      this.retryable = false
    }
  }
}

export class TrefleTimeoutError extends Error {
  constructor(endpoint: string, timeoutMs: number) {
    super(`Request to ${endpoint} timed out after ${timeoutMs}ms`)
    this.name = 'TrefleTimeoutError'
  }
}

export class TrefleNetworkError extends Error {
  constructor(endpoint: string, cause: Error) {
    super(`Network error calling ${endpoint}: ${cause.message}`)
    this.name = 'TrefleNetworkError'
  }
}

export class TrefleCircuitBreakerError extends Error {
  constructor(failureCount: number, resetTime: Date) {
    super(
      `Circuit breaker is OPEN due to ${failureCount} consecutive failures. ` +
        `Will attempt recovery at ${resetTime.toISOString()}`
    )
    this.name = 'TrefleCircuitBreakerError'
  }
}

/**
 * Statistics Tracker
 */
export interface RetryStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  retriedRequests: number
  totalRetries: number
  timeoutErrors: number
  networkErrors: number
  rateLimitErrors: number
  circuitBreakerTrips: number
  avgResponseTimeMs: number
}

class StatsTracker {
  private stats: RetryStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    retriedRequests: 0,
    totalRetries: 0,
    timeoutErrors: 0,
    networkErrors: 0,
    rateLimitErrors: 0,
    circuitBreakerTrips: 0,
    avgResponseTimeMs: 0,
  }

  private responseTimes: number[] = []

  recordRequest(): void {
    this.stats.totalRequests++
  }

  recordSuccess(responseTimeMs: number): void {
    this.stats.successfulRequests++
    this.responseTimes.push(responseTimeMs)
    this.updateAvgResponseTime()
  }

  recordFailure(): void {
    this.stats.failedRequests++
  }

  recordRetry(): void {
    this.stats.totalRetries++
  }

  recordRetriedRequest(): void {
    this.stats.retriedRequests++
  }

  recordTimeout(): void {
    this.stats.timeoutErrors++
  }

  recordNetworkError(): void {
    this.stats.networkErrors++
  }

  recordRateLimit(): void {
    this.stats.rateLimitErrors++
  }

  recordCircuitBreakerTrip(): void {
    this.stats.circuitBreakerTrips++
  }

  private updateAvgResponseTime(): void {
    if (this.responseTimes.length === 0) {
      this.stats.avgResponseTimeMs = 0
      return
    }

    const sum = this.responseTimes.reduce((a, b) => a + b, 0)
    this.stats.avgResponseTimeMs = Math.round(sum / this.responseTimes.length)
  }

  getStats(): Readonly<RetryStats> {
    return { ...this.stats }
  }

  reset(): void {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retriedRequests: 0,
      totalRetries: 0,
      timeoutErrors: 0,
      networkErrors: 0,
      rateLimitErrors: 0,
      circuitBreakerTrips: 0,
      avgResponseTimeMs: 0,
    }
    this.responseTimes = []
  }
}

/**
 * Circuit Breaker Pattern
 */
enum CircuitState {
  CLOSED = 'CLOSED',   // Normal operation
  OPEN = 'OPEN',       // Circuit tripped, reject requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount: number = 0
  private successCount: number = 0
  private nextAttemptTime: number = 0

  private readonly failureThreshold: number
  private readonly resetTimeoutMs: number
  private readonly successThreshold: number

  constructor(
    failureThreshold: number = 5,
    resetTimeoutMs: number = 60000, // 60 seconds
    successThreshold: number = 2
  ) {
    this.failureThreshold = failureThreshold
    this.resetTimeoutMs = resetTimeoutMs
    this.successThreshold = successThreshold
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is OPEN
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new TrefleCircuitBreakerError(
          this.failureCount,
          new Date(this.nextAttemptTime)
        )
      }

      // Try to recover
      this.state = CircuitState.HALF_OPEN
      this.successCount = 0
      console.log('[Trefle Circuit Breaker] Attempting recovery (HALF_OPEN)')
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failureCount = 0

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++

      if (this.successCount >= this.successThreshold) {
        console.log('[Trefle Circuit Breaker] Recovery successful (CLOSED)')
        this.state = CircuitState.CLOSED
        this.successCount = 0
      }
    }
  }

  private onFailure(): void {
    this.failureCount++

    if (this.failureCount >= this.failureThreshold) {
      console.log(
        `[Trefle Circuit Breaker] Threshold reached (${this.failureCount} failures), opening circuit (OPEN)`
      )
      this.state = CircuitState.OPEN
      this.nextAttemptTime = Date.now() + this.resetTimeoutMs
    }
  }

  getState(): CircuitState {
    return this.state
  }

  reset(): void {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.nextAttemptTime = 0
  }
}

/**
 * Rate Limiter
 */
class RateLimiter {
  private lastRequestTime: number = 0
  private readonly minDelay: number

  constructor(minDelay: number = 500) {
    this.minDelay = minDelay
  }

  async throttle(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.minDelay) {
      const delayNeeded = this.minDelay - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, delayNeeded))
    }

    this.lastRequestTime = Date.now()
  }
}

/**
 * Error Categorization
 */
function categorizeError(error: unknown): {
  retryable: boolean
  type: 'timeout' | 'network' | 'rate_limit' | 'server_error' | 'client_error' | 'unknown'
  waitMs?: number
} {
  if (error instanceof TrefleTimeoutError) {
    return { retryable: true, type: 'timeout' }
  }

  if (error instanceof TrefleNetworkError) {
    return { retryable: true, type: 'network' }
  }

  if (error instanceof TrefleAPIError) {
    if (error.statusCode === 429) {
      return { retryable: true, type: 'rate_limit', waitMs: 60000 }
    }

    if (error.statusCode >= 500) {
      return { retryable: true, type: 'server_error' }
    }

    if (error.statusCode >= 400) {
      return { retryable: false, type: 'client_error' }
    }
  }

  return { retryable: true, type: 'unknown' }
}

/**
 * Enhanced Retry Logic with Exponential Backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  stats: StatsTracker,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  let hasRetried = false

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      const errorCategory = categorizeError(error)

      // Record retry attempt
      if (attempt > 0) {
        stats.recordRetry()
        hasRetried = true
      }

      // Don't retry if error is not retryable
      if (!errorCategory.retryable) {
        if (hasRetried) {
          stats.recordRetriedRequest()
        }
        throw error
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        if (hasRetried) {
          stats.recordRetriedRequest()
        }
        throw error
      }

      // Use custom wait time for rate limits, otherwise exponential backoff
      const delay = errorCategory.waitMs ||
        (baseDelay * Math.pow(2, attempt) + Math.random() * 1000)

      console.log(
        `[Trefle Client] ${errorCategory.type} error, ` +
          `retrying (${attempt + 1}/${maxRetries}) after ${Math.round(delay)}ms`
      )

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  if (hasRetried) {
    stats.recordRetriedRequest()
  }

  throw lastError || new Error('Max retries exceeded')
}

/**
 * Timeout Helper
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: Error
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(timeoutError), timeoutMs)
    ),
  ])
}

/**
 * Enhanced Trefle API Client
 */
export class TrefleClientEnhanced {
  private apiKey: string
  private apiUrl: string
  private rateLimiter: RateLimiter
  private circuitBreaker: CircuitBreaker
  private stats: StatsTracker
  private requestTimeout: number

  constructor(
    apiKey?: string,
    apiUrl?: string,
    options: {
      requestTimeout?: number
      circuitBreakerThreshold?: number
      circuitBreakerResetTimeout?: number
      rateLimitDelay?: number
    } = {}
  ) {
    this.apiKey = apiKey || TREFLE_API_KEY || ''
    this.apiUrl = apiUrl || TREFLE_API_URL
    this.requestTimeout = options.requestTimeout || DEFAULT_TIMEOUT_MS
    this.rateLimiter = new RateLimiter(options.rateLimitDelay || 500)
    this.circuitBreaker = new CircuitBreaker(
      options.circuitBreakerThreshold || 5,
      options.circuitBreakerResetTimeout || 60000
    )
    this.stats = new StatsTracker()

    if (!this.apiKey) {
      console.warn('[Trefle Client Enhanced] API key not configured. Set TREFLE_API_KEY environment variable.')
    }
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * Get retry/error statistics
   */
  getStats(): Readonly<RetryStats> {
    return this.stats.getStats()
  }

  /**
   * Get circuit breaker state
   */
  getCircuitState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.circuitBreaker.getState()
  }

  /**
   * Reset circuit breaker and statistics
   */
  reset(): void {
    this.circuitBreaker.reset()
    this.stats.reset()
    console.log('[Trefle Client Enhanced] Circuit breaker and statistics reset')
  }

  /**
   * Make an API request with all enhancements
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new TrefleAPIError('Trefle API key not configured', 500, 'configuration_error')
    }

    this.stats.recordRequest()

    // Apply rate limiting
    await this.rateLimiter.throttle()

    const startTime = Date.now()

    const makeRequestFn = async () => {
      // Build URL
      const url = new URL(`${this.apiUrl}${endpoint}`)
      url.searchParams.append('token', this.apiKey)

      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })

      console.log(`[Trefle Client Enhanced] GET ${endpoint}`)

      try {
        // Wrap fetch with timeout
        const response = await withTimeout(
          fetch(url.toString(), {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }),
          this.requestTimeout,
          new TrefleTimeoutError(endpoint, this.requestTimeout)
        )

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`

          try {
            const errorData: TrefleError = await response.json()
            errorMessage = errorData.message || errorData.error || errorMessage
          } catch (e) {
            // If error response is not JSON, use default message
          }

          // Track rate limit errors
          if (response.status === 429) {
            this.stats.recordRateLimit()
            console.log('[Trefle Client Enhanced] Rate limit reached, will retry after 60s')
          }

          throw new TrefleAPIError(errorMessage, response.status)
        }

        const data = await response.json()
        return data as T
      } catch (error) {
        // Categorize and track error
        if (error instanceof TrefleTimeoutError) {
          this.stats.recordTimeout()
        } else if (error instanceof TypeError && error.message.includes('fetch')) {
          this.stats.recordNetworkError()
          throw new TrefleNetworkError(endpoint, error)
        }

        throw error
      }
    }

    try {
      // Execute with circuit breaker and retry logic
      const result = await this.circuitBreaker.execute(() =>
        retryWithBackoff(makeRequestFn, this.stats, 3, 1000)
      )

      const responseTime = Date.now() - startTime
      this.stats.recordSuccess(responseTime)

      return result
    } catch (error) {
      this.stats.recordFailure()

      if (error instanceof TrefleCircuitBreakerError) {
        this.stats.recordCircuitBreakerTrip()
      }

      throw error
    }
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

    const cached = await getCombinedCache<TrefleListResponse>(cacheKey)
    if (cached) {
      console.log(`[Trefle Client Enhanced] Cache hit for page ${page}`)
      return cached
    }

    const response = await this.getPlants(page, pageSize)
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

    const cached = await getCombinedCache<{ data: TreflePlantDetail }>(cacheKey)
    if (cached) {
      console.log(`[Trefle Client Enhanced] Cache hit for plant ${plantId}`)
      return cached
    }

    const response = await this.getPlantById(plantId)
    await setCombinedCache(cacheKey, response, ttl)

    return response
  }

  /**
   * Find best matching plant
   */
  async findBestMatch(scientificName: string, commonName?: string): Promise<TreflePlant | null> {
    try {
      const results = await this.searchByScientificName(scientificName)

      if (results.data.length > 0) {
        const exactMatch = results.data.find(
          plant => plant.scientific_name.toLowerCase() === scientificName.toLowerCase()
        )

        if (exactMatch) return exactMatch
        return results.data[0]
      }

      if (commonName) {
        const commonResults = await this.searchPlants(commonName)
        if (commonResults.data.length > 0) {
          return commonResults.data[0]
        }
      }

      return null
    } catch (error) {
      console.error('[Trefle Client Enhanced] Error finding best match:', error)
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

      const detailsResponse = await this.getPlantById(plant.id)
      const details = detailsResponse.data

      return this.extractEnrichmentData(details)
    } catch (error) {
      console.error('[Trefle Client Enhanced] Error enriching herb data:', error)
      return null
    }
  }

  /**
   * Validate scientific name
   */
  async validateScientificName(scientificName: string): Promise<{
    valid: boolean
    suggestions: string[]
    match: TreflePlant | null
  }> {
    try {
      const results = await this.searchByScientificName(scientificName)

      if (results.data.length === 0) {
        return { valid: false, suggestions: [], match: null }
      }

      const exactMatch = results.data.find(
        plant => plant.scientific_name.toLowerCase() === scientificName.toLowerCase()
      )

      if (exactMatch) {
        return { valid: true, suggestions: [], match: exactMatch }
      }

      const suggestions = results.data
        .slice(0, 3)
        .map(plant => plant.scientific_name)

      return {
        valid: false,
        suggestions,
        match: results.data[0],
      }
    } catch (error) {
      console.error('[Trefle Client Enhanced] Error validating scientific name:', error)
      return { valid: false, suggestions: [], match: null }
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
 * Default enhanced Trefle client instance
 */
export const trefleClientEnhanced = new TrefleClientEnhanced()
