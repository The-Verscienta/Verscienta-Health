import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/search/SearchBar'
import { HeartIcon, BrainIcon, MapPinIcon, BookOpenIcon } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-earth-50 via-sage-50 to-earth-100 py-20 md:py-32">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-earth-900 md:text-6xl lg:text-7xl">
              Verscienta Health
            </h1>
            <p className="mb-4 text-2xl font-medium text-earth-700 md:text-3xl">
              Versatile Knowledge
            </p>
            <p className="mb-8 text-lg text-gray-700 md:text-xl">
              Bridging ancient herbal wisdom with modern science. Explore 15,000+ herbs,
              Traditional Chinese Medicine, and holistic health practices.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mb-8 max-w-2xl">
              <SearchBar placeholder="Search herbs, conditions, or treatments..." />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/herbs">
                <Button size="lg" className="btn-primary">
                  Explore Herbs
                </Button>
              </Link>
              <Link href="/symptom-checker">
                <Button size="lg" variant="outline" className="btn-outline">
                  AI Symptom Checker
                </Button>
              </Link>
              <Link href="/practitioners">
                <Button size="lg" variant="secondary" className="btn-secondary">
                  Find Practitioners
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
          <h2 className="mb-12 text-center text-4xl font-bold text-earth-900">
            Comprehensive Holistic Health Platform
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1: Herb Database */}
            <div className="card-feature text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-earth-600 p-4">
                  <HeartIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-earth-900">
                15,000+ Herbs
              </h3>
              <p className="mb-4 text-gray-700">
                Comprehensive database with TCM properties, Western herbalism, safety data,
                and clinical studies.
              </p>
              <Link href="/herbs" className="link font-semibold">
                Explore Herbs →
              </Link>
            </div>

            {/* Feature 2: AI Symptom Checker */}
            <div className="card-feature text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-sage-600 p-4">
                  <BrainIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-earth-900">
                AI Symptom Analysis
              </h3>
              <p className="mb-4 text-gray-700">
                Get personalized herb recommendations and modality suggestions powered by
                Grok AI.
              </p>
              <Link href="/symptom-checker" className="link font-semibold">
                Try Symptom Checker →
              </Link>
            </div>

            {/* Feature 3: Practitioner Directory */}
            <div className="card-feature text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-earth-600 p-4">
                  <MapPinIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-earth-900">
                Find Practitioners
              </h3>
              <p className="mb-4 text-gray-700">
                Connect with verified holistic health practitioners near you. Filter by
                modality and specialty.
              </p>
              <Link href="/practitioners" className="link font-semibold">
                Find Practitioners →
              </Link>
            </div>

            {/* Feature 4: Herbal Formulas */}
            <div className="card-feature text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-sage-600 p-4">
                  <BookOpenIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-earth-900">
                Traditional Formulas
              </h3>
              <p className="mb-4 text-gray-700">
                Classical TCM formulas and modern blends with precise ingredients and
                preparation methods.
              </p>
              <Link href="/formulas" className="link font-semibold">
                Browse Formulas →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-earth-50 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-earth-900">Our Mission</h2>
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
              <div className="mb-2 text-4xl font-bold text-earth-600">15,000+</div>
              <div className="text-gray-600">Herbs Documented</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-sage-600">1,000+</div>
              <div className="text-gray-600">Traditional Formulas</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-earth-600">500+</div>
              <div className="text-gray-600">Verified Practitioners</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-sage-600">10+</div>
              <div className="text-gray-600">Healing Modalities</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-earth-600 to-sage-600 py-16 text-white">
        <div className="container-custom text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Begin Your Holistic Health Journey?</h2>
          <p className="mb-8 text-xl">
            Join thousands of practitioners and seekers exploring the wisdom of holistic health.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="bg-white text-earth-600 hover:bg-gray-100">
                Create Free Account
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
