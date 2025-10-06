'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock } from 'lucide-react'

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
    <Dialog open={open} onOpenChange={(open) => !open && onContinue()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="h-8 w-8 text-yellow-700" />
            <div className="text-3xl font-bold font-mono text-yellow-700">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-900">
            <p className="font-semibold mb-1">Security Notice</p>
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
          <Button onClick={onContinue} className="flex-1">
            Continue Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
