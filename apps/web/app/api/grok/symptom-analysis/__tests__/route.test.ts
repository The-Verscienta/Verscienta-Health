/**
 * Symptom Analysis API Route Test Suite
 *
 * Tests the /api/grok/symptom-analysis endpoint including:
 * - Request validation
 * - Rate limiting
 * - HIPAA compliance (PII sanitization, audit logging)
 * - Grok AI integration
 * - Error handling
 * - Response formatting
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'
import * as cacheModule from '@/lib/cache'
import * as grokModule from '@/lib/grok/client'
import * as authModule from '@/lib/auth'
import * as auditLogModule from '@/lib/audit-log'

// Mock modules
vi.mock('@/lib/cache', () => ({
  checkRateLimit: vi.fn(),
}))

vi.mock('@/lib/grok/client', () => ({
  grokClient: {
    isConfigured: vi.fn(),
    analyzeSymptoms: vi.fn(),
  },
  GrokAPIError: class GrokAPIError extends Error {
    constructor(
      message: string,
      public statusCode: number,
      public type: string,
      public code?: string
    ) {
      super(message)
      this.name = 'GrokAPIError'
    }
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock('@/lib/audit-log', () => ({
  auditLog: {
    submitSymptoms: vi.fn(),
    suspiciousActivity: vi.fn(),
  },
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

describe('POST /api/grok/symptom-analysis', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mocks
    vi.mocked(grokModule.grokClient.isConfigured).mockReturnValue(true)
    vi.mocked(authModule.auth.api.getSession).mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        mfaEnabled: true,
      },
      session: {
        id: 'session-123',
      },
    } as any)

    vi.mocked(cacheModule.checkRateLimit).mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 600000,
    })

    vi.mocked(auditLogModule.auditLog.submitSymptoms).mockResolvedValue(undefined)
    vi.mocked(auditLogModule.auditLog.suspiciousActivity).mockResolvedValue(undefined)

    vi.mocked(grokModule.grokClient.analyzeSymptoms).mockResolvedValue(
      'Test analysis response'
    )
  })

  describe('Configuration Check', () => {
    it('should return 503 when Grok client is not configured', async () => {
      vi.mocked(grokModule.grokClient.isConfigured).mockReturnValue(false)

      const request = createRequest({
        symptoms: ['headache'],
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toBe('AI service not configured. Please contact support.')
    })
  })

  describe('Request Validation', () => {
    it('should require at least one symptom', async () => {
      const request = createRequest({
        symptoms: [],
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('At least one symptom is required')
    })

    it('should reject more than 20 symptoms', async () => {
      const symptoms = Array.from({ length: 21 }, (_, i) => `symptom${i}`)
      const request = createRequest({ symptoms })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Maximum 20 symptoms allowed')
    })

    it('should accept valid request with 1 symptom', async () => {
      const request = createRequest({
        symptoms: ['headache'],
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })

    it('should accept valid request with 20 symptoms', async () => {
      const symptoms = Array.from({ length: 20 }, (_, i) => `symptom${i}`)
      const request = createRequest({ symptoms })

      const response = await POST(request)
      expect(response.status).toBe(200)
    })
  })

  describe('Rate Limiting', () => {
    it('should return 429 when rate limit exceeded', async () => {
      const resetTime = Date.now() + 300000 // 5 minutes from now

      vi.mocked(cacheModule.checkRateLimit).mockResolvedValue({
        success: false,
        limit: 20,
        remaining: 0,
        reset: resetTime,
      })

      const request = createRequest({
        symptoms: ['headache'],
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Rate limit exceeded')
      expect(data.message).toContain('20 per hour')
      expect(data.resetAt).toBe(new Date(resetTime).toISOString())

      // Check rate limit headers
      expect(response.headers.get('X-RateLimit-Limit')).toBe('20')
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
      expect(response.headers.get('X-RateLimit-Reset')).toBe(resetTime.toString())
      expect(response.headers.get('Retry-After')).toBeTruthy()
    })

    it('should use user ID for rate limiting when authenticated', async () => {
      const request = createRequest({
        symptoms: ['headache'],
      })

      await POST(request)

      expect(cacheModule.checkRateLimit).toHaveBeenCalledWith('user-123', 'ai')
    })

    it('should use IP for rate limiting when not authenticated', async () => {
      vi.mocked(authModule.auth.api.getSession).mockResolvedValue(null)

      const request = createRequest(
        {
          symptoms: ['headache'],
        },
        '192.168.1.1'
      )

      await POST(request)

      expect(cacheModule.checkRateLimit).toHaveBeenCalledWith('192.168.1.1', 'ai')
    })

    it('should use "anonymous" when no user or IP', async () => {
      vi.mocked(authModule.auth.api.getSession).mockResolvedValue(null)

      const request = createRequest({
        symptoms: ['headache'],
      })

      await POST(request)

      expect(cacheModule.checkRateLimit).toHaveBeenCalledWith('anonymous', 'ai')
    })
  })

  describe('PII Sanitization', () => {
    it('should sanitize email addresses', async () => {
      const request = createRequest({
        symptoms: ['my email is test@example.com'],
      })

      await POST(request)

      const call = vi.mocked(grokModule.grokClient.analyzeSymptoms).mock.calls[0]
      expect(call[0][0]).toContain('[EMAIL REMOVED]')
      expect(call[0][0]).not.toContain('test@example.com')
    })

    it('should sanitize phone numbers', async () => {
      const request = createRequest({
        symptoms: ['call me at (555) 123-4567'],
      })

      await POST(request)

      const call = vi.mocked(grokModule.grokClient.analyzeSymptoms).mock.calls[0]
      expect(call[0][0]).toContain('[PHONE REMOVED]')
      expect(call[0][0]).not.toContain('555')
    })

    it('should sanitize street addresses', async () => {
      const request = createRequest({
        symptoms: ['I live at 123 Main Street'],
      })

      await POST(request)

      const call = vi.mocked(grokModule.grokClient.analyzeSymptoms).mock.calls[0]
      expect(call[0][0]).toContain('[ADDRESS REMOVED]')
      expect(call[0][0]).not.toContain('Main Street')
    })

    it('should sanitize SSN', async () => {
      const request = createRequest({
        symptoms: ['my SSN is 123-45-6789'],
      })

      await POST(request)

      const call = vi.mocked(grokModule.grokClient.analyzeSymptoms).mock.calls[0]
      expect(call[0][0]).toContain('[SSN REMOVED]')
      expect(call[0][0]).not.toContain('123-45-6789')
    })

    it('should sanitize dates of birth', async () => {
      const request = createRequest({
        symptoms: ['my DOB is 01/15/1985'],
      })

      await POST(request)

      const call = vi.mocked(grokModule.grokClient.analyzeSymptoms).mock.calls[0]
      expect(call[0][0]).toContain('[DATE REMOVED]')
      expect(call[0][0]).not.toContain('01/15/1985')
    })
  })

  describe('Audit Logging', () => {
    it('should log symptom submission', async () => {
      const request = createRequest({
        symptoms: ['headache', 'fatigue'],
      })

      await POST(request)

      expect(auditLogModule.auditLog.submitSymptoms).toHaveBeenCalledWith('user-123', [
        'headache',
        'fatigue',
      ])
    })

    it('should log suspicious activity on error', async () => {
      vi.mocked(grokModule.grokClient.analyzeSymptoms).mockRejectedValue(
        new Error('Unexpected error')
      )

      const request = createRequest({
        symptoms: ['headache'],
      })

      await POST(request)

      expect(auditLogModule.auditLog.suspiciousActivity).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          endpoint: '/api/grok/symptom-analysis',
          error: 'Unexpected error',
        })
      )
    })
  })

  describe('Grok AI Integration', () => {
    it('should call Grok client with symptoms', async () => {
      const request = createRequest({
        symptoms: ['headache', 'fatigue', 'nausea'],
      })

      await POST(request)

      expect(grokModule.grokClient.analyzeSymptoms).toHaveBeenCalledWith(
        ['headache', 'fatigue', 'nausea'],
        expect.objectContaining({
          useCache: true,
          temperature: 0.7,
          maxTokens: 1500,
        })
      )
    })

    it('should pass duration, severity, and additionalInfo to Grok', async () => {
      const request = createRequest({
        symptoms: ['headache'],
        duration: '3 days',
        severity: 'moderate',
        additionalInfo: 'Worse in morning',
      })

      await POST(request)

      expect(grokModule.grokClient.analyzeSymptoms).toHaveBeenCalledWith(
        ['headache'],
        expect.objectContaining({
          duration: '3 days',
          severity: 'moderate',
          additionalInfo: 'Worse in morning',
        })
      )
    })

    it('should return analysis in response', async () => {
      vi.mocked(grokModule.grokClient.analyzeSymptoms).mockResolvedValue('Test analysis')

      const request = createRequest({
        symptoms: ['headache'],
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.analysis).toBe('Test analysis')
      expect(data.timestamp).toBeTruthy()
      expect(data.cached).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle Grok API rate limit error (429)', async () => {
      const grokError = new grokModule.GrokAPIError(
        'Rate limit exceeded',
        429,
        'rate_limit_error'
      )
      vi.mocked(grokModule.grokClient.analyzeSymptoms).mockRejectedValue(grokError)

      const request = createRequest({
        symptoms: ['headache'],
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toBe('AI service rate limit exceeded')
    })

    it('should handle Grok API server error (500)', async () => {
      const grokError = new grokModule.GrokAPIError('Server error', 500, 'server_error')
      vi.mocked(grokModule.grokClient.analyzeSymptoms).mockRejectedValue(grokError)

      const request = createRequest({
        symptoms: ['headache'],
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toBe('AI service temporarily unavailable')
    })

    it('should handle Grok API client error (400)', async () => {
      const grokError = new grokModule.GrokAPIError('Bad request', 400, 'invalid_request')
      vi.mocked(grokModule.grokClient.analyzeSymptoms).mockRejectedValue(grokError)

      const request = createRequest({
        symptoms: ['headache'],
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Analysis failed')
    })

    it('should handle generic error', async () => {
      vi.mocked(grokModule.grokClient.analyzeSymptoms).mockRejectedValue(
        new Error('Unexpected error')
      )

      const request = createRequest({
        symptoms: ['headache'],
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('MFA Compliance', () => {
    it('should log warning when MFA is not enabled', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      vi.mocked(authModule.auth.api.getSession).mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          mfaEnabled: false,
        },
        session: {
          id: 'session-123',
        },
      } as any)

      const request = createRequest({
        symptoms: ['headache'],
      })

      await POST(request)

      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('[HIPAA] PHI access without MFA'),
        expect.any(Object)
      )

      consoleWarn.mockRestore()
    })
  })
})

// Helper function to create mock requests
function createRequest(
  body: {
    symptoms: string[]
    duration?: string
    severity?: string
    additionalInfo?: string
  },
  ip?: string
): NextRequest {
  const request = new NextRequest('http://localhost:3000/api/grok/symptom-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(ip && { 'x-forwarded-for': ip }),
    },
    body: JSON.stringify(body),
  })

  // Mock the ip property
  if (ip) {
    Object.defineProperty(request, 'ip', {
      value: ip,
      writable: false,
    })
  }

  return request
}
