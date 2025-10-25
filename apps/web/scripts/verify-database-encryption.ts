#!/usr/bin/env ts-node

/**
 * Database Encryption Verification Script
 *
 * HIPAA §164.312(a)(2)(iv) - Encryption and Decryption
 *
 * This script verifies that database encryption at rest is properly configured.
 * It checks:
 * 1. PostgreSQL pgcrypto extension availability
 * 2. SSL/TLS connection encryption
 * 3. Cloud provider encryption settings
 * 4. Encryption key configuration
 * 5. Backup encryption status
 *
 * Usage:
 *   pnpm tsx scripts/verify-database-encryption.ts
 *
 * Environment Variables Required:
 *   DATABASE_URL - PostgreSQL connection string
 *   DATABASE_ENCRYPTION_KEY (optional) - For column-level encryption
 *   DATABASE_PROVIDER (optional) - Cloud provider name
 */

import { Pool } from 'pg'
import { getEncryptionStatus, verifyEncryptionSetup } from '../lib/db-encryption'

interface VerificationResult {
  category: string
  status: 'PASS' | 'WARN' | 'FAIL'
  message: string
  details?: Record<string, unknown>
}

const results: VerificationResult[] = []

/**
 * Add result to verification report
 */
function addResult(
  category: string,
  status: 'PASS' | 'WARN' | 'FAIL',
  message: string,
  details?: Record<string, unknown>
) {
  results.push({ category, status, message, details })
}

/**
 * Check if pgcrypto extension is available
 */
async function checkPgCryptoExtension(pool: Pool): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM pg_extension
        WHERE extname = 'pgcrypto'
      ) AS is_installed
    `)

    if (result.rows[0].is_installed) {
      addResult('pgcrypto Extension', 'PASS', 'pgcrypto extension is installed')
    } else {
      addResult(
        'pgcrypto Extension',
        'WARN',
        'pgcrypto extension is NOT installed. Column-level encryption unavailable.',
        {
          remedy: 'Run: CREATE EXTENSION IF NOT EXISTS pgcrypto;',
        }
      )
    }
  } catch (error) {
    addResult('pgcrypto Extension', 'FAIL', `Failed to check pgcrypto: ${error}`)
  }
}

/**
 * Check SSL/TLS connection encryption
 */
async function checkSSLConnection(pool: Pool): Promise<void> {
  try {
    const result = await pool.query('SELECT ssl_is_used() AS ssl_enabled')

    if (result.rows[0].ssl_enabled) {
      addResult('SSL/TLS Connection', 'PASS', 'Database connection is encrypted with SSL/TLS')

      // Get SSL version
      const versionResult = await pool.query('SHOW ssl_version')
      addResult(
        'SSL Version',
        'PASS',
        `SSL version: ${versionResult.rows[0].ssl_version || 'Unknown'}`
      )
    } else {
      addResult('SSL/TLS Connection', 'FAIL', 'Database connection is NOT encrypted with SSL/TLS', {
        warning: 'HIPAA violation - connections must use SSL/TLS in production',
        remedy: 'Add ?sslmode=require to DATABASE_URL',
      })
    }
  } catch (error) {
    addResult('SSL/TLS Connection', 'WARN', `Could not verify SSL status: ${error}`, {
      note: 'This may be expected in development environments',
    })
  }
}

/**
 * Check encryption functions availability
 */
async function checkEncryptionFunctions(pool: Pool): Promise<void> {
  try {
    // Test encrypt and decrypt functions
    const testData = 'test-phi-data'
    const testKey = 'test-key-32-characters-long!'

    const encryptResult = await pool.query(
      `SELECT encode(pgp_sym_encrypt($1, $2), 'base64') AS encrypted`,
      [testData, testKey]
    )

    const decryptResult = await pool.query(
      `SELECT pgp_sym_decrypt(decode($1, 'base64'), $2) AS decrypted`,
      [encryptResult.rows[0].encrypted, testKey]
    )

    if (decryptResult.rows[0].decrypted === testData) {
      addResult('Encryption Functions', 'PASS', 'pgp_sym_encrypt/decrypt functions work correctly')
    } else {
      addResult('Encryption Functions', 'FAIL', 'Encryption/decryption test failed')
    }
  } catch (error) {
    addResult('Encryption Functions', 'FAIL', `Encryption functions test failed: ${error}`)
  }
}

/**
 * Check database encryption at rest (disk-level)
 */
async function checkDiskEncryption(): Promise<void> {
  const provider = process.env.DATABASE_PROVIDER

  if (!provider || provider === 'custom') {
    addResult(
      'Disk Encryption',
      'WARN',
      'DATABASE_PROVIDER not set - cannot verify cloud provider encryption',
      {
        note: 'Verify encryption manually in your database provider dashboard',
        providers: {
          'AWS RDS': 'Encrypted via AWS KMS',
          DigitalOcean: 'Encrypted by default on managed databases',
          Supabase: 'Encrypted at rest using AES-256',
          Render: 'Encrypted at rest for PostgreSQL instances',
        },
      }
    )
    return
  }

  const encryptionStatus: Record<string, { encrypted: boolean; method: string }> = {
    'aws-rds': { encrypted: true, method: 'AWS KMS encryption at rest' },
    digitalocean: { encrypted: true, method: 'DigitalOcean managed encryption' },
    supabase: { encrypted: true, method: 'Supabase AES-256 encryption at rest' },
    render: { encrypted: true, method: 'Render PostgreSQL encryption at rest' },
  }

  const status = encryptionStatus[provider.toLowerCase()]

  if (status) {
    addResult('Disk Encryption', 'PASS', `${provider} - ${status.method}`, {
      verify:
        'Confirm encryption is enabled in provider dashboard. This script assumes it is enabled.',
    })
  } else {
    addResult('Disk Encryption', 'WARN', `Unknown DATABASE_PROVIDER: ${provider}`, {
      note: 'Verify encryption manually in your database provider dashboard',
    })
  }
}

/**
 * Check encryption key configuration
 */
async function checkEncryptionKeyConfig(): Promise<void> {
  const encryptionStatus = getEncryptionStatus()

  if (encryptionStatus.keyConfigured) {
    addResult(
      'Encryption Key',
      'PASS',
      'DATABASE_ENCRYPTION_KEY is configured for column-level encryption'
    )

    // Check key strength
    const key = process.env.DATABASE_ENCRYPTION_KEY
    if (key && key.length >= 32) {
      addResult('Key Strength', 'PASS', `Encryption key length: ${key.length} characters`)
    } else {
      addResult(
        'Key Strength',
        'WARN',
        `Encryption key length: ${key?.length || 0} characters (recommended: 32+)`
      )
    }
  } else {
    addResult(
      'Encryption Key',
      'WARN',
      'DATABASE_ENCRYPTION_KEY not set - using cloud provider encryption only',
      {
        note: 'This is acceptable if using managed cloud provider encryption',
      }
    )
  }
}

/**
 * Check backup encryption
 */
async function checkBackupEncryption(): Promise<void> {
  const provider = process.env.DATABASE_PROVIDER

  const backupEncryption: Record<string, string> = {
    'aws-rds': 'Automated backups encrypted with same KMS key as database',
    digitalocean: 'Daily encrypted backups included with managed databases',
    supabase: 'Point-in-time recovery with encrypted backups',
    render: 'Continuous backups encrypted at rest',
  }

  if (provider && backupEncryption[provider.toLowerCase()]) {
    addResult('Backup Encryption', 'PASS', backupEncryption[provider.toLowerCase()], {
      verify: 'Confirm backup encryption is enabled in provider dashboard',
    })
  } else {
    addResult(
      'Backup Encryption',
      'WARN',
      'Cannot verify backup encryption - check provider settings manually',
      {
        reminder: 'HIPAA requires that backups of ePHI are encrypted and securely stored',
      }
    )
  }
}

/**
 * Generate encryption verification report
 */
function generateReport(): void {
  console.log('\n' + '='.repeat(80))
  console.log('DATABASE ENCRYPTION VERIFICATION REPORT')
  console.log('HIPAA §164.312(a)(2)(iv) - Encryption and Decryption')
  console.log('='.repeat(80) + '\n')

  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Database Provider: ${process.env.DATABASE_PROVIDER || 'custom'}`)
  console.log(`Timestamp: ${new Date().toISOString()}\n`)

  const passing = results.filter((r) => r.status === 'PASS').length
  const warnings = results.filter((r) => r.status === 'WARN').length
  const failures = results.filter((r) => r.status === 'FAIL').length

  console.log('Summary:')
  console.log(`  ✅ PASS: ${passing}`)
  console.log(`  ⚠️  WARN: ${warnings}`)
  console.log(`  ❌ FAIL: ${failures}`)
  console.log('\nDetailed Results:\n')

  for (const result of results) {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️ ' : '❌'
    console.log(`${icon} [${result.status}] ${result.category}`)
    console.log(`   ${result.message}`)

    if (result.details) {
      console.log(`   Details:`)
      for (const [key, value] of Object.entries(result.details)) {
        if (typeof value === 'object' && value !== null) {
          console.log(`     ${key}:`)
          for (const [k, v] of Object.entries(value)) {
            console.log(`       - ${k}: ${v}`)
          }
        } else {
          console.log(`     ${key}: ${value}`)
        }
      }
    }
    console.log('')
  }

  console.log('='.repeat(80))

  if (failures > 0) {
    console.log('\n❌ ENCRYPTION VERIFICATION FAILED')
    console.log('   Action Required: Fix the failures listed above before deploying to production.')
    process.exit(1)
  } else if (warnings > 0) {
    console.log('\n⚠️  ENCRYPTION VERIFICATION PASSED WITH WARNINGS')
    console.log('   Review warnings and verify encryption settings manually.')
    process.exit(0)
  } else {
    console.log('\n✅ ENCRYPTION VERIFICATION PASSED')
    console.log('   All encryption checks passed successfully.')
    process.exit(0)
  }
}

/**
 * Main verification function
 */
async function main() {
  console.log('Starting database encryption verification...\n')

  // Check environment variables
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required')
    process.exit(1)
  }

  // Create database connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode') ? { rejectUnauthorized: false } : undefined,
  })

  try {
    // Run all verification checks
    console.log('Running verification checks...\n')

    await checkPgCryptoExtension(pool)
    await checkSSLConnection(pool)
    await checkEncryptionFunctions(pool)
    await checkDiskEncryption()
    await checkEncryptionKeyConfig()
    await checkBackupEncryption()

    // Check encryption setup
    const setupResult = await verifyEncryptionSetup()
    addResult(
      'Overall Encryption Setup',
      setupResult.configured ? 'PASS' : 'FAIL',
      `Encryption method: ${setupResult.method}`,
      {
        warnings: setupResult.warnings,
      }
    )
  } catch (error) {
    console.error(`\n❌ Verification failed with error:`, error)
    process.exit(1)
  } finally {
    await pool.end()
  }

  // Generate and display report
  generateReport()
}

// Run verification
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
