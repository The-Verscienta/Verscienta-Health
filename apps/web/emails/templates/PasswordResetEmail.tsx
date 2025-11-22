import { Hr, Section } from '@react-email/components'
import * as React from 'react'
import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { Layout } from '../components/Layout'
import { Paragraph } from '../components/Paragraph'

/**
 * Password Reset Email Template
 *
 * Sent when users request a password reset
 * Includes: Reset link with expiration and security notice
 */

export interface PasswordResetEmailProps {
  email: string
  resetUrl: string
  expiresInMinutes?: number
  ipAddress?: string
}

export function PasswordResetEmail({
  email,
  resetUrl,
  expiresInMinutes = 15,
  ipAddress,
}: PasswordResetEmailProps) {
  return (
    <Layout preview="Reset your Verscienta Health password">
      <Heading>Reset Your Password</Heading>

      <Paragraph>Hi there,</Paragraph>

      <Paragraph>
        We received a request to reset the password for your Verscienta Health account associated
        with <strong>{email}</strong>.
      </Paragraph>

      <Paragraph>Click the button below to reset your password:</Paragraph>

      <Section style={ctaSection}>
        <Button href={resetUrl}>Reset Password</Button>
      </Section>

      <Paragraph color="muted">
        This password reset link will expire in {expiresInMinutes} minutes for security purposes.
      </Paragraph>

      {ipAddress && (
        <Paragraph color="muted">
          <strong>Security Info:</strong> This request was made from IP address: {ipAddress}
        </Paragraph>
      )}

      <Hr style={divider} />

      <Section style={warningBox}>
        <Paragraph color="warning" style={{ margin: 0 }}>
          ⚠️ <strong>Security Notice:</strong> If you didn't request a password reset, please ignore
          this email and ensure your account is secure. Your password will not be changed unless you
          click the link above.
        </Paragraph>
      </Section>

      <Hr style={divider} />

      <Paragraph color="muted">
        Or copy and paste this URL into your browser:
      </Paragraph>
      <Paragraph color="muted">
        <a href={resetUrl} style={urlLink}>
          {resetUrl}
        </a>
      </Paragraph>

      <Paragraph color="muted">
        If you continue to have problems, please contact our support team.
      </Paragraph>
    </Layout>
  )
}

// Styles
const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
}

const urlLink = {
  color: '#2d5016',
  textDecoration: 'underline',
}
