import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { Loading } from '@/components/ui/loading'
import { SearchBar } from '@/components/search/SearchBar'

interface ModalitiesPageProps {
  searchParams: {
    page?: string
    q?: string
  }
}

async function getModalities(page: number = 1, query?: string) {
  // TODO: Replace with actual Payload CMS API call
  return {
    docs: [],
    totalPages: 0,
    page: 1,
    totalDocs: 0,
  }
}

export default async function ModalitiesPage({ searchParams }: ModalitiesPageProps) {
  const page = Number(searchParams.page) || 1
  const query = searchParams.q

  const { docs: modalities, totalPages, totalDocs } = await getModalities(page, query)

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif text-earth-900 mb-4">
          Healing Modalities
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Explore various holistic healing modalities from Traditional Chinese Medicine,
          Ayurveda, Western herbalism, and other complementary approaches to health and wellness.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-2xl">
        <SearchBar
          placeholder="Search modalities..."
          defaultValue={query}
        />
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
          <div className="text-center py-12">
            <p className="text-gray-600">
              {query ? 'No modalities found matching your search.' : 'No modalities available yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {modalities.map((modality: any) => (
                <Link key={modality.id} href={`/modalities/${modality.slug}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-200 cursor-pointer group">
                    <CardHeader>
                      <CardTitle className="text-earth-900 group-hover:text-earth-600 transition-colors">
                        {modality.title}
                      </CardTitle>
                      {modality.origin && (
                        <CardDescription>{modality.origin}</CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {modality.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">{modality.description}</p>
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
                          <h4 className="text-xs font-semibold text-gray-700 mb-1">
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
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/modalities"
              />
            )}
          </>
        )}
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Healing Modalities | Verscienta Health',
  description: 'Explore various holistic healing modalities including Traditional Chinese Medicine, Ayurveda, and Western herbalism.',
}
