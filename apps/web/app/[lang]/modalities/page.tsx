import { Link } from '@/i18n/routing'
import { Suspense } from 'react'
import { SearchBar } from '@/components/search/SearchBar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { setRequestLocale } from 'next-intl/server'
import { Pagination } from '@/components/ui/pagination'
import { getModalities } from '@/lib/strapi-api'

interface ModalitiesPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{
    page?: string
    q?: string
  }>
}

interface Modality {
  id: string
  slug: string
  title: string
  origin?: string
  description?: string
  category?: string
  keyTechniques?: string[]
}

export default async function ModalitiesPage({ params, searchParams }: ModalitiesPageProps) {
  const { lang } = await params
  setRequestLocale(lang)

  const { page: pageParam, q: query } = await searchParams
  const page = Number(pageParam) || 1

  const { docs, totalPages, totalDocs } = await getModalities(page, 12)
  const modalities = docs as Modality[]

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-earth-900 mb-4 font-serif text-4xl font-bold">Healing Modalities</h1>
        <p className="max-w-3xl text-lg text-gray-600">
          Explore various holistic healing modalities from Traditional Chinese Medicine, Ayurveda,
          Western herbalism, and other complementary approaches to health and wellness.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-2xl">
        <SearchBar placeholder="Search modalities..." defaultValue={query} />
      </div>

      {/* Stats */}
      <div className="mb-8">
        <p className="text-sm text-gray-600">
          {totalDocs} {totalDocs === 1 ? 'modality' : 'modalities'} found
        </p>
      </div>

      {/* Modality Grid */}
      <Suspense fallback={<Loading />}>
        {modalities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">
              {query ? 'No modalities found matching your search.' : 'No modalities available yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {modalities.map((modality) => (
                <Link key={modality.id} href={`/modalities/${modality.slug}`}>
                  <Card className="group h-full cursor-pointer transition-all duration-200 hover:shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-earth-900 group-hover:text-earth-600 transition-colors">
                        {modality.title}
                      </CardTitle>
                      {modality.origin && <CardDescription>{modality.origin}</CardDescription>}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {modality.description && (
                        <p className="line-clamp-3 text-sm text-gray-600">{modality.description}</p>
                      )}

                      {/* Category */}
                      {modality.category && (
                        <Badge variant="sage" className="text-xs">
                          {modality.category}
                        </Badge>
                      )}

                      {/* Key Techniques */}
                      {modality.keyTechniques && modality.keyTechniques.length > 0 && (
                        <div>
                          <h4 className="mb-1 text-xs font-semibold text-gray-700">
                            Key Techniques:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {modality.keyTechniques.slice(0, 3).map((technique: string) => (
                              <Badge key={technique} variant="outline" className="text-xs">
                                {technique}
                              </Badge>
                            ))}
                            {modality.keyTechniques.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{modality.keyTechniques.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination currentPage={page} totalPages={totalPages} baseUrl="/modalities" />
            )}
          </>
        )}
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Healing Modalities | Verscienta Health',
  description:
    'Explore various holistic healing modalities including Traditional Chinese Medicine, Ayurveda, and Western herbalism.',
}
