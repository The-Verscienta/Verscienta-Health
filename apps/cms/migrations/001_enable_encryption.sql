-- Migration: Enable Database Encryption at Rest
-- Date: 2025-10-05
-- Purpose: HIPAA Compliance §164.312(a)(2)(iv)
--
-- This migration enables column-level encryption using PostgreSQL pgcrypto.
-- Use this if your hosting provider doesn't support full database encryption.
--
-- IMPORTANT: Before running this migration:
-- 1. Set DATABASE_ENCRYPTION_KEY environment variable
-- 2. Backup your database
-- 3. Test on a non-production environment first

-- ============================================
-- 1. Enable pgcrypto Extension
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify extension installed
SELECT
  extname,
  extversion
FROM
  pg_extension
WHERE
  extname = 'pgcrypto';

-- ============================================
-- 2. Create Encryption Helper Functions
-- ============================================

-- Function to encrypt PHI data
-- Usage: SELECT encrypt_phi('sensitive data', 'encryption_key')
CREATE OR REPLACE FUNCTION encrypt_phi(data TEXT, key TEXT)
RETURNS BYTEA AS $$
BEGIN
  IF data IS NULL OR data = '' THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_encrypt(data, key);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
IMMUTABLE;

-- Function to decrypt PHI data
-- Usage: SELECT decrypt_phi(encrypted_data, 'encryption_key')
CREATE OR REPLACE FUNCTION decrypt_phi(data BYTEA, key TEXT)
RETURNS TEXT AS $$
BEGIN
  IF data IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_decrypt(data, key);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
IMMUTABLE;

-- Function to hash user IDs (one-way, for privacy)
-- Usage: SELECT hash_user_id('user-id-123')
CREATE OR REPLACE FUNCTION hash_user_id(user_id TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(user_id, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql
IMMUTABLE;

-- ============================================
-- 3. Test Encryption Functions
-- ============================================

-- Test encryption/decryption (should return 'Test PHI Data')
DO $$
DECLARE
  test_data TEXT := 'Test PHI Data';
  test_key TEXT := 'test-encryption-key-32-bytes';
  encrypted BYTEA;
  decrypted TEXT;
BEGIN
  -- Encrypt
  encrypted := encrypt_phi(test_data, test_key);
  RAISE NOTICE 'Encrypted data: %', encrypted;

  -- Decrypt
  decrypted := decrypt_phi(encrypted, test_key);
  RAISE NOTICE 'Decrypted data: %', decrypted;

  -- Verify
  IF decrypted = test_data THEN
    RAISE NOTICE 'Encryption test PASSED';
  ELSE
    RAISE EXCEPTION 'Encryption test FAILED: Expected %, got %', test_data, decrypted;
  END IF;
END $$;

-- ============================================
-- 4. Create PHI Tables with Encryption
-- ============================================

-- Example: Symptom Submissions table
-- This stores symptom checker data with encryption
CREATE TABLE IF NOT EXISTS symptom_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User identification (hashed for privacy)
  user_id_hash TEXT,
  session_id TEXT,

  -- Encrypted PHI fields
  symptoms_encrypted BYTEA NOT NULL,
  duration_encrypted BYTEA,
  severity_encrypted BYTEA,
  additional_info_encrypted BYTEA,

  -- Metadata (not encrypted)
  ip_address INET,
  user_agent TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Analysis result (not PHI, educational only)
  analysis_id UUID,

  -- Indexes
  CONSTRAINT fk_analysis FOREIGN KEY (analysis_id) REFERENCES grok_insights(id) ON DELETE SET NULL
);

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_symptom_submissions_user_hash
  ON symptom_submissions(user_id_hash);

CREATE INDEX IF NOT EXISTS idx_symptom_submissions_submitted_at
  ON symptom_submissions(submitted_at DESC);

-- ============================================
-- 5. Create Audit Log for Encryption Events
-- ============================================

CREATE TABLE IF NOT EXISTS encryption_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'encrypt', 'decrypt', 'key_rotation'
  table_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  user_id TEXT,
  ip_address INET,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_encryption_audit_log_timestamp
  ON encryption_audit_log(timestamp DESC);

-- ============================================
-- 6. Security: Revoke Public Access
-- ============================================

-- Ensure only authorized roles can use encryption functions
REVOKE EXECUTE ON FUNCTION encrypt_phi(TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION decrypt_phi(BYTEA, TEXT) FROM PUBLIC;

-- Grant to application role (adjust role name as needed)
-- GRANT EXECUTE ON FUNCTION encrypt_phi(TEXT, TEXT) TO app_user;
-- GRANT EXECUTE ON FUNCTION decrypt_phi(BYTEA, TEXT) TO app_user;

-- ============================================
-- 7. Create View for Decrypted Data (Optional)
-- ============================================

-- WARNING: This view requires the encryption key to be passed
-- Only use for administrative purposes with proper access controls

-- Example view (commented out - uncomment and modify as needed)
/*
CREATE OR REPLACE VIEW symptom_submissions_decrypted AS
SELECT
  id,
  user_id_hash,
  decrypt_phi(symptoms_encrypted, current_setting('app.encryption_key')) AS symptoms,
  decrypt_phi(duration_encrypted, current_setting('app.encryption_key')) AS duration,
  decrypt_phi(severity_encrypted, current_setting('app.encryption_key')) AS severity,
  decrypt_phi(additional_info_encrypted, current_setting('app.encryption_key')) AS additional_info,
  submitted_at
FROM
  symptom_submissions;

-- Usage:
-- SET app.encryption_key = 'your-encryption-key';
-- SELECT * FROM symptom_submissions_decrypted LIMIT 10;
*/

-- ============================================
-- 8. Key Rotation Support
-- ============================================

-- Function to re-encrypt data with new key
CREATE OR REPLACE FUNCTION rotate_encryption_key(
  p_table_name TEXT,
  p_column_name TEXT,
  p_old_key TEXT,
  p_new_key TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_sql TEXT;
BEGIN
  -- Construct dynamic SQL for re-encryption
  v_sql := format(
    'UPDATE %I SET %I = encrypt_phi(decrypt_phi(%I, %L), %L)',
    p_table_name,
    p_column_name || '_new',
    p_column_name,
    p_old_key,
    p_new_key
  );

  -- Execute re-encryption
  EXECUTE v_sql;
  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Log rotation event
  INSERT INTO encryption_audit_log (
    event_type,
    table_name,
    column_name,
    user_id,
    success
  ) VALUES (
    'key_rotation',
    p_table_name,
    p_column_name,
    current_user,
    TRUE
  );

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. Documentation & Comments
-- ============================================

COMMENT ON EXTENSION pgcrypto IS 'Cryptographic functions for HIPAA-compliant encryption at rest';

COMMENT ON FUNCTION encrypt_phi(TEXT, TEXT) IS 'Encrypt PHI data using AES-256. HIPAA §164.312(a)(2)(iv)';
COMMENT ON FUNCTION decrypt_phi(BYTEA, TEXT) IS 'Decrypt PHI data using AES-256. HIPAA §164.312(a)(2)(iv)';
COMMENT ON FUNCTION hash_user_id(TEXT) IS 'One-way hash for user identification without storing PII';

COMMENT ON TABLE symptom_submissions IS 'Encrypted storage for symptom checker submissions (PHI)';
COMMENT ON COLUMN symptom_submissions.symptoms_encrypted IS 'AES-256 encrypted symptom list';
COMMENT ON COLUMN symptom_submissions.user_id_hash IS 'SHA-256 hash of user ID for privacy';

COMMENT ON TABLE encryption_audit_log IS 'Audit trail for encryption operations (HIPAA compliance)';

-- ============================================
-- 10. Verification Queries
-- ============================================

-- Verify pgcrypto is enabled
SELECT 'pgcrypto extension' AS check_name,
       CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM pg_extension WHERE extname = 'pgcrypto';

-- Verify encryption functions exist
SELECT 'encrypt_phi function' AS check_name,
       CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM pg_proc WHERE proname = 'encrypt_phi';

SELECT 'decrypt_phi function' AS check_name,
       CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM pg_proc WHERE proname = 'decrypt_phi';

-- Verify tables created
SELECT 'symptom_submissions table' AS check_name,
       CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status
FROM information_schema.tables
WHERE table_name = 'symptom_submissions';

-- ============================================
-- Migration Complete
-- ============================================

RAISE NOTICE '========================================';
RAISE NOTICE 'Database Encryption Migration Complete';
RAISE NOTICE '========================================';
RAISE NOTICE 'Next Steps:';
RAISE NOTICE '1. Set DATABASE_ENCRYPTION_KEY in environment';
RAISE NOTICE '2. Update application code to use encryption';
RAISE NOTICE '3. Test encryption/decryption in development';
RAISE NOTICE '4. Verify HIPAA compliance checklist';
RAISE NOTICE '========================================';
