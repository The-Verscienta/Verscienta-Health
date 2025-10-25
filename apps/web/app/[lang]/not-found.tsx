import { Leaf } from 'lucide-react'
import { setRequestLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'

export default async function NotFound({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  setRequestLocale(lang)
  return (
    <div className="container-custom flex min-h-[60vh] flex-col items-center justify-center py-12">
      <Leaf className="text-earth-400 mb-6 h-16 w-16" />
      <h1 className="text-earth-900 mb-4 font-serif text-4xl font-bold">Page Not Found</h1>
      <p className="mb-8 max-w-md text-center text-lg text-gray-600">
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
