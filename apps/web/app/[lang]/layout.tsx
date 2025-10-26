import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Providers } from '@/components/providers/Providers'
import { Toaster } from '@/components/ui/sonner'
import { locales } from '@/i18n/request'

// Enable dynamic params and disable static optimization for pages with client components
export const dynamicParams = true
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  // Get translations with explicit locale
  const t = await getTranslations({ locale: lang, namespace: 'metadata' })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://verscienta.com'

  return {
    metadataBase: new URL(appUrl),
    title: {
      default: t('title'),
      template: `%s | ${t('siteName')}`,
    },
    description: t('description'),
    keywords: t.raw('keywords') as string[],
    authors: [{ name: t('siteName') }],
    creator: t('siteName'),
    publisher: t('siteName'),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale:
        lang === 'en' ? 'en_US' : lang === 'es' ? 'es_ES' : lang === 'zh-CN' ? 'zh_CN' : 'zh_TW',
      url: appUrl,
      siteName: t('siteName'),
      title: t('title'),
      description: t('description'),
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: t('siteName'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og-image.jpg'],
      creator: '@Verscienta',
    },
    alternates: {
      canonical: appUrl,
      languages: {
        en: `${appUrl}/en`,
        es: `${appUrl}/es`,
        'zh-CN': `${appUrl}/zh-CN`,
        'zh-TW': `${appUrl}/zh-TW`,
      },
    },
    manifest: '/manifest.json',
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </Providers>
    </NextIntlClientProvider>
  )
}
