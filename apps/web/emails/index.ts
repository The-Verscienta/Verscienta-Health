/**
 * Email Templates Index
 *
 * Exports all email templates for use throughout the application
 */

// Components
export { Button } from './components/Button'
export { Heading } from './components/Heading'
export { Layout } from './components/Layout'
export { Paragraph } from './components/Paragraph'

// Templates
export { EmailVerificationEmail } from './templates/EmailVerificationEmail'
export type { EmailVerificationEmailProps } from './templates/EmailVerificationEmail'

export { MagicLinkEmail } from './templates/MagicLinkEmail'
export type { MagicLinkEmailProps } from './templates/MagicLinkEmail'

export { MfaBackupCodesEmail } from './templates/MfaBackupCodesEmail'
export type { MfaBackupCodesEmailProps } from './templates/MfaBackupCodesEmail'

export { MfaSetupEmail } from './templates/MfaSetupEmail'
export type { MfaSetupEmailProps } from './templates/MfaSetupEmail'

export { PasswordResetEmail } from './templates/PasswordResetEmail'
export type { PasswordResetEmailProps } from './templates/PasswordResetEmail'

export { SecurityAlertEmail } from './templates/SecurityAlertEmail'
export type { SecurityAlertEmailProps } from './templates/SecurityAlertEmail'

export { WelcomeEmail } from './templates/WelcomeEmail'
export type { WelcomeEmailProps } from './templates/WelcomeEmail'
