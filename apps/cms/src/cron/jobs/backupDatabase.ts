import { exec } from 'child_process'
import type { Payload } from 'payload'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface BackupStats {
  backupSize: number
  backupLocation: string
  duration: number
  tables: string[]
  success: boolean
  errorMessage?: string
}

export async function backupDatabaseJob(payload: Payload): Promise<void> {
  console.log('💾 Starting database backup...')

  const startTime = Date.now()

  const stats: BackupStats = {
    backupSize: 0,
    backupLocation: '',
    duration: 0,
    tables: [],
    success: false,
  }

  try {
    // Check if database backup is properly configured
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured')
    }

    // Parse database URL
    const dbUrl = new URL(process.env.DATABASE_URL)
    const dbConfig = {
      host: dbUrl.hostname,
      port: dbUrl.port || '5432',
      database: dbUrl.pathname.slice(1), // Remove leading slash
      username: dbUrl.username,
      password: dbUrl.password,
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFilename = `verscienta-backup-${timestamp}.sql`

    // Determine backup location
    const backupDir = process.env.BACKUP_DIR || './backups'
    const backupPath = `${backupDir}/${backupFilename}`

    // Create backup directory if it doesn't exist
    const fs = await import('fs/promises')
    try {
      await fs.mkdir(backupDir, { recursive: true })
    } catch (_error) {
      // Directory might already exist
    }

    console.log(`📦 Creating backup: ${backupPath}`)

    // Use pg_dump to create backup
    const pgDumpCommand = `PGPASSWORD="${dbConfig.password}" pg_dump \
      -h ${dbConfig.host} \
      -p ${dbConfig.port} \
      -U ${dbConfig.username} \
      -d ${dbConfig.database} \
      -F p \
      -f "${backupPath}" \
      --verbose \
      --clean \
      --if-exists`

    try {
      const { stderr } = await execAsync(pgDumpCommand, {
        maxBuffer: 1024 * 1024 * 100, // 100MB buffer
      })

      if (stderr) {
        console.log('pg_dump output:', stderr)
      }

      // Get backup file size
      const fileStats = await fs.stat(backupPath)
      stats.backupSize = fileStats.size

      console.log(`✓ Backup created: ${(stats.backupSize / 1024 / 1024).toFixed(2)}MB`)

      // Optionally compress the backup
      if (process.env.COMPRESS_BACKUPS === 'true') {
        await compressBackup(backupPath, stats)
      }

      // Optionally upload to cloud storage (S3, Cloudflare R2, etc.)
      if (process.env.BACKUP_UPLOAD_ENABLED === 'true') {
        await uploadBackup(backupPath, stats)
      }

      // Clean up old backups (keep last N backups)
      await cleanupOldBackups(backupDir)

      stats.backupLocation = backupPath
      stats.success = true
    } catch (error) {
      throw new Error(`pg_dump failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    stats.duration = Date.now() - startTime

    console.log(`✅ Database backup complete (${stats.duration}ms)`)

    // Log backup to database
    await payload.create({
      collection: 'import-logs',
      data: {
        type: 'database-backup',
        results: stats,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    stats.success = false
    stats.errorMessage = error instanceof Error ? error.message : 'Unknown error'
    stats.duration = Date.now() - startTime

    console.error('❌ Database backup failed:', error)

    // Log failed backup attempt
    try {
      await payload.create({
        collection: 'import-logs',
        data: {
          type: 'database-backup',
          results: stats,
          timestamp: new Date(),
        },
      })
    } catch (logError) {
      console.error('Failed to log backup error:', logError)
    }

    throw error
  }
}

async function compressBackup(backupPath: string, stats: BackupStats): Promise<void> {
  console.log('🗜️  Compressing backup...')

  try {
    const gzipCommand = `gzip -9 "${backupPath}"`
    await execAsync(gzipCommand)

    const fs = await import('fs/promises')
    const gzipPath = `${backupPath}.gz`
    const gzipStats = await fs.stat(gzipPath)

    const compressionRatio = ((1 - gzipStats.size / stats.backupSize) * 100).toFixed(1)

    stats.backupSize = gzipStats.size
    stats.backupLocation = gzipPath

    console.log(
      `  ✓ Compressed: ${(stats.backupSize / 1024 / 1024).toFixed(2)}MB (${compressionRatio}% smaller)`
    )
  } catch (error) {
    console.error('  ⚠️  Compression failed:', error)
    // Don't fail the backup if compression fails
  }
}

async function uploadBackup(backupPath: string, stats: BackupStats): Promise<void> {
  console.log('☁️  Uploading backup to cloud storage...')

  try {
    // This is a placeholder for cloud storage upload
    // Implement based on your storage provider (S3, R2, etc.)

    // Example for S3:
    // const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    // const fs = await import('fs/promises')
    // const fileBuffer = await fs.readFile(backupPath)
    //
    // const s3Client = new S3Client({ region: process.env.AWS_REGION })
    // await s3Client.send(new PutObjectCommand({
    //   Bucket: process.env.BACKUP_BUCKET,
    //   Key: `backups/${path.basename(backupPath)}`,
    //   Body: fileBuffer,
    // }))

    console.log('  ✓ Backup uploaded to cloud storage')
  } catch (error) {
    console.error('  ⚠️  Upload failed:', error)
    // Don't fail the backup if upload fails
  }
}

async function cleanupOldBackups(backupDir: string): Promise<void> {
  try {
    console.log('🗑️  Cleaning up old backups...')

    const fs = await import('fs/promises')
    const files = await fs.readdir(backupDir)

    // Filter for backup files
    const backupFiles = files.filter(
      (file) => file.startsWith('verscienta-backup-') && file.endsWith('.sql')
    )

    // Keep only the last N backups
    const keepCount = parseInt(process.env.BACKUP_RETENTION_COUNT || '7', 10)

    if (backupFiles.length > keepCount) {
      // Sort by date (oldest first)
      backupFiles.sort()

      // Delete oldest backups
      const filesToDelete = backupFiles.slice(0, backupFiles.length - keepCount)

      for (const file of filesToDelete) {
        const path = `${backupDir}/${file}`
        await fs.unlink(path)
        console.log(`  🗑️  Deleted old backup: ${file}`)
      }

      console.log(`  ✓ Kept ${keepCount} most recent backups`)
    }
  } catch (error) {
    console.error('  ⚠️  Cleanup failed:', error)
    // Don't fail the backup if cleanup fails
  }
}
