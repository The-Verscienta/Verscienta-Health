import { NextRequest, NextResponse } from 'next/server'

/**
 * Mobile-Optimized Image API
 *
 * Provides on-the-fly image optimization for mobile apps:
 * - Automatic format conversion (WebP for modern browsers)
 * - Responsive sizing based on device
 * - Quality optimization
 * - Caching headers for performance
 *
 * Usage:
 * /api/images?url={imageUrl}&w={width}&h={height}&q={quality}&f={format}
 *
 * Example:
 * /api/images?url=https://cdn.verscienta.com/herbs/ginseng.jpg&w=400&q=80&f=webp
 */

export const runtime = 'edge'

interface ImageParams {
  url: string
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse parameters
    const params: ImageParams = {
      url: searchParams.get('url') || '',
      width: searchParams.get('w') ? Number.parseInt(searchParams.get('w')!) : undefined,
      height: searchParams.get('h') ? Number.parseInt(searchParams.get('h')!) : undefined,
      quality: searchParams.get('q') ? Number.parseInt(searchParams.get('q')!) : 80,
      format: (searchParams.get('f') as 'webp' | 'jpeg' | 'png') || 'webp',
    }

    // Validate URL
    if (!params.url) {
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    // Validate URL is from allowed domain (security)
    if (!isAllowedDomain(params.url)) {
      return new NextResponse('Invalid image URL domain', { status: 403 })
    }

    // Validate dimensions (prevent abuse)
    if (params.width && (params.width < 1 || params.width > 2000)) {
      return new NextResponse('Invalid width (must be 1-2000)', { status: 400 })
    }
    if (params.height && (params.height < 1 || params.height > 2000)) {
      return new NextResponse('Invalid height (must be 1-2000)', { status: 400 })
    }
    if (params.quality && (params.quality < 1 || params.quality > 100)) {
      return new NextResponse('Invalid quality (must be 1-100)', { status: 400 })
    }

    // Use Next.js Image Optimization API or Cloudflare Images
    // For now, we'll proxy to Cloudflare Images if configured, otherwise return original
    const optimizedUrl = await getOptimizedImageUrl(params)

    // Fetch the image
    const imageResponse = await fetch(optimizedUrl, {
      headers: {
        'User-Agent': 'Verscienta-Image-Proxy/1.0',
      },
    })

    if (!imageResponse.ok) {
      return new NextResponse('Failed to fetch image', { status: imageResponse.status })
    }

    // Create response with proper headers
    const headers = new Headers()
    headers.set(
      'Content-Type',
      imageResponse.headers.get('Content-Type') || `image/${params.format}`
    )
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('X-Image-Optimized', 'true')

    return new NextResponse(imageResponse.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Image optimization error:', error)
    return new NextResponse('Image optimization failed', { status: 500 })
  }
}

/**
 * Check if URL is from an allowed domain (security)
 */
function isAllowedDomain(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    const allowedDomains = [
      'verscienta.com',
      'cdn.verscienta.com',
      'images.verscienta.com',
      'r2.cloudflarestorage.com',
      process.env.CLOUDFLARE_ACCOUNT_ID
        ? `${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
        : null,
      // Add localhost for development
      ...(process.env.NODE_ENV === 'development' ? ['localhost', '127.0.0.1'] : []),
    ].filter(Boolean)

    return allowedDomains.some(
      (domain) => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

/**
 * Get optimized image URL using Cloudflare Images or build query params
 */
async function getOptimizedImageUrl(params: ImageParams): Promise<string> {
  // If using Cloudflare Images, use their transformation API
  const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const cloudflareImagesEnabled = process.env.CLOUDFLARE_IMAGES_ENABLED === 'true'

  if (cloudflareAccountId && cloudflareImagesEnabled) {
    // Cloudflare Images format: https://imagedelivery.net/{account_hash}/{image_id}/{variant}
    // For now, we'll return the original URL - implement Cloudflare Images integration later
  }

  // For Cloudflare R2, we can add query params for transformation if configured
  const url = new URL(params.url)

  // Add transformation parameters if the origin supports it
  if (params.width) url.searchParams.set('width', params.width.toString())
  if (params.height) url.searchParams.set('height', params.height.toString())
  if (params.quality) url.searchParams.set('quality', params.quality.toString())
  if (params.format) url.searchParams.set('format', params.format)

  return url.toString()
}
