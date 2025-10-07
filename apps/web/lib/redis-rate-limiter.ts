import { Redis } from '@upstash/redis'

/**
 * Redis-based Rate Limiter
 *
 * Production-ready rate limiting using Redis for distributed environments.
 * Falls back to in-memory storage if Redis is not configured.
 *
 * Benefits over in-memory:
 * - Shared state across multiple server instances
 * - Persists rate limit data across restarts
 * - Better performance at scale
 * - Automatic expiration via Redis TTL
 */

// Initialize Redis client (Upstash for serverless compatibility)
let redis: Redis | null = null

if (process.env.REDIS_URL && process.env.REDIS_TOKEN) {
  redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
  })
}

// Fallback to in-memory storage if Redis not configured
const memoryStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  requests: number
  window: number // in milliseconds
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  limit: number
}

/**
 * Check rate limit using Redis (or in-memory fallback)
 */
export async function checkRateLimit(
  identifier: string,
  pathname: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}:${pathname}`
  const now = Date.now()

  if (redis) {
    // Redis-based rate limiting
    return checkRateLimitRedis(key, config, now)
  } else {
    // Fallback to in-memory
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[RATE LIMIT] Redis not configured - using in-memory fallback (not recommended for production)'
      )
    }
    return checkRateLimitMemory(key, config, now)
  }
}

/**
 * Redis implementation using sliding window counter
 */
async function checkRateLimitRedis(
  key: string,
  config: RateLimitConfig,
  now: number
): Promise<RateLimitResult> {
  const windowStart = now - config.window
  const resetTime = now + config.window

  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis!.pipeline()

    // Remove old entries outside the current window
    pipeline.zremrangebyscore(key, 0, windowStart)

    // Add current request with timestamp as score
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })

    // Count requests in current window
    pipeline.zcard(key)

    // Set expiration on key (cleanup)
    pipeline.expire(key, Math.ceil(config.window / 1000))

    const results = await pipeline.exec()

    // Extract count from pipeline results
    const count = (results[2] as number) || 0

    return {
      allowed: count <= config.requests,
      remaining: Math.max(0, config.requests - count),
      resetTime,
      limit: config.requests,
    }
  } catch (error) {
    console.error('[RATE LIMIT] Redis error:', error)
    // Fall back to allowing the request on Redis errors
    return {
      allowed: true,
      remaining: config.requests,
      resetTime,
      limit: config.requests,
    }
  }
}

/**
 * In-memory fallback implementation
 */
function checkRateLimitMemory(key: string, config: RateLimitConfig, now: number): RateLimitResult {
  let record = memoryStore.get(key)

  // Reset if window has passed
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + config.window,
    }
  }

  // Increment count
  record.count++
  memoryStore.set(key, record)

  // Clean up old entries periodically (1% chance)
  if (Math.random() < 0.01) {
    cleanupMemoryStore()
  }

  return {
    allowed: record.count <= config.requests,
    remaining: Math.max(0, config.requests - record.count),
    resetTime: record.resetTime,
    limit: config.requests,
  }
}

/**
 * Clean up expired entries from in-memory store
 */
function cleanupMemoryStore(): void {
  const now = Date.now()
  for (const [key, record] of memoryStore.entries()) {
    if (now > record.resetTime) {
      memoryStore.delete(key)
    }
  }
}

/**
 * Get Redis connection status
 */
export function isRedisConfigured(): boolean {
  return redis !== null
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  if (!redis) return false

  try {
    await redis.ping()
    return true
  } catch (error) {
    console.error('[RATE LIMIT] Redis connection test failed:', error)
    return false
  }
}

/**
 * Clear all rate limit data (use with caution)
 */
export async function clearAllRateLimits(): Promise<void> {
  if (redis) {
    try {
      // In production, you might want to scan and delete only ratelimit:* keys
      const keys = await redis.keys('ratelimit:*')
      if (keys.length > 0) {
        await redis.del(...keys)
      }
      console.log(`[RATE LIMIT] Cleared ${keys.length} rate limit entries from Redis`)
    } catch (error) {
      console.error('[RATE LIMIT] Error clearing Redis rate limits:', error)
    }
  } else {
    memoryStore.clear()
    console.log('[RATE LIMIT] Cleared in-memory rate limit store')
  }
}

/**
 * Get rate limit info for debugging
 */
export async function getRateLimitInfo(
  identifier: string,
  pathname: string
): Promise<{ count: number; resetTime: number } | null> {
  const key = `ratelimit:${identifier}:${pathname}`

  if (redis) {
    try {
      const now = Date.now()
      const windowStart = now - 60000 // Default 1 minute window for info

      const count = await redis.zcount(key, windowStart, now)
      const ttl = await redis.ttl(key)

      return {
        count,
        resetTime: now + ttl * 1000,
      }
    } catch (error) {
      console.error('[RATE LIMIT] Error getting Redis info:', error)
      return null
    }
  } else {
    const record = memoryStore.get(key)
    return record || null
  }
}
