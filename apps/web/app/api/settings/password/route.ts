import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Validate authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Validate new password length (HIPAA compliance: minimum 12 characters)
    if (newPassword.length < 12) {
      return NextResponse.json(
        { error: 'New password must be at least 12 characters long' },
        { status: 400 }
      )
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: 'New password must be less than 128 characters' },
        { status: 400 }
      )
    }

    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return NextResponse.json(
        {
          error:
            'Password must contain at least one uppercase letter, lowercase letter, number, and special character',
        },
        { status: 400 }
      )
    }

    // Validate that new password is different from current
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      )
    }

    // Get user account from database
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: 'credential', // Email/password auth
      },
    })

    if (!account || !account.password) {
      return NextResponse.json(
        { error: 'Password authentication not enabled for this account' },
        { status: 400 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, account.password)

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in database
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    })

    console.log('Password changed successfully:', {
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { error: 'Failed to change password. Please try again later.' },
      { status: 500 }
    )
  }
}
