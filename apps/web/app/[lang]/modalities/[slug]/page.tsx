import { Award, Book, Heart, Target, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PractitionerCard } from '@/components/cards/PractitionerCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@/i18n/routing'
import { createJsonLd, getAbsoluteUrl } from '@/lib/json-ld'
import { getModalityBySlug } from '@/lib/strapi-api'

export const dynamic = 'force-dynamic'
interface Modality {
  id: string
  title: string
  modalityId: string
  slug: string
  description?: string
  origin?: string
  overview?: string
  history?: string
  category?: string
  evidenceLevel?: string
  philosophy?: string
  keyConcepts?: string[]
  keyTechniques?: (string | { name: string; description?: string })[]
  diagnosticMethods?: string[]
  treatmentApproaches?: string[]
  benefits?: string[]
  commonConditionsTreated?: (string | { id: string; title: string; slug: string })[]
  scientificEvidence?: string
  contraindications?: string[]
  trainingRequirements?: string
  certificationBodies?: {
    name: string
    website?: string
  }[]
  continuingEducation?: string
  practitioners?: {
    practitionerId: string
    name: string
    slug: string
    photo?: {
      url: string
      alt: string
    }
    title?: string
    modalities?: string[]
    address?: {
      city?: string
      state?: string
    }
    averageRating?: number
    reviewCount?: number
    verificationStatus?: 'verified' | 'pending' | 'unverified'
  }[]
  resources?: {
    title: string
    url: string
    type: string
    description?: string
  }[]
}

interface ModalityPageProps {
  params: Promise<{
    slug: string
    lang: string
  }>
}

export default async function ModalityPage({ params }: ModalityPageProps) {
  const { slug, lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  const { docs } = await getModalityBySlug(slug)
  const modality = docs[0] as Modality | undefined

  if (!modality) {
    notFound()
  }

  // Prepare JSON-LD structured data for the modality
  const modalitySchema = createJsonLd({
    '@type': 'MedicalWebPage',
    '@id': getAbsoluteUrl(`/modalities/${modality.slug}`),
    name: modality.title,
    description: modality.description || modality.overview,
    url: getAbsoluteUrl(`/modalities/${modality.slug}`),
    about: {
      '@type': 'MedicalTherapy',
      name: modality.title,
      description: modality.description,
      ...(modality.benefits && modality.benefits.length > 0
        ? { benefits: modality.benefits.join(', ') }
        : {}),
      ...(modality.contraindications && modality.contraindications.length > 0
        ? { contraindication: modality.contraindications }
        : {}),
    },
    specialty: 'Alternative Medicine',
    ...(modality.scientificEvidence ? { reviewedBy: modality.scientificEvidence } : {}),
  })

  return (
    <div className="container-custom py-12">
      {/* JSON-LD Schema for SEO */}
      <JsonLd data={modalitySchema} />

      {/* Hero Section */}
      <div className="mb-12">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-earth-900 mb-2 font-serif text-4xl font-bold">{modality.title}</h1>
            {modality.origin && (
              <p className="mb-4 text-xl text-gray-600">Origin: {modality.origin}</p>
            )}
          </div>
          <span className="font-mono text-sm text-gray-500">{modality.modalityId}</span>
        </div>

        {/* Description */}
        {modality.description && (
          <p className="mb-6 text-lg text-gray-700">{modality.description}</p>
        )}

        {/* Quick Info */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {modality.category && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-700">Category</h3>
              <Badge variant="sage">{modality.category}</Badge>
            </div>
          )}
          {modality.evidenceLevel && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-700">Evidence Level</h3>
              <Badge variant="gold">{modality.evidenceLevel}</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="mb-12">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="techniques">Techniques</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="training">Training & Certification</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Philosophy */}
          {modality.philosophy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="text-earth-600 mr-2 h-5 w-5" />
                  Philosophy & Principles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{modality.philosophy}</p>
              </CardContent>
            </Card>
          )}

          {/* History */}
          {modality.history && (
            <Card>
              <CardHeader>
                <CardTitle>Historical Background</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{modality.history}</p>
              </CardContent>
            </Card>
          )}

          {/* Key Concepts */}
          {modality.keyConcepts && modality.keyConcepts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Concepts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  {modality.keyConcepts.map((concept: string, idx: number) => (
                    <li key={idx}>{concept}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Techniques Tab */}
        <TabsContent value="techniques" className="space-y-6">
          {/* Key Techniques */}
          {modality.keyTechniques && modality.keyTechniques.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="text-earth-600 mr-2 h-5 w-5" />
                  Key Techniques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {modality.keyTechniques.map((technique, idx) => (
                    <div key={idx} className="rounded-lg border border-gray-200 p-4">
                      <h4 className="text-earth-900 mb-2 font-semibold">
                        {typeof technique === 'string' ? technique : technique.name}
                      </h4>
                      {typeof technique === 'object' && technique.description && (
                        <p className="text-sm text-gray-600">{technique.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diagnostic Methods */}
          {modality.diagnosticMethods && modality.diagnosticMethods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  {modality.diagnosticMethods.map((method: string, idx: number) => (
                    <li key={idx}>{method}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Treatment Approaches */}
          {modality.treatmentApproaches && modality.treatmentApproaches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Treatment Approaches</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  {modality.treatmentApproaches.map((approach: string, idx: number) => (
                    <li key={idx}>{approach}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="benefits" className="space-y-6">
          {/* Benefits */}
          {modality.benefits && modality.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="text-earth-600 mr-2 h-5 w-5" />
                  Health Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {modality.benefits.map((benefit: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-earth-600 mr-2">•</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Conditions Treated */}
          {modality.commonConditionsTreated && modality.commonConditionsTreated.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Commonly Treated Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {modality.commonConditionsTreated.map((condition) => (
                    <Link
                      key={typeof condition === 'string' ? condition : condition.id}
                      href={`/conditions/${typeof condition === 'string' ? '#' : condition.slug}`}
                    >
                      <Badge variant="sage" className="hover:bg-sage-200">
                        {typeof condition === 'string' ? condition : condition.title}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scientific Evidence */}
          {modality.scientificEvidence && (
            <Card>
              <CardHeader>
                <CardTitle>Scientific Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{modality.scientificEvidence}</p>
              </CardContent>
            </Card>
          )}

          {/* Contraindications */}
          {modality.contraindications && modality.contraindications.length > 0 && (
            <Card className="border-yellow-300 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-900">Contraindications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1 text-yellow-900">
                  {modality.contraindications.map((contra: string, idx: number) => (
                    <li key={idx}>{contra}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Training & Certification Tab */}
        <TabsContent value="training" className="space-y-6">
          {/* Training Requirements */}
          {modality.trainingRequirements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="text-earth-600 mr-2 h-5 w-5" />
                  Training Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{modality.trainingRequirements}</p>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {modality.certificationBodies && modality.certificationBodies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Certification Bodies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {modality.certificationBodies.map((body, idx) => (
                    <li key={idx} className="border-b border-gray-200 pb-2 last:border-0">
                      <h4 className="font-semibold text-gray-900">
                        {typeof body === 'string' ? body : body.name}
                      </h4>
                      {typeof body === 'object' && body.website && (
                        <a
                          href={body.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-earth-600 hover:text-earth-700 text-sm"
                        >
                          Visit Website →
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Continuing Education */}
          {modality.continuingEducation && (
            <Card>
              <CardHeader>
                <CardTitle>Continuing Education</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{modality.continuingEducation}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Related Practitioners */}
      {modality.practitioners && modality.practitioners.length > 0 && (
        <div className="mb-12">
          <h2 className="text-earth-900 mb-6 flex items-center font-serif text-2xl font-bold">
            <Users className="text-earth-600 mr-2 h-6 w-6" />
            Practitioners Specializing in {modality.title}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modality.practitioners.slice(0, 6).map((practitioner) => (
              <PractitionerCard
                key={practitioner.practitionerId}
                practitionerId={practitioner.practitionerId}
                name={practitioner.name}
                slug={practitioner.slug}
                photo={practitioner.photo}
                title={practitioner.title}
                modalities={practitioner.modalities}
                address={practitioner.address}
                averageRating={practitioner.averageRating}
                reviewCount={practitioner.reviewCount}
                verificationStatus={practitioner.verificationStatus}
              />
            ))}
          </div>
          {modality.practitioners.length > 6 && (
            <div className="mt-6 text-center">
              <Link
                href={`/practitioners?modality=${modality.slug}`}
                className="text-earth-600 hover:text-earth-700 font-semibold"
              >
                View all practitioners →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Resources */}
      {modality.resources && modality.resources.length > 0 && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {modality.resources.map((resource, idx) => (
                <li key={idx}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-earth-600 hover:text-earth-700"
                  >
                    {resource.title} →
                  </a>
                  {resource.description && (
                    <p className="mt-1 text-sm text-gray-600">{resource.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-900">
          <strong>Disclaimer:</strong> This information is for educational purposes only. Consult
          with a qualified healthcare provider before starting any new treatment modality.
        </p>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: ModalityPageProps): Promise<Metadata> {
  const { slug, lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  // Get translations with explicit locale
  const t = await getTranslations({ locale: lang, namespace: 'modalities' })
  const metaT = await getTranslations({ locale: lang, namespace: 'metadata' })

  const { docs } = await getModalityBySlug(slug)
  const modality = docs[0] as Modality | undefined

  if (!modality) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    }
  }

  return {
    title: `${modality.title} | ${metaT('siteName')}`,
    description: modality.description || t('metadata.defaultDescription', { name: modality.title }),
    openGraph: {
      title: `${modality.title} | ${metaT('siteName')}`,
      description:
        modality.description || t('metadata.defaultDescription', { name: modality.title }),
    },
  }
}
