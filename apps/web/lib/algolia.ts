/**
 * Algolia search client configuration
 * Provides typed search utilities for all collections
 */

import { algoliasearch } from 'algoliasearch'

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || ''
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ''

// Initialize Algolia client
export const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY)

// Index names
export const ALGOLIA_INDEXES = {
  herbs: 'verscienta_herbs',
  formulas: 'verscienta_formulas',
  conditions: 'verscienta_conditions',
  practitioners: 'verscienta_practitioners',
  modalities: 'verscienta_modalities',
} as const

/**
 * Search across a specific index
 */
export async function searchIndex(
  indexName: keyof typeof ALGOLIA_INDEXES,
  query: string,
  options: {
    page?: number
    hitsPerPage?: number
    filters?: string
    facetFilters?: string[][]
  } = {}
) {
  const { page = 0, hitsPerPage = 20, filters, facetFilters } = options

  try {
    const results = await searchClient.search({
      requests: [
        {
          indexName: ALGOLIA_INDEXES[indexName],
          query,
          page,
          hitsPerPage,
          ...(filters && { filters }),
          ...(facetFilters && { facetFilters }),
        },
      ],
    })

    const result = results.results[0] as {
      hits: unknown[]
      nbHits: number
      page: number
      nbPages: number
      hitsPerPage: number
    }
    return {
      hits: result.hits,
      nbHits: result.nbHits,
      page: result.page,
      nbPages: result.nbPages,
      hitsPerPage: result.hitsPerPage,
    }
  } catch (error) {
    console.error(`Error searching ${String(indexName)}:`, error)
    return {
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage,
    }
  }
}

/**
 * Search across multiple indexes
 */
export async function searchMultipleIndexes(
  query: string,
  indexes: Array<keyof typeof ALGOLIA_INDEXES> = ['herbs', 'formulas', 'conditions']
) {
  try {
    const results = await searchClient.search({
      requests: indexes.map((indexName) => ({
        indexName: ALGOLIA_INDEXES[indexName],
        query,
        hitsPerPage: 5,
      })),
    })

    return results.results.reduce(
      (acc: Record<string, unknown[]>, result, index) => {
        acc[String(indexes[index])] = (result as { hits: unknown[] }).hits
        return acc
      },
      {} as Record<string, unknown[]>
    )
  } catch (error) {
    console.error('Error searching multiple indexes:', error)
    return {}
  }
}

/**
 * Get facet values for filtering
 */
export async function getFacets(
  indexName: keyof typeof ALGOLIA_INDEXES,
  facetName: string,
  _facetQuery: string = ''
) {
  try {
    const results = await searchClient.searchForFacetValues({
      indexName: ALGOLIA_INDEXES[indexName],
      facetName,
    })

    return results.facetHits
  } catch (error) {
    console.error(`Error getting facets for ${String(indexName)}:`, error)
    return []
  }
}
