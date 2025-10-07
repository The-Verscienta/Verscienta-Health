import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PractitionerCard } from '@/components/cards/PractitionerCard'
import { Book, Heart, Award, Users, Target } from 'lucide-react'

interface Modality {
  id: string
  title: string
  modalityId: string
  slug: string
  description?: string
  origin?: string
  overview?: string
  history?: string
  category?: string
  evidenceLevel?: string
  philosophy?: string
  keyConcepts?: string[]
  keyTechniques?: (string | { name: string; description?: string })[]
  diagnosticMethods?: string[]
  treatmentApproaches?: string[]
  benefits?: string[]
  commonConditionsTreated?: (string | { id: string; title: string; slug: string })[]
  scientificEvidence?: string
  contraindications?: string[]
  trainingRequirements?: string
  certificationBodies?: {
    name: string
    website?: string
  }[]
  continuingEducation?: string
  practitioners?: {
    practitionerId: string
    name: string
    slug: string
    photo?: {
      url: string
      alt: string
    }
    title?: string
    modalities?: string[]
    address?: {
      city?: string
      state?: string
    }
    averageRating?: number
    reviewCount?: number
    verificationStatus?: 'verified' | 'pending' | 'unverified'
  }[]
  resources?: {
    title: string
    url: string
    type: string
    description?: string
  }[]
}

interface ModalityPageProps {
  params: {
    slug: string
  }
}

// This will be replaced with actual Payload CMS API call
async function getModality(_slug: string): Promise<Modality | null> {
  // TODO: Replace with actual Payload CMS API call
  // const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/modalities?where[slug][equals]=${slug}&depth=2`)
  // const data = await response.json()
  // if (!data.docs || data.docs.length === 0) return null
  // return data.docs[0]

  return null
}

export default async function ModalityPage({ params }: ModalityPageProps) {
  const modality = await getModality(params.slug)

  if (!modality) {
    notFound()
  }

  return (
    <div className="container-custom py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold font-serif text-earth-900 mb-2">
              {modality.title}
            </h1>
            {modality.origin && (
              <p className="text-xl text-gray-600 mb-4">Origin: {modality.origin}</p>
            )}
          </div>
          <span className="text-sm font-mono text-gray-500">{modality.modalityId}</span>
        </div>

        {/* Description */}
        {modality.description && (
          <p className="text-lg text-gray-700 mb-6">{modality.description}</p>
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {modality.category && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Category</h3>
              <Badge variant="sage">{modality.category}</Badge>
            </div>
          )}
          {modality.evidenceLevel && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Evidence Level</h3>
              <Badge variant="gold">{modality.evidenceLevel}</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="mb-12">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="techniques">Techniques</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="training">Training & Certification</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Philosophy */}
          {modality.philosophy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="mr-2 h-5 w-5 text-earth-600" />
                  Philosophy & Principles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{modality.philosophy}</p>
              </CardContent>
            </Card>
          )}

          {/* History */}
          {modality.history && (
            <Card>
              <CardHeader>
                <CardTitle>Historical Background</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{modality.history}</p>
              </CardContent>
            </Card>
          )}

          {/* Key Concepts */}
          {modality.keyConcepts && modality.keyConcepts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Concepts</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {modality.keyConcepts.map((concept: string, idx: number) => (
                    <li key={idx}>{concept}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Techniques Tab */}
        <TabsContent value="techniques" className="space-y-6">
          {/* Key Techniques */}
          {modality.keyTechniques && modality.keyTechniques.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-earth-600" />
                  Key Techniques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modality.keyTechniques.map((technique, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-earth-900 mb-2">
                        {typeof technique === 'string' ? technique : technique.name}
                      </h4>
                      {typeof technique === 'object' && technique.description && (
                        <p className="text-sm text-gray-600">{technique.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diagnostic Methods */}
          {modality.diagnosticMethods && modality.diagnosticMethods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {modality.diagnosticMethods.map((method: string, idx: number) => (
                    <li key={idx}>{method}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Treatment Approaches */}
          {modality.treatmentApproaches && modality.treatmentApproaches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Treatment Approaches</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {modality.treatmentApproaches.map((approach: string, idx: number) => (
                    <li key={idx}>{approach}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="benefits" className="space-y-6">
          {/* Benefits */}
          {modality.benefits && modality.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-earth-600" />
                  Health Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {modality.benefits.map((benefit: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-earth-600 mr-2">•</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Conditions Treated */}
          {modality.commonConditionsTreated && modality.commonConditionsTreated.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Commonly Treated Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {modality.commonConditionsTreated.map((condition) => (
                    <Link
                      key={typeof condition === 'string' ? condition : condition.id}
                      href={`/conditions/${typeof condition === 'string' ? '#' : condition.slug}`}
                    >
                      <Badge variant="sage" className="hover:bg-sage-200">
                        {typeof condition === 'string' ? condition : condition.title}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scientific Evidence */}
          {modality.scientificEvidence && (
            <Card>
              <CardHeader>
                <CardTitle>Scientific Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{modality.scientificEvidence}</p>
              </CardContent>
            </Card>
          )}

          {/* Contraindications */}
          {modality.contraindications && modality.contraindications.length > 0 && (
            <Card className="border-yellow-300 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-900">Contraindications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-yellow-900">
                  {modality.contraindications.map((contra: string, idx: number) => (
                    <li key={idx}>{contra}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Training & Certification Tab */}
        <TabsContent value="training" className="space-y-6">
          {/* Training Requirements */}
          {modality.trainingRequirements && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-earth-600" />
                  Training Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{modality.trainingRequirements}</p>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {modality.certificationBodies && modality.certificationBodies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Certification Bodies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {modality.certificationBodies.map((body, idx) => (
                    <li key={idx} className="border-b border-gray-200 pb-2 last:border-0">
                      <h4 className="font-semibold text-gray-900">
                        {typeof body === 'string' ? body : body.name}
                      </h4>
                      {typeof body === 'object' && body.website && (
                        <a
                          href={body.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-earth-600 hover:text-earth-700"
                        >
                          Visit Website →
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Continuing Education */}
          {modality.continuingEducation && (
            <Card>
              <CardHeader>
                <CardTitle>Continuing Education</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{modality.continuingEducation}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Related Practitioners */}
      {modality.practitioners && modality.practitioners.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-serif text-earth-900 mb-6 flex items-center">
            <Users className="mr-2 h-6 w-6 text-earth-600" />
            Practitioners Specializing in {modality.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modality.practitioners.slice(0, 6).map((practitioner) => (
              <PractitionerCard
                key={practitioner.practitionerId}
                practitionerId={practitioner.practitionerId}
                name={practitioner.name}
                slug={practitioner.slug}
                photo={practitioner.photo}
                title={practitioner.title}
                modalities={practitioner.modalities}
                address={practitioner.address}
                averageRating={practitioner.averageRating}
                reviewCount={practitioner.reviewCount}
                verificationStatus={practitioner.verificationStatus}
              />
            ))}
          </div>
          {modality.practitioners.length > 6 && (
            <div className="text-center mt-6">
              <Link
                href={`/practitioners?modality=${modality.slug}`}
                className="text-earth-600 hover:text-earth-700 font-semibold"
              >
                View all practitioners →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Resources */}
      {modality.resources && modality.resources.length > 0 && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {modality.resources.map((resource, idx) => (
                <li key={idx}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-earth-600 hover:text-earth-700"
                  >
                    {resource.title} →
                  </a>
                  {resource.description && (
                    <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          <strong>Disclaimer:</strong> This information is for educational purposes only.
          Consult with a qualified healthcare provider before starting any new treatment modality.
        </p>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: ModalityPageProps) {
  const modality = await getModality(params.slug)

  if (!modality) {
    return {
      title: 'Modality Not Found | Verscienta Health',
    }
  }

  return {
    title: `${modality.title} | Verscienta Health`,
    description: modality.description || `Learn about ${modality.title}, its techniques, benefits, and training requirements.`,
  }
}
