/**
 * Perenual API Integration
 *
 * Perenual is a plant database API with over 10,000+ plant species,
 * including cultivation tips, pest information, care guides, and images.
 * We use it to augment our herb database with practical growing information.
 *
 * API Documentation: https://perenual.com/docs/api
 * Sign up for API key: https://perenual.com/docs/api
 */

import axios, { AxiosInstance } from 'axios'

const PERENUAL_BASE_URL = 'https://perenual.com/api'

interface PerenualConfig {
  apiKey: string
  timeout?: number
}

interface PerenualSearchResult {
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

interface PerenualPlantDetail {
  id: number
  common_name: string
  scientific_name: string[]
  other_name: string[]
  family: string | null
  origin: string[] | null
  type: string
  dimension: string | null
  dimensions: {
    type: string | null
    min_value: number | null
    max_value: number | null
    unit: string | null
  } | null
  cycle: string
  attracts: string[]
  propagation: string[]
  hardiness: {
    min: string
    max: string
  } | null
  hardiness_location: {
    full_url: string
    full_iframe: string
  } | null
  watering: string
  depth_water_requirement: {
    unit: string
    value: string
  } | null
  volume_water_requirement: {
    unit: string
    value: string
  } | null
  watering_period: string | null
  watering_general_benchmark: {
    value: string
    unit: string
  } | null
  plant_anatomy: Array<{
    part: string
    color: string[]
  }> | null
  sunlight: string[]
  pruning_month: string[]
  pruning_count: {
    amount: number
    interval: string
  } | null
  seeds: number | null
  maintenance: string | null
  care_guides: string | null
  soil: string[]
  growth_rate: string
  drought_tolerant: boolean
  salt_tolerant: boolean
  thorny: boolean
  invasive: boolean
  tropical: boolean
  indoor: boolean
  care_level: string
  pest_susceptibility: string[]
  pest_susceptibility_api: string | null
  flowers: boolean
  flowering_season: string | null
  flower_color: string | null
  cones: boolean
  fruits: boolean
  edible_fruit: boolean
  edible_fruit_taste_profile: string | null
  fruit_nutritional_value: string | null
  fruit_color: string[]
  harvest_season: string | null
  leaf: boolean
  leaf_color: string[]
  edible_leaf: boolean
  cuisine: boolean
  medicinal: boolean
  poisonous_to_humans: number
  poisonous_to_pets: number
  description: string | null
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
  other_images: string | null
}

interface PerenualCareGuide {
  id: number
  species_id: number
  common_name: string
  scientific_name: string[]
  section: Array<{
    id: number
    type: string
    description: string
  }>
}

interface PerenualPestInfo {
  id: number
  species_id: number
  common_name: string
  scientific_name: string[]
  family: string | null
  pest_susceptibility: Array<{
    id: number
    name: string
    scientific_name: string
    description: string
    solution: string
    images: Array<{
      original_url: string
      regular_url: string
      medium_url: string
      small_url: string
      thumbnail: string
    }>
  }>
}

interface PerenualPaginatedResponse<T> {
  data: T[]
  to: number
  per_page: number
  current_page: number
  from: number
  last_page: number
  total: number
}

export class PerenualClient {
  private client: AxiosInstance
  private apiKey: string

  constructor(config: PerenualConfig) {
    this.apiKey = config.apiKey

    this.client = axios.create({
      baseURL: PERENUAL_BASE_URL,
      timeout: config.timeout || 30000,
      params: {
        key: this.apiKey,
      },
    })

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(
      async (config) => {
        // Perenual free tier has rate limits - add delay
        await this.sleep(1000) // 1 second delay
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          console.warn('Perenual API rate limit reached. Waiting 60 seconds...')
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
   * Search for plants by name
   */
  async searchPlants(
    query: string,
    page: number = 1
  ): Promise<PerenualPaginatedResponse<PerenualSearchResult>> {
    try {
      const response = await this.client.get<
        PerenualPaginatedResponse<PerenualSearchResult>
      >('/species-list', {
        params: {
          q: query,
          page,
        },
      })

      return response.data
    } catch (error) {
      console.error('Perenual search error:', error)
      throw error
    }
  }

  /**
   * Get detailed plant information by ID
   */
  async getPlantById(id: number): Promise<PerenualPlantDetail> {
    try {
      const response = await this.client.get<PerenualPlantDetail>(
        `/species/details/${id}`
      )

      return response.data
    } catch (error) {
      console.error('Perenual get plant error:', error)
      throw error
    }
  }

  /**
   * Get care guide for a plant
   */
  async getCareGuide(plantId: number): Promise<PerenualCareGuide | null> {
    try {
      const response = await this.client.get<PerenualCareGuide>(
        `/species-care-guide-list`,
        {
          params: {
            species_id: plantId,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Perenual care guide error:', error)
      return null
    }
  }

  /**
   * Get pest and disease information
   */
  async getPestInfo(plantId: number): Promise<PerenualPestInfo | null> {
    try {
      const response = await this.client.get<PerenualPestInfo>(
        `/pest-disease-list`,
        {
          params: {
            species_id: plantId,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Perenual pest info error:', error)
      return null
    }
  }

  /**
   * Find best match for a plant
   */
  async findBestMatch(
    scientificName: string,
    commonName?: string
  ): Promise<PerenualSearchResult | null> {
    try {
      // Try scientific name first
      let results = await this.searchPlants(scientificName)

      // Check for exact scientific name match
      const exactMatch = results.data.find((result) =>
        result.scientific_name.some(
          (name) => name.toLowerCase() === scientificName.toLowerCase()
        )
      )

      if (exactMatch) {
        return exactMatch
      }

      // Try common name if provided
      if (commonName) {
        results = await this.searchPlants(commonName)
        if (results.data.length > 0) {
          return results.data[0]
        }
      }

      // Return first result if any
      return results.data.length > 0 ? results.data[0] : null
    } catch (error) {
      console.error('Perenual find best match error:', error)
      return null
    }
  }

  /**
   * Enrich herb data with Perenual cultivation information
   */
  async enrichHerbData(herb: {
    scientificName: string
    name: string
  }): Promise<{
    perenualId: number | null
    commonName: string | null
    family: string | null
    origin: string[] | null
    cultivation: {
      cycle: string | null
      watering: string | null
      wateringPeriod: string | null
      sunlight: string[] | null
      soil: string[] | null
      hardiness: { min: string; max: string } | null
      maintenance: string | null
      careLevel: string | null
      growthRate: string | null
      indoor: boolean
      droughtTolerant: boolean
      saltTolerant: boolean
    } | null
    propagation: string[] | null
    pruning: {
      months: string[] | null
      frequency: { amount: number; interval: string } | null
    } | null
    pests: Array<{
      name: string
      scientificName: string
      description: string
      solution: string
    }>
    edibility: {
      edibleFruit: boolean
      edibleLeaf: boolean
      tasteProfile: string | null
      nutritionalValue: string | null
      cuisine: boolean
    } | null
    medicinal: boolean
    toxicity: {
      toHumans: number
      toPets: number
    } | null
    attracts: string[]
    imageUrl: string | null
    careGuide: string | null
  } | null> {
    try {
      // Find best match in Perenual
      const match = await this.findBestMatch(herb.scientificName, herb.name)

      if (!match) {
        console.log(`No Perenual match found for ${herb.scientificName}`)
        return null
      }

      // Get detailed information
      const details = await this.getPlantById(match.id)

      // Get care guide and pest info
      const careGuide = await this.getCareGuide(match.id)
      const pestInfo = await this.getPestInfo(match.id)

      return {
        perenualId: details.id,
        commonName: details.common_name,
        family: details.family,
        origin: details.origin,
        cultivation: {
          cycle: details.cycle,
          watering: details.watering,
          wateringPeriod: details.watering_period,
          sunlight: details.sunlight,
          soil: details.soil,
          hardiness: details.hardiness,
          maintenance: details.maintenance,
          careLevel: details.care_level,
          growthRate: details.growth_rate,
          indoor: details.indoor,
          droughtTolerant: details.drought_tolerant,
          saltTolerant: details.salt_tolerant,
        },
        propagation: details.propagation,
        pruning: details.pruning_month
          ? {
              months: details.pruning_month,
              frequency: details.pruning_count,
            }
          : null,
        pests:
          pestInfo?.pest_susceptibility?.map((pest) => ({
            name: pest.name,
            scientificName: pest.scientific_name,
            description: pest.description,
            solution: pest.solution,
          })) || [],
        edibility: {
          edibleFruit: details.edible_fruit,
          edibleLeaf: details.edible_leaf,
          tasteProfile: details.edible_fruit_taste_profile,
          nutritionalValue: details.fruit_nutritional_value,
          cuisine: details.cuisine,
        },
        medicinal: details.medicinal,
        toxicity: {
          toHumans: details.poisonous_to_humans,
          toPets: details.poisonous_to_pets,
        },
        attracts: details.attracts || [],
        imageUrl: details.default_image?.regular_url || null,
        careGuide: careGuide?.section
          ?.map((s) => `${s.type}: ${s.description}`)
          .join('\n\n') || null,
      }
    } catch (error) {
      console.error('Perenual enrich herb data error:', error)
      return null
    }
  }
}

// Export singleton instance
let perenualClient: PerenualClient | null = null

export function getPerenualClient(): PerenualClient {
  if (!perenualClient) {
    const apiKey = process.env.PERENUAL_API_KEY

    if (!apiKey) {
      throw new Error(
        'PERENUAL_API_KEY environment variable is not set. Get your API key at https://perenual.com/docs/api'
      )
    }

    perenualClient = new PerenualClient({
      apiKey,
      timeout: 30000,
    })
  }

  return perenualClient
}

// Export helper function for easy enrichment
export async function enrichHerbWithPerenual(herb: {
  scientificName: string
  name: string
}): Promise<ReturnType<PerenualClient['enrichHerbData']>> {
  const client = getPerenualClient()
  return client.enrichHerbData(herb)
}
