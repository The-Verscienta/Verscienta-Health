/**
 * Cron Job Registration System
 *
 * Centralized initialization and management for all scheduled cron jobs.
 * This file imports all cron job schedulers and provides a single
 * initialization function to start all jobs.
 *
 * Available Cron Jobs:
 * - Database Backup: Daily at 1:00 AM (automated database backups with rotation)
 * - Citation Sync: Weekly on Sunday at 2:00 AM (syncs PubMed research citations)
 * - API Logs Cleanup: Daily at 2:00 AM (removes old API request logs)
 * - Password History Cleanup: Daily at 3:00 AM (removes old password history)
 * - Session Cleanup: Daily at 3:00 AM (removes expired sessions)
 * - Verification Token Cleanup: Daily at 3:30 AM (removes expired tokens)
 * - Algolia Sync: Every 6 hours (backup sync for search indexes)
 * - Perenual Import: Every minute (progressive 10K+ plant database import, when enabled)
 * - Trefle Sync: Weekly on Wednesday at 3:00 AM (enriches herbs with botanical data)
 * - Trefle Import: Every minute (progressive 1M+ plant database import, when enabled)
 * - Circuit Breaker Monitoring: Every 30 seconds (monitors API health and sends alerts)
 *
 * Usage:
 *   import { initializeCronJobs } from '@/lib/cron'
 *   initializeCronJobs()
 *
 * Environment Variables:
 *   - ENABLE_CRON_JOBS: Set to 'false' to disable all cron jobs (default: true)
 *   - CRON_JOBS: Comma-separated list of specific jobs to enable (default: all)
 *     Example: "algolia,api-logs,sessions" (only runs specified jobs)
 */

import { scheduleAlgoliaSync } from './sync-algolia'
import { scheduleApiLogsCleanup } from './cleanup-api-logs'
import { schedulePasswordHistoryCleanup } from './cleanup-password-history'
import { scheduleSessionCleanup } from './cleanup-sessions'
import { scheduleVerificationTokenCleanup } from './cleanup-verification-tokens'
import { schedulePerenualImport } from './import-perenual-data'
import { scheduleTrefleSync } from './sync-trefle-data'
import { scheduleTrefleImport } from './import-trefle-data'
import { scheduleBackupDatabase } from './backup-database'
import { scheduleCitationSync } from './sync-citations'
import { scheduleCircuitBreakerMonitoring } from '@/lib/monitoring'

/**
 * Available cron jobs with their scheduling functions
 */
const CRON_JOBS = {
  algolia: {
    name: 'Algolia Sync',
    schedule: scheduleAlgoliaSync,
    description: 'Syncs all collections to Algolia every 6 hours',
  },
  'api-logs': {
    name: 'API Logs Cleanup',
    schedule: scheduleApiLogsCleanup,
    description: 'Removes old API logs daily at 2:00 AM',
  },
  'password-history': {
    name: 'Password History Cleanup',
    schedule: schedulePasswordHistoryCleanup,
    description: 'Removes old password history daily at 3:00 AM',
  },
  sessions: {
    name: 'Session Cleanup',
    schedule: scheduleSessionCleanup,
    description: 'Removes expired sessions daily at 3:00 AM',
  },
  'verification-tokens': {
    name: 'Verification Token Cleanup',
    schedule: scheduleVerificationTokenCleanup,
    description: 'Removes expired verification tokens daily at 3:30 AM',
  },
  'perenual-import': {
    name: 'Perenual Plant Database Import',
    schedule: schedulePerenualImport,
    description: 'Progressively imports plant data from Perenual API every minute (when enabled)',
  },
  'trefle-sync': {
    name: 'Trefle Botanical Data Sync',
    schedule: scheduleTrefleSync,
    description: 'Enriches existing herbs with Trefle botanical data every Wednesday at 3:00 AM',
  },
  'trefle-import': {
    name: 'Trefle Plant Database Import',
    schedule: scheduleTrefleImport,
    description: 'Progressively imports 1M+ plants from Trefle API every minute (when enabled)',
  },
  backup: {
    name: 'Database Backup',
    schedule: scheduleBackupDatabase,
    description: 'Creates daily database backups at 1:00 AM with automatic rotation',
  },
  citations: {
    name: 'Citation Sync',
    schedule: scheduleCitationSync,
    description: 'Syncs evidence-based research citations from PubMed weekly on Sunday at 2:00 AM',
  },
  'circuit-breaker-monitoring': {
    name: 'Circuit Breaker Monitoring',
    schedule: scheduleCircuitBreakerMonitoring,
    description: 'Monitors botanical API circuit breakers and sends alerts every 30 seconds',
  },
} as const

type CronJobName = keyof typeof CRON_JOBS

/**
 * Check if cron jobs are enabled globally
 */
function areCronJobsEnabled(): boolean {
  const enabled = process.env.ENABLE_CRON_JOBS
  return enabled !== 'false' && enabled !== '0'
}

/**
 * Get list of enabled cron jobs from environment variable
 * Returns all jobs if CRON_JOBS is not set or empty
 */
function getEnabledJobNames(): CronJobName[] {
  const cronJobsEnv = process.env.CRON_JOBS?.trim()

  // If not specified or empty, enable all jobs
  if (!cronJobsEnv) {
    return Object.keys(CRON_JOBS) as CronJobName[]
  }

  // Parse comma-separated list and validate job names
  const requestedJobs = cronJobsEnv
    .split(',')
    .map((job) => job.trim())
    .filter(Boolean)

  const validJobs = requestedJobs.filter((job) => {
    const isValid = job in CRON_JOBS
    if (!isValid) {
      console.warn(
        `[Cron] ⚠️  Unknown cron job "${job}" specified in CRON_JOBS environment variable. Valid options: ${Object.keys(CRON_JOBS).join(', ')}`
      )
    }
    return isValid
  }) as CronJobName[]

  return validJobs
}

/**
 * Initialize and start all enabled cron jobs
 *
 * This function should be called once during application startup.
 * It will register and start all cron jobs based on environment configuration.
 *
 * @returns Number of cron jobs successfully initialized
 */
export function initializeCronJobs(): number {
  console.log('\n[Cron] 🚀 Initializing cron jobs...')

  // Check if cron jobs are globally disabled
  if (!areCronJobsEnabled()) {
    console.log('[Cron] ⏸️  Cron jobs disabled via ENABLE_CRON_JOBS environment variable')
    return 0
  }

  // Get list of enabled jobs
  const enabledJobNames = getEnabledJobNames()

  if (enabledJobNames.length === 0) {
    console.log('[Cron] ⚠️  No valid cron jobs configured to run')
    return 0
  }

  console.log(`[Cron] 📋 Scheduling ${enabledJobNames.length} cron jobs...`)

  // Initialize each enabled job
  let successCount = 0
  for (const jobName of enabledJobNames) {
    const job = CRON_JOBS[jobName]

    try {
      console.log(`[Cron] ⏰ Scheduling: ${job.name}`)
      console.log(`[Cron]    → ${job.description}`)

      job.schedule()
      successCount++
    } catch (error) {
      console.error(`[Cron] ❌ Failed to schedule ${job.name}:`, error)
    }
  }

  console.log(`\n[Cron] ✅ Successfully initialized ${successCount}/${enabledJobNames.length} cron jobs\n`)

  return successCount
}

/**
 * List all available cron jobs
 *
 * Useful for documentation and debugging purposes
 */
export function listAvailableCronJobs(): void {
  console.log('\n[Cron] 📋 Available Cron Jobs:\n')

  for (const [jobName, job] of Object.entries(CRON_JOBS)) {
    console.log(`  ${jobName}:`)
    console.log(`    Name: ${job.name}`)
    console.log(`    Description: ${job.description}\n`)
  }
}

/**
 * Export job names for external use
 */
export { type CronJobName }

/**
 * Export individual schedulers (for manual/on-demand usage)
 */
export {
  scheduleAlgoliaSync,
  scheduleApiLogsCleanup,
  schedulePasswordHistoryCleanup,
  scheduleSessionCleanup,
  scheduleVerificationTokenCleanup,
  schedulePerenualImport,
  scheduleTrefleSync,
  scheduleTrefleImport,
  scheduleBackupDatabase,
  scheduleCitationSync,
  scheduleCircuitBreakerMonitoring,
}

/**
 * Manual execution support
 * Usage: pnpm tsx lib/cron/index.ts
 */
if (require.main === module) {
  console.log('[Cron] Manual initialization mode\n')
  listAvailableCronJobs()

  const initialized = initializeCronJobs()

  if (initialized > 0) {
    console.log('[Cron] ✅ Cron jobs are now running. Press Ctrl+C to stop.\n')
    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\n[Cron] 👋 Shutting down cron jobs...')
      process.exit(0)
    })
  } else {
    console.log('[Cron] ⚠️  No cron jobs initialized. Exiting.\n')
    process.exit(1)
  }
}
