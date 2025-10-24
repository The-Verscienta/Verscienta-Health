# Data Mutations & Updates

**Date**: 2025-10-18
**Next.js Version**: 15.5.4
**Current Pattern**: API Routes + Client Forms
**Recommended**: Server Actions (Next.js 15 native)

## 📊 Overview

Verscienta Health currently implements data mutations using **traditional API Routes** with client-side form handling. This document covers the current implementation and provides a migration path to **Next.js 15 Server Actions** for better performance, security, and developer experience.

---

## 🔄 Current Implementation

### Pattern: API Routes + Client Forms

**Architecture**:
```
┌─────────────────┐
│ Client Component│ ('use client')
│   Contact Form  │
└────────┬────────┘
         │ fetch('/api/contact', { method: 'POST' })
         ▼
┌─────────────────┐
│  API Route      │ (app/api/contact/route.ts)
│  POST handler   │
└────────┬────────┘
         │ Validation + Business Logic
         ▼
┌─────────────────┐
│  Database       │ (Prisma)
│  Email Service  │ (Resend)
└─────────────────┘
```

---

### Example 1: Contact Form

**Client Component** (`app/[lang]/contact/page.tsx`):
```tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      toast.success("Thank you for your message!")
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
```

**API Route** (`app/api/contact/route.ts`):
```tsx
import { NextResponse } from 'next/server'
import { sendContactFormEmail } from '@/lib/email'
import { getTranslations } from 'next-intl/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message, locale = 'en' } = body

    const t = await getTranslations({ locale, namespace: 'api.contact' })

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: t('errors.allFieldsRequired') },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: t('errors.invalidEmail') },
        { status: 400 }
      )
    }

    // Send email
    await sendContactFormEmail({ name, email, subject, message })

    return NextResponse.json({
      success: true,
      message: t('success'),
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
```

---

### Example 2: Profile Update

**Client Component** (`app/[lang]/profile/page.tsx`):
```tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

**API Route** (`app/api/profile/route.ts`):
```tsx
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
  try {
    // Authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, email } = body

    // Validation
    if (!firstName && !lastName && !email) {
      return NextResponse.json(
        { error: 'At least one field is required' },
        { status: 400 }
      )
    }

    // Email uniqueness check
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: session.user.id },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        email: email?.trim(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: updatedUser.name,
        email: updatedUser.email,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
```

---

### Example 3: Password Change

**API Route** (`app/api/settings/password/route.ts`):
```tsx
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Both passwords are required' },
        { status: 400 }
      )
    }

    // HIPAA compliance: minimum 12 characters
    if (newPassword.length < 12) {
      return NextResponse.json(
        { error: 'Password must be at least 12 characters' },
        { status: 400 }
      )
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return NextResponse.json(
        { error: 'Password too weak' },
        { status: 400 }
      )
    }

    // Get account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: 'credential',
      },
    })

    if (!account?.password) {
      return NextResponse.json(
        { error: 'Password auth not enabled' },
        { status: 400 }
      )
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, account.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password incorrect' },
        { status: 400 }
      )
    }

    // Hash and update
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    })

    console.log('Password changed:', {
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
```

---

## ✅ Current Pattern - Strengths

**Advantages**:
1. ✅ **Clear separation** - API routes are easily testable
2. ✅ **RESTful** - Follows standard HTTP methods (GET, POST, PUT, DELETE)
3. ✅ **Explicit** - Easy to understand data flow
4. ✅ **Flexible** - Can be called from anywhere (client, server, external)
5. ✅ **Type-safe** - Full TypeScript support
6. ✅ **Well-established** - Proven pattern with extensive documentation

**Current Implementation Quality**: ✅ Excellent
- Proper authentication checks
- Comprehensive validation
- i18n support for error messages
- Security best practices (HIPAA compliance for passwords)
- Error handling and logging
- Proper HTTP status codes

---

## 🚀 Recommended: Next.js 15 Server Actions

### Why Migrate to Server Actions?

**Benefits**:
1. **Simpler Code** - No need for separate API routes
2. **Better Performance** - Single roundtrip for UI + data updates
3. **Progressive Enhancement** - Forms work without JavaScript
4. **Built-in Loading/Error States** - `useFormState` and `useFormStatus`
5. **Automatic Revalidation** - Easy cache invalidation
6. **Type Safety** - Direct function calls, no serialization needed
7. **Security** - Server-only code, never exposed to client

---

### Migration Example 1: Contact Form

**Before** (Current - API Route):
```
Client Form → fetch('/api/contact') → API Route → Email Service
```

**After** (Server Action):
```
Client Form → Server Action (direct) → Email Service
```

**Server Action** (`app/actions/contact.ts`):
```tsx
'use server'

import { z } from 'zod'
import { sendContactFormEmail } from '@/lib/email'
import { getTranslations } from 'next-intl/server'

// Validation schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  locale: z.string().default('en'),
})

export async function submitContactForm(prevState: any, formData: FormData) {
  // Validate input
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
    locale: formData.get('locale'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed',
    }
  }

  const { name, email, subject, message, locale } = validatedFields.data

  try {
    const t = await getTranslations({ locale, namespace: 'api.contact' })

    await sendContactFormEmail({ name, email, subject, message })

    return {
      success: true,
      message: t('success'),
    }
  } catch (error) {
    console.error('Contact form error:', error)
    return {
      success: false,
      message: 'Failed to send message',
    }
  }
}
```

**Client Form** (with progressive enhancement):
```tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { submitContactForm } from '@/app/actions/contact'
import { toast } from 'sonner'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Sending...' : 'Send Message'}
    </button>
  )
}

export default function ContactPage() {
  const [state, formAction] = useFormState(submitContactForm, null)

  // Show toast on success
  if (state?.success) {
    toast.success(state.message)
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="locale" value="en" />

      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          required
        />
        {state?.errors?.name && (
          <p className="text-red-500">{state.errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
        />
        {state?.errors?.email && (
          <p className="text-red-500">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="subject">Subject</label>
        <input
          id="subject"
          name="subject"
          required
        />
        {state?.errors?.subject && (
          <p className="text-red-500">{state.errors.subject}</p>
        )}
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          required
        />
        {state?.errors?.message && (
          <p className="text-red-500">{state.errors.message}</p>
        )}
      </div>

      <SubmitButton />

      {state?.message && !state.success && (
        <p className="text-red-500">{state.message}</p>
      )}
    </form>
  )
}
```

**Benefits**:
- ✅ Works without JavaScript (progressive enhancement)
- ✅ Built-in loading state with `useFormStatus`
- ✅ Automatic error handling with `useFormState`
- ✅ No manual `fetch()` calls
- ✅ Type-safe with Zod validation
- ✅ Server-only code (email service never exposed)

---

### Migration Example 2: Profile Update with Revalidation

**Server Action** (`app/actions/profile.ts`):
```tsx
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const profileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
})

export async function updateProfile(prevState: any, formData: FormData) {
  // Check authentication
  const session = await auth.api.getSession()

  if (!session) {
    return {
      success: false,
      message: 'Unauthorized',
    }
  }

  // Validate
  const validatedFields = profileSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed',
    }
  }

  const { firstName, lastName, email } = validatedFields.data

  try {
    // Check email uniqueness
    if (email) {
      const existing = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: session.user.id },
        },
      })

      if (existing) {
        return {
          success: false,
          message: 'Email already in use',
        }
      }
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        email: email?.trim(),
      },
    })

    // Revalidate profile page
    revalidatePath('/profile')

    return {
      success: true,
      message: 'Profile updated successfully',
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return {
      success: false,
      message: 'Failed to update profile',
    }
  }
}
```

**Client Form**:
```tsx
'use client'

import { useFormState } from 'react-dom'
import { updateProfile } from '@/app/actions/profile'
import { toast } from 'sonner'
import { useEffect } from 'react'

export default function ProfileForm({ user }) {
  const [state, formAction] = useFormState(updateProfile, null)

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message)
    }
  }, [state])

  return (
    <form action={formAction}>
      <input
        name="firstName"
        defaultValue={user.firstName}
      />
      <input
        name="lastName"
        defaultValue={user.lastName}
      />
      <input
        name="email"
        type="email"
        defaultValue={user.email}
      />

      <button type="submit">Update Profile</button>
    </form>
  )
}
```

---

### Migration Example 3: Optimistic Updates

**For Immediate UI Feedback**:

```tsx
'use client'

import { useOptimistic } from 'react'
import { updateProfile } from '@/app/actions/profile'

export default function ProfileForm({ user }) {
  const [optimisticUser, setOptimisticUser] = useOptimistic(
    user,
    (state, newData) => ({ ...state, ...newData })
  )

  async function formAction(formData: FormData) {
    // Update UI immediately
    setOptimisticUser({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
    })

    // Send to server
    await updateProfile(null, formData)
  }

  return (
    <form action={formAction}>
      <div>Current name: {optimisticUser.firstName} {optimisticUser.lastName}</div>
      <input name="firstName" defaultValue={optimisticUser.firstName} />
      <input name="lastName" defaultValue={optimisticUser.lastName} />
      <button type="submit">Update</button>
    </form>
  )
}
```

**Benefits**:
- ✅ Instant UI updates
- ✅ Automatic rollback on error
- ✅ Better perceived performance

---

## 🔄 Cache Revalidation

### Current Approach: No Automatic Revalidation

**Issue**: After mutations, cached data becomes stale

**Current Workaround**: Manual page refresh or router.refresh()

---

### With Server Actions: Built-in Revalidation

**Option 1: Revalidate by Path**
```tsx
'use server'

import { revalidatePath } from 'next/cache'

export async function updateHerb(slug: string, data: any) {
  // Update in CMS
  await updateHerbInStrapi(slug, data)

  // Revalidate specific page
  revalidatePath(`/herbs/${slug}`)

  // Revalidate herb list
  revalidatePath('/herbs')

  // Revalidate all herb pages (with 'page' type)
  revalidatePath('/herbs', 'page')

  // Revalidate entire layout (recursive)
  revalidatePath('/herbs', 'layout')
}
```

**Option 2: Revalidate by Tag** (More Granular)
```tsx
// In data fetching
fetch('https://api.cms.com/herbs/ginseng', {
  next: {
    revalidate: 3600,
    tags: ['herbs', 'herb-ginseng'] // ✅ Add tags
  }
})

// In Server Action
'use server'

import { revalidateTag } from 'next/cache'

export async function updateHerb(slug: string, data: any) {
  await updateHerbInStrapi(slug, data)

  // Revalidate specific herb
  revalidateTag(`herb-${slug}`)

  // Revalidate all herbs
  revalidateTag('herbs')
}
```

---

## 📊 Comparison: API Routes vs Server Actions

| Feature | API Routes (Current) | Server Actions (Recommended) |
|---------|---------------------|------------------------------|
| **Setup Complexity** | Medium (separate files) | Low (inline or collocated) |
| **Type Safety** | Manual (serialization) | Automatic (direct calls) |
| **Progressive Enhancement** | ❌ No (requires JS) | ✅ Yes (works without JS) |
| **Loading States** | Manual (`useState`) | Built-in (`useFormStatus`) |
| **Error Handling** | Manual (`try/catch`) | Built-in (`useFormState`) |
| **Revalidation** | Manual | Automatic (`revalidatePath`) |
| **Security** | Good (server-side) | Excellent (server-only) |
| **Bundle Size** | Larger (client fetch code) | Smaller (server-only) |
| **Performance** | 2 roundtrips | 1 roundtrip |
| **Streaming** | ❌ No | ✅ Yes |
| **External Access** | ✅ Yes (REST API) | ❌ No (internal only) |

---

## 🚦 Migration Strategy

### Phase 1: Add Server Actions Alongside API Routes

**Start with new features** using Server Actions while keeping existing API routes:

```
apps/web/
├── app/
│   ├── actions/           # ✅ NEW - Server Actions
│   │   ├── contact.ts
│   │   ├── profile.ts
│   │   └── herbs.ts
│   └── api/              # ✅ KEEP - Existing API routes
│       ├── contact/
│       └── profile/
```

**Benefit**: No breaking changes, gradual adoption

---

### Phase 2: Migrate Low-Risk Features

**Priority Order**:
1. ✅ Contact form (read-only, low risk)
2. ✅ Newsletter signup
3. ✅ Feedback forms
4. Profile updates
5. Password changes
6. Account deletion

**Test Each Migration**:
```bash
# Test without JavaScript
curl -X POST https://verscienta.com/contact \
  -d "name=Test&email=test@example.com&subject=Test&message=Hello"
```

---

### Phase 3: Advanced Features

**After validating basic forms**:
- Optimistic updates for instant feedback
- Multi-step forms with progressive disclosure
- Real-time validation with Server Actions
- Streaming responses for long operations

---

### Phase 4: Deprecate API Routes (Optional)

**Keep API Routes if**:
- External integrations need REST API
- Mobile app requires endpoints
- Third-party services call your API

**Migrate to Server Actions if**:
- Only used by your own frontend
- No external consumers
- Want better performance

---

## 🎯 Best Practices

### 1. Always Use Zod for Validation

**Why**: Type-safe, reusable, clear error messages

```tsx
'use server'

import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(12, 'Min 12 characters'),
})

export async function signup(formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Proceed with validated data
}
```

---

### 2. Use Revalidation After Mutations

```tsx
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function createHerb(formData: FormData) {
  // Create herb
  const herb = await prisma.herb.create({...})

  // Revalidate herb list
  revalidatePath('/herbs')

  // Revalidate by tag
  revalidateTag('herbs')

  return { success: true, herb }
}
```

---

### 3. Handle Authentication in Server Actions

```tsx
'use server'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function protectedAction(formData: FormData) {
  const session = await auth.api.getSession()

  if (!session) {
    redirect('/login')
  }

  // Proceed with authenticated action
}
```

---

### 4. Use Optimistic Updates Sparingly

**When to Use**:
- ✅ Simple updates (like/favorite)
- ✅ Low-risk operations
- ✅ Fast server responses expected

**When NOT to Use**:
- ❌ Complex validation required
- ❌ High chance of failure
- ❌ Financial transactions

---

### 5. Provide Good Error Messages

```tsx
'use server'

export async function updateProfile(formData: FormData) {
  try {
    // Update logic
  } catch (error) {
    if (error.code === 'P2002') {
      return {
        success: false,
        message: 'Email already in use',
      }
    }

    console.error('Profile update error:', error)
    return {
      success: false,
      message: 'Unexpected error occurred',
    }
  }
}
```

---

## 🎯 Summary

### Current Status: ✅ Solid Foundation

**Strengths**:
- ✅ Well-structured API routes
- ✅ Proper authentication and validation
- ✅ i18n support for error messages
- ✅ Security best practices (HIPAA-compliant passwords)
- ✅ Comprehensive error handling
- ✅ Good separation of concerns

**Current Pattern**: Production-ready and well-implemented

---

### Recommended Evolution

**Why Consider Server Actions**:
1. **Better Performance** - Single roundtrip vs two
2. **Simpler Code** - No separate API routes needed
3. **Progressive Enhancement** - Works without JavaScript
4. **Built-in Features** - Loading/error states, revalidation
5. **Type Safety** - No serialization, direct function calls
6. **Future-Proof** - Next.js recommended pattern

**Migration Path**:
1. **Phase 1**: Add Server Actions for new features
2. **Phase 2**: Migrate low-risk forms (contact, newsletter)
3. **Phase 3**: Add advanced features (optimistic updates)
4. **Phase 4**: Keep or deprecate API routes based on needs

**Recommendation**: Start using Server Actions for new features while keeping existing API routes for:
- External integrations
- Mobile app endpoints
- Third-party consumers

---

**Last Updated**: 2025-10-18
**Current Pattern**: API Routes + Client Forms ✅
**Recommended**: Server Actions (gradual migration)
**Status**: Production Ready, Optional Enhancement Available
