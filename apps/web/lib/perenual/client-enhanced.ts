/**
 * Enhanced Perenual API Client with Advanced Retry Logic
 *
 * Improvements over basic client:
 * - Timeout handling with configurable limits
 * - Circuit breaker pattern to prevent cascading failures
 * - Enhanced error categorization and handling
 * - Retry statistics tracking
 * - Better rate limit management
 * - Network failure detection
 * - Request/response logging
 * - Metrics collection
 *
 * @see https://perenual.com/docs/api
 */

import { cacheTTL, getCombinedCache, setCombinedCache } from '@/lib/cache'

// ============================================================================
// Configuration & Constants
// ============================================================================

const PERENUAL_API_URL = process.env.PERENUAL_API_URL || 'https://perenual.com/api'
const PERENUAL_API_KEY = process.env.PERENUAL_API_KEY

// Retry configuration
const DEFAULT_MAX_RETRIES = 3
const DEFAULT_BASE_DELAY_MS = 1000
const DEFAULT_REQUEST_TIMEOUT_MS = 10000 // 10 seconds
const DEFAULT_RATE_LIMIT_DELAY_MS = 1000 // 1 second between requests
const RATE_LIMIT_429_WAIT_MS = 60000 // 60 seconds wait on 429
const DEFAULT_PAGE_SIZE = 20

// Circuit breaker configuration
const CIRCUIT_BREAKER_THRESHOLD = 5 // Failures before opening
const CIRCUIT_BREAKER_TIMEOUT_MS = 60000 // Time before trying again (60s)
const CIRCUIT_BREAKER_SUCCESS_THRESHOLD = 2 // Successes needed to close

// ============================================================================
// Types (Re-exported from original client)
// ============================================================================

export interface PerenualSpecies {
  id: number
  common_name: string
  scientific_name: string[]
  other_name: string[]
  cycle: string
  watering: string
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
  care_level: string
  growth_rate: string
  maintenance: string
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
  poisonous_to_humans: number
  poisonous_to_pets: number
  description: string
  drought_tolerant: boolean
  salt_tolerant: boolean
  thorny: boolean
  invasive: boolean
  tropical: boolean
  indoor: boolean
  rare: boolean
  rare_level: string
  family: string | null
  origin: string[]
  synonyms: string[]
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

export interface PerenualError {
  message: string
  error?: string
}

// ============================================================================
// Enhanced Error Classes
// ============================================================================

export class PerenualAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public type: string = 'api_error',
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'PerenualAPIError'
  }
}

export class PerenualTimeoutError extends Error {
  constructor(message: string, public timeoutMs: number) {
    super(message)
    this.name = 'PerenualTimeoutError'
  }
}

export class PerenualNetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'PerenualNetworkError'
  }
}

export class PerenualCircuitBreakerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PerenualCircuitBreakerError'
  }
}

// ============================================================================
// Retry Statistics
// ============================================================================

interface RetryStats {
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
    this.stats.retriedRequests++
    this.stats.totalRetries++
  }

  recordTimeout(): void {
    this.stats.timeoutErrors++
  }

  recordNetworkError(): void {
    this.stats.networkErrors++
  }

  recordRateLimitError(): void {
    this.stats.rateLimitErrors++
  }

  recordCircuitBreakerTrip(): void {
    this.stats.circuitBreakerTrips++
  }

  private updateAvgResponseTime(): void {
    if (this.responseTimes.length > 0) {
      const sum = this.responseTimes.reduce((a, b) => a + b, 0)
      this.stats.avgResponseTimeMs = Math.round(sum / this.responseTimes.length)
    }
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

// ============================================================================
// Circuit Breaker
// ============================================================================

enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount: number = 0
  private successCount: number = 0
  private nextAttemptTime: number = 0

  constructor(
    private failureThreshold: number = CIRCUIT_BREAKER_THRESHOLD,
    private timeoutMs: number = CIRCUIT_BREAKER_TIMEOUT_MS,
    private successThreshold: number = CIRCUIT_BREAKER_SUCCESS_THRESHOLD
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new PerenualCircuitBreakerError(
          `Circuit breaker is OPEN. Next attempt at ${new Date(this.nextAttemptTime).toISOString()}`
        )
      }
      // Transition to HALF_OPEN to test
      this.state = CircuitState.HALF_OPEN
      console.log('[Perenual Circuit Breaker] Transitioning to HALF_OPEN')
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
        console.log('[Perenual Circuit Breaker] Closing circuit after successful recovery')
        this.state = CircuitState.CLOSED
        this.successCount = 0
      }
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.successCount = 0

    if (this.failureCount >= this.failureThreshold) {
      console.error(
        `[Perenual Circuit Breaker] Opening circuit after ${this.failureCount} failures`
      )
      this.state = CircuitState.OPEN
      this.nextAttemptTime = Date.now() + this.timeoutMs
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

// ============================================================================
// Rate Limiter
// ============================================================================

class RateLimiter {
  private lastRequestTime: number = 0
  private minDelay: number

  constructor(minDelayMs: number = DEFAULT_RATE_LIMIT_DELAY_MS) {
    this.minDelay = minDelayMs
  }

  async throttle(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.minDelay) {
      const delayNeeded = this.minDelay - timeSinceLastRequest
      console.log(`[Perenual Rate Limiter] Waiting ${delayNeeded}ms`)
      await new Promise((resolve) => setTimeout(resolve, delayNeeded))
    }

    this.lastRequestTime = Date.now()
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Execute promise with timeout
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string = 'operation'
): Promise<T> {
  const timeout = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(new PerenualTimeoutError(`${operationName} timed out after ${timeoutMs}ms`, timeoutMs))
    }, timeoutMs)
  })

  return Promise.race([promise, timeout])
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Categorize error for retry logic
 */
function categorizeError(error: unknown): {
  retryable: boolean
  type: string
  waitMs?: number
} {
  // Timeout errors - retryable
  if (error instanceof PerenualTimeoutError) {
    return { retryable: true, type: 'timeout' }
  }

  // Network errors - retryable
  if (error instanceof PerenualNetworkError) {
    return { retryable: true, type: 'network' }
  }

  // Circuit breaker - not retryable
  if (error instanceof PerenualCircuitBreakerError) {
    return { retryable: false, type: 'circuit_breaker' }
  }

  // API errors
  if (error instanceof PerenualAPIError) {
    // Rate limit - retryable with wait
    if (error.statusCode === 429) {
      return { retryable: true, type: 'rate_limit', waitMs: RATE_LIMIT_429_WAIT_MS }
    }

    // Server errors (5xx) - retryable
    if (error.statusCode >= 500) {
      return { retryable: true, type: 'server_error' }
    }

    // Client errors (4xx except 429) - not retryable
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return { retryable: false, type: 'client_error' }
    }
  }

  // Unknown errors - retryable with caution
  return { retryable: true, type: 'unknown' }
}

/**
 * Enhanced retry with exponential backoff and error categorization
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  stats: StatsTracker,
  maxRetries: number = DEFAULT_MAX_RETRIES,
  baseDelay: number = DEFAULT_BASE_DELAY_MS
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      const { retryable, type, waitMs } = categorizeError(error)

      // Log error
      console.error(`[Perenual Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed: ${type}`, {
        message: lastError.message,
        retryable,
      })

      // Update stats
      if (type === 'timeout') stats.recordTimeout()
      if (type === 'network') stats.recordNetworkError()
      if (type === 'rate_limit') stats.recordRateLimitError()

      // Don't retry if not retryable
      if (!retryable) {
        console.error(`[Perenual Retry] Error not retryable: ${type}`)
        throw error
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        console.error(`[Perenual Retry] Max retries (${maxRetries}) exceeded`)
        throw error
      }

      // Record retry
      stats.recordRetry()

      // Calculate delay
      let delay: number
      if (waitMs) {
        delay = waitMs
      } else {
        // Exponential backoff with jitter
        delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      }

      console.log(`[Perenual Retry] Retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

// ============================================================================
// Enhanced Perenual Client
// ============================================================================

export class PerenualClientEnhanced {
  private apiKey: string
  private apiUrl: string
  private rateLimiter: RateLimiter
  private circuitBreaker: CircuitBreaker
  private stats: StatsTracker
  private requestTimeout: number

  constructor(options: {
    apiKey?: string
    apiUrl?: string
    requestTimeout?: number
    rateLimitDelay?: number
  } = {}) {
    this.apiKey = options.apiKey || PERENUAL_API_KEY || ''
    this.apiUrl = options.apiUrl || PERENUAL_API_URL
    this.requestTimeout = options.requestTimeout || DEFAULT_REQUEST_TIMEOUT_MS
    this.rateLimiter = new RateLimiter(options.rateLimitDelay)
    this.circuitBreaker = new CircuitBreaker()
    this.stats = new StatsTracker()

    if (!this.apiKey) {
      console.warn(
        '[Perenual Client Enhanced] API key not configured. Set PERENUAL_API_KEY environment variable.'
      )
    }
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * Get retry statistics
   */
  getStats(): Readonly<RetryStats> {
    return this.stats.getStats()
  }

  /**
   * Get circuit breaker state
   */
  getCircuitState(): CircuitState {
    return this.circuitBreaker.getState()
  }

  /**
   * Reset statistics and circuit breaker
   */
  reset(): void {
    this.stats.reset()
    this.circuitBreaker.reset()
  }

  /**
   * Make an API request with comprehensive error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new PerenualAPIError('Perenual API key not configured', 500, 'configuration_error', false)
    }

    this.stats.recordRequest()

    // Apply rate limiting
    await this.rateLimiter.throttle()

    const startTime = Date.now()

    const makeRequestFn = async () => {
      // Build URL
      const url = new URL(`${this.apiUrl}${endpoint}`)
      url.searchParams.append('key', this.apiKey)

      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })

      console.log(`[Perenual Client Enhanced] GET ${endpoint}`)

      try {
        // Fetch with timeout
        const response = await withTimeout(
          fetch(url.toString(), {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }),
          this.requestTimeout,
          `GET ${endpoint}`
        )

        // Handle non-OK responses
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`

          try {
            const errorData: PerenualError = await response.json()
            errorMessage = errorData.message || errorData.error || errorMessage
          } catch (e) {
            // Error response not JSON
          }

          // Categorize by status code
          const retryable = response.status >= 500 || response.status === 429
          throw new PerenualAPIError(errorMessage, response.status, 'api_error', retryable)
        }

        const data = await response.json()
        return data as T
      } catch (error) {
        // Convert fetch errors to network errors
        if (!(error instanceof PerenualAPIError) && !(error instanceof PerenualTimeoutError)) {
          throw new PerenualNetworkError(
            `Network error: ${(error as Error).message}`,
            error as Error
          )
        }
        throw error
      }
    }

    try {
      // Execute with circuit breaker and retry
      const result = await this.circuitBreaker.execute(() =>
        retryWithBackoff(makeRequestFn, this.stats, DEFAULT_MAX_RETRIES, DEFAULT_BASE_DELAY_MS)
      )

      // Record success
      const responseTime = Date.now() - startTime
      this.stats.recordSuccess(responseTime)

      return result
    } catch (error) {
      // Record failure
      this.stats.recordFailure()

      // Record circuit breaker trip
      if (error instanceof PerenualCircuitBreakerError) {
        this.stats.recordCircuitBreakerTrip()
      }

      throw error
    }
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

    const cached = await getCombinedCache<PerenualListResponse>(cacheKey)
    if (cached) {
      console.log(`[Perenual Client Enhanced] Cache hit for page ${page}`)
      return cached
    }

    const response = await this.getSpeciesList(page, pageSize)
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

    const cached = await getCombinedCache<PerenualSpeciesDetail>(cacheKey)
    if (cached) {
      console.log(`[Perenual Client Enhanced] Cache hit for species ${speciesId}`)
      return cached
    }

    const response = await this.getSpeciesDetails(speciesId)
    await setCombinedCache(cacheKey, response, ttl)

    return response
  }

  /**
   * Search for species by name
   */
  async searchSpecies(
    query: string,
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE
  ): Promise<PerenualListResponse> {
    return this.makeRequest<PerenualListResponse>('/species-list', {
      q: query,
      page,
      per_page: pageSize,
    })
  }

  /**
   * Search with filters
   */
  async searchSpeciesFiltered(options: {
    query?: string
    medicinal?: boolean
    edible?: boolean
    poisonous?: boolean
    indoor?: boolean
    page?: number
    pageSize?: number
  }): Promise<PerenualListResponse> {
    const params: Record<string, string | number> = {}

    if (options.query) params.q = options.query
    if (options.medicinal !== undefined) params.medicinal = options.medicinal ? 1 : 0
    if (options.edible !== undefined) params.edible = options.edible ? 1 : 0
    if (options.poisonous !== undefined) params.poisonous = options.poisonous ? 1 : 0
    if (options.indoor !== undefined) params.indoor = options.indoor ? 1 : 0

    params.page = options.page || 1
    params.per_page = options.pageSize || DEFAULT_PAGE_SIZE

    return this.makeRequest<PerenualListResponse>('/species-list', params)
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
 * Default enhanced client instance
 */
export const perenualClientEnhanced = new PerenualClientEnhanced()
