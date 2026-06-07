import { AlertTriangle, Book, Heart, Leaf } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@/i18n/routing'
import { type FormulaData, generateBreadcrumbSchema, generateFormulaSchema } from '@/lib/json-ld'
import { richTextToPlainText } from '@/lib/lexical'
import { getFormulaBySlug } from '@/lib/payload-api'

export const dynamic = 'force-dynamic'

// Raw Payload shapes (generated payload-types.ts is stale; see collection config).
interface HerbRefLite {
  id?: number | string
  title?: string | null
  slug?: string | null
  botanicalInfo?: { scientificName?: string | null } | null
}

interface IngredientItem {
  herb?: HerbRefLite | number | null
  quantity?: number | null
  unit?: string | null
  percentage?: number | null
  role?: string | null
}

interface ConditionRef {
  id: number | string
  title: string
  slug?: string | null
}

interface FormulaDoc {
  id: number | string
  title: string
  slug?: string | null
  description?: unknown
  ingredients?: IngredientItem[] | null
  preparationInstructions?: unknown
  dosage?: unknown
  useCases?: { useCase?: string | null }[] | null
  relatedConditions?: (ConditionRef | number)[] | null
  tradition?: string | null
  category?: string | null
  historicalText?: string | null
  contraindications?: unknown
  sideEffects?: unknown
}

const isObject = <T,>(v: T | number | null | undefined): v is T =>
  typeof v === 'object' && v !== null

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

  const formula = (await getFormulaBySlug(slug)) as unknown as FormulaDoc | null

  if (!formula) {
    notFound()
  }

  const traditionColors: Record<string, 'tcm' | 'gold' | 'sage' | 'default'> = {
    tcm: 'tcm',
    ayurveda: 'gold',
    western: 'sage',
    native_american: 'default',
    modern: 'default',
    other: 'default',
  }

  const descriptionText = richTextToPlainText(formula.description)
  const dosageText = richTextToPlainText(formula.dosage)
  const preparationText = richTextToPlainText(formula.preparationInstructions)
  const contraindicationsText = richTextToPlainText(formula.contraindications)
  const sideEffectsText = richTextToPlainText(formula.sideEffects)
  const ingredients = (formula.ingredients ?? []).map((ing) => ({
    ...ing,
    herb: isObject<HerbRefLite>(ing.herb) ? ing.herb : undefined,
  }))
  const useCases = (formula.useCases ?? [])
    .map((u) => u.useCase ?? undefined)
    .filter((u): u is string => Boolean(u))
  const relatedConditions = (formula.relatedConditions ?? []).filter(isObject<ConditionRef>)

  // Prepare JSON-LD structured data
  const formulaData: FormulaData = {
    name: formula.title,
    description: descriptionText || undefined,
    id: formula.slug ?? String(formula.id),
    ingredients: ingredients.map((ing) => ({
      name: ing.herb?.title || 'Unknown Herb',
      amount: ing.quantity && ing.unit ? `${ing.quantity} ${ing.unit}` : undefined,
    })),
    uses: useCases,
    dosage: dosageText || undefined,
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
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-earth-900 font-serif text-4xl font-bold">{formula.title}</h1>
            {formula.tradition && (
              <Badge variant={traditionColors[formula.tradition] || 'default'}>
                {formula.tradition.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        {descriptionText && (
          <p className="mb-6 whitespace-pre-line text-lg text-gray-700">{descriptionText}</p>
        )}

        {/* Quick Info */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {formula.category && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-700">Category</h3>
              <Badge variant="sage">{formula.category}</Badge>
            </div>
          )}
          {ingredients.length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-700">Ingredients</h3>
              <p className="text-gray-900">
                {ingredients.length} {ingredients.length === 1 ? 'herb' : 'herbs'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="ingredients" className="mb-12">
        <TabsList>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="uses">Uses</TabsTrigger>
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
              {ingredients.length > 0 ? (
                <div className="space-y-4">
                  {ingredients.map((ingredient, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/herbs/${ingredient.herb?.slug || '#'}`}
                            className="text-earth-900 hover:text-earth-600 text-lg font-semibold"
                          >
                            {ingredient.herb?.title || 'Unknown Herb'}
                          </Link>
                          {ingredient.herb?.botanicalInfo?.scientificName && (
                            <p className="text-sm italic text-gray-600">
                              {ingredient.herb.botanicalInfo.scientificName}
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

        {/* Uses Tab */}
        <TabsContent value="uses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="text-earth-600 mr-2 h-5 w-5" />
                Indications & Uses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {useCases.length > 0 ? (
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  {useCases.map((useCase, idx) => (
                    <li key={idx}>{useCase}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No use-case information available.</p>
              )}
            </CardContent>
          </Card>

          {/* Related Conditions */}
          {relatedConditions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {relatedConditions.map((condition) => (
                    <Link
                      key={condition.id}
                      href={`/conditions/${condition.slug}`}
                      className="block rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                    >
                      <h4 className="text-earth-900 font-semibold">{condition.title}</h4>
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
              {preparationText && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">
                    Preparation Instructions
                  </h4>
                  <p className="whitespace-pre-line text-gray-700">{preparationText}</p>
                </div>
              )}

              {dosageText && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Dosage</h4>
                  <p className="whitespace-pre-line text-gray-700">{dosageText}</p>
                </div>
              )}

              {!preparationText && !dosageText && (
                <p className="text-gray-600">No preparation information available.</p>
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
              {contraindicationsText && (
                <div className="bg-tcm-50 border-tcm-200 rounded-lg border p-4">
                  <h4 className="text-tcm-800 mb-2 text-sm font-semibold">Contraindications</h4>
                  <p className="text-tcm-700 whitespace-pre-line">{contraindicationsText}</p>
                </div>
              )}

              {sideEffectsText && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Side Effects</h4>
                  <p className="whitespace-pre-line text-gray-700">{sideEffectsText}</p>
                </div>
              )}

              {!contraindicationsText && !sideEffectsText && (
                <p className="text-gray-600">No safety information available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Traditional Source */}
      {formula.historicalText && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Traditional Source</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-gray-700">{formula.historicalText}</p>
          </CardContent>
        </Card>
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

  const formula = (await getFormulaBySlug(slug)) as unknown as FormulaDoc | null

  if (!formula) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    }
  }

  const description =
    richTextToPlainText(formula.description) ||
    t('metadata.defaultDescription', { name: formula.title })

  return {
    title: `${formula.title} | ${metaT('siteName')}`,
    description,
    openGraph: {
      title: `${formula.title} | ${metaT('siteName')}`,
      description,
    },
  }
}
