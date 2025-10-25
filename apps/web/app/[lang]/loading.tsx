import { setRequestLocale } from 'next-intl/server'
import { LoadingPage } from '@/components/ui/loading'

export default async function Loading({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  setRequestLocale(lang)
  return <LoadingPage />
}
