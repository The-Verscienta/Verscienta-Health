import { Hr, Link, Section } from '@react-email/components'
import * as React from 'react'
import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { Layout } from '../components/Layout'
import { Paragraph } from '../components/Paragraph'

/**
 * Welcome Email Template
 *
 * Sent to new users after successful registration
 * Includes: Welcome message, getting started guide, links to key features
 */

export interface WelcomeEmailProps {
  firstName?: string
  email: string
  appUrl: string
}

export function WelcomeEmail({ firstName, email, appUrl }: WelcomeEmailProps) {
  const displayName = firstName || email.split('@')[0]

  return (
    <Layout preview={`Welcome to Verscienta Health, ${displayName}!`}>
      <Heading>Welcome to Verscienta Health!</Heading>

      <Paragraph>Hi {displayName},</Paragraph>

      <Paragraph>
        Thank you for joining Verscienta Health, the world's most comprehensive platform for
        Traditional Chinese Medicine (TCM) and Western herbalism.
      </Paragraph>

      <Paragraph>
        We're excited to have you as part of our community dedicated to holistic health and natural
        healing.
      </Paragraph>

      <Section style={ctaSection}>
        <Button href={`${appUrl}/herbs`}>Explore 15,000+ Herbs</Button>
      </Section>

      <Hr style={divider} />

      <Heading level={2}>Getting Started</Heading>

      <Paragraph>Here are some things you can do:</Paragraph>

      <Section style={listSection}>
        <Paragraph>
          <strong style={strong}>🌿 Browse Herbs:</strong> Explore our extensive database of over
          15,000 herbs with detailed TCM and Western herbalism properties.
        </Paragraph>
        <Paragraph>
          <strong style={strong}>💊 Discover Formulas:</strong> Learn about traditional herbal
          formulas and their modern applications.
        </Paragraph>
        <Paragraph>
          <strong style={strong}>🩺 Find Practitioners:</strong> Connect with verified herbalists
          and TCM practitioners in your area.
        </Paragraph>
        <Paragraph>
          <strong style={strong}>🔍 Use Symptom Checker:</strong> Get personalized herb
          recommendations based on your symptoms (educational purposes only).
        </Paragraph>
      </Section>

      <Hr style={divider} />

      <Heading level={2}>Quick Links</Heading>

      <Paragraph>
        <Link href={`${appUrl}/herbs`} style={link}>
          Browse Herbs
        </Link>
        {' • '}
        <Link href={`${appUrl}/formulas`} style={link}>
          Herbal Formulas
        </Link>
        {' • '}
        <Link href={`${appUrl}/practitioners`} style={link}>
          Find Practitioners
        </Link>
        {' • '}
        <Link href={`${appUrl}/symptom-checker`} style={link}>
          Symptom Checker
        </Link>
      </Paragraph>

      <Hr style={divider} />

      <Paragraph color="muted">
        If you have any questions or need assistance, feel free to{' '}
        <Link href={`${appUrl}/contact`} style={link}>
          contact our support team
        </Link>
        .
      </Paragraph>

      <Paragraph color="muted">
        Welcome aboard!
        <br />
        The Verscienta Health Team
      </Paragraph>
    </Layout>
  )
}

// Styles
const ctaSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const listSection = {
  margin: '16px 0',
}

const strong = {
  color: '#2d5016',
}

const link = {
  color: '#2d5016',
  textDecoration: 'underline',
}
