/**
 * Test Helper for DragonflyDB/Redis Cache Configuration
 *
 * This file exports the getRedisConfig function for testing purposes.
 * It allows us to test the TLS configuration logic without creating actual Redis connections.
 */

// Parse Redis URL if provided (format: redis://[:password@]host:port[/db])
export function getRedisConfig() {
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
