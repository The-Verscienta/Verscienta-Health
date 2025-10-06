import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OptimizedAvatar } from '@/components/ui/optimized-image'
import { MapPin, Star, CheckCircle } from 'lucide-react'

interface PractitionerCardProps {
  practitionerId: string
  name: string
  slug: string
  photo?: {
    url: string
    alt: string
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
}

export function PractitionerCard({
  practitionerId,
  name,
  slug,
  photo,
  title,
  modalities,
  address,
  averageRating,
  reviewCount,
  verificationStatus,
}: PractitionerCardProps) {
  return (
    <Link href={`/practitioners/${slug}`}>
      <Card className="group h-full transition-all hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start space-x-4">
            {/* Photo */}
            {photo ? (
              <OptimizedAvatar
                src={photo.url}
                alt={photo.alt || name}
                size={64}
                fallback="/images/practitioner-placeholder.jpg"
                className="flex-shrink-0"
              />
            ) : (
              <div className="h-16 w-16 flex-shrink-0 rounded-full bg-earth-100 flex items-center justify-center text-xl font-semibold text-earth-600">
                {name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}

            {/* Name and title */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg font-serif text-earth-900 group-hover:text-earth-700">
                  {name}
                </CardTitle>
                {verificationStatus === 'verified' && (
                  <CheckCircle className="h-4 w-4 text-green-600" aria-label="Verified" />
                )}
              </div>
              {title && <p className="mt-1 text-sm text-gray-600">{title}</p>}

              {/* Rating */}
              {averageRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
                <div className="mt-1 flex items-center space-x-1 text-sm">
                  <Star className="h-3 w-3 fill-gold-600 text-gold-600" />
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-500">({reviewCount})</span>
                </div>
              )}
            </div>

            <span className="text-xs font-mono text-gray-500">{practitionerId}</span>
          </div>
        </CardHeader>

        <CardContent>
          {/* Modalities */}
          {modalities && modalities.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {modalities.slice(0, 3).map((modality) => (
                <Badge key={modality} variant="sage" className="text-xs">
                  {modality}
                </Badge>
              ))}
              {modalities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{modalities.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Location */}
          {address && (address.city || address.state) && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <MapPin className="h-3 w-3" />
              <span>
                {address.city}
                {address.city && address.state && ', '}
                {address.state}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
