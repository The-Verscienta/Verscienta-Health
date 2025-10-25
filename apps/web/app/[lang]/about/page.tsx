import { BookOpen, Heart, Leaf, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/routing'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  setRequestLocale(lang)
  const t = await getTranslations({ locale: lang, namespace: 'about.metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  setRequestLocale(lang)
  const t = await getTranslations({ locale: lang, namespace: 'about' })
  return (
    <div className="container-custom py-12">
      {/* Hero Section */}
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h1 className="text-earth-900 mb-4 font-serif text-4xl font-bold">{t('title')}</h1>
        <p className="text-xl text-gray-600">{t('subtitle')}</p>
      </div>

      {/* Mission Statement */}
      <div className="mx-auto mb-16 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center font-serif text-2xl">{t('mission.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg text-gray-700">
            <p>{t('mission.paragraph1')}</p>
            <p>{t('mission.paragraph2')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <div className="mb-16">
        <h2 className="text-earth-900 mb-8 text-center font-serif text-3xl font-bold">
          {t('values.title')}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Leaf className="text-earth-600 mb-2 h-8 w-8" />
              <CardTitle className="text-lg">{t('values.evidenceBased.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              {t('values.evidenceBased.description')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="text-earth-600 mb-2 h-8 w-8" />
              <CardTitle className="text-lg">{t('values.holistic.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">{t('values.holistic.description')}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="text-earth-600 mb-2 h-8 w-8" />
              <CardTitle className="text-lg">{t('values.educational.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              {t('values.educational.description')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="text-earth-600 mb-2 h-8 w-8" />
              <CardTitle className="text-lg">{t('values.community.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">{t('values.community.description')}</CardContent>
          </Card>
        </div>
      </div>

      {/* What We Offer */}
      <div className="mx-auto mb-16 max-w-4xl">
        <h2 className="text-earth-900 mb-8 text-center font-serif text-3xl font-bold">
          {t('offerings.title')}
        </h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('offerings.herbDatabase.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              {t('offerings.herbDatabase.description')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('offerings.formulas.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              {t('offerings.formulas.description')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('offerings.symptomChecker.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              {t('offerings.symptomChecker.description')}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('offerings.practitionerDirectory.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              {t('offerings.practitionerDirectory.description')}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-earth-50 mx-auto max-w-3xl rounded-lg p-8 text-center">
        <h2 className="text-earth-900 mb-4 font-serif text-2xl font-bold">{t('cta.title')}</h2>
        <p className="mb-6 text-gray-700">{t('cta.description')}</p>
        <Link
          href="/contact"
          className="bg-earth-600 hover:bg-earth-700 inline-block rounded-lg px-6 py-3 font-semibold text-white transition-colors"
        >
          {t('cta.button')}
        </Link>
      </div>
    </div>
  )
}
