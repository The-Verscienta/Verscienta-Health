/**
 * Database Backup Cron Job
 *
 * Schedule: Daily at 1:00 AM (or custom via BACKUP_CRON_SCHEDULE)
 * Runs automated database backups with rotation
 */

import * as cron from 'node-cron'
import { execSync } from 'child_process'
import * as path from 'path'

// Configuration
const BACKUP_ENABLED = process.env.BACKUP_ENABLED !== 'false'
const BACKUP_SCHEDULE = process.env.BACKUP_CRON_SCHEDULE || '0 1 * * *' // Daily at 1 AM
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), '../../backups/database')

/**
 * Run database backup
 */
async function runBackup(): Promise<void> {
  console.log('[BACKUP] Starting database backup...')

  try {
    // Run backup script
    const command = 'tsx scripts/db/backup.ts --verify'
    execSync(command, {
      cwd: path.join(__dirname, '../..'),
      stdio: 'inherit',
    })

    console.log('[BACKUP] Backup completed successfully')

    // Run rotation after backup
    try {
      const rotateCommand = 'tsx scripts/db/backup-rotate.ts'
      execSync(rotateCommand, {
        cwd: path.join(__dirname, '../..'),
        stdio: 'inherit',
      })
      console.log('[BACKUP] Rotation completed')
    } catch (rotateErr) {
      console.error('[BACKUP] Rotation failed:', rotateErr)
      // Don't throw - backup succeeded even if rotation failed
    }
  } catch (error) {
    console.error('[BACKUP] Backup failed:', error)
    throw error
  }
}

/**
 * Schedule database backup cron job
 */
export function scheduleBackupDatabase(): void {
  if (!BACKUP_ENABLED) {
    console.log('[BACKUP] Database backups are disabled (BACKUP_ENABLED=false)')
    return
  }

  console.log(`[BACKUP] Scheduling database backups: ${BACKUP_SCHEDULE}`)
  console.log(`[BACKUP] Backup directory: ${BACKUP_DIR}`)

  cron.schedule(BACKUP_SCHEDULE, async () => {
    try {
      await runBackup()
    } catch (error) {
      console.error('[BACKUP] Cron job failed:', error)
      // TODO: Send notification (email/Slack) about backup failure
    }
  })

  console.log('[BACKUP] Database backup cron job scheduled')
}

/**
 * Run backup immediately (for testing)
 */
export async function runBackupNow(): Promise<void> {
  if (!BACKUP_ENABLED) {
    throw new Error('Backups are disabled')
  }

  return runBackup()
}
