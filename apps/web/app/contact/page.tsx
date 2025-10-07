'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Implement actual contact form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success('Thank you for your message! We\'ll get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)
  }

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold font-serif text-earth-900 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600">
          Have a question, suggestion, or feedback? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-600 resize-none"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email</CardTitle>
            </CardHeader>
            <CardContent className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-earth-600 flex-shrink-0 mt-0.5" />
              <div>
                <a
                  href="mailto:info@verscientahealth.com"
                  className="text-earth-600 hover:text-earth-700"
                >
                  info@verscientahealth.com
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              <p>For technical support or account issues:</p>
              <a
                href="mailto:support@verscientahealth.com"
                className="text-earth-600 hover:text-earth-700"
              >
                support@verscientahealth.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Practitioner Inquiries</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              <p>Interested in joining our practitioner directory?</p>
              <a
                href="mailto:practitioners@verscientahealth.com"
                className="text-earth-600 hover:text-earth-700"
              >
                practitioners@verscientahealth.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Response Time</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600">
              We typically respond to all inquiries within 1-2 business days.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Contact Us | Verscienta Health',
  description: 'Get in touch with Verscienta Health. We\'re here to answer your questions about herbal medicine and our platform.',
}
