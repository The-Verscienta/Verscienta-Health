import { Text } from '@react-email/components'
import * as React from 'react'

/**
 * Paragraph Component
 *
 * Consistent paragraph styles for email templates
 */

interface ParagraphProps {
  children: React.ReactNode
  color?: 'default' | 'muted' | 'success' | 'warning' | 'error'
}

export function Paragraph({ children, color = 'default' }: ParagraphProps) {
  const style = {
    ...paragraph,
    ...colorStyles[color],
  }

  return <Text style={style}>{children}</Text>
}

// Styles
const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const colorStyles = {
  default: {
    color: '#374151',
  },
  muted: {
    color: '#6b7280',
  },
  success: {
    color: '#059669',
  },
  warning: {
    color: '#d97706',
  },
  error: {
    color: '#dc2626',
  },
}
