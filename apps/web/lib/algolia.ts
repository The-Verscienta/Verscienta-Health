/**
 * Algolia Search Client with Edge Case Handling
 *
 * Enhanced version with comprehensive validation, retry logic, and error handling.
 * Delegates to algolia-enhanced.ts for robust search operations.
 *
 * Features:
 * - Input validation and sanitization
 * - Retry logic with exponential backoff
 * - Timeout handling
 * - Credential validation
 * - Special character handling
 * - Pagination bounds checking
 * - Filter validation
 * - Rate limiting detection
 *
 * @see lib/algolia-enhanced.ts for implementation details
 */

import {
  searchIndex as enhancedSearchIndex,
  searchMultipleIndexes as enhancedSearchMultipleIndexes,
  getFacets as enhancedGetFacets,
  ALGOLIA_INDEXES,
  isAlgoliaAvailable,
  getAlgoliaStatus,
  type SearchOptions,
  type SearchResult,
} from './algolia-enhanced'
import { algoliasearch } from 'algoliasearch'

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || ''
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || ''

// Initialize Algolia client (for backward compatibility with direct usage)
// NOTE: Prefer using the enhanced functions below instead
export const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY)

// Re-export index names for backward compatibility
export { ALGOLIA_INDEXES }

// Re-export types
export type { SearchOptions, SearchResult }

/**
 * Search across a specific index with comprehensive error handling
 *
 * Edge cases handled:
 * - Query sanitization (length limits, special characters)
 * - Pagination validation (bounds checking)
 * - Filter validation (format checking)
 * - Credential validation
 * - Network failures with retry
 * - Timeout handling
 *
 * @param indexName - Index to search
 * @param query - Search query string
 * @param options - Search options (pagination, filters, facets)
 * @returns Search results with hits and metadata
 */
export async function searchIndex(
  indexName: keyof typeof ALGOLIA_INDEXES,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  return enhancedSearchIndex(indexName, query, options)
}

/**
 * Search across multiple indexes simultaneously
 *
 * Edge cases handled:
 * - Index name validation
 * - Query sanitization
 * - Invalid index filtering
 * - Network failures with retry
 * - Partial failures (returns results for successful indexes)
 *
 * @param query - Search query string
 * @param indexes - Array of indexes to search (defaults to herbs, formulas, conditions)
 * @param hitsPerPage - Number of results per index (default: 5)
 * @returns Object keyed by index name with result arrays
 */
export async function searchMultipleIndexes(
  query: string,
  indexes: Array<keyof typeof ALGOLIA_INDEXES> = ['herbs', 'formulas', 'conditions'],
  hitsPerPage: number = 5
): Promise<Record<string, unknown[]>> {
  return enhancedSearchMultipleIndexes(query, indexes, hitsPerPage)
}

/**
 * Get facet values for filtering with validation
 *
 * Edge cases handled:
 * - Index name validation
 * - Facet name validation
 * - Query sanitization
 * - Empty results handling
 * - Network failures with retry
 *
 * @param indexName - Index to get facets from
 * @param facetName - Name of the facet attribute
 * @param facetQuery - Optional query to filter facet values
 * @returns Array of facet hits with value and count
 */
export async function getFacets(
  indexName: keyof typeof ALGOLIA_INDEXES,
  facetName: string,
  facetQuery: string = ''
): Promise<Array<{ value: string; count: number }>> {
  return enhancedGetFacets(indexName, facetName, facetQuery)
}

/**
 * Check if Algolia is properly configured
 *
 * @returns true if credentials are set, false otherwise
 */
export { isAlgoliaAvailable }

/**
 * Get Algolia configuration status for debugging
 *
 * @returns Configuration status object
 */
export { getAlgoliaStatus }

// ============================================================================
// Backward Compatibility Exports
// ============================================================================

// For components still using the old API
export default {
  searchIndex,
  searchMultipleIndexes,
  getFacets,
  ALGOLIA_INDEXES,
  searchClient,
  isAlgoliaAvailable,
  getAlgoliaStatus,
}
