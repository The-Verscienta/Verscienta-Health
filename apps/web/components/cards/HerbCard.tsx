import { Leaf, Star } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OptimizedCardImage } from '@/components/ui/optimized-image'

interface HerbCardProps {
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
}

export function HerbCard({
  herbId,
  title,
  slug,
  scientificName,
  description,
  featuredImage,
  tcmProperties,
  westernProperties,
  averageRating,
  reviewCount,
}: HerbCardProps) {
  return (
    <Link href={`/herbs/${slug}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
        {/* Featured Image */}
        {featuredImage ? (
          <div className="bg-earth-50 relative aspect-video w-full overflow-hidden">
            <OptimizedCardImage
              src={featuredImage.url}
              alt={featuredImage.alt || title}
              fallback="/images/herb-placeholder.jpg"
              className="transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="bg-earth-50 relative flex aspect-video w-full items-center justify-center overflow-hidden">
            <Leaf className="text-earth-300 h-16 w-16" />
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-earth-900 group-hover:text-earth-700 font-serif text-lg">
                {title}
              </CardTitle>
              {scientificName && (
                <CardDescription className="mt-1 italic">{scientificName}</CardDescription>
              )}
            </div>
            <span className="font-mono text-xs text-gray-500">{herbId}</span>
          </div>

          {/* Rating */}
          {averageRating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
            <div className="mt-2 flex items-center space-x-1 text-sm">
              <Star className="fill-gold-600 text-gold-600 h-4 w-4" />
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-gray-500">({reviewCount})</span>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Description */}
          {description && <p className="mb-3 line-clamp-2 text-sm text-gray-600">{description}</p>}

          {/* TCM Properties */}
          {tcmProperties && (
            <div className="mb-3 space-y-1">
              {tcmProperties.taste && tcmProperties.taste.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tcmProperties.taste.map((taste) => (
                    <Badge key={taste} variant="tcm" className="text-xs">
                      {taste}
                    </Badge>
                  ))}
                </div>
              )}
              {tcmProperties.temperature && (
                <Badge variant="tcm" className="text-xs">
                  {tcmProperties.temperature}
                </Badge>
              )}
            </div>
          )}

          {/* Western Properties */}
          {westernProperties && westernProperties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {westernProperties.slice(0, 3).map((prop) => (
                <Badge key={prop} variant="sage" className="text-xs">
                  {prop}
                </Badge>
              ))}
              {westernProperties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{westernProperties.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
