/**
 * Certificate Expiration Check API
 *
 * GET /api/health/cert - Check DragonflyDB TLS certificate expiration
 *
 * This endpoint allows manual certificate checking and can be called by:
 * - Health monitoring systems (Datadog, New Relic, etc.)
 * - Cron jobs and scheduled tasks
 * - CI/CD pipelines
 * - Manual verification
 *
 * Response codes:
 * - 200: Certificate is valid and not expiring soon
 * - 200: Certificate is expiring soon (with warning)
 * - 503: Certificate has expired or check failed
 *
 * Security:
 * - No authentication required (read-only health check)
 * - Rate limited to prevent abuse
 * - Safe to expose publicly
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkCertificateExpiration } from '@/lib/cert-monitor'
import { checkRateLimit } from '@/lib/redis-rate-limiter'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/health/cert
 *
 * Check TLS certificate expiration status
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const clientIP =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const rateLimit = await checkRateLimit(clientIP, '/api/health/cert', {
      requests: 10,
      window: 60000, // 1 minute
    })

    // Add rate limit headers
    const headers = {
      'X-RateLimit-Limit': rateLimit.limit.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
      'Cache-Control': 'no-store, max-age=0',
    }

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many certificate check requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers,
        }
      )
    }

    // Perform certificate check
    const result = await checkCertificateExpiration({
      warningDays: 30,
      criticalDays: 7,
      timeout: 10000,
    })

    // Handle check errors
    if (result.error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Certificate check failed',
          error: result.error,
          timestamp: new Date().toISOString(),
        },
        {
          status: 503,
          headers,
        }
      )
    }

    // Certificate has expired
    if (!result.isValid) {
      return NextResponse.json(
        {
          status: 'expired',
          message: 'TLS certificate has EXPIRED',
          certificate: {
            expiryDate: result.expiryDate?.toISOString(),
            daysUntilExpiry: result.daysUntilExpiry,
            subject: result.subject,
            issuer: result.issuer,
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 503,
          headers,
        }
      )
    }

    // Certificate is expiring critically soon (<7 days)
    if (result.isCritical) {
      return NextResponse.json(
        {
          status: 'critical',
          message: `TLS certificate expires in ${result.daysUntilExpiry} days - URGENT action required`,
          certificate: {
            expiryDate: result.expiryDate?.toISOString(),
            daysUntilExpiry: result.daysUntilExpiry,
            subject: result.subject,
            issuer: result.issuer,
            issueDate: result.issueDate?.toISOString(),
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 200, // Still 200 because service is operational
          headers,
        }
      )
    }

    // Certificate is expiring soon (<30 days)
    if (result.isExpiring) {
      return NextResponse.json(
        {
          status: 'warning',
          message: `TLS certificate expires in ${result.daysUntilExpiry} days - renewal recommended`,
          certificate: {
            expiryDate: result.expiryDate?.toISOString(),
            daysUntilExpiry: result.daysUntilExpiry,
            subject: result.subject,
            issuer: result.issuer,
            issueDate: result.issueDate?.toISOString(),
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers,
        }
      )
    }

    // Certificate is valid and not expiring soon
    return NextResponse.json(
      {
        status: 'ok',
        message: `TLS certificate is valid for ${result.daysUntilExpiry} days`,
        certificate: {
          expiryDate: result.expiryDate?.toISOString(),
          daysUntilExpiry: result.daysUntilExpiry,
          subject: result.subject,
          issuer: result.issuer,
          issueDate: result.issueDate?.toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers,
      }
    )
  } catch (error) {
    console.error('[API /health/cert] Unexpected error:', error)

    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error during certificate check',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  }
}
