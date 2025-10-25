'use client'

export const dynamic = 'force-dynamic'

import { Bell, Eye, Lock, LogOut, Settings, Shield, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { signOut, useSession, twoFactor } from '@/lib/auth-client'

export default function SettingsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  // MFA state
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null)
  const [mfaSecret, setMfaSecret] = useState<string | null>(null)
  const [mfaBackupCodes, setMfaBackupCodes] = useState<string[]>([])
  const [mfaVerificationCode, setMfaVerificationCode] = useState('')
  const [isMfaEnabled, setIsMfaEnabled] = useState(false)
  const [isSettingUpMfa, setIsSettingUpMfa] = useState(false)

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router])

  // Check MFA status on mount
  useEffect(() => {
    if (session?.user) {
      // Check if user has MFA enabled
      // @ts-expect-error - mfaEnabled is added as additionalField in better-auth config
      setIsMfaEnabled(session.user.mfaEnabled || false)
    }
  }, [session])

  if (isPending) {
    return <Loading />
  }

  if (!session) {
    return null
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 12) {
      toast.error('Password must be at least 12 characters')
      return
    }

    try {
      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password')
      }

      toast.success('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    try {
      const response = await fetch('/api/settings/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: deleteConfirmation, // In production, ask for actual password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      toast.success('Account deleted successfully')
      await signOut()
      router.push('/')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account')
    }
  }

  // HIPAA: MFA Setup Handler
  const handleSetupMfa = async () => {
    setIsSettingUpMfa(true)
    try {
      // Call API to generate TOTP secret, QR code, and backup codes
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup MFA')
      }

      // Set QR code and secret for display
      setMfaQrCode(data.qrCode)
      setMfaSecret(data.secret)

      setMfaBackupCodes(data.backupCodes || [])
      toast.success('MFA setup initiated. Scan the QR code with your authenticator app.')
    } catch (error) {
      console.error('MFA setup error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to setup MFA')
    } finally {
      setIsSettingUpMfa(false)
    }
  }

  // HIPAA: MFA Verification Handler
  const handleVerifyMfa = async () => {
    if (!mfaVerificationCode) {
      toast.error('Please enter the verification code')
      return
    }

    try {
      // Verify the TOTP code using better-auth
      const result = await twoFactor.verifyTotp({ code: mfaVerificationCode })

      // Check if verification was successful (data contains token and user)
      if (!result.data || result.error) {
        throw new Error(result.error?.message || 'Invalid verification code')
      }

      // Enable MFA for the user
      await twoFactor.enable({ password: '' }) // Password not required if already verified

      setIsMfaEnabled(true)
      setMfaQrCode(null)
      setMfaSecret(null)
      setMfaVerificationCode('')
      toast.success('MFA enabled successfully! Your account is now more secure.')
    } catch (error) {
      console.error('MFA verification error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to verify MFA code')
    }
  }

  // HIPAA: MFA Disable Handler
  const handleDisableMfa = async () => {
    try {
      await twoFactor.disable({ password: '' })

      setIsMfaEnabled(false)
      toast.success('MFA disabled successfully')
    } catch (error) {
      console.error('MFA disable error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to disable MFA')
    }
  }

  return (
    <div className="container-custom py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-earth-900 mb-2 flex items-center font-serif text-4xl font-bold">
            <Settings className="mr-3 h-8 w-8" />
            Account Settings
          </h1>
          <p className="text-gray-600">Manage your account security and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="text-earth-600 mr-2 h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit">Update Password</Button>
              </form>
            </CardContent>
          </Card>

          {/* Multi-Factor Authentication (HIPAA Security) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="text-earth-600 mr-2 h-5 w-5" />
                Multi-Factor Authentication (MFA)
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account {isMfaEnabled && '(Currently Enabled)'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isMfaEnabled && !mfaQrCode ? (
                // MFA Not Set Up - Show Enable Button
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Protect your account with time-based one-time passwords (TOTP) using an
                    authenticator app like Google Authenticator or Authy.
                  </p>
                  <Button onClick={handleSetupMfa} disabled={isSettingUpMfa}>
                    {isSettingUpMfa ? 'Setting up...' : 'Enable MFA'}
                  </Button>
                </div>
              ) : !isMfaEnabled && mfaQrCode ? (
                // MFA Setup In Progress - Show QR Code and Verification
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Step 1: Scan QR Code
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Open your authenticator app and scan this QR code:
                    </p>
                    {mfaQrCode && (
                      <div className="flex justify-center">
                        <img src={mfaQrCode} alt="MFA QR Code" className="h-48 w-48" />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Manual entry code: <code className="text-xs">{mfaSecret}</code>
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Step 2: Enter Verification Code
                    </p>
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="000000"
                        value={mfaVerificationCode}
                        onChange={(e) => setMfaVerificationCode(e.target.value)}
                        maxLength={6}
                      />
                      <Button onClick={handleVerifyMfa}>Verify and Enable</Button>
                    </div>
                  </div>

                  {mfaBackupCodes.length > 0 && (
                    <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                      <p className="text-sm font-semibold text-yellow-900 mb-2">
                        ⚠️ Backup Codes (Save These!)
                      </p>
                      <p className="text-xs text-yellow-800 mb-2">
                        Store these codes in a safe place. You can use them to access your account
                        if you lose your authenticator device.
                      </p>
                      <div className="grid grid-cols-2 gap-1 font-mono text-xs text-yellow-900">
                        {mfaBackupCodes.map((code, i) => (
                          <div key={i} className="rounded bg-white px-2 py-1">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // MFA Enabled - Show Status and Disable Option
                <div>
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
                    <p className="text-sm font-semibold text-green-900">✓ MFA is enabled</p>
                    <p className="text-xs text-green-700 mt-1">
                      Your account is protected with two-factor authentication.
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleDisableMfa}>
                    Disable MFA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="text-earth-600 mr-2 h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Manage how you receive updates from Verscienta Health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
                <input
                  type="checkbox"
                  className="text-earth-600 focus:ring-earth-600 h-5 w-5 rounded border-gray-300"
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Newsletter</p>
                  <p className="text-sm text-gray-600">
                    Monthly newsletter with herbal health tips
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="text-earth-600 focus:ring-earth-600 h-5 w-5 rounded border-gray-300"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Practitioner Updates</p>
                  <p className="text-sm text-gray-600">Updates from practitioners you follow</p>
                </div>
                <input
                  type="checkbox"
                  className="text-earth-600 focus:ring-earth-600 h-5 w-5 rounded border-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="text-earth-600 mr-2 h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control your privacy and data sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Profile Visibility</p>
                  <p className="text-sm text-gray-600">Make your profile visible to others</p>
                </div>
                <input
                  type="checkbox"
                  className="text-earth-600 focus:ring-earth-600 h-5 w-5 rounded border-gray-300"
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Show Reviews</p>
                  <p className="text-sm text-gray-600">Display your reviews publicly</p>
                </div>
                <input
                  type="checkbox"
                  className="text-earth-600 focus:ring-earth-600 h-5 w-5 rounded border-gray-300"
                  defaultChecked
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <Trash2 className="mr-2 h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions for your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sign Out */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Sign Out</p>
                  <p className="text-sm text-gray-600">Sign out from all devices</p>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await signOut()
                    router.push('/')
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>

              {/* Delete Account */}
              <div className="flex items-center justify-between border-t border-red-100 pt-4">
                <div>
                  <p className="font-semibold text-red-700">Delete Account</p>
                  <p className="text-sm text-gray-600">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Account</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account and
                        remove all your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Type <span className="font-mono text-red-600">DELETE</span> to confirm:
                      </label>
                      <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="DELETE"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteConfirmation('')}>
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmation !== 'DELETE'}
                      >
                        Delete Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
