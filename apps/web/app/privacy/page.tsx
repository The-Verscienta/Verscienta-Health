import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="container-custom max-w-4xl py-12">
      <h1 className="text-earth-900 mb-8 font-serif text-4xl font-bold">Privacy Policy</h1>

      <div className="space-y-6 text-gray-700">
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold">Account Information</h3>
              <p>
                When you create an account, we collect your name, email address, and password. You
                may also optionally provide additional profile information.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Usage Information</h3>
              <p>
                We collect information about how you use our platform, including search queries,
                pages viewed, and features accessed. This helps us improve our services.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Device and Technical Information</h3>
              <p>
                We automatically collect certain technical information, including IP address,
                browser type, device type, and operating system.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-inside list-disc space-y-2">
              <li>To provide and maintain our services</li>
              <li>To personalize your experience and provide recommendations</li>
              <li>To communicate with you about updates and features</li>
              <li>To improve our platform and develop new features</li>
              <li>To ensure security and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Information Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We do not sell your personal information to third parties. We may share your
              information only in the following circumstances:
            </p>
            <ul className="list-inside list-disc space-y-2">
              <li>With your explicit consent</li>
              <li>With service providers who assist in operating our platform</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or
              destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>You have the right to:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Export your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We use cookies and similar tracking technologies to enhance your experience, analyze
              usage patterns, and deliver personalized content. You can control cookie settings
              through your browser preferences.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Our platform integrates with third-party services:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>Algolia (search functionality)</li>
              <li>Cloudflare (CDN and image delivery)</li>
              <li>Grok AI (symptom analysis)</li>
              <li>Better Auth (authentication)</li>
            </ul>
            <p className="mt-4">
              These services have their own privacy policies governing their use of your
              information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Our services are not directed to individuals under 18 years of age. We do not
              knowingly collect personal information from children.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              If you have questions about this privacy policy or our data practices, please contact
              us at:
            </p>
            <p className="mt-2">
              Email:{' '}
              <a
                href="mailto:privacy@verscientahealth.com"
                className="text-earth-600 hover:text-earth-700"
              >
                privacy@verscientahealth.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Privacy Policy | Verscienta Health',
  description:
    'Learn how Verscienta Health collects, uses, and protects your personal information.',
}
