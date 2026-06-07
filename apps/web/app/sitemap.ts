import { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/payload-api'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://verscienta.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes = [
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

  // Fetch dynamic routes from Payload CMS
  const [herbSlugs, formulaSlugs, conditionSlugs, practitionerSlugs, modalitySlugs] =
    await Promise.all([
      getAllSlugs('herbs'),
      getAllSlugs('formulas'),
      getAllSlugs('conditions'),
      getAllSlugs('practitioners'),
      getAllSlugs('modalities'),
    ])

  // Generate herb routes
  const herbRoutes = herbSlugs.map((slug) => ({
    url: `${APP_URL}/herbs/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Generate formula routes
  const formulaRoutes = formulaSlugs.map((slug) => ({
    url: `${APP_URL}/formulas/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Generate condition routes
  const conditionRoutes = conditionSlugs.map((slug) => ({
    url: `${APP_URL}/conditions/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Generate practitioner routes
  const practitionerRoutes = practitionerSlugs.map((slug) => ({
    url: `${APP_URL}/practitioners/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Generate modality routes
  const modalityRoutes = modalitySlugs.map((slug) => ({
    url: `${APP_URL}/modalities/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    ...staticRoutes,
    ...herbRoutes,
    ...formulaRoutes,
    ...conditionRoutes,
    ...practitionerRoutes,
    ...modalityRoutes,
  ]
}
