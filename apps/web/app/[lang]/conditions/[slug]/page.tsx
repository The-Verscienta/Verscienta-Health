import { Activity, AlertCircle, Brain, Leaf, Pill } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { FormulaCard } from '@/components/cards/FormulaCard'
import { HerbCard } from '@/components/cards/HerbCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@/i18n/routing'
import type { ConditionData } from '@/lib/json-ld'
import { generateBreadcrumbSchema, generateConditionSchema } from '@/lib/json-ld'
import { richTextToPlainText } from '@/lib/lexical'
import { getConditionBySlug } from '@/lib/payload-api'

export const dynamic = 'force-dynamic'

// Raw Payload shapes (generated payload-types.ts is stale; see collection config).
interface MediaRef {
  url?: string | null
  alt?: string | null
}

interface HerbRef {
  id: number | string
  herbId?: string | null
  title: string
  slug?: string | null
  description?: unknown
  featuredImage?: MediaRef | number | null
  botanicalInfo?: { scientificName?: string | null } | null
  tcmProperties?: {
    tcmTaste?: string[] | null
    tcmTemperature?: string | null
    tcmCategory?: string | null
  } | null
  westernProperties?: string[] | null
  averageRating?: number | null
  reviewCount?: number | null
}

interface FormulaRef {
  id: number | string
  title: string
  slug?: string | null
  description?: unknown
  category?: string | null
  tradition?: string | null
  ingredients?: unknown[] | null
}

interface SymptomRef {
  id: number | string
  title: string
  slug?: string | null
}

interface ConditionDoc {
  id: number | string
  title: string
  slug?: string | null
  description?: unknown
  symptoms?: { symptom?: string | null; frequency?: string | null }[] | null
  severity?: string | null
  category?: string | null
  tcmPattern?: string | null
  westernDiagnosis?: string | null
  prevalence?: string | null
  conventionalTreatments?: unknown
  complementaryApproaches?: unknown
  preventionTips?: unknown
  lifestyleRecommendations?: unknown
  dietaryAdvice?: unknown
  whenToSeekHelp?: unknown
  relatedHerbs?: (HerbRef | number)[] | null
  relatedFormulas?: (FormulaRef | number)[] | null
  relatedSymptoms?: (SymptomRef | number)[] | null
}

const isObject = <T,>(v: T | number | null | undefined): v is T =>
  typeof v === 'object' && v !== null

function mediaUrl(image: MediaRef | number | null | undefined): MediaRef | undefined {
  return image && typeof image === 'object' ? image : undefined
}

interface ConditionPageProps {
  params: Promise<{
    slug: string
    lang: string
  }>
}

export default async function ConditionPage({ params }: ConditionPageProps) {
  const { slug, lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  const condition = (await getConditionBySlug(slug)) as unknown as ConditionDoc | null

  if (!condition) {
    notFound()
  }

  const descriptionText = richTextToPlainText(condition.description)
  const symptoms = (condition.symptoms ?? []).filter((s) => s.symptom)
  const relatedSymptoms = (condition.relatedSymptoms ?? []).filter(isObject<SymptomRef>)
  const relatedHerbs = (condition.relatedHerbs ?? []).filter(isObject<HerbRef>)
  const relatedFormulas = (condition.relatedFormulas ?? []).filter(isObject<FormulaRef>)

  const conventionalText = richTextToPlainText(condition.conventionalTreatments)
  const complementaryText = richTextToPlainText(condition.complementaryApproaches)
  const lifestyleText = richTextToPlainText(condition.lifestyleRecommendations)
  const dietaryText = richTextToPlainText(condition.dietaryAdvice)
  const preventionText = richTextToPlainText(condition.preventionTips)
  const whenToSeekText = richTextToPlainText(condition.whenToSeekHelp)

  // Prepare data for JSON-LD schema
  const conditionData: ConditionData = {
    id: condition.slug ?? String(condition.id),
    name: condition.title,
    description: descriptionText || undefined,
    symptoms: symptoms.map((s) => s.symptom as string),
    relatedHerbs: relatedHerbs.map((herb) => herb.title),
    relatedFormulas: relatedFormulas.map((formula) => formula.title),
  }

  // Breadcrumb schema
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Conditions', url: '/conditions' },
    { name: condition.title, url: `/conditions/${condition.slug}` },
  ]

  const severityColors = {
    mild: 'sage',
    moderate: 'gold',
    severe: 'tcm',
    life_threatening: 'tcm',
  } as const

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <JsonLd
        data={[generateConditionSchema(conditionData), generateBreadcrumbSchema(breadcrumbItems)]}
      />

      <div className="container-custom py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="mb-4">
            <h1 className="text-earth-900 mb-2 font-serif text-4xl font-bold">{condition.title}</h1>
          </div>

          {/* Description */}
          {descriptionText && (
            <p className="mb-6 whitespace-pre-line text-lg text-gray-700">{descriptionText}</p>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {condition.category && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-gray-700">Category</h3>
                <Badge variant="default">{condition.category}</Badge>
              </div>
            )}
            {condition.severity && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-gray-700">Typical Severity</h3>
                <Badge
                  variant={
                    severityColors[condition.severity as keyof typeof severityColors] || 'default'
                  }
                >
                  {condition.severity}
                </Badge>
              </div>
            )}
            {condition.westernDiagnosis && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-gray-700">Western Diagnosis</h3>
                <p className="text-gray-700">{condition.westernDiagnosis}</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="symptoms" className="mb-12">
          <TabsList>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="western">Western View</TabsTrigger>
            <TabsTrigger value="tcm">TCM View</TabsTrigger>
            <TabsTrigger value="treatment">Treatment</TabsTrigger>
          </TabsList>

          {/* Symptoms Tab */}
          <TabsContent value="symptoms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="text-earth-600 mr-2 h-5 w-5" />
                  Common Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent>
                {symptoms.length > 0 ? (
                  <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {symptoms.map((symptom, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-earth-600 mr-2">•</span>
                        <span className="text-gray-700">
                          {symptom.symptom}
                          {symptom.frequency && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {symptom.frequency}
                            </Badge>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No symptom information available.</p>
                )}
              </CardContent>
            </Card>

            {/* Related Symptoms */}
            {relatedSymptoms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Associated Symptoms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {relatedSymptoms.map((symptom) => (
                      <Link
                        key={symptom.id}
                        href={`/symptoms/${symptom.slug}`}
                        className="inline-block"
                      >
                        <Badge variant="outline" className="hover:bg-earth-50">
                          {symptom.title}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* When to Seek Help */}
            {whenToSeekText && (
              <Card className="border-tcm-300 bg-tcm-50">
                <CardHeader>
                  <CardTitle className="text-tcm-900">When to Seek Immediate Medical Care</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-tcm-800 whitespace-pre-line">{whenToSeekText}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Western View Tab */}
          <TabsContent value="western" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="text-earth-600 mr-2 h-5 w-5" />
                  Western Medical Perspective
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {condition.prevalence && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Prevalence</h4>
                    <p className="whitespace-pre-line text-gray-700">{condition.prevalence}</p>
                  </div>
                )}
                {conventionalText && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">
                      Conventional Treatments
                    </h4>
                    <p className="whitespace-pre-line text-gray-700">{conventionalText}</p>
                  </div>
                )}
                {complementaryText && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">
                      Complementary Approaches
                    </h4>
                    <p className="whitespace-pre-line text-gray-700">{complementaryText}</p>
                  </div>
                )}
                {!condition.prevalence && !conventionalText && !complementaryText && (
                  <p className="text-gray-600">No Western medical information available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TCM View Tab */}
          <TabsContent value="tcm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="text-earth-600 mr-2 h-5 w-5" />
                  Traditional Chinese Medicine Perspective
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {condition.tcmPattern ? (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">TCM Pattern</h4>
                    <Badge variant="tcm" className="text-base">
                      {condition.tcmPattern}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-gray-600">No TCM information available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treatment Tab */}
          <TabsContent value="treatment" className="space-y-6">
            {preventionText && (
              <Card>
                <CardHeader>
                  <CardTitle>Prevention Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-gray-700">{preventionText}</p>
                </CardContent>
              </Card>
            )}

            {lifestyleText && (
              <Card>
                <CardHeader>
                  <CardTitle>Lifestyle Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-gray-700">{lifestyleText}</p>
                </CardContent>
              </Card>
            )}

            {dietaryText && (
              <Card>
                <CardHeader>
                  <CardTitle>Dietary Advice</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-gray-700">{dietaryText}</p>
                </CardContent>
              </Card>
            )}

            {!preventionText && !lifestyleText && !dietaryText && (
              <Card>
                <CardContent className="py-12 text-center text-gray-600">
                  No treatment recommendations available.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Related Herbs */}
        {relatedHerbs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-earth-900 mb-6 flex items-center font-serif text-2xl font-bold">
              <Leaf className="text-earth-600 mr-2 h-6 w-6" />
              Helpful Herbs
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedHerbs.slice(0, 6).map((herb) => (
                <HerbCard
                  key={herb.id}
                  herbId={herb.herbId || ''}
                  title={herb.title}
                  slug={herb.slug || ''}
                  scientificName={herb.botanicalInfo?.scientificName || undefined}
                  description={richTextToPlainText(herb.description) || undefined}
                  featuredImage={
                    mediaUrl(herb.featuredImage)?.url
                      ? {
                          url: mediaUrl(herb.featuredImage)?.url as string,
                          alt: mediaUrl(herb.featuredImage)?.alt || undefined,
                        }
                      : undefined
                  }
                  tcmProperties={
                    herb.tcmProperties
                      ? {
                          taste: herb.tcmProperties.tcmTaste ?? undefined,
                          temperature: herb.tcmProperties.tcmTemperature ?? undefined,
                          category: herb.tcmProperties.tcmCategory ?? undefined,
                        }
                      : undefined
                  }
                  westernProperties={herb.westernProperties || undefined}
                  averageRating={herb.averageRating || undefined}
                  reviewCount={herb.reviewCount || undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* Related Formulas */}
        {relatedFormulas.length > 0 && (
          <div className="mb-12">
            <h2 className="text-earth-900 mb-6 flex items-center font-serif text-2xl font-bold">
              <Pill className="text-earth-600 mr-2 h-6 w-6" />
              Recommended Formulas
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedFormulas.slice(0, 6).map((formula) => (
                <FormulaCard
                  key={formula.id}
                  formulaId={String(formula.id)}
                  title={formula.title}
                  slug={formula.slug || ''}
                  description={richTextToPlainText(formula.description) || undefined}
                  category={formula.category || undefined}
                  tradition={formula.tradition || undefined}
                  ingredientCount={formula.ingredients?.length}
                />
              ))}
            </div>
          </div>
        )}

        {/* Medical Disclaimer */}
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-900">
            <strong>Medical Disclaimer:</strong> This information is for educational purposes only
            and is not a substitute for professional medical advice, diagnosis, or treatment. Always
            consult your healthcare provider for medical concerns.
          </p>
        </div>
      </div>
    </>
  )
}

export async function generateMetadata({ params }: ConditionPageProps): Promise<Metadata> {
  const { slug, lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  // Get translations with explicit locale
  const t = await getTranslations({ locale: lang, namespace: 'conditions' })
  const metaT = await getTranslations({ locale: lang, namespace: 'metadata' })

  const condition = (await getConditionBySlug(slug)) as unknown as ConditionDoc | null

  if (!condition) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    }
  }

  const description =
    richTextToPlainText(condition.description) ||
    t('metadata.defaultDescription', { name: condition.title })

  return {
    title: `${condition.title} | ${metaT('siteName')}`,
    description,
    openGraph: {
      title: `${condition.title} | ${metaT('siteName')}`,
      description,
    },
  }
}
