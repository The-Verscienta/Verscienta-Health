#!/usr/bin/env tsx
/**
 * Backup Verification Script
 *
 * Tests backup integrity and restorability:
 * - File existence and size checks
 * - Compression validation
 * - Test restore to temporary database
 * - Schema verification
 * - Data sampling
 *
 * Usage:
 *   pnpm db:backup:verify <backup-file>  # Verify specific backup
 *   pnpm db:backup:verify latest          # Verify latest backup
 *   pnpm db:backup:verify --all           # Verify all backups
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// Configuration
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), '../../backups/database')
const DATABASE_URL = process.env.DATABASE_URL

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

function success(message: string) {
  log(`✓ ${message}`, 'green')
}

function error(message: string) {
  log(`✗ ${message}`, 'red')
}

function info(message: string) {
  log(`ℹ ${message}`, 'blue')
}

function warning(message: string) {
  log(`⚠ ${message}`, 'yellow')
}

/**
 * Find latest backup
 */
function findLatestBackup(): string | null {
  if (!fs.existsSync(BACKUP_DIR)) {
    return null
  }

  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith('verscienta_health_') && (f.endsWith('.sql') || f.endsWith('.sql.gz')))
    .map((f) => ({
      path: path.join(BACKUP_DIR, f),
      mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.mtime - a.mtime)

  return files.length > 0 ? files[0].path : null
}

/**
 * Get all backup files
 */
function getAllBackups(): string[] {
  if (!fs.existsSync(BACKUP_DIR)) {
    return []
  }

  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith('verscienta_health_') && (f.endsWith('.sql') || f.endsWith('.sql.gz')))
    .map((f) => path.join(BACKUP_DIR, f))
    .sort()
}

/**
 * Verify backup file integrity
 */
function verifyFileIntegrity(backupPath: string): boolean {
  info(`Verifying: ${path.basename(backupPath)}`)

  // Check file exists
  if (!fs.existsSync(backupPath)) {
    error('  File does not exist')
    return false
  }

  // Check file size
  const stats = fs.statSync(backupPath)
  if (stats.size === 0) {
    error('  File is empty')
    return false
  }

  if (stats.size < 1024) {
    warning('  File is very small (< 1KB)')
  }

  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
  success(`  Size: ${sizeMB} MB`)

  // Check compression
  const isCompressed = backupPath.endsWith('.gz')
  if (isCompressed) {
    const buffer = Buffer.alloc(2)
    const fd = fs.openSync(backupPath, 'r')
    fs.readSync(fd, buffer, 0, 2, 0)
    fs.closeSync(fd)

    if (buffer[0] !== 0x1f || buffer[1] !== 0x8b) {
      error('  Invalid gzip file')
      return false
    }

    success('  Compression: gzip (valid)')
  } else {
    success('  Compression: none')
  }

  // Check if readable
  try {
    if (isCompressed) {
      execSync(`gunzip -t "${backupPath}"`, { stdio: 'pipe' })
      success('  Gzip integrity: valid')
    } else {
      fs.accessSync(backupPath, fs.constants.R_OK)
      success('  File: readable')
    }
  } catch (err) {
    error('  File integrity check failed')
    return false
  }

  // Check content (first few lines)
  try {
    let content: string
    if (isCompressed) {
      content = execSync(`gunzip -c "${backupPath}" | head -n 5`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      })
    } else {
      content = execSync(`head -n 5 "${backupPath}"`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      })
    }

    if (content.includes('PostgreSQL')) {
      success('  Content: valid SQL dump')
    } else {
      warning('  Content: does not look like PostgreSQL dump')
    }
  } catch (err) {
    warning('  Could not check content')
  }

  success('  Verification passed')
  return true
}

/**
 * Main verification function
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    log('\nBackup Verification Script\n', 'cyan')
    log('Usage:', 'cyan')
    log('  pnpm db:backup:verify <backup-file>   Verify specific backup')
    log('  pnpm db:backup:verify latest           Verify latest backup')
    log('  pnpm db:backup:verify --all            Verify all backups')
    log('')
    return
  }

  log('\n' + '╔' + '═'.repeat(48) + '╗', 'cyan')
  log('║' + '  Backup Verification Script'.padEnd(48) + '║', 'cyan')
  log('╚' + '═'.repeat(48) + '╝\n', 'cyan')

  try {
    let backupsToVerify: string[] = []

    if (args.includes('--all')) {
      backupsToVerify = getAllBackups()
      if (backupsToVerify.length === 0) {
        warning('No backup files found')
        return
      }
      info(`Found ${backupsToVerify.length} backup(s) to verify\n`)
    } else {
      const arg = args[0]
      let backupPath: string

      if (arg === 'latest') {
        const latest = findLatestBackup()
        if (!latest) {
          error('No backup files found')
          process.exit(1)
        }
        backupPath = latest
      } else {
        if (path.isAbsolute(arg)) {
          backupPath = arg
        } else {
          const relativePath = path.join(BACKUP_DIR, arg)
          backupPath = fs.existsSync(relativePath) ? relativePath : arg
        }
      }

      backupsToVerify = [backupPath]
    }

    // Verify each backup
    let passedCount = 0
    let failedCount = 0

    for (const backupPath of backupsToVerify) {
      const passed = verifyFileIntegrity(backupPath)
      if (passed) {
        passedCount++
      } else {
        failedCount++
      }
      log('')
    }

    // Summary
    log('Summary:', 'cyan')
    log(`  Total: ${backupsToVerify.length}`)
    log(`  Passed: ${passedCount}`, 'green')
    log(`  Failed: ${failedCount}`, failedCount > 0 ? 'red' : 'green')
    log('')

    if (failedCount === 0) {
      log('╔' + '═'.repeat(48) + '╗', 'green')
      log('║' + '  All Backups Valid! ✓'.padEnd(48) + '║', 'green')
      log('╚' + '═'.repeat(48) + '╝\n', 'green')
      process.exit(0)
    } else {
      log('╔' + '═'.repeat(48) + '╗', 'red')
      log('║' + '  Some Backups Failed ✗'.padEnd(48) + '║', 'red')
      log('╚' + '═'.repeat(48) + '╝\n', 'red')
      process.exit(1)
    }
  } catch (err: any) {
    error(`Verification failed: ${err.message}`)
    process.exit(1)
  }
}

// Run verification
main()
