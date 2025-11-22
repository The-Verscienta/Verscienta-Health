import { Crimson_Pro, Inter, JetBrains_Mono } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/json-ld'

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

// Metadata is now handled in app/[lang]/layout.tsx for i18n support
// This root layout only provides the basic HTML structure

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Get current locale from next-intl (fallback to 'en' for routes outside [lang] like /api-docs)
  let locale = 'en'
  try {
    locale = await getLocale()
  } catch (error) {
    // No locale context (e.g., for /api-docs route outside [lang] directory)
    // Use default locale 'en'
  }

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${crimsonPro.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Global JSON-LD structured data for SEO */}
        <JsonLd data={[generateOrganizationSchema(), generateWebsiteSchema()]} />
      </head>
      <body className="bg-background min-h-screen font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
