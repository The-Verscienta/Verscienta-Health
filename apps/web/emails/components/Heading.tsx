import { Heading as EmailHeading } from '@react-email/components'
import * as React from 'react'

/**
 * Heading Component
 *
 * Consistent heading styles for email templates
 */

interface HeadingProps {
  children: React.ReactNode
  level?: 1 | 2 | 3
}

export function Heading({ children, level = 1 }: HeadingProps) {
  const as = `h${level}` as 'h1' | 'h2' | 'h3'
  const style = level === 1 ? h1 : level === 2 ? h2 : h3

  return (
    <EmailHeading as={as} style={style}>
      {children}
    </EmailHeading>
  )
}

// Styles
const h1 = {
  color: '#2d5016',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 24px',
}

const h2 = {
  color: '#1f2937',
  fontSize: '22px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
}

const h3 = {
  color: '#374151',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 12px',
}
