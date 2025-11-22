# Email Templates

Professional email templates for Verscienta Health using React Email.

## Features

- 🎨 **Branded Design**: Consistent Verscienta Health branding across all emails
- ⚡ **React Components**: Type-safe, maintainable email templates
- 📱 **Responsive**: Mobile-friendly email layouts
- 🔒 **Security-focused**: HIPAA-compliant messaging and warnings
- 🌐 **Internationalization-ready**: Easy to translate and localize

## Architecture

```
emails/
├── components/          # Reusable email components
│   ├── Layout.tsx      # Base layout with header/footer
│   ├── Button.tsx      # CTA buttons
│   ├── Heading.tsx     # Typography components
│   └── Paragraph.tsx   # Text components
├── templates/          # Email templates
│   ├── WelcomeEmail.tsx
│   ├── EmailVerificationEmail.tsx
│   ├── MagicLinkEmail.tsx
│   ├── PasswordResetEmail.tsx
│   ├── MfaSetupEmail.tsx
│   ├── MfaBackupCodesEmail.tsx
│   └── SecurityAlertEmail.tsx
└── index.ts            # Exports
```

## Available Templates

### 1. Welcome Email
Sent to new users after registration.
- Personalized greeting
- Getting started guide
- Quick links to key features

### 2. Email Verification
Sent when users need to verify their email address.
- Verification link with expiration
- Security notice

### 3. Magic Link
Passwordless authentication email.
- One-time sign-in link
- Expiration notice

### 4. Password Reset
Sent when users request password reset.
- Reset link with expiration
- IP address for security
- Warning if not requested

### 5. MFA Setup
Confirmation email when 2FA is enabled.
- Setup confirmation
- Security tips
- Backup code reminder

### 6. MFA Backup Codes
Sent with backup codes for 2FA.
- List of 10 backup codes
- Usage instructions
- Security warnings

### 7. Security Alert
Sent for suspicious activity.
- Alert type: suspicious_login, password_changed, account_lockout, unusual_activity
- Activity details (time, IP, location, device)
- Action recommendations

## Usage

### Import Templates

```typescript
import {
  WelcomeEmail,
  EmailVerificationEmail,
  MagicLinkEmail,
  PasswordResetEmail,
  MfaSetupEmail,
  MfaBackupCodesEmail,
  SecurityAlertEmail,
} from '@/emails'
```

### Send Emails (using lib/email.ts service)

```typescript
import { sendWelcomeEmail, sendPasswordResetEmail } from '@/lib/email'

// Send welcome email
await sendWelcomeEmail({
  email: 'user@example.com',
  firstName: 'John',
})

// Send password reset
await sendPasswordResetEmail({
  email: 'user@example.com',
  resetUrl: 'https://verscienta.com/reset?token=...',
  expiresInMinutes: 15,
  ipAddress: '192.168.1.1',
})
```

## Preview Templates (Development Only)

Visit the email preview API in your browser:

```
http://localhost:3000/api/dev/email-preview?template=welcome&firstName=John
```

### Available Preview URLs

- **Welcome**: `/api/dev/email-preview?template=welcome&firstName=John`
- **Email Verification**: `/api/dev/email-preview?template=email-verification`
- **Magic Link**: `/api/dev/email-preview?template=magic-link`
- **Password Reset**: `/api/dev/email-preview?template=password-reset`
- **MFA Setup**: `/api/dev/email-preview?template=mfa-setup&firstName=John`
- **MFA Backup Codes**: `/api/dev/email-preview?template=mfa-backup-codes`
- **Security Alert (Suspicious)**: `/api/dev/email-preview?template=security-alert-suspicious`
- **Security Alert (Password)**: `/api/dev/email-preview?template=security-alert-password`
- **Security Alert (Lockout)**: `/api/dev/email-preview?template=security-alert-lockout`

Query parameters:
- `template`: Template name (required)
- `email`: User email (default: user@example.com)
- `firstName`: User first name (default: John)

## Integration Points

### 1. Better Auth Hooks (lib/auth.ts)

- ✅ **Sign-up**: Sends welcome email automatically
- ✅ **Magic Link**: Already integrated
- ✅ **Email Verification**: Built-in with better-auth

### 2. MFA Setup (app/api/auth/mfa/setup/route.ts)

- ✅ **MFA Setup Email**: Sent when 2FA is enabled
- ✅ **Backup Codes Email**: Sent with backup codes

### 3. Security Monitoring (to be integrated)

- ⏳ **Suspicious Login**: Integrate with security-monitor.ts
- ⏳ **Password Changed**: Add to password change endpoint
- ⏳ **Account Lockout**: Integrate with account-lockout.ts

## Environment Variables

Required in `.env`:

```bash
# Resend API
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@verscienta.com

# Optional
ADMIN_EMAIL=admin@verscienta.com
NEXT_PUBLIC_APP_URL=https://verscienta.com
```

## Testing

### Manual Testing (Development)

1. Start the dev server: `pnpm dev`
2. Visit preview URLs (see above)
3. Check responsive design on mobile

### Automated Testing

```bash
# Run email rendering tests (to be added)
pnpm test:email
```

## Customization

### Brand Colors

Primary green: `#2d5016`

Update in:
- `components/Layout.tsx` (header background)
- `components/Button.tsx` (primary button)
- `components/Heading.tsx` (heading color)

### Email Copy

All email content is in the template files. Update as needed:
- Tone: Professional, helpful, security-conscious
- Length: Concise but complete
- Call-to-actions: Clear and prominent

### Logo

Update logo URL in `components/Layout.tsx`:
```typescript
src="https://verscienta.com/logo.png"
```

Make sure logo is:
- 150x50px or similar aspect ratio
- PNG format with transparency
- Hosted on CDN for fast loading

## Best Practices

1. **Test in Multiple Email Clients**
   - Gmail, Outlook, Apple Mail
   - Mobile and desktop
   - Dark mode support

2. **Keep It Simple**
   - Avoid complex layouts
   - Use table-based layouts for compatibility
   - Inline CSS only

3. **Accessibility**
   - Alt text for images
   - Semantic HTML
   - Sufficient color contrast

4. **Security**
   - Never include sensitive data in URLs
   - Use HTTPS for all links
   - Include security warnings where appropriate

5. **Legal**
   - Include unsubscribe links (for marketing emails)
   - Privacy policy link in footer
   - HIPAA-compliant messaging

## Troubleshooting

### Email Not Sending

1. Check `RESEND_API_KEY` is set
2. Check `isEmailConfigured()` returns true
3. Check logs for error messages
4. Verify Resend account is active

### Email Looks Broken

1. Test in email preview tool first
2. Check for inline CSS issues
3. Verify image URLs are accessible
4. Test in multiple email clients

### Wrong Email Being Sent

1. Check hook integration points
2. Verify correct function is called
3. Check email service routing logic

## Future Enhancements

- [ ] Plain text versions for all emails
- [ ] Email analytics tracking
- [ ] A/B testing support
- [ ] Multi-language templates (i18n)
- [ ] Scheduled emails
- [ ] Email queue system
- [ ] Unsubscribe management
- [ ] Email preferences center

## Resources

- [React Email Documentation](https://react.email/docs)
- [Resend Documentation](https://resend.com/docs)
- [Better Auth Email Guide](https://www.better-auth.com/docs)
- [Email on Acid](https://www.emailonacid.com/) - Email testing tool
