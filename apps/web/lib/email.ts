import { render } from '@react-email/render'
import { Resend } from 'resend'
import {
  EmailVerificationEmail,
  MagicLinkEmail,
  MfaBackupCodesEmail,
  MfaSetupEmail,
  PasswordResetEmail,
  SecurityAlertEmail,
  WelcomeEmail,
} from '../emails'

/**
 * Email Service Utility
 *
 * Centralized email sending using Resend with React Email templates
 * Used for:
 * - Authentication (magic link, password reset, email verification)
 * - Account notifications (welcome, security alerts, MFA)
 * - Contact form submissions
 * - Admin alerts
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

// Default sender email
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Verscienta Health <noreply@verscienta.com>'

// Admin email for notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@verscienta.com'

// App URL for links in emails
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'dummy_key_for_build'
}

/**
 * Generic email sending function
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string
  subject: string
  html?: string
  text?: string
  from?: string
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(`Email service not configured. Would send to: ${to}, subject: ${subject}`)
    return
  }

  try {
    const resend = getResendClient()
    const emailOptions: any = {
      from: from || FROM_EMAIL,
      to,
      subject,
    }

    // Resend requires either html or text (or both)
    if (html) {
      emailOptions.html = html
    }
    if (text) {
      emailOptions.text = text
    }

    await resend.emails.send(emailOptions)
    console.log(`Email sent successfully to: ${to}`)
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error)
    throw error
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail({
  email,
  firstName,
}: {
  email: string
  firstName?: string
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Would send welcome email to:', email)
    return
  }

  try {
    const html = await render(WelcomeEmail({ firstName, email, appUrl: APP_URL }))

    await sendEmail({
      to: email,
      subject: 'Welcome to Verscienta Health!',
      html,
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    throw error
  }
}

/**
 * Send email verification link
 */
export async function sendEmailVerification({
  email,
  verificationUrl,
  expiresInMinutes = 5,
}: {
  email: string
  verificationUrl: string
  expiresInMinutes?: number
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Verification URL:', verificationUrl)
    return
  }

  try {
    const html = await render(
      EmailVerificationEmail({
        email,
        verificationUrl,
        expiresInMinutes,
      })
    )

    await sendEmail({
      to: email,
      subject: 'Verify your Verscienta Health email address',
      html,
    })
  } catch (error) {
    console.error('Failed to send email verification:', error)
    throw error
  }
}

/**
 * Send magic link authentication email
 */
export async function sendMagicLinkEmail({
  email,
  url,
  expiresInMinutes = 5,
}: {
  email: string
  url: string
  expiresInMinutes?: number
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Magic link URL:', url)
    return
  }

  try {
    const html = await render(
      MagicLinkEmail({
        email,
        magicLinkUrl: url,
        expiresInMinutes,
      })
    )

    await sendEmail({
      to: email,
      subject: 'Sign in to Verscienta Health',
      html,
    })
  } catch (error) {
    console.error('Failed to send magic link email:', error)
    throw error
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail({
  email,
  resetUrl,
  expiresInMinutes = 15,
  ipAddress,
}: {
  email: string
  resetUrl: string
  expiresInMinutes?: number
  ipAddress?: string
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Reset URL:', resetUrl)
    return
  }

  try {
    const html = await render(
      PasswordResetEmail({
        email,
        resetUrl,
        expiresInMinutes,
        ipAddress,
      })
    )

    await sendEmail({
      to: email,
      subject: 'Reset your Verscienta Health password',
      html,
    })
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    throw error
  }
}

/**
 * Send MFA setup confirmation email
 */
export async function sendMfaSetupEmail({
  email,
  firstName,
}: {
  email: string
  firstName?: string
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Would send MFA setup email to:', email)
    return
  }

  try {
    const html = await render(
      MfaSetupEmail({
        email,
        firstName,
        setupDate: new Date(),
      })
    )

    await sendEmail({
      to: email,
      subject: 'Two-factor authentication enabled',
      html,
    })
  } catch (error) {
    console.error('Failed to send MFA setup email:', error)
    throw error
  }
}

/**
 * Send MFA backup codes email
 */
export async function sendMfaBackupCodesEmail({
  email,
  firstName,
  backupCodes,
}: {
  email: string
  firstName?: string
  backupCodes: string[]
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Would send MFA backup codes to:', email)
    return
  }

  try {
    const html = await render(
      MfaBackupCodesEmail({
        email,
        firstName,
        backupCodes,
      })
    )

    await sendEmail({
      to: email,
      subject: 'Your two-factor authentication backup codes',
      html,
    })
  } catch (error) {
    console.error('Failed to send MFA backup codes email:', error)
    throw error
  }
}

/**
 * Send security alert email
 */
export async function sendSecurityAlertEmail({
  email,
  firstName,
  alertType,
  details,
}: {
  email: string
  firstName?: string
  alertType: 'suspicious_login' | 'password_changed' | 'account_lockout' | 'unusual_activity'
  details: {
    timestamp: Date
    ipAddress?: string
    location?: string
    device?: string
    action?: string
  }
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Would send security alert to:', email)
    return
  }

  try {
    const html = await render(
      SecurityAlertEmail({
        email,
        firstName,
        alertType,
        details,
        appUrl: APP_URL,
      })
    )

    await sendEmail({
      to: email,
      subject: `Security alert for your Verscienta Health account`,
      html,
    })
  } catch (error) {
    console.error('Failed to send security alert email:', error)
    throw error
  }
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

  await getResendClient().emails.send({
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

  await getResendClient().emails.send({
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
 * Legacy function - redirects to sendSecurityAlertEmail
 * @deprecated Use sendSecurityAlertEmail instead
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
  console.warn('sendSecurityAlert is deprecated. Use sendSecurityAlertEmail instead.')

  // For now, send to admin
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Security alert:', {
      type,
      message,
      details,
    })
    return
  }

  await getResendClient().emails.send({
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
