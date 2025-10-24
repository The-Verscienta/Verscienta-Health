import { Suspense } from 'react'
import { HerbCard } from '@/components/cards/HerbCard'
import { SearchBar } from '@/components/search/SearchBar'
import { Loading } from '@/components/ui/loading'
import { Pagination } from '@/components/ui/pagination'
import { getHerbs } from '@/lib/strapi-api'
import { setRequestLocale } from 'next-intl/server'

interface HerbsPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{
    page?: string
    q?: string
  }>
}

interface Herb {
  id: string
  herbId: string
  title: string
  slug: string
  scientificName?: string
  description: string
  featuredImage?: { url: string; alt?: string }
  tcmProperties?: { taste?: string[]; temperature?: string; category?: string }
  westernProperties?: string[]
  averageRating?: number
  reviewCount?: number
}

export default async function HerbsPage({ params, searchParams }: HerbsPageProps) {
  const { lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  const { page: pageParam, q: query } = await searchParams
  const page = Number(pageParam) || 1

  const { docs, totalPages, totalDocs } = await getHerbs(page, 12, query)
  const herbs = docs as Herb[]

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
