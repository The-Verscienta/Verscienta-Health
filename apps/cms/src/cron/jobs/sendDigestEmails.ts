import type { Payload } from 'payload'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface DigestStats {
  emailsSent: number
  newHerbs: number
  newFormulas: number
  newConditions: number
  newPractitioners: number
  errors: number
}

export async function sendDigestEmailsJob(payload: Payload): Promise<void> {
  console.log('📧 Starting weekly digest email job...')

  const stats: DigestStats = {
    emailsSent: 0,
    newHerbs: 0,
    newFormulas: 0,
    newConditions: 0,
    newPractitioners: 0,
    errors: 0,
  }

  try {
    // Check if email service is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('⏭️  Email service not configured, skipping')
      return
    }

    // Get content added in the last 7 days
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const digestContent = await gatherDigestContent(payload, oneWeekAgo, stats)

    // If there's no new content, skip sending
    if (
      stats.newHerbs === 0 &&
      stats.newFormulas === 0 &&
      stats.newConditions === 0 &&
      stats.newPractitioners === 0
    ) {
      console.log('⏭️  No new content this week, skipping digest')
      return
    }

    // Get subscribers
    const subscribers = await getDigestSubscribers(payload)

    if (subscribers.length === 0) {
      console.log('⏭️  No digest subscribers, skipping')
      return
    }

    console.log(`📬 Sending digest to ${subscribers.length} subscribers...`)

    // Send emails in batches to avoid rate limits
    const batchSize = 100
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)

      await Promise.all(
        batch.map((subscriber) =>
          sendDigestEmail(subscriber, digestContent, stats)
        )
      )

      // Add a small delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    console.log(`✅ Digest emails sent: ${stats.emailsSent}/${subscribers.length}`)

    // Log digest job results
    await payload.create({
      collection: 'import-logs',
      data: {
        type: 'digest-emails',
        results: stats,
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('❌ Digest email job failed:', error)
    throw error
  }
}

async function gatherDigestContent(
  payload: Payload,
  since: Date,
  stats: DigestStats
): Promise<{
  herbs: any[]
  formulas: any[]
  conditions: any[]
  practitioners: any[]
}> {
  const content = {
    herbs: [],
    formulas: [],
    conditions: [],
    practitioners: [],
  }

  try {
    // Fetch new herbs
    const herbs = await payload.find({
      collection: 'herbs',
      where: {
        and: [
          {
            status: {
              equals: 'published',
            },
          },
          {
            publishedAt: {
              greater_than: since.toISOString(),
            },
          },
        ],
      },
      limit: 10,
      sort: '-publishedAt',
    })

    content.herbs = herbs.docs
    stats.newHerbs = herbs.totalDocs

    // Fetch new formulas
    const formulas = await payload.find({
      collection: 'formulas',
      where: {
        and: [
          {
            status: {
              equals: 'published',
            },
          },
          {
            publishedAt: {
              greater_than: since.toISOString(),
            },
          },
        ],
      },
      limit: 10,
      sort: '-publishedAt',
    })

    content.formulas = formulas.docs
    stats.newFormulas = formulas.totalDocs

    // Fetch new conditions
    const conditions = await payload.find({
      collection: 'conditions',
      where: {
        and: [
          {
            status: {
              equals: 'published',
            },
          },
          {
            publishedAt: {
              greater_than: since.toISOString(),
            },
          },
        ],
      },
      limit: 10,
      sort: '-publishedAt',
    })

    content.conditions = conditions.docs
    stats.newConditions = conditions.totalDocs

    // Fetch new practitioners
    const practitioners = await payload.find({
      collection: 'practitioners',
      where: {
        and: [
          {
            status: {
              equals: 'published',
            },
          },
          {
            publishedAt: {
              greater_than: since.toISOString(),
            },
          },
        ],
      },
      limit: 5,
      sort: '-publishedAt',
    })

    content.practitioners = practitioners.docs
    stats.newPractitioners = practitioners.totalDocs
  } catch (error) {
    console.error('Failed to gather digest content:', error)
  }

  return content
}

async function getDigestSubscribers(payload: Payload): Promise<any[]> {
  try {
    // Fetch users who are subscribed to weekly digest
    const users = await payload.find({
      collection: 'users',
      where: {
        and: [
          {
            emailVerified: {
              equals: true,
            },
          },
          {
            'preferences.weeklyDigest': {
              equals: true,
            },
          },
        ],
      },
      limit: 10000,
      select: {
        email: true,
        name: true,
        id: true,
      },
    })

    return users.docs
  } catch (error) {
    console.error('Failed to fetch subscribers:', error)
    return []
  }
}

async function sendDigestEmail(
  subscriber: any,
  content: {
    herbs: any[]
    formulas: any[]
    conditions: any[]
    practitioners: any[]
  },
  stats: DigestStats
): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://verscienta.com'

    // Build HTML email
    const html = buildDigestEmailHTML(subscriber, content, baseUrl)

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@verscienta.com',
      to: subscriber.email,
      subject: `Verscienta Weekly Digest - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      html,
    })

    stats.emailsSent++
  } catch (error) {
    console.error(`Failed to send digest to ${subscriber.email}:`, error)
    stats.errors++
  }
}

function buildDigestEmailHTML(
  subscriber: any,
  content: {
    herbs: any[]
    formulas: any[]
    conditions: any[]
    practitioners: any[]
  },
  baseUrl: string
): string {
  const { herbs, formulas, conditions, practitioners } = content

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verscienta Weekly Digest</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #5d7a5d;
      border-bottom: 3px solid #5d7a5d;
      padding-bottom: 10px;
    }
    h2 {
      color: #5d7a5d;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .item {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .item:last-child {
      border-bottom: none;
    }
    .item-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .item-title a {
      color: #5d7a5d;
      text-decoration: none;
    }
    .item-title a:hover {
      text-decoration: underline;
    }
    .item-description {
      color: #666;
      font-size: 14px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    .footer a {
      color: #5d7a5d;
      text-decoration: none;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      background-color: #5d7a5d;
      color: white;
      border-radius: 12px;
      font-size: 12px;
      margin-right: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌿 Verscienta Weekly Digest</h1>
    <p>Hi ${subscriber.name || 'there'},</p>
    <p>Here's what's new on Verscienta this week:</p>
`

  // Add herbs section
  if (herbs.length > 0) {
    html += `
    <h2>🌱 New Herbs (${herbs.length})</h2>
`
    for (const herb of herbs) {
      html += `
    <div class="item">
      <div class="item-title">
        <a href="${baseUrl}/herbs/${herb.slug}">${herb.name}</a>
      </div>
      ${herb.scientificName ? `<div style="font-style: italic; color: #888; font-size: 14px;">${herb.scientificName}</div>` : ''}
      ${herb.description ? `<div class="item-description">${truncateText(herb.description, 150)}</div>` : ''}
    </div>
`
    }
  }

  // Add formulas section
  if (formulas.length > 0) {
    html += `
    <h2>📋 New Formulas (${formulas.length})</h2>
`
    for (const formula of formulas) {
      html += `
    <div class="item">
      <div class="item-title">
        <a href="${baseUrl}/formulas/${formula.slug}">${formula.name}</a>
      </div>
      ${formula.tradition ? `<span class="badge">${formula.tradition}</span>` : ''}
      ${formula.description ? `<div class="item-description">${truncateText(formula.description, 150)}</div>` : ''}
    </div>
`
    }
  }

  // Add conditions section
  if (conditions.length > 0) {
    html += `
    <h2>🏥 New Conditions (${conditions.length})</h2>
`
    for (const condition of conditions) {
      html += `
    <div class="item">
      <div class="item-title">
        <a href="${baseUrl}/conditions/${condition.slug}">${condition.name}</a>
      </div>
      ${condition.description ? `<div class="item-description">${truncateText(condition.description, 150)}</div>` : ''}
    </div>
`
    }
  }

  // Add practitioners section
  if (practitioners.length > 0) {
    html += `
    <h2>👨‍⚕️ New Practitioners (${practitioners.length})</h2>
`
    for (const practitioner of practitioners) {
      html += `
    <div class="item">
      <div class="item-title">
        <a href="${baseUrl}/practitioners/${practitioner.slug}">${practitioner.name}</a>
      </div>
      ${practitioner.location ? `<div style="font-size: 14px; color: #888;">📍 ${practitioner.location}</div>` : ''}
      ${practitioner.specialties && practitioner.specialties.length > 0 ? `<div style="margin-top: 5px;">${practitioner.specialties.map((s: string) => `<span class="badge">${s}</span>`).join('')}</div>` : ''}
    </div>
`
    }
  }

  html += `
    <div class="footer">
      <p>
        <a href="${baseUrl}">Visit Verscienta</a> |
        <a href="${baseUrl}/account/preferences">Manage Preferences</a> |
        <a href="${baseUrl}/unsubscribe?id=${subscriber.id}">Unsubscribe</a>
      </p>
      <p>© ${new Date().getFullYear()} Verscienta Health. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`

  return html
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}
