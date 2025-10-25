#!/usr/bin/env tsx
/**
 * Certificate Expiration Check Script
 *
 * This script checks the TLS certificate expiration for DragonflyDB
 * and sends alerts if the certificate is expiring soon.
 *
 * Usage:
 * ```bash
 * # Run manually
 * tsx scripts/check-cert-expiry.ts
 *
 * # Run with custom thresholds
 * CERT_EXPIRY_WARNING_DAYS=45 tsx scripts/check-cert-expiry.ts
 *
 * # Enable all notifications
 * ALERT_EMAIL=admin@example.com SLACK_WEBHOOK_URL=https://hooks.slack.com/... tsx scripts/check-cert-expiry.ts
 * ```
 *
 * Cron Setup (run daily at 9 AM):
 * ```
 * 0 9 * * * cd /app && tsx scripts/check-cert-expiry.ts >> /var/log/cert-check.log 2>&1
 * ```
 *
 * Environment Variables:
 * - REDIS_URL or REDIS_HOST (required if TLS enabled)
 * - REDIS_PORT (default: 6379)
 * - CERT_EXPIRY_WARNING_DAYS (default: 30)
 * - CERT_EXPIRY_CRITICAL_DAYS (default: 7)
 * - CERT_MONITOR_ENABLED (set to 'false' to disable)
 * - ALERT_EMAIL (optional, for email notifications)
 * - SLACK_WEBHOOK_URL (optional, for Slack notifications)
 */

import { monitorCertificate } from '../lib/cert-monitor'

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(80))
  console.log('Certificate Expiration Check')
  console.log(new Date().toISOString())
  console.log('='.repeat(80))
  console.log()

  try {
    // Run certificate monitoring
    await monitorCertificate({
      warningDays: parseInt(process.env.CERT_EXPIRY_WARNING_DAYS || '30'),
      criticalDays: parseInt(process.env.CERT_EXPIRY_CRITICAL_DAYS || '7'),
      timeout: 10000,
      enableEmail: !!process.env.ALERT_EMAIL,
      enableSlack: !!process.env.SLACK_WEBHOOK_URL,
      enableWebhook: false,
    })

    console.log()
    console.log('✓ Certificate check completed successfully')
    process.exit(0)
  } catch (error) {
    console.error()
    console.error('✗ Certificate check failed:', error)
    process.exit(1)
  }
}

// Run main function
main()
