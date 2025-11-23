import { Hr, Section } from '@react-email/components'
import * as React from 'react'
import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { Layout } from '../components/Layout'
import { Paragraph } from '../components/Paragraph'

/**
 * Magic Link Email Template
 *
 * Sent for passwordless authentication
 * Includes: One-time sign-in link with expiration
 */

export interface MagicLinkEmailProps {
  magicLinkUrl: string
  expiresInMinutes?: number
}

export function MagicLinkEmail({
  magicLinkUrl,
  expiresInMinutes = 5,
}: MagicLinkEmailProps) {
  return (
    <Layout preview="Sign in to Verscienta Health">
      <Heading>Sign in to Verscienta Health</Heading>

      <Paragraph>Hi there,</Paragraph>

      <Paragraph>
        Click the button below to sign in to your Verscienta Health account. No password required!
      </Paragraph>

      <Section style={ctaSection}>
        <Button href={magicLinkUrl}>Sign In</Button>
      </Section>

      <Paragraph color="muted">
        This magic link will expire in {expiresInMinutes} minutes for security purposes.
      </Paragraph>

      <Hr style={divider} />

      <Paragraph color="muted">
        If you didn't request this sign-in link, you can safely ignore this email. Your account
        remains secure.
      </Paragraph>

      <Paragraph color="muted">
        Or copy and paste this URL into your browser:
      </Paragraph>
      <Paragraph color="muted">
        <a href={magicLinkUrl} style={urlLink}>
          {magicLinkUrl}
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
