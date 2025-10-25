/**
 * Password History Cleanup Cron Job
 *
 * Automatically deletes old password history entries to comply with data retention policies
 * and prevent database bloat, while maintaining the last 5 passwords for HIPAA compliance.
 *
 * Schedule: Daily at 3:00 AM
 * Retention: 365 days (1 year), but always keep last 5 passwords
 *
 * Usage:
 *   - Add to cron/index.ts: schedulePasswordHistoryCleanup()
 *   - Or run manually: pnpm tsx lib/cron/cleanup-password-history.ts
 */

import cron from 'node-cron'
import { cleanupOldPasswordHistory } from '../password-history'

/**
 * Retention period in days (365 days = 1 year)
 * Can be overridden via PASSWORD_HISTORY_RETENTION_DAYS environment variable
 */
const RETENTION_DAYS = parseInt(process.env.PASSWORD_HISTORY_RETENTION_DAYS || '365', 10)

/**
 * Run cleanup job
 */
async function runCleanup() {
  console.log(
    `[Password History Cleanup] Starting cleanup job (retention: ${RETENTION_DAYS} days, keeping last 5 passwords)`
  )

  try {
    const deletedCount = await cleanupOldPasswordHistory(RETENTION_DAYS)

    console.log(
      `[Password History Cleanup] ✅ Cleanup complete. Deleted ${deletedCount} old password history entries (older than ${RETENTION_DAYS} days).`
    )

    // Log to monitoring/alerting system if available
    if (process.env.MONITORING_WEBHOOK_URL) {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'password_history_cleanup',
          deletedCount,
          retentionDays: RETENTION_DAYS,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) =>
        console.error('[Password History Cleanup] Failed to send monitoring event:', err)
      )
    }
  } catch (error) {
    console.error('[Password History Cleanup] ❌ Cleanup job failed:', error)

    // Send error alert if webhook is configured
    if (process.env.MONITORING_WEBHOOK_URL) {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'password_history_cleanup_error',
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
export function schedulePasswordHistoryCleanup() {
  // Cron expression: "0 3 * * *" = Every day at 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    await runCleanup()
  })

  console.log(
    `[Password History Cleanup] ✅ Cleanup job scheduled (daily at 3:00 AM, retention: ${RETENTION_DAYS} days, keeping last 5 passwords)`
  )
}

/**
 * Run cleanup immediately (for manual execution)
 */
if (require.main === module) {
  runCleanup()
    .then(() => {
      console.log('[Password History Cleanup] Manual cleanup completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('[Password History Cleanup] Manual cleanup failed:', error)
      process.exit(1)
    })
}

export { runCleanup }
