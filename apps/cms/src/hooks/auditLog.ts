import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

interface AuditLogData {
  user: string
  action: string
  resource: string
  resourceId?: string
  changes?: any
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
  metadata?: any
  severity?: 'info' | 'warning' | 'critical'
  success: boolean
  errorMessage?: string
}

// Helper to create audit log entries
export async function createAuditLog(payload: any, data: AuditLogData): Promise<void> {
  try {
    await payload.create({
      collection: 'audit-logs',
      data,
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

// Get client IP and user agent from request
function getRequestMetadata(req: any) {
  return {
    ipAddress: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || req.ip,
    userAgent: req.headers?.['user-agent'],
  }
}

// Determine severity based on action and resource
function determineSeverity(action: string, resource: string): 'info' | 'warning' | 'critical' {
  if (action === 'delete') return 'warning'
  if (resource === 'users' && ['update', 'delete'].includes(action)) return 'warning'
  if (resource === 'herbs' && action === 'update') return 'info' // Track safety data changes
  return 'info'
}

// Hook for tracking changes
export const auditLogAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  collection,
  req,
}) => {
  // Skip if no user (system operations)
  if (!req.user?.id) return doc

  const action = operation === 'create' ? 'create' : 'update'
  const metadata = getRequestMetadata(req)

  // Calculate changes for updates
  let changes: Record<string, any> = {}
  let oldValues: Record<string, any> = {}
  let newValues: Record<string, any> = {}

  if (operation === 'update' && previousDoc) {
    // Compare old and new values
    Object.keys(doc).forEach((key) => {
      if (JSON.stringify(doc[key]) !== JSON.stringify(previousDoc[key])) {
        changes[key] = {
          from: previousDoc[key],
          to: doc[key],
        }
        oldValues[key] = previousDoc[key]
        newValues[key] = doc[key]
      }
    })
  }

  // Special handling for sensitive fields
  const isSensitiveResource = ['users', 'herbs'].includes(collection.slug)
  const severity = determineSeverity(action, collection.slug)

  await createAuditLog(req.payload, {
    user: String(req.user.id),
    action,
    resource: collection.slug,
    resourceId: String(doc.id),
    changes: operation === 'update' ? changes : undefined,
    oldValues: operation === 'update' ? oldValues : undefined,
    newValues: operation === 'create' ? doc : newValues,
    ...metadata,
    severity: isSensitiveResource ? 'warning' : severity,
    success: true,
  })

  return doc
}

// Hook for tracking deletions
export const auditLogAfterDelete: CollectionAfterDeleteHook = async ({
  req,
  id,
  doc,
  collection,
}) => {
  // Skip if no user
  if (!req.user?.id) return doc

  const metadata = getRequestMetadata(req)

  await createAuditLog(req.payload, {
    user: String(req.user.id),
    action: 'delete',
    resource: collection.slug,
    resourceId: String(id),
    oldValues: doc,
    ...metadata,
    severity: 'warning',
    success: true,
  })

  return doc
}

// Hook for tracking login attempts
export async function logLoginAttempt(
  payload: any,
  userId: string | null,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string
): Promise<void> {
  await createAuditLog(payload, {
    user: userId || 'anonymous',
    action: success ? 'login' : 'login_failed',
    resource: 'system',
    ipAddress,
    userAgent,
    severity: success ? 'info' : 'warning',
    success,
    errorMessage,
  })
}

// Hook for tracking security events
export async function logSecurityEvent(
  payload: any,
  userId: string,
  action: string,
  metadata?: any,
  severity: 'info' | 'warning' | 'critical' = 'warning'
): Promise<void> {
  await createAuditLog(payload, {
    user: userId,
    action,
    resource: 'system',
    metadata,
    severity,
    success: true,
  })
}
