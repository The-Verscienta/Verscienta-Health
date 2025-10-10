import { Resend } from 'resend'

/**
 * Email Service for CMS Cron Jobs
 *
 * Sends notifications to admins about:
 * - Cron job completion
 * - Validation errors
 * - Data sync issues
 * - Failed jobs
 */

// Lazy-load Resend client to avoid build-time errors
let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY || 'dummy_key_for_build'
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

// Default sender and admin emails
const FROM_EMAIL = process.env.EMAIL_FROM || 'Verscienta CMS <cms@verscientahealth.com>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@verscientahealth.com'

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'dummy_key_for_build'
}

/**
 * Send cron job completion notification
 */
export async function sendCronJobCompletionEmail({
  jobName,
  stats,
  duration,
  errors = [],
}: {
  jobName: string
  stats: Record<string, number>
  duration: number
  errors?: string[]
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Skipping notification.')
    return
  }

  const hasErrors = errors.length > 0
  const subject = hasErrors
    ? `⚠️ [CMS] ${jobName} completed with errors`
    : `✅ [CMS] ${jobName} completed successfully`

  await getResendClient().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${hasErrors ? '#fef2f2' : '#f0fdf4'}; padding: 16px; border-radius: 6px 6px 0 0; border-left: 4px solid ${hasErrors ? '#dc2626' : '#16a34a'};">
          <h2 style="margin: 0; color: ${hasErrors ? '#dc2626' : '#16a34a'};">
            ${hasErrors ? '⚠️' : '✅'} ${jobName}
          </h2>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: none; padding: 16px; border-radius: 0 0 6px 6px;">
          <h3>Statistics</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${Object.entries(stats)
              .map(
                ([key, value]) => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${key}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;"><strong>${value}</strong></td>
              </tr>
            `
              )
              .join('')}
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Duration</td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;"><strong>${duration.toFixed(2)}s</strong></td>
            </tr>
          </table>

          ${
            hasErrors
              ? `
            <div style="margin-top: 16px; background-color: #fef2f2; padding: 12px; border-radius: 6px; border-left: 4px solid #dc2626;">
              <h3 style="color: #dc2626; margin-top: 0;">Errors (${errors.length})</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${errors
                  .slice(0, 10)
                  .map((error) => `<li style="margin: 4px 0;">${error}</li>`)
                  .join('')}
                ${errors.length > 10 ? `<li style="margin: 4px 0;"><em>... and ${errors.length - 10} more</em></li>` : ''}
              </ul>
            </div>
          `
              : ''
          }

          <p style="color: #666; font-size: 12px; margin-top: 16px;">
            Completed at ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `,
  })
}

/**
 * Send validation error notification
 */
export async function sendValidationErrorEmail({
  jobName,
  errors,
  totalRecords,
}: {
  jobName: string
  errors: Array<{ field: string; message: string; recordId?: string }>
  totalRecords: number
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Skipping notification.')
    return
  }

  await getResendClient().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `⚠️ [CMS] Validation errors in ${jobName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #fef2f2; padding: 16px; border-radius: 6px 6px 0 0; border-left: 4px solid #dc2626;">
          <h2 style="margin: 0; color: #dc2626;">⚠️ Validation Errors Detected</h2>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: none; padding: 16px; border-radius: 0 0 6px 6px;">
          <p>Found <strong>${errors.length}</strong> validation errors out of <strong>${totalRecords}</strong> total records in ${jobName}.</p>

          <h3>Error Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Field</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Message</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Record ID</th>
              </tr>
            </thead>
            <tbody>
              ${errors
                .slice(0, 20)
                .map(
                  (error) => `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${error.field}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${error.message}</td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${error.recordId || 'N/A'}</td>
                </tr>
              `
                )
                .join('')}
              ${
                errors.length > 20
                  ? `
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: center; color: #666; font-style: italic;">
                    ... and ${errors.length - 20} more errors
                  </td>
                </tr>
              `
                  : ''
              }
            </tbody>
          </table>

          <p style="color: #666; font-size: 12px; margin-top: 16px;">
            Detected at ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `,
  })
}

/**
 * Send job failure alert
 */
export async function sendJobFailureAlert({
  jobName,
  error,
  stackTrace,
}: {
  jobName: string
  error: string
  stackTrace?: string
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Skipping notification.')
    return
  }

  await getResendClient().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `🚨 [CMS] Job Failed: ${jobName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #7f1d1d; color: white; padding: 16px; border-radius: 6px 6px 0 0;">
          <h2 style="margin: 0;">🚨 Critical Job Failure</h2>
        </div>
        <div style="border: 1px solid #dc2626; border-top: none; padding: 16px; border-radius: 0 0 6px 6px;">
          <p><strong>Job:</strong> ${jobName}</p>
          <p><strong>Error:</strong></p>
          <div style="background-color: #fef2f2; padding: 12px; border-radius: 6px; border-left: 4px solid #dc2626; margin: 8px 0;">
            <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-size: 12px;">${error}</pre>
          </div>

          ${
            stackTrace
              ? `
            <details>
              <summary style="cursor: pointer; padding: 8px 0; font-weight: 600;">Stack Trace</summary>
              <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 8px;">
                <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-size: 11px; color: #666;">${stackTrace}</pre>
              </div>
            </details>
          `
              : ''
          }

          <p style="color: #666; font-size: 12px; margin-top: 16px;">
            Failed at ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    `,
  })
}
