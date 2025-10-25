/**
 * useIdleTimeout Hook Tests
 *
 * Tests HIPAA-compliant idle timeout functionality
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useIdleTimeout } from '../use-idle-timeout'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock fetch
global.fetch = vi.fn()

describe('useIdleTimeout', () => {
  let mockPush: ReturnType<typeof vi.fn>
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    mockPush = vi.fn()
    mockFetch = vi.fn().mockResolvedValue({ ok: true })
    ;(useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush })
    ;(global.fetch as ReturnType<typeof vi.fn>) = mockFetch
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('initializes without errors', () => {
      const { result } = renderHook(() => useIdleTimeout())
      expect(result.current).toBeDefined()
      expect(result.current.resetTimer).toBeDefined()
      expect(result.current.clearTimers).toBeDefined()
    })

    it('returns resetTimer and clearTimers functions', () => {
      const { result } = renderHook(() => useIdleTimeout())
      expect(typeof result.current.resetTimer).toBe('function')
      expect(typeof result.current.clearTimers).toBe('function')
    })

    it('uses default timeout of 15 minutes', () => {
      const onTimeout = vi.fn()
      renderHook(() =>
        useIdleTimeout({
          onTimeout,
        })
      )

      // Fast-forward 15 minutes
      act(() => {
        vi.advanceTimersByTime(15 * 60 * 1000)
      })

      expect(onTimeout).toHaveBeenCalledTimes(1)
    })

    it('uses custom timeout duration', () => {
      const onTimeout = vi.fn()
      renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 5,
          onTimeout,
        })
      )

      // Fast-forward 5 minutes
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000)
      })

      expect(onTimeout).toHaveBeenCalledTimes(1)
    })
  })

  describe('Warning Functionality', () => {
    it('triggers warning before timeout', () => {
      const onWarning = vi.fn()
      const onTimeout = vi.fn()

      renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 15,
          warningMinutes: 2,
          onWarning,
          onTimeout,
        })
      )

      // Fast-forward to warning time (13 minutes)
      act(() => {
        vi.advanceTimersByTime(13 * 60 * 1000)
      })

      expect(onWarning).toHaveBeenCalledTimes(1)
      expect(onTimeout).not.toHaveBeenCalled()
    })

    it('triggers timeout after warning', () => {
      const onWarning = vi.fn()
      const onTimeout = vi.fn()

      renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 15,
          warningMinutes: 2,
          onWarning,
          onTimeout,
        })
      )

      // Fast-forward to warning
      act(() => {
        vi.advanceTimersByTime(13 * 60 * 1000)
      })

      expect(onWarning).toHaveBeenCalledTimes(1)

      // Fast-forward remaining 2 minutes to timeout
      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000)
      })

      expect(onTimeout).toHaveBeenCalledTimes(1)
    })

    it('logs warning event to API', () => {
      renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 15,
          warningMinutes: 2,
        })
      )

      act(() => {
        vi.advanceTimersByTime(13 * 60 * 1000)
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/session-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'IDLE_WARNING',
          metadata: { minutesRemaining: 2 },
        }),
      })
    })
  })

  describe('Timeout Behavior', () => {
    it('calls onTimeout callback when timeout occurs', () => {
      const onTimeout = vi.fn()
      renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 5,
          onTimeout,
        })
      )

      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000)
      })

      expect(onTimeout).toHaveBeenCalledTimes(1)
    })

    it('redirects to login when no onTimeout callback provided', () => {
      renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 5,
        })
      )

      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000)
      })

      expect(mockPush).toHaveBeenCalledWith('/login?timeout=true&reason=inactivity')
    })

    it('logs timeout event to API', () => {
      renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 5,
        })
      )

      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000)
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/session-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'SESSION_TIMEOUT',
          metadata: { reason: 'inactivity' },
        }),
      })
    })
  })

  describe('Timer Reset', () => {
    it('resets timer manually with resetTimer function', () => {
      const onTimeout = vi.fn()
      const { result } = renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 5,
          onTimeout,
        })
      )

      // Fast-forward 4 minutes
      act(() => {
        vi.advanceTimersByTime(4 * 60 * 1000)
      })

      // Reset timer
      act(() => {
        result.current.resetTimer()
      })

      // Fast-forward another 4 minutes (would timeout without reset)
      act(() => {
        vi.advanceTimersByTime(4 * 60 * 1000)
      })

      // Should not timeout yet
      expect(onTimeout).not.toHaveBeenCalled()

      // Fast-forward 1 more minute to reach timeout
      act(() => {
        vi.advanceTimersByTime(1 * 60 * 1000)
      })

      expect(onTimeout).toHaveBeenCalledTimes(1)
    })

    it('clears timers with clearTimers function', () => {
      const onTimeout = vi.fn()
      const { result } = renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 5,
          onTimeout,
        })
      )

      // Clear timers
      act(() => {
        result.current.clearTimers()
      })

      // Fast-forward past timeout
      act(() => {
        vi.advanceTimersByTime(10 * 60 * 1000)
      })

      // Should not timeout
      expect(onTimeout).not.toHaveBeenCalled()
    })
  })

  describe('Enabled/Disabled State', () => {
    it('does not start timer when disabled', () => {
      const onTimeout = vi.fn()
      renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 5,
          onTimeout,
          enabled: false,
        })
      )

      act(() => {
        vi.advanceTimersByTime(10 * 60 * 1000)
      })

      expect(onTimeout).not.toHaveBeenCalled()
    })

    it('stops timer when becoming disabled', () => {
      const onTimeout = vi.fn()
      const { rerender } = renderHook(
        ({ enabled }) =>
          useIdleTimeout({
            timeoutMinutes: 5,
            onTimeout,
            enabled,
          }),
        { initialProps: { enabled: true } }
      )

      // Fast-forward 3 minutes
      act(() => {
        vi.advanceTimersByTime(3 * 60 * 1000)
      })

      // Disable
      rerender({ enabled: false })

      // Fast-forward past timeout
      act(() => {
        vi.advanceTimersByTime(10 * 60 * 1000)
      })

      expect(onTimeout).not.toHaveBeenCalled()
    })

    it('starts timer when becoming enabled', () => {
      const onTimeout = vi.fn()
      const { rerender } = renderHook(
        ({ enabled }) =>
          useIdleTimeout({
            timeoutMinutes: 5,
            onTimeout,
            enabled,
          }),
        { initialProps: { enabled: false } }
      )

      // Enable
      rerender({ enabled: true })

      // Fast-forward to timeout
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000)
      })

      expect(onTimeout).toHaveBeenCalledTimes(1)
    })
  })

  describe('Activity Detection', () => {
    it('resets timer on user activity (simulated)', () => {
      const onTimeout = vi.fn()
      const { result } = renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 5,
          onTimeout,
        })
      )

      // Fast-forward 4 minutes
      act(() => {
        vi.advanceTimersByTime(4 * 60 * 1000)
      })

      // Simulate user activity by manually resetting
      act(() => {
        result.current.resetTimer()
      })

      // Fast-forward 4 more minutes
      act(() => {
        vi.advanceTimersByTime(4 * 60 * 1000)
      })

      // Should not timeout yet
      expect(onTimeout).not.toHaveBeenCalled()
    })
  })

  describe('Cleanup', () => {
    it('cleans up timers on unmount', () => {
      const onTimeout = vi.fn()
      const { unmount } = renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 5,
          onTimeout,
        })
      )

      unmount()

      // Fast-forward past timeout
      act(() => {
        vi.advanceTimersByTime(10 * 60 * 1000)
      })

      // Should not timeout after unmount
      expect(onTimeout).not.toHaveBeenCalled()
    })
  })

  describe('HIPAA Compliance', () => {
    it('logs security events for audit trail', () => {
      renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 15,
          warningMinutes: 2,
        })
      )

      // Trigger warning
      act(() => {
        vi.advanceTimersByTime(13 * 60 * 1000)
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/session-log',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('IDLE_WARNING'),
        })
      )

      // Trigger timeout
      act(() => {
        vi.advanceTimersByTime(2 * 60 * 1000)
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/session-log',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('SESSION_TIMEOUT'),
        })
      )
    })

    it('handles API logging failures gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('API Error'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const onTimeout = vi.fn()

      renderHook(() =>
        useIdleTimeout({
          timeoutMinutes: 5,
          onTimeout,
        })
      )

      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000)
      })

      // Should still call onTimeout even if logging fails
      expect(onTimeout).toHaveBeenCalled()

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to log session timeout:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })
})
