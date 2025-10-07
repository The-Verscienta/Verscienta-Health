/**
 * Trefle API Integration
 *
 * Trefle is a free botanical database API with over 1 million plant entries.
 * We use it to enrich our herb database with additional scientific details,
 * images, habitat information, and botanical cross-references.
 *
 * API Documentation: https://docs.trefle.io/
 * Sign up for API key: https://trefle.io/
 */

import axios, { AxiosInstance } from 'axios'

const TREFLE_BASE_URL = 'https://trefle.io/api/v1'

interface TrefleConfig {
  apiKey: string
  timeout?: number
}

interface TrefleSearchResult {
  id: number
  common_name: string | null
  slug: string
  scientific_name: string
  year: number | null
  bibliography: string | null
  author: string | null
  status: string
  rank: string
  family_common_name: string | null
  genus_id: number
  image_url: string | null
  synonyms: string[]
  genus: string
  family: string
  links: {
    self: string
    plant: string
    genus: string
  }
}

interface TrefleSpeciesDetail {
  id: number
  common_name: string | null
  slug: string
  scientific_name: string
  year: number | null
  bibliography: string | null
  author: string | null
  status: string
  rank: string
  family_common_name: string | null
  genus_id: number
  image_url: string | null
  synonyms: string[]
  genus: string
  family: string
  main_species: {
    id: number
    common_name: string | null
    scientific_name: string
    image_url: string | null
    year: number | null
    author: string | null
    bibliography: string | null
    family: string
    genus: string
    observations: string | null
    vegetable: boolean
    edible: boolean
    edible_part: string[] | null
    flower: {
      color: string[] | null
      conspicuous: boolean | null
    } | null
    foliage: {
      texture: string | null
      color: string[] | null
      leaf_retention: boolean | null
    } | null
    fruit_or_seed: {
      conspicuous: boolean | null
      color: string[] | null
      shape: string | null
      seed_persistence: boolean | null
    } | null
    specifications: {
      ligneous_type: string | null
      growth_form: string | null
      growth_habit: string | null
      growth_rate: string | null
      average_height: {
        cm: number | null
      } | null
      maximum_height: {
        cm: number | null
      } | null
      nitrogen_fixation: string | null
      shape_and_orientation: string | null
      toxicity: string | null
    } | null
    growth: {
      description: string | null
      sowing: string | null
      days_to_harvest: number | null
      row_spacing: {
        cm: number | null
      } | null
      spread: {
        cm: number | null
      } | null
      ph_maximum: number | null
      ph_minimum: number | null
      light: number | null
      atmospheric_humidity: number | null
      minimum_precipitation: {
        mm: number | null
      } | null
      maximum_precipitation: {
        mm: number | null
      } | null
      minimum_root_depth: {
        cm: number | null
      } | null
      minimum_temperature: {
        deg_c: number | null
        deg_f: number | null
      } | null
      maximum_temperature: {
        deg_c: number | null
        deg_f: number | null
      } | null
      soil_nutriments: number | null
      soil_salinity: number | null
      soil_texture: number | null
      soil_humidity: number | null
    } | null
    distributions: {
      native: string[]
      introduced: string[]
      doubtful: string[]
      absent: string[]
      extinct: string[]
    } | null
    common_names: {
      [language: string]: string[]
    } | null
    sources: Array<{
      id: string
      name: string
      url: string
      citation: string | null
      last_update: string
    }>
  }
  sources: Array<{
    id: string
    name: string
    url: string
    citation: string | null
    last_update: string
  }>
}

interface TreflePaginatedResponse<T> {
  data: T[]
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

export class TrefleClient {
  public client: AxiosInstance // Made public for advanced import operations
  private apiKey: string

  constructor(config: TrefleConfig) {
    this.apiKey = config.apiKey

    this.client = axios.create({
      baseURL: TREFLE_BASE_URL,
      timeout: config.timeout || 30000,
      params: {
        token: this.apiKey,
      },
    })

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(
      async (config) => {
        // Trefle has a rate limit of 120 requests per minute
        // Add a small delay between requests
        await this.sleep(500) // 0.5 second delay
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          console.warn('Trefle API rate limit reached. Waiting 60 seconds...')
          await this.sleep(60000)
          return this.client.request(error.config)
        }
        return Promise.reject(error)
      }
    )
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Search for plants by scientific name
   */
  async searchByScientificName(scientificName: string): Promise<TrefleSearchResult[]> {
    try {
      const response = await this.client.get<TreflePaginatedResponse<TrefleSearchResult>>(
        '/plants/search',
        {
          params: {
            q: scientificName,
          },
        }
      )

      return response.data.data
    } catch (error) {
      console.error('Trefle search error:', error)
      throw error
    }
  }

  /**
   * Search for plants by common name
   */
  async searchByCommonName(commonName: string): Promise<TrefleSearchResult[]> {
    try {
      const response = await this.client.get<TreflePaginatedResponse<TrefleSearchResult>>(
        '/plants/search',
        {
          params: {
            q: commonName,
          },
        }
      )

      return response.data.data
    } catch (error) {
      console.error('Trefle search error:', error)
      throw error
    }
  }

  /**
   * Get detailed plant information by ID
   */
  async getPlantById(id: number): Promise<TrefleSpeciesDetail> {
    try {
      const response = await this.client.get<{ data: TrefleSpeciesDetail }>(`/plants/${id}`)

      return response.data.data
    } catch (error) {
      console.error('Trefle get plant error:', error)
      throw error
    }
  }

  /**
   * Get plant species by slug
   */
  async getPlantBySlug(slug: string): Promise<TrefleSpeciesDetail> {
    try {
      const response = await this.client.get<{ data: TrefleSpeciesDetail }>(`/species/${slug}`)

      return response.data.data
    } catch (error) {
      console.error('Trefle get species error:', error)
      throw error
    }
  }

  /**
   * Find best match for a herb
   */
  async findBestMatch(
    scientificName: string,
    commonName?: string
  ): Promise<TrefleSearchResult | null> {
    try {
      // Try scientific name first
      const scientificResults = await this.searchByScientificName(scientificName)

      // Exact match on scientific name
      const exactMatch = scientificResults.find(
        (result) => result.scientific_name.toLowerCase() === scientificName.toLowerCase()
      )

      if (exactMatch) {
        return exactMatch
      }

      // Partial match on scientific name (genus level)
      const genusName = scientificName.split(' ')[0]
      const genusMatch = scientificResults.find((result) =>
        result.scientific_name.toLowerCase().startsWith(genusName.toLowerCase())
      )

      if (genusMatch) {
        return genusMatch
      }

      // Try common name if provided
      if (commonName) {
        const commonResults = await this.searchByCommonName(commonName)
        if (commonResults.length > 0) {
          return commonResults[0]
        }
      }

      return null
    } catch (error) {
      console.error('Trefle find best match error:', error)
      return null
    }
  }

  /**
   * Enrich herb data with Trefle information
   */
  async enrichHerbData(herb: { scientificName: string; name: string }): Promise<{
    trefleId: number | null
    trefleSlug: string | null
    family: string | null
    author: string | null
    synonyms: string[]
    imageUrl: string | null
    distributions: {
      native: string[]
      introduced: string[]
    } | null
    edible: boolean | null
    ediblePart: string[] | null
    toxicity: string | null
    growthHabit: string | null
    averageHeight: number | null
    sources: Array<{
      name: string
      url: string
      citation: string | null
    }>
  } | null> {
    try {
      // Find best match in Trefle
      const match = await this.findBestMatch(herb.scientificName, herb.name)

      if (!match) {
        console.log(`No Trefle match found for ${herb.scientificName}`)
        return null
      }

      // Get detailed information
      const details = await this.getPlantById(match.id)

      return {
        trefleId: details.id,
        trefleSlug: details.slug,
        family: details.family,
        author: details.author,
        synonyms: details.synonyms || [],
        imageUrl: details.main_species?.image_url || details.image_url,
        distributions: details.main_species?.distributions
          ? {
              native: details.main_species.distributions.native || [],
              introduced: details.main_species.distributions.introduced || [],
            }
          : null,
        edible: details.main_species?.edible || null,
        ediblePart: details.main_species?.edible_part || null,
        toxicity: details.main_species?.specifications?.toxicity || null,
        growthHabit: details.main_species?.specifications?.growth_habit || null,
        averageHeight: details.main_species?.specifications?.average_height?.cm || null,
        sources:
          details.main_species?.sources?.map((source) => ({
            name: source.name,
            url: source.url,
            citation: source.citation,
          })) || [],
      }
    } catch (error) {
      console.error('Trefle enrich herb data error:', error)
      return null
    }
  }

  /**
   * Validate scientific name against Trefle database
   */
  async validateScientificName(scientificName: string): Promise<{
    valid: boolean
    matchedName: string | null
    suggestions: string[]
  }> {
    try {
      const results = await this.searchByScientificName(scientificName)

      if (results.length === 0) {
        return {
          valid: false,
          matchedName: null,
          suggestions: [],
        }
      }

      // Exact match
      const exactMatch = results.find(
        (result) => result.scientific_name.toLowerCase() === scientificName.toLowerCase()
      )

      if (exactMatch) {
        return {
          valid: true,
          matchedName: exactMatch.scientific_name,
          suggestions: [],
        }
      }

      // Partial matches
      return {
        valid: false,
        matchedName: null,
        suggestions: results.slice(0, 5).map((result) => result.scientific_name),
      }
    } catch (error) {
      console.error('Trefle validate scientific name error:', error)
      return {
        valid: false,
        matchedName: null,
        suggestions: [],
      }
    }
  }
}

// Export singleton instance
let trefleClient: TrefleClient | null = null

export function getTrefleClient(): TrefleClient {
  if (!trefleClient) {
    const apiKey = process.env.TREFLE_API_KEY

    if (!apiKey) {
      throw new Error(
        'TREFLE_API_KEY environment variable is not set. Get your API key at https://trefle.io/'
      )
    }

    trefleClient = new TrefleClient({
      apiKey,
      timeout: 30000,
    })
  }

  return trefleClient
}

// Export helper function for easy enrichment
export async function enrichHerbWithTrefle(herb: {
  scientificName: string
  name: string
}): Promise<ReturnType<TrefleClient['enrichHerbData']>> {
  const client = getTrefleClient()
  return client.enrichHerbData(herb)
}

// Export helper function for validation
export async function validateScientificNameWithTrefle(
  scientificName: string
): Promise<ReturnType<TrefleClient['validateScientificName']>> {
  const client = getTrefleClient()
  return client.validateScientificName(scientificName)
}
