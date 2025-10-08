import { NextResponse } from 'next/server'
import { sendSecurityAlert } from '@/lib/email'

/**
 * Internal Security Alert Endpoint
 *
 * Used by middleware and other internal systems to send security alerts.
 * This endpoint is not exposed to external clients.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, message, details } = body

    // Validate required fields
    if (!type || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate type
    const validTypes = ['suspicious_activity', 'failed_login', 'account_lockout']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid alert type' }, { status: 400 })
    }

    // Send security alert email
    await sendSecurityAlert({
      type,
      message,
      details: details || {},
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Security alert error:', error)
    return NextResponse.json({ error: 'Failed to send alert' }, { status: 500 })
  }
}
