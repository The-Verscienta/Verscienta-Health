import { AlertTriangle } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  setRequestLocale(lang)
  const t = await getTranslations({ locale: lang, namespace: 'disclaimer.metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function DisclaimerPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  setRequestLocale(lang)
  const t = await getTranslations({ locale: lang, namespace: 'disclaimer' })
  return (
    <div className="container-custom max-w-4xl py-12">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <AlertTriangle className="text-tcm-600 h-8 w-8" />
          <h1 className="text-earth-900 font-serif text-4xl font-bold">{t('title')}</h1>
        </div>
        <p className="text-lg text-gray-600">{t('subtitle')}</p>
      </div>

      <div className="space-y-6">
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-tcm-800">This is Not Medical Advice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-900">
            <p className="font-semibold">
              The information provided on Verscienta Health is for educational and informational
              purposes only and is not intended as medical advice, diagnosis, or treatment.
            </p>
            <p>
              Always seek the advice of your physician or other qualified health provider with any
              questions you may have regarding a medical condition. Never disregard professional
              medical advice or delay in seeking it because of something you have read on Verscienta
              Health.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Situations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-tcm-700 font-semibold">
              If you think you may have a medical emergency, call your doctor or emergency services
              immediately.
            </p>
            <p>
              Verscienta Health does not recommend or endorse any specific tests, physicians,
              products, procedures, opinions, or other information that may be mentioned on the
              platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our AI Symptom Checker uses artificial intelligence to provide educational information
              based on the symptoms you describe. This tool:
            </p>
            <ul className="list-inside list-disc space-y-2">
              <li>Is NOT a substitute for professional medical diagnosis</li>
              <li>Should NOT be used to make treatment decisions</li>
              <li>May not account for your complete medical history</li>
              <li>Provides general information, not personalized medical advice</li>
            </ul>
            <p className="mt-4 font-semibold">
              Always consult with a qualified healthcare provider before starting any new treatment
              or making changes to existing treatments.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Herbal Medicine Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Information about herbs, supplements, and natural remedies provided on Verscienta
              Health is based on traditional use and available scientific research. However:
            </p>
            <ul className="list-inside list-disc space-y-2">
              <li>Herbal products can have side effects and interactions with medications</li>
              <li>Quality and potency of herbal products can vary significantly</li>
              <li>Some herbs may be contraindicated for certain health conditions</li>
              <li>Herbal remedies are not regulated the same way as pharmaceutical drugs</li>
            </ul>
            <p className="mt-4">
              Consult with a qualified healthcare provider, preferably one knowledgeable about
              herbal medicine, before using any herbal products, especially if you:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-2">
              <li>Are pregnant or breastfeeding</li>
              <li>Have a chronic health condition</li>
              <li>Take prescription medications</li>
              <li>Are scheduled for surgery</li>
              <li>Have allergies to plants</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Practitioner Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The practitioner directory is provided as a convenience to help users find qualified
              professionals. Verscienta Health:
            </p>
            <ul className="list-inside list-disc space-y-2">
              <li>Does not employ, endorse, or control listed practitioners</li>
              <li>Does not guarantee the qualifications, competence, or quality of services</li>
              <li>Cannot verify all credentials or licensing information</li>
              <li>Is not liable for any services provided by listed practitioners</li>
            </ul>
            <p className="mt-4">
              You should independently verify practitioner credentials, licensing, and insurance
              before engaging their services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Research and References</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              While we strive to provide accurate and up-to-date information based on traditional
              texts and scientific research:
            </p>
            <ul className="list-inside list-disc space-y-2">
              <li>Scientific understanding of herbal medicine is constantly evolving</li>
              <li>Not all traditional uses have been validated by modern research</li>
              <li>Individual responses to herbal treatments can vary</li>
              <li>Some information may become outdated as new research emerges</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Responsibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>By using Verscienta Health, you acknowledge and agree that:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>
                You are responsible for evaluating the accuracy and completeness of information
              </li>
              <li>You assume full responsibility for how you use the information provided</li>
              <li>You will consult appropriate healthcare professionals for medical decisions</li>
              <li>You understand the limitations of online health information</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              To the fullest extent permitted by law, Verscienta Health and its affiliates,
              officers, directors, employees, and agents shall not be liable for any damages
              whatsoever arising from your use of the platform or reliance on any information
              provided.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>If you have questions about this medical disclaimer, please contact us at:</p>
            <p className="mt-2">
              Email:{' '}
              <a
                href="mailto:info@verscientahealth.com"
                className="text-earth-600 hover:text-earth-700"
              >
                info@verscientahealth.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-earth-50 border-earth-200 mt-8 rounded-lg border p-6">
        <p className="text-earth-900 mb-2 text-sm font-semibold">
          {t('lastUpdated', { date: new Date().toLocaleDateString() })}
        </p>
        <p className="text-earth-800 text-sm">
          By using Verscienta Health, you acknowledge that you have read, understood, and agree to
          this medical disclaimer.
        </p>
      </div>
    </div>
  )
}
