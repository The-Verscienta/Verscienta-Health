import { LoadingPage } from '@/components/ui/loading'
import { setRequestLocale } from 'next-intl/server'

export default async function Loading({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  setRequestLocale(lang)
  return <LoadingPage />
}
