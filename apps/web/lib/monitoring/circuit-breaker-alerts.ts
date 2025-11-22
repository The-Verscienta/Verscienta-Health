/**
 * Circuit Breaker Alert System
 *
 * Monitors circuit breaker state changes and sends alerts when APIs become unhealthy.
 * Integrates with email notifications and logging systems.
 *
 * Features:
 * - Real-time circuit breaker monitoring
 * - Email alerts for OPEN/CLOSED transitions
 * - Slack/Discord webhook support (optional)
 * - Alert rate limiting (prevent spam)
 * - Health score tracking
 * - Automatic recovery notifications
 *
 * Usage:
 *   import { circuitBreakerAlerts } from '@/lib/monitoring/circuit-breaker-alerts'
 *
 *   // Monitor circuit breaker state changes
 *   circuitBreakerAlerts.checkAndAlert('trefle')
 *   circuitBreakerAlerts.checkAndAlert('perenual')
 *
 *   // Get alert history
 *   const history = circuitBreakerAlerts.getAlertHistory('trefle')
 */

import { trefleClientEnhanced } from '@/lib/trefle'
import { perenualClientEnhanced } from '@/lib/perenual'
import { sendEmail } from '@/lib/email'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Alert severity levels
 */
export type AlertSeverity = 'info' | 'warning' | 'critical'

/**
 * Alert record
 */
export interface CircuitBreakerAlert {
  id: string
  api: 'trefle' | 'perenual'
  severity: AlertSeverity
  event: 'opened' | 'closed' | 'half_open' | 'degraded' | 'recovered'
  circuitState: 'OPEN' | 'CLOSED' | 'HALF_OPEN'
  healthScore: number
  stats: any
  timestamp: Date
  message: string
  notificationsSent: string[] // ['email', 'slack', 'log']
}

/**
 * Circuit breaker monitoring state
 */
interface MonitoringState {
  lastCircuitState: 'OPEN' | 'CLOSED' | 'HALF_OPEN'
  lastHealthScore: number
  lastAlertTimestamp: Date | null
  alertCount: number
  consecutiveFailures: number
}

/**
 * Circuit Breaker Alert System
 */
class CircuitBreakerAlertSystem {
  private monitoringState: Map<string, MonitoringState> = new Map()
  private alertHistory: CircuitBreakerAlert[] = []
  private alertCooldown: number = 5 * 60 * 1000 // 5 minutes between alerts

  constructor() {
    // Initialize monitoring state for both APIs
    this.monitoringState.set('trefle', {
      lastCircuitState: 'CLOSED',
      lastHealthScore: 100,
      lastAlertTimestamp: null,
      alertCount: 0,
      consecutiveFailures: 0,
    })

    this.monitoringState.set('perenual', {
      lastCircuitState: 'CLOSED',
      lastHealthScore: 100,
      lastAlertTimestamp: null,
      alertCount: 0,
      consecutiveFailures: 0,
    })
  }

  /**
   * Check circuit breaker state and send alerts if needed
   */
  async checkAndAlert(api: 'trefle' | 'perenual'): Promise<void> {
    try {
      const client = api === 'trefle' ? trefleClientEnhanced : perenualClientEnhanced

      // Skip if not configured
      if (!client.isConfigured()) {
        return
      }

      const currentState = client.getCircuitState()
      const stats = client.getStats()
      const healthScore = this.calculateHealthScore(stats)

      const state = this.monitoringState.get(api)!
      const stateChanged = currentState !== state.lastCircuitState
      const healthDegraded = healthScore < 80 && state.lastHealthScore >= 80
      const healthRecovered = healthScore >= 80 && state.lastHealthScore < 80

      // Circuit breaker opened - CRITICAL
      if (stateChanged && currentState === 'OPEN') {
        await this.sendAlert(api, {
          severity: 'critical',
          event: 'opened',
          circuitState: currentState,
          healthScore,
          stats,
          message: `🚨 CRITICAL: ${api.toUpperCase()} API circuit breaker has OPENED. All requests are being blocked.`,
        })

        state.consecutiveFailures++
      }

      // Circuit breaker closed - INFO/WARNING based on history
      else if (stateChanged && currentState === 'CLOSED') {
        const severity = state.alertCount > 3 ? 'warning' : 'info'

        await this.sendAlert(api, {
          severity,
          event: 'closed',
          circuitState: currentState,
          healthScore,
          stats,
          message: `✅ ${api.toUpperCase()} API circuit breaker has CLOSED. Service restored.${
            state.alertCount > 3 ? ' (Frequent failures detected - investigate root cause)' : ''
          }`,
        })

        state.consecutiveFailures = 0
      }

      // Circuit breaker half-open - WARNING
      else if (stateChanged && currentState === 'HALF_OPEN') {
        await this.sendAlert(api, {
          severity: 'warning',
          event: 'half_open',
          circuitState: currentState,
          healthScore,
          stats,
          message: `⚠️ ${api.toUpperCase()} API circuit breaker is HALF_OPEN. Testing recovery...`,
        })
      }

      // Health degraded - WARNING
      else if (healthDegraded) {
        await this.sendAlert(api, {
          severity: 'warning',
          event: 'degraded',
          circuitState: currentState,
          healthScore,
          stats,
          message: `⚠️ ${api.toUpperCase()} API health is DEGRADED (score: ${healthScore}/100). Monitor closely.`,
        })
      }

      // Health recovered - INFO
      else if (healthRecovered) {
        await this.sendAlert(api, {
          severity: 'info',
          event: 'recovered',
          circuitState: currentState,
          healthScore,
          stats,
          message: `✅ ${api.toUpperCase()} API health RECOVERED (score: ${healthScore}/100).`,
        })
      }

      // Update monitoring state
      state.lastCircuitState = currentState
      state.lastHealthScore = healthScore
    } catch (error) {
      console.error(`[Circuit Breaker Alerts] Error checking ${api}:`, error)
    }
  }

  /**
   * Send alert via configured channels
   */
  private async sendAlert(
    api: 'trefle' | 'perenual',
    alertData: Omit<CircuitBreakerAlert, 'id' | 'api' | 'timestamp' | 'notificationsSent'>
  ): Promise<void> {
    const state = this.monitoringState.get(api)!

    // Check cooldown to prevent alert spam
    if (state.lastAlertTimestamp) {
      const timeSinceLastAlert = Date.now() - state.lastAlertTimestamp.getTime()
      if (timeSinceLastAlert < this.alertCooldown && alertData.severity !== 'critical') {
        console.log(
          `[Circuit Breaker Alerts] Skipping ${api} alert (cooldown: ${Math.round(timeSinceLastAlert / 1000)}s / ${this.alertCooldown / 1000}s)`
        )
        return
      }
    }

    const notificationsSent: string[] = []

    // Create alert record
    const alert: CircuitBreakerAlert = {
      id: `${api}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      api,
      timestamp: new Date(),
      notificationsSent,
      ...alertData,
    }

    // 1. Console logging (always)
    console.log(`[Circuit Breaker Alert] ${alert.message}`)
    console.log(`[Circuit Breaker Alert] Details:`, {
      api: alert.api,
      severity: alert.severity,
      event: alert.event,
      circuitState: alert.circuitState,
      healthScore: alert.healthScore,
      stats: alert.stats,
    })
    notificationsSent.push('console')

    // 2. Email notifications (for critical and warning)
    if (alertData.severity === 'critical' || alertData.severity === 'warning') {
      try {
        await this.sendEmailAlert(alert)
        notificationsSent.push('email')
      } catch (error) {
        console.error('[Circuit Breaker Alerts] Failed to send email:', error)
      }
    }

    // 3. Slack/Discord webhook (if configured)
    if (process.env.ALERT_WEBHOOK_URL) {
      try {
        await this.sendWebhookAlert(alert)
        notificationsSent.push('webhook')
      } catch (error) {
        console.error('[Circuit Breaker Alerts] Failed to send webhook:', error)
      }
    }

    // 4. Database logging (always)
    try {
      await this.logAlertToDatabase(alert)
      notificationsSent.push('database')
    } catch (error) {
      console.error('[Circuit Breaker Alerts] Failed to log to database:', error)
    }

    // Update alert record with sent notifications
    alert.notificationsSent = notificationsSent

    // Store in memory history (max 100 alerts per API)
    this.alertHistory.push(alert)
    if (this.alertHistory.length > 200) {
      this.alertHistory = this.alertHistory.slice(-200)
    }

    // Update monitoring state
    state.lastAlertTimestamp = new Date()
    state.alertCount++
  }

  /**
   * Send email alert to admins
   */
  private async sendEmailAlert(alert: CircuitBreakerAlert): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) {
      console.log('[Circuit Breaker Alerts] No ADMIN_EMAIL configured, skipping email notification')
      return
    }

    const severityEmoji = {
      critical: '🚨',
      warning: '⚠️',
      info: 'ℹ️',
    }

    const subject = `${severityEmoji[alert.severity]} ${alert.api.toUpperCase()} API ${alert.event.toUpperCase()}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${alert.severity === 'critical' ? '#dc2626' : alert.severity === 'warning' ? '#f59e0b' : '#3b82f6'};">
          ${alert.message}
        </h2>

        <h3>Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>API:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${alert.api.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Severity:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${alert.severity.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Event:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${alert.event.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Circuit State:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${alert.circuitState}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Health Score:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${alert.healthScore}/100</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Timestamp:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${alert.timestamp.toISOString()}</td>
          </tr>
        </table>

        <h3>Statistics</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Total Requests:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${alert.stats.totalRequests}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Success Rate:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
              ${alert.stats.totalRequests > 0 ? ((alert.stats.successfulRequests / alert.stats.totalRequests) * 100).toFixed(1) : '0.0'}%
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Failed Requests:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${alert.stats.failedRequests}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Timeout Errors:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${alert.stats.timeoutErrors}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Network Errors:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${alert.stats.networkErrors}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Circuit Breaker Trips:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${alert.stats.circuitBreakerTrips}</td>
          </tr>
        </table>

        <p style="margin-top: 20px; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
          <strong>Action Required:</strong><br>
          ${this.getActionRecommendation(alert)}
        </p>

        <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
          This is an automated alert from Verscienta Health Circuit Breaker Monitoring System.
        </p>
      </div>
    `

    await sendEmail({
      to: adminEmail,
      subject,
      html,
    })
  }

  /**
   * Send webhook alert (Slack/Discord)
   */
  private async sendWebhookAlert(alert: CircuitBreakerAlert): Promise<void> {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL
    if (!webhookUrl) return

    const color = {
      critical: '#dc2626',
      warning: '#f59e0b',
      info: '#3b82f6',
    }

    // Slack-compatible webhook payload
    const payload = {
      username: 'Circuit Breaker Monitor',
      icon_emoji: ':warning:',
      attachments: [
        {
          color: color[alert.severity],
          title: `${alert.api.toUpperCase()} API ${alert.event.toUpperCase()}`,
          text: alert.message,
          fields: [
            { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
            { title: 'Circuit State', value: alert.circuitState, short: true },
            { title: 'Health Score', value: `${alert.healthScore}/100`, short: true },
            {
              title: 'Success Rate',
              value: `${alert.stats.totalRequests > 0 ? ((alert.stats.successfulRequests / alert.stats.totalRequests) * 100).toFixed(1) : '0.0'}%`,
              short: true,
            },
          ],
          footer: 'Verscienta Health Monitoring',
          ts: Math.floor(alert.timestamp.getTime() / 1000),
        },
      ],
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }

  /**
   * Log alert to database
   */
  private async logAlertToDatabase(alert: CircuitBreakerAlert): Promise<void> {
    try {
      const payload = await getPayload({ config })

      await payload.create({
        collection: 'systemLogs',
        data: {
          type: 'Circuit Breaker Alert',
          severity: alert.severity,
          message: alert.message,
          details: JSON.stringify({
            api: alert.api,
            event: alert.event,
            circuitState: alert.circuitState,
            healthScore: alert.healthScore,
            stats: alert.stats,
            notificationsSent: alert.notificationsSent,
          }),
          source: `${alert.api}-circuit-breaker`,
          timestamp: alert.timestamp,
        },
      })
    } catch (error) {
      // Fail silently if systemLogs collection doesn't exist
      console.error('[Circuit Breaker Alerts] Failed to log to database:', error)
    }
  }

  /**
   * Get action recommendation based on alert
   */
  private getActionRecommendation(alert: CircuitBreakerAlert): string {
    if (alert.event === 'opened') {
      return `The circuit breaker has opened to prevent cascading failures. Wait ${60} seconds for automatic recovery attempt. If issues persist, check API status and rate limits.`
    }

    if (alert.event === 'degraded') {
      return 'Monitor API health closely. Consider reducing request frequency or investigating error patterns.'
    }

    if (alert.event === 'half_open') {
      return 'Circuit breaker is testing recovery. Avoid high-volume operations until fully recovered.'
    }

    if (alert.event === 'closed') {
      return 'Service has recovered. Monitor for stability. If failures recur frequently, investigate root cause.'
    }

    if (alert.event === 'recovered') {
      return 'Health has improved. Continue normal operations.'
    }

    return 'Review statistics and take appropriate action based on error patterns.'
  }

  /**
   * Calculate health score from statistics
   */
  private calculateHealthScore(stats: any): number {
    if (stats.totalRequests === 0) return 100

    let score = 100

    const successRate = (stats.successfulRequests / stats.totalRequests) * 100
    if (successRate < 90) score -= 20
    if (successRate < 70) score -= 20

    const retryRate = (stats.retriedRequests / stats.totalRequests) * 100
    if (retryRate > 30) score -= 15

    const timeoutRate = (stats.timeoutErrors / stats.totalRequests) * 100
    if (timeoutRate > 10) score -= 15

    const networkRate = (stats.networkErrors / stats.totalRequests) * 100
    if (networkRate > 5) score -= 15

    if (stats.rateLimitErrors > 0) score -= 10
    if (stats.circuitBreakerTrips > 0) score -= 20

    return Math.max(0, score)
  }

  /**
   * Get alert history for specific API
   */
  getAlertHistory(api?: 'trefle' | 'perenual', limit: number = 50): CircuitBreakerAlert[] {
    let history = this.alertHistory

    if (api) {
      history = history.filter((alert) => alert.api === api)
    }

    return history.slice(-limit).reverse()
  }

  /**
   * Get monitoring state for specific API
   */
  getMonitoringState(api: 'trefle' | 'perenual'): MonitoringState | undefined {
    return this.monitoringState.get(api)
  }

  /**
   * Reset alert history
   */
  resetAlertHistory(api?: 'trefle' | 'perenual'): void {
    if (api) {
      this.alertHistory = this.alertHistory.filter((alert) => alert.api !== api)
    } else {
      this.alertHistory = []
    }
  }

  /**
   * Configure alert cooldown period
   */
  setAlertCooldown(milliseconds: number): void {
    this.alertCooldown = milliseconds
  }
}

/**
 * Singleton instance
 */
export const circuitBreakerAlerts = new CircuitBreakerAlertSystem()

/**
 * Cron job to monitor circuit breakers
 * Run every 30 seconds
 */
export function scheduleCircuitBreakerMonitoring(): void {
  setInterval(async () => {
    await circuitBreakerAlerts.checkAndAlert('trefle')
    await circuitBreakerAlerts.checkAndAlert('perenual')
  }, 30 * 1000) // Every 30 seconds

  console.log('[Circuit Breaker Alerts] ✓ Monitoring scheduled (every 30 seconds)')
}
