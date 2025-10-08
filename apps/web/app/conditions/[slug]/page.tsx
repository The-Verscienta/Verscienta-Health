import { Activity, AlertCircle, Brain, Leaf, Pill } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FormulaCard } from '@/components/cards/FormulaCard'
import { HerbCard } from '@/components/cards/HerbCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getConditionBySlug } from '@/lib/payload-api'

interface Symptom {
  id: string
  title: string
  slug: string
}

interface Herb {
  id: string
  herbId: string
  title: string
  slug: string
  scientificName?: string
  description?: string
  featuredImage?: {
    url: string
    alt: string
  }
  tcmProperties?: {
    taste?: string[]
    temperature?: string
    category?: string
  }
  westernProperties?: string[]
  averageRating?: number
  reviewCount?: number
}

interface Ingredient {
  id: string
  herbId: string
  name: string
  amount?: string
}

interface Formula {
  id: string
  formulaId: string
  title: string
  slug: string
  chineseName?: string
  pinyin?: string
  description?: string
  category?: string
  tradition?: string
  ingredients?: Ingredient[]
  ingredientCount?: number
  averageRating?: number
  reviewCount?: number
}

interface Condition {
  id: string
  title: string
  conditionId: string
  description?: string
  alternativeNames?: string[]
  category?: string
  severity?: 'mild' | 'moderate' | 'severe'
  affectedSystems?: string[]
  commonSymptoms?: string[]
  relatedSymptoms?: Symptom[]
  westernCauses?: string[]
  riskFactors?: string[]
  diagnosis?: string[]
  conventionalTreatment?: string[]
  tcmPattern?: string[]
  tcmCauses?: string[]
  affectedMeridians?: string[]
  tcmDiagnosis?: string[]
  treatmentPrinciples?: string[]
  lifestyleRecommendations?: string[]
  dietaryRecommendations?: string[]
  relatedHerbs?: Herb[]
  relatedFormulas?: Formula[]
  emergencySymptoms?: string[]
}

interface ConditionPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ConditionPage({ params }: ConditionPageProps) {
  const { slug } = await params
  const { docs } = await getConditionBySlug(slug)
  const condition = docs[0] as Condition | undefined

  if (!condition) {
    notFound()
  }

  // TypeScript doesn't understand that notFound() throws, so we assert the type
  const validCondition = condition as NonNullable<typeof condition>

  const severityColors = {
    mild: 'sage',
    moderate: 'gold',
    severe: 'tcm',
  } as const

  return (
    <div className="container-custom py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-earth-900 mb-2 font-serif text-4xl font-bold">
              {validCondition.title}
            </h1>
            {validCondition.alternativeNames && validCondition.alternativeNames.length > 0 && (
              <p className="mb-4 text-lg text-gray-600">
                Also known as: {validCondition.alternativeNames.join(', ')}
              </p>
            )}
          </div>
          <span className="font-mono text-sm text-gray-500">{validCondition.conditionId}</span>
        </div>

        {/* Description */}
        {validCondition.description && (
          <p className="mb-6 text-lg text-gray-700">{validCondition.description}</p>
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
          {condition.affectedSystems && condition.affectedSystems.length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-700">Affected Systems</h3>
              <div className="flex flex-wrap gap-1">
                {condition.affectedSystems.slice(0, 2).map((system: string) => (
                  <Badge key={system} variant="sage" className="text-xs">
                    {system}
                  </Badge>
                ))}
              </div>
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
              {condition.commonSymptoms && condition.commonSymptoms.length > 0 ? (
                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {condition.commonSymptoms.map((symptom: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-earth-600 mr-2">•</span>
                      <span className="text-gray-700">{symptom}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No symptom information available.</p>
              )}
            </CardContent>
          </Card>

          {/* Related Symptoms */}
          {condition.relatedSymptoms && condition.relatedSymptoms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Associated Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {condition.relatedSymptoms.map((symptom) => (
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
          {condition.emergencySymptoms && condition.emergencySymptoms.length > 0 && (
            <Card className="border-tcm-300 bg-tcm-50">
              <CardHeader>
                <CardTitle className="text-tcm-900">When to Seek Immediate Medical Care</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-tcm-800 list-inside list-disc space-y-2">
                  {condition.emergencySymptoms.map((symptom: string, idx: number) => (
                    <li key={idx}>{symptom}</li>
                  ))}
                </ul>
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
              {/* Causes */}
              {condition.westernCauses && condition.westernCauses.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Causes</h4>
                  <ul className="list-inside list-disc space-y-1 text-gray-700">
                    {condition.westernCauses.map((cause: string, idx: number) => (
                      <li key={idx}>{cause}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {condition.riskFactors && condition.riskFactors.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Risk Factors</h4>
                  <ul className="list-inside list-disc space-y-1 text-gray-700">
                    {condition.riskFactors.map((factor: string, idx: number) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Diagnosis */}
              {condition.diagnosis && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Diagnosis</h4>
                  <p className="text-gray-700">{condition.diagnosis}</p>
                </div>
              )}

              {/* Conventional Treatment */}
              {condition.conventionalTreatment && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">
                    Conventional Treatment
                  </h4>
                  <p className="text-gray-700">{condition.conventionalTreatment}</p>
                </div>
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
              {/* TCM Pattern */}
              {condition.tcmPattern && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">TCM Pattern</h4>
                  <Badge variant="tcm" className="text-base">
                    {condition.tcmPattern}
                  </Badge>
                </div>
              )}

              {/* TCM Causes */}
              {condition.tcmCauses && condition.tcmCauses.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">
                    TCM Etiology (Causes)
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-gray-700">
                    {condition.tcmCauses.map((cause: string, idx: number) => (
                      <li key={idx}>{cause}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Affected Meridians */}
              {condition.affectedMeridians && condition.affectedMeridians.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Affected Meridians</h4>
                  <div className="flex flex-wrap gap-2">
                    {condition.affectedMeridians.map((meridian: string) => (
                      <Badge key={meridian} variant="tcm">
                        {meridian}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* TCM Diagnosis */}
              {condition.tcmDiagnosis && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">TCM Diagnosis</h4>
                  <p className="text-gray-700">{condition.tcmDiagnosis}</p>
                </div>
              )}

              {/* Treatment Principles */}
              {condition.treatmentPrinciples && condition.treatmentPrinciples.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Treatment Principles</h4>
                  <ul className="list-inside list-disc space-y-1 text-gray-700">
                    {condition.treatmentPrinciples.map((principle: string, idx: number) => (
                      <li key={idx}>{principle}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatment Tab */}
        <TabsContent value="treatment" className="space-y-6">
          {/* Lifestyle Recommendations */}
          {condition.lifestyleRecommendations && condition.lifestyleRecommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lifestyle Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  {condition.lifestyleRecommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Dietary Recommendations */}
          {condition.dietaryRecommendations && (
            <Card>
              <CardHeader>
                <CardTitle>Dietary Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{condition.dietaryRecommendations}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Related Herbs */}
      {condition.relatedHerbs && condition.relatedHerbs.length > 0 && (
        <div className="mb-12">
          <h2 className="text-earth-900 mb-6 flex items-center font-serif text-2xl font-bold">
            <Leaf className="text-earth-600 mr-2 h-6 w-6" />
            Helpful Herbs
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {condition.relatedHerbs.slice(0, 6).map((herb) => (
              <HerbCard
                key={herb.id}
                herbId={herb.herbId}
                title={herb.title}
                slug={herb.slug}
                scientificName={herb.scientificName}
                description={herb.description}
                featuredImage={herb.featuredImage}
                tcmProperties={herb.tcmProperties}
                westernProperties={herb.westernProperties}
                averageRating={herb.averageRating}
                reviewCount={herb.reviewCount}
              />
            ))}
          </div>
        </div>
      )}

      {/* Related Formulas */}
      {condition.relatedFormulas && condition.relatedFormulas.length > 0 && (
        <div className="mb-12">
          <h2 className="text-earth-900 mb-6 flex items-center font-serif text-2xl font-bold">
            <Pill className="text-earth-600 mr-2 h-6 w-6" />
            Recommended Formulas
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {condition.relatedFormulas.slice(0, 6).map((formula) => (
              <FormulaCard
                key={formula.id}
                formulaId={formula.formulaId}
                title={formula.title}
                slug={formula.slug}
                chineseName={formula.chineseName}
                pinyin={formula.pinyin}
                description={formula.description}
                category={formula.category}
                tradition={formula.tradition}
                ingredientCount={formula.ingredients?.length}
                averageRating={formula.averageRating}
                reviewCount={formula.reviewCount}
              />
            ))}
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-900">
          <strong>Medical Disclaimer:</strong> This information is for educational purposes only and
          is not a substitute for professional medical advice, diagnosis, or treatment. Always
          consult your healthcare provider for medical concerns.
        </p>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: ConditionPageProps) {
  const { slug } = await params
  const { docs } = await getConditionBySlug(slug)
  const condition = docs[0] as Condition | undefined

  if (!condition) {
    return {
      title: 'Condition Not Found | Verscienta Health',
    }
  }

  return {
    title: `${condition.title} | Verscienta Health`,
    description:
      condition.description ||
      `Learn about ${condition.title}, its symptoms, causes, and natural treatment approaches.`,
  }
}
