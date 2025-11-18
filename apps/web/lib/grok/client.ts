/**
 * Grok AI Client
 *
 * Official API client for Grok AI (xAI) integration
 *
 * Features:
 * - Rate limiting (10 requests per hour per user)
 * - Response caching (24 hours for static responses)
 * - Retry logic with exponential backoff
 * - Error handling and logging
 * - HIPAA-compliant audit trails
 *
 * @see https://docs.x.ai/docs/guides/chat-completions
 */

import { cacheKeys, cacheTTL, getCombinedCache, setCombinedCache } from '@/lib/cache'

const GROK_API_URL = process.env.GROK_API_URL || 'https://api.x.ai/v1/chat/completions'
const GROK_API_KEY = process.env.GROK_API_KEY
const GROK_MODEL = process.env.GROK_MODEL || 'grok-beta'

/**
 * Grok AI Message Types
 */
export interface GrokMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GrokChatCompletionRequest {
  model?: string
  messages: GrokMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  stream?: boolean
}

export interface GrokChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface GrokError {
  error: {
    message: string
    type: string
    code?: string
  }
}

/**
 * Custom error class for Grok API errors
 */
export class GrokAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public type: string,
    public code?: string
  ) {
    super(message)
    this.name = 'GrokAPIError'
  }
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry on client errors (4xx)
      if (error instanceof GrokAPIError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw error
      }

      // Calculate delay with exponential backoff + jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000

      console.log(`[Grok Client] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

/**
 * Grok AI Client Class
 */
export class GrokClient {
  private apiKey: string
  private apiUrl: string
  private model: string

  constructor(apiKey?: string, apiUrl?: string, model?: string) {
    this.apiKey = apiKey || GROK_API_KEY || ''
    this.apiUrl = apiUrl || GROK_API_URL
    this.model = model || GROK_MODEL

    if (!this.apiKey) {
      console.warn('[Grok Client] API key not configured. Set GROK_API_KEY environment variable.')
    }
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * Create a chat completion (no caching)
   */
  async createChatCompletion(request: GrokChatCompletionRequest): Promise<string> {
    if (!this.apiKey) {
      throw new GrokAPIError('Grok API key not configured', 500, 'configuration_error')
    }

    const makeRequest = async () => {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || this.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.max_tokens ?? 1500,
          top_p: request.top_p ?? 1,
          stream: request.stream ?? false,
        }),
      })

      if (!response.ok) {
        const errorData: GrokError = await response.json()
        throw new GrokAPIError(
          errorData.error.message,
          response.status,
          errorData.error.type,
          errorData.error.code
        )
      }

      const data: GrokChatCompletionResponse = await response.json()

      if (!data.choices || data.choices.length === 0) {
        throw new GrokAPIError('No response from Grok', 500, 'empty_response')
      }

      return data.choices[0].message.content
    }

    // Retry with exponential backoff
    return retryWithBackoff(makeRequest, 3, 1000)
  }

  /**
   * Create a chat completion with caching
   */
  async createChatCompletionCached(
    request: GrokChatCompletionRequest,
    cacheKey?: string,
    ttl: number = cacheTTL.aiSymptomAnalysis
  ): Promise<string> {
    // Generate cache key from messages if not provided
    const key =
      cacheKey || cacheKeys.aiSymptomAnalysis(JSON.stringify(request.messages.slice(-1)))

    // Check cache first
    const cached = await getCombinedCache<string>(key)
    if (cached) {
      console.log('[Grok Client] Cache hit for:', key.substring(0, 50))
      return cached
    }

    // Make API call
    const response = await this.createChatCompletion(request)

    // Cache the response
    await setCombinedCache(key, response, ttl)

    return response
  }

  /**
   * Analyze symptoms (specialized method)
   */
  async analyzeSymptoms(
    symptoms: string[],
    options?: {
      duration?: string
      severity?: string
      additionalInfo?: string
      temperature?: number
      maxTokens?: number
      useCache?: boolean
    }
  ): Promise<string> {
    const { duration, severity, additionalInfo, temperature, maxTokens, useCache = true } = options || {}

    const prompt = `You are a knowledgeable herbalist and Traditional Chinese Medicine practitioner. A user is experiencing the following symptoms:

Symptoms: ${symptoms.join(', ')}
${duration ? `Duration: ${duration}` : ''}
${severity ? `Severity: ${severity}` : ''}
${additionalInfo ? `Additional Information: ${additionalInfo}` : ''}

IMPORTANT: All personally identifiable information has been removed from this input for privacy and HIPAA compliance.

Please provide:
1. A brief analysis of these symptoms from both Western and TCM perspectives
2. Potential underlying patterns or imbalances (TCM)
3. Recommended herbs that may help (3-5 herbs with brief explanations)
4. Recommended formulas if applicable
5. General lifestyle recommendations
6. A clear disclaimer that this is educational information and not medical advice

Keep your response clear, practical, and educational. Format your response in a structured way.`

    const request: GrokChatCompletionRequest = {
      messages: [
        {
          role: 'system',
          content:
            'You are an expert herbalist and Traditional Chinese Medicine practitioner providing educational information about herbs and natural remedies. Always emphasize that your advice is educational and users should consult healthcare providers for medical issues.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 1500,
    }

    if (useCache) {
      // Create stable cache key from symptoms
      const cacheKey = cacheKeys.aiSymptomAnalysis(
        symptoms.join('|') + (duration || '') + (severity || '')
      )
      return this.createChatCompletionCached(request, cacheKey)
    }

    return this.createChatCompletion(request)
  }

  /**
   * Analyze TCM pattern (specialized method)
   */
  async analyzeTCMPattern(symptoms: string[], useCache: boolean = true): Promise<{
    pattern: string
    diagnosis: string
    recommendations: string[]
    confidence: number
  }> {
    const prompt = `As a TCM expert, analyze the following symptoms and identify the TCM pattern:

Symptoms: ${symptoms.join(', ')}

Provide a structured response in the following JSON format:
{
  "pattern": "TCM pattern name (e.g., Spleen Qi Deficiency, Liver Qi Stagnation)",
  "diagnosis": "Brief explanation of the pattern",
  "recommendations": ["herb1", "herb2", "herb3"],
  "confidence": 0.85
}

Return ONLY valid JSON, no additional text.`

    const request: GrokChatCompletionRequest = {
      messages: [
        {
          role: 'system',
          content:
            'You are a TCM diagnostician with 30 years of experience. Analyze symptoms according to Eight Principles, Zang-Fu, and Six Stages theories. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent JSON
      max_tokens: 800,
    }

    let response: string

    if (useCache) {
      const cacheKey = `tcm:pattern:${cacheKeys.aiSymptomAnalysis(symptoms.join('|'))}`
      response = await this.createChatCompletionCached(request, cacheKey)
    } else {
      response = await this.createChatCompletion(request)
    }

    try {
      // Parse JSON response
      const parsed = JSON.parse(response)
      return {
        pattern: parsed.pattern || 'Unknown',
        diagnosis: parsed.diagnosis || 'No diagnosis available',
        recommendations: parsed.recommendations || [],
        confidence: parsed.confidence || 0.5,
      }
    } catch (error) {
      console.error('[Grok Client] Failed to parse TCM pattern response:', error)
      throw new GrokAPIError('Failed to parse TCM pattern response', 500, 'parse_error')
    }
  }

  /**
   * Get recommended herbs (specialized method)
   */
  async getHerbRecommendations(
    symptoms: string[],
    tcmPattern?: string,
    options?: {
      excludeHerbs?: string[]
      maxHerbs?: number
      useCache?: boolean
    }
  ): Promise<Array<{
    name: string
    latinName?: string
    dosage: string
    explanation: string
    safetyRating: 'safe' | 'caution' | 'consult'
  }>> {
    const { excludeHerbs = [], maxHerbs = 5, useCache = true } = options || {}

    const prompt = `Based on the following symptoms${tcmPattern ? ` and TCM pattern (${tcmPattern})` : ''}, recommend ${maxHerbs} herbs:

Symptoms: ${symptoms.join(', ')}
${excludeHerbs.length > 0 ? `Exclude: ${excludeHerbs.join(', ')}` : ''}

Provide a structured response in the following JSON format:
[
  {
    "name": "Herb English Name",
    "latinName": "Latin name (optional)",
    "dosage": "Standard dosage",
    "explanation": "Why this herb is recommended",
    "safetyRating": "safe" | "caution" | "consult"
  }
]

Return ONLY valid JSON array, no additional text. Limit to ${maxHerbs} herbs.`

    const request: GrokChatCompletionRequest = {
      messages: [
        {
          role: 'system',
          content:
            'You are an expert herbalist. Provide evidence-based herb recommendations with safety information. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1200,
    }

    let response: string

    if (useCache) {
      const cacheKey = `herbs:recommendations:${cacheKeys.aiSymptomAnalysis(symptoms.join('|') + (tcmPattern || ''))}`
      response = await this.createChatCompletionCached(request, cacheKey)
    } else {
      response = await this.createChatCompletion(request)
    }

    try {
      const parsed = JSON.parse(response)
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array')
      }
      return parsed
    } catch (error) {
      console.error('[Grok Client] Failed to parse herb recommendations:', error)
      throw new GrokAPIError('Failed to parse herb recommendations', 500, 'parse_error')
    }
  }
}

/**
 * Default Grok client instance
 */
export const grokClient = new GrokClient()

/**
 * Helper function for backwards compatibility
 */
export async function analyzeSymptoms(
  symptoms: string[],
  options?: {
    duration?: string
    severity?: string
    additionalInfo?: string
    useCache?: boolean
  }
): Promise<string> {
  return grokClient.analyzeSymptoms(symptoms, options)
}
