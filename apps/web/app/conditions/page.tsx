import { Suspense } from 'react'
import { ConditionCard } from '@/components/cards/ConditionCard'
import { SearchBar } from '@/components/search/SearchBar'
import { Loading } from '@/components/ui/loading'
import { Pagination } from '@/components/ui/pagination'

interface ConditionsPageProps {
  searchParams: {
    page?: string
    q?: string
    category?: string
  }
}

interface Condition {
  id: string
  conditionId: string
  title: string
  slug: string
  description: string
  category: string
  severity: string
  relatedHerbs?: unknown[]
  relatedFormulas?: unknown[]
}

async function getConditions(_page: number = 1, _query?: string, _category?: string) {
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
        <h1 className="text-earth-900 mb-4 font-serif text-4xl font-bold">Health Conditions</h1>
        <p className="max-w-3xl text-lg text-gray-600">
          Explore health conditions and learn about herbal approaches to wellness. Each condition
          includes symptom information, related herbs and formulas, and evidence-based natural
          treatment options.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-2xl">
        <SearchBar placeholder="Search conditions by name or symptoms..." defaultValue={query} />
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
          <div className="py-12 text-center">
            <p className="text-gray-600">
              {query ? 'No conditions found matching your search.' : 'No conditions available yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {conditions.map((condition: Condition) => (
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
              <Pagination currentPage={page} totalPages={totalPages} baseUrl="/conditions" />
            )}
          </>
        )}
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Health Conditions | Verscienta Health',
  description:
    'Explore health conditions and learn about herbal approaches to wellness with evidence-based natural treatment options.',
}
