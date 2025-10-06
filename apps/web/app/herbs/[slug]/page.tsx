import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, MapPin, AlertTriangle, Leaf, Beaker, Book, Heart } from 'lucide-react'

interface HerbPageProps {
  params: {
    slug: string
  }
}

// This will be replaced with actual Payload CMS API call
async function getHerb(slug: string) {
  // TODO: Replace with actual Payload CMS API call
  // const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/herbs?where[slug][equals]=${slug}`)
  // const data = await response.json()
  // if (!data.docs || data.docs.length === 0) return null
  // return data.docs[0]

  return null
}

export default async function HerbPage({ params }: HerbPageProps) {
  const herb = await getHerb(params.slug)

  if (!herb) {
    notFound()
  }

  return (
    <div className="container-custom py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-1">
            {herb.featuredImage && (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={herb.featuredImage.url}
                  alt={herb.featuredImage.alt || herb.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>

          {/* Header Info */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold font-serif text-earth-900 mb-2">
                  {herb.title}
                </h1>
                {herb.scientificName && (
                  <p className="text-xl italic text-gray-600 mb-2">{herb.scientificName}</p>
                )}
                {herb.chineseName && (
                  <p className="font-serif-sc text-lg text-tcm-600">{herb.chineseName}</p>
                )}
              </div>
              <span className="text-sm font-mono text-gray-500">{herb.herbId}</span>
            </div>

            {/* Rating */}
            {herb.averageRating && herb.reviewCount > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-gold-600 text-gold-600" />
                  <span className="ml-1 text-lg font-semibold">{herb.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-gray-600">({herb.reviewCount} reviews)</span>
              </div>
            )}

            {/* Description */}
            {herb.description && (
              <p className="text-lg text-gray-700 mb-6">{herb.description}</p>
            )}

            {/* Quick Properties */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {herb.tcmProperties?.taste && herb.tcmProperties.taste.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">TCM Taste</h3>
                  <div className="flex flex-wrap gap-1">
                    {herb.tcmProperties.taste.map((taste: string) => (
                      <Badge key={taste} variant="tcm">{taste}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {herb.tcmProperties?.temperature && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">TCM Temperature</h3>
                  <Badge variant="tcm">{herb.tcmProperties.temperature}</Badge>
                </div>
              )}
            </div>

            {/* Western Properties */}
            {herb.westernProperties && herb.westernProperties.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Western Properties</h3>
                <div className="flex flex-wrap gap-2">
                  {herb.westernProperties.map((prop: string) => (
                    <Badge key={prop} variant="sage">{prop}</Badge>
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
                <Leaf className="mr-2 h-5 w-5 text-sage-600" />
                Botanical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {herb.family && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Family</h4>
                  <p className="text-gray-600">{herb.family}</p>
                </div>
              )}
              {herb.genus && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Genus</h4>
                  <p className="text-gray-600 italic">{herb.genus}</p>
                </div>
              )}
              {herb.species && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Species</h4>
                  <p className="text-gray-600 italic">{herb.species}</p>
                </div>
              )}
              {herb.partUsed && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Part Used</h4>
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
                  <MapPin className="mr-2 h-5 w-5 text-sage-600" />
                  Native Habitat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {herb.nativeRegions.map((region: string) => (
                    <Badge key={region} variant="default">{region}</Badge>
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
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Category</h4>
                  <Badge variant="tcm">{herb.tcmProperties.category}</Badge>
                </div>
              )}
              {herb.tcmProperties?.meridians && herb.tcmProperties.meridians.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Meridians Entered</h4>
                  <div className="flex flex-wrap gap-2">
                    {herb.tcmProperties.meridians.map((meridian: string) => (
                      <Badge key={meridian} variant="tcm">{meridian}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {herb.tcmProperties?.functions && herb.tcmProperties.functions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">TCM Functions</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
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
                <Beaker className="mr-2 h-5 w-5 text-sage-600" />
                Active Constituents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {herb.activeConstituents && herb.activeConstituents.length > 0 ? (
                <div className="space-y-4">
                  {herb.activeConstituents.map((compound: any, idx: number) => (
                    <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                      <h4 className="font-semibold text-gray-900">{compound.name}</h4>
                      {compound.percentage && (
                        <p className="text-sm text-gray-600">Concentration: {compound.percentage}</p>
                      )}
                      {compound.effects && (
                        <p className="text-sm text-gray-700 mt-1">{compound.effects}</p>
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
                <Book className="mr-2 h-5 w-5 text-sage-600" />
                Preparation & Dosage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {herb.dosageInfo?.standardDosage && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Standard Dosage</h4>
                  <p className="text-gray-700">{herb.dosageInfo.standardDosage}</p>
                </div>
              )}
              {herb.preparationMethods && herb.preparationMethods.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Preparation Methods</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
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
                <AlertTriangle className="mr-2 h-5 w-5 text-tcm-600" />
                Safety Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {herb.contraindications && herb.contraindications.length > 0 && (
                <div className="bg-tcm-50 border border-tcm-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-tcm-800 mb-2">Contraindications</h4>
                  <ul className="list-disc list-inside space-y-1 text-tcm-700">
                    {herb.contraindications.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {herb.drugInteractions && herb.drugInteractions.length > 0 && (
                <div className="bg-gold-50 border border-gold-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gold-800 mb-2">Drug Interactions</h4>
                  <ul className="list-disc list-inside space-y-1 text-gold-700">
                    {herb.drugInteractions.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {herb.sideEffects && herb.sideEffects.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Possible Side Effects</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
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
          <h2 className="text-2xl font-bold font-serif text-earth-900 mb-6">Related Herbs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {herb.relatedHerbs.slice(0, 3).map((related: any) => (
              <Link
                key={related.id}
                href={`/herbs/${related.slug}`}
                className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-earth-900">{related.title}</h3>
                {related.scientificName && (
                  <p className="text-sm italic text-gray-600">{related.scientificName}</p>
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
          Always consult your healthcare provider before using any herbal remedies.
        </p>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: HerbPageProps) {
  const herb = await getHerb(params.slug)

  if (!herb) {
    return {
      title: 'Herb Not Found | Verscienta Health',
    }
  }

  return {
    title: `${herb.title} | Verscienta Health`,
    description: herb.description || `Learn about ${herb.title}, its properties, uses, and safety information.`,
  }
}
