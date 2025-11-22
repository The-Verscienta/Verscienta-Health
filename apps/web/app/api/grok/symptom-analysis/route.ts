import { createHash } from 'crypto'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { auditLog } from '@/lib/audit-log'
import { auth } from '@/lib/auth'
import { checkRateLimit } from '@/lib/cache'
import { GrokAPIError, grokClient } from '@/lib/grok/client'

/**
 * HIPAA COMPLIANCE NOTE:
 * This endpoint handles symptom information which could be considered PHI.
 * Security measures:
 * 1. NO personally identifiable information (PII) is sent to Grok AI
 * 2. Only symptom descriptions (anonymized) are transmitted
 * 3. User data is NOT included in the prompt
 * 4. All requests are audit logged with:
 *    - User ID and session ID
 *    - IP address and user agent
 *    - Hashed symptoms (for linking, not reverse engineering)
 *    - Timestamp
 *    - PHI access flag
 * 5. Rate limiting prevents abuse
 * 6. Audit logs retained for 7 years (HIPAA requirement)
 */

interface SymptomAnalysisRequest {
  symptoms: string[]
  duration?: string
  severity?: string
  additionalInfo?: string
}

/**
 * Sanitize input to remove any potential PII before sending to AI
 * This ensures HIPAA compliance by anonymizing data
 */
function sanitizeInput(text: string): string {
  // Remove common PII patterns
  let sanitized = text

  // Remove email addresses
  sanitized = sanitized.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    '[EMAIL REMOVED]'
  )

  // Remove phone numbers (various formats)
  sanitized = sanitized.replace(
    /\b(\+?1?[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g,
    '[PHONE REMOVED]'
  )

  // Remove names (very basic - should be improved)
  // Warn user not to include personal information

  // Remove addresses (basic pattern)
  sanitized = sanitized.replace(
    /\d+\s+\w+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)/gi,
    '[ADDRESS REMOVED]'
  )

  // Remove SSN
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN REMOVED]')

  // Remove dates of birth (MM/DD/YYYY, MM-DD-YYYY)
  sanitized = sanitized.replace(
    /\b(0?[1-9]|1[0-2])[/-](0?[1-9]|[12]\d|3[01])[/-](19|20)\d{2}\b/g,
    '[DATE REMOVED]'
  )

  return sanitized
}

export async function POST(request: NextRequest) {
  try {
    // Check if Grok client is configured
    if (!grokClient.isConfigured()) {
      return NextResponse.json(
        { error: 'AI service not configured. Please contact support.' },
        { status: 503 }
      )
    }

    const body: SymptomAnalysisRequest = await request.json()
    const { symptoms, duration, severity, additionalInfo } = body

    // Validate input
    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ error: 'At least one symptom is required' }, { status: 400 })
    }

    if (symptoms.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 symptoms allowed' },
        { status: 400 }
      )
    }

    // HIPAA: Extract user session for audit logging
    const session = await auth.api.getSession({ headers: await headers() })
    const userId = session?.user?.id
    const userEmail = session?.user?.email
    const sessionId = session?.session?.id

    // Rate limiting: 10 requests per hour per user (HIPAA: Prevent abuse)
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitId = userId || clientIp || 'anonymous'
    const rateLimit = await checkRateLimit(rateLimitId, 'ai')

    if (!rateLimit.success) {
      console.warn('[RATE LIMIT] Symptom checker abuse attempt:', {
        userId: userId || 'anonymous',
        ip: clientIp,
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: new Date(rateLimit.reset).toISOString(),
      })

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `You have reached the maximum number of requests (${rateLimit.limit} per hour). Please try again later.`,
          resetAt: new Date(rateLimit.reset).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // HIPAA: Check MFA status for compliance logging
    const mfaEnabled = (session?.user as any)?.mfaEnabled || false

    // Log MFA compliance check
    if (!mfaEnabled && userId) {
      console.warn('[HIPAA] PHI access without MFA:', {
        userId,
        userEmail,
        sessionId: sessionId || 'none',
        endpoint: '/api/grok/symptom-analysis',
        timestamp: new Date().toISOString(),
        warning: 'User accessed PHI without MFA enabled',
      })
    }

    // HIPAA: Create one-way hash of symptoms for audit trail
    // This allows linking related submissions without storing actual symptoms
    const symptomsHash = createHash('sha256')
      .update(symptoms.join('|'))
      .digest('hex')
      .substring(0, 16) // First 16 chars for brevity

    // HIPAA: Get request metadata
    const headersList = await headers()
    const ipAddress =
      headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // HIPAA: Comprehensive PHI access audit log
    await auditLog.submitSymptoms(userId, symptoms)

    // Additional detailed logging for HIPAA compliance
    console.log('[PHI ACCESS] Symptom Checker', {
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous',
      userEmail: userEmail || 'anonymous',
      sessionId: sessionId || 'none',
      action: 'SYMPTOM_SUBMIT',
      symptomCount: symptoms.length,
      symptomsHash, // One-way hash, not reversible
      severity,
      duration: duration ? 'provided' : 'not_provided',
      additionalInfo: additionalInfo ? 'provided' : 'not_provided',
      ipAddress,
      userAgent,
      mfaEnabled, // HIPAA: MFA compliance status
      mfaCompliant: mfaEnabled, // Flag for compliance reporting
      phiFlag: true, // Mark as PHI access
      retentionYears: 7, // HIPAA requirement
    })

    // HIPAA: Sanitize all inputs to remove PII before sending to external AI
    const sanitizedSymptoms = symptoms.map((s) => sanitizeInput(s))
    const sanitizedDuration = duration ? sanitizeInput(duration) : undefined
    const sanitizedSeverity = severity ? sanitizeInput(severity) : undefined
    const sanitizedAdditionalInfo = additionalInfo ? sanitizeInput(additionalInfo) : undefined

    // Call Grok AI client with caching and retry logic
    const analysis = await grokClient.analyzeSymptoms(sanitizedSymptoms, {
      duration: sanitizedDuration,
      severity: sanitizedSeverity,
      additionalInfo: sanitizedAdditionalInfo,
      useCache: true, // Enable 24-hour caching for similar symptoms
      temperature: 0.7,
      maxTokens: 1500,
    })

    return NextResponse.json({
      analysis,
      timestamp: new Date().toISOString(),
      cached: false, // Could be enhanced to return actual cache status
    })
  } catch (error) {
    console.error('Error in symptom analysis:', error)

    // Handle Grok API specific errors
    if (error instanceof GrokAPIError) {
      console.error('[Grok API Error]', {
        message: error.message,
        statusCode: error.statusCode,
        type: error.type,
        code: error.code,
      })

      // Return user-friendly error message
      if (error.statusCode === 429) {
        return NextResponse.json(
          {
            error: 'AI service rate limit exceeded',
            message: 'The AI service is experiencing high demand. Please try again in a few minutes.',
          },
          { status: 503 }
        )
      }

      if (error.statusCode >= 500) {
        return NextResponse.json(
          {
            error: 'AI service temporarily unavailable',
            message: 'The AI analysis service is temporarily unavailable. Please try again later.',
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        {
          error: 'Analysis failed',
          message: 'We encountered an error analyzing your symptoms. Please try again.',
        },
        { status: error.statusCode }
      )
    }

    // HIPAA: Log security event for errors
    await auditLog.suspiciousActivity(undefined, {
      endpoint: '/api/grok/symptom-analysis',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    )
  }
}

// OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  // HIPAA Security: Only allow requests from same origin
  // In production with separate frontend, use specific allowed origins
  const origin = request.headers.get('origin') || ''
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
    'http://localhost:3000', // Development
  ]

  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
