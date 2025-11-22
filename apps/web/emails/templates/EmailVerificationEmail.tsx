import { Hr, Section } from '@react-email/components'
import * as React from 'react'
import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { Layout } from '../components/Layout'
import { Paragraph } from '../components/Paragraph'

/**
 * Email Verification Template
 *
 * Sent to users who need to verify their email address
 * Includes: Verification link with expiration notice
 */

export interface EmailVerificationEmailProps {
  email: string
  verificationUrl: string
  expiresInMinutes?: number
}

export function EmailVerificationEmail({
  email,
  verificationUrl,
  expiresInMinutes = 5,
}: EmailVerificationEmailProps) {
  return (
    <Layout preview="Verify your Verscienta Health email address">
      <Heading>Verify Your Email Address</Heading>

      <Paragraph>Hi there,</Paragraph>

      <Paragraph>
        Thank you for signing up for Verscienta Health. To complete your registration, please verify
        your email address by clicking the button below.
      </Paragraph>

      <Section style={ctaSection}>
        <Button href={verificationUrl}>Verify Email Address</Button>
      </Section>

      <Paragraph color="muted">
        This verification link will expire in {expiresInMinutes} minutes for security purposes.
      </Paragraph>

      <Hr style={divider} />

      <Paragraph color="muted">
        If you didn't create an account with Verscienta Health, you can safely ignore this email.
      </Paragraph>

      <Paragraph color="muted">
        Or copy and paste this URL into your browser:
      </Paragraph>
      <Paragraph color="muted">
        <a href={verificationUrl} style={urlLink}>
          {verificationUrl}
        </a>
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

const urlLink = {
  color: '#2d5016',
  textDecoration: 'underline',
}
