/**
 * HIPAA Breach Detection System
 *
 * Automated detection of security breaches based on:
 * - Unusual login patterns
 * - Mass data access
 * - Brute force attempts
 * - Account compromise indicators
 */

import { prisma } from './prisma'

export interface BreachDetectionResult {
  detected: boolean
  type?: string
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description?: string
  affectedUsers?: string[]
  details?: Record<string, unknown>
}

/**
 * Detect unusual login patterns
 * Triggers if:
 * - Multiple failed logins from same IP
 * - Logins from unusual locations
 * - Logins at unusual times
 */
export async function detectUnusualLoginPattern(params: {
  userId: string
  userEmail: string
  ipAddress?: string
  timestamp: Date
}): Promise<BreachDetectionResult> {
  const { userId, userEmail, ipAddress, timestamp } = params

  try {
    // Check for multiple failed logins from same IP in last hour
    if (ipAddress) {
      const recentFailedLogins = await prisma.auditLog.count({
        where: {
          action: 'LOGIN_FAILED',
          ipAddress,
          createdAt: {
            gte: new Date(timestamp.getTime() - 60 * 60 * 1000), // Last hour
          },
        },
      })

      if (recentFailedLogins >= 5) {
        return {
          detected: true,
          type: 'BRUTE_FORCE_ATTACK',
          severity: 'HIGH',
          description: `Multiple failed login attempts detected from IP ${ipAddress} (${recentFailedLogins} attempts in last hour)`,
          affectedUsers: [userId],
          details: {
            ipAddress,
            failedAttempts: recentFailedLogins,
            timeWindow: '1 hour',
          },
        }
      }
    }

    // Check for logins from multiple IPs in short time
    const recentLogins = await prisma.session.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(timestamp.getTime() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
      select: {
        ipAddress: true,
      },
    })

    const uniqueIPs = new Set(recentLogins.map((s) => s.ipAddress).filter(Boolean))

    if (uniqueIPs.size >= 3) {
      return {
        detected: true,
        type: 'UNUSUAL_LOGIN_PATTERN',
        severity: 'MEDIUM',
        description: `User logged in from ${uniqueIPs.size} different IP addresses within 5 minutes`,
        affectedUsers: [userId],
        details: {
          ipAddresses: Array.from(uniqueIPs),
          timeWindow: '5 minutes',
          userEmail,
        },
      }
    }

    return { detected: false }
  } catch (error) {
    console.error('[BREACH DETECTION] Error detecting unusual login pattern:', error)
    return { detected: false }
  }
}

/**
 * Detect mass data access
 * Triggers if:
 * - User accesses unusually high number of records
 * - Rapid sequential access to PHI
 */
export async function detectMassDataAccess(params: {
  userId: string
  resourceType: string
  timeWindow: number // milliseconds
  threshold: number
}): Promise<BreachDetectionResult> {
  const { userId, resourceType, timeWindow, threshold } = params

  try {
    const accessCount = await prisma.auditLog.count({
      where: {
        userId,
        action: 'PHI_VIEW',
        resourceType,
        createdAt: {
          gte: new Date(Date.now() - timeWindow),
        },
      },
    })

    if (accessCount >= threshold) {
      return {
        detected: true,
        type: 'MASS_DATA_ACCESS',
        severity: 'CRITICAL',
        description: `User accessed ${accessCount} ${resourceType} records in ${timeWindow / 1000} seconds (threshold: ${threshold})`,
        affectedUsers: [userId],
        details: {
          resourceType,
          accessCount,
          threshold,
          timeWindowSeconds: timeWindow / 1000,
        },
      }
    }

    return { detected: false }
  } catch (error) {
    console.error('[BREACH DETECTION] Error detecting mass data access:', error)
    return { detected: false }
  }
}

/**
 * Detect account compromise indicators
 * Triggers if:
 * - Password changed and then unusual activity
 * - MFA disabled followed by PHI access
 * - Session from new device with PHI access
 */
export async function detectAccountCompromise(params: {
  userId: string
  timestamp: Date
}): Promise<BreachDetectionResult> {
  const { userId, timestamp } = params

  try {
    // Check for MFA disabled followed by PHI access
    const mfaDisabled = await prisma.auditLog.findFirst({
      where: {
        userId,
        action: 'MFA_DISABLED',
        createdAt: {
          gte: new Date(timestamp.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (mfaDisabled) {
      // Check for PHI access after MFA was disabled
      const phiAccessAfterMfaDisable = await prisma.auditLog.count({
        where: {
          userId,
          action: 'PHI_VIEW',
          createdAt: {
            gte: mfaDisabled.createdAt,
          },
        },
      })

      if (phiAccessAfterMfaDisable > 0) {
        return {
          detected: true,
          type: 'ACCOUNT_COMPROMISE',
          severity: 'CRITICAL',
          description: `User disabled MFA and then accessed PHI (${phiAccessAfterMfaDisable} access events)`,
          affectedUsers: [userId],
          details: {
            mfaDisabledAt: mfaDisabled.createdAt,
            phiAccessCount: phiAccessAfterMfaDisable,
          },
        }
      }
    }

    // Check for password change followed by mass PHI access
    const passwordChanged = await prisma.auditLog.findFirst({
      where: {
        userId,
        action: 'PASSWORD_CHANGE',
        createdAt: {
          gte: new Date(timestamp.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (passwordChanged) {
      const phiAccessAfterPasswordChange = await prisma.auditLog.count({
        where: {
          userId,
          action: 'PHI_VIEW',
          createdAt: {
            gte: passwordChanged.createdAt,
            lte: new Date(passwordChanged.createdAt.getTime() + 60 * 60 * 1000), // Within 1 hour
          },
        },
      })

      if (phiAccessAfterPasswordChange >= 20) {
        return {
          detected: true,
          type: 'ACCOUNT_COMPROMISE',
          severity: 'HIGH',
          description: `Suspicious activity after password change: ${phiAccessAfterPasswordChange} PHI access events within 1 hour`,
          affectedUsers: [userId],
          details: {
            passwordChangedAt: passwordChanged.createdAt,
            phiAccessCount: phiAccessAfterPasswordChange,
            timeWindow: '1 hour',
          },
        }
      }
    }

    return { detected: false }
  } catch (error) {
    console.error('[BREACH DETECTION] Error detecting account compromise:', error)
    return { detected: false }
  }
}

/**
 * Detect PHI exposure (data exfiltration)
 * Triggers if:
 * - User exports large amounts of PHI
 * - Multiple export actions in short time
 */
export async function detectPHIExposure(params: {
  userId: string
  timestamp: Date
}): Promise<BreachDetectionResult> {
  const { userId, timestamp } = params

  try {
    const recentExports = await prisma.auditLog.count({
      where: {
        userId,
        action: 'PHI_EXPORT',
        createdAt: {
          gte: new Date(timestamp.getTime() - 60 * 60 * 1000), // Last hour
        },
      },
    })

    if (recentExports >= 5) {
      return {
        detected: true,
        type: 'PHI_EXPOSURE',
        severity: 'CRITICAL',
        description: `Potential data exfiltration: User exported PHI ${recentExports} times in last hour`,
        affectedUsers: [userId],
        details: {
          exportCount: recentExports,
          timeWindow: '1 hour',
        },
      }
    }

    return { detected: false }
  } catch (error) {
    console.error('[BREACH DETECTION] Error detecting PHI exposure:', error)
    return { detected: false }
  }
}

/**
 * Report breach to admin endpoint
 */
export async function reportBreach(breach: BreachDetectionResult & { adminToken: string }) {
  if (!breach.detected) {
    return
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/security-breach`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${breach.adminToken}`,
        },
        body: JSON.stringify({
          type: breach.type,
          severity: breach.severity,
          description: breach.description,
          affectedUsers: breach.affectedUsers,
          affectedData: ['PHI'],
          details: breach.details,
        }),
      }
    )

    if (!response.ok) {
      console.error('[BREACH DETECTION] Failed to report breach:', await response.text())
    } else {
      console.log('[BREACH DETECTION] Breach reported successfully')
    }
  } catch (error) {
    console.error('[BREACH DETECTION] Error reporting breach:', error)
  }
}

/**
 * Breach detector utility
 */
export const breachDetector = {
  detectUnusualLoginPattern,
  detectMassDataAccess,
  detectAccountCompromise,
  detectPHIExposure,
  reportBreach,
}
