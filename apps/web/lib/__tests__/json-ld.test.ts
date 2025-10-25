/**
 * JSON-LD Test Suite
 *
 * Tests structured data generation for SEO and rich snippets
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type ConditionData,
  createJsonLd,
  type FormulaData,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateConditionSchema,
  generateFAQSchema,
  generateFormulaSchema,
  generateHerbSchema,
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generatePractitionerSchema,
  generateReviewSchema,
  generateWebsiteSchema,
  getAbsoluteUrl,
  getImageUrl,
  type HerbData,
  type PractitionerData,
} from '../json-ld'

describe('createJsonLd', () => {
  it('adds @context to schema', () => {
    const data = {
      '@type': 'Organization',
      name: 'Test Org',
    }

    const result = createJsonLd(data)

    expect(result['@context']).toBe('https://schema.org')
    expect(result['@type']).toBe('Organization')
    expect(result.name).toBe('Test Org')
  })

  it('preserves existing properties', () => {
    const data = {
      '@type': 'Person',
      name: 'John Doe',
      email: 'john@example.com',
      jobTitle: 'Developer',
    }

    const result = createJsonLd(data)

    expect(result.name).toBe('John Doe')
    expect(result.email).toBe('john@example.com')
    expect(result.jobTitle).toBe('Developer')
  })

  it('handles nested objects', () => {
    const data = {
      '@type': 'Organization',
      name: 'Test',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Main St',
      },
    }

    const result = createJsonLd(data)

    expect(result.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: '123 Main St',
    })
  })
})

describe('getAbsoluteUrl', () => {
  const originalEnv = process.env.NEXT_PUBLIC_APP_URL

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalEnv
  })

  it('uses NEXT_PUBLIC_APP_URL when set', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'

    expect(getAbsoluteUrl('/test')).toBe('https://example.com/test')
  })

  it('uses default URL when env not set', () => {
    delete process.env.NEXT_PUBLIC_APP_URL

    expect(getAbsoluteUrl('/test')).toBe('https://verscienta.com/test')
  })

  it('handles path with leading slash', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'

    expect(getAbsoluteUrl('/path')).toBe('https://example.com/path')
  })

  it('handles path without leading slash', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'

    expect(getAbsoluteUrl('path')).toBe('https://example.com/path')
  })

  it('handles root path', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'

    expect(getAbsoluteUrl('/')).toBe('https://example.com/')
  })

  it('handles paths with query parameters', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'

    expect(getAbsoluteUrl('/search?q=test')).toBe('https://example.com/search?q=test')
  })

  it('handles paths with fragments', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'

    expect(getAbsoluteUrl('/#section')).toBe('https://example.com/#section')
  })
})

describe('getImageUrl', () => {
  const originalAccountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID = originalAccountId
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl
  })

  it('returns undefined for undefined image', () => {
    expect(getImageUrl(undefined)).toBeUndefined()
  })

  it('returns full URL unchanged', () => {
    const url = 'https://example.com/image.jpg'
    expect(getImageUrl(url)).toBe(url)
  })

  it('handles http URLs', () => {
    const url = 'http://example.com/image.jpg'
    expect(getImageUrl(url)).toBe(url)
  })

  it('generates Cloudflare Images URL with account ID', () => {
    process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID = 'test-account-id'
    const imageId = 'abc123def456'

    const result = getImageUrl(imageId)

    expect(result).toBe('https://imagedelivery.net/test-account-id/abc123def456/large')
  })

  it('uses custom variant for Cloudflare Images', () => {
    process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID = 'test-account-id'
    const imageId = 'abc123def456'

    const result = getImageUrl(imageId, 'thumbnail')

    expect(result).toBe('https://imagedelivery.net/test-account-id/abc123def456/thumbnail')
  })

  it('falls back to absolute URL for short strings', () => {
    process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID = 'test-account-id'
    const shortId = 'abc' // Less than 10 characters

    const result = getImageUrl(shortId)

    expect(result).toBe('https://example.com/abc')
  })

  it('falls back to absolute URL when no account ID', () => {
    delete process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID
    const imageId = 'abc123def456'

    const result = getImageUrl(imageId)

    expect(result).toBe('https://example.com/abc123def456')
  })

  it('handles paths with slashes as absolute URLs', () => {
    process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID = 'test-account-id'
    const imagePath = '/images/herb.jpg'

    const result = getImageUrl(imagePath)

    expect(result).toBe('https://example.com/images/herb.jpg')
  })
})

describe('generateOrganizationSchema', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
  })

  it('generates valid Organization schema', () => {
    const schema = generateOrganizationSchema()

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Organization')
    expect(schema.name).toBe('Verscienta Health')
    expect(schema.email).toBe('info@verscienta.com')
  })

  it('includes organization ID', () => {
    const schema = generateOrganizationSchema()

    expect(schema['@id']).toBe('https://example.com/#organization')
  })

  it('includes contact point', () => {
    const schema = generateOrganizationSchema()

    expect(schema.contactPoint).toEqual({
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@verscienta.com',
      availableLanguage: ['en', 'zh-CN', 'zh-TW'],
    })
  })

  it('includes founding date', () => {
    const schema = generateOrganizationSchema()

    expect(schema.foundingDate).toBe('2024')
  })
})

describe('generateWebsiteSchema', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
  })

  it('generates valid WebSite schema', () => {
    const schema = generateWebsiteSchema()

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('WebSite')
    expect(schema.name).toBe('Verscienta Health')
  })

  it('includes search action', () => {
    const schema = generateWebsiteSchema()

    expect(schema.potentialAction).toEqual({
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://example.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    })
  })

  it('includes supported languages', () => {
    const schema = generateWebsiteSchema()

    expect(schema.inLanguage).toEqual(['en', 'zh-CN', 'zh-TW'])
  })

  it('references organization', () => {
    const schema = generateWebsiteSchema()

    expect(schema.publisher).toEqual({
      '@id': 'https://example.com/#organization',
    })
  })
})

describe('generateBreadcrumbSchema', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
  })

  it('generates valid BreadcrumbList schema', () => {
    const items = [
      { name: 'Home', url: '/' },
      { name: 'Herbs', url: '/herbs' },
      { name: 'Ginseng', url: '/herbs/ginseng' },
    ]

    const schema = generateBreadcrumbSchema(items)

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('BreadcrumbList')
  })

  it('creates list items with correct positions', () => {
    const items = [
      { name: 'Home', url: '/' },
      { name: 'Herbs', url: '/herbs' },
    ]

    const schema = generateBreadcrumbSchema(items)

    expect(schema.itemListElement[0].position).toBe(1)
    expect(schema.itemListElement[1].position).toBe(2)
  })

  it('converts URLs to absolute', () => {
    const items = [{ name: 'Home', url: '/' }]

    const schema = generateBreadcrumbSchema(items)

    expect(schema.itemListElement[0].item).toBe('https://example.com/')
  })

  it('handles empty array', () => {
    const schema = generateBreadcrumbSchema([])

    expect(schema.itemListElement).toEqual([])
  })

  it('handles single item', () => {
    const items = [{ name: 'Home', url: '/' }]

    const schema = generateBreadcrumbSchema(items)

    expect(schema.itemListElement).toHaveLength(1)
  })
})

describe('generateHerbSchema', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
  })

  const minimalHerb: HerbData = {
    name: 'Ginseng',
  }

  it('generates valid herb schema with minimal data', () => {
    const schema = generateHerbSchema(minimalHerb)

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toEqual(['Product', 'MedicalEntity'])
    expect(schema.name).toBe('Ginseng')
  })

  it('generates URL from herb name', () => {
    const schema = generateHerbSchema(minimalHerb)

    expect(schema.url).toBe('https://example.com/herbs/ginseng')
    expect(schema['@id']).toBe('https://example.com/herbs/ginseng')
  })

  it('uses herb ID if provided', () => {
    const herb: HerbData = { ...minimalHerb, id: 'panax-ginseng' }
    const schema = generateHerbSchema(herb)

    expect(schema.url).toBe('https://example.com/herbs/panax-ginseng')
  })

  it('includes scientific name and family', () => {
    const herb: HerbData = {
      ...minimalHerb,
      scientificName: 'Panax ginseng',
      family: 'Araliaceae',
    }

    const schema = generateHerbSchema(herb)

    expect(schema.additionalProperty).toContainEqual({
      '@type': 'PropertyValue',
      name: 'Scientific Name',
      value: 'Panax ginseng',
    })
    expect(schema.additionalProperty).toContainEqual({
      '@type': 'PropertyValue',
      name: 'Family',
      value: 'Araliaceae',
    })
  })

  it('includes benefits', () => {
    const herb: HerbData = {
      ...minimalHerb,
      benefits: ['Boosts energy', 'Improves cognitive function'],
    }

    const schema = generateHerbSchema(herb)

    expect(schema.benefits).toBe('Boosts energy, Improves cognitive function')
  })

  it('includes safety information', () => {
    const herb: HerbData = {
      ...minimalHerb,
      safetyInfo: {
        warnings: ['May cause insomnia'],
        contraindications: ['Pregnancy', 'Hypertension'],
      },
    }

    const schema = generateHerbSchema(herb)

    expect(schema.warning).toBe('May cause insomnia; Pregnancy; Hypertension')
  })

  it('includes aggregate rating', () => {
    const herb: HerbData = {
      ...minimalHerb,
      rating: { value: 4.5, count: 100 },
    }

    const schema = generateHerbSchema(herb)

    expect(schema.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 4.5,
      reviewCount: 100,
      bestRating: 5,
      worstRating: 1,
    })
  })

  it('handles single image string', () => {
    const herb: HerbData = {
      ...minimalHerb,
      image: 'https://example.com/ginseng.jpg',
    }

    const schema = generateHerbSchema(herb)

    expect(schema.image).toBe('https://example.com/ginseng.jpg')
  })

  it('handles array of images', () => {
    const herb: HerbData = {
      ...minimalHerb,
      image: ['https://example.com/ginseng1.jpg', 'https://example.com/ginseng2.jpg'],
    }

    const schema = generateHerbSchema(herb)

    expect(schema.image).toEqual([
      'https://example.com/ginseng1.jpg',
      'https://example.com/ginseng2.jpg',
    ])
  })
})

describe('generateFormulaSchema', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
  })

  const minimalFormula: FormulaData = {
    name: 'Si Jun Zi Tang',
  }

  it('generates valid formula schema', () => {
    const schema = generateFormulaSchema(minimalFormula)

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toEqual(['Product', 'MedicalTherapy'])
    expect(schema.name).toBe('Si Jun Zi Tang')
  })

  it('includes ingredients', () => {
    const formula: FormulaData = {
      ...minimalFormula,
      ingredients: [
        { name: 'Ginseng', amount: '10g' },
        { name: 'Atractylodes', amount: '10g' },
      ],
    }

    const schema = generateFormulaSchema(formula)

    expect(schema.activeIngredient).toEqual([
      { '@type': 'Thing', name: 'Ginseng', amount: '10g' },
      { '@type': 'Thing', name: 'Atractylodes', amount: '10g' },
    ])
  })

  it('includes medical uses', () => {
    const formula: FormulaData = {
      ...minimalFormula,
      uses: ['Digestive disorders', 'Fatigue'],
    }

    const schema = generateFormulaSchema(formula)

    expect(schema.relevantSpecialty).toEqual(['Digestive disorders', 'Fatigue'])
  })

  it('includes dosage', () => {
    const formula: FormulaData = {
      ...minimalFormula,
      dosage: 'Decoction: 3-9g',
    }

    const schema = generateFormulaSchema(formula)

    expect(schema.dosageForm).toBe('Decoction: 3-9g')
  })

  it('includes rating', () => {
    const formula: FormulaData = {
      ...minimalFormula,
      rating: { value: 4.8, count: 50 },
    }

    const schema = generateFormulaSchema(formula)

    expect(schema.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      reviewCount: 50,
      bestRating: 5,
      worstRating: 1,
    })
  })
})

describe('generatePractitionerSchema', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
  })

  const minimalPractitioner: PractitionerData = {
    name: 'Dr. Jane Smith',
  }

  it('generates valid practitioner schema', () => {
    const schema = generatePractitionerSchema(minimalPractitioner)

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toEqual(['Person', 'MedicalBusiness'])
    expect(schema.name).toBe('Dr. Jane Smith')
  })

  it('includes job title', () => {
    const practitioner: PractitionerData = {
      ...minimalPractitioner,
      jobTitle: 'Licensed Acupuncturist',
    }

    const schema = generatePractitionerSchema(practitioner)

    expect(schema.jobTitle).toBe('Licensed Acupuncturist')
  })

  it('includes contact information', () => {
    const practitioner: PractitionerData = {
      ...minimalPractitioner,
      email: 'jane@example.com',
      telephone: '+1-555-0123',
    }

    const schema = generatePractitionerSchema(practitioner)

    expect(schema.email).toBe('jane@example.com')
    expect(schema.telephone).toBe('+1-555-0123')
  })

  it('includes address', () => {
    const practitioner: PractitionerData = {
      ...minimalPractitioner,
      address: {
        streetAddress: '123 Main St',
        addressLocality: 'San Francisco',
        addressRegion: 'CA',
        postalCode: '94102',
        addressCountry: 'US',
      },
    }

    const schema = generatePractitionerSchema(practitioner)

    expect(schema.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: '123 Main St',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94102',
      addressCountry: 'US',
    })
  })

  it('defaults to US for address country', () => {
    const practitioner: PractitionerData = {
      ...minimalPractitioner,
      address: {
        streetAddress: '123 Main St',
        addressLocality: 'San Francisco',
        addressRegion: 'CA',
        postalCode: '94102',
      },
    }

    const schema = generatePractitionerSchema(practitioner)

    expect(schema.address.addressCountry).toBe('US')
  })

  it('includes modalities', () => {
    const practitioner: PractitionerData = {
      ...minimalPractitioner,
      modalities: ['Acupuncture', 'Herbal Medicine', 'Cupping'],
    }

    const schema = generatePractitionerSchema(practitioner)

    expect(schema.medicalSpecialty).toEqual(['Acupuncture', 'Herbal Medicine', 'Cupping'])
  })

  it('includes certifications', () => {
    const practitioner: PractitionerData = {
      ...minimalPractitioner,
      certifications: ['NCCAOM Certified', 'State Licensed'],
    }

    const schema = generatePractitionerSchema(practitioner)

    expect(schema.hasCredential).toEqual([
      { '@type': 'EducationalOccupationalCredential', name: 'NCCAOM Certified' },
      { '@type': 'EducationalOccupationalCredential', name: 'State Licensed' },
    ])
  })

  it('includes price range', () => {
    const practitioner: PractitionerData = {
      ...minimalPractitioner,
      priceRange: '$$',
    }

    const schema = generatePractitionerSchema(practitioner)

    expect(schema.priceRange).toBe('$$')
  })
})

describe('generateConditionSchema', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
  })

  const minimalCondition: ConditionData = {
    name: 'Common Cold',
  }

  it('generates valid condition schema', () => {
    const schema = generateConditionSchema(minimalCondition)

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('HealthTopicContent')
    expect(schema.name).toBe('Common Cold')
  })

  it('includes symptoms', () => {
    const condition: ConditionData = {
      ...minimalCondition,
      symptoms: ['Cough', 'Sore throat', 'Runny nose'],
    }

    const schema = generateConditionSchema(condition)

    expect(schema.signOrSymptom).toEqual([
      { '@type': 'MedicalSymptom', name: 'Cough' },
      { '@type': 'MedicalSymptom', name: 'Sore throat' },
      { '@type': 'MedicalSymptom', name: 'Runny nose' },
    ])
  })

  it('includes related herbs as treatments', () => {
    const condition: ConditionData = {
      ...minimalCondition,
      relatedHerbs: ['Ginseng', 'Astragalus'],
    }

    const schema = generateConditionSchema(condition)

    expect(schema.possibleTreatment).toContainEqual({
      '@type': 'MedicalEntity',
      name: 'Ginseng',
    })
    expect(schema.possibleTreatment).toContainEqual({
      '@type': 'MedicalEntity',
      name: 'Astragalus',
    })
  })

  it('includes related formulas as treatments', () => {
    const condition: ConditionData = {
      ...minimalCondition,
      relatedFormulas: ['Si Jun Zi Tang', 'Yu Ping Feng San'],
    }

    const schema = generateConditionSchema(condition)

    expect(schema.possibleTreatment).toContainEqual({
      '@type': 'MedicalTherapy',
      name: 'Si Jun Zi Tang',
    })
    expect(schema.possibleTreatment).toContainEqual({
      '@type': 'MedicalTherapy',
      name: 'Yu Ping Feng San',
    })
  })

  it('combines herbs and formulas in treatments', () => {
    const condition: ConditionData = {
      ...minimalCondition,
      relatedHerbs: ['Ginseng'],
      relatedFormulas: ['Si Jun Zi Tang'],
    }

    const schema = generateConditionSchema(condition)

    expect(schema.possibleTreatment).toHaveLength(2)
  })
})

describe('generateFAQSchema', () => {
  it('generates valid FAQ schema', () => {
    const faqs = [
      { question: 'What is TCM?', answer: 'Traditional Chinese Medicine' },
      { question: 'Is it safe?', answer: 'When used properly, yes.' },
    ]

    const schema = generateFAQSchema(faqs)

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('FAQPage')
    expect(schema.mainEntity).toHaveLength(2)
  })

  it('structures Q&A correctly', () => {
    const faqs = [{ question: 'What is TCM?', answer: 'Traditional Chinese Medicine' }]

    const schema = generateFAQSchema(faqs)

    expect(schema.mainEntity[0]).toEqual({
      '@type': 'Question',
      name: 'What is TCM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Traditional Chinese Medicine',
      },
    })
  })

  it('handles empty FAQ array', () => {
    const schema = generateFAQSchema([])

    expect(schema.mainEntity).toEqual([])
  })
})

describe('generateArticleSchema', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://example.com'
  })

  const minimalArticle = {
    title: 'Understanding Ginseng',
    description: 'A comprehensive guide',
    url: '/blog/understanding-ginseng',
    datePublished: '2025-01-01',
  }

  it('generates valid Article schema', () => {
    const schema = generateArticleSchema(minimalArticle)

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Article')
    expect(schema.headline).toBe('Understanding Ginseng')
  })

  it('converts URL to absolute', () => {
    const schema = generateArticleSchema(minimalArticle)

    expect(schema.url).toBe('https://example.com/blog/understanding-ginseng')
  })

  it('uses datePublished for dateModified when not provided', () => {
    const schema = generateArticleSchema(minimalArticle)

    expect(schema.dateModified).toBe('2025-01-01')
  })

  it('uses custom dateModified when provided', () => {
    const article = {
      ...minimalArticle,
      dateModified: '2025-01-15',
    }

    const schema = generateArticleSchema(article)

    expect(schema.dateModified).toBe('2025-01-15')
  })

  it('includes author', () => {
    const article = {
      ...minimalArticle,
      author: 'Dr. Jane Smith',
    }

    const schema = generateArticleSchema(article)

    expect(schema.author.name).toBe('Dr. Jane Smith')
  })

  it('defaults to Verscienta Health as author', () => {
    const schema = generateArticleSchema(minimalArticle)

    expect(schema.author.name).toBe('Verscienta Health')
  })

  it('includes publisher', () => {
    const schema = generateArticleSchema(minimalArticle)

    expect(schema.publisher).toEqual({
      '@type': 'Organization',
      '@id': 'https://example.com/#organization',
      name: 'Verscienta Health',
      logo: {
        '@type': 'ImageObject',
        url: 'https://example.com/logo.png',
      },
    })
  })
})

describe('generateReviewSchema', () => {
  const minimalReview = {
    itemName: 'Ginseng',
    itemType: 'Herb' as const,
    rating: 5,
    reviewBody: 'Excellent quality!',
    author: 'John Doe',
    datePublished: '2025-01-01',
  }

  it('generates valid Review schema', () => {
    const schema = generateReviewSchema(minimalReview)

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Review')
  })

  it('uses Product type for Herb', () => {
    const schema = generateReviewSchema(minimalReview)

    expect(schema.itemReviewed['@type']).toBe('Product')
  })

  it('uses Product type for Formula', () => {
    const review = { ...minimalReview, itemType: 'Formula' as const }
    const schema = generateReviewSchema(review)

    expect(schema.itemReviewed['@type']).toBe('Product')
  })

  it('uses Person type for Practitioner', () => {
    const review = { ...minimalReview, itemType: 'Practitioner' as const, itemName: 'Dr. Smith' }
    const schema = generateReviewSchema(review)

    expect(schema.itemReviewed['@type']).toBe('Person')
  })

  it('includes rating', () => {
    const schema = generateReviewSchema(minimalReview)

    expect(schema.reviewRating).toEqual({
      '@type': 'Rating',
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
    })
  })

  it('includes review body and author', () => {
    const schema = generateReviewSchema(minimalReview)

    expect(schema.reviewBody).toBe('Excellent quality!')
    expect(schema.author).toEqual({
      '@type': 'Person',
      name: 'John Doe',
    })
  })
})

describe('generateLocalBusinessSchema', () => {
  const minimalBusiness = {
    name: "Jane's Acupuncture",
    address: {
      streetAddress: '123 Main St',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94102',
    },
  }

  it('generates valid LocalBusiness schema', () => {
    const schema = generateLocalBusinessSchema(minimalBusiness)

    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('LocalBusiness')
    expect(schema.name).toBe("Jane's Acupuncture")
  })

  it('includes geo coordinates', () => {
    const business = {
      ...minimalBusiness,
      geo: { latitude: 37.7749, longitude: -122.4194 },
    }

    const schema = generateLocalBusinessSchema(business)

    expect(schema.geo).toEqual({
      '@type': 'GeoCoordinates',
      latitude: 37.7749,
      longitude: -122.4194,
    })
  })

  it('includes rating', () => {
    const business = {
      ...minimalBusiness,
      rating: { value: 4.9, count: 200 },
    }

    const schema = generateLocalBusinessSchema(business)

    expect(schema.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 4.9,
      reviewCount: 200,
      bestRating: 5,
      worstRating: 1,
    })
  })

  it('defaults to US for address country', () => {
    const schema = generateLocalBusinessSchema(minimalBusiness)

    expect(schema.address.addressCountry).toBe('US')
  })

  it('uses custom address country', () => {
    const business = {
      ...minimalBusiness,
      address: {
        ...minimalBusiness.address,
        addressCountry: 'CA',
      },
    }

    const schema = generateLocalBusinessSchema(business)

    expect(schema.address.addressCountry).toBe('CA')
  })

  it('includes opening hours', () => {
    const business = {
      ...minimalBusiness,
      openingHours: ['Monday 09:00 17:00', 'Tuesday 09:00 17:00'],
    }

    const schema = generateLocalBusinessSchema(business)

    expect(schema.openingHoursSpecification).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Monday',
        opens: '09:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Tuesday',
        opens: '09:00',
        closes: '17:00',
      },
    ])
  })
})
