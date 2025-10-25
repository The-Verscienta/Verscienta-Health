/**
 * Session Activity Logging
 *
 * Extends audit logging to track detailed session activities for:
 * - HIPAA compliance reporting
 * - Security forensics
 * - User behavior analytics
 * - Suspicious activity detection
 */

import { AuditAction, AuditSeverity, createAuditLog } from './audit-log'

export enum SessionEvent {
  // Session lifecycle
  SESSION_START = 'SESSION_START',
  SESSION_REFRESH = 'SESSION_REFRESH',
  SESSION_TIMEOUT = 'SESSION_TIMEOUT',
  SESSION_END = 'SESSION_END',

  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT_MANUAL = 'LOGOUT_MANUAL',
  LOGOUT_AUTOMATIC = 'LOGOUT_AUTOMATIC',

  // MFA events
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  MFA_CHALLENGE = 'MFA_CHALLENGE',
  MFA_SUCCESS = 'MFA_SUCCESS',
  MFA_FAILURE = 'MFA_FAILURE',
  MFA_BACKUP_CODE_USED = 'MFA_BACKUP_CODE_USED',

  // OAuth events
  OAUTH_INITIATED = 'OAUTH_INITIATED',
  OAUTH_CALLBACK = 'OAUTH_CALLBACK',
  OAUTH_SUCCESS = 'OAUTH_SUCCESS',
  OAUTH_FAILURE = 'OAUTH_FAILURE',

  // Magic link events
  MAGIC_LINK_REQUESTED = 'MAGIC_LINK_REQUESTED',
  MAGIC_LINK_SENT = 'MAGIC_LINK_SENT',
  MAGIC_LINK_CLICKED = 'MAGIC_LINK_CLICKED',
  MAGIC_LINK_EXPIRED = 'MAGIC_LINK_EXPIRED',

  // Session activity
  IDLE_WARNING = 'IDLE_WARNING',
  ACTIVITY_DETECTED = 'ACTIVITY_DETECTED',
  SESSION_EXTENDED = 'SESSION_EXTENDED',

  // Security events
  CONCURRENT_SESSION_DETECTED = 'CONCURRENT_SESSION_DETECTED',
  SESSION_HIJACK_SUSPECTED = 'SESSION_HIJACK_SUSPECTED',
  DEVICE_CHANGE_DETECTED = 'DEVICE_CHANGE_DETECTED',
  LOCATION_CHANGE_DETECTED = 'LOCATION_CHANGE_DETECTED',
}

export interface SessionLogEntry {
  sessionId: string
  userId?: string
  userEmail?: string
  event: SessionEvent
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  deviceId?: string
  location?: string
  metadata?: Record<string, any>
}

/**
 * Log session activity
 */
export async function logSessionActivity(entry: Omit<SessionLogEntry, 'timestamp'>): Promise<void> {
  const severity = getSeverityForEvent(entry.event)

  await createAuditLog({
    action: mapEventToAction(entry.event),
    userId: entry.userId,
    userEmail: entry.userEmail,
    sessionId: entry.sessionId,
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
    details: {
      event: entry.event,
      deviceId: entry.deviceId,
      location: entry.location,
      ...entry.metadata,
    },
    severity,
    success: !isFailureEvent(entry.event),
  })
}

/**
 * Map session event to audit action
 */
function mapEventToAction(event: SessionEvent): AuditAction {
  switch (event) {
    case SessionEvent.SESSION_START:
    case SessionEvent.LOGIN_SUCCESS:
    case SessionEvent.OAUTH_SUCCESS:
    case SessionEvent.MAGIC_LINK_CLICKED:
      return AuditAction.LOGIN

    case SessionEvent.SESSION_END:
    case SessionEvent.LOGOUT_MANUAL:
    case SessionEvent.LOGOUT_AUTOMATIC:
    case SessionEvent.SESSION_TIMEOUT:
      return AuditAction.LOGOUT

    case SessionEvent.LOGIN_FAILURE:
    case SessionEvent.OAUTH_FAILURE:
    case SessionEvent.MAGIC_LINK_EXPIRED:
      return AuditAction.LOGIN_FAILED

    case SessionEvent.MFA_ENABLED:
      return AuditAction.MFA_ENABLED

    case SessionEvent.MFA_DISABLED:
      return AuditAction.MFA_DISABLED

    case SessionEvent.CONCURRENT_SESSION_DETECTED:
    case SessionEvent.SESSION_HIJACK_SUSPECTED:
    case SessionEvent.DEVICE_CHANGE_DETECTED:
    case SessionEvent.LOCATION_CHANGE_DETECTED:
      return AuditAction.SUSPICIOUS_ACTIVITY

    default:
      return AuditAction.LOGIN // Default fallback
  }
}

/**
 * Get severity level for session event
 */
function getSeverityForEvent(event: SessionEvent): AuditSeverity {
  const criticalEvents = [
    SessionEvent.SESSION_HIJACK_SUSPECTED,
    SessionEvent.CONCURRENT_SESSION_DETECTED,
  ]

  const warningEvents = [
    SessionEvent.LOGIN_FAILURE,
    SessionEvent.MFA_FAILURE,
    SessionEvent.DEVICE_CHANGE_DETECTED,
    SessionEvent.LOCATION_CHANGE_DETECTED,
    SessionEvent.MAGIC_LINK_EXPIRED,
  ]

  if (criticalEvents.includes(event)) {
    return AuditSeverity.CRITICAL
  }

  if (warningEvents.includes(event)) {
    return AuditSeverity.WARNING
  }

  return AuditSeverity.INFO
}

/**
 * Check if event represents a failure
 */
function isFailureEvent(event: SessionEvent): boolean {
  const failureEvents = [
    SessionEvent.LOGIN_FAILURE,
    SessionEvent.MFA_FAILURE,
    SessionEvent.OAUTH_FAILURE,
    SessionEvent.MAGIC_LINK_EXPIRED,
    SessionEvent.SESSION_HIJACK_SUSPECTED,
  ]

  return failureEvents.includes(event)
}

/**
 * Helper functions for common session logging scenarios
 */
export const sessionLogger = {
  /**
   * Log successful login
   */
  loginSuccess: async (params: {
    sessionId: string
    userId: string
    userEmail: string
    ipAddress?: string
    userAgent?: string
    mfaUsed?: boolean
    provider?: 'email' | 'google' | 'github' | 'magic-link'
  }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      userEmail: params.userEmail,
      event: SessionEvent.LOGIN_SUCCESS,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: {
        mfaUsed: params.mfaUsed || false,
        provider: params.provider || 'email',
      },
    })
  },

  /**
   * Log failed login attempt
   */
  loginFailure: async (params: {
    sessionId: string
    userEmail: string
    ipAddress?: string
    userAgent?: string
    reason?: string
  }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userEmail: params.userEmail,
      event: SessionEvent.LOGIN_FAILURE,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: {
        reason: params.reason || 'Invalid credentials',
      },
    })
  },

  /**
   * Log session start (includes token issuance details)
   */
  sessionStart: async (params: {
    sessionId: string
    userId: string
    userEmail: string
    ipAddress?: string
    userAgent?: string
    expiresAt?: Date
  }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      userEmail: params.userEmail,
      event: SessionEvent.SESSION_START,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: {
        expiresAt: params.expiresAt?.toISOString(),
      },
    })
  },

  /**
   * Log session refresh (extends expiration)
   */
  sessionRefresh: async (params: { sessionId: string; userId: string; newExpiresAt?: Date }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      event: SessionEvent.SESSION_REFRESH,
      metadata: {
        newExpiresAt: params.newExpiresAt?.toISOString(),
      },
    })
  },

  /**
   * Log session timeout (automatic logout)
   */
  sessionTimeout: async (params: {
    sessionId: string
    userId: string
    reason: 'inactivity' | 'expiration'
  }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      event: SessionEvent.SESSION_TIMEOUT,
      metadata: {
        reason: params.reason,
      },
    })
  },

  /**
   * Log manual logout
   */
  logout: async (params: { sessionId: string; userId: string; manual?: boolean }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      event: params.manual ? SessionEvent.LOGOUT_MANUAL : SessionEvent.LOGOUT_AUTOMATIC,
    })
  },

  /**
   * Log MFA challenge
   */
  mfaChallenge: async (params: { sessionId: string; userId: string; userEmail: string }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      userEmail: params.userEmail,
      event: SessionEvent.MFA_CHALLENGE,
    })
  },

  /**
   * Log successful MFA verification
   */
  mfaSuccess: async (params: { sessionId: string; userId: string; backupCodeUsed?: boolean }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      event: params.backupCodeUsed ? SessionEvent.MFA_BACKUP_CODE_USED : SessionEvent.MFA_SUCCESS,
    })
  },

  /**
   * Log failed MFA verification
   */
  mfaFailure: async (params: { sessionId: string; userId: string; attemptCount?: number }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      event: SessionEvent.MFA_FAILURE,
      metadata: {
        attemptCount: params.attemptCount || 1,
      },
    })
  },

  /**
   * Log OAuth flow initiation
   */
  oauthInitiated: async (params: { sessionId: string; provider: 'google' | 'github' }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      event: SessionEvent.OAUTH_INITIATED,
      metadata: {
        provider: params.provider,
      },
    })
  },

  /**
   * Log OAuth success
   */
  oauthSuccess: async (params: {
    sessionId: string
    userId: string
    userEmail: string
    provider: 'google' | 'github'
  }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      userEmail: params.userEmail,
      event: SessionEvent.OAUTH_SUCCESS,
      metadata: {
        provider: params.provider,
      },
    })
  },

  /**
   * Log magic link request
   */
  magicLinkRequested: async (params: { sessionId: string; userEmail: string }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userEmail: params.userEmail,
      event: SessionEvent.MAGIC_LINK_REQUESTED,
    })
  },

  /**
   * Log magic link clicked
   */
  magicLinkClicked: async (params: { sessionId: string; userId: string; userEmail: string }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      userEmail: params.userEmail,
      event: SessionEvent.MAGIC_LINK_CLICKED,
    })
  },

  /**
   * Log idle warning shown to user
   */
  idleWarning: async (params: { sessionId: string; userId: string; minutesRemaining: number }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      event: SessionEvent.IDLE_WARNING,
      metadata: {
        minutesRemaining: params.minutesRemaining,
      },
    })
  },

  /**
   * Log session extension (user clicked "continue")
   */
  sessionExtended: async (params: { sessionId: string; userId: string }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      event: SessionEvent.SESSION_EXTENDED,
    })
  },

  /**
   * Log concurrent session detection (security event)
   */
  concurrentSession: async (params: {
    sessionId: string
    userId: string
    newIpAddress?: string
    newDeviceId?: string
  }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      event: SessionEvent.CONCURRENT_SESSION_DETECTED,
      metadata: {
        newIpAddress: params.newIpAddress,
        newDeviceId: params.newDeviceId,
      },
    })
  },

  /**
   * Log suspicious device/location change
   */
  suspiciousChange: async (params: {
    sessionId: string
    userId: string
    changeType: 'device' | 'location'
    previousValue?: string
    newValue?: string
  }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      event:
        params.changeType === 'device'
          ? SessionEvent.DEVICE_CHANGE_DETECTED
          : SessionEvent.LOCATION_CHANGE_DETECTED,
      metadata: {
        previousValue: params.previousValue,
        newValue: params.newValue,
      },
    })
  },

  /**
   * Log suspected session hijacking
   */
  suspectedHijack: async (params: {
    sessionId: string
    userId: string
    reason: string
    evidence?: Record<string, any>
  }) => {
    await logSessionActivity({
      sessionId: params.sessionId,
      userId: params.userId,
      event: SessionEvent.SESSION_HIJACK_SUSPECTED,
      metadata: {
        reason: params.reason,
        evidence: params.evidence,
      },
    })
  },
}

/**
 * Query session logs for a specific user
 * Useful for user activity reports
 */
export async function getUserSessionHistory(
  userId: string,
  options?: {
    startDate?: Date
    endDate?: Date
    limit?: number
  }
): Promise<SessionLogEntry[]> {
  // Implementation depends on your database/logging service
  // This is a placeholder for the query logic

  const params = new URLSearchParams({
    userId,
    ...(options?.startDate && { startDate: options.startDate.toISOString() }),
    ...(options?.endDate && { endDate: options.endDate.toISOString() }),
    ...(options?.limit && { limit: options.limit.toString() }),
  })

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CMS_URL}/api/audit-logs?${params.toString()}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch session history')
  }

  return response.json()
}

/**
 * Generate session activity report
 * For compliance and security analysis
 */
export async function generateSessionReport(params: {
  userId?: string
  startDate: Date
  endDate: Date
}): Promise<{
  totalSessions: number
  successfulLogins: number
  failedLogins: number
  mfaUsageRate: number
  averageSessionDuration: number
  suspiciousActivities: number
  sessionsWithTimeout: number
}> {
  const logs = await getUserSessionHistory(params.userId || '', {
    startDate: params.startDate,
    endDate: params.endDate,
  })

  const sessionStarts = logs.filter((l) => l.event === SessionEvent.SESSION_START)
  const successfulLogins = logs.filter((l) => l.event === SessionEvent.LOGIN_SUCCESS)
  const failedLogins = logs.filter((l) => l.event === SessionEvent.LOGIN_FAILURE)
  const mfaSuccesses = logs.filter((l) => l.event === SessionEvent.MFA_SUCCESS)
  const suspiciousEvents = logs.filter(
    (l) =>
      l.event === SessionEvent.SESSION_HIJACK_SUSPECTED ||
      l.event === SessionEvent.CONCURRENT_SESSION_DETECTED ||
      l.event === SessionEvent.DEVICE_CHANGE_DETECTED ||
      l.event === SessionEvent.LOCATION_CHANGE_DETECTED
  )
  const timeouts = logs.filter((l) => l.event === SessionEvent.SESSION_TIMEOUT)

  return {
    totalSessions: sessionStarts.length,
    successfulLogins: successfulLogins.length,
    failedLogins: failedLogins.length,
    mfaUsageRate:
      successfulLogins.length > 0 ? (mfaSuccesses.length / successfulLogins.length) * 100 : 0,
    averageSessionDuration: 0, // Calculate based on start/end timestamps
    suspiciousActivities: suspiciousEvents.length,
    sessionsWithTimeout: timeouts.length,
  }
}
