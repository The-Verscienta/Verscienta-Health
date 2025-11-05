import { setRequestLocale } from 'next-intl/server'
import { LoadingPage } from '@/components/ui/loading'

export default async function Loading({ params }: { params: Promise<{ lang: string }> }) {
  try {
    const resolvedParams = await params
    if (resolvedParams?.lang) {
      setRequestLocale(resolvedParams.lang)
    }
  } catch (error) {
    // Params not available, use default
    console.warn('Loading component: params not available')
  }
  return <LoadingPage />
}
