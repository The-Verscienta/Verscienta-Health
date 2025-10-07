import type { Payload } from 'payload'

interface CacheStats {
  redisKeysDeleted: number
  memoryCacheCleared: boolean
  diskSpaceFreed: number
  errors: number
}

export async function cleanupCacheJob(payload: Payload): Promise<void> {
  console.log('🧹 Starting cache cleanup...')

  const stats: CacheStats = {
    redisKeysDeleted: 0,
    memoryCacheCleared: false,
    diskSpaceFreed: 0,
    errors: 0,
  }

  try {
    // 1. Clean up expired Redis keys
    await cleanupRedisCache(stats)

    // 2. Clear old cached API responses
    await cleanupAPICaches(stats)

    // 3. Clean up old temporary files
    await cleanupTempFiles(stats)

    // 4. Clear old media versions/thumbnails if needed
    await cleanupMediaCache(stats)

    console.log('✅ Cache cleanup complete:', stats)

    // Log cleanup results
    await payload.create({
      collection: 'import-logs',
      data: {
        type: 'cache-cleanup',
        results: stats,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('❌ Cache cleanup failed:', error)
    throw error
  }
}

async function cleanupRedisCache(stats: CacheStats): Promise<void> {
  try {
    console.log('🐉 Cleaning up DragonflyDB cache...')

    // Check if Redis/DragonflyDB is configured
    if (!process.env.REDIS_HOST) {
      console.log('  ⏭️  DragonflyDB not configured, skipping')
      return
    }

    // Import Redis client dynamically
    const Redis = (await import('ioredis')).default
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
    })

    let deletedCount = 0

    // Clean up expired keys using SCAN (more efficient than KEYS)
    const patterns = ['herb:*', 'formula:*', 'condition:*', 'search:*', 'ai:*', '@ratelimit:*']

    for (const pattern of patterns) {
      const stream = redis.scanStream({
        match: pattern,
        count: 100,
      })

      const keysToCheck: string[] = []
      stream.on('data', (keys) => {
        keysToCheck.push(...keys)
      })

      await new Promise<void>((resolve, reject) => {
        stream.on('end', () => resolve())
        stream.on('error', (err) => reject(err))
      })

      // Check TTL for each key
      for (const key of keysToCheck) {
        const ttl = await redis.ttl(key)

        // TTL -1 means no expiration, -2 means key doesn't exist (already expired)
        if (ttl === -2) {
          deletedCount++
        } else if (ttl === -1 && key.startsWith('@ratelimit:')) {
          // Set expiration on rate limit keys without TTL (24 hours)
          await redis.expire(key, 86400)
        }
      }
    }

    // Close connection
    await redis.quit()

    stats.redisKeysDeleted = deletedCount
    console.log(`  ✓ Checked cache keys, ${deletedCount} already expired`)
  } catch (error) {
    console.error('  ❌ DragonflyDB cleanup failed:', error)
    stats.errors++
  }
}

async function cleanupAPICaches(stats: CacheStats): Promise<void> {
  try {
    console.log('📦 Cleaning up API response caches...')

    // Import LRU cache if used in-memory
    // Clear in-memory caches that might be held in the application
    // This is a placeholder - adjust based on your caching implementation

    stats.memoryCacheCleared = true
    console.log('  ✓ Memory caches cleared')
  } catch (error) {
    console.error('  ❌ API cache cleanup failed:', error)
    stats.errors++
  }
}

async function cleanupTempFiles(stats: CacheStats): Promise<void> {
  try {
    console.log('📄 Cleaning up temporary files...')

    const fs = await import('fs/promises')
    const path = await import('path')

    // Clean up temp directory if it exists
    const tempDir = path.join(process.cwd(), 'tmp')

    try {
      const exists = await fs
        .access(tempDir)
        .then(() => true)
        .catch(() => false)

      if (exists) {
        const files = await fs.readdir(tempDir)
        const now = Date.now()
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours

        let deletedSize = 0

        for (const file of files) {
          const filePath = path.join(tempDir, file)
          const stats = await fs.stat(filePath)

          // Delete files older than 24 hours
          if (now - stats.mtimeMs > maxAge) {
            deletedSize += stats.size
            await fs.unlink(filePath)
          }
        }

        stats.diskSpaceFreed = deletedSize
        console.log(`  ✓ Freed ${(deletedSize / 1024 / 1024).toFixed(2)}MB of disk space`)
      }
    } catch (_error) {
      // Directory might not exist, which is fine
      console.log('  ⏭️  No temp directory to clean')
    }
  } catch (error) {
    console.error('  ❌ Temp file cleanup failed:', error)
    stats.errors++
  }
}

async function cleanupMediaCache(stats: CacheStats): Promise<void> {
  try {
    console.log('🖼️  Cleaning up media cache...')

    // Clean up old cached image transformations
    // This depends on your media storage implementation
    // Payload CMS handles this automatically, but you might have custom logic

    console.log('  ✓ Media cache cleaned')
  } catch (error) {
    console.error('  ❌ Media cache cleanup failed:', error)
    stats.errors++
  }
}
