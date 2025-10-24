import { BookOpenIcon, BrainIcon, HeartIcon, MapPinIcon } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SearchBar } from '@/components/search/SearchBar'
import { Button } from '@/components/ui/button'

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  // Enable static rendering optimization
  setRequestLocale(lang)

  const t = await getTranslations()
  const homeT = await getTranslations('home')

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="from-earth-50 via-sage-50 to-earth-100 relative bg-gradient-to-br py-20 md:py-32">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-earth-900 mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Verscienta Health
            </h1>
            <p className="text-earth-700 mb-4 text-2xl font-medium md:text-3xl">
              Versatile Knowledge
            </p>
            <p className="mb-8 text-lg text-gray-700 md:text-xl">
              {t('footer.tagline')}. {homeT('hero.subtitle')}.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mb-8 max-w-2xl">
              <SearchBar placeholder={t('herbs.searchPlaceholder')} />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/herbs">
                <Button size="lg" className="btn-primary">
                  {homeT('hero.cta')}
                </Button>
              </Link>
              <Link href="/symptom-checker">
                <Button size="lg" variant="outline" className="btn-outline">
                  {t('nav.symptomChecker')}
                </Button>
              </Link>
              <Link href="/practitioners">
                <Button size="lg" variant="secondary" className="btn-secondary">
                  {homeT('hero.ctaSecondary')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative background pattern */}
        <div
          className="absolute inset-0 -z-10 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235d7a5d' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="text-earth-900 mb-12 text-center text-4xl font-bold">
            {homeT('features.title')}
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1: Herb Database */}
            <div className="card-feature text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-earth-600 rounded-full p-4">
                  <HeartIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-earth-900 mb-3 text-xl font-semibold">
                {homeT('features.herb.title')}
              </h3>
              <p className="mb-4 text-gray-700">{homeT('features.herb.description')}</p>
              <Link href="/herbs" className="link font-semibold">
                {homeT('hero.cta')} →
              </Link>
            </div>

            {/* Feature 2: AI Symptom Checker */}
            <div className="card-feature text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-sage-600 rounded-full p-4">
                  <BrainIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-earth-900 mb-3 text-xl font-semibold">
                {homeT('features.ai.title')}
              </h3>
              <p className="mb-4 text-gray-700">{homeT('features.ai.description')}</p>
              <Link href="/symptom-checker" className="link font-semibold">
                {t('nav.symptomChecker')} →
              </Link>
            </div>

            {/* Feature 3: Practitioner Directory */}
            <div className="card-feature text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-earth-600 rounded-full p-4">
                  <MapPinIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-earth-900 mb-3 text-xl font-semibold">
                {homeT('features.practitioners.title')}
              </h3>
              <p className="mb-4 text-gray-700">{homeT('features.practitioners.description')}</p>
              <Link href="/practitioners" className="link font-semibold">
                {t('nav.practitioners')} →
              </Link>
            </div>

            {/* Feature 4: Herbal Formulas */}
            <div className="card-feature text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-sage-600 rounded-full p-4">
                  <BookOpenIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-earth-900 mb-3 text-xl font-semibold">
                {homeT('features.formulas.title')}
              </h3>
              <p className="mb-4 text-gray-700">{homeT('features.formulas.description')}</p>
              <Link href="/formulas" className="link font-semibold">
                {t('nav.formulas')} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-earth-50 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-earth-900 mb-6 text-3xl font-bold">Our Mission</h2>
            <p className="text-lg leading-relaxed text-gray-700">
              Verscienta empowers individuals and healthcare practitioners worldwide with
              comprehensive, evidence-based knowledge of holistic health practices, fostering
              informed decision-making and integrative wellness approaches that honor both
              traditional wisdom and scientific validation.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid gap-8 text-center md:grid-cols-4">
            <div>
              <div className="text-earth-600 mb-2 text-4xl font-bold">15,000+</div>
              <div className="text-gray-600">{homeT('stats.herbs')}</div>
            </div>
            <div>
              <div className="text-sage-600 mb-2 text-4xl font-bold">1,000+</div>
              <div className="text-gray-600">{homeT('stats.formulas')}</div>
            </div>
            <div>
              <div className="text-earth-600 mb-2 text-4xl font-bold">500+</div>
              <div className="text-gray-600">{homeT('stats.practitioners')}</div>
            </div>
            <div>
              <div className="text-sage-600 mb-2 text-4xl font-bold">10+</div>
              <div className="text-gray-600">{homeT('stats.conditions')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="from-earth-600 to-sage-600 bg-gradient-to-r py-16 text-white">
        <div className="container-custom text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Begin Your Holistic Health Journey?</h2>
          <p className="mb-8 text-xl">
            Join thousands of practitioners and seekers exploring the wisdom of holistic health.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-earth-600 bg-white hover:bg-gray-100"
              >
                {t('auth.register.title')}
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                {t('common.learnMore')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
