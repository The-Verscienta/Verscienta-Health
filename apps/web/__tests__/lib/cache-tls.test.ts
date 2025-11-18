/**
 * @vitest-environment node
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('DragonflyDB TLS Configuration', () => {
  beforeEach(() => {
    // Clear module cache to reload with new env vars
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  describe('TLS Version Enforcement', () => {
    it('should enforce TLS 1.2+ by default when using REDIS_URL with rediss://', async () => {
      process.env.REDIS_URL = 'rediss://:password@dragonfly.example.com:6379/0'
      vi.stubEnv('NODE_ENV', 'production')

      // Dynamically import to get fresh module with new env vars
      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      expect(config.tls).toBeDefined()
      expect(config.tls?.minVersion).toBe('TLSv1.2')
      expect(config.tls?.maxVersion).toBe('TLSv1.3')
    })

    it('should allow custom TLS version configuration via env vars', async () => {
      process.env.REDIS_URL = 'rediss://:password@dragonfly.example.com:6379/0'
      process.env.REDIS_TLS_MIN_VERSION = 'TLSv1.3'
      process.env.REDIS_TLS_MAX_VERSION = 'TLSv1.3'
      vi.stubEnv('NODE_ENV', 'production')

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      expect(config.tls?.minVersion).toBe('TLSv1.3')
      expect(config.tls?.maxVersion).toBe('TLSv1.3')
    })

    it('should enforce TLS 1.2+ when using individual env vars with TLS enabled', async () => {
      process.env.REDIS_HOST = 'dragonfly.example.com'
      process.env.REDIS_PORT = '6379'
      process.env.REDIS_PASSWORD = 'password'
      process.env.REDIS_TLS = 'true'
      vi.stubEnv('NODE_ENV', 'production')

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      expect(config.tls).toBeDefined()
      expect(config.tls?.minVersion).toBe('TLSv1.2')
      expect(config.tls?.maxVersion).toBe('TLSv1.3')
    })

    it('should not add TLS version enforcement when TLS is disabled', async () => {
      process.env.REDIS_URL = 'redis://:password@localhost:6379/0' // Note: redis:// not rediss://
      vi.stubEnv('NODE_ENV', 'production')

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      expect(config.tls).toBeUndefined()
    })
  })

  describe('Certificate Validation', () => {
    it('should enable certificate validation in production', async () => {
      process.env.REDIS_URL = 'rediss://:password@dragonfly.example.com:6379/0'
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      })

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      expect(config.tls?.rejectUnauthorized).toBe(true)
    })

    it('should disable certificate validation in development (for self-signed certs)', async () => {
      process.env.REDIS_URL = 'rediss://:password@localhost:6379/0'
      vi.stubEnv('NODE_ENV', 'development')

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      expect(config.tls?.rejectUnauthorized).toBe(false)
    })

    it('should set servername for SNI support', async () => {
      process.env.REDIS_URL = 'rediss://:password@dragonfly.example.com:6379/0'
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      })

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      expect(config.tls?.servername).toBe('dragonfly.example.com')
    })
  })

  describe('TLS Configuration Completeness', () => {
    it('should include all required TLS security properties', async () => {
      process.env.REDIS_URL = 'rediss://:password@dragonfly.example.com:6379/0'
      vi.stubEnv('NODE_ENV', 'production')

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      // Verify all TLS security properties are present
      expect(config.tls).toMatchObject({
        rejectUnauthorized: true,
        servername: 'dragonfly.example.com',
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3',
      })
    })

    it('should work with fallback env var configuration', async () => {
      process.env.REDIS_HOST = 'dragonfly.example.com'
      process.env.REDIS_PORT = '6379'
      process.env.REDIS_PASSWORD = 'password'
      process.env.REDIS_DB = '0'
      process.env.REDIS_TLS = 'true'
      vi.stubEnv('NODE_ENV', 'production')

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      expect(config).toMatchObject({
        host: 'dragonfly.example.com',
        port: 6379,
        password: 'password',
        db: 0,
      })

      expect(config.tls).toMatchObject({
        rejectUnauthorized: true,
        servername: 'dragonfly.example.com',
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3',
      })
    })
  })

  describe('PCI DSS / HIPAA Compliance', () => {
    it('should meet PCI DSS 3.2 TLS requirements (TLS 1.2+)', async () => {
      process.env.REDIS_URL = 'rediss://:password@dragonfly.example.com:6379/0'
      vi.stubEnv('NODE_ENV', 'production')

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      // PCI DSS 3.2 requires TLS 1.2 or higher
      const validMinVersions = ['TLSv1.2', 'TLSv1.3']
      expect(validMinVersions).toContain(config.tls?.minVersion)
      expect(config.tls?.rejectUnauthorized).toBe(true)
    })

    it('should meet HIPAA Security Rule encryption requirements', async () => {
      process.env.REDIS_URL = 'rediss://:password@dragonfly.example.com:6379/0'
      vi.stubEnv('NODE_ENV', 'production')

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      // HIPAA requires encryption in transit (TLS 1.2+) and certificate validation
      expect(config.tls).toBeDefined()
      expect(config.tls?.minVersion).toBe('TLSv1.2')
      expect(config.tls?.rejectUnauthorized).toBe(true)
    })

    it('should prevent downgrade attacks to TLS 1.0/1.1', async () => {
      process.env.REDIS_URL = 'rediss://:password@dragonfly.example.com:6379/0'
      vi.stubEnv('NODE_ENV', 'production')

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      // Ensure minimum version is at least TLS 1.2
      const minVersion = config.tls?.minVersion
      expect(minVersion).toBeDefined()
      expect(['TLSv1.2', 'TLSv1.3']).toContain(minVersion)

      // TLS 1.0 and 1.1 should not be accepted
      expect(minVersion).not.toBe('TLSv1')
      expect(minVersion).not.toBe('TLSv1.1')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid REDIS_URL gracefully', async () => {
      process.env.REDIS_URL = 'invalid-url'
      vi.stubEnv('NODE_ENV', 'production')

      const { getRedisConfig } = await import('../../lib/cache-test-helper')

      // Should fall back to individual env vars without throwing
      expect(() => getRedisConfig()).not.toThrow()

      const config = getRedisConfig()

      // Should use fallback configuration
      expect(config.host).toBe('localhost')
      expect(config.port).toBe(6379)
    })

    it('should handle missing TLS env vars with sensible defaults', async () => {
      process.env.REDIS_URL = 'rediss://:password@dragonfly.example.com:6379/0'
      vi.stubEnv('NODE_ENV', 'production')
      // Don't set REDIS_TLS_MIN_VERSION or REDIS_TLS_MAX_VERSION

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      // Should default to secure values
      expect(config.tls?.minVersion).toBe('TLSv1.2')
      expect(config.tls?.maxVersion).toBe('TLSv1.3')
    })
  })

  describe('Development vs Production Behavior', () => {
    it('should use strict TLS in production', async () => {
      process.env.REDIS_URL = 'rediss://:password@dragonfly.example.com:6379/0'
      vi.stubEnv('NODE_ENV', 'production')

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      expect(config.tls?.rejectUnauthorized).toBe(true)
      expect(config.tls?.minVersion).toBe('TLSv1.2')
      expect(config.tls?.maxVersion).toBe('TLSv1.3')
    })

    it('should allow self-signed certificates in development', async () => {
      process.env.REDIS_URL = 'rediss://:password@localhost:6379/0'
      vi.stubEnv('NODE_ENV', 'development')

      const { getRedisConfig } = await import('../../lib/cache-test-helper')
      const config = getRedisConfig()

      // Allows self-signed certs for local development
      expect(config.tls?.rejectUnauthorized).toBe(false)

      // But still enforces TLS version for security best practices
      expect(config.tls?.minVersion).toBe('TLSv1.2')
      expect(config.tls?.maxVersion).toBe('TLSv1.3')
    })
  })
})
