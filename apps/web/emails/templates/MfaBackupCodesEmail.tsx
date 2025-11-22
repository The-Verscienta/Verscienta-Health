import { Code, Hr, Section } from '@react-email/components'
import * as React from 'react'
import { Heading } from '../components/Heading'
import { Layout } from '../components/Layout'
import { Paragraph } from '../components/Paragraph'

/**
 * MFA Backup Codes Email Template
 *
 * Sent when users generate backup codes for 2FA
 * Includes: List of backup codes with security warnings
 */

export interface MfaBackupCodesEmailProps {
  email: string
  firstName?: string
  backupCodes: string[]
}

export function MfaBackupCodesEmail({ email, firstName, backupCodes }: MfaBackupCodesEmailProps) {
  const displayName = firstName || email.split('@')[0]

  return (
    <Layout preview="Your two-factor authentication backup codes">
      <Heading>Your 2FA Backup Codes</Heading>

      <Paragraph>Hi {displayName},</Paragraph>

      <Paragraph>
        Here are your two-factor authentication backup codes for your Verscienta Health account. Each
        code can only be used once.
      </Paragraph>

      <Section style={warningBox}>
        <Paragraph style={{ margin: 0 }} color="warning">
          ⚠️ <strong>Important:</strong> Store these codes in a secure location. You'll need them if
          you lose access to your authenticator app.
        </Paragraph>
      </Section>

      <Section style={codesBox}>
        {backupCodes.map((code, index) => (
          <Code key={index} style={codeStyle}>
            {code}
          </Code>
        ))}
      </Section>

      <Hr style={divider} />

      <Heading level={2}>How to Use Backup Codes</Heading>

      <Paragraph>
        1. When signing in, enter your email and password as usual
        <br />
        2. When prompted for your 2FA code, click "Use backup code"
        <br />
        3. Enter one of the codes from above
        <br />
        4. The code will be invalidated after use
      </Paragraph>

      <Hr style={divider} />

      <Section style={infoBox}>
        <Paragraph style={{ margin: 0 }}>
          💡 <strong>Pro Tip:</strong> Print these codes and store them in a safe place, or save them
          in a secure password manager.
        </Paragraph>
      </Section>

      <Hr style={divider} />

      <Section style={dangerBox}>
        <Paragraph style={{ margin: 0 }} color="error">
          🚨 <strong>Security Warning:</strong> Do not share these codes with anyone. Verscienta
          Health support will never ask for your backup codes.
        </Paragraph>
      </Section>

      <Paragraph color="muted">
        You can generate new backup codes anytime from your account security settings. When you do,
        these codes will no longer work.
      </Paragraph>
    </Layout>
  )
}

// Styles
const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
}

const codesBox = {
  backgroundColor: '#f9fafb',
  border: '2px dashed #d1d5db',
  borderRadius: '6px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const codeStyle = {
  display: 'block',
  fontFamily: 'monospace',
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  padding: '8px 16px',
  margin: '8px auto',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '4px',
  width: 'fit-content',
  letterSpacing: '2px',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const infoBox = {
  backgroundColor: '#dbeafe',
  border: '1px solid #3b82f6',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
}

const dangerBox = {
  backgroundColor: '#fee2e2',
  border: '1px solid #dc2626',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
}
