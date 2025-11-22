import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

/**
 * Base Email Layout Component
 *
 * Provides consistent branding and structure for all Verscienta Health emails
 * Includes: Header with logo, main content area, footer with links
 */

interface LayoutProps {
  preview: string
  children: React.ReactNode
}

export function Layout({ preview, children }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Verscienta branding */}
          <Section style={header}>
            <Img
              src="https://verscienta.com/logo.png"
              width="150"
              height="50"
              alt="Verscienta Health"
              style={logo}
            />
          </Section>

          {/* Main content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Verscienta Health - Bridging Traditional Chinese Medicine with Western Herbalism
            </Text>
            <Text style={footerLinks}>
              <Link href="https://verscienta.com" style={link}>
                Home
              </Link>
              {' • '}
              <Link href="https://verscienta.com/herbs" style={link}>
                Herbs
              </Link>
              {' • '}
              <Link href="https://verscienta.com/practitioners" style={link}>
                Practitioners
              </Link>
              {' • '}
              <Link href="https://verscienta.com/contact" style={link}>
                Contact
              </Link>
            </Text>
            <Text style={footerSmall}>
              © {new Date().getFullYear()} Verscienta Health. All rights reserved.
            </Text>
            <Text style={footerSmall}>
              <Link href="https://verscienta.com/privacy" style={link}>
                Privacy Policy
              </Link>
              {' • '}
              <Link href="https://verscienta.com/terms" style={link}>
                Terms of Service
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f4f5f7',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  marginBottom: '32px',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#2d5016',
  padding: '24px 32px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const content = {
  padding: '32px 32px 48px',
}

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px 32px',
  borderTop: '1px solid #e5e7eb',
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}

const footerLinks = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
  textAlign: 'center' as const,
}

const footerSmall = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
  textAlign: 'center' as const,
}

const link = {
  color: '#2d5016',
  textDecoration: 'underline',
}
