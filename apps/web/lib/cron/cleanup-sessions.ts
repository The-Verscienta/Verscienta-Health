/**
 * Expired Sessions Cleanup Cron Job
 *
 * Automatically deletes expired user sessions to maintain database health,
 * improve query performance, and comply with security best practices.
 *
 * Schedule: Daily at 3:00 AM
 * Retention: Sessions are deleted immediately after expiration
 *
 * Security Benefits:
 * - Prevents session table bloat
 * - Improves authentication query performance
 * - Reduces attack surface (no stale sessions)
 * - Complies with HIPAA session management requirements
 *
 * Performance:
 * - Uses indexed query (Session.expiresAt index)
 * - Efficient batch deletion
 * - Minimal database load
 *
 * Usage:
 *   - Add to cron/index.ts: scheduleSessionCleanup()
 *   - Or run manually: pnpm tsx lib/cron/cleanup-sessions.ts
 */

import cron from 'node-cron'
import { prisma } from '../prisma'

/**
 * Additional buffer time in hours before deletion
 * Keeps expired sessions for a short grace period (useful for debugging)
 * Can be overridden via SESSION_CLEANUP_BUFFER_HOURS environment variable
 */
const BUFFER_HOURS = parseInt(process.env.SESSION_CLEANUP_BUFFER_HOURS || '0', 10)

/**
 * Delete expired sessions from the database
 *
 * @returns Number of deleted sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    // Calculate cutoff date (now - buffer hours)
    const cutoffDate = new Date()
    if (BUFFER_HOURS > 0) {
      cutoffDate.setHours(cutoffDate.getHours() - BUFFER_HOURS)
    }

    // Delete all sessions where expiresAt is before cutoff date
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: cutoffDate,
        },
      },
    })

    return result.count
  } catch (error) {
    console.error('[Session Cleanup] Failed to delete expired sessions:', error)
    throw error
  }
}

/**
 * Run cleanup job with logging and monitoring
 */
async function runCleanup() {
  const bufferInfo = BUFFER_HOURS > 0 ? ` (${BUFFER_HOURS}h grace period)` : ''
  console.log(`[Session Cleanup] Starting cleanup job${bufferInfo}`)

  try {
    const deletedCount = await cleanupExpiredSessions()

    console.log(
      `[Session Cleanup] ✅ Cleanup complete. Deleted ${deletedCount} expired sessions.`
    )

    // Log to monitoring/alerting system if available
    if (process.env.MONITORING_WEBHOOK_URL) {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'session_cleanup',
          deletedCount,
          bufferHours: BUFFER_HOURS,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) =>
        console.error('[Session Cleanup] Failed to send monitoring event:', err)
      )
    }

    return deletedCount
  } catch (error) {
    console.error('[Session Cleanup] ❌ Cleanup job failed:', error)

    // Send error alert if webhook is configured
    if (process.env.MONITORING_WEBHOOK_URL) {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'session_cleanup_error',
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
 * Runs daily at 3:00 AM server time
 */
export function scheduleSessionCleanup() {
  // Cron expression: "0 3 * * *" = Every day at 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      await runCleanup()
    } catch (error) {
      console.error('[Session Cleanup] Scheduled cleanup failed:', error)
    }
  })

  const bufferInfo = BUFFER_HOURS > 0 ? `, ${BUFFER_HOURS}h grace period` : ''
  console.log(`[Session Cleanup] ✅ Cleanup job scheduled (daily at 3:00 AM${bufferInfo})`)
}

/**
 * Run cleanup immediately (for manual execution)
 */
if (require.main === module) {
  runCleanup()
    .then((deletedCount) => {
      console.log(`[Session Cleanup] Manual cleanup completed successfully (${deletedCount} deleted)`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('[Session Cleanup] Manual cleanup failed:', error)
      process.exit(1)
    })
}

export { runCleanup }
