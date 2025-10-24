'use client'

import L from 'leaflet'
import { CheckCircle, MapPin, Star } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Badge } from '@/components/ui/badge'

// Fix for default marker icons in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface PractitionerLocation {
  id: string
  slug: string
  name: string
  title?: string
  photo?: {
    url: string
    alt: string
  }
  latitude: number
  longitude: number
  address: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  modalities: string[]
  averageRating?: number
  reviewCount?: number
  verificationStatus?: 'verified' | 'pending' | 'unverified'
}

interface PractitionerMapProps {
  practitioners: PractitionerLocation[]
  center?: [number, number]
  zoom?: number
  className?: string
}

// Custom component to handle map bounds updates
function MapBoundsHandler({ practitioners }: { practitioners: PractitionerLocation[] }) {
  const map = useMap()

  useEffect(() => {
    if (practitioners.length > 0) {
      const bounds = L.latLngBounds(practitioners.map((p) => [p.latitude, p.longitude]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [practitioners, map])

  return null
}

export function PractitionerMap({
  practitioners,
  center = [37.7749, -122.4194], // Default to San Francisco
  zoom = 12,
  className = '',
}: PractitionerMapProps) {
  const [mounted, setMounted] = useState(false)

  // Only render map on client side to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-gray-100 ${className}`}>
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="z-0 h-full w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {practitioners.length > 0 && <MapBoundsHandler practitioners={practitioners} />}

        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}
          maxClusterRadius={80}
        >
          {practitioners.map((practitioner) => (
            <Marker
              key={practitioner.id}
              position={[practitioner.latitude, practitioner.longitude]}
            >
              <Popup>
                <div className="min-w-[250px] p-2">
                  <div className="mb-2 flex items-start gap-3">
                    {practitioner.photo ? (
                      <img
                        src={practitioner.photo?.url}
                        alt={practitioner.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-earth-200 flex h-12 w-12 items-center justify-center rounded-full">
                        <span className="text-earth-700 font-semibold">
                          {practitioner.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-earth-900 font-semibold">{practitioner.name}</h3>
                        {practitioner.verificationStatus === 'verified' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      {practitioner.title && (
                        <p className="text-sm text-gray-600">{practitioner.title}</p>
                      )}
                    </div>
                  </div>

                  {practitioner.modalities && practitioner.modalities.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {practitioner.modalities.slice(0, 3).map((modality, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {modality}
                        </Badge>
                      ))}
                      {practitioner.modalities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{practitioner.modalities.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {practitioner.averageRating && practitioner.reviewCount && (
                    <div className="mb-2 flex items-center gap-1">
                      <Star className="fill-gold-500 text-gold-500 h-4 w-4" />
                      <span className="text-sm font-medium">
                        {practitioner.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({practitioner.reviewCount}{' '}
                        {practitioner.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}

                  <div className="mb-3 flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                      {practitioner.address.street && <p>{practitioner.address.street}</p>}
                      <p>
                        {[
                          practitioner.address.city,
                          practitioner.address.state,
                          practitioner.address.postalCode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/practitioners/${practitioner.slug}`}
                    className="bg-earth-600 hover:bg-earth-700 inline-block w-full rounded-md px-4 py-2 text-center text-sm font-medium text-white transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}
