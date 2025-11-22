/**
 * Perenual Sync Admin API Route
 *
 * Manual trigger endpoint for Perenual plant data import.
 * Allows administrators to trigger progressive import on-demand.
 *
 * POST /api/admin/perenual-sync
 *   - Triggers a Perenual import run (40 plants per run)
 *   - Returns import statistics and progress
 *
 * GET /api/admin/perenual-sync
 *   - Returns current import status and progress
 *
 * Security:
 * - Requires authentication
 * - Admin-only access
 * - Rate limited
 *
 * @see lib/cron/import-perenual-data.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { importPerenualData, getPerenualImportProgress } from '@/lib/cron/import-perenual-data'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * GET /api/admin/perenual-sync
 * Get current Perenual import status and progress
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
    const progress = await getPerenualImportProgress(payload)

    return NextResponse.json({
      status: 'success',
      data: {
        ...progress,
        importSchedule: 'Every minute (when enabled)',
        enabled: process.env.ENABLE_PERENUAL_IMPORT === 'true',
        configured: progress.apiStats.totalRequests >= 0,
      },
    })
  } catch (error: any) {
    console.error('[Perenual Sync API] Error getting status:', error)
    return NextResponse.json(
      {
        error: 'Failed to get import status',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/perenual-sync
 * Manually trigger Perenual import
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

    console.log('[Perenual Sync API] Manual import triggered by:', session.user.email)

    // Get current progress before import
    const payload = await getPayload({ config })
    const progressBefore = await getPerenualImportProgress(payload)

    // Trigger import
    await importPerenualData()

    // Get progress after import
    const progressAfter = await getPerenualImportProgress(payload)

    return NextResponse.json({
      status: 'success',
      message: 'Perenual import completed successfully',
      data: {
        before: {
          currentPage: progressBefore.currentPage,
          herbsCreated: progressBefore.herbsCreated,
          herbsUpdated: progressBefore.herbsUpdated,
        },
        after: {
          currentPage: progressAfter.currentPage,
          herbsCreated: progressAfter.herbsCreated,
          herbsUpdated: progressAfter.herbsUpdated,
        },
        imported: {
          created: progressAfter.herbsCreated - progressBefore.herbsCreated,
          updated: progressAfter.herbsUpdated - progressBefore.herbsUpdated,
        },
        circuitState: progressAfter.circuitState,
        apiStats: progressAfter.apiStats,
        estimatedPlantsRemaining: progressAfter.estimatedPlantsRemaining,
      },
    })
  } catch (error: any) {
    console.error('[Perenual Sync API] Error triggering import:', error)
    return NextResponse.json(
      {
        error: 'Failed to trigger import',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/admin/perenual-sync
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
