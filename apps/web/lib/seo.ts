import type { Metadata } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://verscienta.com'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  noIndex?: boolean
}

export function generateMetadata({
  title = 'Verscienta Health - Holistic Herbal Medicine Platform',
  description = 'World-class holistic health platform bridging ancient herbal wisdom with modern science. Explore 15,000+ herbs, TCM formulas, and find verified practitioners.',
  image = `${APP_URL}/og-image.png`,
  url = APP_URL,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  noIndex = false,
}: SEOProps = {}): Metadata {
  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Verscienta Health',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@VersientaHealth',
    },
    alternates: {
      canonical: url,
      languages: {
        'en-US': url,
        'es-ES': `${url}?lang=es`,
        'zh-CN': `${url}?lang=zh-CN`,
        'zh-TW': `${url}?lang=zh-TW`,
      },
    },
  }

  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    }
  }

  if (type === 'article' && publishedTime) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
      tags,
    }
  }

  return metadata
}

// Schema.org structured data helpers
export interface HerbSchema {
  name: string
  scientificName: string
  alternateName?: string[]
  description: string
  image?: string
  url: string
}

export function generateHerbSchema(herb: HerbSchema) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Drug',
    name: herb.name,
    alternateName: herb.alternateName,
    description: herb.description,
    image: herb.image,
    url: herb.url,
    activeIngredient: herb.scientificName,
    drugClass: 'Herbal Medicine',
  }
}

export interface PractitionerSchema {
  name: string
  description: string
  image?: string
  url: string
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  telephone?: string
  email?: string
  specialty: string[]
  acceptsNewPatients?: boolean
  rating?: {
    value: number
    count: number
  }
}

export function generatePractitionerSchema(practitioner: PractitionerSchema) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: practitioner.name,
    description: practitioner.description,
    image: practitioner.image,
    url: practitioner.url,
    medicalSpecialty: practitioner.specialty,
  }

  if (practitioner.address) {
    schema.address = {
      '@type': 'PostalAddress',
      ...practitioner.address,
    }
  }

  if (practitioner.telephone) {
    schema.telephone = practitioner.telephone
  }

  if (practitioner.email) {
    schema.email = practitioner.email
  }

  if (practitioner.acceptsNewPatients !== undefined) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Medical Services',
      itemListElement: [
        {
          '@type': 'Offer',
          availability: practitioner.acceptsNewPatients
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      ],
    }
  }

  if (practitioner.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: practitioner.rating.value,
      reviewCount: practitioner.rating.count,
    }
  }

  return schema
}

export interface ConditionSchema {
  name: string
  alternateName?: string[]
  description: string
  url: string
  possibleTreatment?: string[]
  symptoms?: string[]
  riskFactor?: string[]
}

export function generateConditionSchema(condition: ConditionSchema) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: condition.name,
    alternateName: condition.alternateName,
    description: condition.description,
    url: condition.url,
  }

  if (condition.possibleTreatment) {
    schema.possibleTreatment = condition.possibleTreatment.map((treatment) => ({
      '@type': 'MedicalTherapy',
      name: treatment,
    }))
  }

  if (condition.symptoms) {
    schema.signOrSymptom = condition.symptoms.map((symptom) => ({
      '@type': 'MedicalSymptom',
      name: symptom,
    }))
  }

  if (condition.riskFactor) {
    schema.riskFactor = condition.riskFactor.map((risk) => ({
      '@type': 'MedicalRiskFactor',
      name: risk,
    }))
  }

  return schema
}

// Breadcrumb schema
export interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Organization schema (for home page)
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Verscienta Health',
    description:
      'World-class holistic health platform bridging ancient herbal wisdom with modern science',
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    sameAs: [
      'https://twitter.com/VersientaHealth',
      'https://facebook.com/VersientaHealth',
      'https://linkedin.com/company/verscienta-health',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'hello@verscienta.com',
      availableLanguage: ['en', 'es', 'zh-CN', 'zh-TW'],
    },
  }
}

// WebSite schema (for home page)
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Verscienta Health',
    description:
      'World-class holistic health platform bridging ancient herbal wisdom with modern science',
    url: APP_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${APP_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
