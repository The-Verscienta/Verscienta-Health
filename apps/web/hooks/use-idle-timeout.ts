import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/**
 * HIPAA Compliance: Idle Timeout Hook
 *
 * Implements automatic logout after period of inactivity.
 * Required by HIPAA §164.312(a)(2)(iii) for PHI access.
 *
 * Usage:
 * ```tsx
 * // In symptom checker or other PHI-sensitive components
 * useIdleTimeout({
 *   timeoutMinutes: 15,
 *   warningMinutes: 2,
 *   onTimeout: () => {
 *     // Clear any sensitive data
 *     router.push('/login?timeout=true')
 *   }
 * })
 * ```
 */

interface UseIdleTimeoutOptions {
  /** Timeout in minutes (default: 15 for HIPAA compliance) */
  timeoutMinutes?: number
  /** Warning time in minutes before timeout (default: 2) */
  warningMinutes?: number
  /** Callback when timeout occurs */
  onTimeout?: () => void
  /** Callback when warning is triggered */
  onWarning?: () => void
  /** Whether the timeout is enabled (default: true) */
  enabled?: boolean
}

const DEFAULT_TIMEOUT_MINUTES = 15
const DEFAULT_WARNING_MINUTES = 2

export function useIdleTimeout({
  timeoutMinutes = DEFAULT_TIMEOUT_MINUTES,
  warningMinutes = DEFAULT_WARNING_MINUTES,
  onTimeout,
  onWarning,
  enabled = true,
}: UseIdleTimeoutOptions = {}) {
  const router = useRouter()
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)
  const warningIdRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const clearTimers = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current)
      timeoutIdRef.current = null
    }
    if (warningIdRef.current) {
      clearTimeout(warningIdRef.current)
      warningIdRef.current = null
    }
  }, [])

  const handleTimeout = useCallback(() => {
    console.warn('[HIPAA Security] Session timed out due to inactivity')

    if (onTimeout) {
      onTimeout()
    } else {
      // Default: redirect to login with timeout message
      router.push('/login?timeout=true&reason=inactivity')
    }
  }, [onTimeout, router])

  const handleWarning = useCallback(() => {
    console.warn('[HIPAA Security] Session will timeout soon due to inactivity')

    if (onWarning) {
      onWarning()
    } else {
      // Default: show browser notification (if permitted)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Session Timeout Warning', {
          body: `Your session will expire in ${warningMinutes} minutes due to inactivity.`,
          icon: '/favicon.ico',
        })
      }
    }
  }, [onWarning, warningMinutes])

  const resetTimer = useCallback(() => {
    if (!enabled) return

    lastActivityRef.current = Date.now()
    clearTimers()

    // Set warning timer
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000
    warningIdRef.current = setTimeout(handleWarning, warningMs)

    // Set timeout timer
    const timeoutMs = timeoutMinutes * 60 * 1000
    timeoutIdRef.current = setTimeout(handleTimeout, timeoutMs)
  }, [enabled, timeoutMinutes, warningMinutes, handleWarning, handleTimeout, clearTimers])

  useEffect(() => {
    if (!enabled) {
      clearTimers()
      return
    }

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Throttle activity detection (don't reset on every mousemove)
    let throttleTimeout: NodeJS.Timeout | null = null
    const handleActivity = () => {
      if (throttleTimeout) return

      throttleTimeout = setTimeout(() => {
        resetTimer()
        throttleTimeout = null
      }, 1000) // Throttle to once per second
    }

    // Initialize timer
    resetTimer()

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    // Cleanup
    return () => {
      clearTimers()
      if (throttleTimeout) clearTimeout(throttleTimeout)
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [enabled, resetTimer, clearTimers])

  // Return methods to manually control timeout
  return {
    resetTimer,
    clearTimers,
  }
}

/**
 * Session Timeout Warning Component
 *
 * Displays a modal warning when session is about to timeout.
 * Can be used with useIdleTimeout hook.
 *
 * Example:
 * ```tsx
 * const [showWarning, setShowWarning] = useState(false)
 *
 * useIdleTimeout({
 *   onWarning: () => setShowWarning(true),
 *   onTimeout: () => logout()
 * })
 *
 * {showWarning && <SessionTimeoutWarning onContinue={() => setShowWarning(false)} />}
 * ```
 */
export interface SessionTimeoutWarningProps {
  /** Minutes until timeout */
  minutesRemaining?: number
  /** Callback when user clicks continue */
  onContinue: () => void
  /** Callback when user clicks logout */
  onLogout?: () => void
}
