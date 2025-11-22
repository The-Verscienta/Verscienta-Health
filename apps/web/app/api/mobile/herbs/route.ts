import { NextRequest } from 'next/server'
import { versionedHandler, versionedResponse, getApiVersion } from '@/lib/api-versioning'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Mobile API: Get Herbs List
 *
 * Supports API versioning with different response schemas per version
 *
 * Version 1: Current schema
 * Future versions will be added here
 */

/**
 * V1 Handler - Current version
 */
async function handleV1(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const search = searchParams.get('search') || ''

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'herbs',
      where: {
        _status: { equals: 'published' },
        ...(search && {
          title: { contains: search },
        }),
      },
      limit,
      page,
      depth: 0, // Minimize data for mobile
    })

    // Transform for mobile (lighter payload)
    const herbs = result.docs.map((herb) => ({
      id: herb.id,
      title: herb.title,
      slug: herb.slug,
      shortDescription: herb.description?.[0]?.children?.[0]?.text?.slice(0, 200) || '',
      scientificName: herb.botanicalInfo?.scientificName || '',
      family: herb.botanicalInfo?.family || '',
      averageRating: herb.averageRating || 0,
      reviewCount: herb.reviewCount || 0,
    }))

    return versionedResponse(
      {
        herbs,
        pagination: {
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          totalDocs: result.totalDocs,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        },
      },
      {
        version: 1,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching herbs (v1):', error)
    return versionedResponse(
      {
        error: 'Failed to fetch herbs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, version: 1 }
    )
  }
}

/**
 * GET handler with versioning support
 */
export async function GET(request: NextRequest) {
  return versionedHandler(request, {
    1: handleV1,
    // Future versions:
    // 2: handleV2,
  })
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  const version = getApiVersion(request)

  return versionedResponse(
    {
      methods: ['GET', 'OPTIONS'],
      supportedVersions: [1],
      currentVersion: version,
    },
    { status: 204, version }
  )
}
