import { Payload } from 'payload'

interface SearchOptions {
  query: string
  collection: 'herbs' | 'formulas' | 'conditions' | 'practitioners'
  limit?: number
  page?: number
  filters?: Record<string, any>
}

interface SearchResult {
  docs: any[]
  totalDocs: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * PostgreSQL full-text search implementation
 * Fallback/complement to Algolia for cost efficiency
 */
export async function fullTextSearch(
  payload: Payload,
  options: SearchOptions
): Promise<SearchResult> {
  const { query, collection, limit = 20, page = 1, filters = {} } = options

  try {
    // Build the search query using PostgreSQL's tsvector
    const searchQuery = {
      where: {
        and: [
          {
            or: [
              {
                name: {
                  like: `%${query}%`,
                },
              },
              {
                description: {
                  like: `%${query}%`,
                },
              },
            ],
          },
          // Add status filter
          {
            status: {
              equals: 'published',
            },
          },
          // Add custom filters
          ...Object.entries(filters).map(([key, value]) => ({
            [key]: value,
          })),
        ],
      },
      limit,
      page,
    }

    const results = await payload.find({
      collection,
      ...searchQuery,
    })

    return {
      docs: results.docs,
      totalDocs: results.totalDocs,
      page: results.page || 1,
      totalPages: results.totalPages,
      hasNextPage: results.hasNextPage,
      hasPrevPage: results.hasPrevPage,
    }
  } catch (error) {
    console.error('Full-text search error:', error)
    throw error
  }
}

/**
 * Advanced PostgreSQL full-text search with ranking
 */
export async function advancedFullTextSearch(
  payload: Payload,
  options: SearchOptions
): Promise<SearchResult> {
  const { query, collection, limit = 20, page = 1 } = options

  try {
    // Use raw SQL for advanced full-text search with ranking
    const db = payload.db

    const offset = (page - 1) * limit

    // PostgreSQL full-text search query with ranking
    const sqlQuery = `
      SELECT
        *,
        ts_rank(
          to_tsvector('english',
            coalesce(name, '') || ' ' ||
            coalesce(scientific_name, '') || ' ' ||
            coalesce(description, '')
          ),
          plainto_tsquery('english', $1)
        ) as rank
      FROM ${collection}
      WHERE
        status = 'published' AND
        to_tsvector('english',
          coalesce(name, '') || ' ' ||
          coalesce(scientific_name, '') || ' ' ||
          coalesce(description, '')
        ) @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT $2 OFFSET $3
    `

    const countQuery = `
      SELECT COUNT(*) as count
      FROM ${collection}
      WHERE
        status = 'published' AND
        to_tsvector('english',
          coalesce(name, '') || ' ' ||
          coalesce(scientific_name, '') || ' ' ||
          coalesce(description, '')
        ) @@ plainto_tsquery('english', $1)
    `

    // Execute queries (this is a placeholder - adjust for your DB adapter)
    // const docs = await db.query(sqlQuery, [query, limit, offset])
    // const { count } = await db.query(countQuery, [query])

    // For now, return empty results
    // TODO: Implement actual database query execution
    return {
      docs: [],
      totalDocs: 0,
      page,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    }
  } catch (error) {
    console.error('Advanced full-text search error:', error)
    throw error
  }
}

/**
 * Search herbs by TCM properties
 */
export async function searchHerbsByTCMProperties(
  payload: Payload,
  properties: {
    temperature?: string[]
    taste?: string[]
    meridians?: string[]
    actions?: string[]
  },
  limit: number = 20,
  page: number = 1
): Promise<SearchResult> {
  try {
    const where: any = {
      and: [
        {
          status: {
            equals: 'published',
          },
        },
      ],
    }

    // Build JSONB queries for TCM properties
    if (properties.temperature?.length) {
      where.and.push({
        'tcm_properties.temperature': {
          in: properties.temperature,
        },
      })
    }

    if (properties.taste?.length) {
      where.and.push({
        'tcm_properties.taste': {
          in: properties.taste,
        },
      })
    }

    if (properties.meridians?.length) {
      where.and.push({
        'tcm_properties.meridians': {
          contains: properties.meridians,
        },
      })
    }

    const results = await payload.find({
      collection: 'herbs',
      where,
      limit,
      page,
    })

    return {
      docs: results.docs,
      totalDocs: results.totalDocs,
      page: results.page || 1,
      totalPages: results.totalPages,
      hasNextPage: results.hasNextPage,
      hasPrevPage: results.hasPrevPage,
    }
  } catch (error) {
    console.error('TCM properties search error:', error)
    throw error
  }
}

/**
 * Search practitioners by location (geospatial)
 */
export async function searchPractitionersByLocation(
  payload: Payload,
  latitude: number,
  longitude: number,
  radiusKm: number = 50,
  limit: number = 20
): Promise<any[]> {
  try {
    // Use PostgreSQL's earth distance function
    const db = payload.db

    // Raw SQL query for geospatial search
    const sqlQuery = `
      SELECT
        *,
        earth_distance(
          ll_to_earth($1, $2),
          ll_to_earth(latitude, longitude)
        ) / 1000 as distance_km
      FROM practitioners
      WHERE
        status = 'published' AND
        accepting_patients = true AND
        earth_box(ll_to_earth($1, $2), $3 * 1000) @> ll_to_earth(latitude, longitude)
      ORDER BY distance_km
      LIMIT $4
    `

    // Execute query (placeholder)
    // const practitioners = await db.query(sqlQuery, [latitude, longitude, radiusKm, limit])

    // TODO: Implement actual database query execution
    return []
  } catch (error) {
    console.error('Location search error:', error)
    throw error
  }
}

/**
 * Autocomplete search for quick suggestions
 */
export async function autocompleteSearch(
  payload: Payload,
  query: string,
  collection: 'herbs' | 'formulas' | 'conditions',
  limit: number = 10
): Promise<Array<{ id: string; name: string; slug: string }>> {
  try {
    const results = await payload.find({
      collection,
      where: {
        and: [
          {
            name: {
              like: `${query}%`, // Prefix match
            },
          },
          {
            status: {
              equals: 'published',
            },
          },
        ],
      },
      limit,
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    return results.docs.map(doc => ({
      id: String(doc.id),
      name: String(doc.name || ''),
      slug: String(doc.slug || ''),
    }))
  } catch (error) {
    console.error('Autocomplete search error:', error)
    return []
  }
}
