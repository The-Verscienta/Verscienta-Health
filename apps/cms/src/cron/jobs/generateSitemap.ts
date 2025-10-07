import type { Payload } from 'payload'

interface SitemapStats {
  urls: number
  collections: string[]
  fileSize: number
  duration: number
}

export async function generateSitemapJob(payload: Payload): Promise<void> {
  console.log('🗺️  Starting sitemap generation...')

  const startTime = Date.now()

  const stats: SitemapStats = {
    urls: 0,
    collections: [],
    fileSize: 0,
    duration: 0,
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://verscienta.com'

    // Build sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap +=
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    // Add static pages
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' },
      { path: '/herbs', priority: 0.9, changefreq: 'daily' },
      { path: '/formulas', priority: 0.9, changefreq: 'daily' },
      { path: '/conditions', priority: 0.9, changefreq: 'daily' },
      { path: '/practitioners', priority: 0.9, changefreq: 'daily' },
      { path: '/symptom-checker', priority: 0.8, changefreq: 'weekly' },
      { path: '/about', priority: 0.6, changefreq: 'monthly' },
      { path: '/contact', priority: 0.5, changefreq: 'monthly' },
      { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
      { path: '/terms', priority: 0.3, changefreq: 'yearly' },
    ]

    for (const page of staticPages) {
      sitemap += generateUrlEntry(
        `${baseUrl}${page.path}`,
        new Date(),
        page.changefreq as any,
        page.priority
      )
      stats.urls++
    }

    // Add dynamic pages from CMS collections
    const collections = [
      { name: 'herbs', path: '/herbs', priority: 0.8 },
      { name: 'formulas', path: '/formulas', priority: 0.7 },
      { name: 'conditions', path: '/conditions', priority: 0.7 },
      { name: 'practitioners', path: '/practitioners', priority: 0.6 },
    ]

    for (const collection of collections) {
      const count = await addCollectionToSitemap(
        payload,
        collection.name,
        collection.path,
        baseUrl,
        collection.priority,
        stats
      )

      if (count > 0) {
        stats.collections.push(collection.name)
        sitemap += await generateCollectionUrls(
          payload,
          collection.name,
          collection.path,
          baseUrl,
          collection.priority
        )
      }
    }

    sitemap += '</urlset>'

    // Write sitemap to file
    const fs = await import('fs/promises')
    const path = await import('path')

    // Determine sitemap location (typically in public directory of frontend)
    const sitemapDir = process.env.SITEMAP_DIR || './public'
    const sitemapPath = path.join(sitemapDir, 'sitemap.xml')

    try {
      await fs.mkdir(sitemapDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    await fs.writeFile(sitemapPath, sitemap, 'utf-8')

    stats.fileSize = Buffer.byteLength(sitemap, 'utf-8')
    stats.duration = Date.now() - startTime

    console.log(
      `✅ Sitemap generated: ${stats.urls} URLs, ${(stats.fileSize / 1024).toFixed(2)}KB (${stats.duration}ms)`
    )

    // Also generate sitemap index if you have multiple sitemaps
    await generateSitemapIndex(baseUrl, sitemapDir)

    // Optionally ping search engines
    if (process.env.PING_SEARCH_ENGINES === 'true') {
      await pingSearchEngines(baseUrl)
    }

    // Log sitemap generation
    await payload.create({
      collection: 'import-logs',
      data: {
        type: 'sitemap-generation',
        results: stats,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('❌ Sitemap generation failed:', error)
    throw error
  }
}

async function addCollectionToSitemap(
  payload: Payload,
  collection: string,
  path: string,
  baseUrl: string,
  priority: number,
  stats: SitemapStats
): Promise<number> {
  try {
    const { totalDocs } = await payload.find({
      collection: collection as any,
      where: {
        status: {
          equals: 'published',
        },
      },
      limit: 0, // Just get count
    })

    stats.urls += totalDocs
    return totalDocs
  } catch (error) {
    console.error(`Failed to count ${collection}:`, error)
    return 0
  }
}

async function generateCollectionUrls(
  payload: Payload,
  collection: string,
  basePath: string,
  baseUrl: string,
  priority: number
): Promise<string> {
  let xml = ''

  try {
    // Fetch all published documents
    const { docs } = await payload.find({
      collection: collection as any,
      where: {
        status: {
          equals: 'published',
        },
      },
      limit: 10000,
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    for (const doc of docs) {
      const url = `${baseUrl}${basePath}/${doc.slug}`
      const lastmod = doc.updatedAt ? new Date(doc.updatedAt as string | number | Date) : new Date()
      xml += generateUrlEntry(url, lastmod, 'weekly', priority)
    }
  } catch (error) {
    console.error(`Failed to generate URLs for ${collection}:`, error)
  }

  return xml
}

function generateUrlEntry(
  url: string,
  lastmod: Date,
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
  priority: number
): string {
  const date = new Date(lastmod).toISOString().split('T')[0]

  return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>\n`
}

async function generateSitemapIndex(
  baseUrl: string,
  sitemapDir: string
): Promise<void> {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')

    // Check if multiple sitemaps exist
    const files = await fs.readdir(sitemapDir)
    const sitemapFiles = files.filter(
      (file) => file.startsWith('sitemap') && file.endsWith('.xml')
    )

    if (sitemapFiles.length > 1) {
      console.log('📑 Generating sitemap index...')

      let index = '<?xml version="1.0" encoding="UTF-8"?>\n'
      index +=
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

      for (const file of sitemapFiles) {
        index += `  <sitemap>
    <loc>${baseUrl}/${file}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>\n`
      }

      index += '</sitemapindex>'

      const indexPath = path.join(sitemapDir, 'sitemap-index.xml')
      await fs.writeFile(indexPath, index, 'utf-8')

      console.log('  ✓ Sitemap index created')
    }
  } catch (error) {
    console.error('  ⚠️  Sitemap index generation failed:', error)
  }
}

async function pingSearchEngines(baseUrl: string): Promise<void> {
  try {
    console.log('🔔 Pinging search engines...')

    const sitemapUrl = `${baseUrl}/sitemap.xml`

    const searchEngines = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    ]

    const axios = await import('axios')

    for (const url of searchEngines) {
      try {
        await axios.default.get(url)
        console.log(`  ✓ Pinged: ${url.split('/')[2]}`)
      } catch (error) {
        console.error(`  ⚠️  Failed to ping: ${url.split('/')[2]}`)
      }
    }
  } catch (error) {
    console.error('  ⚠️  Search engine ping failed:', error)
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
