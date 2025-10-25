import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, AuditAction, AuditSeverity } from '@/lib/audit-log'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * HIPAA Breach Notification System
 *
 * Implements HIPAA Breach Notification Rule §164.404
 * - Detection of security breaches
 * - Automated notifications to admins
 * - Breach logging and tracking
 * - Remediation status management
 */

export enum BreachType {
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  DATA_EXFILTRATION = 'DATA_EXFILTRATION',
  BRUTE_FORCE_ATTACK = 'BRUTE_FORCE_ATTACK',
  UNUSUAL_LOGIN_PATTERN = 'UNUSUAL_LOGIN_PATTERN',
  MASS_DATA_ACCESS = 'MASS_DATA_ACCESS',
  ACCOUNT_COMPROMISE = 'ACCOUNT_COMPROMISE',
  PHI_EXPOSURE = 'PHI_EXPOSURE',
  SYSTEM_INTRUSION = 'SYSTEM_INTRUSION',
}

export enum BreachSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RemediationStatus {
  DETECTED = 'DETECTED',
  INVESTIGATING = 'INVESTIGATING',
  CONTAINED = 'CONTAINED',
  MITIGATED = 'MITIGATED',
  RESOLVED = 'RESOLVED',
}

interface BreachReportRequest {
  type: BreachType
  severity: BreachSeverity
  description: string
  affectedUsers?: string[]
  affectedData?: string[]
  ipAddress?: string
  userAgent?: string
  details?: Record<string, unknown>
}

/**
 * Send breach notification emails to admins
 */
async function sendBreachNotificationEmail(breach: {
  id: string
  type: BreachType
  severity: BreachSeverity
  description: string
  affectedUserCount: number
  timestamp: Date
}) {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []

  if (adminEmails.length === 0) {
    console.warn('[BREACH] No admin emails configured for breach notifications')
    return
  }

  const severityColor =
    breach.severity === 'CRITICAL'
      ? '#dc2626'
      : breach.severity === 'HIGH'
        ? '#f97316'
        : breach.severity === 'MEDIUM'
          ? '#f59e0b'
          : '#3b82f6'

  for (const email of adminEmails) {
    try {
      await sendEmail({
        to: email,
        subject: `[${breach.severity}] Security Breach Detected - ${breach.type}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: ${severityColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">🚨 Security Breach Detected</h1>
            </div>

            <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
              <h2 style="color: #111827; margin-top: 0;">Breach Details</h2>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Breach ID:</td>
                  <td style="padding: 8px;"><code>${breach.id}</code></td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Type:</td>
                  <td style="padding: 8px;">${breach.type}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Severity:</td>
                  <td style="padding: 8px;"><span style="color: ${severityColor}; font-weight: bold;">${breach.severity}</span></td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Detected At:</td>
                  <td style="padding: 8px;">${breach.timestamp.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Affected Users:</td>
                  <td style="padding: 8px;">${breach.affectedUserCount}</td>
                </tr>
              </table>

              <div style="margin-top: 20px; padding: 15px; background-color: white; border-left: 4px solid ${severityColor};">
                <h3 style="margin-top: 0;">Description</h3>
                <p style="margin: 0;">${breach.description}</p>
              </div>
            </div>

            <div style="background-color: #fee2e2; border: 1px solid #fecaca; padding: 15px; margin-top: 20px; border-radius: 4px;">
              <h3 style="color: #991b1b; margin-top: 0;">⚠️ Immediate Actions Required</h3>
              <ul style="color: #7f1d1d; margin: 0;">
                <li>Review breach details in admin dashboard</li>
                <li>Investigate affected user accounts</li>
                <li>Implement containment measures</li>
                <li>Document remediation steps</li>
                <li>Notify affected users if PHI exposure confirmed</li>
              </ul>
            </div>

            <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af;">
                <strong>HIPAA Compliance Note:</strong> Security breaches involving PHI must be reported within 60 days.
                Review §164.404 Breach Notification Rule for requirements.
              </p>
            </div>

            <div style="margin-top: 20px; text-align: center; padding: 20px; background-color: #f9fafb;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/security/breaches/${breach.id}"
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Breach Details
              </a>
            </div>

            <p style="color: #6b7280; font-size: 12px; margin-top: 20px; text-align: center;">
              This is an automated security notification from Verscienta Health.<br/>
              Do not reply to this email. For support, contact security@verscienta.com
            </p>
          </div>
        `,
      })
    } catch (error) {
      console.error(`[BREACH] Failed to send notification email to ${email}:`, error)
    }
  }
}

/**
 * Send breach notification to Slack
 */
async function sendSlackNotification(breach: {
  type: BreachType
  severity: BreachSeverity
  description: string
  affectedUserCount: number
}) {
  const slackWebhookUrl = process.env.SLACK_SECURITY_WEBHOOK_URL

  if (!slackWebhookUrl) {
    console.warn('[BREACH] No Slack webhook configured for breach notifications')
    return
  }

  const severityEmoji =
    breach.severity === 'CRITICAL'
      ? '🔴'
      : breach.severity === 'HIGH'
        ? '🟠'
        : breach.severity === 'MEDIUM'
          ? '🟡'
          : '🔵'

  try {
    await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${severityEmoji} *SECURITY BREACH DETECTED*`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${severityEmoji} Security Breach Detected`,
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Type:*\n${breach.type}`,
              },
              {
                type: 'mrkdwn',
                text: `*Severity:*\n${breach.severity}`,
              },
              {
                type: 'mrkdwn',
                text: `*Affected Users:*\n${breach.affectedUserCount}`,
              },
              {
                type: 'mrkdwn',
                text: `*Time:*\n${new Date().toLocaleString()}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Description:*\n${breach.description}`,
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '⚠️ *Immediate action required* - Review admin dashboard for details',
            },
          },
        ],
      }),
    })
  } catch (error) {
    console.error('[BREACH] Failed to send Slack notification:', error)
  }
}

/**
 * POST /api/admin/security-breach
 * Report a security breach
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const userRole = session.user.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const body: BreachReportRequest = await request.json()
    const { type, severity, description, affectedUsers = [], affectedData = [], details } = body

    // Validate required fields
    if (!type || !severity || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: type, severity, description' },
        { status: 400 }
      )
    }

    // Create breach log entry (would use Prisma in production)
    const breachId = `BREACH-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    // Log to audit system
    await createAuditLog({
      action: AuditAction.SUSPICIOUS_ACTIVITY,
      userId: session.user.id,
      userEmail: session.user.email,
      sessionId: session.session.id,
      success: true,
      severity: AuditSeverity.CRITICAL,
      details: {
        breachId,
        type,
        severity,
        description,
        affectedUserCount: affectedUsers.length,
        affectedDataTypes: affectedData,
        remediationStatus: RemediationStatus.DETECTED,
        ...details,
      },
    })

    // Log to console for immediate visibility
    console.error('[SECURITY BREACH]', {
      breachId,
      type,
      severity,
      description,
      affectedUsers: affectedUsers.length,
      affectedData,
      timestamp: new Date().toISOString(),
      reportedBy: session.user.email,
    })

    // Send notifications (fire and forget - don't block response)
    const breachData = {
      id: breachId,
      type,
      severity,
      description,
      affectedUserCount: affectedUsers.length,
      timestamp: new Date(),
    }

    // Send email notifications
    sendBreachNotificationEmail(breachData).catch((err) =>
      console.error('[BREACH] Email notification failed:', err)
    )

    // Send Slack notification
    sendSlackNotification(breachData).catch((err) =>
      console.error('[BREACH] Slack notification failed:', err)
    )

    return NextResponse.json({
      success: true,
      breachId,
      message: 'Security breach reported successfully',
      remediationStatus: RemediationStatus.DETECTED,
      notifications: {
        email: !!process.env.ADMIN_EMAILS,
        slack: !!process.env.SLACK_SECURITY_WEBHOOK_URL,
      },
    })
  } catch (error) {
    console.error('[BREACH API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/admin/security-breach
 * List all security breaches (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const userRole = session.user.role
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // In production, fetch from database
    // For now, return placeholder
    return NextResponse.json({
      breaches: [],
      message: 'Breach logs would be retrieved from database in production',
    })
  } catch (error) {
    console.error('[BREACH API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
