import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    // Generate TOTP secret
    const secret = authenticator.generateSecret()

    // Generate OTP Auth URL
    const otpauthUrl = authenticator.keyuri(userId, 'Verscienta Health', secret)

    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpauthUrl)

    // Generate backup codes (10 codes, 8 characters each)
    const backupCodes = Array.from({ length: 10 }, () =>
      randomBytes(4).toString('hex').toUpperCase()
    )

    // TODO: Store secret and backup codes in database
    // await db.users.update(userId, {
    //   mfaSecret: secret,
    //   mfaBackupCodes: backupCodes.map(code => hashBackupCode(code)),
    //   mfaEnabled: false, // Will be enabled after verification
    // })

    return NextResponse.json({
      success: true,
      secret,
      qrCode,
      backupCodes,
    })
  } catch (error) {
    console.error('MFA setup error:', error)
    return NextResponse.json({ success: false, error: 'Failed to setup MFA' }, { status: 500 })
  }
}
