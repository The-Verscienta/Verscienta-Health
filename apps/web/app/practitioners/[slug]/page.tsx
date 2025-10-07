import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Star,
  Calendar,
  Award,
  BookOpen,
} from 'lucide-react'

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
  params: {
    slug: string
  }
}

// This will be replaced with actual Payload CMS API call
async function getPractitioner(_slug: string): Promise<Practitioner | null> {
  // TODO: Replace with actual Payload CMS API call
  // const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/practitioners?where[slug][equals]=${slug}&depth=2`)
  // const data = await response.json()
  // if (!data.docs || data.docs.length === 0) return null
  // return data.docs[0]

  return null
}

export default async function PractitionerPage({ params }: PractitionerPageProps) {
  const practitioner = await getPractitioner(params.slug)

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

  return (
    <div className="container-custom py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image */}
          <div className="lg:col-span-1">
            <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg shadow-lg">
              {practitioner.photo ? (
                <Image
                  src={practitioner.photo?.url || '/placeholder-practitioner.jpg'}
                  alt={practitioner.photo.alt || practitioner.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-earth-100 text-6xl font-bold text-earth-600">
                  {practitioner.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
            </div>

            {/* Contact Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {practitioner.phone && (
                  <a
                    href={`tel:${practitioner.phone}`}
                    className="flex items-center gap-2 text-gray-700 hover:text-earth-600"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{practitioner.phone}</span>
                  </a>
                )}
                {practitioner.email && (
                  <a
                    href={`mailto:${practitioner.email}`}
                    className="flex items-center gap-2 text-gray-700 hover:text-earth-600"
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
                    className="flex items-center gap-2 text-gray-700 hover:text-earth-600"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Visit Website</span>
                  </a>
                )}
                {fullAddress && (
                  <div className="flex items-start gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-1" />
                    <span>{fullAddress}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Book Appointment */}
            {practitioner.acceptingNewPatients && (
              <Button className="w-full mt-4" size="lg">
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            )}
          </div>

          {/* Header Info */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold font-serif text-earth-900">
                    {practitioner.name}
                  </h1>
                  {practitioner.verificationStatus === 'verified' && (
                    <CheckCircle className="h-6 w-6 text-green-600" aria-label="Verified" />
                  )}
                </div>

                {practitioner.title && (
                  <p className="text-xl text-gray-600 mb-2">{practitioner.title}</p>
                )}

                {practitioner.credentials && practitioner.credentials.length > 0 && (
                  <p className="text-lg text-gray-600 mb-4">
                    {practitioner.credentials.join(', ')}
                  </p>
                )}
              </div>
              <span className="text-sm font-mono text-gray-500">{practitioner.practitionerId}</span>
            </div>

            {/* Rating */}
            {practitioner.averageRating && practitioner.reviewCount && practitioner.reviewCount > 0 && (
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-gold-600 text-gold-600" />
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
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Modalities</h3>
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
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Specializations</h3>
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
            <div className="flex flex-wrap gap-2 mt-6">
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
                  <BookOpen className="mr-2 h-5 w-5 text-earth-600" />
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
                <ul className="list-disc list-inside space-y-1 text-gray-700">
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
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <p className="text-gray-700 whitespace-pre-line">{practitioner.officeHours}</p>
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
                  <Award className="mr-2 h-5 w-5 text-earth-600" />
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
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
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
                <p className="text-2xl font-bold text-earth-900">
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
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{review.author}</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-gold-600 text-gold-600" />
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          <strong>Disclaimer:</strong> Verscienta Health provides practitioner listings as a
          service. We do not employ or control these practitioners. Please verify credentials
          and licensing independently before engaging services.
        </p>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PractitionerPageProps) {
  const practitioner = await getPractitioner(params.slug)

  if (!practitioner) {
    return {
      title: 'Practitioner Not Found | Verscienta Health',
    }
  }

  return {
    title: `${practitioner.name} | Verscienta Health`,
    description: practitioner.bio || `${practitioner.name} - ${practitioner.title || 'Holistic Health Practitioner'}`,
  }
}
