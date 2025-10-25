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
import { getHerbBySlug } from '@/lib/strapi-api'

interface Herb {
  id: string
  title: string
  herbId: string
  slug: string
  scientificName?: string
  chineseName?: string
  description?: string
  featuredImage?: {
    url: string
    alt?: string
  }
  family?: string
  genus?: string
  species?: string
  partUsed?: string
  averageRating?: number
  reviewCount?: number
  tcmProperties?: {
    taste?: string[]
    temperature?: string
    category?: string
    meridians?: string[]
    functions?: string[]
  }
  westernProperties?: string[]
  nativeRegions?: string[]
  activeConstituents?: {
    name: string
    percentage?: string
    effects?: string
  }[]
  dosageInfo?: {
    standardDosage?: string
  }
  preparationMethods?: string[]
  contraindications?: string[]
  drugInteractions?: string[]
  sideEffects?: string[]
  relatedHerbs?: {
    id: string
    title: string
    slug: string
    scientificName?: string
  }[]
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

  const { docs } = await getHerbBySlug(slug)
  const herb = docs[0] as Herb | undefined

  if (!herb) {
    notFound()
  }

  // Prepare data for JSON-LD schema
  const herbData: HerbData = {
    id: herb.slug,
    name: herb.title,
    description: herb.description,
    image: herb.featuredImage?.url,
    scientificName: herb.scientificName,
    family: herb.family,
    uses: herb.tcmProperties?.functions || [],
    benefits: herb.westernProperties || [],
    safetyInfo: {
      warnings: herb.sideEffects,
      contraindications: [...(herb.contraindications || []), ...(herb.drugInteractions || [])],
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
              {herb.featuredImage && (
                <OptimizedHeroImage
                  src={herb.featuredImage.url}
                  alt={herb.featuredImage.alt || herb.title}
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
                  <h1 className="text-earth-900 mb-2 font-serif text-4xl font-bold">
                    {herb.title}
                  </h1>
                  {herb.scientificName && (
                    <p className="mb-2 text-xl italic text-gray-600">{herb.scientificName}</p>
                  )}
                  {herb.chineseName && (
                    <p className="font-serif-sc text-tcm-600 text-lg">{herb.chineseName}</p>
                  )}
                </div>
                <span className="font-mono text-sm text-gray-500">{herb.herbId}</span>
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
              {herb.description && <p className="mb-6 text-lg text-gray-700">{herb.description}</p>}

              {/* Quick Properties */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                {herb.tcmProperties?.taste && herb.tcmProperties.taste.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">TCM Taste</h3>
                    <div className="flex flex-wrap gap-1">
                      {herb.tcmProperties.taste.map((taste: string) => (
                        <Badge key={taste} variant="tcm">
                          {taste}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {herb.tcmProperties?.temperature && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-700">TCM Temperature</h3>
                    <Badge variant="tcm">{herb.tcmProperties.temperature}</Badge>
                  </div>
                )}
              </div>

              {/* Western Properties */}
              {herb.westernProperties && herb.westernProperties.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">Western Properties</h3>
                  <div className="flex flex-wrap gap-2">
                    {herb.westernProperties.map((prop: string) => (
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
                {herb.family && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-700">Family</h4>
                    <p className="text-gray-600">{herb.family}</p>
                  </div>
                )}
                {herb.genus && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-700">Genus</h4>
                    <p className="italic text-gray-600">{herb.genus}</p>
                  </div>
                )}
                {herb.species && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-700">Species</h4>
                    <p className="italic text-gray-600">{herb.species}</p>
                  </div>
                )}
                {herb.partUsed && (
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-700">Part Used</h4>
                    <p className="text-gray-600">{herb.partUsed}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Native Habitat */}
            {herb.nativeRegions && herb.nativeRegions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="text-sage-600 mr-2 h-5 w-5" />
                    Native Habitat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {herb.nativeRegions.map((region: string) => (
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
                {herb.tcmProperties?.category && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Category</h4>
                    <Badge variant="tcm">{herb.tcmProperties.category}</Badge>
                  </div>
                )}
                {herb.tcmProperties?.meridians && herb.tcmProperties.meridians.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Meridians Entered</h4>
                    <div className="flex flex-wrap gap-2">
                      {herb.tcmProperties.meridians.map((meridian: string) => (
                        <Badge key={meridian} variant="tcm">
                          {meridian}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {herb.tcmProperties?.functions && herb.tcmProperties.functions.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">TCM Functions</h4>
                    <ul className="list-inside list-disc space-y-1 text-gray-700">
                      {herb.tcmProperties.functions.map((func: string, idx: number) => (
                        <li key={idx}>{func}</li>
                      ))}
                    </ul>
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
                {herb.activeConstituents && herb.activeConstituents.length > 0 ? (
                  <div className="space-y-4">
                    {herb.activeConstituents.map((compound, idx) => (
                      <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                        <h4 className="font-semibold text-gray-900">{compound.name}</h4>
                        {compound.percentage && (
                          <p className="text-sm text-gray-600">
                            Concentration: {compound.percentage}
                          </p>
                        )}
                        {compound.effects && (
                          <p className="mt-1 text-sm text-gray-700">{compound.effects}</p>
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
                {herb.dosageInfo?.standardDosage && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Standard Dosage</h4>
                    <p className="text-gray-700">{herb.dosageInfo.standardDosage}</p>
                  </div>
                )}
                {herb.preparationMethods && herb.preparationMethods.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">
                      Preparation Methods
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-gray-700">
                      {herb.preparationMethods.map((method: string, idx: number) => (
                        <li key={idx}>{method}</li>
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
                {herb.contraindications && herb.contraindications.length > 0 && (
                  <div className="bg-tcm-50 border-tcm-200 rounded-lg border p-4">
                    <h4 className="text-tcm-800 mb-2 text-sm font-semibold">Contraindications</h4>
                    <ul className="text-tcm-700 list-inside list-disc space-y-1">
                      {herb.contraindications.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {herb.drugInteractions && herb.drugInteractions.length > 0 && (
                  <div className="bg-gold-50 border-gold-200 rounded-lg border p-4">
                    <h4 className="text-gold-800 mb-2 text-sm font-semibold">Drug Interactions</h4>
                    <ul className="text-gold-700 list-inside list-disc space-y-1">
                      {herb.drugInteractions.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {herb.sideEffects && herb.sideEffects.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">
                      Possible Side Effects
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-gray-700">
                      {herb.sideEffects.map((effect: string, idx: number) => (
                        <li key={idx}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Herbs */}
        {herb.relatedHerbs && herb.relatedHerbs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-earth-900 mb-6 font-serif text-2xl font-bold">Related Herbs</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {herb.relatedHerbs.slice(0, 3).map((related) => (
                <Link
                  key={related.id}
                  href={`/herbs/${related.slug}`}
                  className="block rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                >
                  <h3 className="text-earth-900 font-semibold">{related.title}</h3>
                  {related.scientificName && (
                    <p className="text-sm italic text-gray-600">{related.scientificName}</p>
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

  const { docs } = await getHerbBySlug(slug)
  const herb = docs[0] as Herb | undefined

  if (!herb) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    }
  }

  return {
    title: `${herb.title} | ${metaT('siteName')}`,
    description: herb.description || t('metadata.defaultDescription', { name: herb.title }),
    openGraph: {
      title: `${herb.title} | ${metaT('siteName')}`,
      description: herb.description || t('metadata.defaultDescription', { name: herb.title }),
      images: herb.featuredImage?.url ? [{ url: herb.featuredImage.url }] : [],
    },
  }
}
