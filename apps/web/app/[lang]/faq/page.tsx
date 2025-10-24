import { FAQSection } from '@/components/ui/faq'
import { JsonLd } from '@/components/seo/JsonLd'
import { generateFAQSchema } from '@/lib/json-ld'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  setRequestLocale(lang)
  const t = await getTranslations({ locale: lang, namespace: 'faq.metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function FAQPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  setRequestLocale(lang)
  const t = await getTranslations({ locale: lang, namespace: 'faq' })

  // General Platform FAQs
  const generalFAQs = [
    {
      question: t('general.q1.question'),
      answer: t('general.q1.answer'),
    },
    {
      question: t('general.q2.question'),
      answer: t('general.q2.answer'),
    },
    {
      question: t('general.q3.question'),
      answer: t('general.q3.answer'),
    },
    {
      question: t('general.q4.question'),
      answer: t('general.q4.answer'),
    },
  ]

  // TCM and Herbs FAQs
  const tcmFAQs = [
    {
      question: t('tcm.q1.question'),
      answer: t('tcm.q1.answer'),
    },
    {
      question: t('tcm.q2.question'),
      answer: t('tcm.q2.answer'),
    },
    {
      question: t('tcm.q3.question'),
      answer: t('tcm.q3.answer'),
    },
    {
      question: t('tcm.q4.question'),
      answer: t('tcm.q4.answer'),
    },
  ]

  // Practitioner Directory FAQs
  const practitionerFAQs = [
    {
      question: t('practitioners.q1.question'),
      answer: t('practitioners.q1.answer'),
    },
    {
      question: t('practitioners.q2.question'),
      answer: t('practitioners.q2.answer'),
    },
    {
      question: t('practitioners.q3.question'),
      answer: t('practitioners.q3.answer'),
    },
  ]

  // Privacy and Safety FAQs
  const privacyFAQs = [
    {
      question: t('privacy.q1.question'),
      answer: t('privacy.q1.answer'),
    },
    {
      question: t('privacy.q2.question'),
      answer: t('privacy.q2.answer'),
    },
    {
      question: t('privacy.q3.question'),
      answer: t('privacy.q3.answer'),
    },
  ]

  // Combine all FAQs for JSON-LD schema
  const allFAQs = [...generalFAQs, ...tcmFAQs, ...practitionerFAQs, ...privacyFAQs]

  return (
    <>
      {/* JSON-LD Schema for SEO */}
      <JsonLd data={generateFAQSchema(allFAQs)} />

      <div className="container-custom py-12">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="text-earth-900 mb-4 font-serif text-4xl font-bold">{t('title')}</h1>
          <p className="text-lg text-gray-600">{t('subtitle')}</p>
        </div>

        {/* FAQ Sections */}
        <div className="mx-auto max-w-4xl space-y-12">
          {/* General Platform FAQs */}
          <FAQSection
            title={t('general.title')}
            subtitle={t('general.subtitle')}
            items={generalFAQs}
          />

          {/* TCM and Herbs FAQs */}
          <FAQSection title={t('tcm.title')} subtitle={t('tcm.subtitle')} items={tcmFAQs} />

          {/* Practitioner Directory FAQs */}
          <FAQSection
            title={t('practitioners.title')}
            subtitle={t('practitioners.subtitle')}
            items={practitionerFAQs}
          />

          {/* Privacy and Safety FAQs */}
          <FAQSection
            title={t('privacy.title')}
            subtitle={t('privacy.subtitle')}
            items={privacyFAQs}
          />
        </div>

        {/* Contact CTA */}
        <div className="bg-earth-50 mx-auto mt-16 max-w-3xl rounded-lg p-8 text-center">
          <h2 className="text-earth-900 mb-4 font-serif text-2xl font-bold">{t('cta.title')}</h2>
          <p className="mb-6 text-gray-700">{t('cta.description')}</p>
          <a
            href={`/${lang}/contact`}
            className="bg-earth-600 hover:bg-earth-700 inline-block rounded-lg px-6 py-3 font-semibold text-white transition-colors"
          >
            {t('cta.button')}
          </a>
        </div>
      </div>
    </>
  )
}
