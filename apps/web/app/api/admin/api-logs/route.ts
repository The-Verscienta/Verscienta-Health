/**
 * Admin API Logs Endpoint
 *
 * Provides comprehensive API request analytics and logs for administrators
 *
 * Features:
 * - Real-time statistics (requests, errors, performance)
 * - Recent errors list
 * - Top endpoints and users
 * - Suspicious activity detection
 * - User activity timelines
 *
 * Security: Admin-only access (requires admin role)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getApiStatistics,
  getRecentErrors,
  getUserActivity,
  detectSuspiciousActivity,
} from '@/lib/api-request-logger'

/**
 * GET /api/admin/api-logs
 *
 * Get API request statistics and analytics
 *
 * Query parameters:
 * - action: 'statistics' | 'errors' | 'user-activity' | 'suspicious-activity'
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * - userId: User ID (optional, for user-activity)
 * - ipAddress: IP address (optional, for suspicious-activity)
 * - limit: Number of records to return (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const userRole = session.user.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'statistics'
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')
    const userId = searchParams.get('userId') || undefined
    const ipAddress = searchParams.get('ipAddress') || undefined
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Parse dates
    const startDate = startDateStr ? new Date(startDateStr) : undefined
    const endDate = endDateStr ? new Date(endDateStr) : undefined

    // Handle different actions
    switch (action) {
      case 'statistics': {
        const stats = await getApiStatistics({
          startDate,
          endDate,
          userId,
        })

        return NextResponse.json({
          success: true,
          data: stats,
          period: {
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
          },
        })
      }

      case 'errors': {
        const errors = await getRecentErrors(limit)

        return NextResponse.json({
          success: true,
          data: errors,
          count: errors.length,
        })
      }

      case 'user-activity': {
        if (!userId) {
          return NextResponse.json(
            { error: 'userId parameter required for user-activity action' },
            { status: 400 }
          )
        }

        const activity = await getUserActivity(userId, limit)

        return NextResponse.json({
          success: true,
          data: activity,
          userId,
          count: activity.length,
        })
      }

      case 'suspicious-activity': {
        const suspicious = await detectSuspiciousActivity({
          userId,
          ipAddress,
          timeWindowMinutes: 60,
        })

        return NextResponse.json({
          success: true,
          data: suspicious,
        })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[Admin API Logs] Error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/api-logs/cleanup
 *
 * Manually trigger cleanup of old API logs
 *
 * Body:
 * - retentionDays: Number of days to retain (optional, default: 90)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const userRole = session.user.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const retentionDays = body.retentionDays || 90

    // Import cleanup function dynamically to avoid circular dependencies
    const { cleanupOldLogs } = await import('@/lib/api-request-logger')

    // Run cleanup
    const deletedCount = await cleanupOldLogs(retentionDays)

    return NextResponse.json({
      success: true,
      deletedCount,
      retentionDays,
      message: `Deleted ${deletedCount} logs older than ${retentionDays} days`,
    })
  } catch (error) {
    console.error('[Admin API Logs Cleanup] Error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
