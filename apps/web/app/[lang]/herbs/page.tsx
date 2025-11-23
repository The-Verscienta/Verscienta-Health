import { setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'
import { HerbCard } from '@/components/cards/HerbCard'
import { SearchBar } from '@/components/search/SearchBar'
import { Loading } from '@/components/ui/loading'
import { Pagination } from '@/components/ui/pagination'
import { getHerbs } from '@/lib/payload-api'

export const dynamic = 'force-dynamic'

interface HerbsPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{
    page?: string
    q?: string
  }>
}

export default async function HerbsPage({ params, searchParams }: HerbsPageProps) {
  const { lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  const { page: pageParam, q: query } = await searchParams
  const page = Number(pageParam) || 1

  const { docs: herbs, totalPages, totalDocs } = await getHerbs(page, 12, query)

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-earth-900 mb-4 font-serif text-4xl font-bold">Herbal Database</h1>
        <p className="max-w-3xl text-lg text-gray-600">
          Explore our comprehensive collection of medicinal herbs with detailed information on their
          properties, uses, and scientific research.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-2xl">
        <SearchBar
          placeholder="Search herbs by name, properties, or uses..."
          defaultValue={query}
        />
      </div>

      {/* Stats */}
      <div className="mb-8">
        <p className="text-sm text-gray-600">
          {totalDocs} {totalDocs === 1 ? 'herb' : 'herbs'} found
        </p>
      </div>

      {/* Herb Grid */}
      <Suspense fallback={<Loading />}>
        {herbs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">
              {query ? 'No herbs found matching your search.' : 'No herbs available yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {herbs.map((herb) => (
                <HerbCard
                  key={herb.id}
                  herbId={herb.herbId || ''}
                  title={herb.title}
                  slug={herb.slug || ''}
                  scientificName={herb.botanicalInfo?.scientificName}
                  description={typeof herb.description === 'object' ? undefined : herb.description}
                  featuredImage={
                    typeof herb.featuredImage === 'object' && herb.featuredImage
                      ? {
                          url: herb.featuredImage.url || '',
                          alt: herb.featuredImage.alt || undefined,
                        }
                      : undefined
                  }
                  tcmProperties={
                    herb.tcmProperties
                      ? {
                          taste: herb.tcmProperties.tcmTaste ?? undefined,
                          temperature: herb.tcmProperties.tcmTemperature ?? undefined,
                          category: herb.tcmProperties.tcmCategory ?? undefined,
                        }
                      : undefined
                  }
                  westernProperties={herb.westernProperties || undefined}
                  averageRating={herb.averageRating || undefined}
                  reviewCount={herb.reviewCount || undefined}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination currentPage={page} totalPages={totalPages} baseUrl="/herbs" />
            )}
          </>
        )}
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Herbal Database | Verscienta Health',
  description:
    'Explore our comprehensive collection of medicinal herbs with detailed information on their properties, uses, and scientific research.',
}
