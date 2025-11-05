/**
 * Access Control Functions
 *
 * Reusable access control patterns for PayloadCMS collections.
 * These functions return boolean (grant/deny all) or query objects (filter results).
 */

import type { Access, AccessArgs } from 'payload'

/**
 * Admin-only access
 * Returns true only if user has 'admin' role
 */
export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}

/**
 * Admin or Editor access
 * Returns true if user has 'admin' or 'editor' role
 */
export const isAdminOrEditor: Access = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'editor'
}

/**
 * Admin or Practitioner access
 * Returns true if user has 'admin' or 'practitioner' role
 */
export const isAdminOrPractitioner: Access = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'practitioner'
}

/**
 * Admin or Herbalist access
 * Returns true if user has 'admin' or 'herbalist' role
 */
export const isAdminOrHerbalist: Access = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'herbalist'
}

/**
 * Admin or Self access
 * Returns query that filters to admin OR user's own documents
 * Use for user profiles where users can only edit their own data
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  // Admins can access all
  if (user?.role === 'admin') {
    return true
  }

  // Regular users can only access their own documents
  if (user?.id) {
    return {
      id: {
        equals: user.id,
      },
    }
  }

  // Not authenticated
  return false
}

/**
 * Admin or document creator
 * Returns query that filters to admin OR user who created the document
 * Use for collections where users should only edit their own created content
 */
export const isAdminOrCreator: Access = ({ req: { user } }) => {
  // Admins can access all
  if (user?.role === 'admin') {
    return true
  }

  // Users can only access documents they created
  if (user?.id) {
    return {
      createdBy: {
        equals: user.id,
      },
    }
  }

  // Not authenticated
  return false
}

/**
 * Authenticated users
 * Returns true if any user is logged in
 */
export const isAuthenticated: Access = ({ req: { user } }) => {
  return Boolean(user)
}

/**
 * Public read access
 * Always returns true - allows public access
 */
export const isPublic: Access = () => {
  return true
}

/**
 * Published documents only
 * Returns query that filters to only published documents
 * Use for public-facing content with draft/published workflow
 */
export const isPublished: Access = () => {
  return {
    _status: {
      equals: 'published',
    },
  }
}

/**
 * Published or Admin
 * Admins see all, public sees only published
 */
export const isPublishedOrAdmin: Access = ({ req: { user } }) => {
  // Admins can see drafts
  if (user?.role === 'admin') {
    return true
  }

  // Public can only see published
  return {
    _status: {
      equals: 'published',
    },
  }
}

/**
 * Practitioner can edit their own profile
 * Returns query that filters to practitioner's linked profile
 */
export const isPractitionerProfile: Access = ({ req: { user } }) => {
  // Admins can edit all
  if (user?.role === 'admin') {
    return true
  }

  // Practitioners can only edit their own profile
  if (user?.role === 'practitioner' && user?.id) {
    return {
      userId: {
        equals: user.id,
      },
    }
  }

  return false
}

/**
 * User can only access their own reviews
 * Use for review collections where users manage their own reviews
 */
export const isOwnReview: Access = ({ req: { user } }) => {
  // Admins can access all
  if (user?.role === 'admin') {
    return true
  }

  // Users can only access their own reviews
  if (user?.id) {
    return {
      user: {
        equals: user.id,
      },
    }
  }

  return false
}

/**
 * Verified practitioners only
 * Returns true if user is a verified practitioner or admin
 */
export const isVerifiedPractitioner: Access = ({ req: { user } }) => {
  if (user?.role === 'admin') {
    return true
  }

  // Check if practitioner is verified (would need to query practitioners collection)
  return user?.role === 'practitioner' && user?.verified === true
}

/**
 * HIPAA-compliant PHI access
 * Strict access control for Protected Health Information
 * Only admin and the user themselves can access
 */
export const isPHIAuthorized: Access = ({ req: { user } }) => {
  // Admins can access for compliance/support
  if (user?.role === 'admin') {
    return true
  }

  // Users can only access their own PHI
  if (user?.id) {
    return {
      userId: {
        equals: user.id,
      },
    }
  }

  return false
}
