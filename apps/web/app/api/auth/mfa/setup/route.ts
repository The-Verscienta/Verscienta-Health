import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Hash a backup code for secure storage
 * Uses SHA-256 for one-way hashing
 */
function hashBackupCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

/**
 * MFA Setup Endpoint
 *
 * Uses better-auth's twoFactor plugin to generate TOTP secret and QR code.
 * The plugin automatically stores the secret in the database.
 *
 * After setup, users must call the verify endpoint to confirm and enable 2FA.
 *
 * @see https://www.better-auth.com/docs/plugins/2fa
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Generate backup codes (10 codes, 8 characters each)
    // Better-auth's twoFactor plugin handles TOTP secret generation and storage
    const backupCodes = Array.from({ length: 10 }, () =>
      randomBytes(4).toString('hex').toUpperCase()
    )

    // Store hashed backup codes in database
    // Note: backupCodes field needs to be added to Prisma schema
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // Store hashed backup codes as JSON array
        // biome-ignore lint/suspicious/noExplicitAny: backupCodes field not yet in Prisma schema
        backupCodes: JSON.stringify(backupCodes.map(hashBackupCode)) as any,
      },
    })

    // Use better-auth's API to generate 2FA setup data
    // This creates the TOTP secret and QR code automatically
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/two-factor/generate`,
      {
        method: 'POST',
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to generate 2FA data')
    }

    const twoFactorData = await response.json()

    return NextResponse.json({
      success: true,
      qrCode: twoFactorData.qrCode,
      secret: twoFactorData.secret,
      backupCodes, // Return unhashed codes for user to save (only shown once)
    })
  } catch (error) {
    console.error('MFA setup error:', error)
    return NextResponse.json({ success: false, error: 'Failed to setup MFA' }, { status: 500 })
  }
}
