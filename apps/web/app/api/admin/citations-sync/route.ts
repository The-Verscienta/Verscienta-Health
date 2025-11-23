/**
 * Admin API Route: Citation Sync
 *
 * Manually trigger citation updates for herbs and formulas from PubMed.
 *
 * Endpoints:
 * - POST /api/admin/citations-sync - Sync citations for specific items or all
 * - GET /api/admin/citations-sync/stats - Get citation statistics
 *
 * Authentication: Admin only
 *
 * Usage:
 *   POST /api/admin/citations-sync
 *   {
 *     "collection": "herbs",     // "herbs", "formulas", or "all"
 *     "id": "herb-id",            // Optional: specific item ID
 *     "maxItems": 10              // Optional: max items to process (default: 50)
 *   }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  fetchHerbCitations,
  fetchFormulaCitations,
  updateHerbCitations,
  updateFormulaCitations,
  getCitationStats,
  needsCitationRefresh,
} from '@/lib/citations'

// ============================================================================
// Types
// ============================================================================

interface CitationSyncRequest {
  collection?: 'herbs' | 'formulas' | 'all'
  id?: string
  maxItems?: number
}

interface CitationSyncResponse {
  success: boolean
  message?: string
  data?: {
    processed: number
    updated: number
    failed: number
    errors: string[]
    duration: number
  }
  error?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if user is admin
 */
async function isAdmin(req: NextRequest): Promise<boolean> {
  try {
    await getPayload({ config })

    // Get user from request (implementation depends on your auth setup)
    // This is a placeholder - adjust based on your auth implementation
    const user = (req as any).user

    if (!user) {
      return false
    }

    return user.role === 'admin'
  } catch (error) {
    console.error('[Citations API] Auth check error:', error)
    return false
  }
}

/**
 * Sync citations for a single herb
 */
async function syncSingleHerb(id: string): Promise<{
  success: boolean
  message: string
  citationsAdded: number
}> {
  try {
    const citations = await fetchHerbCitations(id, {
      maxResults: 10,
      minYear: 2010,
      qualityThreshold: 60,
    })

    const result = await updateHerbCitations(id, citations)

    return {
      success: true,
      message: `Updated herb with ${citations.length} citations`,
      citationsAdded: result.citationsAdded,
    }
  } catch (error) {
    throw new Error(`Failed to sync herb ${id}: ${error}`)
  }
}

/**
 * Sync citations for a single formula
 */
async function syncSingleFormula(id: string): Promise<{
  success: boolean
  message: string
  citationsAdded: number
}> {
  try {
    const citations = await fetchFormulaCitations(id, {
      maxResults: 10,
      minYear: 2010,
      qualityThreshold: 60,
    })

    const result = await updateFormulaCitations(id, citations)

    return {
      success: true,
      message: `Updated formula with ${citations.length} citations`,
      citationsAdded: result.citationsAdded,
    }
  } catch (error) {
    throw new Error(`Failed to sync formula ${id}: ${error}`)
  }
}

/**
 * Bulk sync citations for herbs
 */
async function bulkSyncHerbs(maxItems: number = 50): Promise<{
  processed: number
  updated: number
  failed: number
  errors: string[]
}> {
  const result = {
    processed: 0,
    updated: 0,
    failed: 0,
    errors: [] as string[],
  }

  try {
    const payload = await getPayload({ config })

    // Get published herbs that need updates
    const herbs = await payload.find({
      collection: 'herbs',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: maxItems * 2,
      sort: '-updatedAt',
    })

    // Filter to herbs that need updates
    const herbsToUpdate = herbs.docs
      .filter((herb) => {
        const lastUpdated = herb.citationsLastUpdated as string | undefined
        return needsCitationRefresh(lastUpdated)
      })
      .slice(0, maxItems)

    console.log(`[Citations API] Processing ${herbsToUpdate.length} herbs`)

    for (const herb of herbsToUpdate) {
      try {
        const syncResult = await syncSingleHerb(String(herb.id))
        result.processed++
        if (syncResult.citationsAdded > 0) {
          result.updated++
        }

        // Small delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        result.failed++
        result.errors.push(`${herb.title}: ${error}`)
      }
    }

    return result
  } catch (error) {
    throw new Error(`Bulk herb sync failed: ${error}`)
  }
}

/**
 * Bulk sync citations for formulas
 */
async function bulkSyncFormulas(maxItems: number = 50): Promise<{
  processed: number
  updated: number
  failed: number
  errors: string[]
}> {
  const result = {
    processed: 0,
    updated: 0,
    failed: 0,
    errors: [] as string[],
  }

  try {
    const payload = await getPayload({ config })

    // Get published formulas that need updates
    const formulas = await payload.find({
      collection: 'formulas',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: maxItems * 2,
      sort: '-updatedAt',
    })

    // Filter to formulas that need updates
    const formulasToUpdate = formulas.docs
      .filter((formula) => {
        const lastUpdated = formula.citationsLastUpdated as string | undefined
        return needsCitationRefresh(lastUpdated)
      })
      .slice(0, maxItems)

    console.log(`[Citations API] Processing ${formulasToUpdate.length} formulas`)

    for (const formula of formulasToUpdate) {
      try {
        const syncResult = await syncSingleFormula(String(formula.id))
        result.processed++
        if (syncResult.citationsAdded > 0) {
          result.updated++
        }

        // Small delay
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        result.failed++
        result.errors.push(`${formula.title}: ${error}`)
      }
    }

    return result
  } catch (error) {
    throw new Error(`Bulk formula sync failed: ${error}`)
  }
}

// ============================================================================
// API Routes
// ============================================================================

/**
 * POST /api/admin/citations-sync
 * Trigger citation sync
 */
export async function POST(req: NextRequest): Promise<NextResponse<CitationSyncResponse>> {
  const startTime = Date.now()

  try {
    // Check authentication
    const adminCheck = await isAdmin(req)
    if (!adminCheck) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Admin access required',
        },
        { status: 401 }
      )
    }

    // Parse request body
    const body: CitationSyncRequest = await req.json()
    const { collection = 'all', id, maxItems = 50 } = body

    console.log(`[Citations API] Starting citation sync: ${collection}${id ? ` (${id})` : ''}`)

    let result = {
      processed: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Handle specific item sync
    if (id) {
      if (collection === 'herbs' || collection === 'all') {
        try {
          const syncResult = await syncSingleHerb(id)
          result.processed = 1
          result.updated = syncResult.citationsAdded > 0 ? 1 : 0
        } catch (error) {
          result.failed = 1
          result.errors.push(`${error}`)
        }
      } else if (collection === 'formulas') {
        try {
          const syncResult = await syncSingleFormula(id)
          result.processed = 1
          result.updated = syncResult.citationsAdded > 0 ? 1 : 0
        } catch (error) {
          result.failed = 1
          result.errors.push(`${error}`)
        }
      }
    } else {
      // Handle bulk sync
      if (collection === 'herbs') {
        result = await bulkSyncHerbs(maxItems)
      } else if (collection === 'formulas') {
        result = await bulkSyncFormulas(maxItems)
      } else if (collection === 'all') {
        const herbResult = await bulkSyncHerbs(Math.floor(maxItems / 2))
        const formulaResult = await bulkSyncFormulas(Math.floor(maxItems / 2))

        result = {
          processed: herbResult.processed + formulaResult.processed,
          updated: herbResult.updated + formulaResult.updated,
          failed: herbResult.failed + formulaResult.failed,
          errors: [...herbResult.errors, ...formulaResult.errors],
        }
      }
    }

    const duration = Date.now() - startTime

    console.log(
      `[Citations API] Sync complete: ${result.processed} processed, ${result.updated} updated, ${result.failed} failed (${duration}ms)`
    )

    return NextResponse.json({
      success: true,
      message: `Citation sync complete: ${result.processed} processed, ${result.updated} updated, ${result.failed} failed`,
      data: {
        ...result,
        duration,
      },
    })
  } catch (error) {
    console.error('[Citations API] Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: `Citation sync failed: ${error}`,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/citations-sync/stats
 * Get citation statistics
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const adminCheck = await isAdmin(req)
    if (!adminCheck) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Admin access required',
        },
        { status: 401 }
      )
    }

    // Get stats for all collections
    const herbStats = await getCitationStats('herbs')
    const formulaStats = await getCitationStats('formulas')

    return NextResponse.json({
      success: true,
      data: {
        herbs: herbStats,
        formulas: formulaStats,
        total: {
          documents: herbStats.total + formulaStats.total,
          withCitations: herbStats.withCitations + formulaStats.withCitations,
          totalCitations: herbStats.totalCitations + formulaStats.totalCitations,
        },
      },
    })
  } catch (error) {
    console.error('[Citations API] Stats error:', error)

    return NextResponse.json(
      {
        success: false,
        error: `Failed to get citation stats: ${error}`,
      },
      { status: 500 }
    )
  }
}
