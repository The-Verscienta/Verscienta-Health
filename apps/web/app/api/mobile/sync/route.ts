import { NextRequest, NextResponse } from 'next/server'
import type { SyncRequest, SyncResponse, Herb, Formula, Condition } from '@verscienta/api-types'

/**
 * Mobile Sync API
 *
 * Provides incremental sync for offline-first mobile apps
 * Returns only data that has been updated since last sync
 */

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'
const MAX_ITEMS_PER_COLLECTION = 100 // Limit to prevent huge responses

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SyncRequest

    const lastSyncedAt = body.lastSyncedAt ? new Date(body.lastSyncedAt) : new Date(0)
    const collections = body.collections || []

    const response: SyncResponse = {
      herbs: [],
      formulas: [],
      conditions: [],
      syncedAt: new Date().toISOString(),
      hasMore: false,
    }

    // Fetch updated herbs if requested
    if (collections.includes('herbs')) {
      const herbs = await fetchUpdatedData<Herb>(
        'herbs',
        lastSyncedAt,
        MAX_ITEMS_PER_COLLECTION
      )
      response.herbs = herbs.docs
      response.hasMore = response.hasMore || herbs.hasMore
    }

    // Fetch updated formulas if requested
    if (collections.includes('formulas')) {
      const formulas = await fetchUpdatedData<Formula>(
        'formulas',
        lastSyncedAt,
        MAX_ITEMS_PER_COLLECTION
      )
      response.formulas = formulas.docs
      response.hasMore = response.hasMore || formulas.hasMore
    }

    // Fetch updated conditions if requested
    if (collections.includes('conditions')) {
      const conditions = await fetchUpdatedData<Condition>(
        'conditions',
        lastSyncedAt,
        MAX_ITEMS_PER_COLLECTION
      )
      response.conditions = conditions.docs
      response.hasMore = response.hasMore || conditions.hasMore
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      {
        error: 'SyncError',
        message: 'Failed to sync data',
      },
      { status: 500 }
    )
  }
}

/**
 * Fetch updated data from Payload CMS
 */
async function fetchUpdatedData<T>(
  collection: string,
  since: Date,
  limit: number
): Promise<{ docs: T[]; hasMore: boolean }> {
  try {
    const url = new URL(`${CMS_URL}/api/${collection}`)
    url.searchParams.set('limit', limit.toString())
    url.searchParams.set('where[updatedAt][greater_than_equal]', since.toISOString())
    url.searchParams.set('where[_status][equals]', 'published') // Only published content

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache revalidation for better performance
      next: { revalidate: 60 }, // Cache for 1 minute
    })

    if (!response.ok) {
      console.error(`Failed to fetch ${collection}: ${response.statusText}`)
      return { docs: [], hasMore: false }
    }

    const data = await response.json()

    // Transform Payload CMS response to match API types
    const docs = (data.docs || []).map((doc: any) => transformPayloadDoc(doc))

    return {
      docs,
      hasMore: data.hasNextPage || false,
    }
  } catch (error) {
    console.error(`Error fetching ${collection}:`, error)
    return { docs: [], hasMore: false }
  }
}

/**
 * Transform Payload CMS document to API format
 */
function transformPayloadDoc(doc: any): any {
  return {
    id: doc.id,
    slug: doc.slug,
    name: doc.name || doc.title,
    description: doc.description,
    status: doc._status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    // Spread all other fields
    ...doc,
  }
}
