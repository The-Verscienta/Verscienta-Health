'use client'

export const dynamic = 'force-dynamic'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ConditionCard } from '@/components/cards/ConditionCard'
import { FormulaCard } from '@/components/cards/FormulaCard'
import { HerbCard } from '@/components/cards/HerbCard'
import { PractitionerCard } from '@/components/cards/PractitionerCard'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchFilters } from '@/components/search/SearchFilters'
import { Loading } from '@/components/ui/loading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { searchMultipleIndexes } from '@/lib/algolia'
import { applyFilters, applySorting, getFilterGroups, getSortOptions } from '@/lib/search-filters'

interface SearchHerb {
  objectID: string
  herbId: string
  title: string
  slug: string
  scientificName?: string
  description?: string
  featuredImage?: {
    url: string
    alt?: string
  }
  tcmProperties?: {
    taste?: string[]
    temperature?: string
    category?: string
  }
  westernProperties?: string[]
  averageRating?: number
  reviewCount?: number
  [key: string]: unknown
}

interface SearchFormula {
  objectID: string
  formulaId: string
  title: string
  slug: string
  chineseName?: string
  pinyin?: string
  description?: string
  category?: string
  tradition?: string
  ingredientCount?: number
  averageRating?: number
  reviewCount?: number
  [key: string]: unknown
}

interface SearchCondition {
  objectID: string
  conditionId: string
  title: string
  slug: string
  description?: string
  category?: string
  severity?: string
  relatedHerbsCount?: number
  relatedFormulasCount?: number
  [key: string]: unknown
}

interface SearchPractitioner {
  objectID: string
  practitionerId: string
  name: string
  slug: string
  photo?: {
    url: string
    alt?: string
  }
  title?: string
  modalities?: string[]
  address?: {
    city?: string
    state?: string
  }
  averageRating?: number
  reviewCount?: number
  verificationStatus?: 'verified' | 'pending' | 'unverified'
  [key: string]: unknown
}

interface SearchResults {
  herbs: SearchHerb[]
  formulas: SearchFormula[]
  conditions: SearchCondition[]
  practitioners: SearchPractitioner[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [results, setResults] = useState<SearchResults>({
    herbs: [],
    formulas: [],
    conditions: [],
    practitioners: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // Filter and sort state
  const [herbFilters, setHerbFilters] = useState<Record<string, string[]>>({})
  const [formulaFilters, setFormulaFilters] = useState<Record<string, string[]>>({})
  const [conditionFilters, setConditionFilters] = useState<Record<string, string[]>>({})
  const [practitionerFilters, setPractitionerFilters] = useState<Record<string, string[]>>({})

  const [herbSort, setHerbSort] = useState('relevance')
  const [formulaSort, setFormulaSort] = useState('relevance')
  const [conditionSort, setConditionSort] = useState('relevance')
  const [practitionerSort, setPractitionerSort] = useState('relevance')

  useEffect(() => {
    async function performSearch() {
      if (!query) {
        setResults({ herbs: [], formulas: [], conditions: [], practitioners: [] })
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const searchResults = await searchMultipleIndexes(query, [
          'herbs',
          'formulas',
          'conditions',
          'practitioners',
        ])

        setResults({
          herbs: (searchResults.herbs as SearchHerb[]) || [],
          formulas: (searchResults.formulas as SearchFormula[]) || [],
          conditions: (searchResults.conditions as SearchCondition[]) || [],
          practitioners: (searchResults.practitioners as SearchPractitioner[]) || [],
        })
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [query])

  // Apply filters and sorting to results
  const filteredHerbs = applySorting(
    applyFilters(results.herbs || [], herbFilters),
    herbSort
  ) as SearchHerb[]
  const filteredFormulas = applySorting(
    applyFilters(results.formulas || [], formulaFilters),
    formulaSort
  ) as SearchFormula[]
  const filteredConditions = applySorting(
    applyFilters(results.conditions || [], conditionFilters),
    conditionSort
  ) as SearchCondition[]
  const filteredPractitioners = applySorting(
    applyFilters(results.practitioners || [], practitionerFilters),
    practitionerSort
  ) as SearchPractitioner[]

  const totalResults =
    filteredHerbs.length +
    filteredFormulas.length +
    filteredConditions.length +
    filteredPractitioners.length

  // Handle filter changes
  const handleFilterChange = (
    contentType: 'herbs' | 'formulas' | 'conditions' | 'practitioners',
    filterId: string,
    values: string[]
  ) => {
    switch (contentType) {
      case 'herbs':
        setHerbFilters({ ...herbFilters, [filterId]: values })
        break
      case 'formulas':
        setFormulaFilters({ ...formulaFilters, [filterId]: values })
        break
      case 'conditions':
        setConditionFilters({ ...conditionFilters, [filterId]: values })
        break
      case 'practitioners':
        setPractitionerFilters({ ...practitionerFilters, [filterId]: values })
        break
    }
  }

  // Clear all filters
  const clearAllFilters = (contentType: 'herbs' | 'formulas' | 'conditions' | 'practitioners') => {
    switch (contentType) {
      case 'herbs':
        setHerbFilters({})
        break
      case 'formulas':
        setFormulaFilters({})
        break
      case 'conditions':
        setConditionFilters({})
        break
      case 'practitioners':
        setPractitionerFilters({})
        break
    }
  }

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-earth-900 mb-4 font-serif text-4xl font-bold">Search Results</h1>
        {query && (
          <p className="text-lg text-gray-600">
            {isLoading ? (
              'Searching...'
            ) : (
              <>
                Found {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{query}"
              </>
            )}
          </p>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-2xl">
        <SearchBar defaultValue={query} autoFocus />
      </div>

      {/* Results */}
      {isLoading ? (
        <Loading />
      ) : !query ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">
            Enter a search term to find herbs, formulas, conditions, and practitioners.
          </p>
        </div>
      ) : totalResults === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">
            No results found for "{query}". Try a different search term.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
            <TabsTrigger value="herbs">Herbs ({filteredHerbs.length})</TabsTrigger>
            <TabsTrigger value="formulas">Formulas ({filteredFormulas.length})</TabsTrigger>
            <TabsTrigger value="conditions">Conditions ({filteredConditions.length})</TabsTrigger>
            <TabsTrigger value="practitioners">
              Practitioners ({filteredPractitioners.length})
            </TabsTrigger>
          </TabsList>

          {/* All Results */}
          <TabsContent value="all" className="space-y-8">
            {filteredHerbs.length > 0 && (
              <div>
                <h2 className="text-earth-900 mb-4 font-serif text-2xl font-bold">
                  Herbs ({filteredHerbs.length})
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredHerbs.slice(0, 6).map((herb: SearchHerb) => (
                    <HerbCard key={herb.objectID} {...herb} herbId={herb.herbId} />
                  ))}
                </div>
                {filteredHerbs.length > 6 && (
                  <button
                    onClick={() => setActiveTab('herbs')}
                    className="text-earth-600 hover:text-earth-700 mt-4 font-medium"
                  >
                    View all {filteredHerbs.length} herbs →
                  </button>
                )}
              </div>
            )}

            {filteredFormulas.length > 0 && (
              <div>
                <h2 className="text-earth-900 mb-4 font-serif text-2xl font-bold">
                  Formulas ({filteredFormulas.length})
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFormulas.slice(0, 6).map((formula: SearchFormula) => (
                    <FormulaCard
                      key={formula.objectID}
                      {...formula}
                      formulaId={formula.formulaId}
                    />
                  ))}
                </div>
                {filteredFormulas.length > 6 && (
                  <button
                    onClick={() => setActiveTab('formulas')}
                    className="text-earth-600 hover:text-earth-700 mt-4 font-medium"
                  >
                    View all {filteredFormulas.length} formulas →
                  </button>
                )}
              </div>
            )}

            {filteredConditions.length > 0 && (
              <div>
                <h2 className="text-earth-900 mb-4 font-serif text-2xl font-bold">
                  Conditions ({filteredConditions.length})
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredConditions.slice(0, 6).map((condition: SearchCondition) => (
                    <ConditionCard
                      key={condition.objectID}
                      {...condition}
                      conditionId={condition.conditionId}
                    />
                  ))}
                </div>
                {filteredConditions.length > 6 && (
                  <button
                    onClick={() => setActiveTab('conditions')}
                    className="text-earth-600 hover:text-earth-700 mt-4 font-medium"
                  >
                    View all {filteredConditions.length} conditions →
                  </button>
                )}
              </div>
            )}

            {filteredPractitioners.length > 0 && (
              <div>
                <h2 className="text-earth-900 mb-4 font-serif text-2xl font-bold">
                  Practitioners ({filteredPractitioners.length})
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPractitioners.slice(0, 6).map((practitioner: SearchPractitioner) => (
                    <PractitionerCard
                      key={practitioner.objectID}
                      {...practitioner}
                      practitionerId={practitioner.practitionerId}
                    />
                  ))}
                </div>
                {filteredPractitioners.length > 6 && (
                  <button
                    onClick={() => setActiveTab('practitioners')}
                    className="text-earth-600 hover:text-earth-700 mt-4 font-medium"
                  >
                    View all {filteredPractitioners.length} practitioners →
                  </button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Herbs Only */}
          <TabsContent value="herbs">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <SearchFilters
                  filterGroups={getFilterGroups('herbs')}
                  activeFilters={herbFilters}
                  onFilterChange={(filterId, values) =>
                    handleFilterChange('herbs', filterId, values)
                  }
                  onClearAll={() => clearAllFilters('herbs')}
                  sortOptions={getSortOptions('herbs')}
                  activeSort={herbSort}
                  onSortChange={setHerbSort}
                />
              </div>

              {/* Results */}
              <div className="lg:col-span-3">
                {filteredHerbs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {filteredHerbs.map((herb: SearchHerb) => (
                      <HerbCard key={herb.objectID} {...herb} herbId={herb.herbId} />
                    ))}
                  </div>
                ) : (
                  <p className="py-12 text-center text-gray-600">
                    No herbs found matching your filters.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Formulas Only */}
          <TabsContent value="formulas">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <SearchFilters
                  filterGroups={getFilterGroups('formulas')}
                  activeFilters={formulaFilters}
                  onFilterChange={(filterId, values) =>
                    handleFilterChange('formulas', filterId, values)
                  }
                  onClearAll={() => clearAllFilters('formulas')}
                  sortOptions={getSortOptions('formulas')}
                  activeSort={formulaSort}
                  onSortChange={setFormulaSort}
                />
              </div>

              {/* Results */}
              <div className="lg:col-span-3">
                {filteredFormulas.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {filteredFormulas.map((formula: SearchFormula) => (
                      <FormulaCard
                        key={formula.objectID}
                        {...formula}
                        formulaId={formula.formulaId}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-12 text-center text-gray-600">
                    No formulas found matching your filters.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Conditions Only */}
          <TabsContent value="conditions">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <SearchFilters
                  filterGroups={getFilterGroups('conditions')}
                  activeFilters={conditionFilters}
                  onFilterChange={(filterId, values) =>
                    handleFilterChange('conditions', filterId, values)
                  }
                  onClearAll={() => clearAllFilters('conditions')}
                  sortOptions={getSortOptions('conditions')}
                  activeSort={conditionSort}
                  onSortChange={setConditionSort}
                />
              </div>

              {/* Results */}
              <div className="lg:col-span-3">
                {filteredConditions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {filteredConditions.map((condition: SearchCondition) => (
                      <ConditionCard
                        key={condition.objectID}
                        {...condition}
                        conditionId={condition.conditionId}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-12 text-center text-gray-600">
                    No conditions found matching your filters.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Practitioners Only */}
          <TabsContent value="practitioners">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <SearchFilters
                  filterGroups={getFilterGroups('practitioners')}
                  activeFilters={practitionerFilters}
                  onFilterChange={(filterId, values) =>
                    handleFilterChange('practitioners', filterId, values)
                  }
                  onClearAll={() => clearAllFilters('practitioners')}
                  sortOptions={getSortOptions('practitioners')}
                  activeSort={practitionerSort}
                  onSortChange={setPractitionerSort}
                />
              </div>

              {/* Results */}
              <div className="lg:col-span-3">
                {filteredPractitioners.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {filteredPractitioners.map((practitioner: SearchPractitioner) => (
                      <PractitionerCard
                        key={practitioner.objectID}
                        {...practitioner}
                        practitionerId={practitioner.practitionerId}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-12 text-center text-gray-600">
                    No practitioners found matching your filters.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
