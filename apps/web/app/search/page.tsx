'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HerbCard } from '@/components/cards/HerbCard'
import { FormulaCard } from '@/components/cards/FormulaCard'
import { ConditionCard } from '@/components/cards/ConditionCard'
import { PractitionerCard } from '@/components/cards/PractitionerCard'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchFilters } from '@/components/search/SearchFilters'
import { Loading } from '@/components/ui/loading'
import { searchMultipleIndexes } from '@/lib/algolia'
import {
  getFilterGroups,
  getSortOptions,
  applyFilters,
  applySorting,
} from '@/lib/search-filters'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [results, setResults] = useState<any>({
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

        setResults(searchResults)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [query])

  // Apply filters and sorting to results
  const filteredHerbs = applySorting(applyFilters(results.herbs || [], herbFilters), herbSort)
  const filteredFormulas = applySorting(
    applyFilters(results.formulas || [], formulaFilters),
    formulaSort
  )
  const filteredConditions = applySorting(
    applyFilters(results.conditions || [], conditionFilters),
    conditionSort
  )
  const filteredPractitioners = applySorting(
    applyFilters(results.practitioners || [], practitionerFilters),
    practitionerSort
  )

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
        <h1 className="text-4xl font-bold font-serif text-earth-900 mb-4">Search Results</h1>
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
        <div className="text-center py-12">
          <p className="text-gray-600">Enter a search term to find herbs, formulas, conditions, and practitioners.</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No results found for "{query}". Try a different search term.</p>
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
                <h2 className="text-2xl font-bold font-serif text-earth-900 mb-4">
                  Herbs ({filteredHerbs.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHerbs.slice(0, 6).map((herb: any) => (
                    <HerbCard key={herb.objectID} {...herb} herbId={herb.herbId} />
                  ))}
                </div>
                {filteredHerbs.length > 6 && (
                  <button
                    onClick={() => setActiveTab('herbs')}
                    className="mt-4 text-earth-600 hover:text-earth-700 font-medium"
                  >
                    View all {filteredHerbs.length} herbs →
                  </button>
                )}
              </div>
            )}

            {filteredFormulas.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-serif text-earth-900 mb-4">
                  Formulas ({filteredFormulas.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFormulas.slice(0, 6).map((formula: any) => (
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
                    className="mt-4 text-earth-600 hover:text-earth-700 font-medium"
                  >
                    View all {filteredFormulas.length} formulas →
                  </button>
                )}
              </div>
            )}

            {filteredConditions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-serif text-earth-900 mb-4">
                  Conditions ({filteredConditions.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredConditions.slice(0, 6).map((condition: any) => (
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
                    className="mt-4 text-earth-600 hover:text-earth-700 font-medium"
                  >
                    View all {filteredConditions.length} conditions →
                  </button>
                )}
              </div>
            )}

            {filteredPractitioners.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-serif text-earth-900 mb-4">
                  Practitioners ({filteredPractitioners.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPractitioners.slice(0, 6).map((practitioner: any) => (
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
                    className="mt-4 text-earth-600 hover:text-earth-700 font-medium"
                  >
                    View all {filteredPractitioners.length} practitioners →
                  </button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Herbs Only */}
          <TabsContent value="herbs">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredHerbs.map((herb: any) => (
                      <HerbCard key={herb.objectID} {...herb} herbId={herb.herbId} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-gray-600">
                    No herbs found matching your filters.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Formulas Only */}
          <TabsContent value="formulas">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredFormulas.map((formula: any) => (
                      <FormulaCard
                        key={formula.objectID}
                        {...formula}
                        formulaId={formula.formulaId}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-gray-600">
                    No formulas found matching your filters.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Conditions Only */}
          <TabsContent value="conditions">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredConditions.map((condition: any) => (
                      <ConditionCard
                        key={condition.objectID}
                        {...condition}
                        conditionId={condition.conditionId}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-gray-600">
                    No conditions found matching your filters.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Practitioners Only */}
          <TabsContent value="practitioners">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPractitioners.map((practitioner: any) => (
                      <PractitionerCard
                        key={practitioner.objectID}
                        {...practitioner}
                        practitionerId={practitioner.practitionerId}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-12 text-gray-600">
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
