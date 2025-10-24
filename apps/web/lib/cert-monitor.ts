/**
 * Certificate Expiration Monitoring for DragonflyDB/Redis TLS
 *
 * Monitors TLS certificate expiration and sends alerts when certificates
 * are approaching expiration (default: 30 days).
 *
 * Features:
 * - Automated certificate expiration checks
 * - Configurable warning thresholds
 * - Multiple notification channels (console, email, Slack, webhook)
 * - Production-ready error handling
 * - Comprehensive logging
 *
 * Usage:
 * ```typescript
 * import { checkCertificateExpiration } from '@/lib/cert-monitor'
 *
 * // Check certificate expiration
 * const result = await checkCertificateExpiration()
 * if (result.isExpiring) {
 *   console.warn(`Certificate expiring in ${result.daysUntilExpiry} days`)
 * }
 * ```
 *
 * Environment Variables:
 * - REDIS_HOST or REDIS_URL (required)
 * - REDIS_PORT (default: 6379)
 * - CERT_EXPIRY_WARNING_DAYS (default: 30)
 * - CERT_EXPIRY_CRITICAL_DAYS (default: 7)
 * - CERT_MONITOR_ENABLED (default: true in production)
 * - SLACK_WEBHOOK_URL (optional)
 * - ALERT_EMAIL (optional)
 */

import * as tls from 'tls'
import { sendEmail } from './email'

/**
 * Certificate expiration check result
 */
export interface CertExpiryResult {
  /** Whether certificate is valid and not expired */
  isValid: boolean
  /** Whether certificate is expiring soon (within warning threshold) */
  isExpiring: boolean
  /** Whether certificate expiration is critical (within critical threshold) */
  isCritical: boolean
  /** Days until certificate expires (negative if already expired) */
  daysUntilExpiry: number
  /** Certificate expiration date */
  expiryDate: Date | null
  /** Certificate issue date */
  issueDate: Date | null
  /** Certificate subject (CN) */
  subject: string | null
  /** Certificate issuer */
  issuer: string | null
  /** Error message if check failed */
  error?: string
}

/**
 * Certificate monitoring configuration
 */
export interface CertMonitorConfig {
  /** Warning threshold in days (default: 30) */
  warningDays?: number
  /** Critical threshold in days (default: 7) */
  criticalDays?: number
  /** Connection timeout in ms (default: 10000) */
  timeout?: number
  /** Enable email notifications (default: false) */
  enableEmail?: boolean
  /** Enable Slack notifications (default: false) */
  enableSlack?: boolean
  /** Enable webhook notifications (default: false) */
  enableWebhook?: boolean
  /** Custom webhook URL */
  webhookUrl?: string
}

/**
 * Get Redis/DragonflyDB host and port from environment
 */
export function getRedisHostPort(): { host: string; port: number } {
  // Try REDIS_URL first
  const redisUrl = process.env.REDIS_URL
  if (redisUrl) {
    try {
      const url = new URL(redisUrl)
      return {
        host: url.hostname,
        port: parseInt(url.port || '6379'),
      }
    } catch (error) {
      console.error('[Cert Monitor] Failed to parse REDIS_URL:', error)
    }
  }

  // Fallback to individual env vars
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }
}

/**
 * Check if TLS is enabled
 */
export function isTLSEnabled(): boolean {
  const redisUrl = process.env.REDIS_URL
  if (redisUrl && redisUrl.startsWith('rediss://')) {
    return true
  }
  return process.env.REDIS_TLS === 'true'
}

/**
 * Check certificate expiration for DragonflyDB/Redis TLS connection
 *
 * @param config Monitoring configuration
 * @returns Certificate expiration check result
 */
export async function checkCertificateExpiration(
  config: CertMonitorConfig = {}
): Promise<CertExpiryResult> {
  const {
    warningDays = parseInt(process.env.CERT_EXPIRY_WARNING_DAYS || '30'),
    criticalDays = parseInt(process.env.CERT_EXPIRY_CRITICAL_DAYS || '7'),
    timeout = 10000,
  } = config

  // Skip if TLS is not enabled
  if (!isTLSEnabled()) {
    return {
      isValid: true,
      isExpiring: false,
      isCritical: false,
      daysUntilExpiry: Infinity,
      expiryDate: null,
      issueDate: null,
      subject: null,
      issuer: null,
      error: 'TLS is not enabled',
    }
  }

  // Skip in development unless explicitly enabled
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.CERT_MONITOR_ENABLED !== 'true'
  ) {
    return {
      isValid: true,
      isExpiring: false,
      isCritical: false,
      daysUntilExpiry: Infinity,
      expiryDate: null,
      issueDate: null,
      subject: null,
      issuer: null,
      error: 'Certificate monitoring disabled in development',
    }
  }

  const { host, port } = getRedisHostPort()

  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host,
        port,
        // Allow self-signed certs for checking expiration
        rejectUnauthorized: false,
        // Enforce TLS version
        minVersion: 'TLSv1.2',
      },
      () => {
        try {
          const cert = socket.getPeerCertificate()

          if (!cert || Object.keys(cert).length === 0) {
            socket.end()
            resolve({
              isValid: false,
              isExpiring: false,
              isCritical: false,
              daysUntilExpiry: 0,
              expiryDate: null,
              issueDate: null,
              subject: null,
              issuer: null,
              error: 'No certificate received from server',
            })
            return
          }

          const now = Date.now()
          const expiryDate = new Date(cert.valid_to)
          const issueDate = new Date(cert.valid_from)
          const daysUntilExpiry = Math.floor((expiryDate.getTime() - now) / (1000 * 60 * 60 * 24))

          // Extract subject and issuer
          const subject = cert.subject?.CN || cert.subject?.commonName || null
          const issuer = cert.issuer?.CN || cert.issuer?.commonName || null

          const result: CertExpiryResult = {
            isValid: daysUntilExpiry > 0,
            isExpiring: daysUntilExpiry <= warningDays && daysUntilExpiry > 0,
            isCritical: daysUntilExpiry <= criticalDays && daysUntilExpiry > 0,
            daysUntilExpiry,
            expiryDate,
            issueDate,
            subject,
            issuer,
          }

          socket.end()
          resolve(result)
        } catch (error) {
          socket.end()
          resolve({
            isValid: false,
            isExpiring: false,
            isCritical: false,
            daysUntilExpiry: 0,
            expiryDate: null,
            issueDate: null,
            subject: null,
            issuer: null,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    )

    // Handle connection timeout
    const timeoutId = setTimeout(() => {
      socket.destroy()
      resolve({
        isValid: false,
        isExpiring: false,
        isCritical: false,
        daysUntilExpiry: 0,
        expiryDate: null,
        issueDate: null,
        subject: null,
        issuer: null,
        error: `Connection timeout after ${timeout}ms`,
      })
    }, timeout)

    socket.on('error', (error) => {
      clearTimeout(timeoutId)
      socket.destroy()
      resolve({
        isValid: false,
        isExpiring: false,
        isCritical: false,
        daysUntilExpiry: 0,
        expiryDate: null,
        issueDate: null,
        subject: null,
        issuer: null,
        error: error.message,
      })
    })

    socket.on('secureConnect', () => {
      clearTimeout(timeoutId)
    })
  })
}

/**
 * Send certificate expiration alert via email
 */
async function sendEmailAlert(result: CertExpiryResult): Promise<void> {
  const alertEmail = process.env.ALERT_EMAIL
  if (!alertEmail) {
    console.warn('[Cert Monitor] ALERT_EMAIL not configured, skipping email notification')
    return
  }

  const severity = result.isCritical ? 'CRITICAL' : 'WARNING'
  const { host } = getRedisHostPort()

  await sendEmail({
    to: alertEmail,
    subject: `${severity}: DragonflyDB TLS Certificate Expiring Soon`,
    html: `
      <h2>🔒 TLS Certificate Expiration ${severity}</h2>

      <p>The TLS certificate for your DragonflyDB instance is expiring soon and requires attention.</p>

      <h3>Certificate Details:</h3>
      <ul>
        <li><strong>Host:</strong> ${host}</li>
        <li><strong>Subject:</strong> ${result.subject || 'Unknown'}</li>
        <li><strong>Issuer:</strong> ${result.issuer || 'Unknown'}</li>
        <li><strong>Expires:</strong> ${result.expiryDate?.toISOString() || 'Unknown'}</li>
        <li><strong>Days Until Expiry:</strong> ${result.daysUntilExpiry}</li>
        <li><strong>Status:</strong> ${result.isCritical ? '🔴 CRITICAL' : '🟡 WARNING'}</li>
      </ul>

      <h3>Action Required:</h3>
      ${
        result.isCritical
          ? `
      <p><strong>⚠️ URGENT: Certificate expires in ${result.daysUntilExpiry} days!</strong></p>
      <p>Immediate action is required to renew the certificate to prevent service disruption.</p>
      `
          : `
      <p>Please schedule certificate renewal within the next ${result.daysUntilExpiry} days.</p>
      `
      }

      <h3>Next Steps:</h3>
      <ol>
        <li>Renew the TLS certificate using Let's Encrypt or your certificate provider</li>
        <li>Update the certificate on your DragonflyDB server</li>
        <li>Restart DragonflyDB to load the new certificate</li>
        <li>Verify the new certificate: <code>openssl s_client -connect ${host}:6379 -showcerts</code></li>
      </ol>

      <p>See: <code>docs/DRAGONFLYDB_TLS_SECURITY.md</code> for detailed renewal procedures.</p>

      <hr>
      <p style="color: #666; font-size: 12px;">
        This is an automated alert from Verscienta Health Certificate Monitor.
        <br>
        To disable these alerts, set <code>CERT_MONITOR_ENABLED=false</code>
      </p>
    `,
  })
}

/**
 * Send certificate expiration alert via Slack webhook
 */
async function sendSlackAlert(result: CertExpiryResult): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) {
    console.warn('[Cert Monitor] SLACK_WEBHOOK_URL not configured, skipping Slack notification')
    return
  }

  const { host } = getRedisHostPort()
  const severity = result.isCritical ? 'CRITICAL' : 'WARNING'
  const emoji = result.isCritical ? ':rotating_light:' : ':warning:'

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} TLS Certificate Expiration ${severity}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Host:*\n${host}`,
          },
          {
            type: 'mrkdwn',
            text: `*Days Until Expiry:*\n${result.daysUntilExpiry}`,
          },
          {
            type: 'mrkdwn',
            text: `*Subject:*\n${result.subject || 'Unknown'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Expires:*\n${result.expiryDate?.toLocaleDateString() || 'Unknown'}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: result.isCritical
            ? '*⚠️ URGENT:* Certificate expires in less than 7 days! Immediate action required.'
            : '*Action Required:* Please schedule certificate renewal.',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'See `docs/DRAGONFLYDB_TLS_SECURITY.md` for renewal procedures',
          },
        ],
      },
    ],
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      console.error(
        '[Cert Monitor] Slack notification failed:',
        response.status,
        response.statusText
      )
    }
  } catch (error) {
    console.error('[Cert Monitor] Failed to send Slack notification:', error)
  }
}

/**
 * Send certificate expiration alert via custom webhook
 */
async function sendWebhookAlert(
  result: CertExpiryResult,
  webhookUrl: string
): Promise<void> {
  const { host, port } = getRedisHostPort()

  const payload = {
    event: 'certificate_expiring',
    severity: result.isCritical ? 'critical' : 'warning',
    timestamp: new Date().toISOString(),
    certificate: {
      host,
      port,
      subject: result.subject,
      issuer: result.issuer,
      expiryDate: result.expiryDate?.toISOString(),
      issueDate: result.issueDate?.toISOString(),
      daysUntilExpiry: result.daysUntilExpiry,
      isValid: result.isValid,
      isExpiring: result.isExpiring,
      isCritical: result.isCritical,
    },
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(
        '[Cert Monitor] Webhook notification failed:',
        response.status,
        response.statusText
      )
    }
  } catch (error) {
    console.error('[Cert Monitor] Failed to send webhook notification:', error)
  }
}

/**
 * Send certificate expiration notifications via configured channels
 */
export async function sendCertificateAlert(
  result: CertExpiryResult,
  config: CertMonitorConfig = {}
): Promise<void> {
  const { enableEmail = true, enableSlack = true, enableWebhook = false, webhookUrl } = config

  // Only send alerts if certificate is expiring or critical
  if (!result.isExpiring && !result.isCritical) {
    return
  }

  // Console logging (always enabled)
  const { host } = getRedisHostPort()
  const severity = result.isCritical ? 'CRITICAL' : 'WARNING'
  console.warn(
    `[Cert Monitor] ${severity}: DragonflyDB TLS certificate for ${host} expires in ${result.daysUntilExpiry} days`
  )

  // Email notification
  if (enableEmail) {
    try {
      await sendEmailAlert(result)
      console.log('[Cert Monitor] Email notification sent successfully')
    } catch (error) {
      console.error('[Cert Monitor] Failed to send email notification:', error)
    }
  }

  // Slack notification
  if (enableSlack) {
    try {
      await sendSlackAlert(result)
      console.log('[Cert Monitor] Slack notification sent successfully')
    } catch (error) {
      console.error('[Cert Monitor] Failed to send Slack notification:', error)
    }
  }

  // Webhook notification
  if (enableWebhook && webhookUrl) {
    try {
      await sendWebhookAlert(result, webhookUrl)
      console.log('[Cert Monitor] Webhook notification sent successfully')
    } catch (error) {
      console.error('[Cert Monitor] Failed to send webhook notification:', error)
    }
  }
}

/**
 * Run certificate expiration check and send alerts if needed
 *
 * This is the main function to be called from cron jobs or scheduled tasks.
 */
export async function monitorCertificate(config: CertMonitorConfig = {}): Promise<void> {
  console.log('[Cert Monitor] Starting certificate expiration check...')

  try {
    const result = await checkCertificateExpiration(config)

    if (result.error) {
      console.error('[Cert Monitor] Certificate check failed:', result.error)
      return
    }

    if (!result.isValid) {
      console.error('[Cert Monitor] ❌ Certificate has EXPIRED!')
      await sendCertificateAlert(result, config)
      return
    }

    if (result.isCritical) {
      console.warn(
        `[Cert Monitor] 🔴 CRITICAL: Certificate expires in ${result.daysUntilExpiry} days`
      )
      await sendCertificateAlert(result, config)
      return
    }

    if (result.isExpiring) {
      console.warn(
        `[Cert Monitor] 🟡 WARNING: Certificate expires in ${result.daysUntilExpiry} days`
      )
      await sendCertificateAlert(result, config)
      return
    }

    console.log(
      `[Cert Monitor] ✅ Certificate is valid for ${result.daysUntilExpiry} days (expires: ${result.expiryDate?.toLocaleDateString()})`
    )
  } catch (error) {
    console.error('[Cert Monitor] Unexpected error during certificate monitoring:', error)
  }
}
