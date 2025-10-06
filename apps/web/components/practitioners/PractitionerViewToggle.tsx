'use client'

import { useState } from 'react'
import { PractitionerCard } from '@/components/cards/PractitionerCard'
import { PractitionerMap } from '@/components/maps/PractitionerMap'
import { Pagination } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { List, Map as MapIcon } from 'lucide-react'

interface Practitioner {
  id: string
  practitionerId: string
  name: string
  slug: string
  photo?: string
  title?: string
  modalities: Array<{ name: string }>
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
      <div className="flex justify-end mb-6 gap-2">
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
          {practitionersWithCoords.length === 0 && (
            <span className="text-xs">(No locations)</span>
          )}
        </Button>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
                practitioners={practitionersWithCoords as any}
                className="h-[600px]"
              />
              <p className="text-sm text-gray-600 mt-4 text-center">
                Showing {practitionersWithCoords.length} of {practitioners.length} practitioners on map
                {practitionersWithCoords.length < practitioners.length && (
                  <span className="ml-1">
                    ({practitioners.length - practitionersWithCoords.length} without location data)
                  </span>
                )}
              </p>
            </>
          ) : (
            <div className="text-center py-12">
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
