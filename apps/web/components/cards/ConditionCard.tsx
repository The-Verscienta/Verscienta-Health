import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'

interface ConditionCardProps {
  conditionId: string
  title: string
  slug: string
  description?: string
  category?: string
  severity?: string
  relatedHerbsCount?: number
  relatedFormulasCount?: number
}

export function ConditionCard({
  conditionId,
  title,
  slug,
  description,
  category,
  severity,
  relatedHerbsCount,
  relatedFormulasCount,
}: ConditionCardProps) {
  const severityColors: Record<string, 'default' | 'sage' | 'gold' | 'tcm'> = {
    mild: 'sage',
    moderate: 'gold',
    severe: 'tcm',
  }

  return (
    <Link href={`/conditions/${slug}`}>
      <Card className="group h-full transition-all hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-earth-900 group-hover:text-earth-700 font-serif text-lg">
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="mt-2 line-clamp-2">{description}</CardDescription>
              )}
            </div>
            <span className="font-mono text-xs text-gray-500">{conditionId}</span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <Badge variant="default" className="text-xs">
                {category}
              </Badge>
            )}
            {severity && (
              <Badge
                variant={severityColors[severity.toLowerCase()] || 'default'}
                className="text-xs"
              >
                {severity}
              </Badge>
            )}
            {relatedHerbsCount !== undefined && relatedHerbsCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {relatedHerbsCount} {relatedHerbsCount === 1 ? 'herb' : 'herbs'}
              </Badge>
            )}
            {relatedFormulasCount !== undefined && relatedFormulasCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {relatedFormulasCount} {relatedFormulasCount === 1 ? 'formula' : 'formulas'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
