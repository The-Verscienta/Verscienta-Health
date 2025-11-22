/**
 * Admin Algolia Sync Endpoint
 *
 * Allows administrators to manually trigger Algolia index synchronization
 * for all collections or specific collections.
 *
 * Features:
 * - Full sync across all collections
 * - Selective sync for individual collections
 * - Real-time sync status and progress
 * - Comprehensive error reporting
 *
 * Security: Admin-only access (requires admin role)
 *
 * Usage:
 * - POST /api/admin/algolia-sync - Sync all collections
 * - POST /api/admin/algolia-sync?collection=herbs - Sync specific collection
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * POST /api/admin/algolia-sync
 *
 * Manually trigger Algolia sync
 *
 * Query parameters:
 * - collection: Optional collection slug to sync (herbs, formulas, conditions, practitioners)
 *               If not provided, syncs all collections
 *
 * Body (optional):
 * - batchSize: Number of documents per batch (default: 100)
 *
 * Response:
 * - success: Boolean indicating overall success
 * - summary: Sync summary with statistics
 * - duration: Total duration in milliseconds
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        { status: 401 }
      )
    }

    // Check admin role
    const userRole = (session.user as any).role
    if (userRole !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
        },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const collectionParam = searchParams.get('collection')

    // Parse request body (optional)
    let batchSize = 100
    try {
      const body = await request.json().catch(() => ({}))
      if (body.batchSize) {
        batchSize = parseInt(body.batchSize, 10)
        if (isNaN(batchSize) || batchSize < 1 || batchSize > 1000) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid batch size',
              message: 'Batch size must be between 1 and 1000',
            },
            { status: 400 }
          )
        }
      }
    } catch {
      // No body or invalid JSON - use defaults
    }

    // Validate collection parameter if provided
    const validCollections = ['herbs', 'formulas', 'conditions', 'practitioners']
    if (collectionParam && !validCollections.includes(collectionParam)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid collection',
          message: `Collection must be one of: ${validCollections.join(', ')}`,
          validCollections,
        },
        { status: 400 }
      )
    }

    console.log(`[Admin Algolia Sync] 🚀 Manual sync triggered by ${session.user.email}`)
    if (collectionParam) {
      console.log(`[Admin Algolia Sync]    Collection: ${collectionParam}`)
    } else {
      console.log(`[Admin Algolia Sync]    Collections: All (${validCollections.join(', ')})`)
    }
    console.log(`[Admin Algolia Sync]    Batch size: ${batchSize}`)

    // Import sync functions dynamically to avoid circular dependencies
    if (collectionParam) {
      // Sync single collection
      const { syncCollection } = await import('@/lib/cron/sync-algolia')
      const { getPayload } = await import('payload')
      const config = await import('@payload-config')

      const payload = await getPayload({ config: config.default })
      const result = await syncCollection(payload, collectionParam)

      const duration = Date.now() - startTime

      return NextResponse.json({
        success: result.success,
        collection: collectionParam,
        indexed: result.indexed,
        errors: result.errors,
        duration,
        message: result.success
          ? `Successfully indexed ${result.indexed} documents from ${collectionParam}`
          : `Sync failed: ${result.error}`,
      })
    } else {
      // Sync all collections
      const { runAlgoliaSync } = await import('@/lib/cron/sync-algolia')

      const summary = await runAlgoliaSync()

      const duration = Date.now() - startTime

      return NextResponse.json({
        success: summary.failedCollections === 0,
        summary: {
          totalCollections: summary.totalCollections,
          successfulCollections: summary.successfulCollections,
          failedCollections: summary.failedCollections,
          totalIndexed: summary.totalIndexed,
          totalErrors: summary.totalErrors,
          syncDuration: summary.totalDuration,
          results: summary.results,
        },
        duration,
        message:
          summary.failedCollections === 0
            ? `Successfully synced all ${summary.totalCollections} collections (${summary.totalIndexed} documents)`
            : `Sync completed with ${summary.failedCollections} failures (${summary.totalIndexed} documents indexed)`,
      })
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('[Admin Algolia Sync] ❌ Manual sync failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Sync failed',
        message: errorMessage,
        duration,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/algolia-sync
 *
 * Get available collections and sync status information
 *
 * Response:
 * - availableCollections: List of collections that can be synced
 * - cronSchedule: Cron schedule information
 * - lastSync: Information about last sync (if available from monitoring)
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
    const userRole = (session.user as any).role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Return sync configuration and status
    return NextResponse.json({
      success: true,
      availableCollections: ['herbs', 'formulas', 'conditions', 'practitioners'],
      cronSchedule: {
        expression: '0 */6 * * *',
        description: 'Every 6 hours (12:00 AM, 6:00 AM, 12:00 PM, 6:00 PM)',
      },
      batchSize: {
        default: 100,
        min: 1,
        max: 1000,
        configurable: true,
      },
      endpoints: {
        syncAll: 'POST /api/admin/algolia-sync',
        syncCollection: 'POST /api/admin/algolia-sync?collection={collection}',
        getInfo: 'GET /api/admin/algolia-sync',
      },
      documentation: {
        realTimeSync:
          'Real-time sync happens automatically via Payload hooks on create/update/delete',
        cronSync: 'Scheduled cron job runs every 6 hours as backup',
        manualSync: 'Use this endpoint to trigger sync manually',
      },
    })
  } catch (error) {
    console.error('[Admin Algolia Sync] Error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
