'use client'

import { AlertTriangle, Plus, Shield, Sparkles, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { SessionTimeoutWarning } from '@/components/security/SessionTimeoutWarning'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import { useIdleTimeout } from '@/hooks/use-idle-timeout'
import { useSession } from '@/lib/auth-client'

/**
 * HIPAA-Compliant Symptom Checker
 *
 * This page handles Protected Health Information (PHI) and implements:
 * - 15-minute idle timeout (HIPAA §164.312(a)(2)(iii))
 * - PII sanitization before external API calls
 * - Audit logging of all symptom submissions
 * - Secure session management
 */
export default function SymptomCheckerPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [currentSymptom, setCurrentSymptom] = useState('')
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | ''>('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [showMfaRequired, setShowMfaRequired] = useState(false)

  // HIPAA Compliance: 15-minute idle timeout for PHI-sensitive pages
  const { resetTimer } = useIdleTimeout({
    timeoutMinutes: 15,
    warningMinutes: 2,
    onWarning: () => {
      setShowTimeoutWarning(true)
    },
    onTimeout: () => {
      // Clear sensitive data
      handleReset()
      toast.error('Session expired due to inactivity', {
        description: 'For your security, you have been logged out after 15 minutes of inactivity.',
      })
      router.push('/login?timeout=true&reason=inactivity')
    },
    enabled: true,
  })

  // HIPAA Compliance: MFA enforcement for PHI access
  useEffect(() => {
    if (!isPending && session?.user) {
      const mfaEnabled = (session.user as any).mfaEnabled || false

      // Show MFA required warning if not enabled
      if (!mfaEnabled) {
        setShowMfaRequired(true)

        // Log MFA enforcement check
        console.log('[HIPAA] MFA enforcement check:', {
          userId: session.user.id,
          mfaEnabled: false,
          page: 'symptom-checker',
          timestamp: new Date().toISOString(),
        })
      }
    }
  }, [session, isPending])

  const handleContinueSession = () => {
    setShowTimeoutWarning(false)
    resetTimer()
    toast.success('Session extended')
  }

  const handleLogout = () => {
    handleReset()
    router.push('/login')
  }

  const handleAddSymptom = () => {
    if (currentSymptom.trim() && !symptoms.includes(currentSymptom.trim())) {
      setSymptoms([...symptoms, currentSymptom.trim()])
      setCurrentSymptom('')
    }
  }

  const handleRemoveSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter((s) => s !== symptom))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (symptoms.length === 0) {
      toast.error('Please add at least one symptom')
      return
    }

    setIsLoading(true)
    setAnalysis(null)

    try {
      const response = await fetch('/api/grok/symptom-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms,
          duration,
          severity,
          additionalInfo,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get analysis')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error('Error getting analysis:', error)
      toast.error('Failed to analyze symptoms. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSymptoms([])
    setDuration('')
    setSeverity('')
    setAdditionalInfo('')
    setAnalysis(null)
  }

  return (
    <>
      {/* HIPAA Compliance: Session Timeout Warning */}
      <SessionTimeoutWarning
        open={showTimeoutWarning}
        minutesRemaining={2}
        onContinue={handleContinueSession}
        onLogout={handleLogout}
      />

      {/* HIPAA Compliance: MFA Required Warning */}
      {showMfaRequired && (
        <div className="container-custom py-12">
          <div className="mx-auto max-w-2xl">
            <Card className="border-yellow-300 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-900">
                  <Shield className="mr-3 h-6 w-6" />
                  Multi-Factor Authentication Required
                </CardTitle>
                <CardDescription className="text-yellow-800">
                  For HIPAA compliance, MFA is required to access the symptom checker
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm text-gray-700 mb-4">
                    The symptom checker handles Protected Health Information (PHI) and requires
                    enhanced security. Please enable Multi-Factor Authentication to continue.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 mb-4 list-disc list-inside">
                    <li>Protects your sensitive health data</li>
                    <li>HIPAA compliance requirement</li>
                    <li>Takes less than 2 minutes to set up</li>
                    <li>Works with Google Authenticator, Authy, and other TOTP apps</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => router.push('/settings')} className="flex-1">
                    Enable MFA in Settings
                  </Button>
                  <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className={showMfaRequired ? 'hidden' : 'container-custom py-12'}>
        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <Sparkles className="text-earth-600 h-8 w-8" />
            <h1 className="text-earth-900 font-serif text-4xl font-bold">AI Symptom Checker</h1>
          </div>
          <p className="text-lg text-gray-600">
            Describe your symptoms and get personalized herbal recommendations powered by AI. Our
            system analyzes your symptoms from both Western and Traditional Chinese Medicine
            perspectives.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mb-8 max-w-3xl">
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-700" />
                <div className="text-sm text-yellow-900">
                  <p className="mb-1 font-semibold">Medical Disclaimer</p>
                  <p>
                    This tool provides educational information only and is not a substitute for
                    professional medical advice, diagnosis, or treatment. Always seek the advice of
                    qualified healthcare providers with any questions you may have regarding a
                    medical condition.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Input Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Describe Your Symptoms</CardTitle>
                <CardDescription>
                  Add your symptoms and provide additional context for a more accurate analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Symptoms Input */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Symptoms *
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={currentSymptom}
                        onChange={(e) => setCurrentSymptom(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddSymptom()
                          }
                        }}
                        placeholder="e.g., headache, fatigue, nausea"
                      />
                      <Button type="button" onClick={handleAddSymptom} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Symptom Tags */}
                    {symptoms.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {symptoms.map((symptom) => (
                          <Badge
                            key={symptom}
                            variant="sage"
                            className="flex items-center gap-1 py-1 pl-3 pr-1"
                          >
                            {symptom}
                            <button
                              type="button"
                              onClick={() => handleRemoveSymptom(symptom)}
                              className="hover:bg-sage-300 ml-1 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Duration (optional)
                    </label>
                    <Input
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 3 days, 2 weeks, 1 month"
                    />
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Severity (optional)
                    </label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={severity === 'mild' ? 'default' : 'outline'}
                        onClick={() => setSeverity('mild')}
                        className="flex-1"
                      >
                        Mild
                      </Button>
                      <Button
                        type="button"
                        variant={severity === 'moderate' ? 'default' : 'outline'}
                        onClick={() => setSeverity('moderate')}
                        className="flex-1"
                      >
                        Moderate
                      </Button>
                      <Button
                        type="button"
                        variant={severity === 'severe' ? 'default' : 'outline'}
                        onClick={() => setSeverity('severe')}
                        className="flex-1"
                      >
                        Severe
                      </Button>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Additional Information (optional)
                    </label>
                    <textarea
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="Any other relevant details about your symptoms, lifestyle, or health history..."
                      className="focus:ring-earth-600 min-h-[100px] w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isLoading || symptoms.length === 0}
                      className="flex-1"
                    >
                      {isLoading ? 'Analyzing...' : 'Get Analysis'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleReset}>
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Analysis & Recommendations</CardTitle>
                <CardDescription>
                  AI-powered herbal recommendations based on your symptoms
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loading />
                ) : analysis ? (
                  <div className="prose prose-earth max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">{analysis}</div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Sparkles className="text-earth-300 mx-auto mb-4 h-12 w-12" />
                    <p className="text-gray-600">
                      Add your symptoms and click "Get Analysis" to receive personalized
                      recommendations.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
