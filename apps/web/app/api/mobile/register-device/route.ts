import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Device Registration API for Push Notifications
 *
 * Registers mobile devices for push notifications
 * Supports:
 * - iOS (APNs)
 * - Android (FCM)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceToken, platform, deviceId, appVersion } = body

    if (!deviceToken || !platform) {
      return NextResponse.json(
        {
          error: 'ValidationError',
          message: 'deviceToken and platform are required',
        },
        { status: 400 }
      )
    }

    if (platform !== 'ios' && platform !== 'android') {
      return NextResponse.json(
        {
          error: 'ValidationError',
          message: 'platform must be "ios" or "android"',
        },
        { status: 400 }
      )
    }

    // Get current session (optional - users can register devices before logging in)
    const session = await auth.api.getSession({ headers: request.headers })

    // Store or update device token in database
    await prisma.deviceToken.upsert({
      where: { token: deviceToken },
      update: {
        platform,
        deviceId,
        appVersion,
        userId: session?.user?.id,
        updatedAt: new Date(),
      },
      create: {
        token: deviceToken,
        platform,
        deviceId,
        appVersion,
        userId: session?.user?.id,
      },
    })

    console.log(
      `Registered ${platform} device: ${deviceToken.substring(0, 10)}... ${session?.user?.id ? `for user ${session.user.id}` : '(anonymous)'}`
    )

    return NextResponse.json({
      success: true,
      message: 'Device registered successfully',
    })
  } catch (error) {
    console.error('Device registration error:', error)
    return NextResponse.json(
      {
        error: 'RegistrationError',
        message: 'Failed to register device',
      },
      { status: 500 }
    )
  }
}
