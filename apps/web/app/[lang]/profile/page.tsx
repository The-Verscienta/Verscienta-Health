'use client'

export const dynamic = 'force-dynamic'

import { BookOpen, Calendar, Heart, Mail, Star, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSession } from '@/lib/auth-client'

interface ExtendedUser {
  id: string
  createdAt: Date
  updatedAt: Date
  email: string
  emailVerified: boolean
  name: string
  image?: string | null
  role?: string
  firstName?: string
  lastName?: string
  mfaEnabled?: boolean
  mfaEnrolledAt?: Date
}

declare module '@/lib/auth-client' {
  interface User {
    role?: string
    firstName?: string
    lastName?: string
    mfaEnabled?: boolean
    mfaEnrolledAt?: Date
  }
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session?.user) {
      const [firstName, lastName] = (session.user.name || '').split(' ')
      setFormData({
        firstName: firstName || '',
        lastName: lastName || '',
        email: session.user.email || '',
      })
    }
  }, [session])

  if (isPending) {
    return <Loading />
  }

  if (!session) {
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }

  return (
    <div className="container-custom py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-earth-900 mb-2 font-serif text-4xl font-bold">My Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="saved">Saved Items</TabsTrigger>
            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <User className="text-earth-600 mr-2 h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          First Name
                        </label>
                        <Input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Last Name
                        </label>
                        <Input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Email
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">Save Changes</Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="mb-1 text-sm font-semibold text-gray-700">First Name</h4>
                        <p className="text-gray-900">{formData.firstName || 'Not set'}</p>
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-semibold text-gray-700">Last Name</h4>
                        <p className="text-gray-900">{formData.lastName || 'Not set'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-gray-700">Email</h4>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <p className="text-gray-900">{formData.email}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-gray-700">Member Since</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p className="text-gray-900">
                          {session.user.createdAt
                            ? new Date(session.user.createdAt).toLocaleDateString()
                            : 'Unknown'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-gray-700">Role</h4>
                      <Badge variant="default">
                        {(session.user as ExtendedUser).role || 'User'}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Settings Link */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/settings">Manage account settings →</a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Items Tab */}
          <TabsContent value="saved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="text-earth-600 mr-2 h-5 w-5" />
                  Saved Herbs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="py-8 text-center text-gray-600">
                  You haven't saved any herbs yet. Start exploring our herb database!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="text-earth-600 mr-2 h-5 w-5" />
                  Saved Formulas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="py-8 text-center text-gray-600">
                  You haven't saved any formulas yet. Browse our formula collection!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="text-earth-600 mr-2 h-5 w-5" />
                  My Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="py-8 text-center text-gray-600">
                  You haven't written any reviews yet. Share your experience with the community!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
