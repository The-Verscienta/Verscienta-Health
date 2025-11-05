import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { checkRateLimit, isRedisConfigured, type RateLimitConfig } from '@/lib/redis-rate-limiter'
import { routing } from './i18n/routing'

/**
 * Security & i18n Proxy
 *
 * Next.js 16 Note: Proxy always runs on Node.js runtime (not Edge Runtime)
 * This is required because:
 * - ioredis library requires Node.js APIs (not available in Edge Runtime)
 * - Rate limiting with Redis/DragonflyDB requires ioredis
 * - Edge Runtime would cause "Cannot read properties of undefined (reading 'charCodeAt')" error
 *
 * Security & i18n Proxy
 *
 * Implements:
 * - i18n locale detection and routing (next-intl)
 * - Rate limiting with Redis (prevent brute force, DoS)
 * - Security headers (CSP, HSTS, etc.)
 * - Request validation
 * - Audit logging for suspicious activity
 *
 * Production Note:
 * - Uses Redis for distributed rate limiting
 * - Falls back to in-memory if Redis not configured
 * - Set REDIS_URL and REDIS_TOKEN environment variables
 */

// Create the intl middleware
const handleI18nRouting = createIntlMiddleware(routing)

// Rate limiting configuration for all API endpoints
// Comprehensive security-focused rate limits to prevent abuse
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // === Authentication & Security Endpoints (Strictest) ===
  // Prevent brute force attacks
  '/api/auth/login': { requests: 5, window: 15 * 60 * 1000 }, // 5 req / 15 min
  '/api/auth/register': { requests: 3, window: 60 * 60 * 1000 }, // 3 req / 1 hour
  '/api/auth/mfa/setup': { requests: 3, window: 60 * 60 * 1000 }, // 3 req / 1 hour
  '/api/settings/password': { requests: 3, window: 60 * 60 * 1000 }, // 3 req / 1 hour
  '/api/settings/delete-account': { requests: 1, window: 24 * 60 * 60 * 1000 }, // 1 req / 24 hours

  // === AI/ML Endpoints (Expensive Operations) ===
  // Prevent API quota exhaustion and abuse
  '/api/grok/symptom-analysis': { requests: 10, window: 60 * 60 * 1000 }, // 10 req / 1 hour
  '/api/grok': { requests: 15, window: 60 * 60 * 1000 }, // 15 req / 1 hour (general Grok)

  // === Public Content API (Moderate) ===
  // Allow reasonable access but prevent scraping
  '/api/herbs': { requests: 60, window: 60 * 1000 }, // 60 req / 1 min
  '/api/formulas': { requests: 60, window: 60 * 1000 }, // 60 req / 1 min
  '/api/conditions': { requests: 60, window: 60 * 1000 }, // 60 req / 1 min
  '/api/practitioners': { requests: 60, window: 60 * 1000 }, // 60 req / 1 min
  '/api/images': { requests: 100, window: 60 * 1000 }, // 100 req / 1 min

  // === User-Generated Content ===
  // Prevent spam and abuse
  '/api/contact': { requests: 3, window: 60 * 60 * 1000 }, // 3 req / 1 hour
  '/api/profile': { requests: 20, window: 60 * 1000 }, // 20 req / 1 min

  // === Mobile API Endpoints ===
  // Balance mobile app needs with abuse prevention
  '/api/mobile/register-device': { requests: 5, window: 60 * 60 * 1000 }, // 5 req / 1 hour
  '/api/mobile/unregister-device': { requests: 10, window: 60 * 60 * 1000 }, // 10 req / 1 hour
  '/api/mobile/sync': { requests: 30, window: 60 * 1000 }, // 30 req / 1 min
  '/api/mobile/config': { requests: 60, window: 60 * 1000 }, // 60 req / 1 min

  // === Admin API Endpoints (Protected but rate-limited) ===
  // Even authenticated admins should have reasonable limits
  '/api/admin/account-lockout': { requests: 50, window: 60 * 1000 }, // 50 req / 1 min
  '/api/admin/security-breach': { requests: 10, window: 60 * 1000 }, // 10 req / 1 min
  '/api/admin/security-events': { requests: 100, window: 60 * 1000 }, // 100 req / 1 min
  '/api/admin/api-logs': { requests: 100, window: 60 * 1000 }, // 100 req / 1 min

  // === Health & Monitoring (Generous) ===
  // Allow frequent health checks but prevent abuse
  '/api/health': { requests: 120, window: 60 * 1000 }, // 120 req / 1 min
  '/api/health/cert': { requests: 60, window: 60 * 1000 }, // 60 req / 1 min

  // === General API Endpoints ===
  '/api': { requests: 100, window: 60 * 1000 }, // 100 req / 1 min (catch-all for /api/*)

  // === Default for All Other Requests ===
  default: { requests: 300, window: 60 * 1000 }, // 300 req / 1 min
}

/**
 * Get rate limit configuration for a path
 */
function getRateLimitConfig(pathname: string): RateLimitConfig {
  // Check for exact match
  if (RATE_LIMITS[pathname]) {
    return RATE_LIMITS[pathname]
  }

  // Check for prefix match
  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    if (path !== 'default' && pathname.startsWith(path)) {
      return config
    }
  }

  return RATE_LIMITS.default
}

/**
 * Get client identifier (IP address)
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (behind proxy/CDN)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to unknown (request.ip not available in NextRequest)
  return 'unknown'
}

/**
 * Enhanced Content Security Policy (HIPAA-Compliant)
 *
 * Stricter CSP with reduced attack surface:
 * - Removed 'unsafe-eval' (use wasm for performance if needed)
 * - Limited 'unsafe-inline' usage
 * - Whitelist trusted sources only
 * - Block all iframes (prevent clickjacking)
 * - Report violations for monitoring
 */
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // REQUIRED for Next.js App Router (server components inject inline scripts)
    // TODO: Migrate to nonce-based CSP when Next.js 16 provides better support
    ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []), // Only in dev
    'https://cdn.jsdelivr.net', // For external libraries
    'https://unpkg.com', // For Leaflet
    'https://www.googletagmanager.com', // Analytics (if enabled)
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // REQUIRED for Tailwind CSS (utility-first approach)
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:', // For inline SVGs and base64 images
    'blob:', // For blob URLs (e.g., file uploads)
    'https://*.cloudflareimages.com', // Cloudflare Images
    'https://*.cloudflare.com', // Cloudflare R2
    'https://i.ytimg.com', // YouTube thumbnails (lite-youtube-embed)
  ],
  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
  'connect-src': [
    "'self'",
    process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3001',
    'https://api.x.ai', // Grok AI API
    'https://*.algolia.net', // Algolia search
    'https://*.algolianet.com',
    'https://www.youtube.com', // For lite-youtube-embed
  ],
  'media-src': ["'self'", 'https://www.youtube.com', 'https://i.ytimg.com'],
  'frame-src': ["'self'", 'https://www.youtube.com'], // Allow YouTube embeds only
  'frame-ancestors': ["'none'"], // Prevent ALL clickjacking (no iframes of this site)
  'base-uri': ["'self'"], // Prevent base tag injection
  'form-action': ["'self'"], // Only allow form submissions to same origin
  'object-src': ["'none'"], // Block Flash, Java, etc.
  'worker-src': ["'self'", 'blob:'], // Service workers
  'manifest-src': ["'self'"], // PWA manifest
  'upgrade-insecure-requests': [], // Force HTTPS
  // Report CSP violations for monitoring (add when reporting endpoint is ready)
  // 'report-uri': ['/api/security/csp-report'],
  // 'report-to': ['csp-endpoint'],
}

/**
 * Generate CSP header string
 */
function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => {
      if (values.length === 0) return key
      return `${key} ${values.join(' ')}`
    })
    .join('; ')
}

/**
 * Get allowed origins for CORS
 */
function getAllowedOrigins(): string[] {
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'

  // In development, allow all localhost origins
  if (process.env.NODE_ENV === 'development') {
    return [
      webUrl,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081', // React Native Metro
      'http://localhost:19000', // Expo
      'http://localhost:19006', // Expo web
      'capacitor://localhost', // Capacitor iOS
    ]
  }

  // In production, only allow specific origins
  return [
    webUrl,
    'https://verscienta.com',
    'https://www.verscienta.com',
    'https://staging.verscienta.com',
    // Mobile app origins
    'capacitor://localhost', // Capacitor iOS
    'http://localhost', // Capacitor Android
    // Add production mobile app custom schemes when available:
    // 'verscienta-app://',
  ]
}

/**
 * Add CORS headers if origin is allowed
 */
function addCORSHeaders(response: NextResponse, origin: string | null): void {
  if (!origin) return

  const allowedOrigins = getAllowedOrigins()
  const isAllowed = allowedOrigins.includes(origin)

  if (isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-API-Key, X-Requested-With, X-Client-Version, X-Device-Id'
    )
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400')
  }
}

/**
 * Main proxy function (Next.js 16 uses "proxy" instead of "middleware")
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')

  // Step 1: Handle i18n routing (skip for API routes, Payload admin, static files, etc.)
  const shouldSkipI18n =
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin') || // Payload CMS admin panel
    pathname.startsWith('/_next/') ||
    pathname.includes('/sw.js') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot)$/)

  const response = shouldSkipI18n ? NextResponse.next() : handleI18nRouting(request)

  // If i18n middleware returned a redirect, return it immediately
  // Don't process rate limiting or add headers to redirects
  if (response.status === 307 || response.status === 308) {
    return response
  }

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const preflightResponse = new NextResponse(null, { status: 204 })
    addCORSHeaders(preflightResponse, origin)
    return preflightResponse
  }

  // Get client identifier
  const clientId = getClientIdentifier(request)

  // Get rate limit configuration
  const config = getRateLimitConfig(pathname)

  // Check rate limit (async - uses Redis or in-memory fallback)
  const rateLimit = await checkRateLimit(clientId, pathname, config)

  // Log Redis status on first request (development only)
  if (process.env.NODE_ENV === 'development') {
    const redisStatus = isRedisConfigured() ? 'Redis' : 'In-Memory Fallback'
    console.log(`[RATE LIMIT] Using ${redisStatus} for ${pathname}`)
  }

  if (!rateLimit.allowed) {
    // Rate limit exceeded
    console.warn(`[RATE LIMIT] ${clientId} exceeded limit for ${pathname}`)

    // Log suspicious activity if excessive (>1000 requests)
    // Note: With Redis, we need to check the current count differently
    const currentCount = config.requests - rateLimit.remaining
    if (currentCount > 1000) {
      console.error(`[SECURITY] Possible DoS attack from ${clientId}`)

      // Send security alert (fire and forget - don't block the response)
      fetch(`${request.nextUrl.origin}/api/internal/security-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suspicious_activity',
          message: `Possible DoS attack detected from ${clientId}`,
          details: {
            clientId,
            requestCount: currentCount,
            endpoint: request.nextUrl.pathname,
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch(console.error)
    }

    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetTime),
        },
      }
    )
  }

  // Add security headers to response

  // CORS headers (for mobile apps)
  addCORSHeaders(response, origin)

  // Rate limit headers (inform client of current limits)
  response.headers.set('X-RateLimit-Limit', String(rateLimit.limit))
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining))
  response.headers.set('X-RateLimit-Reset', String(rateLimit.resetTime))

  // Security headers (additional to next.config.ts)
  response.headers.set('Content-Security-Policy', generateCSP())
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  )
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

  // Remove server header (don't expose Next.js version)
  response.headers.delete('X-Powered-By')

  return response
}

/**
 * Configure middleware to run on specific paths
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /admin (Payload CMS admin)
     * - /api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!admin|api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
