import { NextRequest, NextResponse } from 'next/server'
import { cacheKeys, cacheTTL, withCache } from '@/lib/cache'

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    // Use cache wrapper
    const herb = await withCache(cacheKeys.herb(slug), cacheTTL.herb, async () => {
      // TODO: Fetch from Payload CMS
      // const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/herbs?where[slug][equals]=${slug}`)
      // const data = await response.json()
      // return data.docs[0]

      // Placeholder
      return {
        id: '1',
        name: 'Sample Herb',
        slug,
        scientificName: 'Herbaceus sampleus',
      }
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
