'use client'

import { AlertTriangle, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SessionTimeoutWarningProps {
  /** Whether the warning is shown */
  open: boolean
  /** Minutes remaining until timeout */
  minutesRemaining?: number
  /** Callback when user clicks continue */
  onContinue: () => void
  /** Callback when user clicks logout */
  onLogout?: () => void
}

/**
 * HIPAA Compliance: Session Timeout Warning Dialog
 *
 * Displays a warning when the user's session is about to expire due to inactivity.
 * Required by HIPAA §164.312(a)(2)(iii) for automatic logoff after idle time.
 */
export function SessionTimeoutWarning({
  open,
  minutesRemaining = 2,
  onContinue,
  onLogout,
}: SessionTimeoutWarningProps) {
  const [countdown, setCountdown] = useState(minutesRemaining * 60)

  const handleContinue = () => {
    // Log session extension for HIPAA compliance
    fetch('/api/auth/session-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'SESSION_EXTENDED',
      }),
    }).catch((error) => console.error('Failed to log session extension:', error))

    onContinue()
  }

  useEffect(() => {
    if (!open) {
      setCountdown(minutesRemaining * 60)
      return
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [open, minutesRemaining])

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleContinue()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-full bg-yellow-100 p-2">
              <AlertTriangle className="h-6 w-6 text-yellow-700" />
            </div>
            <DialogTitle className="text-lg">Session Timeout Warning</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Your session will expire due to inactivity.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Clock className="h-8 w-8 text-yellow-700" />
            <div className="font-mono text-3xl font-bold text-yellow-700">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
            <p className="mb-1 font-semibold">Security Notice</p>
            <p>
              For your protection, sensitive health information pages automatically log you out
              after 15 minutes of inactivity. Click "Continue Session" to stay logged in.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          {onLogout && (
            <Button variant="outline" onClick={onLogout} className="flex-1">
              Log Out
            </Button>
          )}
          <Button onClick={handleContinue} className="flex-1">
            Continue Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
