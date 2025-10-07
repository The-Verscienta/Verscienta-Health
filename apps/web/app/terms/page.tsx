import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="container-custom max-w-4xl py-12">
      <h1 className="text-earth-900 mb-8 font-serif text-4xl font-bold">Terms of Service</h1>

      <div className="space-y-6 text-gray-700">
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              By accessing and using Verscienta Health, you accept and agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Use of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Permitted Use</h3>
              <p>
                You may use our platform for lawful purposes only, including researching herbal
                medicine, finding practitioners, and accessing educational content.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Prohibited Activities</h3>
              <ul className="list-inside list-disc space-y-2">
                <li>Violating any applicable laws or regulations</li>
                <li>Impersonating others or providing false information</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Scraping or harvesting data without permission</li>
                <li>Distributing malware or harmful code</li>
                <li>Using the platform for commercial purposes without authorization</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Medical Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="mb-2 font-semibold text-yellow-900">Important Notice</p>
              <p className="text-yellow-900">
                The information provided on Verscienta Health is for educational purposes only and
                is not intended as a substitute for professional medical advice, diagnosis, or
                treatment.
              </p>
            </div>
            <p>
              Always seek the advice of your physician or other qualified health provider with any
              questions you may have regarding a medical condition. Never disregard professional
              medical advice or delay in seeking it because of something you have read on our
              platform.
            </p>
            <p>
              The AI Symptom Checker and other tools provide educational information only and should
              not be used for self-diagnosis or self-treatment.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              To access certain features, you may need to create an account. You are responsible
              for:
            </p>
            <ul className="list-inside list-disc space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Ensuring your account information is accurate and current</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Content and Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Our Content</h3>
              <p>
                All content on Verscienta Health, including text, graphics, logos, and software, is
                the property of Verscienta Health and is protected by copyright and other
                intellectual property laws.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">User-Generated Content</h3>
              <p>
                By posting reviews, comments, or other content, you grant us a non-exclusive,
                worldwide, royalty-free license to use, reproduce, and display that content. You
                represent that you have all necessary rights to grant this license.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Practitioner Listings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Verscienta Health provides a directory of practitioners as a service to users. We do
              not:
            </p>
            <ul className="list-inside list-disc space-y-2">
              <li>Employ or control the listed practitioners</li>
              <li>Guarantee the qualifications or quality of services</li>
              <li>Assume liability for practitioner actions or advice</li>
              <li>Mediate disputes between users and practitioners</li>
            </ul>
            <p className="mt-4">
              Users should independently verify practitioner credentials and licensing before
              engaging their services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Third-Party Links and Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Our platform may contain links to third-party websites or integrate third-party
              services. We are not responsible for the content, privacy practices, or terms of these
              external sites and services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Disclaimers and Limitations of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Service "As Is"</h3>
              <p>
                Our platform is provided "as is" without warranties of any kind, either express or
                implied, including but not limited to warranties of merchantability, fitness for a
                particular purpose, or non-infringement.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, Verscienta Health shall not be liable for
                any indirect, incidental, special, consequential, or punitive damages arising from
                your use of the platform.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Indemnification</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              You agree to indemnify and hold harmless Verscienta Health, its officers, directors,
              employees, and agents from any claims, damages, losses, liabilities, and expenses
              arising from your use of the platform or violation of these terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We reserve the right to terminate or suspend your account and access to our platform
              at our sole discretion, without notice, for conduct that we believe violates these
              terms or is harmful to other users or our platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We may modify these terms at any time. We will notify users of material changes by
              posting the updated terms on this page. Your continued use of the platform after such
              changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              These terms shall be governed by and construed in accordance with the laws of the
              jurisdiction in which Verscienta Health operates, without regard to its conflict of
              law provisions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>13. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>If you have questions about these Terms of Service, please contact us at:</p>
            <p className="mt-2">
              Email:{' '}
              <a
                href="mailto:legal@verscientahealth.com"
                className="text-earth-600 hover:text-earth-700"
              >
                legal@verscientahealth.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Terms of Service | Verscienta Health',
  description:
    'Read the Terms of Service for Verscienta Health, including usage guidelines and disclaimers.',
}
