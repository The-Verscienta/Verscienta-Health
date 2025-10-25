/**
 * Password History Tests
 *
 * Comprehensive test suite for password history tracking and reuse prevention
 */

import bcrypt from 'bcryptjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addPasswordToHistory,
  checkPasswordHistory,
  cleanupOldPasswordHistory,
  deleteUserPasswordHistory,
  getPasswordHistory,
  getPasswordHistoryStats,
  PASSWORD_HISTORY_LIMIT,
} from '@/lib/password-history'
import { prisma } from '@/lib/prisma'

describe('Password History', () => {
  const testUserId = 'test-user-123'
  const testPassword1 = 'TestPassword1!'
  const testPassword2 = 'TestPassword2@'
  const testPassword3 = 'TestPassword3#'
  const testPassword4 = 'TestPassword4$'
  const testPassword5 = 'TestPassword5%'
  const testPassword6 = 'TestPassword6^'

  // Clean up test data before and after each test
  beforeEach(async () => {
    await prisma.passwordHistory.deleteMany({
      where: { userId: testUserId },
    })
  })

  afterEach(async () => {
    await prisma.passwordHistory.deleteMany({
      where: { userId: testUserId },
    })
  })

  describe('checkPasswordHistory', () => {
    it('should return false when user has no password history', async () => {
      const isReused = await checkPasswordHistory(testUserId, testPassword1)
      expect(isReused).toBe(false)
    })

    it('should return true when password matches recent history', async () => {
      // Add a password to history
      const hash = await bcrypt.hash(testPassword1, 10)
      await addPasswordToHistory(testUserId, hash)

      // Check if same password is reused
      const isReused = await checkPasswordHistory(testUserId, testPassword1)
      expect(isReused).toBe(true)
    })

    it('should return false when password does not match history', async () => {
      // Add a password to history
      const hash = await bcrypt.hash(testPassword1, 10)
      await addPasswordToHistory(testUserId, hash)

      // Check a different password
      const isReused = await checkPasswordHistory(testUserId, testPassword2)
      expect(isReused).toBe(false)
    })

    it('should check against last 5 passwords', async () => {
      // Add 5 passwords to history
      const passwords = [testPassword1, testPassword2, testPassword3, testPassword4, testPassword5]

      for (const password of passwords) {
        const hash = await bcrypt.hash(password, 10)
        await addPasswordToHistory(testUserId, hash)
      }

      // All 5 should be detected as reused
      for (const password of passwords) {
        const isReused = await checkPasswordHistory(testUserId, password)
        expect(isReused).toBe(true)
      }
    })

    it('should not detect passwords older than limit', async () => {
      // Add 6 passwords (more than limit of 5)
      const passwords = [
        testPassword1,
        testPassword2,
        testPassword3,
        testPassword4,
        testPassword5,
        testPassword6,
      ]

      for (const password of passwords) {
        const hash = await bcrypt.hash(password, 10)
        await addPasswordToHistory(testUserId, hash)
      }

      // First password should be deleted, so it should not be detected
      const isReused = await checkPasswordHistory(testUserId, testPassword1)
      expect(isReused).toBe(false)

      // Last 5 should still be detected
      const isReused2 = await checkPasswordHistory(testUserId, testPassword2)
      expect(isReused2).toBe(true)
    })

    it('should handle errors gracefully and return false', async () => {
      // Mock prisma to throw an error
      const originalFindMany = prisma.passwordHistory.findMany
      vi.spyOn(prisma.passwordHistory, 'findMany').mockRejectedValueOnce(
        new Error('Database error')
      )

      const isReused = await checkPasswordHistory(testUserId, testPassword1)
      expect(isReused).toBe(false)

      // Restore original function
      prisma.passwordHistory.findMany = originalFindMany
    })
  })

  describe('addPasswordToHistory', () => {
    it('should add password hash to history', async () => {
      const hash = await bcrypt.hash(testPassword1, 10)
      await addPasswordToHistory(testUserId, hash)

      const history = await prisma.passwordHistory.findMany({
        where: { userId: testUserId },
      })

      expect(history).toHaveLength(1)
      expect(history[0].passwordHash).toBe(hash)
    })

    it('should maintain only last 5 passwords', async () => {
      // Add 6 passwords
      const passwords = [
        testPassword1,
        testPassword2,
        testPassword3,
        testPassword4,
        testPassword5,
        testPassword6,
      ]

      for (const password of passwords) {
        const hash = await bcrypt.hash(password, 10)
        await addPasswordToHistory(testUserId, hash)
      }

      const history = await prisma.passwordHistory.findMany({
        where: { userId: testUserId },
        orderBy: { createdAt: 'desc' },
      })

      // Should only have 5 entries
      expect(history).toHaveLength(PASSWORD_HISTORY_LIMIT)

      // Verify the oldest password (testPassword1) was removed
      const hasOldest = await bcrypt.compare(testPassword1, history[4].passwordHash)
      expect(hasOldest).toBe(false)

      // Verify the newest password (testPassword6) is present
      const hasNewest = await bcrypt.compare(testPassword6, history[0].passwordHash)
      expect(hasNewest).toBe(true)
    })

    it('should delete excess entries beyond limit', async () => {
      // Add 7 passwords
      for (let i = 1; i <= 7; i++) {
        const hash = await bcrypt.hash(`TestPassword${i}!`, 10)
        await addPasswordToHistory(testUserId, hash)
      }

      const history = await prisma.passwordHistory.findMany({
        where: { userId: testUserId },
      })

      expect(history).toHaveLength(PASSWORD_HISTORY_LIMIT)
    })
  })

  describe('getPasswordHistory', () => {
    it('should return empty array when user has no history', async () => {
      const history = await getPasswordHistory(testUserId)
      expect(history).toEqual([])
    })

    it('should return password history without hashes', async () => {
      const hash = await bcrypt.hash(testPassword1, 10)
      await addPasswordToHistory(testUserId, hash)

      const history = await getPasswordHistory(testUserId)

      expect(history).toHaveLength(1)
      expect(history[0]).toHaveProperty('id')
      expect(history[0]).toHaveProperty('createdAt')
      expect(history[0]).not.toHaveProperty('passwordHash')
    })

    it('should return entries ordered by date (newest first)', async () => {
      // Add multiple passwords with delays
      const hash1 = await bcrypt.hash(testPassword1, 10)
      await addPasswordToHistory(testUserId, hash1)

      // Wait 10ms
      await new Promise((resolve) => setTimeout(resolve, 10))

      const hash2 = await bcrypt.hash(testPassword2, 10)
      await addPasswordToHistory(testUserId, hash2)

      const history = await getPasswordHistory(testUserId)

      expect(history).toHaveLength(2)
      expect(history[0].createdAt.getTime()).toBeGreaterThan(history[1].createdAt.getTime())
    })

    it('should respect limit parameter', async () => {
      // Add 5 passwords
      for (let i = 1; i <= 5; i++) {
        const hash = await bcrypt.hash(`TestPassword${i}!`, 10)
        await addPasswordToHistory(testUserId, hash)
      }

      const history = await getPasswordHistory(testUserId, 3)
      expect(history).toHaveLength(3)
    })

    it('should handle errors gracefully', async () => {
      const originalFindMany = prisma.passwordHistory.findMany
      vi.spyOn(prisma.passwordHistory, 'findMany').mockRejectedValueOnce(
        new Error('Database error')
      )

      const history = await getPasswordHistory(testUserId)
      expect(history).toEqual([])

      prisma.passwordHistory.findMany = originalFindMany
    })
  })

  describe('cleanupOldPasswordHistory', () => {
    it('should delete entries older than retention period', async () => {
      // Create old entry (2 years ago)
      const oldDate = new Date()
      oldDate.setFullYear(oldDate.getFullYear() - 2)

      const hash1 = await bcrypt.hash(testPassword1, 10)
      await prisma.passwordHistory.create({
        data: {
          userId: testUserId,
          passwordHash: hash1,
          createdAt: oldDate,
        },
      })

      // Create recent entry
      const hash2 = await bcrypt.hash(testPassword2, 10)
      await addPasswordToHistory(testUserId, hash2)

      const deletedCount = await cleanupOldPasswordHistory(365)
      expect(deletedCount).toBeGreaterThanOrEqual(1)

      // Verify old entry was deleted
      const history = await prisma.passwordHistory.findMany({
        where: { userId: testUserId },
      })

      expect(history).toHaveLength(1)
      const isRecent = await bcrypt.compare(testPassword2, history[0].passwordHash)
      expect(isRecent).toBe(true)
    })

    it('should keep last 5 passwords regardless of age', async () => {
      // Create 5 old entries (2 years ago)
      const oldDate = new Date()
      oldDate.setFullYear(oldDate.getFullYear() - 2)

      for (let i = 1; i <= 5; i++) {
        const hash = await bcrypt.hash(`TestPassword${i}!`, 10)
        await prisma.passwordHistory.create({
          data: {
            userId: testUserId,
            passwordHash: hash,
            createdAt: new Date(oldDate.getTime() + i * 1000), // Slightly different timestamps
          },
        })
      }

      const deletedCount = await cleanupOldPasswordHistory(365)
      expect(deletedCount).toBe(0) // Should not delete last 5 passwords

      // Verify all 5 are still there
      const history = await prisma.passwordHistory.findMany({
        where: { userId: testUserId },
      })

      expect(history).toHaveLength(5)
    })

    it('should only delete old entries beyond the last 5', async () => {
      // Create 8 old entries (2 years ago)
      const oldDate = new Date()
      oldDate.setFullYear(oldDate.getFullYear() - 2)

      for (let i = 1; i <= 8; i++) {
        const hash = await bcrypt.hash(`TestPassword${i}!`, 10)
        await prisma.passwordHistory.create({
          data: {
            userId: testUserId,
            passwordHash: hash,
            createdAt: new Date(oldDate.getTime() + i * 1000),
          },
        })
      }

      const deletedCount = await cleanupOldPasswordHistory(365)
      expect(deletedCount).toBe(3) // Should delete 3 oldest (8 - 5 = 3)

      // Verify 5 remain
      const history = await prisma.passwordHistory.findMany({
        where: { userId: testUserId },
      })

      expect(history).toHaveLength(5)
    })

    it('should not delete entries within retention period', async () => {
      // Create recent entry
      const hash = await bcrypt.hash(testPassword1, 10)
      await addPasswordToHistory(testUserId, hash)

      const deletedCount = await cleanupOldPasswordHistory(365)
      expect(deletedCount).toBe(0)

      // Verify entry still exists
      const history = await prisma.passwordHistory.findMany({
        where: { userId: testUserId },
      })

      expect(history).toHaveLength(1)
    })
  })

  describe('deleteUserPasswordHistory', () => {
    it('should delete all password history for a user', async () => {
      // Add multiple passwords
      for (let i = 1; i <= 3; i++) {
        const hash = await bcrypt.hash(`TestPassword${i}!`, 10)
        await addPasswordToHistory(testUserId, hash)
      }

      const deletedCount = await deleteUserPasswordHistory(testUserId)
      expect(deletedCount).toBe(3)

      // Verify all deleted
      const history = await prisma.passwordHistory.findMany({
        where: { userId: testUserId },
      })

      expect(history).toHaveLength(0)
    })

    it('should return 0 when user has no history', async () => {
      const deletedCount = await deleteUserPasswordHistory(testUserId)
      expect(deletedCount).toBe(0)
    })
  })

  describe('getPasswordHistoryStats', () => {
    it('should return zero stats when no history exists', async () => {
      const stats = await getPasswordHistoryStats()

      expect(stats.totalEntries).toBeGreaterThanOrEqual(0)
      expect(stats.totalUsers).toBeGreaterThanOrEqual(0)
      expect(stats.averageEntriesPerUser).toBeGreaterThanOrEqual(0)
    })

    it('should return correct stats with data', async () => {
      // Add password history for test user
      const hash = await bcrypt.hash(testPassword1, 10)
      await addPasswordToHistory(testUserId, hash)

      const stats = await getPasswordHistoryStats()

      expect(stats.totalEntries).toBeGreaterThanOrEqual(1)
      expect(stats.totalUsers).toBeGreaterThanOrEqual(1)
      expect(stats.averageEntriesPerUser).toBeGreaterThanOrEqual(0)
      expect(stats.newestEntry).toBeInstanceOf(Date)
    })

    it('should handle errors gracefully', async () => {
      const originalCount = prisma.passwordHistory.count
      vi.spyOn(prisma.passwordHistory, 'count').mockRejectedValueOnce(new Error('Database error'))

      const stats = await getPasswordHistoryStats()

      expect(stats.totalEntries).toBe(0)
      expect(stats.totalUsers).toBe(0)

      prisma.passwordHistory.count = originalCount
    })
  })

  describe('Integration Tests', () => {
    it('should prevent password reuse in realistic scenario', async () => {
      const passwords = [testPassword1, testPassword2, testPassword3]

      // Simulate password changes
      for (const password of passwords) {
        const hash = await bcrypt.hash(password, 10)
        await addPasswordToHistory(testUserId, hash)
      }

      // Try to reuse first password
      const isReused1 = await checkPasswordHistory(testUserId, testPassword1)
      expect(isReused1).toBe(true)

      // Try to reuse second password
      const isReused2 = await checkPasswordHistory(testUserId, testPassword2)
      expect(isReused2).toBe(true)

      // Try a new password
      const isReused3 = await checkPasswordHistory(testUserId, testPassword4)
      expect(isReused3).toBe(false)
    })

    it('should handle password rotation beyond limit', async () => {
      const passwords = [
        testPassword1,
        testPassword2,
        testPassword3,
        testPassword4,
        testPassword5,
        testPassword6,
      ]

      // Add 6 passwords
      for (const password of passwords) {
        const hash = await bcrypt.hash(password, 10)
        await addPasswordToHistory(testUserId, hash)
      }

      // First password should be gone
      const isReused1 = await checkPasswordHistory(testUserId, testPassword1)
      expect(isReused1).toBe(false)

      // Last 5 should be present
      const isReused6 = await checkPasswordHistory(testUserId, testPassword6)
      expect(isReused6).toBe(true)

      // Should be able to reuse first password now
      const hash = await bcrypt.hash(testPassword1, 10)
      await addPasswordToHistory(testUserId, hash)

      const isReused1Again = await checkPasswordHistory(testUserId, testPassword1)
      expect(isReused1Again).toBe(true)
    })
  })
})
