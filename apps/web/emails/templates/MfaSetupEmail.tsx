import { Hr, Img, Section } from '@react-email/components'
import * as React from 'react'
import { Heading } from '../components/Heading'
import { Layout } from '../components/Layout'
import { Paragraph } from '../components/Paragraph'

/**
 * MFA Setup Email Template
 *
 * Sent when users enable two-factor authentication
 * Includes: Confirmation message and security tips
 */

export interface MfaSetupEmailProps {
  email: string
  firstName?: string
  setupDate: Date
}

export function MfaSetupEmail({ email, firstName, setupDate }: MfaSetupEmailProps) {
  const displayName = firstName || email.split('@')[0]
  const formattedDate = setupDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Layout preview="Two-factor authentication enabled on your account">
      <Section style={successBanner}>
        <Paragraph style={{ margin: 0, color: '#ffffff', textAlign: 'center' }}>
          ✓ Security Enhanced
        </Paragraph>
      </Section>

      <Heading>Two-Factor Authentication Enabled</Heading>

      <Paragraph>Hi {displayName},</Paragraph>

      <Paragraph>
        Two-factor authentication (2FA) has been successfully enabled on your Verscienta Health
        account.
      </Paragraph>

      <Section style={infoBox}>
        <Paragraph style={{ margin: '0 0 8px' }}>
          <strong>Account:</strong> {email}
        </Paragraph>
        <Paragraph style={{ margin: 0 }}>
          <strong>Enabled on:</strong> {formattedDate}
        </Paragraph>
      </Section>

      <Paragraph>
        Your account is now more secure. Each time you sign in, you'll need to provide both your
        password and a verification code from your authenticator app.
      </Paragraph>

      <Hr style={divider} />

      <Heading level={2}>Security Tips</Heading>

      <Section style={tipsSection}>
        <Paragraph>
          <strong style={strong}>🔐 Keep backup codes safe:</strong> Store your backup codes in a
          secure location. You'll need them if you lose access to your authenticator app.
        </Paragraph>
        <Paragraph>
          <strong style={strong}>📱 Multiple devices:</strong> Consider adding your authenticator to
          multiple devices for redundancy.
        </Paragraph>
        <Paragraph>
          <strong style={strong}>🔄 Update your app:</strong> Keep your authenticator app updated to
          ensure maximum security.
        </Paragraph>
      </Section>

      <Hr style={divider} />

      <Section style={warningBox}>
        <Paragraph color="warning" style={{ margin: 0 }}>
          ⚠️ <strong>Security Alert:</strong> If you didn't enable 2FA on your account, please
          contact our support team immediately.
        </Paragraph>
      </Section>

      <Paragraph color="muted">
        Need help? Visit our{' '}
        <a href="https://verscienta.com/help/2fa" style={link}>
          2FA help center
        </a>{' '}
        or contact support.
      </Paragraph>
    </Layout>
  )
}

// Styles
const successBanner = {
  backgroundColor: '#059669',
  padding: '16px',
  borderRadius: '6px 6px 0 0',
  margin: '-32px -32px 24px',
}

const infoBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const tipsSection = {
  margin: '16px 0',
}

const strong = {
  color: '#2d5016',
}

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
}

const link = {
  color: '#2d5016',
  textDecoration: 'underline',
}
