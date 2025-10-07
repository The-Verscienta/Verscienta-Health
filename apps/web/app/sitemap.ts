import { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://verscienta.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const routes = [
    '',
    '/herbs',
    '/formulas',
    '/conditions',
    '/practitioners',
    '/modalities',
    '/symptom-checker',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/disclaimer',
  ].map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? ('daily' as const) : ('weekly' as const),
    priority: route === '' ? 1 : 0.8,
  }))

  // TODO: Fetch dynamic routes from API
  // This should be implemented when the CMS is connected
  // Example for herbs:
  // const herbs = await fetchAllHerbs()
  // const herbRoutes = herbs.map((herb) => ({
  //   url: `${APP_URL}/herbs/${herb.slug}`,
  //   lastModified: new Date(herb.updatedAt),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.7,
  // }))

  return routes
}
