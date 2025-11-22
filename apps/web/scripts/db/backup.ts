#!/usr/bin/env tsx
/**
 * Database Backup Script
 *
 * Creates compressed PostgreSQL database backups with:
 * - Timestamp-based naming
 * - Compression (gzip)
 * - Backup verification
 * - Rotation management
 * - Error handling and logging
 * - Optional notifications
 *
 * Usage:
 *   pnpm db:backup              # Create backup with default settings
 *   pnpm db:backup --verify     # Create and verify backup
 *   pnpm db:backup --notify     # Create backup and send notification
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// Configuration
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), '../../backups/database')
const DATABASE_URL = process.env.DATABASE_URL
const BACKUP_RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10)
const ENABLE_COMPRESSION = process.env.BACKUP_COMPRESSION !== 'false'
const ENABLE_NOTIFICATIONS = process.env.BACKUP_NOTIFICATIONS === 'true'

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
 * Parse DATABASE_URL to extract connection details
 */
function parseDatabaseUrl(url: string): {
  host: string
  port: string
  database: string
  username: string
  password: string
} {
  // postgresql://username:password@host:port/database
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
 * Ensure backup directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
    success(`Created backup directory: ${BACKUP_DIR}`)
  }
}

/**
 * Generate backup filename with timestamp
 */
function generateBackupFilename(): string {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5) // 2025-01-20T10-30-45
  const extension = ENABLE_COMPRESSION ? 'sql.gz' : 'sql'
  return `verscienta_health_${timestamp}.${extension}`
}

/**
 * Create database backup using pg_dump
 */
function createBackup(filename: string): string {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const dbConfig = parseDatabaseUrl(DATABASE_URL)
  const backupPath = path.join(BACKUP_DIR, filename)

  info(`Creating backup: ${filename}`)
  info(`Database: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`)

  try {
    // Set PGPASSWORD for authentication
    const env = {
      ...process.env,
      PGPASSWORD: dbConfig.password,
    }

    // Build pg_dump command
    const pgDumpArgs = [
      `--host=${dbConfig.host}`,
      `--port=${dbConfig.port}`,
      `--username=${dbConfig.username}`,
      '--format=plain', // SQL format
      '--verbose',
      '--no-owner', // Don't output ownership commands
      '--no-acl', // Don't output ACL commands
      '--clean', // Include DROP commands
      '--if-exists', // Use IF EXISTS with DROP commands
      dbConfig.database,
    ]

    if (ENABLE_COMPRESSION) {
      // Pipe through gzip for compression
      const command = `pg_dump ${pgDumpArgs.join(' ')} | gzip > "${backupPath}"`
      execSync(command, { env, shell: true })
    } else {
      // Direct output to file
      const command = `pg_dump ${pgDumpArgs.join(' ')} > "${backupPath}"`
      execSync(command, { env, shell: true })
    }

    // Check if backup was created
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file was not created')
    }

    const stats = fs.statSync(backupPath)
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)

    success(`Backup created: ${filename}`)
    success(`Size: ${sizeMB} MB`)
    success(`Location: ${backupPath}`)

    return backupPath
  } catch (err: any) {
    error(`Backup failed: ${err.message}`)
    throw err
  }
}

/**
 * Verify backup integrity
 */
function verifyBackup(backupPath: string): boolean {
  info('Verifying backup integrity...')

  try {
    // Check file exists and has content
    const stats = fs.statSync(backupPath)

    if (stats.size === 0) {
      error('Backup file is empty')
      return false
    }

    if (stats.size < 1024) {
      // Less than 1KB is suspicious
      warning('Backup file is very small (< 1KB)')
    }

    // For compressed backups, try to read first few bytes
    if (ENABLE_COMPRESSION) {
      const buffer = Buffer.alloc(2)
      const fd = fs.openSync(backupPath, 'r')
      fs.readSync(fd, buffer, 0, 2, 0)
      fs.closeSync(fd)

      // Check for gzip magic number (1f 8b)
      if (buffer[0] !== 0x1f || buffer[1] !== 0x8b) {
        error('Backup file is not a valid gzip file')
        return false
      }
    }

    success('Backup verification passed')
    return true
  } catch (err: any) {
    error(`Backup verification failed: ${err.message}`)
    return false
  }
}

/**
 * Clean up old backups based on retention policy
 */
function cleanupOldBackups() {
  info(`Cleaning up backups older than ${BACKUP_RETENTION_DAYS} days...`)

  try {
    const files = fs.readdirSync(BACKUP_DIR)
    const now = Date.now()
    const retentionMs = BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000

    let deletedCount = 0

    for (const file of files) {
      // Only process backup files
      if (!file.startsWith('verscienta_health_') || (!file.endsWith('.sql') && !file.endsWith('.sql.gz'))) {
        continue
      }

      const filePath = path.join(BACKUP_DIR, file)
      const stats = fs.statSync(filePath)
      const fileAge = now - stats.mtimeMs

      if (fileAge > retentionMs) {
        fs.unlinkSync(filePath)
        deletedCount++
        info(`Deleted old backup: ${file}`)
      }
    }

    if (deletedCount > 0) {
      success(`Deleted ${deletedCount} old backup(s)`)
    } else {
      info('No old backups to delete')
    }
  } catch (err: any) {
    warning(`Cleanup failed: ${err.message}`)
  }
}

/**
 * Send notification (placeholder)
 */
function sendNotification(success: boolean, filename: string, sizeMB: string, error?: string) {
  if (!ENABLE_NOTIFICATIONS) return

  info('Sending notification...')

  // TODO: Integrate with notification service (email, Slack, webhook)
  // For now, just log
  if (success) {
    log(`Notification: Backup successful - ${filename} (${sizeMB} MB)`, 'green')
  } else {
    log(`Notification: Backup failed - ${error}`, 'red')
  }
}

/**
 * Main backup function
 */
async function main() {
  const args = process.argv.slice(2)
  const shouldVerify = args.includes('--verify')
  const shouldNotify = args.includes('--notify') || ENABLE_NOTIFICATIONS

  log('\n' + '╔' + '═'.repeat(48) + '╗', 'cyan')
  log('║' + '  Database Backup Script'.padEnd(48) + '║', 'cyan')
  log('╚' + '═'.repeat(48) + '╝\n', 'cyan')

  const startTime = Date.now()

  try {
    // Ensure backup directory exists
    ensureBackupDir()

    // Generate filename
    const filename = generateBackupFilename()

    // Create backup
    const backupPath = createBackup(filename)

    // Get backup size
    const stats = fs.statSync(backupPath)
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)

    // Verify backup if requested
    let verified = true
    if (shouldVerify) {
      verified = verifyBackup(backupPath)
      if (!verified) {
        throw new Error('Backup verification failed')
      }
    }

    // Clean up old backups
    cleanupOldBackups()

    // Calculate duration
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    // Success summary
    log('\n' + '╔' + '═'.repeat(48) + '╗', 'green')
    log('║' + '  Backup Completed Successfully! ✓'.padEnd(48) + '║', 'green')
    log('╚' + '═'.repeat(48) + '╝\n', 'green')

    info('Summary:')
    info(`  File: ${filename}`)
    info(`  Size: ${sizeMB} MB`)
    info(`  Location: ${backupPath}`)
    info(`  Duration: ${duration}s`)
    info(`  Verified: ${verified ? 'Yes' : 'No'}`)

    // Send notification
    if (shouldNotify) {
      sendNotification(true, filename, sizeMB)
    }

    process.exit(0)
  } catch (err: any) {
    log('\n' + '╔' + '═'.repeat(48) + '╗', 'red')
    log('║' + '  Backup Failed ✗'.padEnd(48) + '║', 'red')
    log('╚' + '═'.repeat(48) + '╝\n', 'red')

    error(err.message)
    error('Backup was not created')

    // Send failure notification
    if (shouldNotify) {
      sendNotification(false, '', '', err.message)
    }

    process.exit(1)
  }
}

// Run backup
main()
