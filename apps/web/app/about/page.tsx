import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Leaf, Heart, BookOpen, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="container-custom py-12">
      {/* Hero Section */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-serif text-earth-900 mb-4">About Verscienta Health</h1>
        <p className="text-xl text-gray-600">
          Bridging ancient herbal wisdom with modern science to empower informed health decisions
        </p>
      </div>

      {/* Mission Statement */}
      <div className="mb-16 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-center">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-gray-700 space-y-4">
            <p>
              Verscienta Health is dedicated to making herbal medicine knowledge accessible,
              evidence-based, and trustworthy. We believe that traditional healing wisdom,
              when combined with modern scientific research, can provide powerful tools for
              health and wellness.
            </p>
            <p>
              Our platform serves as a comprehensive resource for anyone interested in herbal
              medicine—from curious beginners to experienced practitioners. We carefully curate
              information from both ancient texts and contemporary research to provide you with
              the most complete picture possible.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold font-serif text-earth-900 mb-8 text-center">
          Our Core Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Leaf className="h-8 w-8 text-earth-600 mb-2" />
              <CardTitle className="text-lg">Evidence-Based</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              We ground our information in both traditional wisdom and modern scientific research,
              providing citations and references for all claims.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-8 w-8 text-earth-600 mb-2" />
              <CardTitle className="text-lg">Holistic Approach</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              We honor the interconnectedness of body, mind, and spirit, integrating wisdom from
              multiple healing traditions.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-earth-600 mb-2" />
              <CardTitle className="text-lg">Educational Focus</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              We empower users through education, helping you make informed decisions about your
              health and wellness journey.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-earth-600 mb-2" />
              <CardTitle className="text-lg">Community-Driven</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              We foster a community of practitioners, researchers, and enthusiasts working together
              to advance herbal medicine knowledge.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* What We Offer */}
      <div className="mb-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold font-serif text-earth-900 mb-8 text-center">
          What We Offer
        </h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Herb Database</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Detailed profiles of hundreds of medicinal herbs, including botanical information,
              traditional uses, active constituents, dosage guidelines, and safety information.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Traditional Formulas</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Time-tested herbal formulas from Traditional Chinese Medicine, Ayurveda, and Western
              herbalism, with ingredient breakdowns and usage guidelines.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Symptom Checker</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Get personalized herbal recommendations based on your symptoms, analyzed from both
              Western and Traditional Chinese Medicine perspectives.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Practitioner Directory</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Find qualified herbalists, acupuncturists, and holistic health practitioners in your area.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-earth-50 rounded-lg p-8 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold font-serif text-earth-900 mb-4">Get in Touch</h2>
        <p className="text-gray-700 mb-6">
          Have questions, suggestions, or want to contribute to our platform? We'd love to hear from you.
        </p>
        <a
          href="/contact"
          className="inline-block px-6 py-3 bg-earth-600 text-white font-semibold rounded-lg hover:bg-earth-700 transition-colors"
        >
          Contact Us
        </a>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'About Us | Verscienta Health',
  description: 'Learn about Verscienta Health - bridging ancient herbal wisdom with modern science to empower informed health decisions.',
}
