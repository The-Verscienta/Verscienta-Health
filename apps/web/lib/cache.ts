import { Ratelimit } from '@upstash/ratelimit'
import Redis from 'ioredis'

// Parse Redis URL if provided (format: redis://[:password@]host:port[/db])
function getRedisConfig() {
  const redisUrl = process.env.REDIS_URL

  if (redisUrl) {
    try {
      const url = new URL(redisUrl)
      return {
        host: url.hostname,
        port: parseInt(url.port || '6379'),
        password: url.password || undefined,
        db: parseInt(url.pathname.slice(1) || '0'),
        tls:
          url.protocol === 'rediss:'
            ? {
                // Enable TLS with proper certificate validation
                rejectUnauthorized: process.env.NODE_ENV === 'production',
                // In production, verify certificates
                // In development, allow self-signed for testing
                servername: url.hostname, // SNI (Server Name Indication)

                // SECURITY: Enforce TLS 1.2+ (required for PCI DSS 3.2+ and HIPAA)
                // TLS 1.0 and 1.1 are deprecated and have known vulnerabilities
                minVersion: (process.env.REDIS_TLS_MIN_VERSION as any) || 'TLSv1.2',
                maxVersion: (process.env.REDIS_TLS_MAX_VERSION as any) || 'TLSv1.3',
              }
            : undefined,
      }
    } catch (error) {
      console.error('Failed to parse REDIS_URL:', error)
    }
  }

  // Fallback to individual env vars
  const useTLS =
    process.env.REDIS_TLS === 'true' || process.env.REDIS_URL?.startsWith('rediss://')

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    tls: useTLS
      ? {
          rejectUnauthorized: process.env.NODE_ENV === 'production',
          servername: process.env.REDIS_HOST || 'localhost',

          // SECURITY: Enforce TLS 1.2+ (required for PCI DSS 3.2+ and HIPAA)
          // TLS 1.0 and 1.1 are deprecated and have known vulnerabilities
          minVersion: (process.env.REDIS_TLS_MIN_VERSION as any) || 'TLSv1.2',
          maxVersion: (process.env.REDIS_TLS_MAX_VERSION as any) || 'TLSv1.3',
        }
      : undefined,
  }
}

// Initialize DragonflyDB client (Redis-compatible)
export const redis = new Redis({
  ...getRedisConfig(),
  // Connection options for production
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  // Enable lazy connect during build or development
  // CI is set to 'true' during Nixpacks/Docker builds
  lazyConnect: process.env.NODE_ENV === 'development' || process.env.CI === 'true',

  // SECURITY: Connection pooling and resource limits
  enableReadyCheck: true,
  enableOfflineQueue: false, // Fail fast if Redis is down
  connectTimeout: 10000, // 10 seconds
  commandTimeout: 5000, // 5 seconds per command
  keepAlive: 30000, // 30 seconds keepalive
  maxLoadingRetryTime: 2000,

  // Reconnection strategy
  reconnectOnError(err) {
    const targetError = 'READONLY'
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true
    }
    return false
  },
})

// Handle connection events
redis.on('error', (err) => {
  console.error('DragonflyDB connection error:', err)
})

redis.on('connect', () => {
  console.log('✓ Connected to DragonflyDB')
})

// Rate limiting configurations using Upstash Ratelimit with ioredis adapter
export const ratelimit = {
  // API rate limit: 100 requests per 10 minutes
  api: new Ratelimit({
    redis: redis as any, // Upstash Ratelimit supports ioredis
    limiter: Ratelimit.slidingWindow(100, '10 m'),
    analytics: true,
    prefix: '@ratelimit/api',
  }),

  // AI endpoint rate limit: 20 requests per 10 minutes
  ai: new Ratelimit({
    redis: redis as any,
    limiter: Ratelimit.slidingWindow(20, '10 m'),
    analytics: true,
    prefix: '@ratelimit/ai',
  }),

  // Search rate limit: 50 requests per 10 minutes
  search: new Ratelimit({
    redis: redis as any,
    limiter: Ratelimit.slidingWindow(50, '10 m'),
    analytics: true,
    prefix: '@ratelimit/search',
  }),
}

// Cache key generators
export const cacheKeys = {
  herb: (slug: string) => `herb:${slug}`,
  herbList: (page: number, filters?: string) => `herbs:list:${page}:${filters || 'all'}`,
  formula: (slug: string) => `formula:${slug}`,
  condition: (slug: string) => `condition:${slug}`,
  practitioner: (slug: string) => `practitioner:${slug}`,
  aiSymptomAnalysis: (symptoms: string) =>
    `ai:symptoms:${Buffer.from(symptoms).toString('base64').substring(0, 50)}`,
  searchResults: (query: string, index: string) => `search:${index}:${query}`,
}

// Cache TTL (Time To Live) in seconds
export const cacheTTL = {
  herb: 3600, // 1 hour
  herbList: 1800, // 30 minutes
  formula: 3600, // 1 hour
  condition: 7200, // 2 hours
  practitioner: 1800, // 30 minutes
  aiSymptomAnalysis: 86400, // 24 hours (symptoms don't change frequently)
  searchResults: 900, // 15 minutes
}

// Generic cache get/set utilities
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key)
    if (!cached) return null
    return JSON.parse(cached) as T
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

export async function setCached<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value))
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

export async function deleteCached(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

export async function deleteCachedPattern(pattern: string): Promise<void> {
  try {
    // Scan for keys matching pattern (more efficient than KEYS)
    const stream = redis.scanStream({
      match: pattern,
      count: 100,
    })

    const keys: string[] = []
    stream.on('data', (resultKeys) => {
      keys.push(...resultKeys)
    })

    await new Promise<void>((resolve, reject) => {
      stream.on('end', () => resolve())
      stream.on('error', (err) => reject(err))
    })

    if (keys.length > 0) {
      // Delete in batches
      const batchSize = 100
      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize)
        await redis.del(...batch)
      }
    }
  } catch (error) {
    console.error('Cache pattern delete error:', error)
  }
}

// Wrapper function for caching API responses
export async function withCache<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = await getCached<T>(key)
  if (cached !== null) {
    return cached
  }

  // Fetch fresh data
  const data = await fetchFn()

  // Store in cache
  await setCached(key, data, ttl)

  return data
}

// Cache invalidation helpers
export const invalidateCache = {
  herb: async (slug: string) => {
    await deleteCached(cacheKeys.herb(slug))
    await deleteCachedPattern('herbs:list:*')
  },

  herbList: async () => {
    await deleteCachedPattern('herbs:list:*')
  },

  formula: async (slug: string) => {
    await deleteCached(cacheKeys.formula(slug))
  },

  practitioner: async (slug: string) => {
    await deleteCached(cacheKeys.practitioner(slug))
  },

  searchResults: async (index?: string) => {
    if (index) {
      await deleteCachedPattern(`search:${index}:*`)
    } else {
      await deleteCachedPattern('search:*')
    }
  },

  all: async () => {
    await redis.flushdb()
  },
}

// In-memory LRU cache for extremely high-frequency data
class LRUCache<T> {
  private cache: Map<string, { value: T; expiry: number }>
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, item)

    return item.value
  }

  set(key: string, value: T, ttlSeconds: number = 300): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// In-memory cache for very hot data
export const memoryCache = new LRUCache(200)

// Combined cache strategy: Memory first, then Redis
export async function getCombinedCache<T>(key: string): Promise<T | null> {
  // Check memory cache first
  const memCached = memoryCache.get(key)
  if (memCached !== null) {
    return memCached as T
  }

  // Check Redis
  const redisCached = await getCached<T>(key)
  if (redisCached !== null) {
    // Populate memory cache
    memoryCache.set(key, redisCached, 300)
    return redisCached
  }

  return null
}

export async function setCombinedCache<T>(
  key: string,
  value: T,
  ttl: number = 3600
): Promise<void> {
  // Set in both caches
  memoryCache.set(key, value, Math.min(ttl, 300)) // Max 5 min in memory
  await setCached(key, value, ttl)
}

// Rate limit middleware helper
export async function checkRateLimit(
  identifier: string,
  limitType: keyof typeof ratelimit = 'api'
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  try {
    const { success, limit, remaining, reset } = await ratelimit[limitType].limit(identifier)
    return { success, limit, remaining, reset }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // On error, allow the request
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }
}

// Cache statistics
export async function getCacheStats(): Promise<{
  memorySize: number
  redisKeyCount: number
  redisMemoryUsage: string
}> {
  try {
    const info = await redis.info('memory')
    const keyCount = await redis.dbsize()

    // Parse memory usage from info
    const memoryMatch = info.match(/used_memory_human:(.+)/)
    const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'unknown'

    return {
      memorySize: memoryCache.size(),
      redisKeyCount: keyCount,
      redisMemoryUsage: memoryUsage,
    }
  } catch (error) {
    console.error('Cache stats error:', error)
    return {
      memorySize: memoryCache.size(),
      redisKeyCount: 0,
      redisMemoryUsage: 'unknown',
    }
  }
}

// Health check
export async function checkCacheHealth(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch (error) {
    console.error('Cache health check failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnectCache(): Promise<void> {
  try {
    await redis.quit()
    console.log('✓ Disconnected from DragonflyDB')
  } catch (error) {
    console.error('Error disconnecting from cache:', error)
  }
}
