/**
 * Perenual API Health Check Endpoint
 *
 * Public health check endpoint for monitoring Perenual API status.
 * No authentication required - suitable for external monitoring services.
 *
 * GET /api/health/perenual
 *   - Returns current health status
 *   - Circuit breaker state
 *   - Basic statistics
 *   - Health score (0-100)
 *
 * Response Format:
 * {
 *   status: 'healthy' | 'degraded' | 'unhealthy' | 'unconfigured',
 *   score: number (0-100),
 *   circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN',
 *   stats: { successRate, totalRequests, ... },
 *   timestamp: ISO string
 * }
 *
 * Use Cases:
 * - External monitoring services (Pingdom, UptimeRobot, etc.)
 * - Status pages
 * - Health dashboards
 * - Load balancer health checks
 *
 * @see app/api/admin/botanical-stats for detailed admin-only stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { perenualClientEnhanced } from '@/lib/perenual'

/**
 * Calculate health score from statistics
 */
function calculateHealthScore(stats: any): {
  score: number
  status: 'healthy' | 'degraded' | 'unhealthy'
  issues: string[]
} {
  const issues: string[] = []
  let score = 100

  if (stats.totalRequests === 0) {
    return { score: 100, status: 'healthy', issues: ['No requests made yet'] }
  }

  // Success rate
  const successRate = (stats.successfulRequests / stats.totalRequests) * 100
  if (successRate < 90) {
    score -= 20
    issues.push(`Low success rate: ${successRate.toFixed(1)}%`)
  }
  if (successRate < 70) {
    score -= 20
    issues.push('Critical: Success rate below 70%')
  }

  // Retry rate
  const retryRate = (stats.retriedRequests / stats.totalRequests) * 100
  if (retryRate > 30) {
    score -= 15
    issues.push(`High retry rate: ${retryRate.toFixed(1)}%`)
  }

  // Timeout rate
  const timeoutRate = (stats.timeoutErrors / stats.totalRequests) * 100
  if (timeoutRate > 10) {
    score -= 15
    issues.push(`High timeout rate: ${timeoutRate.toFixed(1)}%`)
  }

  // Network errors
  const networkRate = (stats.networkErrors / stats.totalRequests) * 100
  if (networkRate > 5) {
    score -= 15
    issues.push(`Network issues: ${networkRate.toFixed(1)}%`)
  }

  // Rate limiting
  if (stats.rateLimitErrors > 0) {
    score -= 10
    issues.push(`Rate limit errors: ${stats.rateLimitErrors}`)
  }

  // Circuit breaker trips
  if (stats.circuitBreakerTrips > 0) {
    score -= 20
    issues.push(`Circuit breaker trips: ${stats.circuitBreakerTrips}`)
  }

  // Determine status
  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (score >= 80) {
    status = 'healthy'
  } else if (score >= 50) {
    status = 'degraded'
  } else {
    status = 'unhealthy'
  }

  return { score: Math.max(0, score), status, issues }
}

/**
 * GET /api/health/perenual
 * Public health check endpoint
 */
export async function GET(_req: NextRequest) {
  try {
    // Check if Perenual is configured
    if (!perenualClientEnhanced.isConfigured()) {
      return NextResponse.json(
        {
          status: 'unconfigured',
          message: 'Perenual API is not configured',
          score: 0,
          circuitState: 'OPEN',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    // Get statistics and circuit state
    const stats = perenualClientEnhanced.getStats()
    const circuitState = perenualClientEnhanced.getCircuitState()
    const health = calculateHealthScore(stats)

    // Calculate success rate
    const successRate =
      stats.totalRequests > 0
        ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)
        : '0.0'

    // Determine HTTP status code
    let httpStatus = 200
    if (circuitState === 'OPEN') {
      httpStatus = 503 // Service Unavailable
    } else if (health.status === 'unhealthy') {
      httpStatus = 503
    } else if (health.status === 'degraded') {
      httpStatus = 200 // Still operational, just degraded
    }

    return NextResponse.json(
      {
        status: health.status,
        score: health.score,
        circuitState,
        stats: {
          totalRequests: stats.totalRequests,
          successfulRequests: stats.successfulRequests,
          failedRequests: stats.failedRequests,
          successRate: `${successRate}%`,
          avgResponseTimeMs: stats.avgResponseTimeMs,
          retriedRequests: stats.retriedRequests,
          timeoutErrors: stats.timeoutErrors,
          networkErrors: stats.networkErrors,
          rateLimitErrors: stats.rateLimitErrors,
          circuitBreakerTrips: stats.circuitBreakerTrips,
        },
        issues: health.issues,
        timestamp: new Date().toISOString(),
      },
      { status: httpStatus }
    )
  } catch (error: any) {
    console.error('[Perenual Health API] Error checking health:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to check Perenual API health',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/health/perenual
 * CORS preflight
 */
export async function OPTIONS(_req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
