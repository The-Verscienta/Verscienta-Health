'use client'

import { List, Map as MapIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { PractitionerCard } from '@/components/cards/PractitionerCard'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'

// Lazy load the heavy map component with Leaflet libraries
// This saves ~150KB+ on initial page load
const PractitionerMap = dynamic(
  () => import('@/components/maps/PractitionerMap').then((mod) => ({ default: mod.PractitionerMap })),
  {
    loading: () => (
      <div className="flex h-[600px] items-center justify-center rounded-lg bg-gray-100">
        <div className="text-center">
          <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-earth-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for map component (Leaflet requires window)
  }
)

type PractitionerLocation = Practitioner & {
  latitude: number
  longitude: number
}

interface Practitioner {
  id: string
  practitionerId: string
  name: string
  slug: string
  photo?: {
    url: string
    alt: string
  }
  title?: string
  modalities: string[]
  address: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  latitude?: number
  longitude?: number
  averageRating?: number
  reviewCount?: number
  verificationStatus?: 'verified' | 'pending' | 'unverified'
}

interface PractitionerViewToggleProps {
  practitioners: Practitioner[]
  currentPage: number
  totalPages: number
}

type ViewMode = 'list' | 'map'

export function PractitionerViewToggle({
  practitioners,
  currentPage,
  totalPages,
}: PractitionerViewToggleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // Filter practitioners that have valid coordinates for map view
  const practitionersWithCoords = practitioners.filter(
    (p) => p.latitude != null && p.longitude != null
  )

  return (
    <>
      {/* View Toggle Buttons */}
      <div className="mb-6 flex justify-end gap-2">
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('list')}
          className="gap-2"
        >
          <List className="h-4 w-4" />
          List View
        </Button>
        <Button
          variant={viewMode === 'map' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('map')}
          className="gap-2"
          disabled={practitionersWithCoords.length === 0}
        >
          <MapIcon className="h-4 w-4" />
          Map View
          {practitionersWithCoords.length === 0 && <span className="text-xs">(No locations)</span>}
        </Button>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <>
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {practitioners.map((practitioner) => (
              <PractitionerCard
                key={practitioner.id}
                practitionerId={practitioner.practitionerId}
                name={practitioner.name}
                slug={practitioner.slug}
                photo={practitioner.photo}
                title={practitioner.title}
                modalities={practitioner.modalities}
                address={practitioner.address}
                averageRating={practitioner.averageRating}
                reviewCount={practitioner.reviewCount}
                verificationStatus={practitioner.verificationStatus}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/practitioners"
            />
          )}
        </>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="mb-12">
          {practitionersWithCoords.length > 0 ? (
            <>
              <PractitionerMap
                practitioners={practitionersWithCoords as PractitionerLocation[]}
                className="h-[600px]"
              />
              <p className="mt-4 text-center text-sm text-gray-600">
                Showing {practitionersWithCoords.length} of {practitioners.length} practitioners on
                map
                {practitionersWithCoords.length < practitioners.length && (
                  <span className="ml-1">
                    ({practitioners.length - practitionersWithCoords.length} without location data)
                  </span>
                )}
              </p>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-600">
                No practitioners with location data available for map view.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  )
}
