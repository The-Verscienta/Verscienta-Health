import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js Middleware for API Versioning and CORS
 *
 * Handles:
 * 1. API versioning (redirects /api/v1/* to appropriate handlers)
 * 2. CORS for mobile apps and third-party origins
 * 3. Security headers
 * 4. Rate limiting headers
 */

/**
 * Parse allowed CORS origins from environment variable
 */
function getAllowedOrigins(): string[] {
  const baseOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    process.env.NEXT_PUBLIC_WEB_URL || '',
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
    process.env.NEXT_PUBLIC_SITE_URL || '',
  ]

  // Mobile app origins (Capacitor, React Native, etc.)
  const mobileOrigins = [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost', // iOS simulator
    'http://localhost:8100', // Ionic dev server
    'verscienta-app://', // Custom app scheme
  ]

  // Parse additional origins from env (comma-separated)
  const additionalOrigins = process.env.ALLOWED_CORS_ORIGINS
    ? process.env.ALLOWED_CORS_ORIGINS.split(',').map((o) => o.trim())
    : []

  // Combine and filter out empty strings
  return [...baseOrigins, ...mobileOrigins, ...additionalOrigins].filter(Boolean)
}

/**
 * Check if origin is allowed
 */
function isAllowedOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false

  // Exact match
  if (allowedOrigins.includes(origin)) return true

  // Allow any localhost origin in development
  if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
    return true
  }

  // Allow file:// protocol for mobile apps
  if (origin.startsWith('file://')) return true

  // Allow custom app schemes (verscienta-app://, etc.)
  if (origin.includes('://') && !origin.startsWith('http')) {
    const scheme = origin.split('://')[0]
    return allowedOrigins.some((allowed) => allowed.startsWith(scheme + '://'))
  }

  // Check wildcard patterns (e.g., "https://*.verscienta.com")
  return allowedOrigins.some((allowed) => {
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*')
      return new RegExp(`^${pattern}$`).test(origin)
    }
    return false
  })
}

/**
 * Apply CORS headers to response
 */
function applyCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  allowedOrigins: string[]
): NextResponse {
  const origin = request.headers.get('origin')

  if (isAllowedOrigin(origin, allowedOrigins)) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-App-Version'
    )
    response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
  }

  return response
}

/**
 * Handle API versioning
 *
 * Rewrites:
 * - /api/v1/* -> /api/* (current version)
 * - /api/v2/* -> /api/v2/* (future version, when implemented)
 *
 * Returns null if no rewrite needed
 */
function handleApiVersioning(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  // Match /api/v{number}/*
  const versionMatch = pathname.match(/^\/api\/v(\d+)\/(.*)$/)

  if (!versionMatch) return null

  const [, version, path] = versionMatch
  const versionNum = parseInt(version, 10)

  // API Version 1 - rewrite to current API (remove /v1)
  if (versionNum === 1) {
    const url = request.nextUrl.clone()
    url.pathname = `/api/${path}`
    return NextResponse.rewrite(url)
  }

  // Future versions - return "not implemented" for now
  if (versionNum > 1) {
    return NextResponse.json(
      {
        error: 'API version not supported',
        version: versionNum,
        message: `API version ${versionNum} is not yet implemented. Current version is 1.`,
        supportedVersions: [1],
      },
      { status: 501 } // Not Implemented
    )
  }

  // Invalid version (< 1)
  return NextResponse.json(
    {
      error: 'Invalid API version',
      version: versionNum,
      message: 'API version must be >= 1',
      supportedVersions: [1],
    },
    { status: 400 }
  )
}

/**
 * Add API versioning headers to response
 */
function addApiVersionHeaders(response: NextResponse, pathname: string): NextResponse {
  // Only add version headers for /api/* routes
  if (!pathname.startsWith('/api/')) return response

  // Don't add to admin panel or Payload admin API
  if (pathname.startsWith('/api/(payload)') || pathname.startsWith('/admin')) {
    return response
  }

  response.headers.set('X-Api-Version', '1')
  response.headers.set('X-Api-Supported-Versions', '1')
  response.headers.set('X-Api-Latest-Version', '1')
  response.headers.set('X-Api-Deprecation', 'false')

  return response
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const allowedOrigins = getAllowedOrigins()

  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    return applyCorsHeaders(response, request, allowedOrigins)
  }

  // Handle API versioning (rewrites)
  const versionedResponse = handleApiVersioning(request)
  if (versionedResponse) {
    // Apply CORS to versioned response
    return applyCorsHeaders(versionedResponse, request, allowedOrigins)
  }

  // Continue to route handler
  const response = NextResponse.next()

  // Apply CORS headers
  applyCorsHeaders(response, request, allowedOrigins)

  // Add API version headers
  addApiVersionHeaders(response, request.nextUrl.pathname)

  return response
}

/**
 * Middleware configuration
 *
 * Runs on all /api/* routes
 * (Payload admin routes are excluded via route checks in the middleware function)
 */
export const config = {
  matcher: '/api/:path*',
}
