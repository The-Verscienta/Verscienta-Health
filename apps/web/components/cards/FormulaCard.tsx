import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'

interface FormulaCardProps {
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
}

export function FormulaCard({
  formulaId,
  title,
  slug,
  chineseName,
  pinyin,
  description,
  category,
  tradition,
  ingredientCount,
  averageRating,
  reviewCount,
}: FormulaCardProps) {
  return (
    <Link href={`/formulas/${slug}`}>
      <Card className="group h-full transition-all hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-earth-900 group-hover:text-earth-700 font-serif text-lg">
                {title}
              </CardTitle>
              {chineseName && (
                <p className="font-serif-sc text-tcm-600 mt-1 text-sm">{chineseName}</p>
              )}
              {pinyin && <CardDescription className="mt-1 italic">{pinyin}</CardDescription>}
            </div>
            <span className="font-mono text-xs text-gray-500">{formulaId}</span>
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
          {description && <p className="mb-3 line-clamp-3 text-sm text-gray-600">{description}</p>}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            {tradition && (
              <Badge variant="tcm" className="text-xs">
                {tradition}
              </Badge>
            )}
            {category && (
              <Badge variant="sage" className="text-xs">
                {category}
              </Badge>
            )}
            {ingredientCount !== undefined && (
              <Badge variant="outline" className="text-xs">
                {ingredientCount} {ingredientCount === 1 ? 'ingredient' : 'ingredients'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
