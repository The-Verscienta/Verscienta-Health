/**
 * Trefle API Client
 *
 * Integrates with the Trefle botanical database (1M+ plants)
 * to enrich herb data with scientific information, images, and distributions.
 *
 * @see https://docs.trefle.io/
 */

import axios, { AxiosInstance } from 'axios'

// Trefle API Types
export interface TreflePlant {
  id: number
  common_name: string | null
  slug: string
  scientific_name: string
  year: number | null
  bibliography: string | null
  author: string | null
  family: string | null
  family_common_name: string | null
  genus: string | null
  genus_id: number | null
  image_url: string | null
  synonyms: string[]
  vegetable?: boolean
  edible?: boolean
  specifications?: {
    growth_habit?: string | null
    toxicity?: string | null
    ligneous_type?: string | null
    growth_form?: string | null
    growth_rate?: string | null
    average_height?: { cm?: number | null }
    maximum_height?: { cm?: number | null }
  }
  links: {
    self: string
    plant: string
    genus: string
  }
}

export interface TreflePlantDetails extends TreflePlant {
  complete_data: boolean
  main_species_id: number | null
  observations: string | null
  vegetable: boolean
  edible: boolean
  edible_part: string[] | null
  distributions: {
    native: string[]
    introduced: string[]
  }
  growth: {
    description: string | null
    sowing: string | null
    days_to_harvest: number | null
    row_spacing: {
      cm: number | null
    }
    spread: {
      cm: number | null
    }
    ph_maximum: number | null
    ph_minimum: number | null
    light: number | null
    atmospheric_humidity: number | null
    minimum_precipitation: {
      mm: number | null
    }
    maximum_precipitation: {
      mm: number | null
    }
    minimum_root_depth: {
      cm: number | null
    }
    minimum_temperature: {
      deg_c: number | null
    }
    maximum_temperature: {
      deg_c: number | null
    }
    soil_nutriments: number | null
    soil_salinity: number | null
    soil_texture: number | null
    soil_humidity: number | null
  }
  specifications: {
    ligneous_type: string | null
    growth_form: string | null
    growth_habit: string | null
    growth_rate: string | null
    average_height: {
      cm: number | null
    }
    maximum_height: {
      cm: number | null
    }
    nitrogen_fixation: string | null
    shape_and_orientation: string | null
    toxicity: string | null
  }
  sources: Array<{
    id: string
    name: string
    url: string
    citation: string | null
    last_update: string
  }>
}

export interface TrefleSearchResponse {
  data: TreflePlant[]
  links: {
    self: string
    first: string
    next: string | null
    last: string
  }
  meta: {
    total: number
  }
}

export interface TreflePlantResponse {
  data: TreflePlantDetails
  meta: {
    last_modified: string
  }
}

export interface EnrichedHerbData {
  trefleId: number
  trefleSlug: string
  scientificName: string
  commonName: string | null
  family: string | null
  author: string | null
  synonyms: string[]
  distributions: {
    native: string[]
    introduced: string[]
  }
  edible: boolean
  ediblePart: string[] | null
  vegetable: boolean
  toxicity: string | null
  growthHabit: string | null
  averageHeight: number | null
  imageUrl: string | null
  sources: Array<{
    id: string
    name: string
    url: string
    citation: string | null
  }>
}

export interface ValidationResult {
  isValid: boolean
  exactMatch: boolean
  suggestions: string[]
  bestMatch: TreflePlant | null
}

/**
 * Trefle API Client
 *
 * Singleton client for interacting with the Trefle botanical database.
 */
export class TrefleClient {
  private client: AxiosInstance
  private apiKey: string
  private baseURL = 'https://trefle.io/api/v1'
  private requestDelay = 500 // ms between requests (120 req/min = 500ms delay)

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Trefle API key is required')
    }

    this.apiKey = apiKey

    this.client = axios.create({
      baseURL: this.baseURL,
      params: {
        token: this.apiKey,
      },
      timeout: 30000, // 30 seconds
    })

    // Request interceptor: Add delay to respect rate limits
    this.client.interceptors.request.use(async (config) => {
      await this.delay(this.requestDelay)
      return config
    })

    // Response interceptor: Handle rate limiting
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          console.warn('❌ Trefle API rate limit reached. Waiting 60 seconds...')
          await this.delay(60000) // Wait 1 minute
          return this.client.request(error.config) // Retry request
        }
        throw error
      }
    )
  }

  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Search plants by scientific name
   *
   * @param scientificName - Scientific name to search (e.g., "Lavandula angustifolia")
   * @returns Search results with matching plants
   */
  async searchByScientificName(scientificName: string): Promise<TrefleSearchResponse> {
    try {
      const response = await this.client.get<TrefleSearchResponse>('/plants/search', {
        params: {
          q: scientificName,
        },
      })
      return response.data
    } catch (error) {
      console.error(`Failed to search Trefle for "${scientificName}":`, error)
      throw error
    }
  }

  /**
   * Get detailed plant information by ID
   *
   * @param plantId - Trefle plant ID
   * @returns Detailed plant data
   */
  async getPlantById(plantId: number): Promise<TreflePlantDetails> {
    try {
      const response = await this.client.get<TreflePlantResponse>(`/plants/${plantId}`)
      return response.data.data
    } catch (error) {
      console.error(`Failed to get Trefle plant ${plantId}:`, error)
      throw error
    }
  }

  /**
   * Get plant by slug
   *
   * @param slug - Trefle plant slug
   * @returns Detailed plant data
   */
  async getPlantBySlug(slug: string): Promise<TreflePlantDetails> {
    try {
      const response = await this.client.get<TreflePlantResponse>(`/plants/${slug}`)
      return response.data.data
    } catch (error) {
      console.error(`Failed to get Trefle plant by slug "${slug}":`, error)
      throw error
    }
  }

  /**
   * Find best matching plant for a given scientific name and common name
   *
   * @param scientificName - Scientific name to match
   * @param commonName - Common name to help with matching (optional)
   * @returns Best matching plant or null
   */
  async findBestMatch(scientificName: string, commonName?: string): Promise<TreflePlant | null> {
    try {
      const searchResult = await this.searchByScientificName(scientificName)

      if (searchResult.data.length === 0) {
        return null
      }

      // Exact match on scientific name
      const exactMatch = searchResult.data.find(
        (plant) => plant.scientific_name.toLowerCase() === scientificName.toLowerCase()
      )

      if (exactMatch) {
        return exactMatch
      }

      // Match on common name if provided
      if (commonName) {
        const commonNameMatch = searchResult.data.find(
          (plant) => plant.common_name?.toLowerCase() === commonName.toLowerCase()
        )

        if (commonNameMatch) {
          return commonNameMatch
        }
      }

      // Return first result as best guess
      return searchResult.data[0] ?? null
    } catch (error) {
      console.error(`Failed to find best match for "${scientificName}":`, error)
      return null
    }
  }

  /**
   * Enrich herb data with information from Trefle
   *
   * @param herb - Basic herb data (scientific name required)
   * @returns Enriched data from Trefle
   */
  async enrichHerbData(herb: {
    scientificName: string
    name?: string
  }): Promise<EnrichedHerbData | null> {
    try {
      const bestMatch = await this.findBestMatch(herb.scientificName, herb.name)

      if (!bestMatch) {
        console.warn(`⚠️ No Trefle match found for "${herb.scientificName}"`)
        return null
      }

      // Get detailed plant data
      const plantDetails = await this.getPlantById(bestMatch.id)

      // Transform to enriched herb data
      const enrichedData: EnrichedHerbData = {
        trefleId: plantDetails.id,
        trefleSlug: plantDetails.slug,
        scientificName: plantDetails.scientific_name,
        commonName: plantDetails.common_name,
        family: plantDetails.family,
        author: plantDetails.author,
        synonyms: plantDetails.synonyms || [],
        distributions: plantDetails.distributions || { native: [], introduced: [] },
        edible: plantDetails.edible || false,
        ediblePart: plantDetails.edible_part || null,
        vegetable: plantDetails.vegetable || false,
        toxicity: plantDetails.specifications?.toxicity || null,
        growthHabit: plantDetails.specifications?.growth_habit || null,
        averageHeight: plantDetails.specifications?.average_height?.cm || null,
        imageUrl: plantDetails.image_url,
        sources: plantDetails.sources || [],
      }

      return enrichedData
    } catch (error) {
      console.error(`Failed to enrich herb "${herb.scientificName}":`, error)
      return null
    }
  }

  /**
   * Validate scientific name against Trefle database
   *
   * @param scientificName - Scientific name to validate
   * @returns Validation result with suggestions
   */
  async validateScientificName(scientificName: string): Promise<ValidationResult> {
    try {
      const searchResult = await this.searchByScientificName(scientificName)

      if (searchResult.data.length === 0) {
        return {
          isValid: false,
          exactMatch: false,
          suggestions: [],
          bestMatch: null,
        }
      }

      // Check for exact match
      const exactMatch = searchResult.data.find(
        (plant) => plant.scientific_name.toLowerCase() === scientificName.toLowerCase()
      )

      if (exactMatch) {
        return {
          isValid: true,
          exactMatch: true,
          suggestions: [],
          bestMatch: exactMatch,
        }
      }

      // Return close matches as suggestions
      const suggestions = searchResult.data.slice(0, 5).map((plant) => plant.scientific_name)

      return {
        isValid: false,
        exactMatch: false,
        suggestions,
        bestMatch: searchResult.data[0] ?? null,
      }
    } catch (error) {
      console.error(`Failed to validate scientific name "${scientificName}":`, error)
      return {
        isValid: false,
        exactMatch: false,
        suggestions: [],
        bestMatch: null,
      }
    }
  }

  /**
   * Get plants from a specific page (for progressive import)
   *
   * @param page - Page number (1-indexed)
   * @param perPage - Plants per page (max 20)
   * @returns Page of plants
   */
  async getPlants(page = 1, perPage = 20): Promise<TrefleSearchResponse> {
    try {
      const response = await this.client.get<TrefleSearchResponse>('/plants', {
        params: {
          page,
          per_page: Math.min(perPage, 20), // API max is 20
        },
      })
      return response.data
    } catch (error) {
      console.error(`Failed to get plants page ${page}:`, error)
      throw error
    }
  }
}

// Singleton instance
let trefleClient: TrefleClient | null = null

/**
 * Get singleton Trefle client instance
 *
 * @returns TrefleClient instance or null if API key not configured
 */
export function getTrefleClient(): TrefleClient | null {
  const apiKey = process.env.TREFLE_API_KEY

  if (!apiKey) {
    console.warn('⚠️ TREFLE_API_KEY not set. Trefle integration disabled.')
    return null
  }

  if (!trefleClient) {
    trefleClient = new TrefleClient(apiKey)
  }

  return trefleClient
}

/**
 * Quick helper to enrich herb with Trefle data
 */
export async function enrichHerbWithTrefle(herb: {
  scientificName: string
  name?: string
}): Promise<EnrichedHerbData | null> {
  const client = getTrefleClient()
  if (!client) return null

  return client.enrichHerbData(herb)
}

/**
 * Quick helper to validate scientific name
 */
export async function validateScientificNameWithTrefle(
  scientificName: string
): Promise<ValidationResult> {
  const client = getTrefleClient()
  if (!client) {
    return {
      isValid: false,
      exactMatch: false,
      suggestions: [],
      bestMatch: null,
    }
  }

  return client.validateScientificName(scientificName)
}
