import { Hr, Section } from '@react-email/components'
import * as React from 'react'
import { Heading } from '../components/Heading'
import { Layout } from '../components/Layout'
import { Paragraph } from '../components/Paragraph'

/**
 * Security Alert Email Template
 *
 * Sent when suspicious activity is detected on an account
 * Includes: Alert details, actions taken, and user recommendations
 */

export interface SecurityAlertEmailProps {
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
  appUrl: string
}

export function SecurityAlertEmail({
  email,
  firstName,
  alertType,
  details,
  appUrl,
}: SecurityAlertEmailProps) {
  const displayName = firstName || email.split('@')[0]
  const alertMessages = getAlertMessages(alertType)

  const formattedDate = details.timestamp.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  return (
    <Layout preview={`Security alert for your Verscienta Health account`}>
      <Section style={alertBanner}>
        <Paragraph style={{ margin: 0, color: '#ffffff', textAlign: 'center', fontSize: '18px' }}>
          🚨 {alertMessages.title}
        </Paragraph>
      </Section>

      <Heading>Security Alert</Heading>

      <Paragraph>Hi {displayName},</Paragraph>

      <Paragraph>{alertMessages.message}</Paragraph>

      <Section style={detailsBox}>
        <Heading level={3}>Activity Details</Heading>
        <Paragraph style={{ margin: '0 0 8px' }}>
          <strong>Time:</strong> {formattedDate}
        </Paragraph>
        {details.ipAddress && (
          <Paragraph style={{ margin: '0 0 8px' }}>
            <strong>IP Address:</strong> {details.ipAddress}
          </Paragraph>
        )}
        {details.location && (
          <Paragraph style={{ margin: '0 0 8px' }}>
            <strong>Location:</strong> {details.location}
          </Paragraph>
        )}
        {details.device && (
          <Paragraph style={{ margin: '0 0 8px' }}>
            <strong>Device:</strong> {details.device}
          </Paragraph>
        )}
        {details.action && (
          <Paragraph style={{ margin: 0 }}>
            <strong>Action:</strong> {details.action}
          </Paragraph>
        )}
      </Section>

      <Hr style={divider} />

      <Heading level={2}>Was This You?</Heading>

      <Section style={actionBox}>
        <Paragraph style={{ margin: '0 0 16px' }}>
          <strong>If this was you:</strong> No action is needed. Your account is secure.
        </Paragraph>
        <Paragraph style={{ margin: 0 }}>
          <strong>If this wasn't you:</strong> Take immediate action to secure your account:
        </Paragraph>
      </Section>

      <Section style={stepsList}>
        <Paragraph>
          1. <strong>Change your password immediately</strong>
          <br />
          <a href={`${appUrl}/settings/security`} style={link}>
            Reset password now →
          </a>
        </Paragraph>
        <Paragraph>
          2. <strong>Enable two-factor authentication (2FA)</strong>
          <br />
          <a href={`${appUrl}/settings/security`} style={link}>
            Enable 2FA →
          </a>
        </Paragraph>
        <Paragraph>
          3. <strong>Review recent account activity</strong>
          <br />
          <a href={`${appUrl}/settings/security/sessions`} style={link}>
            View active sessions →
          </a>
        </Paragraph>
        <Paragraph>
          4. <strong>Contact support if you need assistance</strong>
          <br />
          <a href={`${appUrl}/contact`} style={link}>
            Get help →
          </a>
        </Paragraph>
      </Section>

      <Hr style={divider} />

      <Heading level={2}>Additional Recommendations</Heading>

      <Paragraph>
        • Use a strong, unique password for your Verscienta Health account
        <br />
        • Never share your password or verification codes with anyone
        <br />
        • Be cautious of phishing emails asking for your credentials
        <br />• Keep your devices and browsers up to date
      </Paragraph>

      <Hr style={divider} />

      <Paragraph color="muted">
        This is an automated security alert. If you have any questions or concerns, please{' '}
        <a href={`${appUrl}/contact`} style={link}>
          contact our support team
        </a>
        .
      </Paragraph>
    </Layout>
  )
}

function getAlertMessages(alertType: SecurityAlertEmailProps['alertType']) {
  switch (alertType) {
    case 'suspicious_login':
      return {
        title: 'Suspicious Login Attempt Detected',
        message:
          'We detected a login attempt to your Verscienta Health account from an unrecognized device or location.',
      }
    case 'password_changed':
      return {
        title: 'Password Changed',
        message:
          'Your Verscienta Health account password was recently changed. If you made this change, no action is needed.',
      }
    case 'account_lockout':
      return {
        title: 'Account Locked Due to Failed Login Attempts',
        message:
          'Your Verscienta Health account has been temporarily locked due to multiple failed login attempts.',
      }
    case 'unusual_activity':
      return {
        title: 'Unusual Activity Detected',
        message:
          'We noticed unusual activity on your Verscienta Health account that may indicate unauthorized access.',
      }
  }
}

// Styles
const alertBanner = {
  backgroundColor: '#dc2626',
  padding: '16px',
  borderRadius: '6px 6px 0 0',
  margin: '-32px -32px 24px',
}

const detailsBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
}

const actionBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
}

const stepsList = {
  margin: '16px 0',
  paddingLeft: '8px',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const link = {
  color: '#2d5016',
  textDecoration: 'underline',
}
