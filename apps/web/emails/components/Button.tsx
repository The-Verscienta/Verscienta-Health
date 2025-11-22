import { Button as EmailButton } from '@react-email/components'
import * as React from 'react'

/**
 * Call-to-Action Button Component
 *
 * Consistent button styling for email templates
 */

interface ButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export function Button({ href, children, variant = 'primary' }: ButtonProps) {
  const style = variant === 'primary' ? primaryButton : secondaryButton

  return (
    <EmailButton href={href} style={style}>
      {children}
    </EmailButton>
  )
}

// Styles
const primaryButton = {
  backgroundColor: '#2d5016',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '16px 0',
}

const secondaryButton = {
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  color: '#2d5016',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '16px 0',
  border: '1px solid #d1d5db',
}
