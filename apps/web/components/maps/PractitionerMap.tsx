'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { MapPin, Star, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// Fix for default marker icons in Next.js
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
  photo?: string
  latitude: number
  longitude: number
  address: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  modalities: Array<{ name: string }>
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
      const bounds = L.latLngBounds(
        practitioners.map(p => [p.latitude, p.longitude])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [practitioners, map])

  return null
}

export function PractitionerMap({
  practitioners,
  center = [37.7749, -122.4194], // Default to San Francisco
  zoom = 12,
  className = ''
}: PractitionerMapProps) {
  const [mounted, setMounted] = useState(false)

  // Only render map on client side to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
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
        className="h-full w-full rounded-lg z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {practitioners.length > 0 && (
          <MapBoundsHandler practitioners={practitioners} />
        )}

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
                <div className="p-2 min-w-[250px]">
                  <div className="flex items-start gap-3 mb-2">
                    {practitioner.photo ? (
                      <img
                        src={practitioner.photo}
                        alt={practitioner.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-earth-200 flex items-center justify-center">
                        <span className="text-earth-700 font-semibold">
                          {practitioner.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-earth-900">
                          {practitioner.name}
                        </h3>
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
                    <div className="flex flex-wrap gap-1 mb-2">
                      {practitioner.modalities.slice(0, 3).map((modality, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {modality.name}
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
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
                      <span className="text-sm font-medium">
                        {practitioner.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({practitioner.reviewCount} {practitioner.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-2 mb-3 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
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
                    className="inline-block w-full text-center px-4 py-2 bg-earth-600 hover:bg-earth-700 text-white rounded-md text-sm font-medium transition-colors"
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
