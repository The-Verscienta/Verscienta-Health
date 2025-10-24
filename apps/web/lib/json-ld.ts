/**
 * JSON-LD Structured Data Utilities
 *
 * Generates schema.org structured data for SEO and rich snippets.
 * Supports medical/health content, products, practitioners, and more.
 *
 * @see https://schema.org/
 * @see https://nextjs.org/docs/app/guides/json-ld
 */

import type { Thing, WithContext } from 'schema-dts'

/**
 * Base types for our content
 */
export interface BaseEntity {
  id?: string
  name: string
  description?: string
  image?: string | string[]
  url?: string
}

export interface HerbData extends BaseEntity {
  scientificName?: string
  family?: string
  uses?: string[]
  benefits?: string[]
  safetyInfo?: {
    warnings?: string[]
    contraindications?: string[]
  }
  rating?: {
    value: number
    count: number
  }
}

export interface FormulaData extends BaseEntity {
  ingredients?: Array<{
    name: string
    amount?: string
  }>
  uses?: string[]
  dosage?: string
  rating?: {
    value: number
    count: number
  }
}

export interface PractitionerData extends BaseEntity {
  jobTitle?: string
  email?: string
  telephone?: string
  address?: {
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  modalities?: string[]
  certifications?: string[]
  rating?: {
    value: number
    count: number
  }
  priceRange?: string
}

export interface ConditionData extends BaseEntity {
  symptoms?: string[]
  relatedHerbs?: string[]
  relatedFormulas?: string[]
}

/**
 * Utility: Create JSON-LD script tag data
 */
export function createJsonLd<T extends Thing>(data: T): WithContext<T> {
  return {
    '@context': 'https://schema.org',
    ...(data as object),
  } as WithContext<T>
}

/**
 * Utility: Get absolute URL
 */
export function getAbsoluteUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://verscienta.com'
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Utility: Get image URL (handle Cloudflare Images)
 */
export function getImageUrl(image: string | undefined, variant = 'large'): string | undefined {
  if (!image) return undefined

  // If it's already a full URL, return it
  if (image.startsWith('http')) return image

  // If it's a Cloudflare Images ID
  const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
  if (accountId && image.length > 10 && !image.includes('/')) {
    return `https://imagedelivery.net/${accountId}/${image}/${variant}`
  }

  // Otherwise, make it absolute
  return getAbsoluteUrl(image)
}

/**
 * Organization Schema - Verscienta Health
 */
export function generateOrganizationSchema() {
  return createJsonLd({
    '@type': 'Organization',
    '@id': getAbsoluteUrl('/#organization'),
    name: 'Verscienta Health',
    description:
      'Comprehensive traditional Chinese medicine (TCM) database for herbs, formulas, and holistic health practitioners',
    url: getAbsoluteUrl('/'),
    logo: getAbsoluteUrl('/logo.png'),
    foundingDate: '2024',
    email: 'info@verscienta.com',
    sameAs: [
      // Add social media URLs when available
      // 'https://twitter.com/verscientahealth',
      // 'https://facebook.com/verscientahealth',
      // 'https://linkedin.com/company/verscienta-health',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@verscienta.com',
      availableLanguage: ['en', 'zh-CN', 'zh-TW'],
    },
  })
}

/**
 * WebSite Schema with Search Action
 */
export function generateWebsiteSchema() {
  return createJsonLd({
    '@type': 'WebSite',
    '@id': getAbsoluteUrl('/#website'),
    name: 'Verscienta Health',
    description: 'Traditional Chinese Medicine Database and Practitioner Directory',
    url: getAbsoluteUrl('/'),
    publisher: {
      '@id': getAbsoluteUrl('/#organization'),
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: getAbsoluteUrl('/search?q={search_term_string}'),
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['en', 'zh-CN', 'zh-TW'],
  })
}

/**
 * Breadcrumb Schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return createJsonLd({
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.url),
    })),
  })
}

/**
 * Medical Entity Schema (for herbs and formulas)
 */
export function generateHerbSchema(herb: HerbData) {
  const schema: any = {
    '@type': ['Product', 'MedicalEntity'],
    '@id': getAbsoluteUrl(`/herbs/${herb.id || herb.name.toLowerCase().replace(/\s+/g, '-')}`),
    name: herb.name,
    description: herb.description,
    url: getAbsoluteUrl(`/herbs/${herb.id || herb.name.toLowerCase().replace(/\s+/g, '-')}`),
  }

  // Add images
  if (herb.image) {
    schema.image = Array.isArray(herb.image)
      ? herb.image.map((img) => getImageUrl(img))
      : getImageUrl(herb.image)
  }

  // Add scientific classification
  if (herb.scientificName) {
    schema.additionalProperty = [
      {
        '@type': 'PropertyValue',
        name: 'Scientific Name',
        value: herb.scientificName,
      },
    ]

    if (herb.family) {
      schema.additionalProperty.push({
        '@type': 'PropertyValue',
        name: 'Family',
        value: herb.family,
      })
    }
  }

  // Add medical uses
  if (herb.uses && herb.uses.length > 0) {
    schema.applicationSubCategory = herb.uses
  }

  // Add benefits
  if (herb.benefits && herb.benefits.length > 0) {
    schema.benefits = herb.benefits.join(', ')
  }

  // Add safety information
  if (herb.safetyInfo) {
    const warnings: string[] = []
    if (herb.safetyInfo.warnings) warnings.push(...herb.safetyInfo.warnings)
    if (herb.safetyInfo.contraindications) warnings.push(...herb.safetyInfo.contraindications)

    if (warnings.length > 0) {
      schema.warning = warnings.join('; ')
    }
  }

  // Add aggregate rating
  if (herb.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: herb.rating.value,
      reviewCount: herb.rating.count,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return createJsonLd(schema)
}

/**
 * Formula Schema (Product + Medical)
 */
export function generateFormulaSchema(formula: FormulaData) {
  const schema: any = {
    '@type': ['Product', 'MedicalTherapy'],
    '@id': getAbsoluteUrl(
      `/formulas/${formula.id || formula.name.toLowerCase().replace(/\s+/g, '-')}`
    ),
    name: formula.name,
    description: formula.description,
    url: getAbsoluteUrl(
      `/formulas/${formula.id || formula.name.toLowerCase().replace(/\s+/g, '-')}`
    ),
  }

  // Add images
  if (formula.image) {
    schema.image = Array.isArray(formula.image)
      ? formula.image.map((img) => getImageUrl(img))
      : getImageUrl(formula.image)
  }

  // Add ingredients
  if (formula.ingredients && formula.ingredients.length > 0) {
    schema.activeIngredient = formula.ingredients.map((ing) => ({
      '@type': 'Thing',
      name: ing.name,
      amount: ing.amount,
    }))
  }

  // Add medical uses
  if (formula.uses && formula.uses.length > 0) {
    schema.relevantSpecialty = formula.uses
  }

  // Add dosage
  if (formula.dosage) {
    schema.dosageForm = formula.dosage
  }

  // Add aggregate rating
  if (formula.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: formula.rating.value,
      reviewCount: formula.rating.count,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return createJsonLd(schema)
}

/**
 * Practitioner Schema (Person + Medical Business)
 */
export function generatePractitionerSchema(practitioner: PractitionerData) {
  const schema: any = {
    '@type': ['Person', 'MedicalBusiness'],
    '@id': getAbsoluteUrl(
      `/practitioners/${practitioner.id || practitioner.name.toLowerCase().replace(/\s+/g, '-')}`
    ),
    name: practitioner.name,
    description: practitioner.description,
    url: getAbsoluteUrl(
      `/practitioners/${practitioner.id || practitioner.name.toLowerCase().replace(/\s+/g, '-')}`
    ),
  }

  // Add image
  if (practitioner.image) {
    schema.image = getImageUrl(
      Array.isArray(practitioner.image) ? practitioner.image[0] : practitioner.image,
      'avatar'
    )
  }

  // Add job title
  if (practitioner.jobTitle) {
    schema.jobTitle = practitioner.jobTitle
  }

  // Add contact info
  if (practitioner.email) {
    schema.email = practitioner.email
  }
  if (practitioner.telephone) {
    schema.telephone = practitioner.telephone
  }

  // Add address
  if (practitioner.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: practitioner.address.streetAddress,
      addressLocality: practitioner.address.addressLocality,
      addressRegion: practitioner.address.addressRegion,
      postalCode: practitioner.address.postalCode,
      addressCountry: practitioner.address.addressCountry || 'US',
    }
  }

  // Add specialties (modalities)
  if (practitioner.modalities && practitioner.modalities.length > 0) {
    schema.medicalSpecialty = practitioner.modalities
  }

  // Add qualifications (certifications)
  if (practitioner.certifications && practitioner.certifications.length > 0) {
    schema.hasCredential = practitioner.certifications.map((cert) => ({
      '@type': 'EducationalOccupationalCredential',
      name: cert,
    }))
  }

  // Add price range
  if (practitioner.priceRange) {
    schema.priceRange = practitioner.priceRange
  }

  // Add aggregate rating
  if (practitioner.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: practitioner.rating.value,
      reviewCount: practitioner.rating.count,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return createJsonLd(schema)
}

/**
 * Health Topic Content Schema (for conditions)
 */
export function generateConditionSchema(condition: ConditionData) {
  const schema: any = {
    '@type': 'HealthTopicContent',
    '@id': getAbsoluteUrl(
      `/conditions/${condition.id || condition.name.toLowerCase().replace(/\s+/g, '-')}`
    ),
    name: condition.name,
    description: condition.description,
    url: getAbsoluteUrl(
      `/conditions/${condition.id || condition.name.toLowerCase().replace(/\s+/g, '-')}`
    ),
  }

  // Add images
  if (condition.image) {
    schema.image = Array.isArray(condition.image)
      ? condition.image.map((img) => getImageUrl(img))
      : getImageUrl(condition.image)
  }

  // Add symptoms
  if (condition.symptoms && condition.symptoms.length > 0) {
    schema.signOrSymptom = condition.symptoms.map((symptom) => ({
      '@type': 'MedicalSymptom',
      name: symptom,
    }))
  }

  // Add related treatments (herbs/formulas)
  const treatments: any[] = []
  if (condition.relatedHerbs) {
    treatments.push(
      ...condition.relatedHerbs.map((herb) => ({
        '@type': 'MedicalEntity',
        name: herb,
      }))
    )
  }
  if (condition.relatedFormulas) {
    treatments.push(
      ...condition.relatedFormulas.map((formula) => ({
        '@type': 'MedicalTherapy',
        name: formula,
      }))
    )
  }
  if (treatments.length > 0) {
    schema.possibleTreatment = treatments
  }

  return createJsonLd(schema)
}

/**
 * FAQ Schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return createJsonLd({
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  })
}

/**
 * Article Schema (for blog posts)
 */
export function generateArticleSchema(article: {
  title: string
  description: string
  url: string
  image?: string
  datePublished: string
  dateModified?: string
  author?: string
}) {
  return createJsonLd({
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: getAbsoluteUrl(article.url),
    image: article.image ? getImageUrl(article.image) : undefined,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Organization',
      '@id': getAbsoluteUrl('/#organization'),
      name: article.author || 'Verscienta Health',
    },
    publisher: {
      '@type': 'Organization',
      '@id': getAbsoluteUrl('/#organization'),
      name: 'Verscienta Health',
      logo: {
        '@type': 'ImageObject',
        url: getAbsoluteUrl('/logo.png'),
      },
    },
  })
}

/**
 * Review Schema
 */
export function generateReviewSchema(review: {
  itemName: string
  itemType: 'Herb' | 'Formula' | 'Practitioner'
  rating: number
  reviewBody: string
  author: string
  datePublished: string
}) {
  return createJsonLd({
    '@type': 'Review',
    itemReviewed: {
      '@type': review.itemType === 'Practitioner' ? 'Person' : 'Product',
      name: review.itemName,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.reviewBody,
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: review.datePublished,
  })
}

/**
 * Local Business Schema (for practitioner offices)
 */
export function generateLocalBusinessSchema(business: {
  name: string
  description?: string
  image?: string
  telephone?: string
  email?: string
  address: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry?: string
  }
  geo?: {
    latitude: number
    longitude: number
  }
  openingHours?: string[]
  priceRange?: string
  rating?: {
    value: number
    count: number
  }
}) {
  const schema: any = {
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    image: business.image ? getImageUrl(business.image) : undefined,
    telephone: business.telephone,
    email: business.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.streetAddress,
      addressLocality: business.address.addressLocality,
      addressRegion: business.address.addressRegion,
      postalCode: business.address.postalCode,
      addressCountry: business.address.addressCountry || 'US',
    },
    priceRange: business.priceRange,
  }

  // Add geo coordinates
  if (business.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    }
  }

  // Add opening hours
  if (business.openingHours && business.openingHours.length > 0) {
    schema.openingHoursSpecification = business.openingHours.map((hours) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.split(' ')[0],
      opens: hours.split(' ')[1],
      closes: hours.split(' ')[2],
    }))
  }

  // Add aggregate rating
  if (business.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.rating.value,
      reviewCount: business.rating.count,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return createJsonLd(schema)
}
