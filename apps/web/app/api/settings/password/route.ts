import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, AuditAction, AuditSeverity } from '@/lib/audit-log'
import { sendEmail } from '@/lib/email'
import { checkPasswordHistory, addPasswordToHistory } from '@/lib/password-history'

export const dynamic = 'force-dynamic'

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

    // HIPAA Compliance: Check password history to prevent reuse
    const isPasswordReused = await checkPasswordHistory(session.user.id, newPassword)

    if (isPasswordReused) {
      return NextResponse.json(
        {
          error:
            'Password was recently used. Please choose a different password that you have not used in the last 5 password changes.',
        },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password in database
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    })

    // HIPAA Compliance: Add password to history
    await addPasswordToHistory(session.user.id, hashedPassword)

    // SECURITY: Invalidate all sessions except the current one
    // This forces re-authentication on all other devices
    const currentSessionId = session.session.id
    const invalidatedSessions = await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        id: {
          not: currentSessionId, // Keep current session active
        },
      },
    })

    console.log('[SECURITY] Password changed, sessions invalidated:', {
      userId: session.user.id,
      currentSessionId,
      invalidatedCount: invalidatedSessions.count,
      timestamp: new Date().toISOString(),
    })

    // HIPAA: Audit log password change
    await createAuditLog({
      action: AuditAction.PASSWORD_CHANGE,
      userId: session.user.id,
      userEmail: session.user.email,
      sessionId: currentSessionId,
      success: true,
      severity: AuditSeverity.INFO,
      details: {
        invalidatedSessions: invalidatedSessions.count,
      },
    })

    // SECURITY: Send notification email
    try {
      await sendEmail({
        to: session.user.email,
        subject: 'Password Changed - Verscienta Health',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c5f2d;">Password Successfully Changed</h2>

            <p>Hello,</p>

            <p>Your password was successfully changed on <strong>${new Date().toLocaleString()}</strong>.</p>

            <div style="background-color: #f0f7f0; border-left: 4px solid #2c5f2d; padding: 15px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Security Notice:</strong></p>
              <p style="margin: 10px 0 0 0;">
                For your security, you have been logged out of all other devices.
                You will need to sign in again on those devices.
              </p>
            </div>

            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Didn't change your password?</strong></p>
              <p style="margin: 10px 0 0 0;">
                If you did not make this change, your account may be compromised.
                Please contact our security team immediately at <a href="mailto:security@verscienta.com">security@verscienta.com</a>.
              </p>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is an automated security notification from Verscienta Health.
              This action was performed from IP address: ${request.headers.get('x-forwarded-for') || 'unknown'}.
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      // Don't fail the password change if email fails
      console.error('[EMAIL] Failed to send password change notification:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You have been logged out of all other devices.',
      invalidatedSessions: invalidatedSessions.count,
    })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { error: 'Failed to change password. Please try again later.' },
      { status: 500 }
    )
  }
}
