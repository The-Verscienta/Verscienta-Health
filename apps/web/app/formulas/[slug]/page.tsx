import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, AlertTriangle, Leaf, Book, Heart } from 'lucide-react'

interface Formula {
  id: string
  title: string
  formulaId: string
  slug: string
  description?: string
  tradition?: string
  chineseName?: string
  pinyin?: string
  category?: string
  ingredientCount?: number
  averageRating?: number
  reviewCount?: number
  ingredients?: {
    herbId: string
    name: string
    amount?: string
    herb?: {
      slug?: string
      title?: string
      scientificName?: string
    }
    role?: string
    quantity?: string
    unit?: string
    percentage?: number
    notes?: string
  }[]
  indications?: string[]
  actions?: string[]
  relatedConditions?: {
    id: string
    slug: string
    title: string
    description?: string
  }[]
  tcmPattern?: string
  preparationMethod?: string
  dosage?: string
  administration?: string
  modifications?: string[]
  contraindications?: string[]
  cautions?: string[]
  drugInteractions?: string[]
  traditionalSource?: string
  sourceDate?: string
  relatedFormulas?: {
    id: string
    title: string
    slug: string
    chineseName?: string
    category?: string
  }[]
}

interface FormulaPageProps {
  params: {
    slug: string
  }
}

// This will be replaced with actual Payload CMS API call
async function getFormula(_slug: string): Promise<Formula | null> {
  // TODO: Replace with actual Payload CMS API call
  // const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/formulas?where[slug][equals]=${slug}&depth=2`)
  // const data = await response.json()
  // if (!data.docs || data.docs.length === 0) return null
  // return data.docs[0]

  return null
}

export default async function FormulaPage({ params }: FormulaPageProps) {
  const formula = await getFormula(params.slug)

  if (!formula) {
    notFound()
  }

  const traditionColors = {
    tcm: 'tcm',
    ayurvedic: 'gold',
    western: 'sage',
    other: 'default',
  } as const

  return (
    <div className="container-custom py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold font-serif text-earth-900">
                {formula.title}
              </h1>
              {formula.tradition && (
                <Badge variant={traditionColors[formula.tradition as keyof typeof traditionColors]}>
                  {formula.tradition.toUpperCase()}
                </Badge>
              )}
            </div>

            {formula.chineseName && (
              <p className="font-serif-sc text-xl text-tcm-600 mb-2">{formula.chineseName}</p>
            )}
            {formula.pinyin && (
              <p className="text-lg italic text-gray-600 mb-4">{formula.pinyin}</p>
            )}
          </div>
          <span className="text-sm font-mono text-gray-500">{formula.formulaId}</span>
        </div>

        {/* Rating */}
        {formula.averageRating && formula.reviewCount && formula.reviewCount > 0 && (
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex items-center">
              <Star className="h-5 w-5 fill-gold-600 text-gold-600" />
              <span className="ml-1 text-lg font-semibold">{formula.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-600">({formula.reviewCount} reviews)</span>
          </div>
        )}

        {/* Description */}
        {formula.description && (
          <p className="text-lg text-gray-700 mb-6">{formula.description}</p>
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {formula.category && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Category</h3>
              <Badge variant="sage">{formula.category}</Badge>
            </div>
          )}
          {formula.ingredients && formula.ingredients.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Ingredients</h3>
              <p className="text-gray-900">
                {formula.ingredients.length} {formula.ingredients.length === 1 ? 'herb' : 'herbs'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="ingredients" className="mb-12">
        <TabsList>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="actions">Actions & Uses</TabsTrigger>
          <TabsTrigger value="preparation">Preparation</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
        </TabsList>

        {/* Ingredients Tab */}
        <TabsContent value="ingredients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Leaf className="mr-2 h-5 w-5 text-earth-600" />
                Formula Composition
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formula.ingredients && formula.ingredients.length > 0 ? (
                <div className="space-y-4">
                  {formula.ingredients.map((ingredient, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Link
                            href={`/herbs/${ingredient.herb?.slug || '#'}`}
                            className="text-lg font-semibold text-earth-900 hover:text-earth-600"
                          >
                            {ingredient.herb?.title || 'Unknown Herb'}
                          </Link>
                          {ingredient.herb?.scientificName && (
                            <p className="text-sm italic text-gray-600">
                              {ingredient.herb.scientificName}
                            </p>
                          )}
                        </div>
                        {ingredient.role && (
                          <Badge variant="tcm" className="ml-4">
                            {ingredient.role}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-4 text-sm text-gray-700">
                        {ingredient.quantity && ingredient.unit && (
                          <span>
                            <strong>Dosage:</strong> {ingredient.quantity} {ingredient.unit}
                          </span>
                        )}
                        {ingredient.percentage && (
                          <span>
                            <strong>Percentage:</strong> {ingredient.percentage}%
                          </span>
                        )}
                      </div>

                      {ingredient.notes && (
                        <p className="text-sm text-gray-600 mt-2">{ingredient.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No ingredient information available.</p>
              )}

              {/* TCM Roles Explanation */}
              {formula.tradition === 'tcm' && (
                <div className="mt-6 bg-earth-50 rounded-lg p-4">
                  <h4 className="font-semibold text-earth-900 mb-2">
                    Traditional Roles (Jun, Chen, Zuo, Shi)
                  </h4>
                  <ul className="text-sm text-earth-800 space-y-1">
                    <li><strong>Chief (Jun):</strong> Primary herb targeting main condition</li>
                    <li><strong>Deputy (Chen):</strong> Reinforces chief herb's action</li>
                    <li><strong>Assistant (Zuo):</strong> Treats secondary symptoms</li>
                    <li><strong>Envoy (Shi):</strong> Harmonizes formula, guides to meridians</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions & Uses Tab */}
        <TabsContent value="actions" className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-earth-600" />
                Therapeutic Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formula.actions && formula.actions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formula.actions.map((action: string, idx: number) => (
                    <Badge key={idx} variant="tcm">
                      {action}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No action information available.</p>
              )}
            </CardContent>
          </Card>

          {/* Indications */}
          <Card>
            <CardHeader>
              <CardTitle>Indications & Uses</CardTitle>
            </CardHeader>
            <CardContent>
              {formula.indications && formula.indications.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {formula.indications.map((indication: string, idx: number) => (
                    <li key={idx}>{indication}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No indication information available.</p>
              )}
            </CardContent>
          </Card>

          {/* Pattern Treated (TCM) */}
          {formula.tcmPattern && (
            <Card>
              <CardHeader>
                <CardTitle>TCM Pattern Treated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{formula.tcmPattern}</p>
              </CardContent>
            </Card>
          )}

          {/* Related Conditions */}
          {formula.relatedConditions && formula.relatedConditions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formula.relatedConditions.map((condition) => (
                    <Link
                      key={condition.id}
                      href={`/conditions/${condition.slug}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-semibold text-earth-900">{condition.title}</h4>
                      {condition.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {condition.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Preparation Tab */}
        <TabsContent value="preparation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5 text-earth-600" />
                Preparation & Dosage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preparation Method */}
              {formula.preparationMethod && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Preparation Method</h4>
                  <p className="text-gray-700">{formula.preparationMethod}</p>
                </div>
              )}

              {/* Dosage */}
              {formula.dosage && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Standard Dosage</h4>
                  <p className="text-gray-700">{formula.dosage}</p>
                </div>
              )}

              {/* Administration */}
              {formula.administration && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Administration</h4>
                  <p className="text-gray-700">{formula.administration}</p>
                </div>
              )}

              {/* Modifications */}
              {formula.modifications && formula.modifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Common Modifications
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {formula.modifications.map((mod: string, idx: number) => (
                      <li key={idx}>{mod}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety Tab */}
        <TabsContent value="safety" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-tcm-600" />
                Safety Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contraindications */}
              {formula.contraindications && formula.contraindications.length > 0 && (
                <div className="bg-tcm-50 border border-tcm-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-tcm-800 mb-2">Contraindications</h4>
                  <ul className="list-disc list-inside space-y-1 text-tcm-700">
                    {formula.contraindications.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cautions */}
              {formula.cautions && formula.cautions.length > 0 && (
                <div className="bg-gold-50 border border-gold-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gold-800 mb-2">Cautions</h4>
                  <ul className="list-disc list-inside space-y-1 text-gold-700">
                    {formula.cautions.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Drug Interactions */}
              {formula.drugInteractions && formula.drugInteractions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Drug Interactions</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {formula.drugInteractions.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Traditional Source */}
      {formula.traditionalSource && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Traditional Source</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{formula.traditionalSource}</p>
            {formula.sourceDate && (
              <p className="text-sm text-gray-500 mt-2">Date: {formula.sourceDate}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Related Formulas */}
      {formula.relatedFormulas && formula.relatedFormulas.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-serif text-earth-900 mb-6">Similar Formulas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formula.relatedFormulas.slice(0, 3).map((related) => (
              <Link
                key={related.id}
                href={`/formulas/${related.slug}`}
                className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-earth-900">{related.title}</h3>
                {related.chineseName && (
                  <p className="text-sm font-serif-sc text-tcm-600 mt-1">{related.chineseName}</p>
                )}
                {related.category && (
                  <Badge variant="sage" className="mt-2 text-xs">
                    {related.category}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          <strong>Medical Disclaimer:</strong> This information is for educational purposes only
          and is not a substitute for professional medical advice, diagnosis, or treatment.
          Always consult your healthcare provider before using any herbal formulas.
        </p>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: FormulaPageProps) {
  const formula = await getFormula(params.slug)

  if (!formula) {
    return {
      title: 'Formula Not Found | Verscienta Health',
    }
  }

  return {
    title: `${formula.title} | Verscienta Health`,
    description: formula.description || `Learn about ${formula.title}, its ingredients, uses, and preparation.`,
  }
}
