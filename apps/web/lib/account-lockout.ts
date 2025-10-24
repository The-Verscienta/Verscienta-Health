/**
 * Account Lockout Protection
 *
 * Implements automatic account lockout after repeated failed login attempts.
 * HIPAA Security: Protects against brute force attacks on PHI access.
 *
 * Features:
 * - Tracks failed login attempts per email address (Redis-backed)
 * - Locks account after threshold exceeded
 * - Auto-unlocks after timeout period
 * - Email notifications for security events
 * - Admin unlock capability
 * - Multi-instance safe (shared Redis state)
 */

import { cache } from 'react'
import { sendEmail } from './email'
import { redis } from './cache'

/**
 * Account Lockout Configuration
 */
export const LOCKOUT_CONFIG = {
  /** Maximum failed attempts before lockout */
  MAX_FAILED_ATTEMPTS: 5,

  /** Time window for counting failed attempts (15 minutes) */
  ATTEMPT_WINDOW_MINUTES: 15,

  /** Lockout duration (30 minutes) */
  LOCKOUT_DURATION_MINUTES: 30,

  /** Failed attempts before requiring CAPTCHA */
  CAPTCHA_THRESHOLD: 3,

  /** Redis key prefix for failed attempts */
  REDIS_PREFIX: 'auth:failed:',

  /** Redis key prefix for lockout status */
  LOCKOUT_PREFIX: 'auth:locked:',
} as const

/**
 * Failed attempt record
 */
interface FailedAttempt {
  timestamp: number
  ipAddress?: string
  userAgent?: string
}

/**
 * Lockout status
 */
interface LockoutStatus {
  locked: boolean
  lockedAt?: number
  unlockAt?: number
  failedAttempts: number
  requiresCaptcha: boolean
}

/**
 * Redis keys for failed attempts and lockout status
 * Production-ready: Shared state across all server instances
 */
function getFailedAttemptsKey(email: string): string {
  return `${LOCKOUT_CONFIG.REDIS_PREFIX}${email.toLowerCase()}`
}

function getLockoutKey(email: string): string {
  return `${LOCKOUT_CONFIG.LOCKOUT_PREFIX}${email.toLowerCase()}`
}

/**
 * In-memory fallback (development only)
 * Redis should always be configured in production
 */
const memoryFailedAttempts = new Map<string, FailedAttempt[]>()
const memoryLockout = new Map<
  string,
  { lockedAt: number; unlockAt: number; failedAttempts: number }
>()

/**
 * Record a failed login attempt (Redis-backed)
 */
export async function recordFailedAttempt(
  email: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  const key = getFailedAttemptsKey(email)
  const now = Date.now()
  const cutoff = now - LOCKOUT_CONFIG.ATTEMPT_WINDOW_MINUTES * 60 * 1000

  try {
    // Use Redis sorted set for automatic expiration
    const attempt = JSON.stringify({
      timestamp: now,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    })

    // Add current attempt with timestamp as score
    await redis.zadd(key, now, attempt)

    // Remove old attempts outside the window
    await redis.zremrangebyscore(key, 0, cutoff)

    // Set expiration on the key
    await redis.expire(key, LOCKOUT_CONFIG.ATTEMPT_WINDOW_MINUTES * 60)

    // Get count of attempts in current window
    const count = await redis.zcard(key)

    // Check if we should lock the account
    if (count >= LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS) {
      await lockAccount(email)
    }

    console.log(
      `[Account Security] Failed login attempt for ${email}. Total attempts: ${count}/${LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS}`
    )
  } catch (error) {
    console.error('[Account Security] Redis error in recordFailedAttempt:', error)
    // Fallback to memory
    await recordFailedAttemptMemory(email, metadata, now, cutoff)
  }
}

/**
 * Memory fallback for failed attempts
 */
async function recordFailedAttemptMemory(
  email: string,
  metadata: { ipAddress?: string; userAgent?: string } | undefined,
  now: number,
  cutoff: number
): Promise<void> {
  const key = email.toLowerCase()
  const attempts = (memoryFailedAttempts.get(key) || []).filter((a) => a.timestamp > cutoff)

  attempts.push({
    timestamp: now,
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent,
  })

  memoryFailedAttempts.set(key, attempts)

  if (attempts.length >= LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS) {
    await lockAccount(email)
  }

  console.warn(
    `[Account Security] Using in-memory fallback for ${email}. Total attempts: ${attempts.length}/${LOCKOUT_CONFIG.MAX_FAILED_ATTEMPTS}`
  )
}

/**
 * Lock an account (Redis-backed)
 */
export async function lockAccount(email: string): Promise<void> {
  const key = getLockoutKey(email)
  const attemptKey = getFailedAttemptsKey(email)
  const now = Date.now()
  const unlockAt = now + LOCKOUT_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000

  try {
    // Get attempt count
    const attemptCount = await redis.zcard(attemptKey)

    // Store lockout data
    const lockoutData = JSON.stringify({
      lockedAt: now,
      unlockAt,
      failedAttempts: attemptCount,
    })

    await redis.setex(key, LOCKOUT_CONFIG.LOCKOUT_DURATION_MINUTES * 60, lockoutData)

    console.warn(
      `[Account Security] Account locked: ${email}. Failed attempts: ${attemptCount}. Unlock at: ${new Date(unlockAt).toISOString()}`
    )

    // Send email notification
    try {
      await sendAccountLockedEmail(email, {
        failedAttempts: attemptCount,
        unlockAt: new Date(unlockAt),
      })
    } catch (error) {
      console.error('Failed to send lockout notification email:', error)
    }
  } catch (error) {
    console.error('[Account Security] Redis error in lockAccount:', error)
    // Fallback to memory
    const memKey = email.toLowerCase()
    const attempts = memoryFailedAttempts.get(memKey) || []
    memoryLockout.set(memKey, {
      lockedAt: now,
      unlockAt,
      failedAttempts: attempts.length,
    })
    console.warn(`[Account Security] Using in-memory fallback for lockout: ${email}`)
  }
}

/**
 * Check if an account is locked (Redis-backed)
 */
export async function isAccountLocked(email: string): Promise<LockoutStatus> {
  const key = getLockoutKey(email)
  const attemptKey = getFailedAttemptsKey(email)
  const now = Date.now()

  try {
    // Check Redis for lockout status
    const lockoutData = await redis.get(key)

    if (lockoutData) {
      const lockout = JSON.parse(lockoutData)

      // Redis TTL handles expiration, but double-check
      if (lockout.unlockAt <= now) {
        // Expired (should not happen with TTL, but be safe)
        await redis.del(key, attemptKey)
        console.log(`[Account Security] Lockout expired for ${email}`)
        return {
          locked: false,
          failedAttempts: 0,
          requiresCaptcha: false,
        }
      }

      // Still locked
      return {
        locked: true,
        lockedAt: lockout.lockedAt,
        unlockAt: lockout.unlockAt,
        failedAttempts: lockout.failedAttempts,
        requiresCaptcha: true,
      }
    }

    // Not locked, check if CAPTCHA is required
    const cutoff = now - LOCKOUT_CONFIG.ATTEMPT_WINDOW_MINUTES * 60 * 1000
    const attemptCount = await redis.zcount(attemptKey, cutoff, now)

    return {
      locked: false,
      failedAttempts: attemptCount,
      requiresCaptcha: attemptCount >= LOCKOUT_CONFIG.CAPTCHA_THRESHOLD,
    }
  } catch (error) {
    console.error('[Account Security] Redis error in isAccountLocked:', error)
    // Fallback to memory
    const memKey = email.toLowerCase()
    const lockout = memoryLockout.get(memKey)

    if (lockout && lockout.unlockAt > now) {
      return {
        locked: true,
        lockedAt: lockout.lockedAt,
        unlockAt: lockout.unlockAt,
        failedAttempts: lockout.failedAttempts,
        requiresCaptcha: true,
      }
    }

    const cutoff = now - LOCKOUT_CONFIG.ATTEMPT_WINDOW_MINUTES * 60 * 1000
    const attempts = (memoryFailedAttempts.get(memKey) || []).filter((a) => a.timestamp > cutoff)

    return {
      locked: false,
      failedAttempts: attempts.length,
      requiresCaptcha: attempts.length >= LOCKOUT_CONFIG.CAPTCHA_THRESHOLD,
    }
  }
}

/**
 * Clear failed attempts (after successful login) - Redis-backed
 */
export async function clearFailedAttempts(email: string): Promise<void> {
  const key = getLockoutKey(email)
  const attemptKey = getFailedAttemptsKey(email)

  try {
    await redis.del(attemptKey, key)
    console.log(`[Account Security] Cleared failed attempts for ${email}`)
  } catch (error) {
    console.error('[Account Security] Redis error in clearFailedAttempts:', error)
    // Fallback to memory
    const memKey = email.toLowerCase()
    memoryFailedAttempts.delete(memKey)
    memoryLockout.delete(memKey)
  }
}

/**
 * Manually unlock an account (admin action) - Redis-backed
 */
export async function unlockAccount(email: string, adminId?: string): Promise<void> {
  const key = getLockoutKey(email)
  const attemptKey = getFailedAttemptsKey(email)

  try {
    await redis.del(key, attemptKey)
    console.log(
      `[Account Security] Account manually unlocked: ${email} by admin: ${adminId || 'system'}`
    )

    // Send email notification
    try {
      await sendAccountUnlockedEmail(email)
    } catch (error) {
      console.error('Failed to send unlock notification email:', error)
    }
  } catch (error) {
    console.error('[Account Security] Redis error in unlockAccount:', error)
    // Fallback to memory
    const memKey = email.toLowerCase()
    memoryLockout.delete(memKey)
    memoryFailedAttempts.delete(memKey)
  }
}

/**
 * Get lockout status for all accounts (admin function) - Redis-backed
 * Uses SCAN to avoid blocking Redis
 */
export async function getLockedAccounts(): Promise<
  Array<{ email: string; lockedAt: Date; unlockAt: Date; failedAttempts: number }>
> {
  const now = Date.now()
  const locked: Array<{
    email: string
    lockedAt: Date
    unlockAt: Date
    failedAttempts: number
  }> = []

  try {
    // Use SCAN to find all lockout keys (non-blocking)
    const stream = redis.scanStream({
      match: `${LOCKOUT_CONFIG.LOCKOUT_PREFIX}*`,
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

    // Get lockout data for each key
    for (const key of keys) {
      const lockoutData = await redis.get(key)
      if (!lockoutData) continue

      const lockout = JSON.parse(lockoutData)

      // Skip expired (should not happen with TTL)
      if (lockout.unlockAt <= now) continue

      // Extract email from key
      const email = key.replace(LOCKOUT_CONFIG.LOCKOUT_PREFIX, '')

      locked.push({
        email,
        lockedAt: new Date(lockout.lockedAt),
        unlockAt: new Date(lockout.unlockAt),
        failedAttempts: lockout.failedAttempts,
      })
    }

    return locked
  } catch (error) {
    console.error('[Account Security] Redis error in getLockedAccounts:', error)
    // Fallback to memory
    for (const [email, lockout] of memoryLockout.entries()) {
      if (lockout.unlockAt <= now) continue

      locked.push({
        email,
        lockedAt: new Date(lockout.lockedAt),
        unlockAt: new Date(lockout.unlockAt),
        failedAttempts: lockout.failedAttempts,
      })
    }

    return locked
  }
}

/**
 * Send account locked notification email
 */
async function sendAccountLockedEmail(
  email: string,
  details: { failedAttempts: number; unlockAt: Date }
): Promise<void> {
  const unlockTime = details.unlockAt.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  await sendEmail({
    to: email,
    subject: 'Security Alert: Account Temporarily Locked',
    html: `
      <h2>Account Security Alert</h2>

      <p>Your Verscienta Health account has been temporarily locked due to multiple failed login attempts.</p>

      <p><strong>Details:</strong></p>
      <ul>
        <li>Failed Attempts: ${details.failedAttempts}</li>
        <li>Account will unlock automatically at: ${unlockTime}</li>
      </ul>

      <p><strong>What to do next:</strong></p>
      <ul>
        <li>Wait for the lockout period to expire (${LOCKOUT_CONFIG.LOCKOUT_DURATION_MINUTES} minutes)</li>
        <li>If this wasn't you, consider changing your password immediately after unlock</li>
        <li>Enable two-factor authentication for enhanced security</li>
      </ul>

      <p><strong>Didn't try to log in?</strong></p>
      <p>If you didn't attempt to access your account, someone may be trying to gain unauthorized access.
      Please contact support immediately and consider changing your password.</p>

      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="background-color: #5d7a5d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Contact Support
        </a>
      </p>

      <p style="color: #666; font-size: 12px; margin-top: 24px;">
        This is an automated security notification from Verscienta Health.
      </p>
    `,
  })
}

/**
 * Send account unlocked notification email
 */
async function sendAccountUnlockedEmail(email: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Account Unlocked',
    html: `
      <h2>Account Unlocked</h2>

      <p>Your Verscienta Health account has been unlocked.</p>

      <p>You can now log in normally. For enhanced security, we recommend:</p>
      <ul>
        <li>Using a strong, unique password</li>
        <li>Enabling two-factor authentication</li>
        <li>Never sharing your login credentials</li>
      </ul>

      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #5d7a5d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Log In
        </a>
      </p>

      <p style="color: #666; font-size: 12px; margin-top: 24px;">
        This is an automated security notification from Verscienta Health.
      </p>
    `,
  })
}

/**
 * Helper functions for rate limiting checks
 */
export const accountLockout = {
  /**
   * Check if login should be allowed
   */
  canAttemptLogin: async (email: string): Promise<{ allowed: boolean; reason?: string }> => {
    const status = await isAccountLocked(email)

    if (status.locked) {
      const minutesRemaining = status.unlockAt
        ? Math.ceil((status.unlockAt - Date.now()) / 60000)
        : LOCKOUT_CONFIG.LOCKOUT_DURATION_MINUTES

      return {
        allowed: false,
        reason: `Account is temporarily locked. Try again in ${minutesRemaining} minutes.`,
      }
    }

    return { allowed: true }
  },

  /**
   * Check if CAPTCHA is required
   */
  requiresCaptcha: async (email: string): Promise<boolean> => {
    const status = await isAccountLocked(email)
    return status.requiresCaptcha
  },

  /**
   * Record failed attempt and check if account should be locked
   */
  recordFailure: async (
    email: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<void> => {
    await recordFailedAttempt(email, metadata)
  },

  /**
   * Clear attempts after successful login
   */
  recordSuccess: async (email: string): Promise<void> => {
    await clearFailedAttempts(email)
  },

  /**
   * Admin function to unlock account
   */
  unlock: async (email: string, adminId?: string): Promise<void> => {
    await unlockAccount(email, adminId)
  },

  /**
   * Get lockout status
   */
  getStatus: async (email: string): Promise<LockoutStatus> => {
    return isAccountLocked(email)
  },
}
