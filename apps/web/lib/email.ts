import { Resend } from 'resend'

/**
 * Email Service Utility
 *
 * Centralized email sending using Resend
 * Used for:
 * - Magic link authentication
 * - Contact form submissions
 * - Account notifications
 * - Admin alerts
 */

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender email
const FROM_EMAIL = process.env.EMAIL_FROM || 'Verscienta Health <noreply@verscientahealth.com>'

// Admin email for notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@verscientahealth.com'

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

/**
 * Send magic link authentication email
 */
export async function sendMagicLinkEmail({
  email,
  url,
}: {
  email: string
  url: string
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Magic link URL:', url)
    return
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Sign in to Verscienta Health',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2d5016;">Sign in to Verscienta Health</h1>
        <p>Click the button below to sign in to your account. This link will expire in 5 minutes.</p>
        <div style="margin: 32px 0;">
          <a href="${url}" style="background-color: #2d5016; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Sign In
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this email, you can safely ignore it.
        </p>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this URL into your browser:<br>
          <a href="${url}" style="color: #2d5016;">${url}</a>
        </p>
      </div>
    `,
  })
}

/**
 * Send contact form submission to admin
 */
export async function sendContactFormEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Contact form submission:', {
      name,
      email,
      subject,
      message,
    })
    return
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `Contact Form: ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">New Contact Form Submission</h2>
        <div style="background-color: #f5f5f5; padding: 16px; border-radius: 6px; margin: 16px 0;">
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        <div style="margin: 16px 0;">
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `,
  })
}

/**
 * Send admin notification email
 */
export async function sendAdminNotification({
  subject,
  message,
  details,
}: {
  subject: string
  message: string
  details?: Record<string, unknown>
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Admin notification:', {
      subject,
      message,
      details,
    })
    return
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `[Verscienta Health] ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">${subject}</h2>
        <p>${message}</p>
        ${
          details
            ? `
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <h3>Details:</h3>
            <pre style="white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(details, null, 2)}</pre>
          </div>
        `
            : ''
        }
        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          Sent at ${new Date().toISOString()}
        </p>
      </div>
    `,
  })
}

/**
 * Send security alert email
 */
export async function sendSecurityAlert({
  type,
  message,
  details,
}: {
  type: 'suspicious_activity' | 'failed_login' | 'account_lockout'
  message: string
  details: Record<string, unknown>
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Security alert:', {
      type,
      message,
      details,
    })
    return
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `[SECURITY ALERT] ${type.replace(/_/g, ' ').toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc2626; color: white; padding: 16px; border-radius: 6px 6px 0 0;">
          <h2 style="margin: 0;">🚨 Security Alert</h2>
        </div>
        <div style="border: 2px solid #dc2626; border-top: none; padding: 16px; border-radius: 0 0 6px 6px;">
          <p><strong>Type:</strong> ${type.replace(/_/g, ' ')}</p>
          <p>${message}</p>
          <div style="background-color: #fef2f2; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <h3>Details:</h3>
            <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 12px;">${JSON.stringify(details, null, 2)}</pre>
          </div>
          <p style="color: #666; font-size: 12px;">
            Detected at ${new Date().toISOString()}
          </p>
        </div>
      </div>
    `,
  })
}
