import { setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'
import { PractitionerViewToggle } from '@/components/practitioners/PractitionerViewToggle'
import { SearchBar } from '@/components/search/SearchBar'
import { Loading } from '@/components/ui/loading'
import { getPractitioners } from '@/lib/payload-api'

export const dynamic = 'force-dynamic'

// View-model consumed by PractitionerViewToggle / PractitionerCard / map.
interface Practitioner {
  id: string
  practitionerId: string
  name: string
  slug: string
  photo?: {
    url: string
    alt: string
  }
  title?: string
  modalities: string[]
  address: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  latitude?: number
  longitude?: number
  averageRating?: number
  reviewCount?: number
  verificationStatus?: 'verified' | 'pending' | 'unverified'
}

// Raw shape returned by Payload (see Practitioners collection + DB migration).
// NOTE: the generated payload-types.ts is stale for this collection, so we
// describe the real runtime shape here and cast at the boundary.
interface PractitionerDoc {
  id: number | string
  practitionerName: string
  businessName?: string | null
  slug?: string | null
  profileImage?: { url?: string | null; alt?: string | null } | number | null
  modalities?: ({ title?: string | null } | number)[] | null
  addresses?:
    | {
        street?: string | null
        city?: string | null
        state?: string | null
        zipCode?: string | null
        country?: string | null
        latitude?: number | null
        longitude?: number | null
      }[]
    | null
  city?: string | null
  state?: string | null
  averageRating?: number | null
  reviewCount?: number | null
  verificationStatus?: string | null
}

interface PractitionersPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{
    page?: string
    q?: string
    modality?: string
    location?: string
  }>
}

export default async function PractitionersPage({ params, searchParams }: PractitionersPageProps) {
  const { lang } = await params
  setRequestLocale(lang)

  const { page: pageParam, q: query } = await searchParams
  const page = Number(pageParam) || 1

  const { docs, totalPages, totalDocs } = await getPractitioners(page, 12, query)

  const practitioners: Practitioner[] = (docs as unknown as PractitionerDoc[]).map((p) => {
    const primary = p.addresses?.[0]
    const image = p.profileImage && typeof p.profileImage === 'object' ? p.profileImage : undefined
    return {
      id: String(p.id),
      practitionerId: String(p.id),
      name: p.practitionerName,
      slug: p.slug ?? '',
      photo: image?.url ? { url: image.url, alt: image.alt ?? p.practitionerName } : undefined,
      title: p.businessName ?? undefined,
      modalities: (p.modalities ?? [])
        .map((m) => (m && typeof m === 'object' ? (m.title ?? undefined) : undefined))
        .filter((t): t is string => Boolean(t)),
      address: {
        street: primary?.street ?? undefined,
        city: primary?.city ?? p.city ?? undefined,
        state: primary?.state ?? p.state ?? undefined,
        postalCode: primary?.zipCode ?? undefined,
        country: primary?.country ?? undefined,
      },
      latitude: primary?.latitude ?? undefined,
      longitude: primary?.longitude ?? undefined,
      averageRating: p.averageRating ?? undefined,
      reviewCount: p.reviewCount ?? undefined,
      verificationStatus: p.verificationStatus === 'verified' ? 'verified' : 'pending',
    }
  })

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-earth-900 mb-4 font-serif text-4xl font-bold">Find a Practitioner</h1>
        <p className="max-w-3xl text-lg text-gray-600">
          Connect with qualified holistic health practitioners including herbalists, acupuncturists,
          naturopaths, and Traditional Chinese Medicine specialists.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-2xl">
        <SearchBar placeholder="Search by name, specialty, or location..." defaultValue={query} />
      </div>

      {/* Stats and View Toggle */}
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {totalDocs} {totalDocs === 1 ? 'practitioner' : 'practitioners'} found
        </p>
      </div>

      {/* Practitioner View (List or Map) */}
      <Suspense fallback={<Loading />}>
        {practitioners.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">
              {query
                ? 'No practitioners found matching your search.'
                : 'No practitioners available yet.'}
            </p>
          </div>
        ) : (
          <PractitionerViewToggle
            practitioners={practitioners}
            currentPage={page}
            totalPages={totalPages}
          />
        )}
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Find a Practitioner | Verscienta Health',
  description:
    'Connect with qualified holistic health practitioners including herbalists, acupuncturists, and Traditional Chinese Medicine specialists.',
}
