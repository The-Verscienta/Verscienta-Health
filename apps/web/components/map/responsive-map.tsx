'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { cn } from '@/lib/utils'

// Fix Leaflet default marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface PractitionerLocation {
  id: string
  name: string
  lat: number
  lng: number
  specialty: string[]
  image?: string
  slug: string
}

interface ResponsiveMapProps {
  practitioners: PractitionerLocation[]
  center?: [number, number]
  zoom?: number
  className?: string
  height?: string
  enableClustering?: boolean
  enableGeolocation?: boolean
}

// Component to handle map responsiveness
function ResponsiveMapController({ zoom }: { zoom: number }) {
  const map = useMap()

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize()
    }

    // Add resize listener
    window.addEventListener('resize', handleResize)

    // Handle orientation change on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100)
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [map])

  // Adjust zoom on mobile devices
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      map.setZoom(Math.max(zoom - 1, 1))
    }
  }, [map, zoom])

  return null
}

// Custom marker icon for practitioners
const createCustomIcon = (color: string = '#5d7a5d') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="absolute -top-4 -left-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2" style="border-color: ${color}">
          <svg class="w-5 h-5" fill="${color}" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

export function ResponsiveMap({
  practitioners,
  center = [37.7749, -122.4194], // Default: San Francisco
  zoom = 10,
  className,
  height = 'h-[500px]',
  enableClustering = true,
  enableGeolocation = true,
}: ResponsiveMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (enableGeolocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.log('Geolocation error:', error)
        }
      )
    }
  }, [enableGeolocation])

  // Don't render map on server
  if (!isMounted) {
    return (
      <div
        className={cn('bg-earth-50 flex items-center justify-center rounded-lg', height, className)}
        aria-label="Loading map"
      >
        <div className="text-earth-600">Loading map...</div>
      </div>
    )
  }

  const mapCenter = userLocation || center

  return (
    <div className={cn('relative w-full rounded-lg overflow-hidden shadow-md', height, className)}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
        touchZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        dragging={true}
        zoomControl={true}
        attributionControl={true}
        style={{ zIndex: 0 }}
      >
        <ResponsiveMapController zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {enableClustering ? (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
          >
            {practitioners.map((practitioner) => (
              <Marker
                key={practitioner.id}
                position={[practitioner.lat, practitioner.lng]}
                icon={createCustomIcon('#5d7a5d')}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-earth-900 mb-1">{practitioner.name}</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {practitioner.specialty.slice(0, 2).map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                    <a
                      href={`/practitioners/${practitioner.slug}`}
                      className="text-sm text-earth-600 hover:text-earth-700 underline"
                    >
                      View Profile →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        ) : (
          practitioners.map((practitioner) => (
            <Marker
              key={practitioner.id}
              position={[practitioner.lat, practitioner.lng]}
              icon={createCustomIcon('#5d7a5d')}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-earth-900 mb-1">{practitioner.name}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {practitioner.specialty.slice(0, 2).map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`/practitioners/${practitioner.slug}`}
                    className="text-sm text-earth-600 hover:text-earth-700 underline"
                  >
                    View Profile →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))
        )}

        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={createCustomIcon('#c1272d')}>
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-sm">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Mobile-friendly controls hint */}
      <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-md shadow-md text-xs text-gray-600 md:hidden z-[1000]">
        Pinch to zoom • Drag to pan
      </div>
    </div>
  )
}
