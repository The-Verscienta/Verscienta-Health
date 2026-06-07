import { AlertTriangle, Beaker, Book, Leaf, MapPin, Star } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OptimizedHeroImage } from '@/components/ui/optimized-image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@/i18n/routing'
import type { HerbData } from '@/lib/json-ld'
import { generateBreadcrumbSchema, generateHerbSchema } from '@/lib/json-ld'
import { richTextToPlainText } from '@/lib/lexical'
import { getHerbBySlug } from '@/lib/payload-api'

export const dynamic = 'force-dynamic'

// Raw Payload shapes (generated payload-types.ts is stale; see collection config).
interface MediaRef {
  url?: string | null
  alt?: string | null
}

interface RelatedHerb {
  id: number | string
  title: string
  slug?: string | null
  botanicalInfo?: { scientificName?: string | null } | null
}

interface HerbDoc {
  id: number | string
  title: string
  slug?: string | null
  herbId?: string | null
  description?: unknown
  featuredImage?: MediaRef | number | null
  botanicalInfo?: {
    scientificName?: string | null
    family?: string | null
    genus?: string | null
    species?: string | null
    partsUsed?: string[] | null
    habitat?: string | null
  } | null
  tcmProperties?: {
    tcmTaste?: string[] | null
    tcmTemperature?: string | null
    tcmMeridians?: string[] | null
    tcmFunctions?: unknown
    tcmCategory?: string | null
  } | null
  westernProperties?: string[] | null
  activeConstituents?:
    | { name?: string | null; description?: string | null; concentration?: string | null }[]
    | null
  recommendedDosage?:
    | {
        form?: string | null
        amount?: string | null
        frequency?: string | null
        duration?: string | null
        notes?: string | null
      }[]
    | null
  preparationMethods?:
    | { method?: string | null; instructions?: unknown; duration?: string | null }[]
    | null
  safetyInfo?: {
    contraindications?: unknown
    warnings?: unknown
    sideEffects?: unknown
  } | null
  drugInteractions?:
    | { drugName?: string | null; interactionType?: string | null; description?: string | null }[]
    | null
  nativeRegion?: { region?: string | null }[] | null
  relatedHerbs?: (RelatedHerb | number)[] | null
  averageRating?: number | null
  reviewCount?: number | null
}

const isObject = <T,>(v: T | number | null | undefined): v is T =>
  typeof v === 'object' && v !== null

function mediaUrl(image: MediaRef | number | null | undefined): MediaRef | undefined {
  return image && typeof image === 'object' ? image : undefined
}

interface HerbPageProps {
  params: Promise<{
    slug: string
    lang: string
  }>
}

export default async function HerbPage({ params }: HerbPageProps) {
  const { slug, lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  const herb = (await getHerbBySlug(slug)) as unknown as HerbDoc | null

  if (!herb) {
    notFound()
  }

  const featuredImage = mediaUrl(herb.featuredImage)
  const descriptionText = richTextToPlainText(herb.description)
  const tcmFunctionsText = richTextToPlainText(herb.tcmProperties?.tcmFunctions)
  const contraindicationsText = richTextToPlainText(herb.safetyInfo?.contraindications)
  const warningsText = richTextToPlainText(herb.safetyInfo?.warnings)
  const sideEffectsText = richTextToPlainText(herb.safetyInfo?.sideEffects)

  const tcmTaste = herb.tcmProperties?.tcmTaste ?? []
  const tcmMeridians = herb.tcmProperties?.tcmMeridians ?? []
  const westernProperties = herb.westernProperties ?? []
  const partsUsed = herb.botanicalInfo?.partsUsed ?? []
  const nativeRegions = (herb.nativeRegion ?? [])
    .map((r) => r.region ?? undefined)
    .filter((r): r is string => Boolean(r))
  const activeConstituents = herb.activeConstituents ?? []
  const recommendedDosage = herb.recommendedDosage ?? []
  const preparationMethods = herb.preparationMethods ?? []
  const drugInteractions = herb.drugInteractions ?? []
  const relatedHerbs = (herb.relatedHerbs ?? []).filter(isObject<RelatedHerb>)

  // Prepare data for JSON-LD schema
  const herbData: HerbData = {
    id: herb.slug ?? String(herb.id),
    name: herb.title,
    description: descriptionText || undefined,
    image: featuredImage?.url ?? undefined,
    scientificName: herb.botanicalInfo?.scientificName ?? undefined,
    family: herb.botanicalInfo?.family ?? undefined,
    uses: tcmFunctionsText ? [tcmFunctionsText] : [],
    benefits: westernProperties,
    safetyInfo: {
      warnings: sideEffectsText ? [sideEffectsText] : undefined,
      contraindications: [
        ...(contraindicationsText ? [contraindicationsText] : []),
        ...drugInteractions.map((d) => d.description).filter((d): d is string => Boolean(d)),
      ],
    },
    rating:
      herb.averageRating && herb.reviewCount
        ? {
            value: herb.averageRating,
            count: herb.reviewCount,
          }
        : undefined,
  }

  // Breadcrumb schema
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Herbs', url: '/herbs' },
    { name: herb.title, url: `/herbs/${herb.slug}` },
  ]

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <JsonLd data={[generateHerbSchema(herbData), generateBreadcrumbSchema(breadcrumbItems)]} />

      <div className="container-custom py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Image */}
            <div className="lg:col-span-1">
              {featuredImage?.url && (
                <OptimizedHeroImage
                  src={featuredImage.url}
                  alt={featuredImage.alt || herb.title}
                  priority={true}
                  fallback="/images/herb-placeholder.jpg"
                  className="aspect-square w-full overflow-hidden rounded-lg shadow-lg"
                />
              )}
            </div>

            {/* Header Info */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h1 className="text-earth-900 mb-2 font-serif text-4xl font-bold">{herb.title}</h1>
                  {herb.botanicalInfo?.scientificName && (
                    <p className="mb-2 text-xl italic text-gray-600">
                      {herb.botanicalInfo.scientificName}
                    </p>
                  )}
                </div>
                {herb.herbId && (
                  <span className="font-mono text-sm text-gray-500">{herb.herbId}</span>
                )}
              </div>

              {/* Rating */}
              {herb.averageRating && herb.reviewCount && herb.reviewCount > 0 && (
                <div className="mb-4 flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="fill-gold-600 text-gold-600 h-5 w-5" />
                    <span className="ml-1 text-lg font-semibold">
                      {herb.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-600">({herb.reviewCount} reviews)</span>
                </div>
              )}

              {/* Description */}
              {descriptionText && (
                <p className="mb-6 whitespace-pre-line text-lg text-gray-700">{descriptionText}</p>
              )}

              {/* Quick Properties */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                {tcmTaste.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">TCM Taste</h3>
                    <div className="flex flex-wrap gap-1">
                      {tcmTaste.map((taste) => (
                        <Badge key={taste} variant="tcm">
                          {taste}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {herb.tcmProperties?.tcmTemperature && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">TCM Temperature</h3>
                    <Badge variant="tcm">{herb.tcmProperties.tcmTemperature}</Badge>
                  </div>
                )}
              </div>

              {/* Western Properties */}
              {westernProperties.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">Western Properties</h3>
                  <div className="flex flex-wrap gap-2">
                    {westernProperties.map((prop) => (
                      <Badge key={prop} variant="sage">
                        {prop}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="overview" className="mb-12">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tcm">TCM Properties</TabsTrigger>
            <TabsTrigger value="compounds">Active Compounds</TabsTrigger>
            <TabsTrigger value="usage">Usage & Dosage</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Botanical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="text-sage-600 mr-2 h-5 w-5" />
                  Botanical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {herb.botanicalInfo?.family && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-700">Family</h4>
                    <p className="text-gray-600">{herb.botanicalInfo.family}</p>
                  </div>
                )}
                {herb.botanicalInfo?.genus && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-700">Genus</h4>
                    <p className="italic text-gray-600">{herb.botanicalInfo.genus}</p>
                  </div>
                )}
                {herb.botanicalInfo?.species && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-700">Species</h4>
                    <p className="italic text-gray-600">{herb.botanicalInfo.species}</p>
                  </div>
                )}
                {partsUsed.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-700">Parts Used</h4>
                    <p className="text-gray-600">{partsUsed.join(', ')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Native Habitat */}
            {nativeRegions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="text-sage-600 mr-2 h-5 w-5" />
                    Native Habitat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {nativeRegions.map((region) => (
                      <Badge key={region} variant="default">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TCM Properties Tab */}
          <TabsContent value="tcm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Traditional Chinese Medicine Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {herb.tcmProperties?.tcmCategory && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Category</h4>
                    <Badge variant="tcm">{herb.tcmProperties.tcmCategory}</Badge>
                  </div>
                )}
                {tcmMeridians.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Meridians Entered</h4>
                    <div className="flex flex-wrap gap-2">
                      {tcmMeridians.map((meridian) => (
                        <Badge key={meridian} variant="tcm">
                          {meridian}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {tcmFunctionsText && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">TCM Functions</h4>
                    <p className="whitespace-pre-line text-gray-700">{tcmFunctionsText}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Compounds Tab */}
          <TabsContent value="compounds" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Beaker className="text-sage-600 mr-2 h-5 w-5" />
                  Active Constituents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeConstituents.length > 0 ? (
                  <div className="space-y-4">
                    {activeConstituents.map((compound, idx) => (
                      <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                        <h4 className="font-semibold text-gray-900">{compound.name}</h4>
                        {compound.concentration && (
                          <p className="text-sm text-gray-600">
                            Concentration: {compound.concentration}
                          </p>
                        )}
                        {compound.description && (
                          <p className="mt-1 text-sm text-gray-700">{compound.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No active constituent information available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage & Dosage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="text-sage-600 mr-2 h-5 w-5" />
                  Preparation & Dosage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendedDosage.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Recommended Dosage</h4>
                    <div className="space-y-2">
                      {recommendedDosage.map((dose, idx) => (
                        <div key={idx} className="text-gray-700">
                          {[dose.form, dose.amount, dose.frequency, dose.duration]
                            .filter(Boolean)
                            .join(' · ')}
                          {dose.notes && (
                            <span className="block text-sm text-gray-500">{dose.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {preparationMethods.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Preparation Methods</h4>
                    <div className="space-y-3">
                      {preparationMethods.map((prep, idx) => {
                        const instructions = richTextToPlainText(prep.instructions)
                        return (
                          <div key={idx} className="border-b border-gray-200 pb-2 last:border-0">
                            <p className="font-medium text-gray-800">
                              {prep.method}
                              {prep.duration ? ` (${prep.duration})` : ''}
                            </p>
                            {instructions && (
                              <p className="whitespace-pre-line text-sm text-gray-600">
                                {instructions}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {recommendedDosage.length === 0 && preparationMethods.length === 0 && (
                  <p className="text-gray-600">No usage or dosage information available.</p>
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
                {warningsText && (
                  <div className="bg-gold-50 border-gold-200 rounded-lg border p-4">
                    <h4 className="text-gold-800 mb-2 text-sm font-semibold">Warnings</h4>
                    <p className="text-gold-700 whitespace-pre-line">{warningsText}</p>
                  </div>
                )}
                {drugInteractions.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Drug Interactions</h4>
                    <ul className="list-inside list-disc space-y-1 text-gray-700">
                      {drugInteractions.map((item, idx) => (
                        <li key={idx}>
                          {item.drugName ? <strong>{item.drugName}: </strong> : null}
                          {item.description}
                          {item.interactionType ? ` (${item.interactionType})` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {sideEffectsText && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">
                      Possible Side Effects
                    </h4>
                    <p className="whitespace-pre-line text-gray-700">{sideEffectsText}</p>
                  </div>
                )}
                {!contraindicationsText &&
                  !warningsText &&
                  drugInteractions.length === 0 &&
                  !sideEffectsText && (
                    <p className="text-gray-600">No safety information available.</p>
                  )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Herbs */}
        {relatedHerbs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-earth-900 mb-6 font-serif text-2xl font-bold">Related Herbs</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {relatedHerbs.slice(0, 3).map((related) => (
                <Link
                  key={related.id}
                  href={`/herbs/${related.slug}`}
                  className="block rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                >
                  <h3 className="text-earth-900 font-semibold">{related.title}</h3>
                  {related.botanicalInfo?.scientificName && (
                    <p className="text-sm italic text-gray-600">
                      {related.botanicalInfo.scientificName}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Medical Disclaimer */}
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-900">
            <strong>Medical Disclaimer:</strong> This information is for educational purposes only
            and is not a substitute for professional medical advice, diagnosis, or treatment. Always
            consult your healthcare provider before using any herbal remedies.
          </p>
        </div>
      </div>
    </>
  )
}

export async function generateMetadata({ params }: HerbPageProps): Promise<Metadata> {
  const { slug, lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  // Get translations with explicit locale
  const t = await getTranslations({ locale: lang, namespace: 'herbs' })
  const metaT = await getTranslations({ locale: lang, namespace: 'metadata' })

  const herb = (await getHerbBySlug(slug)) as unknown as HerbDoc | null

  if (!herb) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    }
  }

  const featuredImage = mediaUrl(herb.featuredImage)
  const description =
    richTextToPlainText(herb.description) ||
    t('metadata.defaultDescription', { name: herb.title })

  return {
    title: `${herb.title} | ${metaT('siteName')}`,
    description,
    openGraph: {
      title: `${herb.title} | ${metaT('siteName')}`,
      description,
      images: featuredImage?.url ? [{ url: featuredImage.url }] : [],
    },
  }
}
