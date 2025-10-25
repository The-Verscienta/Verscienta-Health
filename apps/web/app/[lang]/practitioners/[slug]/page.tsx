import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
} from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OptimizedAvatar } from '@/components/ui/optimized-image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PractitionerData } from '@/lib/json-ld'
import { generateBreadcrumbSchema, generatePractitionerSchema } from '@/lib/json-ld'
import { getPractitionerBySlug } from '@/lib/strapi-api'

interface Practitioner {
  id: string
  name: string
  slug: string
  title?: string
  credentials?: string[]
  practitionerId?: string
  photo?: {
    url?: string
    alt?: string
  }
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  phone?: string
  email?: string
  website?: string
  acceptingNewPatients?: boolean
  offersVirtualConsultations?: boolean
  offersHomeVisits?: boolean
  verificationStatus?: string
  averageRating?: number
  reviewCount?: number
  modalities?: string[]
  specializations?: string[]
  bio?: string
  philosophy?: string
  languagesSpoken?: string[]
  insuranceAccepted?: string[]
  servicesOffered?: string[]
  initialConsultationFee?: number
  followUpFee?: number
  officeHours?: string[]
  education?: {
    degree: string
    institution: string
    year?: string
  }[]
  certifications?: {
    name: string
    issuingOrganization?: string
    year?: string
  }[]
  yearsInPractice?: number
  reviews?: {
    id: string
    rating: number
    author: string
    date: string
    content: string
  }[]
}

interface PractitionerPageProps {
  params: Promise<{
    slug: string
    lang: string
  }>
}

export default async function PractitionerPage({ params }: PractitionerPageProps) {
  const { slug, lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  const { docs } = await getPractitionerBySlug(slug)
  const practitioner = docs[0] as Practitioner | undefined

  if (!practitioner) {
    notFound()
  }

  const fullAddress = [
    practitioner.address?.street,
    practitioner.address?.city,
    practitioner.address?.state,
    practitioner.address?.postalCode,
    practitioner.address?.country,
  ]
    .filter(Boolean)
    .join(', ')

  // Prepare data for JSON-LD schema
  const priceRange =
    practitioner.initialConsultationFee && practitioner.followUpFee
      ? `$${practitioner.followUpFee} - $${practitioner.initialConsultationFee}`
      : practitioner.initialConsultationFee
        ? `$${practitioner.initialConsultationFee}`
        : undefined

  const practitionerData: PractitionerData = {
    id: practitioner.slug,
    name: practitioner.name,
    description: practitioner.bio,
    image: practitioner.photo?.url,
    jobTitle: practitioner.title,
    email: practitioner.email,
    telephone: practitioner.phone,
    address: practitioner.address
      ? {
          streetAddress: practitioner.address.street,
          addressLocality: practitioner.address.city,
          addressRegion: practitioner.address.state,
          postalCode: practitioner.address.postalCode,
          addressCountry: practitioner.address.country,
        }
      : undefined,
    modalities: practitioner.modalities,
    certifications: practitioner.certifications?.map((cert) => cert.name),
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
    { name: practitioner.name, url: `/practitioners/${practitioner.slug}` },
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
              {practitioner.photo?.url ? (
                <div className="mx-auto max-w-sm">
                  <OptimizedAvatar
                    src={practitioner.photo.url}
                    alt={practitioner.photo.alt || practitioner.name}
                    size={400}
                    fallback="/images/placeholder-practitioner.jpg"
                    className="w-full shadow-lg"
                  />
                </div>
              ) : (
                <div className="bg-earth-100 text-earth-600 mx-auto flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-full text-6xl font-bold shadow-lg">
                  {practitioner.name
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

              {/* Book Appointment */}
              {practitioner.acceptingNewPatients && (
                <Button className="mt-4 w-full" size="lg">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
              )}
            </div>

            {/* Header Info */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h1 className="text-earth-900 font-serif text-4xl font-bold">
                      {practitioner.name}
                    </h1>
                    {practitioner.verificationStatus === 'verified' && (
                      <CheckCircle className="h-6 w-6 text-green-600" aria-label="Verified" />
                    )}
                  </div>

                  {practitioner.title && (
                    <p className="mb-2 text-xl text-gray-600">{practitioner.title}</p>
                  )}

                  {practitioner.credentials && practitioner.credentials.length > 0 && (
                    <p className="mb-4 text-lg text-gray-600">
                      {practitioner.credentials.join(', ')}
                    </p>
                  )}
                </div>
                <span className="font-mono text-sm text-gray-500">
                  {practitioner.practitionerId}
                </span>
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
              {practitioner.modalities && practitioner.modalities.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">Modalities</h3>
                  <div className="flex flex-wrap gap-2">
                    {practitioner.modalities.map((modality: string) => (
                      <Badge key={modality} variant="sage">
                        {modality}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Specializations */}
              {practitioner.specializations && practitioner.specializations.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {practitioner.specializations.map((spec: string) => (
                      <Badge key={spec} variant="gold">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {practitioner.bio && (
                <div className="prose max-w-none">
                  <p className="text-gray-700">{practitioner.bio}</p>
                </div>
              )}

              {/* Status Badges */}
              <div className="mt-6 flex flex-wrap gap-2">
                {practitioner.acceptingNewPatients && (
                  <Badge variant="success">Accepting New Patients</Badge>
                )}
                {practitioner.offersVirtualConsultations && (
                  <Badge variant="default">Virtual Consultations Available</Badge>
                )}
                {practitioner.offersHomeVisits && (
                  <Badge variant="default">Home Visits Available</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="about" className="mb-12">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="education">Education & Training</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            {/* Philosophy */}
            {practitioner.philosophy && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="text-earth-600 mr-2 h-5 w-5" />
                    Treatment Philosophy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{practitioner.philosophy}</p>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {practitioner.languagesSpoken && practitioner.languagesSpoken.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Languages Spoken</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {practitioner.languagesSpoken.map((language: string) => (
                      <Badge key={language} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Insurance */}
            {practitioner.insuranceAccepted && practitioner.insuranceAccepted.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Insurance Accepted</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-inside list-disc space-y-1 text-gray-700">
                    {practitioner.insuranceAccepted.map((insurance: string, idx: number) => (
                      <li key={idx}>{insurance}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            {practitioner.servicesOffered && practitioner.servicesOffered.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services Offered</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {practitioner.servicesOffered.map((service: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-earth-600 mr-2">•</span>
                        <span className="text-gray-700">{service}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Pricing */}
            {(practitioner.initialConsultationFee || practitioner.followUpFee) && (
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {practitioner.initialConsultationFee && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Initial Consultation:</span>
                      <span className="font-semibold">${practitioner.initialConsultationFee}</span>
                    </div>
                  )}
                  {practitioner.followUpFee && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Follow-up Visit:</span>
                      <span className="font-semibold">${practitioner.followUpFee}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Hours */}
            {practitioner.officeHours && (
              <Card>
                <CardHeader>
                  <CardTitle>Office Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-gray-700">{practitioner.officeHours}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Education & Training Tab */}
          <TabsContent value="education" className="space-y-6">
            {/* Education */}
            {practitioner.education && practitioner.education.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="text-earth-600 mr-2 h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {practitioner.education.map((edu, idx: number) => (
                      <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                        <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                        <p className="text-gray-700">{edu.institution}</p>
                        {edu.year && <p className="text-sm text-gray-500">{edu.year}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {practitioner.certifications && practitioner.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Certifications & Licenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {practitioner.certifications.map((cert, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                        <div>
                          <p className="font-semibold text-gray-900">{cert.name}</p>
                          {cert.issuingOrganization && (
                            <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                          )}
                          {cert.year && <p className="text-xs text-gray-500">{cert.year}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Years in Practice */}
            {practitioner.yearsInPractice && (
              <Card>
                <CardHeader>
                  <CardTitle>Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-earth-900 text-2xl font-bold">
                    {practitioner.yearsInPractice}+ years
                  </p>
                  <p className="text-gray-600">in practice</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {practitioner.reviews && practitioner.reviews.length > 0 ? (
              <div className="space-y-4">
                {practitioner.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{review.author}</span>
                            <div className="flex items-center">
                              <Star className="fill-gold-600 text-gold-600 h-4 w-4" />
                              <span className="ml-1 text-sm font-semibold">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-600">
                  No reviews yet. Be the first to leave a review!
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

  const { docs } = await getPractitionerBySlug(slug)
  const practitioner = docs[0] as Practitioner | undefined

  if (!practitioner) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    }
  }

  return {
    title: `${practitioner.name} | ${metaT('siteName')}`,
    description:
      practitioner.bio ||
      t('metadata.defaultDescription', {
        name: practitioner.name,
        title: practitioner.title || t('defaultTitle'),
      }),
    openGraph: {
      title: `${practitioner.name} | ${metaT('siteName')}`,
      description:
        practitioner.bio ||
        t('metadata.defaultDescription', {
          name: practitioner.name,
          title: practitioner.title || t('defaultTitle'),
        }),
      images: practitioner.photo?.url ? [{ url: practitioner.photo.url }] : [],
    },
  }
}
