/**
 * Database Encryption Utilities
 *
 * HIPAA Compliance: §164.312(a)(2)(iv) Encryption and Decryption
 *
 * Provides functions for encrypting/decrypting PHI data when using
 * column-level encryption with PostgreSQL pgcrypto.
 *
 * Note: If using full database encryption (AWS RDS, DigitalOcean, etc.),
 * these utilities are not needed.
 */

const ENCRYPTION_KEY = process.env.DATABASE_ENCRYPTION_KEY

if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  console.warn(
    '[DATABASE ENCRYPTION] DATABASE_ENCRYPTION_KEY not set. ' +
    'Ensure full database encryption is enabled at infrastructure level.'
  )
}

export interface EncryptedData {
  encrypted: boolean
  data: Buffer | string
}

/**
 * Check if database encryption is configured
 */
export function isEncryptionConfigured(): boolean {
  return !!ENCRYPTION_KEY
}

/**
 * Encrypt PHI data before storing in database
 *
 * Usage with raw SQL:
 * ```typescript
 * const encryptedSymptoms = await encryptPHI(JSON.stringify(symptoms))
 * await db.execute(sql`
 *   INSERT INTO symptom_submissions (symptoms_encrypted)
 *   VALUES (encrypt_phi(${encryptedSymptoms}, ${ENCRYPTION_KEY}))
 * `)
 * ```
 */
export async function encryptPHI(data: string): Promise<string> {
  if (!ENCRYPTION_KEY) {
    throw new Error(
      'DATABASE_ENCRYPTION_KEY not configured. Cannot encrypt PHI data.'
    )
  }

  if (!data || data.length === 0) {
    throw new Error('Cannot encrypt empty data')
  }

  // Return the data to be passed to pgp_sym_encrypt in SQL
  // The actual encryption happens in the database
  return data
}

/**
 * Helper to create SQL for encrypted insert
 *
 * Usage:
 * ```typescript
 * const sql = createEncryptedInsertSQL('symptom_submissions', {
 *   symptoms: JSON.stringify(['headache', 'fatigue']),
 *   additional_info: 'No other symptoms'
 * })
 * ```
 */
export function createEncryptedInsertSQL(
  tableName: string,
  data: Record<string, string>
): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('DATABASE_ENCRYPTION_KEY not configured')
  }

  const columns = Object.keys(data)
    .map(col => `${col}_encrypted`)
    .join(', ')

  const values = Object.values(data)
    .map(val => `encrypt_phi('${val.replace(/'/g, "''")}', '${ENCRYPTION_KEY}')`)
    .join(', ')

  return `INSERT INTO ${tableName} (${columns}) VALUES (${values})`
}

/**
 * Helper to create SQL for encrypted select
 *
 * Usage:
 * ```typescript
 * const sql = createEncryptedSelectSQL('symptom_submissions', ['symptoms', 'additional_info'], 'id = $1')
 * ```
 */
export function createEncryptedSelectSQL(
  tableName: string,
  columns: string[],
  whereClause?: string
): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('DATABASE_ENCRYPTION_KEY not configured')
  }

  const selectColumns = columns
    .map(col => `decrypt_phi(${col}_encrypted, '${ENCRYPTION_KEY}') AS ${col}`)
    .join(', ')

  let sql = `SELECT id, ${selectColumns} FROM ${tableName}`

  if (whereClause) {
    sql += ` WHERE ${whereClause}`
  }

  return sql
}

/**
 * Hash user ID for privacy (one-way)
 *
 * Used to link data to users without storing actual user IDs
 */
export function hashUserId(userId: string): string {
  if (!userId || userId.length === 0) {
    throw new Error('Cannot hash empty user ID')
  }

  // Use the database's hash_user_id function for consistency
  return userId // Will be passed to hash_user_id() in SQL
}

/**
 * Verify encryption setup
 *
 * Run this during application startup to ensure encryption is configured
 */
export async function verifyEncryptionSetup(): Promise<{
  configured: boolean
  method: 'full-database' | 'column-level' | 'none'
  warnings: string[]
}> {
  const warnings: string[] = []

  if (!ENCRYPTION_KEY) {
    // Check if we're using cloud provider encryption
    const cloudProvider = process.env.DATABASE_PROVIDER // 'aws-rds', 'digitalocean', 'supabase', etc.

    if (cloudProvider && ['aws-rds', 'digitalocean', 'supabase', 'render'].includes(cloudProvider)) {
      return {
        configured: true,
        method: 'full-database',
        warnings: [
          'Using cloud provider full database encryption. ' +
          'Verify encryption is enabled in provider dashboard.'
        ],
      }
    } else {
      warnings.push(
        'DATABASE_ENCRYPTION_KEY not set and cloud provider encryption not confirmed.',
        'PHI data may not be encrypted at rest.',
        'This is a HIPAA compliance violation if storing PHI.'
      )

      return {
        configured: false,
        method: 'none',
        warnings,
      }
    }
  }

  return {
    configured: true,
    method: 'column-level',
    warnings: [],
  }
}

/**
 * Example: Store encrypted symptom submission
 *
 * This is a reference implementation showing how to use encryption
 */
export async function storeEncryptedSymptomSubmission(
  db: any, // Your database connection
  data: {
    userId: string
    symptoms: string[]
    duration?: string
    severity?: string
    additionalInfo?: string
  }
): Promise<void> {
  if (!ENCRYPTION_KEY) {
    throw new Error('Cannot store encrypted data without encryption key')
  }

  const symptomsStr = JSON.stringify(data.symptoms)
  const userIdHash = hashUserId(data.userId)

  // Example using raw SQL (adjust for your ORM)
  await db.execute(`
    INSERT INTO symptom_submissions (
      user_id_hash,
      symptoms_encrypted,
      duration_encrypted,
      severity_encrypted,
      additional_info_encrypted
    ) VALUES (
      hash_user_id('${data.userId}'),
      encrypt_phi('${symptomsStr.replace(/'/g, "''")}', '${ENCRYPTION_KEY}'),
      ${data.duration ? `encrypt_phi('${data.duration.replace(/'/g, "''")}', '${ENCRYPTION_KEY}')` : 'NULL'},
      ${data.severity ? `encrypt_phi('${data.severity.replace(/'/g, "''")}', '${ENCRYPTION_KEY}')` : 'NULL'},
      ${data.additionalInfo ? `encrypt_phi('${data.additionalInfo.replace(/'/g, "''")}', '${ENCRYPTION_KEY}')` : 'NULL'}
    )
  `)
}

/**
 * Example: Retrieve encrypted symptom submission
 *
 * This is a reference implementation showing how to decrypt data
 */
export async function getEncryptedSymptomSubmission(
  db: any, // Your database connection
  submissionId: string
): Promise<{
  id: string
  symptoms: string[]
  duration?: string
  severity?: string
  additionalInfo?: string
  submittedAt: Date
} | null> {
  if (!ENCRYPTION_KEY) {
    throw new Error('Cannot decrypt data without encryption key')
  }

  const result = await db.execute(`
    SELECT
      id,
      decrypt_phi(symptoms_encrypted, '${ENCRYPTION_KEY}') AS symptoms,
      decrypt_phi(duration_encrypted, '${ENCRYPTION_KEY}') AS duration,
      decrypt_phi(severity_encrypted, '${ENCRYPTION_KEY}') AS severity,
      decrypt_phi(additional_info_encrypted, '${ENCRYPTION_KEY}') AS additional_info,
      submitted_at
    FROM symptom_submissions
    WHERE id = '${submissionId}'
  `)

  if (!result.rows || result.rows.length === 0) {
    return null
  }

  const row = result.rows[0]

  return {
    id: row.id,
    symptoms: JSON.parse(row.symptoms),
    duration: row.duration,
    severity: row.severity,
    additionalInfo: row.additional_info,
    submittedAt: new Date(row.submitted_at),
  }
}

/**
 * Log encryption operation for audit trail
 */
export async function logEncryptionOperation(
  db: any,
  operation: {
    eventType: 'encrypt' | 'decrypt' | 'key_rotation'
    tableName: string
    columnName: string
    userId?: string
    ipAddress?: string
    success: boolean
    errorMessage?: string
  }
): Promise<void> {
  await db.execute(`
    INSERT INTO encryption_audit_log (
      event_type,
      table_name,
      column_name,
      user_id,
      ip_address,
      success,
      error_message
    ) VALUES (
      '${operation.eventType}',
      '${operation.tableName}',
      '${operation.columnName}',
      ${operation.userId ? `'${operation.userId}'` : 'NULL'},
      ${operation.ipAddress ? `'${operation.ipAddress}'` : 'NULL'},
      ${operation.success},
      ${operation.errorMessage ? `'${operation.errorMessage.replace(/'/g, "''")}'` : 'NULL'}
    )
  `)
}

/**
 * Get encryption status for monitoring
 */
export function getEncryptionStatus(): {
  enabled: boolean
  keyConfigured: boolean
  environment: string
} {
  return {
    enabled: !!ENCRYPTION_KEY,
    keyConfigured: !!ENCRYPTION_KEY,
    environment: process.env.NODE_ENV || 'development',
  }
}
