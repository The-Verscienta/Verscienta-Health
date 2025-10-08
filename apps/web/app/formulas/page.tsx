import { Suspense } from 'react'
import { FormulaCard } from '@/components/cards/FormulaCard'
import { SearchBar } from '@/components/search/SearchBar'
import { Loading } from '@/components/ui/loading'
import { Pagination } from '@/components/ui/pagination'
import { getFormulas } from '@/lib/payload-api'

interface FormulasPageProps {
  searchParams: {
    page?: string
    q?: string
    tradition?: string
  }
}

interface Formula {
  id: string
  formulaId: string
  title: string
  slug: string
  chineseName?: string
  pinyin?: string
  description: string
  category: string
  tradition: string
  ingredients?: unknown[]
  averageRating?: number
  reviewCount?: number
}

export default async function FormulasPage({ searchParams }: FormulasPageProps) {
  const page = Number(searchParams.page) || 1
  const query = searchParams.q
  // Note: tradition filtering can be added to the API client if needed

  const { docs, totalPages, totalDocs } = await getFormulas(page, 12, query)
  const formulas = docs as Formula[]

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-earth-900 mb-4 font-serif text-4xl font-bold">Herbal Formulas</h1>
        <p className="max-w-3xl text-lg text-gray-600">
          Discover time-tested herbal formulas from Traditional Chinese Medicine, Ayurveda, and
          Western herbalism. Each formula includes detailed ingredient information, traditional
          uses, and modern applications.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-2xl">
        <SearchBar
          placeholder="Search formulas by name, ingredients, or actions..."
          defaultValue={query}
        />
      </div>

      {/* Stats */}
      <div className="mb-8">
        <p className="text-sm text-gray-600">
          {totalDocs} {totalDocs === 1 ? 'formula' : 'formulas'} found
        </p>
      </div>

      {/* Formula Grid */}
      <Suspense fallback={<Loading />}>
        {formulas.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">
              {query ? 'No formulas found matching your search.' : 'No formulas available yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {formulas.map((formula) => (
                <FormulaCard
                  key={formula.id}
                  formulaId={formula.formulaId}
                  title={formula.title}
                  slug={formula.slug}
                  chineseName={formula.chineseName}
                  pinyin={formula.pinyin}
                  description={formula.description}
                  category={formula.category}
                  tradition={formula.tradition}
                  ingredientCount={formula.ingredients?.length}
                  averageRating={formula.averageRating}
                  reviewCount={formula.reviewCount}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination currentPage={page} totalPages={totalPages} baseUrl="/formulas" />
            )}
          </>
        )}
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Herbal Formulas | Verscienta Health',
  description:
    'Discover time-tested herbal formulas from Traditional Chinese Medicine, Ayurveda, and Western herbalism.',
}
