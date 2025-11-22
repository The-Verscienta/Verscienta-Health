#!/usr/bin/env tsx
/**
 * Backup Rotation Script
 *
 * Implements GFS (Grandfather-Father-Son) backup rotation:
 * - Daily backups: Keep last 7 days
 * - Weekly backups: Keep last 4 weeks
 * - Monthly backups: Keep last 12 months
 *
 * Usage:
 *   pnpm db:backup:rotate           # Run rotation
 *   pnpm db:backup:rotate --dry-run # Show what would be deleted
 */

import * as fs from 'fs'
import * as path from 'path'

// Configuration
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), '../../backups/database')
const DAILY_RETENTION = parseInt(process.env.BACKUP_DAILY_RETENTION || '7', 10)
const WEEKLY_RETENTION = parseInt(process.env.BACKUP_WEEKLY_RETENTION || '4', 10)
const MONTHLY_RETENTION = parseInt(process.env.BACKUP_MONTHLY_RETENTION || '12', 10)

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

interface BackupFile {
  name: string
  path: string
  mtime: Date
  size: number
}

/**
 * Get all backup files
 */
function getBackupFiles(): BackupFile[] {
  if (!fs.existsSync(BACKUP_DIR)) {
    return []
  }

  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith('verscienta_health_') && (f.endsWith('.sql') || f.endsWith('.sql.gz')))
    .filter((f) => !f.includes('pre_restore_')) // Exclude pre-restore backups
    .map((f) => {
      const filePath = path.join(BACKUP_DIR, f)
      const stats = fs.statSync(filePath)
      return {
        name: f,
        path: filePath,
        mtime: stats.mtime,
        size: stats.size,
      }
    })
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime()) // Newest first
}

/**
 * Categorize backups by age
 */
function categorizeBackups(backups: BackupFile[]) {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  const oneWeek = 7 * oneDay
  const oneMonth = 30 * oneDay

  const daily: BackupFile[] = []
  const weekly: BackupFile[] = []
  const monthly: BackupFile[] = []
  const toDelete: BackupFile[] = []

  for (const backup of backups) {
    const age = now - backup.mtime.getTime()

    if (age < DAILY_RETENTION * oneDay) {
      // Keep as daily backup
      daily.push(backup)
    } else if (age < WEEKLY_RETENTION * oneWeek) {
      // Keep one per week
      const weekNumber = Math.floor(age / oneWeek)
      const existingWeekly = weekly.find((b) => {
        const bAge = now - b.mtime.getTime()
        return Math.floor(bAge / oneWeek) === weekNumber
      })

      if (!existingWeekly) {
        weekly.push(backup)
      } else {
        toDelete.push(backup)
      }
    } else if (age < MONTHLY_RETENTION * oneMonth) {
      // Keep one per month
      const monthNumber = Math.floor(age / oneMonth)
      const existingMonthly = monthly.find((b) => {
        const bAge = now - b.mtime.getTime()
        return Math.floor(bAge / oneMonth) === monthNumber
      })

      if (!existingMonthly) {
        monthly.push(backup)
      } else {
        toDelete.push(backup)
      }
    } else {
      // Too old, delete
      toDelete.push(backup)
    }
  }

  return { daily, weekly, monthly, toDelete }
}

/**
 * Format file size
 */
function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return mb.toFixed(2) + ' MB'
}

/**
 * Format date
 */
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * Main rotation function
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')

  log('\n' + '╔' + '═'.repeat(48) + '╗', 'cyan')
  log('║' + '  Backup Rotation Script'.padEnd(48) + '║', 'cyan')
  log('╚' + '═'.repeat(48) + '╝\n', 'cyan')

  if (dryRun) {
    log('⚠ DRY RUN MODE - No files will be deleted\n', 'yellow')
  }

  try {
    // Get all backup files
    const backups = getBackupFiles()

    if (backups.length === 0) {
      log('No backup files found', 'yellow')
      return
    }

    log(`Found ${backups.length} backup file(s)\n`, 'blue')

    // Categorize backups
    const { daily, weekly, monthly, toDelete } = categorizeBackups(backups)

    // Display retention summary
    log('Retention Policy:', 'cyan')
    log(`  Daily:   Keep ${DAILY_RETENTION} days`)
    log(`  Weekly:  Keep ${WEEKLY_RETENTION} weeks`)
    log(`  Monthly: Keep ${MONTHLY_RETENTION} months`)
    log('')

    // Display categorization
    log('Backup Distribution:', 'cyan')
    log(`  Daily backups:   ${daily.length} files (${formatSize(daily.reduce((sum, b) => sum + b.size, 0))})`)
    log(`  Weekly backups:  ${weekly.length} files (${formatSize(weekly.reduce((sum, b) => sum + b.size, 0))})`)
    log(`  Monthly backups: ${monthly.length} files (${formatSize(monthly.reduce((sum, b) => sum + b.size, 0))})`)
    log(`  To delete:       ${toDelete.length} files (${formatSize(toDelete.reduce((sum, b) => sum + b.size, 0))})`)
    log('')

    // Show files to delete
    if (toDelete.length > 0) {
      log('Files to delete:', 'yellow')
      for (const backup of toDelete) {
        log(`  - ${backup.name} (${formatSize(backup.size)}, ${formatDate(backup.mtime)})`, 'yellow')
      }
      log('')

      // Delete files (unless dry run)
      if (!dryRun) {
        let deletedCount = 0
        let deletedSize = 0

        for (const backup of toDelete) {
          try {
            fs.unlinkSync(backup.path)
            deletedCount++
            deletedSize += backup.size
            log(`✓ Deleted: ${backup.name}`, 'green')
          } catch (err: any) {
            log(`✗ Failed to delete ${backup.name}: ${err.message}`, 'red')
          }
        }

        log('')
        log(`Deleted ${deletedCount} file(s) (${formatSize(deletedSize)})`, 'green')
      } else {
        log('DRY RUN: No files were deleted', 'yellow')
      }
    } else {
      log('No files need to be deleted', 'green')
    }

    // Final summary
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0)
    const keptSize = totalSize - toDelete.reduce((sum, b) => sum + b.size, 0)

    log('')
    log('Summary:', 'cyan')
    log(`  Total backups: ${backups.length} (${formatSize(totalSize)})`)
    log(`  Kept: ${backups.length - toDelete.length} (${formatSize(keptSize)})`)
    log(`  ${dryRun ? 'Would delete' : 'Deleted'}: ${toDelete.length} (${formatSize(toDelete.reduce((sum, b) => sum + b.size, 0))})`)
    log('')

    log('╔' + '═'.repeat(48) + '╗', 'green')
    log('║' + '  Rotation Complete! ✓'.padEnd(48) + '║', 'green')
    log('╚' + '═'.repeat(48) + '╝\n', 'green')

    process.exit(0)
  } catch (err: any) {
    log('\n' + '╔' + '═'.repeat(48) + '╗', 'red')
    log('║' + '  Rotation Failed ✗'.padEnd(48) + '║', 'red')
    log('╚' + '═'.repeat(48) + '╝\n', 'red')

    log(`Error: ${err.message}`, 'red')
    process.exit(1)
  }
}

// Run rotation
main()
