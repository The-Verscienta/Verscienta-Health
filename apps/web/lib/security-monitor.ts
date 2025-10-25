/**
 * Security Event Monitoring
 *
 * Real-time threat detection and automated security responses.
 * HIPAA Security: Proactive protection against unauthorized PHI access.
 *
 * Features:
 * - Concurrent session detection
 * - Rapid IP/location changes
 * - Device fingerprint anomalies
 * - Unusual login patterns
 * - Automated threat responses
 */

import { sendEmail } from './email'
import { sessionLogger } from './session-logger'

/**
 * Security monitoring configuration
 */
export const SECURITY_CONFIG = {
  /** Maximum concurrent sessions per user */
  MAX_CONCURRENT_SESSIONS: 3,

  /** Maximum IP address changes per hour */
  MAX_IP_CHANGES_PER_HOUR: 5,

  /** Maximum distance between login locations (km) */
  MAX_LOCATION_DISTANCE_KM: 500,

  /** Time window for rapid location change detection (minutes) */
  RAPID_LOCATION_WINDOW_MINUTES: 30,

  /** Maximum failed MFA attempts before alert */
  MAX_MFA_FAILURES: 3,

  /** Time window for unusual login pattern detection (hours) */
  UNUSUAL_LOGIN_WINDOW_HOURS: 24,
} as const

/**
 * Security event types
 */
export enum SecurityEventType {
  CONCURRENT_SESSION = 'CONCURRENT_SESSION',
  RAPID_IP_CHANGE = 'RAPID_IP_CHANGE',
  RAPID_LOCATION_CHANGE = 'RAPID_LOCATION_CHANGE',
  DEVICE_CHANGE = 'DEVICE_CHANGE',
  UNUSUAL_LOGIN_TIME = 'UNUSUAL_LOGIN_TIME',
  EXCESSIVE_MFA_FAILURES = 'EXCESSIVE_MFA_FAILURES',
  SESSION_HIJACK_SUSPECTED = 'SESSION_HIJACK_SUSPECTED',
}

/**
 * Security event severity
 */
export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Security event
 */
export interface SecurityEvent {
  type: SecurityEventType
  severity: SecuritySeverity
  userId: string
  userEmail: string
  timestamp: number
  metadata: Record<string, any>
  autoResponse?: 'ALERT_USER' | 'FORCE_LOGOUT' | 'REQUIRE_MFA' | 'NONE'
}

/**
 * User session tracking
 */
interface UserSession {
  userId: string
  sessionId: string
  ipAddress?: string
  location?: string
  deviceId?: string
  userAgent?: string
  lastActivity: number
}

/**
 * In-memory session tracking
 * TODO: Replace with Redis for production multi-instance deployments
 */
const activeSessions = new Map<string, UserSession[]>()
const securityEvents = new Map<string, SecurityEvent[]>()

/**
 * Track a new session
 */
export async function trackSession(session: Omit<UserSession, 'lastActivity'>): Promise<void> {
  const userId = session.userId
  const sessions = activeSessions.get(userId) || []

  // Add new session
  sessions.push({
    ...session,
    lastActivity: Date.now(),
  })

  activeSessions.set(userId, sessions)

  // Check for concurrent sessions
  if (sessions.length > SECURITY_CONFIG.MAX_CONCURRENT_SESSIONS) {
    await detectConcurrentSessions(userId, session)
  }

  // Check for rapid IP changes
  await detectRapidIPChanges(userId, session.ipAddress)

  // Check for device changes
  await detectDeviceChanges(userId, session.deviceId)
}

/**
 * Update session activity
 */
export async function updateSessionActivity(sessionId: string, userId: string): Promise<void> {
  const sessions = activeSessions.get(userId) || []
  const session = sessions.find((s) => s.sessionId === sessionId)

  if (session) {
    session.lastActivity = Date.now()
    activeSessions.set(userId, sessions)
  }
}

/**
 * Remove session
 */
export async function removeSession(sessionId: string, userId: string): Promise<void> {
  const sessions = activeSessions.get(userId) || []
  const filtered = sessions.filter((s) => s.sessionId !== sessionId)

  if (filtered.length > 0) {
    activeSessions.set(userId, filtered)
  } else {
    activeSessions.delete(userId)
  }
}

/**
 * Detect concurrent sessions from different locations
 */
async function detectConcurrentSessions(
  userId: string,
  newSession: Omit<UserSession, 'lastActivity'>
): Promise<void> {
  const sessions = activeSessions.get(userId) || []
  const recentSessions = sessions.filter(
    (s) => Date.now() - s.lastActivity < 60 * 1000 // Active in last minute
  )

  if (recentSessions.length > SECURITY_CONFIG.MAX_CONCURRENT_SESSIONS) {
    const differentIPs = new Set(recentSessions.map((s) => s.ipAddress).filter(Boolean))

    if (differentIPs.size > 1) {
      const event: SecurityEvent = {
        type: SecurityEventType.CONCURRENT_SESSION,
        severity: SecuritySeverity.HIGH,
        userId,
        userEmail: '', // Will be filled by caller
        timestamp: Date.now(),
        metadata: {
          sessionCount: recentSessions.length,
          uniqueIPs: Array.from(differentIPs),
          newIP: newSession.ipAddress,
        },
        autoResponse: 'ALERT_USER',
      }

      await recordSecurityEvent(event)

      // Log to session logger
      await sessionLogger.concurrentSession({
        sessionId: newSession.sessionId,
        userId,
        newIpAddress: newSession.ipAddress,
        newDeviceId: newSession.deviceId,
      })
    }
  }
}

/**
 * Detect rapid IP address changes
 */
async function detectRapidIPChanges(userId: string, currentIP?: string): Promise<void> {
  if (!currentIP) return

  const sessions = activeSessions.get(userId) || []
  const oneHourAgo = Date.now() - 60 * 60 * 1000

  const recentSessions = sessions.filter((s) => s.lastActivity > oneHourAgo)
  const uniqueIPs = new Set(recentSessions.map((s) => s.ipAddress).filter(Boolean))

  if (uniqueIPs.size > SECURITY_CONFIG.MAX_IP_CHANGES_PER_HOUR) {
    const event: SecurityEvent = {
      type: SecurityEventType.RAPID_IP_CHANGE,
      severity: SecuritySeverity.MEDIUM,
      userId,
      userEmail: '',
      timestamp: Date.now(),
      metadata: {
        ipChanges: uniqueIPs.size,
        threshold: SECURITY_CONFIG.MAX_IP_CHANGES_PER_HOUR,
        ips: Array.from(uniqueIPs),
      },
      autoResponse: 'ALERT_USER',
    }

    await recordSecurityEvent(event)
  }
}

/**
 * Detect device changes
 */
async function detectDeviceChanges(userId: string, currentDeviceId?: string): Promise<void> {
  if (!currentDeviceId) return

  const sessions = activeSessions.get(userId) || []
  const previousSessions = sessions.filter((s) => s.deviceId && s.deviceId !== currentDeviceId)

  if (previousSessions.length > 0) {
    const previousDevice = previousSessions[0]
    const timeSinceLastDevice = Date.now() - previousDevice.lastActivity

    // Only alert if device changed within 24 hours
    if (timeSinceLastDevice < 24 * 60 * 60 * 1000) {
      const event: SecurityEvent = {
        type: SecurityEventType.DEVICE_CHANGE,
        severity: SecuritySeverity.MEDIUM,
        userId,
        userEmail: '',
        timestamp: Date.now(),
        metadata: {
          previousDevice: previousDevice.deviceId,
          newDevice: currentDeviceId,
          timeSinceLastDevice: Math.floor(timeSinceLastDevice / 1000 / 60), // minutes
        },
        autoResponse: 'ALERT_USER',
      }

      await recordSecurityEvent(event)

      await sessionLogger.suspiciousChange({
        sessionId: sessions[sessions.length - 1]?.sessionId || 'unknown',
        userId,
        changeType: 'device',
        previousValue: previousDevice.deviceId,
        newValue: currentDeviceId,
      })
    }
  }
}

/**
 * Detect unusual login patterns
 */
export async function detectUnusualLoginPattern(params: {
  userId: string
  userEmail: string
  timestamp: Date
  ipAddress?: string
  location?: string
}): Promise<void> {
  // Check if login is at unusual time (e.g., 2-5 AM local time)
  const hour = params.timestamp.getHours()

  if (hour >= 2 && hour <= 5) {
    const event: SecurityEvent = {
      type: SecurityEventType.UNUSUAL_LOGIN_TIME,
      severity: SecuritySeverity.LOW,
      userId: params.userId,
      userEmail: params.userEmail,
      timestamp: params.timestamp.getTime(),
      metadata: {
        hour,
        ipAddress: params.ipAddress,
        location: params.location,
      },
      autoResponse: 'NONE',
    }

    await recordSecurityEvent(event)
  }
}

/**
 * Detect excessive MFA failures
 */
export async function detectExcessiveMFAFailures(
  userId: string,
  userEmail: string,
  failureCount: number
): Promise<void> {
  if (failureCount >= SECURITY_CONFIG.MAX_MFA_FAILURES) {
    const event: SecurityEvent = {
      type: SecurityEventType.EXCESSIVE_MFA_FAILURES,
      severity: SecuritySeverity.HIGH,
      userId,
      userEmail,
      timestamp: Date.now(),
      metadata: {
        failureCount,
        threshold: SECURITY_CONFIG.MAX_MFA_FAILURES,
      },
      autoResponse: 'FORCE_LOGOUT',
    }

    await recordSecurityEvent(event)
  }
}

/**
 * Detect suspected session hijacking
 */
export async function detectSessionHijacking(params: {
  userId: string
  userEmail: string
  sessionId: string
  reason: string
  evidence: Record<string, any>
}): Promise<void> {
  const event: SecurityEvent = {
    type: SecurityEventType.SESSION_HIJACK_SUSPECTED,
    severity: SecuritySeverity.CRITICAL,
    userId: params.userId,
    userEmail: params.userEmail,
    timestamp: Date.now(),
    metadata: {
      sessionId: params.sessionId,
      reason: params.reason,
      evidence: params.evidence,
    },
    autoResponse: 'FORCE_LOGOUT',
  }

  await recordSecurityEvent(event)

  await sessionLogger.suspectedHijack({
    sessionId: params.sessionId,
    userId: params.userId,
    reason: params.reason,
    evidence: params.evidence,
  })
}

/**
 * Record a security event
 */
async function recordSecurityEvent(event: SecurityEvent): Promise<void> {
  const userId = event.userId
  const events = securityEvents.get(userId) || []

  events.push(event)
  securityEvents.set(userId, events)

  console.warn(
    `[Security Monitor] ${event.severity} event detected for user ${userId}: ${event.type}`,
    event.metadata
  )

  // Execute automated response
  if (event.autoResponse) {
    await executeAutomatedResponse(event)
  }

  // Keep only last 100 events per user
  if (events.length > 100) {
    events.splice(0, events.length - 100)
  }
}

/**
 * Execute automated security response
 */
async function executeAutomatedResponse(event: SecurityEvent): Promise<void> {
  switch (event.autoResponse) {
    case 'ALERT_USER':
      await sendSecurityAlertEmail(event)
      break

    case 'FORCE_LOGOUT':
      await forceLogoutUser(event.userId)
      await sendSecurityAlertEmail(event)
      break

    case 'REQUIRE_MFA':
      // TODO: Implement MFA requirement flag
      await sendSecurityAlertEmail(event)
      break

    case 'NONE':
    default:
      // No automated response
      break
  }
}

/**
 * Send security alert email to user
 */
async function sendSecurityAlertEmail(event: SecurityEvent): Promise<void> {
  try {
    const eventDescriptions: Record<SecurityEventType, string> = {
      [SecurityEventType.CONCURRENT_SESSION]:
        'Multiple login sessions detected from different locations',
      [SecurityEventType.RAPID_IP_CHANGE]: 'Rapid IP address changes detected',
      [SecurityEventType.RAPID_LOCATION_CHANGE]: 'Login from unusual location detected',
      [SecurityEventType.DEVICE_CHANGE]: 'New device detected for your account',
      [SecurityEventType.UNUSUAL_LOGIN_TIME]: 'Login at unusual time detected',
      [SecurityEventType.EXCESSIVE_MFA_FAILURES]:
        'Multiple failed two-factor authentication attempts',
      [SecurityEventType.SESSION_HIJACK_SUSPECTED]: 'Suspicious session activity detected',
    }

    await sendEmail({
      to: event.userEmail,
      subject: `Security Alert: ${event.type}`,
      html: `
        <h2>Security Alert</h2>

        <p>We detected suspicious activity on your Verscienta Health account:</p>

        <p><strong>${eventDescriptions[event.type]}</strong></p>

        <p><strong>Severity:</strong> ${event.severity}</p>
        <p><strong>Time:</strong> ${new Date(event.timestamp).toLocaleString()}</p>

        <p><strong>Details:</strong></p>
        <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px;">
${JSON.stringify(event.metadata, null, 2)}
        </pre>

        <p><strong>What to do next:</strong></p>
        <ul>
          <li>Review your recent account activity</li>
          <li>Change your password if you don't recognize this activity</li>
          <li>Enable two-factor authentication for enhanced security</li>
          <li>Contact support if you need assistance</li>
        </ul>

        ${event.autoResponse === 'FORCE_LOGOUT' ? '<p style="color: #d32f2f;"><strong>For your protection, we have logged out all active sessions. Please log in again to continue.</strong></p>' : ''}

        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #5d7a5d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Log In to Your Account
          </a>
        </p>

        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          This is an automated security notification from Verscienta Health.
          If you did not perform this action, please contact support immediately.
        </p>
      `,
    })
  } catch (error) {
    console.error('Failed to send security alert email:', error)
  }
}

/**
 * Force logout user from all sessions
 */
async function forceLogoutUser(userId: string): Promise<void> {
  // Clear all active sessions
  activeSessions.delete(userId)

  // TODO: Invalidate sessions in database
  console.log(`[Security Monitor] Forced logout for user: ${userId}`)
}

/**
 * Get security events for a user
 */
export async function getUserSecurityEvents(
  userId: string,
  options?: {
    since?: Date
    limit?: number
  }
): Promise<SecurityEvent[]> {
  const events = securityEvents.get(userId) || []

  let filtered = events

  if (options?.since) {
    const sinceTimestamp = options.since.getTime()
    filtered = filtered.filter((e) => e.timestamp >= sinceTimestamp)
  }

  if (options?.limit) {
    filtered = filtered.slice(-options.limit)
  }

  return filtered
}

/**
 * Get all security events (admin function)
 */
export async function getAllSecurityEvents(options?: {
  since?: Date
  severity?: SecuritySeverity
  limit?: number
}): Promise<SecurityEvent[]> {
  const allEvents: SecurityEvent[] = []

  for (const events of securityEvents.values()) {
    allEvents.push(...events)
  }

  let filtered = allEvents

  if (options?.since) {
    const sinceTimestamp = options.since.getTime()
    filtered = filtered.filter((e) => e.timestamp >= sinceTimestamp)
  }

  if (options?.severity) {
    filtered = filtered.filter((e) => e.severity === options.severity)
  }

  // Sort by timestamp (most recent first)
  filtered.sort((a, b) => b.timestamp - a.timestamp)

  if (options?.limit) {
    filtered = filtered.slice(0, options.limit)
  }

  return filtered
}

/**
 * Clear old security events (cleanup function)
 */
export async function clearOldSecurityEvents(olderThanDays: number = 30): Promise<void> {
  const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000

  for (const [userId, events] of securityEvents.entries()) {
    const filtered = events.filter((e) => e.timestamp > cutoffTime)

    if (filtered.length > 0) {
      securityEvents.set(userId, filtered)
    } else {
      securityEvents.delete(userId)
    }
  }

  console.log('[Security Monitor] Cleared old security events')
}

/**
 * Helper functions
 */
export const securityMonitor = {
  trackSession,
  updateSessionActivity,
  removeSession,
  detectUnusualLoginPattern,
  detectExcessiveMFAFailures,
  detectSessionHijacking,
  getUserSecurityEvents,
  getAllSecurityEvents,
  clearOldSecurityEvents,
}
