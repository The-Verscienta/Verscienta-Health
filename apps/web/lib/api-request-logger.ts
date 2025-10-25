/**
 * API Request Logger
 *
 * HIPAA Compliance: Comprehensive logging of all API requests for audit trail,
 * security monitoring, and analytics.
 *
 * Features:
 * - Request/response logging with performance metrics
 * - User authentication tracking
 * - Rate limit violation detection
 * - Error tracking with sanitized stack traces
 * - Automatic cleanup of old logs (90 days retention)
 */

import { prisma } from './prisma'
import type { NextRequest } from 'next/server'

export interface ApiRequestLogData {
  method: string
  path: string
  query?: string
  statusCode: number
  responseTime: number
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  referer?: string
  rateLimitHit?: boolean
  rateLimitKey?: string
  rateLimitRemaining?: number
  errorMessage?: string
  errorStack?: string
}

/**
 * Log API request to database
 *
 * @param data - Request log data
 */
export async function logApiRequest(data: ApiRequestLogData): Promise<void> {
  try {
    await prisma.apiRequestLog.create({
      data: {
        method: data.method,
        path: data.path,
        query: data.query,
        statusCode: data.statusCode,
        responseTime: data.responseTime,
        userId: data.userId,
        sessionId: data.sessionId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referer: data.referer,
        rateLimitHit: data.rateLimitHit || false,
        rateLimitKey: data.rateLimitKey,
        rateLimitRemaining: data.rateLimitRemaining,
        errorMessage: data.errorMessage,
        errorStack: sanitizeStackTrace(data.errorStack),
      },
    })
  } catch (error) {
    // Log to console if database logging fails (don't block request)
    console.error('[API Logger] Failed to log request:', error)
  }
}

/**
 * Log rate limit violation
 *
 * @param data - Rate limit violation data
 */
export async function logRateLimitViolation(data: {
  path: string
  method: string
  userId?: string
  ipAddress?: string
  rateLimitKey: string
  rateLimitRemaining: number
}): Promise<void> {
  await logApiRequest({
    ...data,
    statusCode: 429, // Too Many Requests
    responseTime: 0,
    rateLimitHit: true,
    errorMessage: 'Rate limit exceeded',
  })
}

/**
 * Extract request information from Next.js request
 *
 * @param request - Next.js request object
 * @param userId - Optional authenticated user ID
 * @param sessionId - Optional session ID
 * @returns Request info object
 */
export function extractRequestInfo(
  request: NextRequest,
  userId?: string,
  sessionId?: string
): Partial<ApiRequestLogData> {
  const url = new URL(request.url)

  return {
    method: request.method,
    path: url.pathname,
    query: url.search ? url.search.substring(1) : undefined,
    userId,
    sessionId,
    ipAddress: getClientIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
    referer: request.headers.get('referer') || undefined,
  }
}

/**
 * Get client IP address from request
 *
 * Checks multiple headers in order of preference:
 * 1. x-forwarded-for (Cloudflare, proxies)
 * 2. cf-connecting-ip (Cloudflare)
 * 3. x-real-ip (nginx)
 * 4. Remote address
 */
export function getClientIp(request: NextRequest): string | undefined {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Take the first IP in the list
    return forwardedFor.split(',')[0].trim()
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp) {
    return xRealIp
  }

  // @ts-expect-error - ip property exists on NextRequest
  return request.ip || undefined
}

/**
 * Sanitize stack trace to remove sensitive information
 *
 * Removes:
 * - File paths (replace with relative paths)
 * - Environment variables
 * - Secrets and API keys
 */
function sanitizeStackTrace(stack?: string): string | undefined {
  if (!stack) return undefined

  return (
    stack
      // Remove absolute file paths
      .replace(/[A-Z]:\\[^:\n]+/g, '<path>')
      .replace(/\/[^:\n]+/g, '<path>')
      // Remove potential secrets (long alphanumeric strings)
      .replace(/[a-zA-Z0-9]{32,}/g, '<redacted>')
      // Limit stack trace length
      .substring(0, 5000)
  )
}

/**
 * Clean up old API request logs
 *
 * Deletes logs older than the specified number of days.
 * Should be run as a cron job (e.g., daily at 2am).
 *
 * @param retentionDays - Number of days to retain logs (default: 90)
 * @returns Number of deleted records
 */
export async function cleanupOldLogs(retentionDays: number = 90): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  try {
    const result = await prisma.apiRequestLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    console.log(`[API Logger] Deleted ${result.count} old logs (older than ${retentionDays} days)`)
    return result.count
  } catch (error) {
    console.error('[API Logger] Failed to clean up old logs:', error)
    return 0
  }
}

/**
 * Get API request statistics
 *
 * @param options - Query options
 * @returns API statistics
 */
export async function getApiStatistics(options: {
  startDate?: Date
  endDate?: Date
  userId?: string
  path?: string
}): Promise<{
  totalRequests: number
  averageResponseTime: number
  errorRate: number
  rateLimitViolations: number
  topEndpoints: Array<{ path: string; count: number }>
  topUsers: Array<{ userId: string; count: number }>
}> {
  const { startDate, endDate, userId, path } = options

  const whereClause: Record<string, unknown> = {}

  if (startDate || endDate) {
    whereClause.createdAt = {}
    if (startDate) (whereClause.createdAt as Record<string, Date>).gte = startDate
    if (endDate) (whereClause.createdAt as Record<string, Date>).lte = endDate
  }

  if (userId) whereClause.userId = userId
  if (path) whereClause.path = path

  // Total requests
  const totalRequests = await prisma.apiRequestLog.count({ where: whereClause })

  // Average response time
  const avgResult = await prisma.apiRequestLog.aggregate({
    where: whereClause,
    _avg: {
      responseTime: true,
    },
  })
  const averageResponseTime = avgResult._avg.responseTime || 0

  // Error rate (4xx and 5xx)
  const errorCount = await prisma.apiRequestLog.count({
    where: {
      ...whereClause,
      statusCode: {
        gte: 400,
      },
    },
  })
  const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0

  // Rate limit violations
  const rateLimitViolations = await prisma.apiRequestLog.count({
    where: {
      ...whereClause,
      rateLimitHit: true,
    },
  })

  // Top endpoints
  const endpointCounts = await prisma.apiRequestLog.groupBy({
    by: ['path'],
    where: whereClause,
    _count: {
      path: true,
    },
    orderBy: {
      _count: {
        path: 'desc',
      },
    },
    take: 10,
  })
  const topEndpoints = endpointCounts.map((e) => ({
    path: e.path,
    count: e._count.path,
  }))

  // Top users
  const userCounts = await prisma.apiRequestLog.groupBy({
    by: ['userId'],
    where: {
      ...whereClause,
      userId: {
        not: null,
      },
    },
    _count: {
      userId: true,
    },
    orderBy: {
      _count: {
        userId: 'desc',
      },
    },
    take: 10,
  })
  const topUsers = userCounts
    .filter((u) => u.userId !== null)
    .map((u) => ({
      userId: u.userId as string,
      count: u._count.userId,
    }))

  return {
    totalRequests,
    averageResponseTime,
    errorRate,
    rateLimitViolations,
    topEndpoints,
    topUsers,
  }
}

/**
 * Get recent API errors
 *
 * @param limit - Number of errors to return
 * @returns Recent error logs
 */
export async function getRecentErrors(limit: number = 50) {
  return await prisma.apiRequestLog.findMany({
    where: {
      statusCode: {
        gte: 400,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    select: {
      id: true,
      method: true,
      path: true,
      statusCode: true,
      userId: true,
      ipAddress: true,
      errorMessage: true,
      createdAt: true,
    },
  })
}

/**
 * Get user activity timeline
 *
 * @param userId - User ID
 * @param limit - Number of requests to return
 * @returns User request history
 */
export async function getUserActivity(userId: string, limit: number = 100) {
  return await prisma.apiRequestLog.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    select: {
      id: true,
      method: true,
      path: true,
      statusCode: true,
      responseTime: true,
      rateLimitHit: true,
      createdAt: true,
    },
  })
}

/**
 * Detect suspicious activity patterns
 *
 * @param userId - Optional user ID to check
 * @param ipAddress - Optional IP address to check
 * @returns Suspicious activity indicators
 */
export async function detectSuspiciousActivity(params: {
  userId?: string
  ipAddress?: string
  timeWindowMinutes?: number
}): Promise<{
  suspicious: boolean
  reasons: string[]
  details: Record<string, unknown>
}> {
  const { userId, ipAddress, timeWindowMinutes = 60 } = params
  const reasons: string[] = []
  const details: Record<string, unknown> = {}

  const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000)

  // Check for excessive error rate
  if (userId || ipAddress) {
    const whereClause: Record<string, unknown> = {
      createdAt: { gte: timeWindow },
    }
    if (userId) whereClause.userId = userId
    if (ipAddress) whereClause.ipAddress = ipAddress

    const totalRequests = await prisma.apiRequestLog.count({ where: whereClause })
    const errorRequests = await prisma.apiRequestLog.count({
      where: {
        ...whereClause,
        statusCode: { gte: 400 },
      },
    })

    const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0
    details.errorRate = errorRate
    details.totalRequests = totalRequests

    if (errorRate > 50 && totalRequests > 10) {
      reasons.push(`High error rate: ${errorRate.toFixed(1)}%`)
    }

    // Check for rate limit violations
    const rateLimitViolations = await prisma.apiRequestLog.count({
      where: {
        ...whereClause,
        rateLimitHit: true,
      },
    })
    details.rateLimitViolations = rateLimitViolations

    if (rateLimitViolations > 5) {
      reasons.push(`Multiple rate limit violations: ${rateLimitViolations}`)
    }

    // Check for rapid-fire requests (potential scraping/DDoS)
    if (totalRequests > 100) {
      reasons.push(`Unusually high request volume: ${totalRequests} requests in ${timeWindowMinutes} minutes`)
    }
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
    details,
  }
}
