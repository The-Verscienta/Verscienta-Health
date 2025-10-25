/**
 * Password History Management
 *
 * HIPAA-compliant password history tracking to prevent password reuse
 *
 * Features:
 * - Store last 5 password hashes per user
 * - Prevent reuse of recent passwords
 * - Automatic cleanup of old entries (>1 year)
 * - bcrypt comparison for secure password checking
 *
 * Usage:
 *   import { checkPasswordHistory, addPasswordToHistory } from '@/lib/password-history'
 *
 *   // Before changing password
 *   const isReused = await checkPasswordHistory(userId, newPassword)
 *   if (isReused) {
 *     throw new Error('Password was recently used')
 *   }
 *
 *   // After changing password
 *   await addPasswordToHistory(userId, hashedPassword)
 */

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

/**
 * Number of recent passwords to store and check against
 * HIPAA recommendation: 5-10 passwords
 */
export const PASSWORD_HISTORY_LIMIT = 5

/**
 * Retention period for password history in days
 * Keep at least 1 year for compliance, but maintain last 5 regardless of age
 */
export const PASSWORD_HISTORY_RETENTION_DAYS = 365

/**
 * Check if a password has been used recently
 *
 * @param userId - User ID to check password history for
 * @param plainPassword - Plain text password to check
 * @returns true if password was used in last 5 passwords, false otherwise
 *
 * @example
 * ```ts
 * const isReused = await checkPasswordHistory('user_123', 'newPassword123')
 * if (isReused) {
 *   return res.status(400).json({ error: 'Cannot reuse recent passwords' })
 * }
 * ```
 */
export async function checkPasswordHistory(
  userId: string,
  plainPassword: string
): Promise<boolean> {
  try {
    // Get last N password hashes for the user
    const passwordHistory = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PASSWORD_HISTORY_LIMIT,
      select: {
        passwordHash: true,
      },
    })

    // Check if the new password matches any recent passwords
    for (const record of passwordHistory) {
      const isMatch = await bcrypt.compare(plainPassword, record.passwordHash)
      if (isMatch) {
        console.log(`[Password History] Password reuse detected for user ${userId}`)
        return true
      }
    }

    return false
  } catch (error) {
    console.error('[Password History] Error checking password history:', error)
    // Fail open - don't block password change if history check fails
    return false
  }
}

/**
 * Add a password hash to user's password history
 *
 * Automatically maintains only the last N passwords and removes older entries
 *
 * @param userId - User ID
 * @param passwordHash - bcrypt hash of the password
 *
 * @example
 * ```ts
 * const hashedPassword = await bcrypt.hash(newPassword, 12)
 * await addPasswordToHistory(userId, hashedPassword)
 * ```
 */
export async function addPasswordToHistory(userId: string, passwordHash: string): Promise<void> {
  try {
    // Add new password to history
    await prisma.passwordHistory.create({
      data: {
        userId,
        passwordHash,
      },
    })

    // Keep only the last N passwords
    // Delete older entries beyond the limit
    const allHistory = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })

    if (allHistory.length > PASSWORD_HISTORY_LIMIT) {
      const idsToDelete = allHistory.slice(PASSWORD_HISTORY_LIMIT).map((h) => h.id)

      await prisma.passwordHistory.deleteMany({
        where: {
          id: { in: idsToDelete },
        },
      })

      console.log(
        `[Password History] Cleaned up ${idsToDelete.length} old password entries for user ${userId}`
      )
    }
  } catch (error) {
    console.error('[Password History] Error adding password to history:', error)
    throw error
  }
}

/**
 * Get user's password history (for admin purposes)
 *
 * @param userId - User ID
 * @param limit - Number of records to return (default: PASSWORD_HISTORY_LIMIT)
 * @returns Array of password history records (without hashes for security)
 *
 * @example
 * ```ts
 * const history = await getPasswordHistory('user_123')
 * console.log(`User has ${history.length} passwords in history`)
 * ```
 */
export async function getPasswordHistory(
  userId: string,
  limit: number = PASSWORD_HISTORY_LIMIT
): Promise<Array<{ id: string; createdAt: Date }>> {
  try {
    const history = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        // Don't return passwordHash for security
      },
    })

    return history
  } catch (error) {
    console.error('[Password History] Error getting password history:', error)
    return []
  }
}

/**
 * Cleanup old password history entries
 *
 * Deletes password history older than retention period,
 * but always keeps the last N passwords regardless of age
 *
 * @param retentionDays - Number of days to retain (default: 365)
 * @returns Number of deleted records
 *
 * @example
 * ```ts
 * // Run this in a cron job
 * const deletedCount = await cleanupOldPasswordHistory()
 * console.log(`Deleted ${deletedCount} old password history entries`)
 * ```
 */
export async function cleanupOldPasswordHistory(
  retentionDays: number = PASSWORD_HISTORY_RETENTION_DAYS
): Promise<number> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true },
    })

    let totalDeleted = 0

    for (const user of users) {
      // Get all password history for this user, ordered by date (newest first)
      const allHistory = await prisma.passwordHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
        },
      })

      // Keep the last N passwords regardless of age
      const toKeep = allHistory.slice(0, PASSWORD_HISTORY_LIMIT)
      const _toKeepIds = new Set(toKeep.map((h) => h.id))

      // From the remaining (older) entries, delete those beyond retention period
      const oldEntries = allHistory
        .slice(PASSWORD_HISTORY_LIMIT)
        .filter((h) => h.createdAt < cutoffDate)

      if (oldEntries.length > 0) {
        const idsToDelete = oldEntries.map((h) => h.id)

        const result = await prisma.passwordHistory.deleteMany({
          where: {
            id: { in: idsToDelete },
          },
        })

        totalDeleted += result.count
      }
    }

    console.log(
      `[Password History] Cleanup complete. Deleted ${totalDeleted} old password history entries (older than ${retentionDays} days)`
    )

    return totalDeleted
  } catch (error) {
    console.error('[Password History] Error during cleanup:', error)
    throw error
  }
}

/**
 * Delete all password history for a user
 *
 * Used when a user account is deleted (GDPR/HIPAA compliance)
 *
 * @param userId - User ID
 * @returns Number of deleted records
 *
 * @example
 * ```ts
 * // When deleting a user account
 * await deleteUserPasswordHistory(userId)
 * ```
 */
export async function deleteUserPasswordHistory(userId: string): Promise<number> {
  try {
    const result = await prisma.passwordHistory.deleteMany({
      where: { userId },
    })

    console.log(
      `[Password History] Deleted ${result.count} password history entries for user ${userId}`
    )

    return result.count
  } catch (error) {
    console.error('[Password History] Error deleting user password history:', error)
    throw error
  }
}

/**
 * Get statistics about password history
 *
 * @returns Statistics object with counts and averages
 *
 * @example
 * ```ts
 * const stats = await getPasswordHistoryStats()
 * console.log(`Total password history entries: ${stats.totalEntries}`)
 * ```
 */
export async function getPasswordHistoryStats(): Promise<{
  totalEntries: number
  totalUsers: number
  averageEntriesPerUser: number
  oldestEntry: Date | null
  newestEntry: Date | null
}> {
  try {
    const [totalEntries, totalUsers, oldest, newest] = await Promise.all([
      prisma.passwordHistory.count(),
      prisma.passwordHistory.groupBy({
        by: ['userId'],
        _count: true,
      }),
      prisma.passwordHistory.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
      prisma.passwordHistory.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ])

    const averageEntriesPerUser = totalUsers.length > 0 ? totalEntries / totalUsers.length : 0

    return {
      totalEntries,
      totalUsers: totalUsers.length,
      averageEntriesPerUser: Math.round(averageEntriesPerUser * 100) / 100,
      oldestEntry: oldest?.createdAt || null,
      newestEntry: newest?.createdAt || null,
    }
  } catch (error) {
    console.error('[Password History] Error getting stats:', error)
    return {
      totalEntries: 0,
      totalUsers: 0,
      averageEntriesPerUser: 0,
      oldestEntry: null,
      newestEntry: null,
    }
  }
}
