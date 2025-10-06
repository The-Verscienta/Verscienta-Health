import { Suspense } from 'react'
import { HerbCard } from '@/components/cards/HerbCard'
import { Pagination } from '@/components/ui/pagination'
import { Loading } from '@/components/ui/loading'
import { SearchBar } from '@/components/search/SearchBar'

interface HerbsPageProps {
  searchParams: {
    page?: string
    q?: string
  }
}

// This will be replaced with actual Payload CMS API call
async function getHerbs(page: number = 1, query?: string) {
  // TODO: Replace with actual Payload CMS API call
  // const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/herbs?page=${page}&limit=12${query ? `&where[title][contains]=${query}` : ''}`)
  // const data = await response.json()

  // Mock data for now
  return {
    docs: [],
    totalPages: 0,
    page: 1,
    totalDocs: 0,
  }
}

export default async function HerbsPage({ searchParams }: HerbsPageProps) {
  const page = Number(searchParams.page) || 1
  const query = searchParams.q

  const { docs: herbs, totalPages, totalDocs } = await getHerbs(page, query)

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif text-earth-900 mb-4">
          Herbal Database
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Explore our comprehensive collection of medicinal herbs with detailed information
          on their properties, uses, and scientific research.
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
          <div className="text-center py-12">
            <p className="text-gray-600">
              {query ? 'No herbs found matching your search.' : 'No herbs available yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {herbs.map((herb: any) => (
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
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/herbs"
              />
            )}
          </>
        )}
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Herbal Database | Verscienta Health',
  description: 'Explore our comprehensive collection of medicinal herbs with detailed information on their properties, uses, and scientific research.',
}
