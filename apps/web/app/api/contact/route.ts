import { NextResponse } from 'next/server'
import { sendContactFormEmail } from '@/lib/email'
import { getTranslations } from 'next-intl/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message, locale = 'en' } = body

    // Get translations based on provided locale or default to 'en'
    const t = await getTranslations({ locale, namespace: 'api.contact' })

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: t('errors.allFieldsRequired') }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: t('errors.invalidEmail') }, { status: 400 })
    }

    // Send email notification to admin
    await sendContactFormEmail({ name, email, subject, message })

    return NextResponse.json({
      success: true,
      message: t('success'),
    })
  } catch (error) {
    console.error('Contact form error:', error)
    const locale = (await request.json()).locale || 'en'
    const t = await getTranslations({ locale, namespace: 'api.contact' })
    return NextResponse.json({ error: t('errors.serverError') }, { status: 500 })
  }
}
