import { NextRequest, NextResponse } from 'next/server'
import { cacheKeys, cacheTTL, withCache } from '@/lib/cache'
import { getHerbBySlug } from '@/lib/payload-api'

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    // Use cache wrapper
    const herb = await withCache(cacheKeys.herb(slug), cacheTTL.herb, async () => {
      // Fetch from Payload CMS
      const { docs } = await getHerbBySlug(slug)
      return docs[0]
    })

    if (!herb) {
      return NextResponse.json({ error: 'Herb not found' }, { status: 404 })
    }

    return NextResponse.json(herb, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    })
  } catch (error) {
    console.error('Error fetching herb:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
