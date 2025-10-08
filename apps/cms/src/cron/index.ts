/* eslint-disable no-undef */
import cron from 'node-cron'
import type { Payload } from 'payload'
import { backupDatabaseJob } from './jobs/backupDatabase'
import { cleanupCacheJob } from './jobs/cleanupCache'
import { generateSitemapJob } from './jobs/generateSitemap'
import { importExternalDataJob } from './jobs/importExternalData'
import { importPerenualDataJob } from './jobs/importPerenualData'
import { importTrefleDataJob } from './jobs/importTrefleData'
import { sendDigestEmailsJob } from './jobs/sendDigestEmails'
// Import job modules
import { syncAlgoliaJob } from './jobs/syncAlgolia'
import { syncTrefleDataJob } from './jobs/syncTrefleData'
import { validateHerbDataJob } from './jobs/validateHerbData'

interface CronJob {
  name: string
  schedule: string
  job: (payload: Payload) => Promise<void>
  enabled: boolean
}

// Define all cron jobs
const cronJobs: CronJob[] = [
  {
    name: 'Sync Algolia Index',
    schedule: '0 */6 * * *', // Every 6 hours
    job: syncAlgoliaJob,
    enabled: true,
  },
  {
    name: 'Validate Herb Data',
    schedule: '0 2 * * *', // Daily at 2 AM
    job: validateHerbDataJob,
    enabled: true,
  },
  {
    name: 'Import External Data',
    schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
    job: importExternalDataJob,
    enabled: process.env.ENABLE_DATA_IMPORT === 'true',
  },
  {
    name: 'Sync Trefle Botanical Data',
    schedule: '0 3 * * 3', // Weekly on Wednesday at 3 AM
    job: syncTrefleDataJob,
    enabled: !!process.env.TREFLE_API_KEY,
  },
  {
    name: 'Import Trefle Plant Database',
    schedule: '* * * * *', // Every minute for progressive import
    job: importTrefleDataJob,
    enabled: !!process.env.TREFLE_API_KEY && process.env.ENABLE_TREFLE_IMPORT === 'true',
  },
  {
    name: 'Import Perenual Plant Database',
    schedule: '* * * * *', // Every minute for progressive import
    job: importPerenualDataJob,
    enabled: !!process.env.PERENUAL_API_KEY && process.env.ENABLE_PERENUAL_IMPORT === 'true',
  },
  {
    name: 'Cleanup Cache',
    schedule: '0 4 * * *', // Daily at 4 AM
    job: cleanupCacheJob,
    enabled: true,
  },
  {
    name: 'Backup Database',
    schedule: '0 1 * * *', // Daily at 1 AM
    job: backupDatabaseJob,
    enabled: process.env.ENABLE_AUTO_BACKUP === 'true',
  },
  {
    name: 'Generate Sitemap',
    schedule: '0 5 * * *', // Daily at 5 AM
    job: generateSitemapJob,
    enabled: true,
  },
  {
    name: 'Send Digest Emails',
    schedule: '0 8 * * 1', // Weekly on Monday at 8 AM
    job: sendDigestEmailsJob,
    enabled: process.env.ENABLE_DIGEST_EMAILS === 'true',
  },
]

// Initialize all cron jobs
export function initializeCronJobs(payload: Payload): void {
  console.log('🕐 Initializing cron jobs...')

  cronJobs.forEach(({ name, schedule, job, enabled }) => {
    if (!enabled) {
      console.log(`⏭️  Skipping disabled job: ${name}`)
      return
    }

    // Validate cron schedule
    if (!cron.validate(schedule)) {
      console.error(`❌ Invalid cron schedule for ${name}: ${schedule}`)
      return
    }

    // Schedule the job
    cron.schedule(schedule, async () => {
      console.log(`▶️  Running job: ${name}`)
      const startTime = Date.now()

      try {
        await job(payload)
        const duration = Date.now() - startTime
        console.log(`✅ Job completed: ${name} (${duration}ms)`)
      } catch (error) {
        console.error(`❌ Job failed: ${name}`, error)

        // Send alert for failed jobs
        const { sendJobFailureAlert } = await import('../lib/email')
        await sendJobFailureAlert({
          jobName: name,
          error: error instanceof Error ? error.message : String(error),
          stackTrace: error instanceof Error ? error.stack : undefined,
        })
      }
    })

    console.log(`✓ Scheduled: ${name} (${schedule})`)
  })

  console.log(`🎯 ${cronJobs.filter((j) => j.enabled).length} cron jobs initialized`)
}

// Manual job trigger (for testing or admin panel)
export async function triggerJob(
  payload: Payload,
  jobName: string
): Promise<{ success: boolean; message: string; duration?: number }> {
  const job = cronJobs.find((j) => j.name === jobName)

  if (!job) {
    return {
      success: false,
      message: `Job not found: ${jobName}`,
    }
  }

  console.log(`🚀 Manually triggering job: ${jobName}`)
  const startTime = Date.now()

  try {
    await job.job(payload)
    const duration = Date.now() - startTime

    return {
      success: true,
      message: `Job completed successfully`,
      duration,
    }
  } catch (error) {
    console.error(`Error running job ${jobName}:`, error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Get list of all jobs with their schedules
export function listCronJobs(): Array<{
  name: string
  schedule: string
  enabled: boolean
  nextRun?: Date
}> {
  const cronParser = require('cron-parser')

  return cronJobs.map(({ name, schedule, enabled }) => {
    let nextRun: Date | undefined

    if (enabled) {
      try {
        // Parse cron schedule and get next execution time
        const interval = cronParser.parseExpression(schedule)
        nextRun = interval.next().toDate()
      } catch (error) {
        console.error(`Failed to parse cron schedule for ${name}:`, error)
      }
    }

    return {
      name,
      schedule,
      enabled,
      nextRun,
    }
  })
}
