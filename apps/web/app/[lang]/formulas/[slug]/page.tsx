import { AlertTriangle, Book, Heart, Leaf, Star } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@/i18n/routing'
import { type FormulaData, generateBreadcrumbSchema, generateFormulaSchema } from '@/lib/json-ld'
import { getFormulaBySlug } from '@/lib/strapi-api'

export const dynamic = 'force-dynamic'
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
  params: Promise<{
    slug: string
    lang: string
  }>
}

export default async function FormulaPage({ params }: FormulaPageProps) {
  const { slug, lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  const { docs } = await getFormulaBySlug(slug)
  const formula = docs[0] as Formula | undefined

  if (!formula) {
    notFound()
  }

  const traditionColors = {
    tcm: 'tcm',
    ayurvedic: 'gold',
    western: 'sage',
    other: 'default',
  } as const

  // Prepare JSON-LD structured data
  const formulaData: FormulaData = {
    name: formula.title,
    description: formula.description,
    id: formula.slug,
    ingredients: formula.ingredients?.map((ing) => ({
      name: ing.herb?.title || ing.name || 'Unknown Herb',
      amount: ing.quantity && ing.unit ? `${ing.quantity} ${ing.unit}` : undefined,
    })),
    uses: formula.indications,
    dosage: formula.dosage,
    rating:
      formula.averageRating && formula.reviewCount
        ? {
            value: formula.averageRating,
            count: formula.reviewCount,
          }
        : undefined,
  }

  // Breadcrumb schema
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Formulas', url: '/formulas' },
    { name: formula.title, url: `/formulas/${formula.slug}` },
  ]

  return (
    <div className="container-custom py-12">
      {/* JSON-LD Schema for SEO */}
      <JsonLd data={[generateFormulaSchema(formulaData), generateBreadcrumbSchema(breadcrumbItems)]} />

      {/* Hero Section */}
      <div className="mb-12">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-earth-900 font-serif text-4xl font-bold">{formula.title}</h1>
              {formula.tradition && (
                <Badge variant={traditionColors[formula.tradition as keyof typeof traditionColors]}>
                  {formula.tradition.toUpperCase()}
                </Badge>
              )}
            </div>

            {formula.chineseName && (
              <p className="font-serif-sc text-tcm-600 mb-2 text-xl">{formula.chineseName}</p>
            )}
            {formula.pinyin && (
              <p className="mb-4 text-lg italic text-gray-600">{formula.pinyin}</p>
            )}
          </div>
          <span className="font-mono text-sm text-gray-500">{formula.formulaId}</span>
        </div>

        {/* Rating */}
        {formula.averageRating && formula.reviewCount && formula.reviewCount > 0 && (
          <div className="mb-6 flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="fill-gold-600 text-gold-600 h-5 w-5" />
              <span className="ml-1 text-lg font-semibold">{formula.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-600">({formula.reviewCount} reviews)</span>
          </div>
        )}

        {/* Description */}
        {formula.description && <p className="mb-6 text-lg text-gray-700">{formula.description}</p>}

        {/* Quick Info */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {formula.category && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-700">Category</h3>
              <Badge variant="sage">{formula.category}</Badge>
            </div>
          )}
          {formula.ingredients && formula.ingredients.length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-700">Ingredients</h3>
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
                <Leaf className="text-earth-600 mr-2 h-5 w-5" />
                Formula Composition
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formula.ingredients && formula.ingredients.length > 0 ? (
                <div className="space-y-4">
                  {formula.ingredients.map((ingredient, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/herbs/${ingredient.herb?.slug || '#'}`}
                            className="text-earth-900 hover:text-earth-600 text-lg font-semibold"
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
                        <p className="mt-2 text-sm text-gray-600">{ingredient.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No ingredient information available.</p>
              )}

              {/* TCM Roles Explanation */}
              {formula.tradition === 'tcm' && (
                <div className="bg-earth-50 mt-6 rounded-lg p-4">
                  <h4 className="text-earth-900 mb-2 font-semibold">
                    Traditional Roles (Jun, Chen, Zuo, Shi)
                  </h4>
                  <ul className="text-earth-800 space-y-1 text-sm">
                    <li>
                      <strong>Chief (Jun):</strong> Primary herb targeting main condition
                    </li>
                    <li>
                      <strong>Deputy (Chen):</strong> Reinforces chief herb's action
                    </li>
                    <li>
                      <strong>Assistant (Zuo):</strong> Treats secondary symptoms
                    </li>
                    <li>
                      <strong>Envoy (Shi):</strong> Harmonizes formula, guides to meridians
                    </li>
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
                <Heart className="text-earth-600 mr-2 h-5 w-5" />
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
                <ul className="list-inside list-disc space-y-2 text-gray-700">
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {formula.relatedConditions.map((condition) => (
                    <Link
                      key={condition.id}
                      href={`/conditions/${condition.slug}`}
                      className="block rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                    >
                      <h4 className="text-earth-900 font-semibold">{condition.title}</h4>
                      {condition.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
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
                <Book className="text-earth-600 mr-2 h-5 w-5" />
                Preparation & Dosage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preparation Method */}
              {formula.preparationMethod && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Preparation Method</h4>
                  <p className="text-gray-700">{formula.preparationMethod}</p>
                </div>
              )}

              {/* Dosage */}
              {formula.dosage && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Standard Dosage</h4>
                  <p className="text-gray-700">{formula.dosage}</p>
                </div>
              )}

              {/* Administration */}
              {formula.administration && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Administration</h4>
                  <p className="text-gray-700">{formula.administration}</p>
                </div>
              )}

              {/* Modifications */}
              {formula.modifications && formula.modifications.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Common Modifications</h4>
                  <ul className="list-inside list-disc space-y-1 text-gray-700">
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
                <AlertTriangle className="text-tcm-600 mr-2 h-5 w-5" />
                Safety Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contraindications */}
              {formula.contraindications && formula.contraindications.length > 0 && (
                <div className="bg-tcm-50 border-tcm-200 rounded-lg border p-4">
                  <h4 className="text-tcm-800 mb-2 text-sm font-semibold">Contraindications</h4>
                  <ul className="text-tcm-700 list-inside list-disc space-y-1">
                    {formula.contraindications.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cautions */}
              {formula.cautions && formula.cautions.length > 0 && (
                <div className="bg-gold-50 border-gold-200 rounded-lg border p-4">
                  <h4 className="text-gold-800 mb-2 text-sm font-semibold">Cautions</h4>
                  <ul className="text-gold-700 list-inside list-disc space-y-1">
                    {formula.cautions.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Drug Interactions */}
              {formula.drugInteractions && formula.drugInteractions.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Drug Interactions</h4>
                  <ul className="list-inside list-disc space-y-1 text-gray-700">
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
              <p className="mt-2 text-sm text-gray-500">Date: {formula.sourceDate}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Related Formulas */}
      {formula.relatedFormulas && formula.relatedFormulas.length > 0 && (
        <div className="mb-12">
          <h2 className="text-earth-900 mb-6 font-serif text-2xl font-bold">Similar Formulas</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {formula.relatedFormulas.slice(0, 3).map((related) => (
              <Link
                key={related.id}
                href={`/formulas/${related.slug}`}
                className="block rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
              >
                <h3 className="text-earth-900 font-semibold">{related.title}</h3>
                {related.chineseName && (
                  <p className="font-serif-sc text-tcm-600 mt-1 text-sm">{related.chineseName}</p>
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
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-900">
          <strong>Medical Disclaimer:</strong> This information is for educational purposes only and
          is not a substitute for professional medical advice, diagnosis, or treatment. Always
          consult your healthcare provider before using any herbal formulas.
        </p>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: FormulaPageProps): Promise<Metadata> {
  const { slug, lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  // Get translations with explicit locale
  const t = await getTranslations({ locale: lang, namespace: 'formulas' })
  const metaT = await getTranslations({ locale: lang, namespace: 'metadata' })

  const { docs } = await getFormulaBySlug(slug)
  const formula = docs[0] as Formula | undefined

  if (!formula) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    }
  }

  return {
    title: `${formula.title} | ${metaT('siteName')}`,
    description: formula.description || t('metadata.defaultDescription', { name: formula.title }),
    openGraph: {
      title: `${formula.title} | ${metaT('siteName')}`,
      description: formula.description || t('metadata.defaultDescription', { name: formula.title }),
    },
  }
}
