/**
 * Algolia search client configuration
 * Provides typed search utilities for all collections
 */

import algoliasearch from 'algoliasearch/lite'

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
 * Get an Algolia index by name
 */
export function getIndex(indexName: keyof typeof ALGOLIA_INDEXES) {
  return searchClient.initIndex(ALGOLIA_INDEXES[indexName])
}

/**
 * Search across a specific index
 */
export async function searchIndex<T = any>(
  indexName: keyof typeof ALGOLIA_INDEXES,
  query: string,
  options: {
    page?: number
    hitsPerPage?: number
    filters?: string
    facetFilters?: string[][]
  } = {}
) {
  const index = getIndex(indexName)

  const { page = 0, hitsPerPage = 20, filters, facetFilters } = options

  try {
    const results = await index.search<T>(query, {
      page,
      hitsPerPage,
      filters,
      facetFilters,
    })

    return {
      hits: results.hits,
      nbHits: results.nbHits,
      page: results.page,
      nbPages: results.nbPages,
      hitsPerPage: results.hitsPerPage,
    }
  } catch (error) {
    console.error(`Error searching ${indexName}:`, error)
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
    const queries = indexes.map((indexName) => ({
      indexName: ALGOLIA_INDEXES[indexName],
      query,
      params: {
        hitsPerPage: 5,
      },
    }))

    const results = await searchClient.multipleQueries(queries)

    return results.results.reduce((acc, result, index) => {
      acc[indexes[index]] = result.hits
      return acc
    }, {} as Record<string, any[]>)
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
  query: string = ''
) {
  const index = getIndex(indexName)

  try {
    const results = await index.searchForFacetValues(facetName, query, {
      maxFacetHits: 20,
    })

    return results.facetHits
  } catch (error) {
    console.error(`Error getting facets for ${facetName}:`, error)
    return []
  }
}

/**
 * Herb-specific search with TCM property filters
 */
export async function searchHerbs(
  query: string,
  options: {
    page?: number
    taste?: string[]
    temperature?: string[]
    meridians?: string[]
    category?: string
  } = {}
) {
  const { page = 0, taste, temperature, meridians, category } = options

  const facetFilters: string[][] = []

  if (taste && taste.length > 0) {
    facetFilters.push(taste.map((t) => `tcmProperties.taste:${t}`))
  }

  if (temperature) {
    facetFilters.push([`tcmProperties.temperature:${temperature}`])
  }

  if (meridians && meridians.length > 0) {
    facetFilters.push(meridians.map((m) => `tcmProperties.meridians:${m}`))
  }

  if (category) {
    facetFilters.push([`tcmProperties.category:${category}`])
  }

  return searchIndex('herbs', query, {
    page,
    hitsPerPage: 12,
    facetFilters,
  })
}

/**
 * Formula-specific search with tradition filter
 */
export async function searchFormulas(
  query: string,
  options: {
    page?: number
    tradition?: string
    category?: string
  } = {}
) {
  const { page = 0, tradition, category } = options

  const facetFilters: string[][] = []

  if (tradition) {
    facetFilters.push([`tradition:${tradition}`])
  }

  if (category) {
    facetFilters.push([`category:${category}`])
  }

  return searchIndex('formulas', query, {
    page,
    hitsPerPage: 12,
    facetFilters,
  })
}

/**
 * Practitioner-specific search with location and modality filters
 */
export async function searchPractitioners(
  query: string,
  options: {
    page?: number
    modalities?: string[]
    location?: string
    verificationStatus?: 'verified' | 'pending' | 'unverified'
  } = {}
) {
  const { page = 0, modalities, location, verificationStatus } = options

  const facetFilters: string[][] = []
  let filters = ''

  if (modalities && modalities.length > 0) {
    facetFilters.push(modalities.map((m) => `modalities:${m}`))
  }

  if (verificationStatus) {
    facetFilters.push([`verificationStatus:${verificationStatus}`])
  }

  if (location) {
    // For location-based search, we'd use geo search in production
    // For now, we'll just filter by city/state
    filters = `address.city:"${location}" OR address.state:"${location}"`
  }

  return searchIndex('practitioners', query, {
    page,
    hitsPerPage: 12,
    facetFilters,
    filters,
  })
}
