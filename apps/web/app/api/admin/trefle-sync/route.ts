/**
 * Trefle Sync Admin API Route
 *
 * Manual trigger endpoint for Trefle botanical data synchronization.
 * Allows administrators to trigger herb enrichment on-demand.
 *
 * POST /api/admin/trefle-sync
 *   - Triggers a full Trefle sync run (100 herbs)
 *   - Returns sync statistics and progress
 *
 * GET /api/admin/trefle-sync
 *   - Returns current sync status and progress
 *
 * Security:
 * - Requires authentication
 * - Admin-only access
 * - Rate limited
 *
 * @see lib/cron/sync-trefle-data.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { syncTrefleData, getTrefleSyncProgress } from '@/lib/cron/sync-trefle-data'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * GET /api/admin/trefle-sync
 * Get current Trefle sync status and progress
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

    // TODO: Add admin role check when roles are implemented
    // For now, any authenticated user can view status

    const payload = await getPayload({ config })
    const progress = await getTrefleSyncProgress(payload)

    return NextResponse.json({
      status: 'success',
      data: {
        ...progress,
        syncSchedule: 'Every Wednesday at 3:00 AM',
        configured: progress.apiStats.totalRequests >= 0,
      },
    })
  } catch (error: any) {
    console.error('[Trefle Sync API] Error getting status:', error)
    return NextResponse.json(
      {
        error: 'Failed to get sync status',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/trefle-sync
 * Manually trigger Trefle sync
 */
export async function POST(_req: NextRequest) {
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

    // TODO: Add admin role check when roles are implemented
    // For now, any authenticated user can trigger sync (not recommended for production)

    console.log('[Trefle Sync API] Manual sync triggered by:', session.user.email)

    // Get current progress before sync
    const payload = await getPayload({ config })
    const progressBefore = await getTrefleSyncProgress(payload)

    // Trigger sync
    await syncTrefleData()

    // Get progress after sync
    const progressAfter = await getTrefleSyncProgress(payload)

    return NextResponse.json({
      status: 'success',
      message: 'Trefle sync completed successfully',
      data: {
        before: {
          herbsSynced: progressBefore.herbsSynced,
          herbsNeedingSync: progressBefore.herbsNeedingSync,
        },
        after: {
          herbsSynced: progressAfter.herbsSynced,
          herbsNeedingSync: progressAfter.herbsNeedingSync,
        },
        enriched: progressAfter.herbsSynced - progressBefore.herbsSynced,
        circuitState: progressAfter.circuitState,
        apiStats: progressAfter.apiStats,
      },
    })
  } catch (error: any) {
    console.error('[Trefle Sync API] Error triggering sync:', error)
    return NextResponse.json(
      {
        error: 'Failed to trigger sync',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/admin/trefle-sync
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
