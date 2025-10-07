import { createAuthClient } from 'better-auth/client'
import { twoFactor } from 'better-auth/client/plugins'

// Enhanced Better Auth client with 2FA plugin
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  plugins: [
    twoFactor({
      // TOTP (Time-based One-Time Password) support
      totpOptions: {
        appName: 'Verscienta Health',
        period: 30, // 30 seconds
        digits: 6,  // 6-digit codes
      },
    }),
  ],
})

// Types for MFA
export interface MFASetupResponse {
  success: boolean
  secret?: string
  qrCode?: string
  backupCodes?: string[]
  error?: string
}

export interface MFAVerifyResponse {
  success: boolean
  error?: string
}

// Generate TOTP secret and QR code for MFA setup
export async function setupMFA(userId: string): Promise<MFASetupResponse> {
  try {
    const response = await fetch('/api/auth/mfa/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('MFA setup error:', error)
    return { success: false, error: 'Failed to setup MFA' }
  }
}

// Verify TOTP code
export async function verifyMFA(
  userId: string,
  code: string
): Promise<MFAVerifyResponse> {
  try {
    const response = await fetch('/api/auth/mfa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('MFA verification error:', error)
    return { success: false, error: 'Failed to verify MFA code' }
  }
}

// Disable MFA for a user
export async function disableMFA(userId: string): Promise<MFAVerifyResponse> {
  try {
    const response = await fetch('/api/auth/mfa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('MFA disable error:', error)
    return { success: false, error: 'Failed to disable MFA' }
  }
}

// Generate backup codes
export async function generateBackupCodes(
  userId: string
): Promise<{ success: boolean; codes?: string[]; error?: string }> {
  try {
    const response = await fetch('/api/auth/mfa/backup-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Backup codes generation error:', error)
    return { success: false, error: 'Failed to generate backup codes' }
  }
}

// Check if user has MFA enabled
export async function checkMFAStatus(
  userId: string
): Promise<{ enabled: boolean; method?: 'totp' | 'sms' }> {
  try {
    const response = await fetch(`/api/auth/mfa/status?userId=${userId}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('MFA status check error:', error)
    return { enabled: false }
  }
}
