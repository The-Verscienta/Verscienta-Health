export const dynamic = 'force-dynamic'

import { CheckCircle, Globe, Mail, MapPin, Phone, Star } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OptimizedAvatar } from '@/components/ui/optimized-image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PractitionerData } from '@/lib/json-ld'
import { generateBreadcrumbSchema, generatePractitionerSchema } from '@/lib/json-ld'
import { richTextToPlainText } from '@/lib/lexical'
import { getPractitionerBySlug } from '@/lib/payload-api'

// Raw shape returned by Payload (see Practitioners collection + DB migration).
// The generated payload-types.ts is stale for this collection, so we describe
// the real runtime shape here and cast at the boundary.
interface PractitionerDoc {
  id: number | string
  practitionerName: string
  businessName?: string | null
  slug?: string | null
  bio?: unknown
  profileImage?: { url?: string | null; alt?: string | null } | number | null
  credentials?:
    | {
        credentialType?: string | null
        credentialNumber?: string | null
        issuingOrganization?: string | null
        issueDate?: string | null
        expiryDate?: string | null
      }[]
    | null
  specialties?: { specialty?: string | null }[] | null
  languages?: { language?: string | null; proficiency?: string | null }[] | null
  addresses?:
    | {
        street?: string | null
        city?: string | null
        state?: string | null
        zipCode?: string | null
        country?: string | null
      }[]
    | null
  insuranceProviders?: { provider?: string | null }[] | null
  pricing?:
    | { serviceType?: string | null; price?: number | null; duration?: number | null }[]
    | null
  email?: string | null
  phone?: string | null
  website?: string | null
  modalities?: ({ title?: string | null } | number)[] | null
  verificationStatus?: string | null
  averageRating?: number | null
  reviewCount?: number | null
}

interface PractitionerPageProps {
  params: Promise<{
    slug: string
    lang: string
  }>
}

function getPractitionerView(doc: PractitionerDoc) {
  const photo =
    doc.profileImage && typeof doc.profileImage === 'object' ? doc.profileImage : undefined

  const modalities = (doc.modalities ?? [])
    .map((m) => (m && typeof m === 'object' ? (m.title ?? undefined) : undefined))
    .filter((t): t is string => Boolean(t))

  const specialties = (doc.specialties ?? [])
    .map((s) => s.specialty ?? undefined)
    .filter((s): s is string => Boolean(s))

  const languages = (doc.languages ?? [])
    .map((l) => l.language ?? undefined)
    .filter((l): l is string => Boolean(l))

  const insurance = (doc.insuranceProviders ?? [])
    .map((i) => i.provider ?? undefined)
    .filter((i): i is string => Boolean(i))

  const credentials = (doc.credentials ?? []).filter((c) => c.credentialType)
  const pricing = (doc.pricing ?? []).filter((p) => p.serviceType)
  const primary = doc.addresses?.[0]
  const bioText = richTextToPlainText(doc.bio)

  return { photo, modalities, specialties, languages, insurance, credentials, pricing, primary, bioText }
}

export default async function PractitionerPage({ params }: PractitionerPageProps) {
  const { slug, lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  const practitioner = (await getPractitionerBySlug(slug)) as unknown as PractitionerDoc | null

  if (!practitioner) {
    notFound()
  }

  const { photo, modalities, specialties, languages, insurance, credentials, pricing, primary, bioText } =
    getPractitionerView(practitioner)

  const fullAddress = [primary?.street, primary?.city, primary?.state, primary?.zipCode, primary?.country]
    .filter(Boolean)
    .join(', ')

  const credentialSummary = credentials.map((c) => c.credentialType).filter(Boolean).join(', ')

  // Prepare data for JSON-LD schema
  const prices = pricing
    .map((p) => p.price)
    .filter((n): n is number => typeof n === 'number')
  const priceRange =
    prices.length === 0
      ? undefined
      : Math.min(...prices) === Math.max(...prices)
        ? `$${prices[0]}`
        : `$${Math.min(...prices)} - $${Math.max(...prices)}`

  const practitionerData: PractitionerData = {
    id: practitioner.slug ?? String(practitioner.id),
    name: practitioner.practitionerName,
    description: bioText || undefined,
    image: photo?.url ?? undefined,
    jobTitle: practitioner.businessName ?? undefined,
    email: practitioner.email ?? undefined,
    telephone: practitioner.phone ?? undefined,
    address: primary
      ? {
          streetAddress: primary.street ?? undefined,
          addressLocality: primary.city ?? undefined,
          addressRegion: primary.state ?? undefined,
          postalCode: primary.zipCode ?? undefined,
          addressCountry: primary.country ?? undefined,
        }
      : undefined,
    modalities,
    certifications: credentials.map((c) => c.credentialType as string),
    rating:
      practitioner.averageRating && practitioner.reviewCount
        ? {
            value: practitioner.averageRating,
            count: practitioner.reviewCount,
          }
        : undefined,
    priceRange,
  }

  // Breadcrumb schema
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Practitioners', url: '/practitioners' },
    { name: practitioner.practitionerName, url: `/practitioners/${practitioner.slug}` },
  ]

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <JsonLd
        data={[
          generatePractitionerSchema(practitionerData),
          generateBreadcrumbSchema(breadcrumbItems),
        ]}
      />

      <div className="container-custom py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Profile Image */}
            <div className="lg:col-span-1">
              {photo?.url ? (
                <div className="mx-auto max-w-sm">
                  <OptimizedAvatar
                    src={photo.url}
                    alt={photo.alt || practitioner.practitionerName}
                    size={400}
                    fallback="/images/placeholder-practitioner.jpg"
                    className="w-full shadow-lg"
                  />
                </div>
              ) : (
                <div className="bg-earth-100 text-earth-600 mx-auto flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-full text-6xl font-bold shadow-lg">
                  {practitioner.practitionerName
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}

              {/* Contact Card */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {practitioner.phone && (
                    <a
                      href={`tel:${practitioner.phone}`}
                      className="hover:text-earth-600 flex items-center gap-2 text-gray-700"
                    >
                      <Phone className="h-4 w-4" />
                      <span>{practitioner.phone}</span>
                    </a>
                  )}
                  {practitioner.email && (
                    <a
                      href={`mailto:${practitioner.email}`}
                      className="hover:text-earth-600 flex items-center gap-2 text-gray-700"
                    >
                      <Mail className="h-4 w-4" />
                      <span>{practitioner.email}</span>
                    </a>
                  )}
                  {practitioner.website && (
                    <a
                      href={practitioner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-earth-600 flex items-center gap-2 text-gray-700"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Visit Website</span>
                    </a>
                  )}
                  {fullAddress && (
                    <div className="flex items-start gap-2 text-gray-700">
                      <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
                      <span>{fullAddress}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Header Info */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h1 className="text-earth-900 font-serif text-4xl font-bold">
                      {practitioner.practitionerName}
                    </h1>
                    {practitioner.verificationStatus === 'verified' && (
                      <CheckCircle className="h-6 w-6 text-green-600" aria-label="Verified" />
                    )}
                  </div>

                  {practitioner.businessName && (
                    <p className="mb-2 text-xl text-gray-600">{practitioner.businessName}</p>
                  )}

                  {credentialSummary && (
                    <p className="mb-4 text-lg text-gray-600">{credentialSummary}</p>
                  )}
                </div>
              </div>

              {/* Rating */}
              {practitioner.averageRating &&
                practitioner.reviewCount &&
                practitioner.reviewCount > 0 && (
                  <div className="mb-6 flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="fill-gold-600 text-gold-600 h-5 w-5" />
                      <span className="ml-1 text-lg font-semibold">
                        {practitioner.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-600">({practitioner.reviewCount} reviews)</span>
                  </div>
                )}

              {/* Modalities */}
              {modalities.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">Modalities</h3>
                  <div className="flex flex-wrap gap-2">
                    {modalities.map((modality) => (
                      <Badge key={modality} variant="sage">
                        {modality}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialties */}
              {specialties.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((spec) => (
                      <Badge key={spec} variant="gold">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {bioText && (
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line text-gray-700">{bioText}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="about" className="mb-12">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            {/* Languages */}
            {languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Languages Spoken</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((language) => (
                      <Badge key={language} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Insurance */}
            {insurance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Insurance Accepted</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-inside list-disc space-y-1 text-gray-700">
                    {insurance.map((provider, idx) => (
                      <li key={idx}>{provider}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {languages.length === 0 && insurance.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-gray-600">
                  No additional information available.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            {pricing.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pricing.map((service, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-700">
                        {service.serviceType}
                        {service.duration ? ` (${service.duration} min)` : ''}
                      </span>
                      {typeof service.price === 'number' && (
                        <span className="font-semibold">${service.price}</span>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-600">
                  No pricing information available.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6">
            {credentials.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Credentials & Licenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {credentials.map((cert, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        <div>
                          <p className="font-semibold text-gray-900">{cert.credentialType}</p>
                          {cert.issuingOrganization && (
                            <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                          )}
                          {cert.credentialNumber && (
                            <p className="text-xs text-gray-500">No. {cert.credentialNumber}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-600">
                  No credential information available.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Medical Disclaimer */}
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-900">
            <strong>Disclaimer:</strong> Verscienta Health provides practitioner listings as a
            service. We do not employ or control these practitioners. Please verify credentials and
            licensing independently before engaging services.
          </p>
        </div>
      </div>
    </>
  )
}

export async function generateMetadata({ params }: PractitionerPageProps): Promise<Metadata> {
  const { slug, lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  // Get translations with explicit locale
  const t = await getTranslations({ locale: lang, namespace: 'practitioners' })
  const metaT = await getTranslations({ locale: lang, namespace: 'metadata' })

  const practitioner = (await getPractitionerBySlug(slug)) as unknown as PractitionerDoc | null

  if (!practitioner) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    }
  }

  const photo =
    practitioner.profileImage && typeof practitioner.profileImage === 'object'
      ? practitioner.profileImage
      : undefined
  const description =
    richTextToPlainText(practitioner.bio) ||
    t('metadata.defaultDescription', {
      name: practitioner.practitionerName,
      title: practitioner.businessName || t('defaultTitle'),
    })

  return {
    title: `${practitioner.practitionerName} | ${metaT('siteName')}`,
    description,
    openGraph: {
      title: `${practitioner.practitionerName} | ${metaT('siteName')}`,
      description,
      images: photo?.url ? [{ url: photo.url }] : [],
    },
  }
}
