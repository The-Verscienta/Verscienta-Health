import { Award, Book, Heart, Target } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@/i18n/routing'
import { createJsonLd, getAbsoluteUrl } from '@/lib/json-ld'
import { richTextToPlainText } from '@/lib/lexical'
import { getModalityBySlug } from '@/lib/payload-api'

export const dynamic = 'force-dynamic'

// Raw Payload shapes (generated payload-types.ts is stale; see collection config).
interface ConditionRef {
  id: number | string
  title: string
  slug?: string | null
}

interface ModalityDoc {
  id: number | string
  title: string
  slug?: string | null
  description?: unknown
  category?: string | null
  benefits?: { benefit?: string | null }[] | null
  certificationBodies?:
    | { organizationName?: string | null; website?: string | null; certificationLevel?: string | null }[]
    | null
  excelsAt?: { conditionType?: string | null }[] | null
  treatmentApproaches?: { approach?: string | null; description?: string | null }[] | null
  trainingRequirements?: unknown
  relatedConditions?: (ConditionRef | number)[] | null
}

const isObject = <T,>(v: T | number | null | undefined): v is T =>
  typeof v === 'object' && v !== null

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

  const modality = (await getModalityBySlug(slug)) as unknown as ModalityDoc | null

  if (!modality) {
    notFound()
  }

  const descriptionText = richTextToPlainText(modality.description)
  const benefits = (modality.benefits ?? [])
    .map((b) => b.benefit ?? undefined)
    .filter((b): b is string => Boolean(b))
  const excelsAt = (modality.excelsAt ?? [])
    .map((e) => e.conditionType ?? undefined)
    .filter((e): e is string => Boolean(e))
  const approaches = (modality.treatmentApproaches ?? []).filter((a) => a.approach)
  const certBodies = (modality.certificationBodies ?? []).filter((c) => c.organizationName)
  const trainingText = richTextToPlainText(modality.trainingRequirements)
  const relatedConditions = (modality.relatedConditions ?? []).filter(isObject<ConditionRef>)

  // Prepare JSON-LD structured data for the modality
  const modalitySchema = createJsonLd({
    '@type': 'MedicalWebPage',
    '@id': getAbsoluteUrl(`/modalities/${modality.slug}`),
    name: modality.title,
    description: descriptionText,
    url: getAbsoluteUrl(`/modalities/${modality.slug}`),
    about: {
      '@type': 'MedicalTherapy',
      name: modality.title,
      description: descriptionText,
      ...(benefits.length > 0 ? { benefits: benefits.join(', ') } : {}),
    },
  } as any)

  return (
    <div className="container-custom py-12">
      {/* JSON-LD Schema for SEO */}
      <JsonLd data={modalitySchema} />

      {/* Hero Section */}
      <div className="mb-12">
        <div className="mb-4">
          <h1 className="text-earth-900 mb-2 font-serif text-4xl font-bold">{modality.title}</h1>
        </div>

        {/* Description */}
        {descriptionText && (
          <p className="mb-6 whitespace-pre-line text-lg text-gray-700">{descriptionText}</p>
        )}

        {/* Quick Info */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {modality.category && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-700">Category</h3>
              <Badge variant="sage">{modality.category}</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="mb-12">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="techniques">Approaches</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="training">Training & Certification</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {excelsAt.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="text-earth-600 mr-2 h-5 w-5" />
                  What This Modality Excels At
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {excelsAt.map((item) => (
                    <Badge key={item} variant="sage">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                No additional overview information available.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Approaches Tab */}
        <TabsContent value="techniques" className="space-y-6">
          {approaches.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="text-earth-600 mr-2 h-5 w-5" />
                  Treatment Approaches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {approaches.map((approach, idx) => (
                    <div key={idx} className="rounded-lg border border-gray-200 p-4">
                      <h4 className="text-earth-900 mb-2 font-semibold">{approach.approach}</h4>
                      {approach.description && (
                        <p className="text-sm text-gray-600">{approach.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                No treatment approaches listed.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="benefits" className="space-y-6">
          {benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="text-earth-600 mr-2 h-5 w-5" />
                  Health Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start">
                      <span className="text-earth-600 mr-2">•</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Conditions Treated */}
          {relatedConditions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Commonly Treated Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {relatedConditions.map((condition) => (
                    <Link key={condition.id} href={`/conditions/${condition.slug}`}>
                      <Badge variant="sage" className="hover:bg-sage-200">
                        {condition.title}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {benefits.length === 0 && relatedConditions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                No benefit information available.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Training & Certification Tab */}
        <TabsContent value="training" className="space-y-6">
          {trainingText && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="text-earth-600 mr-2 h-5 w-5" />
                  Training Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-gray-700">{trainingText}</p>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {certBodies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Certification Bodies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {certBodies.map((body, idx) => (
                    <li key={idx} className="border-b border-gray-200 pb-2 last:border-0">
                      <h4 className="font-semibold text-gray-900">{body.organizationName}</h4>
                      {body.certificationLevel && (
                        <p className="text-sm text-gray-600">{body.certificationLevel}</p>
                      )}
                      {body.website && (
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

          {!trainingText && certBodies.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                No training or certification information available.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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

  const modality = (await getModalityBySlug(slug)) as unknown as ModalityDoc | null

  if (!modality) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    }
  }

  const description =
    richTextToPlainText(modality.description) ||
    t('metadata.defaultDescription', { name: modality.title })

  return {
    title: `${modality.title} | ${metaT('siteName')}`,
    description,
    openGraph: {
      title: `${modality.title} | ${metaT('siteName')}`,
      description,
    },
  }
}
