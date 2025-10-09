import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Device Unregistration API
 *
 * Removes device token from push notification registry
 * Called when user logs out or disables notifications
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceToken } = body

    if (!deviceToken) {
      return NextResponse.json(
        {
          error: 'ValidationError',
          message: 'deviceToken is required',
        },
        { status: 400 }
      )
    }

    // Remove device token from database
    const deleted = await prisma.deviceToken.deleteMany({
      where: { token: deviceToken },
    })

    console.log(
      `Unregistered device: ${deviceToken.substring(0, 10)}... (${deleted.count} token(s) removed)`
    )

    return NextResponse.json({
      success: true,
      message: 'Device unregistered successfully',
      tokensRemoved: deleted.count,
    })
  } catch (error) {
    console.error('Device unregistration error:', error)
    return NextResponse.json(
      {
        error: 'UnregistrationError',
        message: 'Failed to unregister device',
      },
      { status: 500 }
    )
  }
}
