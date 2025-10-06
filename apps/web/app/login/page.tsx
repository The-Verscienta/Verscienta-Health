'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn } from '@/lib/auth-client'
import { toast } from 'sonner'
import { Leaf } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await signIn.email({
        email,
        password,
      })

      if (error) {
        toast.error(error.message || 'Failed to sign in')
        return
      }

      toast.success('Signed in successfully')
      router.push('/') // Redirect to home page
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: '/',
      })
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Failed to sign in with Google')
    }
  }

  const handleGithubSignIn = async () => {
    try {
      await signIn.social({
        provider: 'github',
        callbackURL: '/',
      })
    } catch (error) {
      console.error('GitHub sign in error:', error)
      toast.error('Failed to sign in with GitHub')
    }
  }

  return (
    <div className="container-custom flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-earth-100">
            <Leaf className="h-6 w-6 text-earth-600" />
          </div>
          <CardTitle className="text-2xl font-serif">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Verscienta Health account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-2 block">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="text-earth-600 hover:text-earth-700">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={handleGoogleSignIn}>
                Google
              </Button>
              <Button type="button" variant="outline" onClick={handleGithubSignIn}>
                GitHub
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-earth-600 hover:text-earth-700">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
