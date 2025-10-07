# Database Encryption at Rest

**HIPAA Requirement**: §164.312(a)(2)(iv) - Encryption and Decryption

This document provides instructions for enabling encryption at rest for PostgreSQL databases storing Protected Health Information (PHI).

---

## Overview

**Encryption at Rest** protects data stored on disk from unauthorized access if the physical media is compromised. For HIPAA compliance, all PHI must be encrypted at rest.

### Two Approaches

1. **Full Database Encryption** (Recommended)
   - Encrypts entire database at the filesystem/disk level
   - Transparent to the application
   - Better performance
   - Requires infrastructure support

2. **Column-Level Encryption** (Alternative)
   - Encrypts specific PHI fields only
   - Application-level encryption
   - More granular control
   - Requires code changes

---

## Option 1: Full Database Encryption (Recommended)

### Using Transparent Data Encryption (TDE)

Most cloud database providers offer built-in encryption:

#### **AWS RDS PostgreSQL**

```bash
# Enable encryption when creating the instance
aws rds create-db-instance \
  --db-instance-identifier verscienta-health-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 100 \
  --storage-encrypted \
  --kms-key-id arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012

# For existing instance (requires snapshot and restore)
# 1. Create encrypted snapshot
aws rds create-db-snapshot \
  --db-instance-identifier verscienta-health-db \
  --db-snapshot-identifier verscienta-snapshot

# 2. Copy snapshot with encryption
aws rds copy-db-snapshot \
  --source-db-snapshot-identifier verscienta-snapshot \
  --target-db-snapshot-identifier verscienta-snapshot-encrypted \
  --kms-key-id arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012

# 3. Restore from encrypted snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier verscienta-health-db-encrypted \
  --db-snapshot-identifier verscienta-snapshot-encrypted
```

**Status Check**:

```sql
-- Check if encryption is enabled
SELECT
  name,
  value
FROM
  pg_settings
WHERE
  name LIKE '%encrypt%';
```

#### **DigitalOcean Managed Databases**

Encryption at rest is **enabled by default** for all managed PostgreSQL databases.

```bash
# Create encrypted database
doctl databases create verscienta-health-db \
  --engine pg \
  --region nyc3 \
  --size db-s-2vcpu-4gb

# Verify encryption status (check in dashboard or via API)
doctl databases get <database-id>
```

#### **Supabase**

Encryption at rest is **enabled by default** using AWS RDS encryption.

No additional configuration required.

#### **Render**

Encryption at rest is **enabled by default** for all PostgreSQL databases.

No additional configuration required.

---

## Option 2: Column-Level Encryption (Application-Level)

If your hosting provider doesn't support full database encryption, use PostgreSQL's `pgcrypto` extension for column-level encryption.

### Installation

```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';
```

### Migration: Add Encrypted Columns

Create a migration to add encrypted versions of PHI fields:

```sql
-- File: apps/cms/migrations/001_add_encrypted_phi_fields.sql

-- Add encrypted columns for PHI data
-- Example: Symptom checker submissions (if storing them)

ALTER TABLE symptom_submissions
  ADD COLUMN symptoms_encrypted BYTEA,
  ADD COLUMN additional_info_encrypted BYTEA,
  ADD COLUMN user_id_hash TEXT; -- One-way hash for user identification

-- Create encryption/decryption functions
CREATE OR REPLACE FUNCTION encrypt_phi(data TEXT, key TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, key);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrypt_phi(data BYTEA, key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(data, key);
END;
$$ LANGUAGE plpgsql;

-- Example: Encrypt existing data (if any)
-- NOTE: This requires the encryption key to be provided
-- DO NOT run this in production without proper key management

-- UPDATE symptom_submissions
-- SET
--   symptoms_encrypted = encrypt_phi(symptoms::TEXT, '<ENCRYPTION_KEY>'),
--   additional_info_encrypted = encrypt_phi(additional_info, '<ENCRYPTION_KEY>')
-- WHERE symptoms_encrypted IS NULL;

-- Drop unencrypted columns (ONLY after verifying encrypted data)
-- ALTER TABLE symptom_submissions
--   DROP COLUMN symptoms,
--   DROP COLUMN additional_info;

-- Rename encrypted columns (optional)
-- ALTER TABLE symptom_submissions
--   RENAME COLUMN symptoms_encrypted TO symptoms;
-- ALTER TABLE symptom_submissions
--   RENAME COLUMN additional_info_encrypted TO additional_info;
```

### Key Management

**CRITICAL**: Never hardcode encryption keys!

#### Using Environment Variables

```bash
# .env.production
DATABASE_ENCRYPTION_KEY=<generated-strong-key>
```

**Generate a strong encryption key**:

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### Using AWS KMS (Recommended for Production)

```typescript
// apps/web/lib/encryption.ts
import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms'

const kmsClient = new KMSClient({ region: 'us-east-1' })

export async function getEncryptionKey(): Promise<string> {
  // Decrypt the encrypted key stored in environment variable
  const encryptedKey = process.env.DATABASE_ENCRYPTION_KEY_ENCRYPTED

  const command = new DecryptCommand({
    CiphertextBlob: Buffer.from(encryptedKey, 'base64'),
  })

  const response = await kmsClient.send(command)
  return Buffer.from(response.Plaintext!).toString('utf-8')
}
```

### Application Code for Column-Level Encryption

```typescript
// apps/web/lib/db-encryption.ts

/**
 * Database Encryption Utilities
 *
 * Provides functions for encrypting/decrypting PHI data
 * using PostgreSQL pgcrypto extension.
 */

import { db } from './db' // Your database connection
import { sql } from 'drizzle-orm'

const ENCRYPTION_KEY = process.env.DATABASE_ENCRYPTION_KEY

if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_ENCRYPTION_KEY must be set in production')
}

/**
 * Encrypt sensitive data before storing in database
 */
export function encryptPHI(data: string): ReturnType<typeof sql.raw> {
  if (!ENCRYPTION_KEY) {
    throw new Error('Encryption key not configured')
  }

  return sql.raw(`pgp_sym_encrypt('${data.replace(/'/g, "''")}', '${ENCRYPTION_KEY}')`)
}

/**
 * Decrypt sensitive data when reading from database
 */
export function decryptPHI(encryptedData: Buffer): ReturnType<typeof sql.raw> {
  if (!ENCRYPTION_KEY) {
    throw new Error('Encryption key not configured')
  }

  return sql.raw(`pgp_sym_decrypt(${encryptedData}, '${ENCRYPTION_KEY}')`)
}

/**
 * Example: Store encrypted symptom submission
 */
export async function storeSymptomSubmission(
  userId: string,
  symptoms: string[],
  additionalInfo?: string
) {
  const symptomsStr = JSON.stringify(symptoms)

  await db.execute(sql`
    INSERT INTO symptom_submissions (
      user_id_hash,
      symptoms_encrypted,
      additional_info_encrypted
    ) VALUES (
      encode(digest(${userId}, 'sha256'), 'hex'),
      pgp_sym_encrypt(${symptomsStr}, ${ENCRYPTION_KEY}),
      ${additionalInfo ? sql`pgp_sym_encrypt(${additionalInfo}, ${ENCRYPTION_KEY})` : sql`NULL`}
    )
  `)
}

/**
 * Example: Retrieve and decrypt symptom submission
 */
export async function getSymptomSubmission(submissionId: string) {
  const result = await db.execute(sql`
    SELECT
      id,
      pgp_sym_decrypt(symptoms_encrypted, ${ENCRYPTION_KEY}) AS symptoms,
      pgp_sym_decrypt(additional_info_encrypted, ${ENCRYPTION_KEY}) AS additional_info,
      created_at
    FROM symptom_submissions
    WHERE id = ${submissionId}
  `)

  return result.rows[0]
}
```

---

## Key Rotation

### Recommended Schedule

- **Production**: Rotate encryption keys annually
- **After Security Incident**: Rotate immediately
- **Employee Departure**: Rotate if employee had key access

### Key Rotation Process

```sql
-- 1. Add new encrypted columns
ALTER TABLE symptom_submissions
  ADD COLUMN symptoms_encrypted_new BYTEA;

-- 2. Re-encrypt data with new key
UPDATE symptom_submissions
SET symptoms_encrypted_new = pgp_sym_encrypt(
  pgp_sym_decrypt(symptoms_encrypted, '<OLD_KEY>'),
  '<NEW_KEY>'
);

-- 3. Verify all data re-encrypted
SELECT COUNT(*) FROM symptom_submissions WHERE symptoms_encrypted_new IS NULL;

-- 4. Drop old column and rename new
ALTER TABLE symptom_submissions DROP COLUMN symptoms_encrypted;
ALTER TABLE symptom_submissions RENAME COLUMN symptoms_encrypted_new TO symptoms_encrypted;

-- 5. Update application environment variable
-- DATABASE_ENCRYPTION_KEY=<NEW_KEY>
```

---

## Verification & Testing

### Test Encryption

```sql
-- Test encryption/decryption
SELECT
  pgp_sym_decrypt(
    pgp_sym_encrypt('Test PHI data', '<ENCRYPTION_KEY>'),
    '<ENCRYPTION_KEY>'
  ) AS decrypted_value;

-- Should return: 'Test PHI data'
```

### Verify Encrypted Data

```sql
-- Check if data is actually encrypted (should show binary data)
SELECT
  symptoms_encrypted
FROM
  symptom_submissions
LIMIT 1;

-- Verify decryption works
SELECT
  pgp_sym_decrypt(symptoms_encrypted, '<ENCRYPTION_KEY>') AS symptoms
FROM
  symptom_submissions
LIMIT 1;
```

### Performance Testing

```sql
-- Benchmark encryption overhead
EXPLAIN ANALYZE
SELECT
  id,
  pgp_sym_decrypt(symptoms_encrypted, '<ENCRYPTION_KEY>') AS symptoms
FROM
  symptom_submissions
LIMIT 1000;
```

---

## Backup Encryption

Ensure backups are also encrypted:

### PostgreSQL pg_dump with Encryption

```bash
# Create encrypted backup
pg_dump -h localhost -U postgres verscienta_health | \
  openssl enc -aes-256-cbc -salt -pbkdf2 -out backup.sql.enc

# Restore from encrypted backup
openssl enc -aes-256-cbc -d -pbkdf2 -in backup.sql.enc | \
  psql -h localhost -U postgres verscienta_health
```

### Cloud Provider Backups

- **AWS RDS**: Automatic encrypted backups if instance encrypted
- **DigitalOcean**: Automatic encrypted backups
- **Supabase**: Automatic encrypted backups
- **Render**: Automatic encrypted backups

---

## Compliance Checklist

- [ ] Enable encryption at rest (full database or column-level)
- [ ] Use strong encryption keys (AES-256 or equivalent)
- [ ] Implement secure key management (environment variables + KMS)
- [ ] Encrypt all PHI fields (symptoms, health data, etc.)
- [ ] Test encryption/decryption functionality
- [ ] Verify backups are encrypted
- [ ] Document encryption implementation
- [ ] Establish key rotation schedule (annual)
- [ ] Train staff on encryption procedures
- [ ] Include encryption in disaster recovery plan

---

## Environment Variables

Add to `.env.production`:

```bash
# Database Encryption at Rest
DATABASE_ENCRYPTION_KEY=<generated-strong-key-32-bytes-base64>

# Or use AWS KMS (recommended)
DATABASE_ENCRYPTION_KEY_ENCRYPTED=<kms-encrypted-key>
AWS_KMS_KEY_ID=arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012
```

---

## Security Best Practices

1. **Key Storage**:
   - Never commit keys to version control
   - Use environment variables or secrets manager
   - Use AWS KMS, Google Cloud KMS, or Azure Key Vault

2. **Access Control**:
   - Limit access to encryption keys
   - Audit key access logs
   - Use role-based access control

3. **Monitoring**:
   - Monitor failed decryption attempts
   - Alert on encryption key access
   - Log all key rotation events

4. **Disaster Recovery**:
   - Store backup keys in separate location
   - Test key recovery procedures
   - Document key restoration process

---

## Resources

- [PostgreSQL pgcrypto Documentation](https://www.postgresql.org/docs/current/pgcrypto.html)
- [AWS RDS Encryption](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html)
- [HIPAA Security Rule §164.312](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html)
- [NIST Encryption Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)

---

## Support

For questions about database encryption:

- **Security Team**: security@verscienta.health
- **DevOps Team**: devops@verscienta.health
- **HIPAA Compliance**: compliance@verscienta.health

---

**Last Updated**: 2025-10-05
**Next Review**: 2025-11-05
