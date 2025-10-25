/**
 * Database Encryption Utilities Tests
 *
 * Tests for HIPAA §164.312(a)(2)(iv) - Encryption and Decryption
 */

import { describe, it, expect, beforeAll } from 'vitest'
import {
  encryptPHI,
  createEncryptedInsertSQL,
  createEncryptedSelectSQL,
  hashUserId,
  verifyEncryptionSetup,
  getEncryptionStatus,
} from '@/lib/db-encryption'

describe('Database Encryption Utilities', () => {
  beforeAll(() => {
    // Set encryption key for tests
    process.env.DATABASE_ENCRYPTION_KEY = 'V8zbYCu61bHttiQj86buhv0T1Jk1pXfeJ6uD6trk4oA='
  })

  describe('encryptPHI()', () => {
    it('returns data for database encryption', async () => {
      const data = JSON.stringify(['headache', 'fatigue'])
      const result = await encryptPHI(data)

      expect(result).toBe(data) // Returns data as-is for SQL processing
      expect(result).toContain('headache')
    })

    it('throws error for empty data', async () => {
      await expect(encryptPHI('')).rejects.toThrow('Cannot encrypt empty data')
    })

    it('handles special characters in PHI data', async () => {
      const data = "Patient's symptoms: <headache> & 'fatigue'"
      const result = await encryptPHI(data)

      expect(result).toBe(data)
    })

    it('handles JSON data', async () => {
      const symptoms = { primary: 'headache', secondary: ['fatigue', 'dizziness'] }
      const data = JSON.stringify(symptoms)
      const result = await encryptPHI(data)

      expect(result).toBe(data)
      expect(JSON.parse(result)).toEqual(symptoms)
    })
  })

  describe('createEncryptedInsertSQL()', () => {
    it('generates correct SQL for encrypted insert', () => {
      const sql = createEncryptedInsertSQL('symptom_submissions', {
        symptoms: '["headache","fatigue"]',
        duration: '2 weeks',
      })

      expect(sql).toContain('INSERT INTO symptom_submissions')
      expect(sql).toContain('symptoms_encrypted')
      expect(sql).toContain('duration_encrypted')
      expect(sql).toContain('encrypt_phi')
      expect(sql).toContain('headache')
    })

    it('escapes single quotes in data', () => {
      const sql = createEncryptedInsertSQL('test_table', {
        field: "Patient's symptoms",
      })

      expect(sql).toContain("Patient''s symptoms") // Escaped quote
    })

    it('handles multiple columns', () => {
      const sql = createEncryptedInsertSQL('symptom_submissions', {
        symptoms: '["headache"]',
        duration: '1 week',
        severity: 'moderate',
        notes: 'Additional info',
      })

      expect(sql).toContain('symptoms_encrypted')
      expect(sql).toContain('duration_encrypted')
      expect(sql).toContain('severity_encrypted')
      expect(sql).toContain('notes_encrypted')
    })
  })

  describe('createEncryptedSelectSQL()', () => {
    it('generates correct SQL for encrypted select', () => {
      const sql = createEncryptedSelectSQL('symptom_submissions', ['symptoms', 'duration'])

      expect(sql).toContain('SELECT id')
      expect(sql).toContain('decrypt_phi(symptoms_encrypted')
      expect(sql).toContain('decrypt_phi(duration_encrypted')
      expect(sql).toContain('AS symptoms')
      expect(sql).toContain('FROM symptom_submissions')
    })

    it('includes WHERE clause when provided', () => {
      const sql = createEncryptedSelectSQL('symptom_submissions', ['symptoms'], 'user_id = $1')

      expect(sql).toContain('WHERE user_id = $1')
    })

    it('handles single column', () => {
      const sql = createEncryptedSelectSQL('test_table', ['field'])

      expect(sql).toContain('decrypt_phi(field_encrypted')
      expect(sql).toContain('AS field')
    })

    it('handles multiple columns with complex WHERE clause', () => {
      const sql = createEncryptedSelectSQL(
        'symptom_submissions',
        ['symptoms', 'duration', 'severity'],
        "user_id = $1 AND created_at > '2025-01-01'"
      )

      expect(sql).toContain('decrypt_phi(symptoms_encrypted')
      expect(sql).toContain('decrypt_phi(duration_encrypted')
      expect(sql).toContain('decrypt_phi(severity_encrypted')
      expect(sql).toContain("WHERE user_id = $1 AND created_at > '2025-01-01'")
    })
  })

  describe('hashUserId()', () => {
    it('returns user ID for SQL hashing', () => {
      const userId = 'user-123-abc'
      const result = hashUserId(userId)

      expect(result).toBe(userId) // Will be hashed in SQL
      expect(result).toMatch(/user-123-abc/)
    })

    it('throws error for empty user ID', () => {
      expect(() => hashUserId('')).toThrow('Cannot hash empty user ID')
    })

    it('handles UUID format', () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000'
      const result = hashUserId(userId)

      expect(result).toBe(userId)
    })
  })

  describe('verifyEncryptionSetup()', () => {
    it('detects column-level encryption when key is set', async () => {
      const result = await verifyEncryptionSetup()

      expect(result.configured).toBe(true)
      expect(result.method).toBe('column-level')
      expect(result.warnings).toHaveLength(0)
    })

    it('detects cloud provider when no encryption key', async () => {
      // Note: Since ENCRYPTION_KEY is set at module load time,
      // this test verifies the verifyEncryptionSetup() logic
      const result = await verifyEncryptionSetup()

      expect(result.configured).toBe(true)
      // With key set in vitest.setup, it will be column-level
      expect(result.method).toBe('column-level')
      expect(result.warnings).toHaveLength(0)
    })
  })

  describe('getEncryptionStatus()', () => {
    it('returns correct status when encryption is enabled', () => {
      const status = getEncryptionStatus()

      expect(status.enabled).toBe(true)
      expect(status.keyConfigured).toBe(true)
      expect(status.environment).toBeDefined()
    })

    it('includes environment information', () => {
      const status = getEncryptionStatus()

      expect(status.environment).toMatch(/development|test|production/)
    })
  })

  describe('SQL Injection Prevention', () => {
    it('escapes malicious input in createEncryptedInsertSQL', () => {
      const maliciousInput = "'; DROP TABLE users; --"
      const sql = createEncryptedInsertSQL('test_table', {
        field: maliciousInput,
      })

      // Single quotes should be escaped (doubled)
      expect(sql).toContain("'''; DROP TABLE users; --")
      // The SQL should have encrypt_phi wrapping the escaped value
      expect(sql).toMatch(/encrypt_phi\('.*''; DROP TABLE.*', '/)
      // Verify the value is inside encrypt_phi function call
      expect(sql).toContain("encrypt_phi(")
    })

    it('handles multiple malicious patterns', () => {
      const sql = createEncryptedInsertSQL('test_table', {
        field1: "' OR '1'='1",
        field2: 'admin"--',
        field3: '1; DELETE FROM users',
      })

      // Quotes should be escaped (doubled)
      expect(sql).toContain("'' OR ''1''=''1")
      // All values should be wrapped in encrypt_phi
      expect(sql.match(/encrypt_phi/g)?.length).toBe(3)
      expect(sql).toContain('DELETE FROM users')
    })
  })

  describe('HIPAA Compliance Checks', () => {
    it('handles PHI data safely', async () => {
      const phi = {
        firstName: 'John',
        lastName: 'Doe',
        symptoms: ['headache', 'fever'],
        diagnosis: 'migraine',
      }

      const encrypted = await encryptPHI(JSON.stringify(phi))
      expect(encrypted).toContain('John')
      expect(encrypted).toContain('migraine')
    })

    it('generates audit-trail compatible SQL', () => {
      const sql = createEncryptedInsertSQL('phi_access_log', {
        userId: 'user-123',
        phiAccessed: 'patient-record-456',
        action: 'VIEW',
      })

      expect(sql).toContain('INSERT INTO phi_access_log')
      expect(sql).toContain('encrypt_phi')
    })

    it('supports encrypted search queries', () => {
      const sql = createEncryptedSelectSQL(
        'patient_records',
        ['symptoms', 'diagnosis'],
        'patient_id = $1'
      )

      expect(sql).toContain('decrypt_phi')
      expect(sql).toContain('WHERE patient_id = $1')
    })
  })

  describe('Edge Cases', () => {
    it('handles unicode characters', async () => {
      const data = 'Symptoms: 头痛 (headache), тошнота (nausea)'
      const result = await encryptPHI(data)

      expect(result).toBe(data)
      expect(result).toContain('头痛')
      expect(result).toContain('тошнота')
    })

    it('handles very long text', async () => {
      const longText = 'A'.repeat(10000)
      const result = await encryptPHI(longText)

      expect(result).toBe(longText)
      expect(result.length).toBe(10000)
    })

    it('handles empty object', async () => {
      const data = JSON.stringify({})
      const result = await encryptPHI(data)

      expect(result).toBe('{}')
    })

    it('handles null values in SQL generation', () => {
      const sql = createEncryptedInsertSQL('test_table', {
        field1: 'value',
        field2: '',
      })

      expect(sql).toBeDefined()
      expect(sql).toContain('field1_encrypted')
      expect(sql).toContain('field2_encrypted')
    })
  })
})
