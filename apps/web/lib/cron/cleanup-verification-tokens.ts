/**
 * Expired Verification Tokens Cleanup Cron Job
 *
 * Automatically deletes expired verification tokens (email verification, magic links,
 * password reset tokens) to maintain database health and security.
 *
 * Schedule: Daily at 3:30 AM
 * Retention: Tokens are deleted immediately after expiration
 *
 * Security Benefits:
 * - Prevents token table bloat
 * - Removes expired/invalid authentication tokens
 * - Reduces attack surface (no stale verification codes)
 * - Complies with security best practices
 *
 * Token Types Cleaned:
 * - Email verification tokens
 * - Magic link tokens
 * - Password reset tokens
 * - Two-factor authentication codes
 *
 * Performance:
 * - Uses indexed query (Verification.expiresAt index)
 * - Efficient batch deletion
 * - Minimal database load
 *
 * Usage:
 *   - Add to cron/index.ts: scheduleVerificationTokenCleanup()
 *   - Or run manually: pnpm tsx lib/cron/cleanup-verification-tokens.ts
 */

import cron from 'node-cron'
import { prisma } from '../prisma'

/**
 * Additional buffer time in hours before deletion
 * Keeps expired tokens for a short grace period (useful for debugging)
 * Can be overridden via VERIFICATION_CLEANUP_BUFFER_HOURS environment variable
 */
const BUFFER_HOURS = parseInt(process.env.VERIFICATION_CLEANUP_BUFFER_HOURS || '0', 10)

/**
 * Delete expired verification tokens from the database
 *
 * @returns Number of deleted tokens
 */
export async function cleanupExpiredVerificationTokens(): Promise<number> {
  try {
    // Calculate cutoff date (now - buffer hours)
    const cutoffDate = new Date()
    if (BUFFER_HOURS > 0) {
      cutoffDate.setHours(cutoffDate.getHours() - BUFFER_HOURS)
    }

    // Delete all verification tokens where expiresAt is before cutoff date
    const result = await prisma.verification.deleteMany({
      where: {
        expiresAt: {
          lt: cutoffDate,
        },
      },
    })

    return result.count
  } catch (error) {
    console.error('[Verification Token Cleanup] Failed to delete expired tokens:', error)
    throw error
  }
}

/**
 * Run cleanup job with logging and monitoring
 */
async function runCleanup() {
  const bufferInfo = BUFFER_HOURS > 0 ? ` (${BUFFER_HOURS}h grace period)` : ''
  console.log(`[Verification Token Cleanup] Starting cleanup job${bufferInfo}`)

  try {
    const deletedCount = await cleanupExpiredVerificationTokens()

    console.log(
      `[Verification Token Cleanup] ✅ Cleanup complete. Deleted ${deletedCount} expired tokens.`
    )

    // Log to monitoring/alerting system if available
    if (process.env.MONITORING_WEBHOOK_URL) {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'verification_token_cleanup',
          deletedCount,
          bufferHours: BUFFER_HOURS,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) =>
        console.error('[Verification Token Cleanup] Failed to send monitoring event:', err)
      )
    }

    return deletedCount
  } catch (error) {
    console.error('[Verification Token Cleanup] ❌ Cleanup job failed:', error)

    // Send error alert if webhook is configured
    if (process.env.MONITORING_WEBHOOK_URL) {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'verification_token_cleanup_error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
          /* ignore monitoring errors */
        })
    }

    throw error
  }
}

/**
 * Schedule cleanup job
 *
 * Runs daily at 3:30 AM server time (30 minutes after session cleanup)
 */
export function scheduleVerificationTokenCleanup() {
  // Cron expression: "30 3 * * *" = Every day at 3:30 AM
  cron.schedule('30 3 * * *', async () => {
    try {
      await runCleanup()
    } catch (error) {
      console.error('[Verification Token Cleanup] Scheduled cleanup failed:', error)
    }
  })

  const bufferInfo = BUFFER_HOURS > 0 ? `, ${BUFFER_HOURS}h grace period` : ''
  console.log(
    `[Verification Token Cleanup] ✅ Cleanup job scheduled (daily at 3:30 AM${bufferInfo})`
  )
}

/**
 * Run cleanup immediately (for manual execution)
 */
if (require.main === module) {
  runCleanup()
    .then((deletedCount) => {
      console.log(
        `[Verification Token Cleanup] Manual cleanup completed successfully (${deletedCount} deleted)`
      )
      process.exit(0)
    })
    .catch((error) => {
      console.error('[Verification Token Cleanup] Manual cleanup failed:', error)
      process.exit(1)
    })
}

export { runCleanup }
