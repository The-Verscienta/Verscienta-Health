import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { accountLockout, getLockedAccounts } from '@/lib/account-lockout'

export const dynamic = 'force-dynamic'

/**
 * Admin Account Lockout Management
 *
 * Endpoints for viewing and managing locked accounts.
 * Requires admin role.
 */

/**
 * GET /api/admin/account-lockout
 * Get all locked accounts
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const lockedAccounts = await getLockedAccounts()

    return NextResponse.json({
      success: true,
      lockedAccounts,
      count: lockedAccounts.length,
    })
  } catch (error) {
    console.error('Failed to get locked accounts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve locked accounts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/account-lockout
 * Unlock an account (admin action)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, action } = body

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 })
    }

    if (action === 'unlock') {
      await accountLockout.unlock(email, session.user.id)

      return NextResponse.json({
        success: true,
        message: `Account ${email} has been unlocked`,
      })
    }

    // Get status
    const status = await accountLockout.getStatus(email)

    return NextResponse.json({
      success: true,
      status,
    })
  } catch (error) {
    console.error('Failed to manage account lockout:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
