import { redirect } from 'next/navigation'
import { routing } from '../i18n/routing'

/**
 * Root Page - Redirects to Default Locale
 *
 * This page handles requests to the root path (/) and redirects to the default locale.
 * Required for production builds where prerendering bypasses middleware.
 *
 * In development, the middleware handles this redirect.
 * In production with prerendered pages, we need this page to redirect.
 */
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`)
}
