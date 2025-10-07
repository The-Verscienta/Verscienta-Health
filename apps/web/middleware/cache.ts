import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/cache'

export async function cacheMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get client identifier (IP address or user ID)
  const identifier =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'anonymous'

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    let limitType: 'api' | 'ai' | 'search' = 'api'

    // Determine rate limit type
    if (pathname.includes('/grok/') || pathname.includes('/symptom-analysis')) {
      limitType = 'ai'
    } else if (pathname.includes('/search')) {
      limitType = 'search'
    }

    const { success, limit, remaining, reset } = await checkRateLimit(
      identifier,
      limitType
    )

    if (!success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          limit,
          remaining,
          reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', reset.toString())
    return response
  }

  return NextResponse.next()
}
