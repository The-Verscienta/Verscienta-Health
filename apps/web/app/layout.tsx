import type { Metadata } from 'next'
import { Inter, Crimson_Pro, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Verscienta Health - Holistic Health Knowledge Platform',
    template: '%s | Verscienta Health',
  },
  description:
    'Comprehensive holistic health platform bridging ancient herbal wisdom with modern science. Explore 15,000+ herbs, TCM formulas, AI symptom checker, and find verified practitioners.',
  keywords: [
    'holistic health',
    'herbal medicine',
    'Traditional Chinese Medicine',
    'TCM',
    'Western herbalism',
    'natural remedies',
    'herbs',
    'symptom checker',
    'practitioners',
    'alternative medicine',
    'integrative health',
  ],
  authors: [{ name: 'Verscienta Health' }],
  creator: 'Verscienta Health',
  publisher: 'Verscienta Health',
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
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Verscienta Health',
    title: 'Verscienta Health - Holistic Health Knowledge Platform',
    description:
      'Comprehensive holistic health platform bridging ancient herbal wisdom with modern science.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Verscienta Health',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verscienta Health - Holistic Health Knowledge Platform',
    description:
      'Comprehensive holistic health platform bridging ancient herbal wisdom with modern science.',
    images: ['/og-image.jpg'],
    creator: '@Verscienta',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${crimsonPro.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
