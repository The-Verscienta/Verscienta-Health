#!/usr/bin/env tsx
/**
 * Database Restore Script
 *
 * Restores PostgreSQL database from backup with:
 * - Backup file validation
 * - Safety confirmations
 * - Pre-restore backup (optional)
 * - Decompression support
 * - Connection verification
 * - Post-restore validation
 *
 * Usage:
 *   pnpm db:restore <backup-file>              # Restore from backup
 *   pnpm db:restore <backup-file> --yes        # Skip confirmation
 *   pnpm db:restore <backup-file> --no-backup  # Skip pre-restore backup
 *   pnpm db:restore latest                     # Restore from latest backup
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

// Configuration
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), '../../backups/database')
const DATABASE_URL = process.env.DATABASE_URL

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
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
 * Parse DATABASE_URL
 */
function parseDatabaseUrl(url: string): {
  host: string
  port: string
  database: string
  username: string
  password: string
} {
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/
  const match = url.match(regex)

  if (!match) {
    throw new Error('Invalid DATABASE_URL format')
  }

  return {
    username: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5],
  }
}

/**
 * Find latest backup file
 */
function findLatestBackup(): string | null {
  if (!fs.existsSync(BACKUP_DIR)) {
    return null
  }

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('verscienta_health_') && (f.endsWith('.sql') || f.endsWith('.sql.gz')))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.mtime - a.mtime) // Sort by newest first

  return files.length > 0 ? files[0].path : null
}

/**
 * Validate backup file
 */
function validateBackupFile(backupPath: string): boolean {
  info('Validating backup file...')

  if (!fs.existsSync(backupPath)) {
    error(`Backup file not found: ${backupPath}`)
    return false
  }

  const stats = fs.statSync(backupPath)

  if (stats.size === 0) {
    error('Backup file is empty')
    return false
  }

  if (stats.size < 1024) {
    warning('Backup file is very small (< 1KB)')
  }

  // Check if compressed
  const isCompressed = backupPath.endsWith('.gz')
  if (isCompressed) {
    const buffer = Buffer.alloc(2)
    const fd = fs.openSync(backupPath, 'r')
    fs.readSync(fd, buffer, 0, 2, 0)
    fs.closeSync(fd)

    if (buffer[0] !== 0x1f || buffer[1] !== 0x8b) {
      error('File is not a valid gzip file')
      return false
    }
  }

  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)
  success(`Backup file is valid (${sizeMB} MB)`)

  return true
}

/**
 * Ask for user confirmation
 */
async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y')
    })
  })
}

/**
 * Create pre-restore backup
 */
function createPreRestoreBackup(): string {
  info('Creating pre-restore backup for safety...')

  try {
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `pre_restore_${timestamp}.sql.gz`

    // Ensure backup dir exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    const backupPath = path.join(BACKUP_DIR, filename)
    const dbConfig = parseDatabaseUrl(DATABASE_URL!)

    const env = {
      ...process.env,
      PGPASSWORD: dbConfig.password,
    }

    const command = `pg_dump --host=${dbConfig.host} --port=${dbConfig.port} --username=${dbConfig.username} --format=plain --no-owner --no-acl ${dbConfig.database} | gzip > "${backupPath}"`

    execSync(command, { env, shell: true })

    success(`Pre-restore backup created: ${filename}`)
    return backupPath
  } catch (err: any) {
    warning(`Pre-restore backup failed: ${err.message}`)
    warning('Continuing anyway, but you should have a manual backup!')
    return ''
  }
}

/**
 * Restore database from backup
 */
function restoreDatabase(backupPath: string) {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const dbConfig = parseDatabaseUrl(DATABASE_URL)
  const isCompressed = backupPath.endsWith('.gz')

  info('Restoring database...')
  info(`Target: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`)

  try {
    const env = {
      ...process.env,
      PGPASSWORD: dbConfig.password,
    }

    if (isCompressed) {
      // Decompress and pipe to psql
      const command = `gunzip -c "${backupPath}" | psql --host=${dbConfig.host} --port=${dbConfig.port} --username=${dbConfig.username} --dbname=${dbConfig.database} --quiet`
      execSync(command, { env, shell: true })
    } else {
      // Direct restore with psql
      const command = `psql --host=${dbConfig.host} --port=${dbConfig.port} --username=${dbConfig.username} --dbname=${dbConfig.database} --file="${backupPath}" --quiet`
      execSync(command, { env, shell: true })
    }

    success('Database restored successfully')
  } catch (err: any) {
    error(`Restore failed: ${err.message}`)
    throw err
  }
}

/**
 * Verify database after restore
 */
function verifyRestore(): boolean {
  info('Verifying database after restore...')

  try {
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL not set')
    }

    const dbConfig = parseDatabaseUrl(DATABASE_URL)
    const env = {
      ...process.env,
      PGPASSWORD: dbConfig.password,
    }

    // Check if database is accessible
    const command = `psql --host=${dbConfig.host} --port=${dbConfig.port} --username=${dbConfig.username} --dbname=${dbConfig.database} --command="SELECT 1" --quiet --tuples-only`
    const result = execSync(command, { env, encoding: 'utf-8' })

    if (result.trim() === '1') {
      success('Database verification passed')
      return true
    }

    warning('Database verification returned unexpected result')
    return false
  } catch (err: any) {
    error(`Database verification failed: ${err.message}`)
    return false
  }
}

/**
 * Main restore function
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    log('\nDatabase Restore Script\n', 'bright')
    log('Usage:', 'cyan')
    log('  pnpm db:restore <backup-file>          Restore from specific backup')
    log('  pnpm db:restore latest                 Restore from latest backup')
    log('  pnpm db:restore <file> --yes           Skip confirmation prompt')
    log('  pnpm db:restore <file> --no-backup     Skip pre-restore backup')
    log('')
    log('Examples:', 'cyan')
    log('  pnpm db:restore latest')
    log('  pnpm db:restore backups/database/verscienta_health_2025-01-20T10-30-45.sql.gz')
    log('  pnpm db:restore latest --yes --no-backup')
    log('')
    return
  }

  const backupFileArg = args[0]
  const skipConfirmation = args.includes('--yes') || args.includes('-y')
  const skipPreBackup = args.includes('--no-backup')

  log('\n' + '╔' + '═'.repeat(48) + '╗', 'cyan')
  log('║' + '  Database Restore Script'.padEnd(48) + '║', 'cyan')
  log('╚' + '═'.repeat(48) + '╝\n', 'cyan')

  const startTime = Date.now()

  try {
    // Determine backup file path
    let backupPath: string

    if (backupFileArg === 'latest') {
      const latest = findLatestBackup()
      if (!latest) {
        throw new Error(`No backup files found in ${BACKUP_DIR}`)
      }
      backupPath = latest
      info(`Using latest backup: ${path.basename(backupPath)}`)
    } else {
      // Use provided path
      if (path.isAbsolute(backupFileArg)) {
        backupPath = backupFileArg
      } else {
        // Try relative to backup dir
        const relativePath = path.join(BACKUP_DIR, backupFileArg)
        if (fs.existsSync(relativePath)) {
          backupPath = relativePath
        } else {
          backupPath = backupFileArg
        }
      }
    }

    // Validate backup file
    if (!validateBackupFile(backupPath)) {
      throw new Error('Backup file validation failed')
    }

    // Show warning
    warning('⚠️  WARNING: This will REPLACE all data in the database!')
    warning('⚠️  Make sure you have a backup before proceeding!')
    info(`Database: ${parseDatabaseUrl(DATABASE_URL!).database}`)
    info(`Backup: ${path.basename(backupPath)}`)

    // Confirm (unless skipped)
    if (!skipConfirmation) {
      const confirmed = await confirm('Are you sure you want to restore?')
      if (!confirmed) {
        warning('Restore cancelled by user')
        process.exit(0)
      }
    }

    // Create pre-restore backup (unless skipped)
    let preRestoreBackup = ''
    if (!skipPreBackup) {
      preRestoreBackup = createPreRestoreBackup()
    }

    // Restore database
    restoreDatabase(backupPath)

    // Verify restore
    const verified = verifyRestore()

    // Calculate duration
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    // Success summary
    log('\n' + '╔' + '═'.repeat(48) + '╗', 'green')
    log('║' + '  Restore Completed Successfully! ✓'.padEnd(48) + '║', 'green')
    log('╚' + '═'.repeat(48) + '╝\n', 'green')

    info('Summary:')
    info(`  Restored from: ${path.basename(backupPath)}`)
    info(`  Duration: ${duration}s`)
    info(`  Verified: ${verified ? 'Yes' : 'No'}`)
    if (preRestoreBackup) {
      info(`  Pre-restore backup: ${path.basename(preRestoreBackup)}`)
    }

    info('\nNext steps:')
    info('1. Verify application functionality')
    info('2. Check critical data')
    info('3. Run smoke tests')

    process.exit(0)
  } catch (err: any) {
    log('\n' + '╔' + '═'.repeat(48) + '╗', 'red')
    log('║' + '  Restore Failed ✗'.padEnd(48) + '║', 'red')
    log('╚' + '═'.repeat(48) + '╝\n', 'red')

    error(err.message)
    error('Database was not restored')
    warning('Check your pre-restore backup if one was created')

    process.exit(1)
  }
}

// Run restore
main()
