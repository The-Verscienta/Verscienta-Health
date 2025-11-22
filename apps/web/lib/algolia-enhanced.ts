/**
 * Enhanced Algolia Search Client with Edge Case Handling
 *
 * Comprehensive error handling, validation, retry logic, and fallbacks
 * for robust Algolia search operations.
 *
 * Edge Cases Handled:
 * - Input validation (query length, pagination bounds, filter format)
 * - Credential validation
 * - Network failures with exponential backoff retry
 * - Rate limiting detection and handling
 * - Special character sanitization
 * - Empty/malformed results
 * - Timeout handling
 * - Invalid index names
 * - Facet query edge cases
 */

import { algoliasearch } from 'algoliasearch'

// ============================================================================
// Configuration & Constants
// ============================================================================

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || ''
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || ''

// Validation constants
const MAX_QUERY_LENGTH = 512 // Algolia max query length
const MIN_HITS_PER_PAGE = 1
const MAX_HITS_PER_PAGE = 1000 // Algolia max
const DEFAULT_HITS_PER_PAGE = 20
const MAX_PAGE_NUMBER = 1000 // Algolia max
const SEARCH_TIMEOUT_MS = 5000 // 5 second timeout
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY_MS = 1000

// Index names
export const ALGOLIA_INDEXES = {
  herbs: 'verscienta_herbs',
  formulas: 'verscienta_formulas',
  conditions: 'verscienta_conditions',
  practitioners: 'verscienta_practitioners',
  modalities: 'verscienta_modalities',
} as const

// Valid index names for validation
const VALID_INDEX_NAMES = Object.keys(ALGOLIA_INDEXES) as Array<keyof typeof ALGOLIA_INDEXES>

// ============================================================================
// Types
// ============================================================================

export interface SearchOptions {
  page?: number
  hitsPerPage?: number
  filters?: string
  facetFilters?: string[][]
  timeout?: number
}

export interface SearchResult {
  hits: unknown[]
  nbHits: number
  page: number
  nbPages: number
  hitsPerPage: number
  processingTimeMS?: number
}

export interface SearchError {
  code: string
  message: string
  details?: unknown
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate Algolia credentials are configured
 */
function validateCredentials(): { valid: boolean; error?: string } {
  if (!ALGOLIA_APP_ID || ALGOLIA_APP_ID.trim() === '') {
    return {
      valid: false,
      error: 'NEXT_PUBLIC_ALGOLIA_APP_ID is not configured',
    }
  }

  if (!ALGOLIA_SEARCH_KEY || ALGOLIA_SEARCH_KEY.trim() === '') {
    return {
      valid: false,
      error: 'NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY is not configured',
    }
  }

  return { valid: true }
}

/**
 * Sanitize search query to prevent injection and errors
 */
function sanitizeQuery(query: string): string {
  if (typeof query !== 'string') {
    return ''
  }

  // Trim whitespace
  let sanitized = query.trim()

  // Enforce max length
  if (sanitized.length > MAX_QUERY_LENGTH) {
    sanitized = sanitized.substring(0, MAX_QUERY_LENGTH)
    console.warn(`[Algolia] Query truncated to ${MAX_QUERY_LENGTH} characters`)
  }

  // Remove null bytes (can break queries)
  sanitized = sanitized.replace(/\0/g, '')

  // Algolia handles most special characters well, but we log for monitoring
  const specialChars = /[<>{}[\]\\]/g
  if (specialChars.test(sanitized)) {
    console.info('[Algolia] Query contains special characters:', sanitized)
  }

  return sanitized
}

/**
 * Validate and normalize pagination parameters
 */
function validatePagination(
  page?: number,
  hitsPerPage?: number
): { page: number; hitsPerPage: number; errors: string[] } {
  const errors: string[] = []
  let validPage = 0
  let validHitsPerPage = DEFAULT_HITS_PER_PAGE

  // Validate page
  if (page !== undefined) {
    if (typeof page !== 'number' || !Number.isInteger(page)) {
      errors.push('Page must be an integer')
      validPage = 0
    } else if (page < 0) {
      errors.push('Page must be non-negative')
      validPage = 0
    } else if (page > MAX_PAGE_NUMBER) {
      errors.push(`Page cannot exceed ${MAX_PAGE_NUMBER}`)
      validPage = MAX_PAGE_NUMBER
    } else {
      validPage = page
    }
  }

  // Validate hitsPerPage
  if (hitsPerPage !== undefined) {
    if (typeof hitsPerPage !== 'number' || !Number.isInteger(hitsPerPage)) {
      errors.push('Hits per page must be an integer')
      validHitsPerPage = DEFAULT_HITS_PER_PAGE
    } else if (hitsPerPage < MIN_HITS_PER_PAGE) {
      errors.push(`Hits per page must be at least ${MIN_HITS_PER_PAGE}`)
      validHitsPerPage = MIN_HITS_PER_PAGE
    } else if (hitsPerPage > MAX_HITS_PER_PAGE) {
      errors.push(`Hits per page cannot exceed ${MAX_HITS_PER_PAGE}`)
      validHitsPerPage = MAX_HITS_PER_PAGE
    } else {
      validHitsPerPage = hitsPerPage
    }
  }

  return { page: validPage, hitsPerPage: validHitsPerPage, errors }
}

/**
 * Validate index name
 */
function validateIndexName(indexName: string): { valid: boolean; error?: string } {
  if (!indexName || typeof indexName !== 'string') {
    return { valid: false, error: 'Index name must be a non-empty string' }
  }

  if (!VALID_INDEX_NAMES.includes(indexName as keyof typeof ALGOLIA_INDEXES)) {
    return {
      valid: false,
      error: `Invalid index name. Must be one of: ${VALID_INDEX_NAMES.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Validate facet filters structure
 */
function validateFacetFilters(facetFilters?: string[][]): { valid: boolean; error?: string } {
  if (!facetFilters) {
    return { valid: true }
  }

  if (!Array.isArray(facetFilters)) {
    return { valid: false, error: 'Facet filters must be an array' }
  }

  for (let i = 0; i < facetFilters.length; i++) {
    const group = facetFilters[i]
    if (!Array.isArray(group)) {
      return { valid: false, error: `Facet filter group at index ${i} must be an array` }
    }

    for (let j = 0; j < group.length; j++) {
      if (typeof group[j] !== 'string') {
        return { valid: false, error: `Facet filter at [${i}][${j}] must be a string` }
      }
    }
  }

  return { valid: true }
}

/**
 * Validate filter string format
 */
function validateFilters(filters?: string): { valid: boolean; error?: string } {
  if (!filters) {
    return { valid: true }
  }

  if (typeof filters !== 'string') {
    return { valid: false, error: 'Filters must be a string' }
  }

  // Check for common malformed patterns
  if (filters.includes('((') || filters.includes('))')) {
    console.warn('[Algolia] Potentially malformed filter string detected:', filters)
  }

  return { valid: true }
}

// ============================================================================
// Retry Logic
// ============================================================================

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // Network errors
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('enotfound') ||
      message.includes('etimedout')
    ) {
      return true
    }

    // Algolia specific errors
    if (message.includes('503') || message.includes('429')) {
      return true // Service unavailable or rate limited
    }
  }

  return false
}

/**
 * Execute function with exponential backoff retry
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = INITIAL_RETRY_DELAY_MS
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      console.warn(`[Algolia] Retryable error, ${retries} retries remaining:`, error)
      await sleep(delay)
      return withRetry(fn, retries - 1, delay * 2) // Exponential backoff
    }
    throw error
  }
}

/**
 * Execute function with timeout
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = SEARCH_TIMEOUT_MS
): Promise<T> {
  const timeout = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  return Promise.race([promise, timeout])
}

// ============================================================================
// Client Initialization
// ============================================================================

let clientInstance: ReturnType<typeof algoliasearch> | null = null

/**
 * Get or create Algolia client with validation
 */
function getSearchClient(): ReturnType<typeof algoliasearch> {
  const credCheck = validateCredentials()
  if (!credCheck.valid) {
    throw new Error(`[Algolia] ${credCheck.error}`)
  }

  if (!clientInstance) {
    clientInstance = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY)
  }

  return clientInstance
}

// ============================================================================
// Enhanced Search Functions
// ============================================================================

/**
 * Search across a specific index with comprehensive error handling
 */
export async function searchIndex(
  indexName: keyof typeof ALGOLIA_INDEXES,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  const { filters, facetFilters, timeout = SEARCH_TIMEOUT_MS } = options

  // Validate index name
  const indexValidation = validateIndexName(indexName)
  if (!indexValidation.valid) {
    console.error('[Algolia]', indexValidation.error)
    return createEmptyResult(options.hitsPerPage)
  }

  // Sanitize query
  const sanitizedQuery = sanitizeQuery(query)

  // Validate pagination
  const { page, hitsPerPage, errors: paginationErrors } = validatePagination(
    options.page,
    options.hitsPerPage
  )

  if (paginationErrors.length > 0) {
    console.warn('[Algolia] Pagination validation errors:', paginationErrors)
  }

  // Validate filters
  const filterValidation = validateFilters(filters)
  if (!filterValidation.valid) {
    console.error('[Algolia]', filterValidation.error)
    return createEmptyResult(hitsPerPage)
  }

  // Validate facet filters
  const facetValidation = validateFacetFilters(facetFilters)
  if (!facetValidation.valid) {
    console.error('[Algolia]', facetValidation.error)
    return createEmptyResult(hitsPerPage)
  }

  try {
    const client = getSearchClient()

    const searchOperation = async () => {
      const results = await client.search({
        requests: [
          {
            indexName: ALGOLIA_INDEXES[indexName],
            query: sanitizedQuery,
            page,
            hitsPerPage,
            ...(filters && { filters }),
            ...(facetFilters && facetFilters.length > 0 && { facetFilters }),
          },
        ],
      })

      const result = results.results[0] as {
        hits: unknown[]
        nbHits: number
        page: number
        nbPages: number
        hitsPerPage: number
        processingTimeMS?: number
      }

      // Validate result structure
      if (!result || typeof result.nbHits !== 'number') {
        throw new Error('Invalid response structure from Algolia')
      }

      return {
        hits: Array.isArray(result.hits) ? result.hits : [],
        nbHits: result.nbHits,
        page: result.page,
        nbPages: result.nbPages,
        hitsPerPage: result.hitsPerPage,
        processingTimeMS: result.processingTimeMS,
      }
    }

    // Execute with timeout and retry
    return await withTimeout(withRetry(searchOperation), timeout)
  } catch (error) {
    console.error(`[Algolia] Error searching ${String(indexName)}:`, error)

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('timed out')) {
        console.error('[Algolia] Search timeout - query may be too complex')
      } else if (error.message.includes('credentials')) {
        console.error('[Algolia] Invalid credentials')
      } else if (error.message.includes('429')) {
        console.error('[Algolia] Rate limit exceeded')
      }
    }

    return createEmptyResult(hitsPerPage)
  }
}

/**
 * Search across multiple indexes with edge case handling
 */
export async function searchMultipleIndexes(
  query: string,
  indexes: Array<keyof typeof ALGOLIA_INDEXES> = ['herbs', 'formulas', 'conditions'],
  hitsPerPage: number = 5
): Promise<Record<string, unknown[]>> {
  // Sanitize query
  const sanitizedQuery = sanitizeQuery(query)

  // Validate indexes
  const validIndexes = indexes.filter((idx) => {
    const validation = validateIndexName(idx)
    if (!validation.valid) {
      console.warn('[Algolia]', validation.error)
      return false
    }
    return true
  })

  if (validIndexes.length === 0) {
    console.error('[Algolia] No valid indexes provided for multi-index search')
    return {}
  }

  // Validate hitsPerPage
  const { hitsPerPage: validHitsPerPage } = validatePagination(0, hitsPerPage)

  try {
    const client = getSearchClient()

    const searchOperation = async () => {
      const results = await client.search({
        requests: validIndexes.map((indexName) => ({
          indexName: ALGOLIA_INDEXES[indexName],
          query: sanitizedQuery,
          hitsPerPage: validHitsPerPage,
        })),
      })

      return results.results.reduce(
        (acc: Record<string, unknown[]>, result, index) => {
          const indexName = String(validIndexes[index])
          const hits = (result as { hits?: unknown[] }).hits

          // Validate hits is an array
          acc[indexName] = Array.isArray(hits) ? hits : []

          return acc
        },
        {} as Record<string, unknown[]>
      )
    }

    // Execute with timeout and retry
    return await withTimeout(withRetry(searchOperation), SEARCH_TIMEOUT_MS)
  } catch (error) {
    console.error('[Algolia] Error searching multiple indexes:', error)

    // Return empty results for all indexes
    return validIndexes.reduce(
      (acc, idx) => {
        acc[idx] = []
        return acc
      },
      {} as Record<string, unknown[]>
    )
  }
}

/**
 * Get facet values with validation and error handling
 */
export async function getFacets(
  indexName: keyof typeof ALGOLIA_INDEXES,
  facetName: string,
  facetQuery: string = ''
): Promise<Array<{ value: string; count: number }>> {
  // Validate index name
  const indexValidation = validateIndexName(indexName)
  if (!indexValidation.valid) {
    console.error('[Algolia]', indexValidation.error)
    return []
  }

  // Validate facet name
  if (!facetName || typeof facetName !== 'string' || facetName.trim() === '') {
    console.error('[Algolia] Facet name must be a non-empty string')
    return []
  }

  // Sanitize facet query
  const sanitizedFacetQuery = sanitizeQuery(facetQuery)

  try {
    const client = getSearchClient()

    const facetOperation = async () => {
      const results = await client.searchForFacetValues({
        indexName: ALGOLIA_INDEXES[indexName],
        facetName,
        ...(sanitizedFacetQuery && { facetQuery: sanitizedFacetQuery }),
      })

      // Validate results
      if (!results || !Array.isArray(results.facetHits)) {
        console.warn('[Algolia] Invalid facet results structure')
        return []
      }

      return results.facetHits
    }

    return await withTimeout(withRetry(facetOperation), SEARCH_TIMEOUT_MS)
  } catch (error) {
    console.error(`[Algolia] Error getting facets for ${String(indexName)}.${facetName}:`, error)
    return []
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create empty search result
 */
function createEmptyResult(hitsPerPage: number = DEFAULT_HITS_PER_PAGE): SearchResult {
  return {
    hits: [],
    nbHits: 0,
    page: 0,
    nbPages: 0,
    hitsPerPage,
  }
}

/**
 * Check if Algolia is configured and available
 */
export function isAlgoliaAvailable(): boolean {
  const credCheck = validateCredentials()
  return credCheck.valid
}

/**
 * Get configuration status for debugging
 */
export function getAlgoliaStatus(): {
  configured: boolean
  appId: string
  hasSearchKey: boolean
  availableIndexes: string[]
} {
  const credCheck = validateCredentials()

  return {
    configured: credCheck.valid,
    appId: ALGOLIA_APP_ID ? `${ALGOLIA_APP_ID.substring(0, 4)}...` : 'not set',
    hasSearchKey: ALGOLIA_SEARCH_KEY.length > 0,
    availableIndexes: VALID_INDEX_NAMES,
  }
}
