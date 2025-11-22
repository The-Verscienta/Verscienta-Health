import { render } from '@react-email/render'
import { NextRequest, NextResponse } from 'next/server'
import {
  EmailVerificationEmail,
  MagicLinkEmail,
  MfaBackupCodesEmail,
  MfaSetupEmail,
  PasswordResetEmail,
  SecurityAlertEmail,
  WelcomeEmail,
} from '@/emails'

/**
 * Email Preview API Route (Development Only)
 *
 * Preview email templates in the browser without sending
 * Usage: GET /api/dev/email-preview?template=welcome&firstName=John
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const searchParams = request.nextUrl.searchParams
  const template = searchParams.get('template') || 'welcome'
  const email = searchParams.get('email') || 'user@example.com'
  const firstName = searchParams.get('firstName') || 'John'

  let html: string

  try {
    switch (template) {
      case 'welcome':
        html = await render(
          WelcomeEmail({
            firstName,
            email,
            appUrl: APP_URL,
          })
        )
        break

      case 'email-verification':
        html = await render(
          EmailVerificationEmail({
            email,
            verificationUrl: `${APP_URL}/verify-email?token=sample-token-123`,
            expiresInMinutes: 5,
          })
        )
        break

      case 'magic-link':
        html = await render(
          MagicLinkEmail({
            email,
            magicLinkUrl: `${APP_URL}/api/auth/magic-link/verify?token=sample-token-123`,
            expiresInMinutes: 5,
          })
        )
        break

      case 'password-reset':
        html = await render(
          PasswordResetEmail({
            email,
            resetUrl: `${APP_URL}/reset-password?token=sample-token-123`,
            expiresInMinutes: 15,
            ipAddress: '192.168.1.1',
          })
        )
        break

      case 'mfa-setup':
        html = await render(
          MfaSetupEmail({
            email,
            firstName,
            setupDate: new Date(),
          })
        )
        break

      case 'mfa-backup-codes':
        html = await render(
          MfaBackupCodesEmail({
            email,
            firstName,
            backupCodes: [
              'A1B2C3D4',
              'E5F6G7H8',
              'I9J0K1L2',
              'M3N4O5P6',
              'Q7R8S9T0',
              'U1V2W3X4',
              'Y5Z6A7B8',
              'C9D0E1F2',
              'G3H4I5J6',
              'K7L8M9N0',
            ],
          })
        )
        break

      case 'security-alert-suspicious':
        html = await render(
          SecurityAlertEmail({
            email,
            firstName,
            alertType: 'suspicious_login',
            details: {
              timestamp: new Date(),
              ipAddress: '192.168.1.100',
              location: 'New York, USA',
              device: 'Chrome on Windows',
              action: 'Login attempt',
            },
            appUrl: APP_URL,
          })
        )
        break

      case 'security-alert-password':
        html = await render(
          SecurityAlertEmail({
            email,
            firstName,
            alertType: 'password_changed',
            details: {
              timestamp: new Date(),
              ipAddress: '192.168.1.100',
              location: 'New York, USA',
              device: 'Chrome on Windows',
            },
            appUrl: APP_URL,
          })
        )
        break

      case 'security-alert-lockout':
        html = await render(
          SecurityAlertEmail({
            email,
            firstName,
            alertType: 'account_lockout',
            details: {
              timestamp: new Date(),
              ipAddress: '192.168.1.100',
              action: '5 failed login attempts',
            },
            appUrl: APP_URL,
          })
        )
        break

      default:
        return NextResponse.json(
          {
            error: 'Invalid template',
            available: [
              'welcome',
              'email-verification',
              'magic-link',
              'password-reset',
              'mfa-setup',
              'mfa-backup-codes',
              'security-alert-suspicious',
              'security-alert-password',
              'security-alert-lockout',
            ],
          },
          { status: 400 }
        )
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Email preview error:', error)
    return NextResponse.json({ error: 'Failed to render template' }, { status: 500 })
  }
}
