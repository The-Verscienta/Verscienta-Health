import { Suspense } from 'react'
import { ConditionCard } from '@/components/cards/ConditionCard'
import { Pagination } from '@/components/ui/pagination'
import { Loading } from '@/components/ui/loading'
import { SearchBar } from '@/components/search/SearchBar'

interface ConditionsPageProps {
  searchParams: {
    page?: string
    q?: string
    category?: string
  }
}

async function getConditions(page: number = 1, query?: string, category?: string) {
  // TODO: Replace with actual Payload CMS API call
  return {
    docs: [],
    totalPages: 0,
    page: 1,
    totalDocs: 0,
  }
}

export default async function ConditionsPage({ searchParams }: ConditionsPageProps) {
  const page = Number(searchParams.page) || 1
  const query = searchParams.q
  const category = searchParams.category

  const { docs: conditions, totalPages, totalDocs } = await getConditions(page, query, category)

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif text-earth-900 mb-4">
          Health Conditions
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Explore health conditions and learn about herbal approaches to wellness.
          Each condition includes symptom information, related herbs and formulas,
          and evidence-based natural treatment options.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-2xl">
        <SearchBar
          placeholder="Search conditions by name or symptoms..."
          defaultValue={query}
        />
      </div>

      {/* Stats */}
      <div className="mb-8">
        <p className="text-sm text-gray-600">
          {totalDocs} {totalDocs === 1 ? 'condition' : 'conditions'} found
        </p>
      </div>

      {/* Condition Grid */}
      <Suspense fallback={<Loading />}>
        {conditions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {query ? 'No conditions found matching your search.' : 'No conditions available yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {conditions.map((condition: any) => (
                <ConditionCard
                  key={condition.id}
                  conditionId={condition.conditionId}
                  title={condition.title}
                  slug={condition.slug}
                  description={condition.description}
                  category={condition.category}
                  severity={condition.severity}
                  relatedHerbsCount={condition.relatedHerbs?.length}
                  relatedFormulasCount={condition.relatedFormulas?.length}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/conditions"
              />
            )}
          </>
        )}
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Health Conditions | Verscienta Health',
  description: 'Explore health conditions and learn about herbal approaches to wellness with evidence-based natural treatment options.',
}
