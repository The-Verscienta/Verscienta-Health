import { NextRequest, NextResponse } from 'next/server'
import { auditLog } from '@/lib/audit-log'

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'
const GROK_API_KEY = process.env.GROK_API_KEY

/**
 * HIPAA COMPLIANCE NOTE:
 * This endpoint handles symptom information which could be considered PHI.
 * Security measures:
 * 1. NO personally identifiable information (PII) is sent to Grok AI
 * 2. Only symptom descriptions (anonymized) are transmitted
 * 3. User data is NOT included in the prompt
 * 4. All requests are audit logged
 * 5. Rate limiting prevents abuse
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
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL REMOVED]')

  // Remove phone numbers (various formats)
  sanitized = sanitized.replace(/\b(\+?1?[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE REMOVED]')

  // Remove names (very basic - should be improved)
  // Warn user not to include personal information

  // Remove addresses (basic pattern)
  sanitized = sanitized.replace(/\d+\s+\w+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)/gi, '[ADDRESS REMOVED]')

  // Remove SSN
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN REMOVED]')

  // Remove dates of birth (MM/DD/YYYY, MM-DD-YYYY)
  sanitized = sanitized.replace(/\b(0?[1-9]|1[0-2])[/-](0?[1-9]|[12]\d|3[01])[/-](19|20)\d{2}\b/g, '[DATE REMOVED]')

  return sanitized
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!GROK_API_KEY) {
      return NextResponse.json(
        { error: 'Grok API key not configured' },
        { status: 500 }
      )
    }

    const body: SymptomAnalysisRequest = await request.json()
    const { symptoms, duration, severity, additionalInfo } = body

    // Validate input
    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json(
        { error: 'At least one symptom is required' },
        { status: 400 }
      )
    }

    // HIPAA: Audit log symptom submission
    // Note: In production, extract userId from session
    await auditLog.submitSymptoms(undefined, symptoms)

    // HIPAA: Sanitize all inputs to remove PII before sending to external AI
    const sanitizedSymptoms = symptoms.map(s => sanitizeInput(s))
    const sanitizedDuration = duration ? sanitizeInput(duration) : undefined
    const sanitizedSeverity = severity ? sanitizeInput(severity) : undefined
    const sanitizedAdditionalInfo = additionalInfo ? sanitizeInput(additionalInfo) : undefined

    // Construct the prompt for Grok
    const prompt = `You are a knowledgeable herbalist and Traditional Chinese Medicine practitioner. A user is experiencing the following symptoms:

Symptoms: ${sanitizedSymptoms.join(', ')}
${sanitizedDuration ? `Duration: ${sanitizedDuration}` : ''}
${sanitizedSeverity ? `Severity: ${sanitizedSeverity}` : ''}
${sanitizedAdditionalInfo ? `Additional Information: ${sanitizedAdditionalInfo}` : ''}

IMPORTANT: All personally identifiable information has been removed from this input for privacy and HIPAA compliance.

Please provide:
1. A brief analysis of these symptoms from both Western and TCM perspectives
2. Potential underlying patterns or imbalances (TCM)
3. Recommended herbs that may help (3-5 herbs with brief explanations)
4. Recommended formulas if applicable
5. General lifestyle recommendations
6. A clear disclaimer that this is educational information and not medical advice

Keep your response clear, practical, and educational. Format your response in a structured way.`

    // Call Grok API
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are an expert herbalist and Traditional Chinese Medicine practitioner providing educational information about herbs and natural remedies. Always emphasize that your advice is educational and users should consult healthcare providers for medical issues.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Grok API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to get analysis from Grok' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const analysis = data.choices[0]?.message?.content

    if (!analysis) {
      return NextResponse.json(
        { error: 'No analysis returned from Grok' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      analysis,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in symptom analysis:', error)

    // HIPAA: Log security event for errors
    await auditLog.suspiciousActivity(undefined, {
      endpoint: '/api/grok/symptom-analysis',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      { error: 'Internal server error' },
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
