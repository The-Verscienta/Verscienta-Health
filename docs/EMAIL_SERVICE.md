# Email Service Documentation

The Verscienta Health platform uses [Resend](https://resend.com) for all email communications. This document describes the email service implementation and available email types.

## Table of Contents

- [Setup](#setup)
- [Email Types](#email-types)
- [Configuration](#configuration)
- [Testing](#testing)
- [Templates](#templates)

## Setup

### Prerequisites

1. **Resend Account**: Sign up at https://resend.com
2. **API Key**: Generate an API key from your Resend dashboard
3. **Verified Domain**: Add and verify your sending domain in Resend

### Environment Variables

Add the following to your `.env` file:

```bash
# Required
RESEND_API_KEY=re_your_api_key_here

# Optional (with defaults)
EMAIL_FROM=Verscienta Health <noreply@verscientahealth.com>
ADMIN_EMAIL=admin@verscientahealth.com
```

## Email Types

### Web Application (`apps/web/lib/email.ts`)

#### 1. Magic Link Authentication
Sends passwordless authentication links to users.

```typescript
await sendMagicLinkEmail({
  email: 'user@example.com',
  url: 'https://app.verscientahealth.com/auth/verify?token=...'
})
```

**Features:**
- 5-minute expiration
- Responsive HTML template
- Clear call-to-action button
- Fallback URL link

#### 2. Contact Form Submissions
Forwards contact form submissions to admin with reply-to functionality.

```typescript
await sendContactFormEmail({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Product Inquiry',
  message: 'I have a question about...'
})
```

**Features:**
- Reply-to address set to user's email
- Structured HTML formatting
- Message preserved with line breaks

#### 3. Admin Notifications
General purpose notifications for admins.

```typescript
await sendAdminNotification({
  subject: 'System Event',
  message: 'Important update occurred',
  details: {
    event: 'user_registration',
    count: 5,
    timestamp: new Date()
  }
})
```

#### 4. Security Alerts
Critical security notifications with high visual priority.

```typescript
await sendSecurityAlert({
  type: 'suspicious_activity',
  message: 'Possible DoS attack detected',
  details: {
    ip: '192.168.1.1',
    requestCount: 1500,
    endpoint: '/api/herbs'
  }
})
```

**Alert Types:**
- `suspicious_activity` - Unusual behavior detected
- `failed_login` - Multiple failed login attempts
- `account_lockout` - Account temporarily locked

### CMS Application (`apps/cms/src/lib/email.ts`)

#### 1. Cron Job Completion
Sends summary statistics when cron jobs complete.

```typescript
await sendCronJobCompletionEmail({
  jobName: 'Trefle Data Import',
  stats: {
    'Plants Processed': 120,
    'Herbs Created': 45,
    'Herbs Updated': 30,
    'Errors': 0
  },
  duration: 125.5 // seconds
})
```

**Features:**
- Color-coded success/error states
- Formatted statistics table
- Execution duration
- Timestamp

#### 2. Validation Errors
Sends detailed validation error reports to admins.

```typescript
await sendValidationErrorEmail({
  jobName: 'Herb Data Validation',
  errors: [
    {
      field: 'scientificName',
      message: 'Invalid format',
      recordId: 'herb_123'
    }
  ],
  totalRecords: 500
})
```

**Features:**
- Tabular error display
- Record ID tracking
- Error context
- Limited to first 20 errors (with count of remaining)

#### 3. Job Failure Alerts
Critical alerts when cron jobs fail.

```typescript
await sendJobFailureAlert({
  jobName: 'Trefle Import',
  error: 'API rate limit exceeded',
  stackTrace: error.stack
})
```

**Features:**
- Red alert styling
- Full error message
- Collapsible stack trace
- Timestamp

## Configuration

### Email Check

All email functions check if the service is configured:

```typescript
if (!isEmailConfigured()) {
  console.warn('Email service not configured. Skipping...')
  return
}
```

This allows the application to run without email service in development.

### Error Handling

All email functions include error handling:

```typescript
try {
  await resend.emails.send(...)
} catch (error) {
  console.error('Email error:', error)
  // Application continues without throwing
}
```

## Testing

### Local Development

For local development without a Resend account:

1. **Console Logging**: Email details are logged to console when service is not configured
2. **Mock Mode**: Set `RESEND_API_KEY=""` to enable console-only mode

### Test Emails

Send test emails using the Resend dashboard:

1. Navigate to **API Keys** → **Testing**
2. Use test mode API key (starts with `re_test_`)
3. Emails sent with test keys won't actually be delivered but will appear in Resend logs

### Email Preview

Before sending, preview emails in Resend:

```bash
# Install Resend CLI
npm install -g resend-cli

# Preview email
resend preview
```

## Templates

### HTML Email Structure

All emails follow this responsive structure:

```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <!-- Header with color-coded background -->
  <div style="background-color: #...">
    <h2>Subject</h2>
  </div>

  <!-- Content -->
  <div style="border: 1px solid #...">
    <!-- Email content -->
  </div>
</div>
```

### Color Scheme

- **Success**: `#16a34a` (green)
- **Warning**: `#f59e0b` (amber)
- **Error**: `#dc2626` (red)
- **Info**: `#2d5016` (earth green)

### Best Practices

1. **Inline Styles**: All styles are inline for maximum compatibility
2. **Max Width**: 600px for optimal mobile/desktop viewing
3. **Fallbacks**: Plain text versions included automatically by Resend
4. **Accessibility**: Clear heading hierarchy and semantic HTML

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set correctly
2. **Domain Verification**: Ensure sending domain is verified in Resend
3. **Rate Limits**: Free tier has 100 emails/day limit
4. **Check Logs**: Review console output for error messages

### Emails Going to Spam

1. **SPF/DKIM**: Ensure DNS records are properly configured
2. **DMARC**: Add DMARC record for your domain
3. **Sender Reputation**: Warm up your domain gradually
4. **Content**: Avoid spam trigger words and excessive links

### Common Errors

```bash
# Error: "Domain not verified"
# Solution: Add and verify domain in Resend dashboard

# Error: "Invalid API key"
# Solution: Check RESEND_API_KEY format (should start with re_)

# Error: "Rate limit exceeded"
# Solution: Upgrade Resend plan or reduce email volume
```

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Email Best Practices](https://resend.com/docs/best-practices)
- [Transactional Email Guide](https://resend.com/docs/guides/transactional-emails)
