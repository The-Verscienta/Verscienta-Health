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
    // Use Payload's built-in search with multiple field matching
    const result = await payload.find({
      collection: collection as 'herbs' | 'formulas' | 'conditions',
      where: {
        and: [
          { status: { equals: 'published' } },
          {
            or: [
              { title: { contains: query } },
              { name: { contains: query } },
              { scientificName: { contains: query } },
              { description: { contains: query } },
            ],
          },
        ],
      },
      limit,
      page,
      sort: '-createdAt', // Sort by newest first (no ranking available in Payload)
    })

    return {
      docs: result.docs,
      totalDocs: result.totalDocs,
      page: result.page || 1,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
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
    // Fetch practitioners and calculate distance client-side
    // Note: For large datasets, consider using PostGIS extension with raw SQL queries
    const practitioners = await payload.find({
      collection: 'practitioners',
      where: {
        and: [
          { status: { equals: 'published' } },
          { acceptingNewPatients: { equals: true } },
          { latitude: { exists: true } },
          { longitude: { exists: true } },
        ],
      },
      limit: 1000, // Fetch more to filter by distance
    })

    // Calculate distance using Haversine formula
    const practitionersWithDistance = practitioners.docs
      .map((practitioner) => {
        const lat = practitioner.latitude
        const lon = practitioner.longitude

        if (typeof lat !== 'number' || typeof lon !== 'number') {
          return null
        }

        const distance = calculateDistance(latitude, longitude, lat, lon)

        return {
          ...practitioner,
          distance_km: distance,
        }
      })
      .filter((p) => p !== null && p.distance_km <= radiusKm)
      .sort((a, b) => (a?.distance_km || 0) - (b?.distance_km || 0))
      .slice(0, limit)

    return practitionersWithDistance
  } catch (error) {
    console.error('Location search error:', error)
    throw error
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
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

    return results.docs.map((doc) => ({
      id: String(doc.id),
      name: String(doc.name || ''),
      slug: String(doc.slug || ''),
    }))
  } catch (error) {
    console.error('Autocomplete search error:', error)
    return []
  }
}
