/**
 * Grok AI Client Test Suite
 *
 * Tests the Grok AI client including:
 * - Configuration and initialization
 * - Chat completions
 * - Retry logic with exponential backoff
 * - Error handling
 * - Caching behavior
 * - Specialized methods (symptom analysis, TCM patterns, herb recommendations)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GrokAPIError, GrokClient } from '../client'
import * as cacheModule from '@/lib/cache'

// Mock the cache module
vi.mock('@/lib/cache', () => ({
  cacheKeys: {
    aiSymptomAnalysis: (symptoms: string) => `ai:symptoms:${symptoms}`,
  },
  cacheTTL: {
    aiSymptomAnalysis: 86400,
  },
  getCombinedCache: vi.fn(),
  setCombinedCache: vi.fn(),
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('GrokClient', () => {
  let client: GrokClient

  beforeEach(() => {
    vi.clearAllMocks()
    client = new GrokClient('test-api-key', 'https://api.test.com', 'test-model')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Configuration', () => {
    it('should initialize with provided config', () => {
      expect(client.isConfigured()).toBe(true)
    })

    it.skip('should initialize with environment variables', () => {
      // Save original values
      const originalApiKey = process.env.GROK_API_KEY
      const originalApiUrl = process.env.GROK_API_URL
      const originalModel = process.env.GROK_MODEL

      // Set test values
      process.env.GROK_API_KEY = 'env-api-key'
      process.env.GROK_API_URL = 'https://env-api.com'
      process.env.GROK_MODEL = 'env-model'

      const envClient = new GrokClient()
      expect(envClient.isConfigured()).toBe(true)

      // Restore original values
      if (originalApiKey) process.env.GROK_API_KEY = originalApiKey
      else delete process.env.GROK_API_KEY
      if (originalApiUrl) process.env.GROK_API_URL = originalApiUrl
      else delete process.env.GROK_API_URL
      if (originalModel) process.env.GROK_MODEL = originalModel
      else delete process.env.GROK_MODEL
    })

    it('should detect when API key is not configured', () => {
      const unconfiguredClient = new GrokClient('', '', '')
      expect(unconfiguredClient.isConfigured()).toBe(false)
    })

    it('should use default values for optional config', () => {
      const defaultClient = new GrokClient('test-key')
      expect(defaultClient.isConfigured()).toBe(true)
    })
  })

  describe('createChatCompletion', () => {
    it('should make successful API call', async () => {
      const mockResponse = {
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Test response',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await client.createChatCompletion({
        messages: [
          {
            role: 'user',
            content: 'Test prompt',
          },
        ],
      })

      expect(result).toBe('Test response')
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          },
        })
      )
    })

    it('should throw error when API key is not configured', async () => {
      const unconfiguredClient = new GrokClient('', '', '')

      await expect(
        unconfiguredClient.createChatCompletion({
          messages: [{ role: 'user', content: 'test' }],
        })
      ).rejects.toThrow(GrokAPIError)
    })

    it('should use default temperature, max_tokens, and top_p', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'test' } }],
        }),
      })

      await client.createChatCompletion({
        messages: [{ role: 'user', content: 'test' }],
      })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.temperature).toBe(0.7)
      expect(requestBody.max_tokens).toBe(1500)
      expect(requestBody.top_p).toBe(1)
    })

    it('should allow custom temperature, max_tokens, and top_p', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'test' } }],
        }),
      })

      await client.createChatCompletion({
        messages: [{ role: 'user', content: 'test' }],
        temperature: 0.5,
        max_tokens: 1000,
        top_p: 0.9,
      })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.temperature).toBe(0.5)
      expect(requestBody.max_tokens).toBe(1000)
      expect(requestBody.top_p).toBe(0.9)
    })
  })

  describe('Error Handling', () => {
    it('should throw GrokAPIError on API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: 'Invalid request',
            type: 'invalid_request_error',
            code: 'invalid_input',
          },
        }),
      })

      await expect(
        client.createChatCompletion({
          messages: [{ role: 'user', content: 'test' }],
        })
      ).rejects.toThrow(GrokAPIError)
    })

    it('should throw GrokAPIError when no choices returned', async () => {
      // Mock all 3 retry attempts to return empty choices
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [],
          }),
        })

      await expect(
        client.createChatCompletion({
          messages: [{ role: 'user', content: 'test' }],
        })
      ).rejects.toThrow(GrokAPIError)

      // Should have retried 3 times
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should include error details in GrokAPIError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: {
            message: 'Rate limit exceeded',
            type: 'rate_limit_error',
            code: 'too_many_requests',
          },
        }),
      })

      try {
        await client.createChatCompletion({
          messages: [{ role: 'user', content: 'test' }],
        })
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeInstanceOf(GrokAPIError)
        const grokError = error as GrokAPIError
        expect(grokError.statusCode).toBe(429)
        expect(grokError.type).toBe('rate_limit_error')
        expect(grokError.code).toBe('too_many_requests')
        expect(grokError.message).toBe('Rate limit exceeded')
      }
    })
  })

  describe('Retry Logic', () => {
    it('should retry on network error', async () => {
      // First 2 calls fail, 3rd succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'Success after retry' } }],
          }),
        })

      const result = await client.createChatCompletion({
        messages: [{ role: 'user', content: 'test' }],
      })

      expect(result).toBe('Success after retry')
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should retry on 500 server error', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({
            error: {
              message: 'Internal server error',
              type: 'server_error',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'Success after retry' } }],
          }),
        })

      const result = await client.createChatCompletion({
        messages: [{ role: 'user', content: 'test' }],
      })

      expect(result).toBe('Success after retry')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should NOT retry on 4xx client errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: 'Bad request',
            type: 'invalid_request_error',
          },
        }),
      })

      await expect(
        client.createChatCompletion({
          messages: [{ role: 'user', content: 'test' }],
        })
      ).rejects.toThrow(GrokAPIError)

      // Should only be called once (no retry)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should fail after max retries', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(
        client.createChatCompletion({
          messages: [{ role: 'user', content: 'test' }],
        })
      ).rejects.toThrow('Network error')

      // Should be called 3 times (initial + 2 retries)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('Caching', () => {
    it('should return cached response when available', async () => {
      const cachedResponse = 'Cached response'
      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(cachedResponse)

      const result = await client.createChatCompletionCached({
        messages: [{ role: 'user', content: 'test' }],
      })

      expect(result).toBe(cachedResponse)
      expect(mockFetch).not.toHaveBeenCalled()
      expect(cacheModule.getCombinedCache).toHaveBeenCalledTimes(1)
    })

    it('should make API call and cache response on cache miss', async () => {
      const apiResponse = 'Fresh API response'
      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)
      vi.mocked(cacheModule.setCombinedCache).mockResolvedValueOnce(undefined)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: apiResponse } }],
        }),
      })

      const result = await client.createChatCompletionCached({
        messages: [{ role: 'user', content: 'test' }],
      })

      expect(result).toBe(apiResponse)
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(cacheModule.setCombinedCache).toHaveBeenCalledWith(
        expect.any(String),
        apiResponse,
        86400
      )
    })

    it('should use custom cache key if provided', async () => {
      const customKey = 'custom:cache:key'
      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)
      vi.mocked(cacheModule.setCombinedCache).mockResolvedValueOnce(undefined)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'response' } }],
        }),
      })

      await client.createChatCompletionCached(
        {
          messages: [{ role: 'user', content: 'test' }],
        },
        customKey
      )

      expect(cacheModule.getCombinedCache).toHaveBeenCalledWith(customKey)
      expect(cacheModule.setCombinedCache).toHaveBeenCalledWith(customKey, 'response', 86400)
    })

    it('should use custom TTL if provided', async () => {
      const customTTL = 3600
      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)
      vi.mocked(cacheModule.setCombinedCache).mockResolvedValueOnce(undefined)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'response' } }],
        }),
      })

      await client.createChatCompletionCached(
        {
          messages: [{ role: 'user', content: 'test' }],
        },
        undefined,
        customTTL
      )

      expect(cacheModule.setCombinedCache).toHaveBeenCalledWith(
        expect.any(String),
        'response',
        customTTL
      )
    })
  })

  describe('analyzeSymptoms', () => {
    it('should analyze symptoms with caching enabled by default', async () => {
      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)
      vi.mocked(cacheModule.setCombinedCache).mockResolvedValueOnce(undefined)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Analysis result' } }],
        }),
      })

      const result = await client.analyzeSymptoms(['headache', 'fatigue'])

      expect(result).toBe('Analysis result')
      expect(cacheModule.getCombinedCache).toHaveBeenCalled()
      expect(cacheModule.setCombinedCache).toHaveBeenCalled()
    })

    it('should skip caching when useCache is false', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Analysis result' } }],
        }),
      })

      const result = await client.analyzeSymptoms(['headache', 'fatigue'], {
        useCache: false,
      })

      expect(result).toBe('Analysis result')
      expect(cacheModule.getCombinedCache).not.toHaveBeenCalled()
      expect(cacheModule.setCombinedCache).not.toHaveBeenCalled()
    })

    it('should include duration, severity, and additionalInfo in prompt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Analysis' } }],
        }),
      })

      await client.analyzeSymptoms(['headache'], {
        duration: '3 days',
        severity: 'moderate',
        additionalInfo: 'Worse in morning',
        useCache: false,
      })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      const userMessage = requestBody.messages.find((m: any) => m.role === 'user')

      expect(userMessage.content).toContain('Duration: 3 days')
      expect(userMessage.content).toContain('Severity: moderate')
      expect(userMessage.content).toContain('Additional Information: Worse in morning')
    })

    it('should use custom temperature and maxTokens', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Analysis' } }],
        }),
      })

      await client.analyzeSymptoms(['headache'], {
        temperature: 0.5,
        maxTokens: 1000,
        useCache: false,
      })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.temperature).toBe(0.5)
      expect(requestBody.max_tokens).toBe(1000)
    })
  })

  describe('analyzeTCMPattern', () => {
    it('should analyze TCM pattern and return structured data', async () => {
      const mockTCMResponse = JSON.stringify({
        pattern: 'Spleen Qi Deficiency',
        diagnosis: 'Weak digestive system with fatigue',
        recommendations: ['Ginseng', 'Astragalus', 'Atractylodes'],
        confidence: 0.85,
      })

      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)
      vi.mocked(cacheModule.setCombinedCache).mockResolvedValueOnce(undefined)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: mockTCMResponse } }],
        }),
      })

      const result = await client.analyzeTCMPattern(['fatigue', 'bloating', 'loose stool'])

      expect(result.pattern).toBe('Spleen Qi Deficiency')
      expect(result.diagnosis).toBe('Weak digestive system with fatigue')
      expect(result.recommendations).toEqual(['Ginseng', 'Astragalus', 'Atractylodes'])
      expect(result.confidence).toBe(0.85)
    })

    it('should use lower temperature for consistent JSON output', async () => {
      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  pattern: 'Test',
                  diagnosis: 'Test',
                  recommendations: [],
                  confidence: 0.5,
                }),
              },
            },
          ],
        }),
      })

      await client.analyzeTCMPattern(['test'])

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.temperature).toBe(0.3)
    })

    it('should throw error on invalid JSON response', async () => {
      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Not valid JSON' } }],
        }),
      })

      await expect(client.analyzeTCMPattern(['test'])).rejects.toThrow(GrokAPIError)
    })

    it('should handle missing fields in JSON response', async () => {
      const incompleteResponse = JSON.stringify({
        pattern: 'Test Pattern',
        // Missing diagnosis, recommendations, confidence
      })

      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: incompleteResponse } }],
        }),
      })

      const result = await client.analyzeTCMPattern(['test'])

      expect(result.pattern).toBe('Test Pattern')
      expect(result.diagnosis).toBe('No diagnosis available')
      expect(result.recommendations).toEqual([])
      expect(result.confidence).toBe(0.5)
    })
  })

  describe('getHerbRecommendations', () => {
    it('should get herb recommendations with structured data', async () => {
      const mockHerbResponse = JSON.stringify([
        {
          name: 'Ginseng',
          latinName: 'Panax ginseng',
          dosage: '1-2g daily',
          explanation: 'Boosts energy and immunity',
          safetyRating: 'safe',
        },
        {
          name: 'Ginger',
          latinName: 'Zingiber officinale',
          dosage: '2-4g daily',
          explanation: 'Aids digestion and reduces nausea',
          safetyRating: 'safe',
        },
      ])

      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)
      vi.mocked(cacheModule.setCombinedCache).mockResolvedValueOnce(undefined)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: mockHerbResponse } }],
        }),
      })

      const result = await client.getHerbRecommendations(['fatigue', 'nausea'])

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Ginseng')
      expect(result[0].safetyRating).toBe('safe')
      expect(result[1].name).toBe('Ginger')
    })

    it('should respect maxHerbs parameter', async () => {
      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '[]' } }],
        }),
      })

      await client.getHerbRecommendations(['test'], undefined, { maxHerbs: 3 })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      const userMessage = requestBody.messages.find((m: any) => m.role === 'user')

      expect(userMessage.content).toContain('recommend 3 herbs')
      expect(userMessage.content).toContain('Limit to 3 herbs')
    })

    it('should exclude specified herbs', async () => {
      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '[]' } }],
        }),
      })

      await client.getHerbRecommendations(['test'], undefined, {
        excludeHerbs: ['Ephedra', 'Ma Huang'],
      })

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      const userMessage = requestBody.messages.find((m: any) => m.role === 'user')

      expect(userMessage.content).toContain('Exclude: Ephedra, Ma Huang')
    })

    it('should include TCM pattern in prompt when provided', async () => {
      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '[]' } }],
        }),
      })

      await client.getHerbRecommendations(['fatigue'], 'Spleen Qi Deficiency')

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      const userMessage = requestBody.messages.find((m: any) => m.role === 'user')

      expect(userMessage.content).toContain('Spleen Qi Deficiency')
    })

    it('should throw error on invalid JSON array response', async () => {
      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Not an array' } }],
        }),
      })

      await expect(client.getHerbRecommendations(['test'])).rejects.toThrow(GrokAPIError)
    })

    it('should throw error on non-array JSON response', async () => {
      vi.mocked(cacheModule.getCombinedCache).mockResolvedValueOnce(null)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{"not": "array"}' } }],
        }),
      })

      await expect(client.getHerbRecommendations(['test'])).rejects.toThrow(GrokAPIError)
    })
  })

  describe('GrokAPIError', () => {
    it('should create error with all properties', () => {
      const error = new GrokAPIError('Test message', 429, 'rate_limit_error', 'too_many_requests')

      expect(error.message).toBe('Test message')
      expect(error.statusCode).toBe(429)
      expect(error.type).toBe('rate_limit_error')
      expect(error.code).toBe('too_many_requests')
      expect(error.name).toBe('GrokAPIError')
      expect(error).toBeInstanceOf(Error)
    })

    it('should create error without optional code', () => {
      const error = new GrokAPIError('Test message', 500, 'server_error')

      expect(error.message).toBe('Test message')
      expect(error.statusCode).toBe(500)
      expect(error.type).toBe('server_error')
      expect(error.code).toBeUndefined()
    })
  })
})
