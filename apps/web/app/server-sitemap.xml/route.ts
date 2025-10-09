import { getServerSideSitemap } from 'next-sitemap'
import type { ISitemapField } from 'next-sitemap'

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001'
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://verscienta.com'

export async function GET() {
  try {
    const fields: ISitemapField[] = []

    // Add main collection pages
    fields.push(
      {
        loc: `${baseUrl}/herbs`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9,
      },
      {
        loc: `${baseUrl}/conditions`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9,
      },
      {
        loc: `${baseUrl}/formulas`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
      },
      {
        loc: `${baseUrl}/practitioners`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
      }
    )

    // Fetch and add individual herb pages
    try {
      const herbs = await fetchCollection('herbs', 1000)
      herbs.forEach((item) => {
        fields.push({
          loc: `${baseUrl}/herbs/${item.slug}`,
          lastmod: item.updatedAt,
          changefreq: 'weekly',
          priority: 0.7,
        })
      })
    } catch (error) {
      console.error('Error fetching herbs for sitemap:', error)
    }

    // Fetch and add individual condition pages
    try {
      const conditions = await fetchCollection('conditions', 1000)
      conditions.forEach((item) => {
        fields.push({
          loc: `${baseUrl}/conditions/${item.slug}`,
          lastmod: item.updatedAt,
          changefreq: 'weekly',
          priority: 0.7,
        })
      })
    } catch (error) {
      console.error('Error fetching conditions for sitemap:', error)
    }

    // Fetch and add individual formula pages
    try {
      const formulas = await fetchCollection('formulas', 1000)
      formulas.forEach((item) => {
        fields.push({
          loc: `${baseUrl}/formulas/${item.slug}`,
          lastmod: item.updatedAt,
          changefreq: 'monthly',
          priority: 0.6,
        })
      })
    } catch (error) {
      console.error('Error fetching formulas for sitemap:', error)
    }

    // Fetch and add individual practitioner pages
    try {
      const practitioners = await fetchCollection('practitioners', 1000)
      practitioners.forEach((item) => {
        fields.push({
          loc: `${baseUrl}/practitioners/${item.slug}`,
          lastmod: item.updatedAt,
          changefreq: 'monthly',
          priority: 0.6,
        })
      })
    } catch (error) {
      console.error('Error fetching practitioners for sitemap:', error)
    }

    return getServerSideSitemap(fields)
  } catch (error) {
    console.error('Error generating server sitemap:', error)
    return getServerSideSitemap([])
  }
}

/**
 * Fetch collection items from Payload CMS
 */
async function fetchCollection(
  collection: string,
  limit: number
): Promise<Array<{ slug: string; updatedAt: string }>> {
  try {
    const url = new URL(`${CMS_URL}/api/${collection}`)
    url.searchParams.set('limit', limit.toString())
    url.searchParams.set('where[_status][equals]', 'published')
    url.searchParams.set('select', 'slug,updatedAt') // Only fetch what we need

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 1 hour for performance
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      console.error(`Failed to fetch ${collection}: ${response.statusText}`)
      return []
    }

    const data = await response.json()
    return data.docs || []
  } catch (error) {
    console.error(`Error fetching ${collection}:`, error)
    return []
  }
}
