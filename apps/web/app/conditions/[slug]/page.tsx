import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HerbCard } from '@/components/cards/HerbCard'
import { FormulaCard } from '@/components/cards/FormulaCard'
import { AlertCircle, Leaf, Pill, Activity, Brain } from 'lucide-react'

interface ConditionPageProps {
  params: {
    slug: string
  }
}

// This will be replaced with actual Payload CMS API call
async function getCondition(slug: string) {
  // TODO: Replace with actual Payload CMS API call
  // const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/conditions?where[slug][equals]=${slug}&depth=2`)
  // const data = await response.json()
  // if (!data.docs || data.docs.length === 0) return null
  // return data.docs[0]

  return null
}

export default async function ConditionPage({ params }: ConditionPageProps) {
  const condition = await getCondition(params.slug)

  if (!condition) {
    notFound()
  }

  const severityColors = {
    mild: 'sage',
    moderate: 'gold',
    severe: 'tcm',
  } as const

  return (
    <div className="container-custom py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold font-serif text-earth-900 mb-2">
              {condition.title}
            </h1>
            {condition.alternativeNames && condition.alternativeNames.length > 0 && (
              <p className="text-lg text-gray-600 mb-4">
                Also known as: {condition.alternativeNames.join(', ')}
              </p>
            )}
          </div>
          <span className="text-sm font-mono text-gray-500">{condition.conditionId}</span>
        </div>

        {/* Description */}
        {condition.description && (
          <p className="text-lg text-gray-700 mb-6">{condition.description}</p>
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {condition.category && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Category</h3>
              <Badge variant="default">{condition.category}</Badge>
            </div>
          )}
          {condition.severity && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Typical Severity</h3>
              <Badge variant={severityColors[condition.severity as keyof typeof severityColors] || 'default'}>
                {condition.severity}
              </Badge>
            </div>
          )}
          {condition.affectedSystems && condition.affectedSystems.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Affected Systems</h3>
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
                <AlertCircle className="mr-2 h-5 w-5 text-earth-600" />
                Common Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent>
              {condition.commonSymptoms && condition.commonSymptoms.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                  {condition.relatedSymptoms.map((symptom: any) => (
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
                <ul className="list-disc list-inside space-y-2 text-tcm-800">
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
                <Activity className="mr-2 h-5 w-5 text-earth-600" />
                Western Medical Perspective
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Causes */}
              {condition.westernCauses && condition.westernCauses.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Causes</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {condition.westernCauses.map((cause: string, idx: number) => (
                      <li key={idx}>{cause}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {condition.riskFactors && condition.riskFactors.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Risk Factors</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {condition.riskFactors.map((factor: string, idx: number) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Diagnosis */}
              {condition.diagnosis && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Diagnosis</h4>
                  <p className="text-gray-700">{condition.diagnosis}</p>
                </div>
              )}

              {/* Conventional Treatment */}
              {condition.conventionalTreatment && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
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
                <Brain className="mr-2 h-5 w-5 text-earth-600" />
                Traditional Chinese Medicine Perspective
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TCM Pattern */}
              {condition.tcmPattern && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">TCM Pattern</h4>
                  <Badge variant="tcm" className="text-base">
                    {condition.tcmPattern}
                  </Badge>
                </div>
              )}

              {/* TCM Causes */}
              {condition.tcmCauses && condition.tcmCauses.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    TCM Etiology (Causes)
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {condition.tcmCauses.map((cause: string, idx: number) => (
                      <li key={idx}>{cause}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Affected Meridians */}
              {condition.affectedMeridians && condition.affectedMeridians.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Affected Meridians</h4>
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
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">TCM Diagnosis</h4>
                  <p className="text-gray-700">{condition.tcmDiagnosis}</p>
                </div>
              )}

              {/* Treatment Principles */}
              {condition.treatmentPrinciples && condition.treatmentPrinciples.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Treatment Principles
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
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
                <ul className="list-disc list-inside space-y-2 text-gray-700">
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
          <h2 className="text-2xl font-bold font-serif text-earth-900 mb-6 flex items-center">
            <Leaf className="mr-2 h-6 w-6 text-earth-600" />
            Helpful Herbs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {condition.relatedHerbs.slice(0, 6).map((herb: any) => (
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
          <h2 className="text-2xl font-bold font-serif text-earth-900 mb-6 flex items-center">
            <Pill className="mr-2 h-6 w-6 text-earth-600" />
            Recommended Formulas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {condition.relatedFormulas.slice(0, 6).map((formula: any) => (
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          <strong>Medical Disclaimer:</strong> This information is for educational purposes only
          and is not a substitute for professional medical advice, diagnosis, or treatment.
          Always consult your healthcare provider for medical concerns.
        </p>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: ConditionPageProps) {
  const condition = await getCondition(params.slug)

  if (!condition) {
    return {
      title: 'Condition Not Found | Verscienta Health',
    }
  }

  return {
    title: `${condition.title} | Verscienta Health`,
    description: condition.description || `Learn about ${condition.title}, its symptoms, causes, and natural treatment approaches.`,
  }
}
