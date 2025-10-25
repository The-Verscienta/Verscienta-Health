/**
 * API Request Logs Cleanup Cron Job
 *
 * Automatically deletes old API request logs to comply with data retention policies
 * and prevent database bloat.
 *
 * Schedule: Daily at 2:00 AM
 * Retention: 90 days (configurable via environment variable)
 *
 * Usage:
 *   - Add to cron/index.ts
 *   - Or run manually: pnpm tsx lib/cron/cleanup-api-logs.ts
 */

import cron from 'node-cron'
import { cleanupOldLogs } from '../api-request-logger'

/**
 * Retention period in days
 * Can be overridden via API_LOGS_RETENTION_DAYS environment variable
 */
const RETENTION_DAYS = parseInt(process.env.API_LOGS_RETENTION_DAYS || '90', 10)

/**
 * Run cleanup job
 */
async function runCleanup() {
  console.log(`[API Logs Cleanup] Starting cleanup job (retention: ${RETENTION_DAYS} days)`)

  try {
    const deletedCount = await cleanupOldLogs(RETENTION_DAYS)

    console.log(
      `[API Logs Cleanup] ✅ Cleanup complete. Deleted ${deletedCount} logs older than ${RETENTION_DAYS} days.`
    )

    // Log to monitoring/alerting system if available
    if (process.env.MONITORING_WEBHOOK_URL) {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'api_logs_cleanup',
          deletedCount,
          retentionDays: RETENTION_DAYS,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => console.error('[API Logs Cleanup] Failed to send monitoring event:', err))
    }
  } catch (error) {
    console.error('[API Logs Cleanup] ❌ Cleanup job failed:', error)

    // Send error alert if webhook is configured
    if (process.env.MONITORING_WEBHOOK_URL) {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'api_logs_cleanup_error',
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
 * Runs daily at 2:00 AM server time
 */
export function scheduleApiLogsCleanup() {
  // Cron expression: "0 2 * * *" = Every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    await runCleanup()
  })

  console.log(
    `[API Logs Cleanup] ✅ Cleanup job scheduled (daily at 2:00 AM, retention: ${RETENTION_DAYS} days)`
  )
}

/**
 * Run cleanup immediately (for manual execution)
 */
if (require.main === module) {
  runCleanup()
    .then(() => {
      console.log('[API Logs Cleanup] Manual cleanup completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('[API Logs Cleanup] Manual cleanup failed:', error)
      process.exit(1)
    })
}

export { runCleanup }
