'use client'

import { useSession, signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Settings, Lock, Bell, Eye, Trash2, LogOut } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router])

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

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    // TODO: Implement password change
    toast.success('Password updated successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    // TODO: Implement account deletion
    toast.success('Account deleted successfully')
    await signOut()
    router.push('/')
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-serif text-earth-900 mb-2 flex items-center">
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
                <Lock className="mr-2 h-5 w-5 text-earth-600" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
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
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
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

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-earth-600" />
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
                  className="h-5 w-5 rounded border-gray-300 text-earth-600 focus:ring-earth-600"
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
                  className="h-5 w-5 rounded border-gray-300 text-earth-600 focus:ring-earth-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Practitioner Updates</p>
                  <p className="text-sm text-gray-600">
                    Updates from practitioners you follow
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-earth-600 focus:ring-earth-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5 text-earth-600" />
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
                  className="h-5 w-5 rounded border-gray-300 text-earth-600 focus:ring-earth-600"
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
                  className="h-5 w-5 rounded border-gray-300 text-earth-600 focus:ring-earth-600"
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
              <div className="flex items-center justify-between pt-4 border-t border-red-100">
                <div>
                  <p className="font-semibold text-red-700">Delete Account</p>
                  <p className="text-sm text-gray-600">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Account</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Type <span className="font-mono text-red-600">DELETE</span> to confirm:
                      </label>
                      <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="DELETE"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteConfirmation('')}
                      >
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
