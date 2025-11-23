/**
 * Botanical APIs Statistics Monitoring Endpoint
 *
 * Comprehensive monitoring endpoint for both Trefle and Perenual API clients.
 * Provides real-time statistics, circuit breaker status, and health metrics.
 *
 * GET /api/admin/botanical-stats
 *   - Returns combined statistics for both APIs
 *   - Includes circuit breaker states
 *   - Shows retry statistics
 *   - Provides health recommendations
 *
 * POST /api/admin/botanical-stats
 *   - Reset statistics for specified API
 *   - Body: { api: 'trefle' | 'perenual' | 'both' }
 *
 * Security:
 * - Requires authentication
 * - Admin-only access
 *
 * @see lib/trefle/client-enhanced.ts
 * @see lib/perenual/client-enhanced.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { trefleClientEnhanced } from '@/lib/trefle'
import { perenualClientEnhanced } from '@/lib/perenual'
import { getTrefleSyncProgress } from '@/lib/cron/sync-trefle-data'
import { getPerenualImportProgress } from '@/lib/cron/import-perenual-data'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * Calculate health score based on statistics
 */
function calculateHealthScore(stats: any): {
  score: number
  status: 'healthy' | 'degraded' | 'unhealthy'
  issues: string[]
} {
  const issues: string[] = []
  let score = 100

  if (stats.totalRequests === 0) {
    return { score: 0, status: 'healthy', issues: ['No requests made yet'] }
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
    issues.push(`Network issues detected: ${networkRate.toFixed(1)}%`)
  }

  // Rate limiting
  if (stats.rateLimitErrors > 0) {
    score -= 10
    issues.push(`Rate limit errors: ${stats.rateLimitErrors}`)
  }

  // Circuit breaker trips
  if (stats.circuitBreakerTrips > 0) {
    score -= 20
    issues.push(`Circuit breaker activated ${stats.circuitBreakerTrips} times`)
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
 * GET /api/admin/botanical-stats
 * Get comprehensive statistics for both APIs
 */
export async function GET(_req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await getPayload({ config })

    // Get Trefle statistics
    const trefleStats = trefleClientEnhanced.getStats()
    const trefleCircuit = trefleClientEnhanced.getCircuitState()
    const trefleConfigured = trefleClientEnhanced.isConfigured()
    const trefleSyncProgress = await getTrefleSyncProgress(payload)

    // Get Perenual statistics
    const perenualStats = perenualClientEnhanced.getStats()
    const perenualCircuit = perenualClientEnhanced.getCircuitState()
    const perenualConfigured = perenualClientEnhanced.isConfigured()
    const perenualImportProgress = await getPerenualImportProgress(payload)

    // Calculate health scores
    const trefleHealth = calculateHealthScore(trefleStats)
    const perenualHealth = calculateHealthScore(perenualStats)

    // Combined statistics
    const combinedStats = {
      totalRequests: trefleStats.totalRequests + perenualStats.totalRequests,
      successfulRequests: trefleStats.successfulRequests + perenualStats.successfulRequests,
      failedRequests: trefleStats.failedRequests + perenualStats.failedRequests,
      retriedRequests: trefleStats.retriedRequests + perenualStats.retriedRequests,
      totalRetries: trefleStats.totalRetries + perenualStats.totalRetries,
      timeoutErrors: trefleStats.timeoutErrors + perenualStats.timeoutErrors,
      networkErrors: trefleStats.networkErrors + perenualStats.networkErrors,
      rateLimitErrors: trefleStats.rateLimitErrors + perenualStats.rateLimitErrors,
      circuitBreakerTrips: trefleStats.circuitBreakerTrips + perenualStats.circuitBreakerTrips,
    }

    // Overall health
    const overallHealth = calculateHealthScore(combinedStats)

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        overall: {
          health: overallHealth,
          stats: combinedStats,
          configured: {
            trefle: trefleConfigured,
            perenual: perenualConfigured,
          },
          circuitBreakerStates: {
            trefle: trefleCircuit,
            perenual: perenualCircuit,
          },
        },
        trefle: {
          configured: trefleConfigured,
          circuitState: trefleCircuit,
          health: trefleHealth,
          stats: trefleStats,
          sync: {
            totalHerbs: trefleSyncProgress.totalHerbs,
            herbsSynced: trefleSyncProgress.herbsSynced,
            herbsNeedingSync: trefleSyncProgress.herbsNeedingSync,
            lastSyncAt: trefleSyncProgress.lastSyncAt,
            syncCoverage: trefleSyncProgress.totalHerbs > 0
              ? ((trefleSyncProgress.herbsSynced / trefleSyncProgress.totalHerbs) * 100).toFixed(1) + '%'
              : '0%',
          },
          rateLimits: {
            perMinute: 120,
            perDay: 5000,
            currentUsage: trefleStats.totalRequests,
          },
        },
        perenual: {
          configured: perenualConfigured,
          circuitState: perenualCircuit,
          health: perenualHealth,
          stats: perenualStats,
          import: {
            currentPage: perenualImportProgress.currentPage,
            herbsCreated: perenualImportProgress.herbsCreated,
            herbsUpdated: perenualImportProgress.herbsUpdated,
            estimatedRemaining: perenualImportProgress.estimatedPlantsRemaining,
            isComplete: perenualImportProgress.isComplete,
            lastRunAt: perenualImportProgress.lastRunAt,
          },
          rateLimits: {
            perMinute: 60,
            perDay: Infinity,
            currentUsage: perenualStats.totalRequests,
          },
        },
        recommendations: generateRecommendations(
          trefleHealth,
          perenualHealth,
          trefleCircuit,
          perenualCircuit
        ),
      },
    })
  } catch (error: any) {
    console.error('[Botanical Stats API] Error getting statistics:', error)
    return NextResponse.json(
      {
        error: 'Failed to get botanical statistics',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * Generate health recommendations
 */
function generateRecommendations(
  trefleHealth: any,
  perenualHealth: any,
  trefleCircuit: string,
  perenualCircuit: string
): string[] {
  const recommendations: string[] = []

  // Circuit breaker recommendations
  if (trefleCircuit === 'OPEN') {
    recommendations.push('⚠️ Trefle circuit breaker is OPEN - API calls are being blocked. Wait 60 seconds for recovery.')
  }
  if (perenualCircuit === 'OPEN') {
    recommendations.push('⚠️ Perenual circuit breaker is OPEN - API calls are being blocked. Wait 60 seconds for recovery.')
  }

  if (trefleCircuit === 'HALF_OPEN') {
    recommendations.push('ℹ️ Trefle circuit breaker is testing recovery - limit API usage.')
  }
  if (perenualCircuit === 'HALF_OPEN') {
    recommendations.push('ℹ️ Perenual circuit breaker is testing recovery - limit API usage.')
  }

  // Health score recommendations
  if (trefleHealth.status === 'unhealthy') {
    recommendations.push('🚨 Trefle API is unhealthy - investigate errors and consider pausing sync jobs.')
  } else if (trefleHealth.status === 'degraded') {
    recommendations.push('⚠️ Trefle API performance is degraded - monitor closely.')
  }

  if (perenualHealth.status === 'unhealthy') {
    recommendations.push('🚨 Perenual API is unhealthy - investigate errors and consider pausing import.')
  } else if (perenualHealth.status === 'degraded') {
    recommendations.push('⚠️ Perenual API performance is degraded - monitor closely.')
  }

  // Specific issue recommendations
  if (trefleHealth.issues.some((i: string) => i.includes('Rate limit'))) {
    recommendations.push('💡 Trefle rate limiting detected - consider reducing sync frequency.')
  }
  if (perenualHealth.issues.some((i: string) => i.includes('Rate limit'))) {
    recommendations.push('💡 Perenual rate limiting detected - consider reducing import frequency.')
  }

  if (trefleHealth.issues.some((i: string) => i.includes('timeout'))) {
    recommendations.push('💡 Trefle timeout issues - consider increasing timeout value in client configuration.')
  }
  if (perenualHealth.issues.some((i: string) => i.includes('timeout'))) {
    recommendations.push('💡 Perenual timeout issues - consider increasing timeout value in client configuration.')
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('✅ All botanical APIs are healthy - no action needed.')
  }

  return recommendations
}

/**
 * POST /api/admin/botanical-stats
 * Reset statistics for specified API
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { api } = body

    if (!api || !['trefle', 'perenual', 'both'].includes(api)) {
      return NextResponse.json(
        { error: 'Invalid API parameter. Must be "trefle", "perenual", or "both"' },
        { status: 400 }
      )
    }

    console.log('[Botanical Stats API] Statistics reset requested by:', session.user.email, 'for:', api)

    if (api === 'trefle' || api === 'both') {
      trefleClientEnhanced.reset()
    }

    if (api === 'perenual' || api === 'both') {
      perenualClientEnhanced.reset()
    }

    return NextResponse.json({
      status: 'success',
      message: `Statistics reset successfully for ${api}`,
      data: {
        reset: api,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('[Botanical Stats API] Error resetting statistics:', error)
    return NextResponse.json(
      {
        error: 'Failed to reset statistics',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/admin/botanical-stats
 * CORS preflight
 */
export async function OPTIONS(_req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
