/**
 * HIPAA-Compliant Audit Logging System
 *
 * Logs all access to Protected Health Information (PHI) as required by
 * HIPAA Security Rule §164.312(b)
 *
 * Audit logs must include:
 * - Who: User ID and role
 * - What: Action and affected resource
 * - When: Timestamp
 * - Where: IP address and user agent
 * - Why: Context/reason for access
 */

import { headers } from 'next/headers'

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',

  // PHI Access
  PHI_VIEW = 'PHI_VIEW',
  PHI_CREATE = 'PHI_CREATE',
  PHI_UPDATE = 'PHI_UPDATE',
  PHI_DELETE = 'PHI_DELETE',
  PHI_EXPORT = 'PHI_EXPORT',

  // Symptom Checker (Potential PHI)
  SYMPTOM_SUBMIT = 'SYMPTOM_SUBMIT',
  SYMPTOM_RESULT_VIEW = 'SYMPTOM_RESULT_VIEW',

  // User Profile
  PROFILE_VIEW = 'PROFILE_VIEW',
  PROFILE_UPDATE = 'PROFILE_UPDATE',

  // Administrative
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  ROLE_CHANGE = 'ROLE_CHANGE',

  // Security Events
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface AuditLogEntry {
  // Who
  userId?: string
  userEmail?: string
  userRole?: string
  sessionId?: string

  // What
  action: AuditAction
  resource?: string
  resourceId?: string
  resourceType?: string
  details?: Record<string, any>

  // When
  timestamp: Date

  // Where
  ipAddress?: string
  userAgent?: string
  location?: string

  // How
  method?: string
  endpoint?: string
  statusCode?: number

  // Context
  severity: AuditSeverity
  success: boolean
  errorMessage?: string
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(entry: Partial<AuditLogEntry>): Promise<void> {
  try {
    // Get request metadata
    const headersList = headers()
    const ipAddress =
      headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    const auditEntry: AuditLogEntry = {
      timestamp: new Date(),
      ipAddress,
      userAgent,
      success: true,
      severity: AuditSeverity.INFO,
      ...entry,
    }

    // In production, send to secure logging service
    // Options:
    // 1. Database table (with write-once constraint)
    // 2. Dedicated logging service (CloudWatch, Datadog, etc.)
    // 3. SIEM system (Splunk, ELK stack)
    // 4. HIPAA-compliant log management (LogDNA, Loggly)

    if (process.env.NODE_ENV === 'production') {
      // Send to production logging service
      await sendToLoggingService(auditEntry)
    } else {
      // Development: console log
      console.log('[AUDIT LOG]', JSON.stringify(auditEntry, null, 2))
    }

    // Also store in database for HIPAA compliance
    await storeInDatabase(auditEntry)
  } catch (error) {
    // Critical: Audit logging failure must be logged separately
    console.error('[AUDIT LOG ERROR]', error)

    // Send alert to security team
    if (process.env.NODE_ENV === 'production') {
      await sendSecurityAlert('Audit logging failed', { error, entry })
    }
  }
}

/**
 * Send audit log to external logging service
 */
async function sendToLoggingService(entry: AuditLogEntry): Promise<void> {
  // Implementation depends on chosen logging service
  // Example for AWS CloudWatch, Datadog, etc.

  const loggingEndpoint = process.env.AUDIT_LOG_ENDPOINT
  const loggingApiKey = process.env.AUDIT_LOG_API_KEY

  if (!loggingEndpoint || !loggingApiKey) {
    console.warn('[AUDIT LOG] Logging service not configured')
    return
  }

  try {
    await fetch(loggingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loggingApiKey}`,
      },
      body: JSON.stringify(entry),
    })
  } catch (error) {
    console.error('[AUDIT LOG] Failed to send to logging service', error)
    throw error
  }
}

/**
 * Store audit log in database (required for HIPAA)
 * Audit logs must be retained for at least 6 years
 */
async function storeInDatabase(entry: AuditLogEntry): Promise<void> {
  // Store in dedicated audit_logs table
  // This should be a write-once table (no updates or deletes)

  // Example using Payload CMS or direct database access
  try {
    // Using fetch to Payload API or direct DB insert
    const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/audit-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    })

    if (!response.ok) {
      throw new Error(`Failed to store audit log: ${response.statusText}`)
    }
  } catch (error) {
    console.error('[AUDIT LOG] Failed to store in database', error)
    throw error
  }
}

/**
 * Send security alert for critical events
 */
async function sendSecurityAlert(message: string, details: any): Promise<void> {
  // Send to security team via email, Slack, PagerDuty, etc.
  console.error('[SECURITY ALERT]', message, details)

  // Implementation: Send email via Resend, Slack webhook, etc.
  const alertWebhook = process.env.SECURITY_ALERT_WEBHOOK

  if (alertWebhook) {
    try {
      await fetch(alertWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, details, timestamp: new Date() }),
      })
    } catch (error) {
      console.error('[SECURITY ALERT] Failed to send alert', error)
    }
  }
}

/**
 * Audit log helpers for common actions
 */
export const auditLog = {
  // Authentication
  login: (userId: string, email: string, success: boolean) =>
    createAuditLog({
      action: success ? AuditAction.LOGIN : AuditAction.LOGIN_FAILED,
      userId,
      userEmail: email,
      success,
      severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
    }),

  logout: (userId: string) =>
    createAuditLog({
      action: AuditAction.LOGOUT,
      userId,
      severity: AuditSeverity.INFO,
    }),

  // PHI Access
  viewPHI: (userId: string, resourceType: string, resourceId: string) =>
    createAuditLog({
      action: AuditAction.PHI_VIEW,
      userId,
      resourceType,
      resourceId,
      severity: AuditSeverity.INFO,
    }),

  createPHI: (userId: string, resourceType: string, resourceId: string) =>
    createAuditLog({
      action: AuditAction.PHI_CREATE,
      userId,
      resourceType,
      resourceId,
      severity: AuditSeverity.INFO,
    }),

  updatePHI: (userId: string, resourceType: string, resourceId: string, changes: any) =>
    createAuditLog({
      action: AuditAction.PHI_UPDATE,
      userId,
      resourceType,
      resourceId,
      details: { changes },
      severity: AuditSeverity.INFO,
    }),

  deletePHI: (userId: string, resourceType: string, resourceId: string) =>
    createAuditLog({
      action: AuditAction.PHI_DELETE,
      userId,
      resourceType,
      resourceId,
      severity: AuditSeverity.WARNING,
    }),

  // Symptom Checker
  submitSymptoms: (userId: string | undefined, symptoms: string[]) =>
    createAuditLog({
      action: AuditAction.SYMPTOM_SUBMIT,
      userId,
      details: {
        symptomCount: symptoms.length,
        // Do NOT log actual symptoms (PHI)
      },
      severity: AuditSeverity.INFO,
    }),

  // Security Events
  unauthorizedAccess: (userId: string | undefined, resource: string) =>
    createAuditLog({
      action: AuditAction.UNAUTHORIZED_ACCESS,
      userId,
      resource,
      success: false,
      severity: AuditSeverity.ERROR,
    }),

  suspiciousActivity: (userId: string | undefined, details: any) =>
    createAuditLog({
      action: AuditAction.SUSPICIOUS_ACTIVITY,
      userId,
      details,
      success: false,
      severity: AuditSeverity.CRITICAL,
    }),
}

/**
 * Middleware wrapper for automatic audit logging
 */
export function withAuditLog(
  action: AuditAction,
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request) => {
    const startTime = Date.now()
    let response: Response

    try {
      response = await handler(req)

      // Log successful request
      await createAuditLog({
        action,
        method: req.method,
        endpoint: new URL(req.url).pathname,
        statusCode: response.status,
        success: response.ok,
        severity: response.ok ? AuditSeverity.INFO : AuditSeverity.WARNING,
      })

      return response
    } catch (error) {
      // Log failed request
      await createAuditLog({
        action,
        method: req.method,
        endpoint: new URL(req.url).pathname,
        success: false,
        severity: AuditSeverity.ERROR,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })

      throw error
    }
  }
}

/**
 * Query audit logs (for compliance reports)
 * Only accessible by administrators
 */
export async function queryAuditLogs(filters: {
  userId?: string
  action?: AuditAction
  startDate?: Date
  endDate?: Date
  severity?: AuditSeverity
}): Promise<AuditLogEntry[]> {
  // Implement database query
  // This should have strict access controls

  // Example query
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CMS_URL}/api/audit-logs?` +
      new URLSearchParams(filters as any).toString()
  )

  if (!response.ok) {
    throw new Error('Failed to query audit logs')
  }

  return response.json()
}

/**
 * Generate HIPAA compliance report
 * Required for annual audits
 */
export async function generateComplianceReport(
  startDate: Date,
  endDate: Date
): Promise<{
  totalAccesses: number
  phiAccesses: number
  securityIncidents: number
  failedLogins: number
  dataExports: number
}> {
  const logs = await queryAuditLogs({ startDate, endDate })

  return {
    totalAccesses: logs.length,
    phiAccesses: logs.filter((l) => l.action.startsWith('PHI_')).length,
    securityIncidents: logs.filter(
      (l) => l.severity === AuditSeverity.CRITICAL || l.severity === AuditSeverity.ERROR
    ).length,
    failedLogins: logs.filter((l) => l.action === AuditAction.LOGIN_FAILED).length,
    dataExports: logs.filter((l) => l.action === AuditAction.PHI_EXPORT).length,
  }
}
