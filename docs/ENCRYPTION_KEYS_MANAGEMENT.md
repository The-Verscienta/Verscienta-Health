# Encryption Keys Management

**HIPAA §164.312(a)(2)(iv) - Encryption and Decryption**

This document provides comprehensive guidelines for managing encryption keys for database encryption at rest, ensuring HIPAA compliance and data security best practices.

---

## Table of Contents

1. [Overview](#overview)
2. [Encryption Methods](#encryption-methods)
3. [Key Generation](#key-generation)
4. [Key Storage](#key-storage)
5. [Key Rotation](#key-rotation)
6. [Access Control](#access-control)
7. [Backup and Recovery](#backup-and-recovery)
8. [Compliance Requirements](#compliance-requirements)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Verscienta Health supports two methods of database encryption at rest:

1. **Cloud Provider Encryption** (Recommended for production)
   - Full database encryption managed by cloud provider
   - Used by AWS RDS, DigitalOcean, Supabase, Render
   - No manual key management required

2. **Column-Level Encryption** (Optional, for additional security)
   - Encrypt specific PHI columns using PostgreSQL pgcrypto
   - Requires manual key management
   - Provides defense-in-depth security

---

## Encryption Methods

### Method 1: Cloud Provider Encryption (Recommended)

**Advantages:**
- Automatic encryption/decryption
- No performance overhead
- Managed key rotation
- Backup encryption included
- Compliance certifications (HIPAA, SOC 2, ISO 27001)

**Setup:**
```bash
# Set DATABASE_PROVIDER in .env
DATABASE_PROVIDER=supabase  # or aws-rds, digitalocean, render

# No DATABASE_ENCRYPTION_KEY needed
# Encryption is handled by the cloud provider
```

**Cloud Provider Settings:**

| Provider | Encryption Method | Verification |
|----------|-------------------|--------------|
| **Supabase** | AES-256 at rest | Enabled by default, verify in dashboard |
| **AWS RDS** | AWS KMS | Enable during instance creation |
| **DigitalOcean** | Managed encryption | Enabled by default on managed databases |
| **Render** | Disk-level encryption | Enabled by default for PostgreSQL |

### Method 2: Column-Level Encryption

**Use Cases:**
- Extra security for highly sensitive PHI
- Compliance requirements for field-level encryption
- Defense-in-depth security strategy

**Setup:**
```bash
# 1. Enable pgcrypto extension in PostgreSQL
psql -d verscienta_health -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"

# 2. Generate encryption key (see Key Generation section)
openssl rand -base64 32

# 3. Set DATABASE_ENCRYPTION_KEY in .env
DATABASE_ENCRYPTION_KEY=<generated-key>
```

---

## Key Generation

### Generating Secure Encryption Keys

**Requirements:**
- Minimum 32 characters (256-bit)
- Cryptographically random
- Base64 encoded for safe storage

**Methods:**

#### Option 1: OpenSSL (Recommended)
```bash
# Generate a 256-bit (32-byte) key
openssl rand -base64 32

# Example output:
# V8zbYCu61bHttiQj86buhv0T1Jk1pXfeJ6uD6trk4oA=
```

#### Option 2: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Option 3: Python
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Key Strength Validation

```bash
# Check key length
echo -n "YOUR_KEY_HERE" | wc -c
# Should output: 43-45 characters (32 bytes base64-encoded)

# Verify key is base64
echo "YOUR_KEY_HERE" | base64 -d > /dev/null && echo "Valid" || echo "Invalid"
```

---

## Key Storage

### ⚠️ CRITICAL SECURITY RULES

**DO:**
✅ Store keys in environment variables
✅ Use secrets management services (AWS Secrets Manager, HashiCorp Vault)
✅ Encrypt keys at rest using KMS (Key Management Service)
✅ Limit key access to essential personnel only
✅ Use separate keys for dev/staging/production

**DON'T:**
❌ Commit keys to version control (Git, SVN, etc.)
❌ Store keys in plaintext configuration files
❌ Share keys via email, Slack, or other messaging
❌ Reuse keys across multiple applications
❌ Log or display keys in application output

### Storage Options

#### Option 1: Environment Variables (Development)
```bash
# .env (NEVER commit this file)
DATABASE_ENCRYPTION_KEY=V8zbYCu61bHttiQj86buhv0T1Jk1pXfeJ6uD6trk4oA=
```

#### Option 2: AWS Secrets Manager (Production - Recommended)
```bash
# Store key in AWS Secrets Manager
aws secretsmanager create-secret \
  --name verscienta-db-encryption-key \
  --secret-string "YOUR_ENCRYPTION_KEY_HERE"

# Retrieve in application startup
aws secretsmanager get-secret-value \
  --secret-id verscienta-db-encryption-key \
  --query SecretString \
  --output text
```

#### Option 3: HashiCorp Vault (Enterprise)
```bash
# Store key in Vault
vault kv put secret/verscienta/db-encryption key=YOUR_KEY_HERE

# Retrieve in application
vault kv get -field=key secret/verscienta/db-encryption
```

#### Option 4: KMS-Encrypted Environment Variable
```bash
# 1. Encrypt key with AWS KMS
aws kms encrypt \
  --key-id alias/verscienta-encryption \
  --plaintext "YOUR_KEY_HERE" \
  --query CiphertextBlob \
  --output text > encrypted-key.txt

# 2. Store encrypted key in .env
DATABASE_ENCRYPTION_KEY_ENCRYPTED=$(cat encrypted-key.txt)

# 3. Decrypt at runtime (add to lib/db-encryption.ts)
const encryptedKey = process.env.DATABASE_ENCRYPTION_KEY_ENCRYPTED
const ENCRYPTION_KEY = await kms.decrypt({ CiphertextBlob: Buffer.from(encryptedKey, 'base64') })
```

---

## Key Rotation

**HIPAA Recommendation:** Rotate encryption keys annually or after security incidents.

### Rotation Process

#### Step 1: Generate New Key
```bash
# Generate new key
NEW_KEY=$(openssl rand -base64 32)
echo "New key: $NEW_KEY"
```

#### Step 2: Re-encrypt Existing Data
```sql
-- Create rotation script
-- apps/web/scripts/rotate-encryption-key.sql

BEGIN;

-- Add new column for re-encrypted data
ALTER TABLE symptom_submissions ADD COLUMN symptoms_encrypted_new BYTEA;

-- Re-encrypt with new key
UPDATE symptom_submissions
SET symptoms_encrypted_new = pgp_sym_encrypt(
  pgp_sym_decrypt(symptoms_encrypted, 'OLD_KEY'),
  'NEW_KEY'
)
WHERE symptoms_encrypted IS NOT NULL;

-- Swap columns
ALTER TABLE symptom_submissions DROP COLUMN symptoms_encrypted;
ALTER TABLE symptom_submissions RENAME COLUMN symptoms_encrypted_new TO symptoms_encrypted;

COMMIT;
```

#### Step 3: Update Environment Variable
```bash
# Update .env or secrets manager
DATABASE_ENCRYPTION_KEY=NEW_KEY_HERE
```

#### Step 4: Deploy and Verify
```bash
# Test encryption with new key
pnpm tsx scripts/verify-database-encryption.ts

# Deploy application with new key
# Monitor for any decryption errors
```

### Automated Rotation (AWS KMS Example)
```bash
# Enable automatic key rotation in AWS KMS
aws kms enable-key-rotation \
  --key-id alias/verscienta-encryption

# Verify rotation is enabled
aws kms get-key-rotation-status \
  --key-id alias/verscienta-encryption
```

---

## Access Control

### Who Should Have Access?

| Role | Access Level | Justification |
|------|--------------|---------------|
| **DevOps Engineers** | Production keys | Deploy and maintain infrastructure |
| **Security Team** | All keys (readonly) | Audit and compliance verification |
| **Backend Developers** | Development keys only | Local testing |
| **Database Administrators** | Production keys | Database maintenance |
| **Everyone Else** | None | Principle of least privilege |

### Access Control Implementation

#### AWS IAM Policy Example
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:verscienta-db-encryption-key-*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "us-east-1"
        }
      }
    }
  ]
}
```

### Audit Logging
```bash
# Enable CloudTrail logging for Secrets Manager
aws cloudtrail create-trail \
  --name verscienta-secrets-audit \
  --s3-bucket-name verscienta-audit-logs

# Monitor key access
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=verscienta-db-encryption-key
```

---

## Backup and Recovery

### Key Backup Strategy

**Critical:** Loss of encryption keys = permanent data loss!

#### Backup Locations (Store in at least 2 separate locations)

1. **Primary:** AWS Secrets Manager (automatic backups)
2. **Secondary:** Encrypted USB drive in physical safe
3. **Tertiary:** Password manager (1Password, LastPass) for authorized personnel

#### Backup Procedure
```bash
# 1. Export key to encrypted file
echo "DATABASE_ENCRYPTION_KEY=$(openssl rand -base64 32)" > key.txt

# 2. Encrypt backup file
openssl enc -aes-256-cbc -salt -in key.txt -out key.txt.enc
# Enter secure passphrase

# 3. Store in multiple locations (safe, password manager, etc.)

# 4. Test recovery
openssl enc -aes-256-cbc -d -in key.txt.enc -out key-recovered.txt
# Verify key matches

# 5. Securely delete plaintext file
shred -u key.txt key-recovered.txt
```

### Key Recovery Process

```bash
# 1. Retrieve from backup location
cat key.txt.enc

# 2. Decrypt backup
openssl enc -aes-256-cbc -d -in key.txt.enc -out key.txt

# 3. Extract key value
cat key.txt
# Output: DATABASE_ENCRYPTION_KEY=V8zbYCu61bHttiQj86buhv0T1Jk1pXfeJ6uD6trk4oA=

# 4. Restore to environment or secrets manager
export DATABASE_ENCRYPTION_KEY="V8zbYCu61bHttiQj86buhv0T1Jk1pXfeJ6uD6trk4oA="

# 5. Verify encryption works
pnpm tsx scripts/verify-database-encryption.ts

# 6. Securely delete recovery file
shred -u key.txt
```

---

## Compliance Requirements

### HIPAA §164.312(a)(2)(iv)

**Required Controls:**

✅ **Encryption Mechanism**
- Implement encryption for ePHI at rest
- Use NIST-approved algorithms (AES-256, pgcrypto)

✅ **Key Management**
- Secure key generation, storage, and rotation
- Access controls limiting key access
- Audit logging of key usage

✅ **Documentation**
- Document encryption methods used
- Maintain key rotation schedules
- Record access control policies

### Compliance Checklist

- [ ] Encryption enabled on production database
- [ ] Encryption keys stored securely (not in code)
- [ ] Key rotation policy documented (minimum annually)
- [ ] Access controls implemented and audited
- [ ] Backup encryption verified
- [ ] Key recovery process tested
- [ ] Compliance verification script passing

### Run Compliance Verification
```bash
cd apps/web
pnpm tsx scripts/verify-database-encryption.ts
```

Expected output:
```
✅ ENCRYPTION VERIFICATION PASSED
   All encryption checks passed successfully.
```

---

## Troubleshooting

### Issue: "DATABASE_ENCRYPTION_KEY not configured"

**Cause:** Environment variable not set

**Solution:**
```bash
# Check if key is set
echo $DATABASE_ENCRYPTION_KEY

# If empty, add to .env
echo "DATABASE_ENCRYPTION_KEY=$(openssl rand -base64 32)" >> .env

# Reload environment
source .env
```

### Issue: "Cannot decrypt data"

**Cause:** Wrong encryption key or corrupted data

**Solution:**
```bash
# 1. Verify you're using the correct key
echo $DATABASE_ENCRYPTION_KEY

# 2. Test encryption/decryption
psql -d verscienta_health -c "
  SELECT pgp_sym_decrypt(
    pgp_sym_encrypt('test', '$DATABASE_ENCRYPTION_KEY'),
    '$DATABASE_ENCRYPTION_KEY'
  ) AS result;
"
# Should output: test

# 3. If test passes but data still fails, key may have been rotated
# Check backup keys or contact database administrator
```

### Issue: "pgcrypto extension not found"

**Cause:** Extension not installed

**Solution:**
```bash
# Install pgcrypto extension
psql -d verscienta_health -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"

# Verify installation
psql -d verscienta_health -c "
  SELECT extname, extversion
  FROM pg_extension
  WHERE extname = 'pgcrypto';
"
```

### Issue: "SSL connection required but not available"

**Cause:** Database not configured for SSL

**Solution:**
```bash
# Update DATABASE_URL with SSL mode
# Before:
DATABASE_URL=postgresql://user:pass@host:5432/db

# After:
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# For self-signed certificates:
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require&sslrootcert=/path/to/ca.crt
```

---

## Additional Resources

- [PostgreSQL pgcrypto Documentation](https://www.postgresql.org/docs/current/pgcrypto.html)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [NIST Cryptographic Standards](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)
- [AWS KMS Best Practices](https://docs.aws.amazon.com/kms/latest/developerguide/best-practices.html)

---

## Questions or Issues?

If you have questions about encryption keys management:

1. Check this documentation first
2. Run the verification script: `pnpm tsx scripts/verify-database-encryption.ts`
3. Contact the security team
4. Review HIPAA compliance documentation in `docs/HIPAA_COMPLIANCE.md`

---

**Last Updated:** 2025-10-24
**Document Owner:** Security Team
**Review Schedule:** Quarterly
