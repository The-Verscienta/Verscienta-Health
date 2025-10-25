'use client'

import { AlertTriangle, Sparkles, Leaf, Info, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * TCM Pattern Types
 */
export interface TCMPattern {
  name: string
  description: string
  confidence: number // 0-100
  symptoms: string[]
  rootCause?: string
}

/**
 * Herb Recommendation Types
 */
export interface HerbRecommendation {
  id: string
  name: string
  scientificName?: string
  slug: string
  tcmAction: string
  explanation: string
  dosage?: string
  contraindications?: string[]
  safetyRating: 'safe' | 'caution' | 'consult'
  imageUrl?: string
}

/**
 * Component Props
 */
export interface HerbRecommendationsProps {
  patterns: TCMPattern[]
  herbs: HerbRecommendation[]
  lifestyleRecommendations?: string[]
  isLoading?: boolean
  onRefresh?: () => void
}

/**
 * Skeleton Loading Component
 */
function HerbRecommendationsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Medical Disclaimer Skeleton */}
      <div className="h-32 bg-gray-200 rounded-lg" />

      {/* TCM Patterns Skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Herb Recommendations Skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Lifestyle Recommendations Skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 rounded w-56" />
        <div className="h-48 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Medical Disclaimer Banner
 */
function MedicalDisclaimer() {
  return (
    <Card className="border-yellow-300 bg-yellow-50">
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0 text-yellow-700" />
          <div className="space-y-2">
            <p className="font-semibold text-yellow-900">Medical Disclaimer</p>
            <p className="text-sm text-yellow-800">
              This information is for educational purposes only and is not a substitute for
              professional medical advice, diagnosis, or treatment. Always seek the advice of your
              physician or other qualified health provider with any questions you may have regarding
              a medical condition. Never disregard professional medical advice or delay in seeking it
              because of information provided here.
            </p>
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Herbs can interact with medications and may not be suitable
              for everyone. Consult a licensed healthcare practitioner before starting any herbal
              treatment, especially if you are pregnant, nursing, taking medications, or have a
              medical condition.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * TCM Pattern Display
 */
function TCMPatternCard({ pattern }: { pattern: TCMPattern }) {
  const confidenceColor =
    pattern.confidence >= 80
      ? 'text-green-700 bg-green-50 border-green-200'
      : pattern.confidence >= 60
        ? 'text-blue-700 bg-blue-50 border-blue-200'
        : 'text-gray-700 bg-gray-50 border-gray-200'

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{pattern.name}</CardTitle>
          <Badge variant="outline" className={confidenceColor}>
            {pattern.confidence}% match
          </Badge>
        </div>
        <CardDescription className="text-sm">{pattern.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {pattern.rootCause && (
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Root Cause (TCM):</p>
            <p className="text-sm text-gray-700">{pattern.rootCause}</p>
          </div>
        )}
        {pattern.symptoms.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Associated Symptoms:</p>
            <div className="flex flex-wrap gap-1">
              {pattern.symptoms.slice(0, 6).map((symptom, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {symptom}
                </Badge>
              ))}
              {pattern.symptoms.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{pattern.symptoms.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Herb Recommendation Card
 */
function HerbCard({ herb }: { herb: HerbRecommendation }) {
  const safetyIcon =
    herb.safetyRating === 'safe' ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : herb.safetyRating === 'caution' ? (
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    )

  const safetyText =
    herb.safetyRating === 'safe'
      ? 'Generally safe'
      : herb.safetyRating === 'caution'
        ? 'Use with caution'
        : 'Consult practitioner'

  const safetyColor =
    herb.safetyRating === 'safe'
      ? 'text-green-700 bg-green-50'
      : herb.safetyRating === 'caution'
        ? 'text-yellow-700 bg-yellow-50'
        : 'text-red-700 bg-red-50'

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-2">
          <Leaf className="text-earth-600 mt-0.5 h-5 w-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">
              <Link
                href={`/herbs/${herb.slug}`}
                className="hover:text-earth-600 transition-colors"
              >
                {herb.name}
              </Link>
            </CardTitle>
            {herb.scientificName && (
              <CardDescription className="text-xs italic mt-1">
                {herb.scientificName}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* TCM Action */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1">TCM Action:</p>
          <p className="text-sm text-gray-700">{herb.tcmAction}</p>
        </div>

        {/* Explanation */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1">Why This Herb:</p>
          <p className="text-sm text-gray-700">{herb.explanation}</p>
        </div>

        {/* Dosage */}
        {herb.dosage && (
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Typical Dosage:</p>
            <p className="text-sm text-gray-700">{herb.dosage}</p>
          </div>
        )}

        {/* Safety Rating */}
        <div className={`flex items-center gap-2 p-2 rounded ${safetyColor}`}>
          {safetyIcon}
          <span className="text-xs font-medium">{safetyText}</span>
        </div>

        {/* Contraindications */}
        {herb.contraindications && herb.contraindications.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-semibold text-red-700 mb-1">⚠️ Contraindications:</p>
            <ul className="text-xs text-red-600 space-y-0.5">
              {herb.contraindications.map((c, i) => (
                <li key={i}>• {c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* View Details Button */}
        <Link href={`/herbs/${herb.slug}`}>
          <Button variant="outline" className="w-full mt-2" size="sm">
            View Full Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

/**
 * Main Herb Recommendations Component
 */
export function HerbRecommendations({
  patterns,
  herbs,
  lifestyleRecommendations = [],
  isLoading = false,
  onRefresh,
}: HerbRecommendationsProps) {
  if (isLoading) {
    return <HerbRecommendationsSkeleton />
  }

  const hasResults = patterns.length > 0 || herbs.length > 0

  if (!hasResults) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Sparkles className="text-earth-300 mx-auto mb-4 h-12 w-12" />
          <p className="text-gray-600 mb-4">No recommendations available yet.</p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline">
              Generate Recommendations
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Medical Disclaimer */}
      <MedicalDisclaimer />

      {/* TCM Patterns */}
      {patterns.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <Info className="text-earth-600 h-6 w-6" />
            <h2 className="text-earth-900 text-2xl font-bold">TCM Pattern Analysis</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Based on your symptoms, the following Traditional Chinese Medicine patterns were
            identified:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {patterns.map((pattern, i) => (
              <TCMPatternCard key={i} pattern={pattern} />
            ))}
          </div>
        </section>
      )}

      {/* Herb Recommendations */}
      {herbs.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <Leaf className="text-earth-600 h-6 w-6" />
            <h2 className="text-earth-900 text-2xl font-bold">Recommended Herbs</h2>
          </div>
          <p className="text-gray-600 mb-4">
            These herbs may help address your identified TCM patterns. Always consult a licensed
            practitioner before use.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {herbs.map((herb) => (
              <HerbCard key={herb.id} herb={herb} />
            ))}
          </div>
        </section>
      )}

      {/* Lifestyle Recommendations */}
      {lifestyleRecommendations.length > 0 && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-earth-600 h-5 w-5" />
                Lifestyle Recommendations
              </CardTitle>
              <CardDescription>
                Additional suggestions to support your health and well-being
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lifestyleRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="text-earth-600 mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Actions */}
      {onRefresh && (
        <div className="flex justify-center pt-4">
          <Button onClick={onRefresh} variant="outline" size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Get New Recommendations
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Export convenience components
 */
export { HerbRecommendationsSkeleton, MedicalDisclaimer, TCMPatternCard, HerbCard }
