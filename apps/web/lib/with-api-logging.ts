/**
 * API Route Logging Wrapper
 *
 * Higher-order function that wraps Next.js API routes to automatically log:
 * - Request/response details
 * - Performance metrics
 * - Authentication status
 * - Rate limit information
 * - Errors and exceptions
 *
 * Usage:
 *   export const GET = withApiLogging(async (request) => {
 *     return NextResponse.json({ message: 'Hello' })
 *   })
 */

import { NextRequest, NextResponse } from 'next/server'
import { logApiRequest, extractRequestInfo, logRateLimitViolation } from './api-request-logger'
import { auth } from './auth'

type ApiHandler = (request: NextRequest, context?: unknown) => Promise<NextResponse>

interface LoggingOptions {
  /**
   * Whether to log this route (default: true)
   */
  enabled?: boolean

  /**
   * Custom path for logging (if different from actual path)
   */
  customPath?: string

  /**
   * Whether to include response body in logs (default: false for security)
   */
  includeResponseBody?: boolean

  /**
   * Whether to include request body in logs (default: false for PHI privacy)
   */
  includeRequestBody?: boolean
}

/**
 * Wrap API route handler with automatic logging
 *
 * @param handler - The API route handler function
 * @param options - Logging options
 * @returns Wrapped handler with logging
 *
 * @example
 * ```ts
 * // Automatic logging
 * export const GET = withApiLogging(async (request) => {
 *   const data = await getData()
 *   return NextResponse.json(data)
 * })
 *
 * // With custom options
 * export const POST = withApiLogging(
 *   async (request) => {
 *     const body = await request.json()
 *     return NextResponse.json({ success: true })
 *   },
 *   { customPath: '/api/custom-endpoint' }
 * )
 * ```
 */
export function withApiLogging(
  handler: ApiHandler,
  options: LoggingOptions = {}
): ApiHandler {
  const {
    enabled = true,
    customPath,
    includeResponseBody = false,
    includeRequestBody = false,
  } = options

  return async (request: NextRequest, context?: unknown) => {
    if (!enabled) {
      return handler(request, context)
    }

    const startTime = Date.now()
    let response: NextResponse
    let error: Error | null = null

    try {
      // Get authentication info
      const session = await auth.api.getSession({
        headers: request.headers,
      })

      const userId = session?.user?.id
      const sessionId = session?.session?.id

      // Extract request information
      const requestInfo = extractRequestInfo(request, userId, sessionId)

      // Log rate limit info if present
      const rateLimitRemaining = request.headers.get('x-ratelimit-remaining')
      const rateLimitHit = request.headers.get('x-ratelimit-hit') === 'true'

      try {
        // Execute the actual API handler
        response = await handler(request, context)

        // Calculate response time
        const responseTime = Date.now() - startTime

        // Get status code from response
        const statusCode = response.status

        // Extract error message if error response
        let errorMessage: string | undefined
        let errorStack: string | undefined

        if (statusCode >= 400) {
          try {
            const responseClone = response.clone()
            const responseBody = await responseClone.json()
            errorMessage = responseBody?.error || responseBody?.message
          } catch {
            // Response body is not JSON or already consumed
            errorMessage = response.statusText
          }
        }

        // Log the request asynchronously (don't block response)
        logApiRequest({
          ...requestInfo,
          path: customPath || requestInfo.path || '',
          statusCode,
          responseTime,
          rateLimitHit,
          rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined,
          errorMessage,
          errorStack,
        }).catch((err) => {
          console.error('[API Logging] Failed to log request:', err)
        })

        return response
      } catch (err) {
        error = err as Error

        // Calculate response time
        const responseTime = Date.now() - startTime

        // Create error response
        const statusCode = err instanceof Error && 'statusCode' in err
          ? (err as { statusCode?: number }).statusCode || 500
          : 500

        const errorMessage = err instanceof Error ? err.message : 'Internal server error'
        const errorStack = err instanceof Error ? err.stack : undefined

        // Log the error
        await logApiRequest({
          ...requestInfo,
          path: customPath || requestInfo.path || '',
          statusCode,
          responseTime,
          rateLimitHit,
          rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined,
          errorMessage,
          errorStack,
        }).catch((logErr) => {
          console.error('[API Logging] Failed to log error:', logErr)
        })

        // Return error response
        return NextResponse.json(
          {
            error: statusCode >= 500 ? 'Internal server error' : errorMessage,
            message: errorMessage,
          },
          { status: statusCode }
        )
      }
    } catch (err) {
      // Catch any errors in the logging wrapper itself
      console.error('[API Logging] Wrapper error:', err)
      return handler(request, context)
    }
  }
}

/**
 * Log rate limit violation
 *
 * Call this from middleware when rate limit is hit
 *
 * @example
 * ```ts
 * if (!rateLimit.allowed) {
 *   await logRateLimitFromMiddleware(request, rateLimit)
 *   return new NextResponse('Too many requests', { status: 429 })
 * }
 * ```
 */
export async function logRateLimitFromMiddleware(
  request: NextRequest,
  rateLimit: {
    remaining: number
    limit: number
  }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  const userId = session?.user?.id
  const requestInfo = extractRequestInfo(request, userId, session?.session?.id)

  await logRateLimitViolation({
    path: requestInfo.path || '',
    method: requestInfo.method || 'GET',
    userId,
    ipAddress: requestInfo.ipAddress,
    rateLimitKey: userId || requestInfo.ipAddress || 'unknown',
    rateLimitRemaining: rateLimit.remaining,
  })
}

/**
 * Create API logging decorator for class-based handlers
 *
 * @example
 * ```ts
 * class UserHandler {
 *   @WithApiLogging()
 *   async GET(request: NextRequest) {
 *     return NextResponse.json({ users: [] })
 *   }
 * }
 * ```
 */
export function WithApiLogging(options?: LoggingOptions) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = withApiLogging(originalMethod, options)

    return descriptor
  }
}
