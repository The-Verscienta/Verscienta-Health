import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getAllSecurityEvents,
  getUserSecurityEvents,
  SecuritySeverity,
} from '@/lib/security-monitor'

export const dynamic = 'force-dynamic'

/**
 * Admin Security Events API
 *
 * Endpoints for viewing and analyzing security events.
 * Requires admin role.
 */

/**
 * GET /api/admin/security-events
 * Get security events with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const severity = searchParams.get('severity') as SecuritySeverity | null
    const sinceDays = searchParams.get('sinceDays')
    const limit = searchParams.get('limit')

    const options = {
      since: sinceDays ? new Date(Date.now() - Number.parseInt(sinceDays) * 24 * 60 * 60 * 1000) : undefined,
      severity: severity || undefined,
      limit: limit ? Number.parseInt(limit) : 100,
    }

    let events
    if (userId) {
      events = await getUserSecurityEvents(userId, options)
    } else {
      events = await getAllSecurityEvents(options)
    }

    // Group by severity for summary
    const summary = {
      total: events.length,
      critical: events.filter((e) => e.severity === SecuritySeverity.CRITICAL).length,
      high: events.filter((e) => e.severity === SecuritySeverity.HIGH).length,
      medium: events.filter((e) => e.severity === SecuritySeverity.MEDIUM).length,
      low: events.filter((e) => e.severity === SecuritySeverity.LOW).length,
    }

    // Group by type
    const byType = events.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      success: true,
      events,
      summary,
      byType,
      filters: {
        userId,
        severity,
        sinceDays,
        limit: options.limit,
      },
    })
  } catch (error) {
    console.error('Failed to get security events:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve security events' },
      { status: 500 }
    )
  }
}
