import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sessionLogger } from '@/lib/session-logger'

export const dynamic = 'force-dynamic'

/**
 * Client-Side Session Logging Endpoint
 *
 * Allows client-side code (like idle timeout hooks) to log session events
 * for HIPAA compliance and security monitoring.
 *
 * Events logged:
 * - Idle timeout warnings
 * - Session extensions (user clicked "continue")
 * - Client-side session timeouts
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event, metadata } = body

    if (!event) {
      return NextResponse.json({ success: false, error: 'Event type required' }, { status: 400 })
    }

    const sessionId = session.session.id || session.session.token || 'unknown'

    // Handle different event types
    switch (event) {
      case 'IDLE_WARNING':
        await sessionLogger.idleWarning({
          sessionId,
          userId: session.user.id,
          minutesRemaining: metadata?.minutesRemaining || 2,
        })
        break

      case 'SESSION_EXTENDED':
        await sessionLogger.sessionExtended({
          sessionId,
          userId: session.user.id,
        })
        break

      case 'SESSION_TIMEOUT':
        await sessionLogger.sessionTimeout({
          sessionId,
          userId: session.user.id,
          reason: metadata?.reason || 'inactivity',
        })
        break

      default:
        return NextResponse.json({ success: false, error: 'Invalid event type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session logging error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to log session event' },
      { status: 500 }
    )
  }
}
