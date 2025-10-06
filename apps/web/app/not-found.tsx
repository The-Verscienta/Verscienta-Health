import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Leaf } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-12">
      <Leaf className="h-16 w-16 text-earth-400 mb-6" />
      <h1 className="text-4xl font-bold font-serif text-earth-900 mb-4">Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
        <Link href="/herbs">
          <Button variant="secondary">Browse Herbs</Button>
        </Link>
      </div>
    </div>
  )
}
