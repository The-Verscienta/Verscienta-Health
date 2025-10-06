import { Suspense } from 'react'
import { PractitionerCard } from '@/components/cards/PractitionerCard'
import { Pagination } from '@/components/ui/pagination'
import { Loading } from '@/components/ui/loading'
import { SearchBar } from '@/components/search/SearchBar'
import { PractitionerViewToggle } from '@/components/practitioners/PractitionerViewToggle'

interface PractitionersPageProps {
  searchParams: {
    page?: string
    q?: string
    modality?: string
    location?: string
  }
}

async function getPractitioners(page: number = 1, query?: string) {
  // TODO: Replace with actual Payload CMS API call
  return {
    docs: [],
    totalPages: 0,
    page: 1,
    totalDocs: 0,
  }
}

export default async function PractitionersPage({ searchParams }: PractitionersPageProps) {
  const page = Number(searchParams.page) || 1
  const query = searchParams.q

  const { docs: practitioners, totalPages, totalDocs } = await getPractitioners(page, query)

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif text-earth-900 mb-4">
          Find a Practitioner
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Connect with qualified holistic health practitioners including herbalists,
          acupuncturists, naturopaths, and Traditional Chinese Medicine specialists.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-2xl">
        <SearchBar
          placeholder="Search by name, specialty, or location..."
          defaultValue={query}
        />
      </div>

      {/* Stats and View Toggle */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-sm text-gray-600">
          {totalDocs} {totalDocs === 1 ? 'practitioner' : 'practitioners'} found
        </p>
      </div>

      {/* Practitioner View (List or Map) */}
      <Suspense fallback={<Loading />}>
        {practitioners.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {query ? 'No practitioners found matching your search.' : 'No practitioners available yet.'}
            </p>
          </div>
        ) : (
          <PractitionerViewToggle
            practitioners={practitioners}
            currentPage={page}
            totalPages={totalPages}
          />
        )}
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Find a Practitioner | Verscienta Health',
  description: 'Connect with qualified holistic health practitioners including herbalists, acupuncturists, and Traditional Chinese Medicine specialists.',
}
