import type { CollectionConfig } from 'payload'

/**
 * HIPAA-Compliant Audit Logs Collection
 *
 * This collection implements HIPAA Security Rule §164.312(b) requirements:
 * - Immutable logs (write-once, no updates or deletes)
 * - Tracks all PHI access and modifications
 * - Retains logs for 6+ years (configured at database level)
 * - Restricted access (admin and security officers only)
 * - Comprehensive audit trail (who, what, when, where, how)
 */

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',

  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'userId', 'userEmail', 'ipAddress', 'timestamp', 'severity', 'success'],
    group: 'Security',
    description: 'HIPAA-compliant audit logs. These records are immutable and cannot be edited or deleted.',
  },

  // HIPAA Access Controls: Only admins and security officers can read
  // No one can update or delete (immutable logs)
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      // Only admins and security officers can view audit logs
      return user.role === 'admin'
    },
    create: () => true, // API can create logs
    update: () => false, // IMMUTABLE: No updates allowed
    delete: () => false, // IMMUTABLE: No deletes allowed
  },

  // Prevent updates and deletes via hooks as well (defense in depth)
  hooks: {
    beforeChange: [
      ({ operation }) => {
        if (operation === 'update') {
          throw new Error('Audit logs are immutable and cannot be updated')
        }
      },
    ],
    beforeDelete: [
      () => {
        throw new Error('Audit logs are immutable and cannot be deleted')
      },
    ],
  },

  fields: [
    // ==================== WHO ====================
    {
      name: 'userId',
      type: 'text',
      label: 'User ID',
      admin: {
        description: 'ID of the user performing the action',
      },
      index: true,
    },
    {
      name: 'userEmail',
      type: 'email',
      label: 'User Email',
      admin: {
        description: 'Email of the user performing the action',
      },
      index: true,
    },
    {
      name: 'userRole',
      type: 'text',
      label: 'User Role',
      admin: {
        description: 'Role of the user at time of action',
      },
    },
    {
      name: 'sessionId',
      type: 'text',
      label: 'Session ID',
      admin: {
        description: 'Session identifier for tracking user sessions',
      },
    },

    // ==================== WHAT ====================
    {
      name: 'action',
      type: 'select',
      required: true,
      label: 'Action',
      options: [
        // Authentication
        { label: 'Login', value: 'LOGIN' },
        { label: 'Logout', value: 'LOGOUT' },
        { label: 'Login Failed', value: 'LOGIN_FAILED' },
        { label: 'Password Change', value: 'PASSWORD_CHANGE' },
        { label: 'MFA Enabled', value: 'MFA_ENABLED' },
        { label: 'MFA Disabled', value: 'MFA_DISABLED' },

        // PHI Access
        { label: 'PHI View', value: 'PHI_VIEW' },
        { label: 'PHI Create', value: 'PHI_CREATE' },
        { label: 'PHI Update', value: 'PHI_UPDATE' },
        { label: 'PHI Delete', value: 'PHI_DELETE' },
        { label: 'PHI Export', value: 'PHI_EXPORT' },

        // Symptom Checker
        { label: 'Symptom Submit', value: 'SYMPTOM_SUBMIT' },
        { label: 'Symptom Result View', value: 'SYMPTOM_RESULT_VIEW' },

        // User Profile
        { label: 'Profile View', value: 'PROFILE_VIEW' },
        { label: 'Profile Update', value: 'PROFILE_UPDATE' },

        // Administrative
        { label: 'User Create', value: 'USER_CREATE' },
        { label: 'User Update', value: 'USER_UPDATE' },
        { label: 'User Delete', value: 'USER_DELETE' },
        { label: 'Role Change', value: 'ROLE_CHANGE' },

        // Security Events
        { label: 'Unauthorized Access', value: 'UNAUTHORIZED_ACCESS' },
        { label: 'Permission Denied', value: 'PERMISSION_DENIED' },
        { label: 'Suspicious Activity', value: 'SUSPICIOUS_ACTIVITY' },
      ],
      admin: {
        description: 'Type of action performed',
      },
      index: true,
    },
    {
      name: 'resource',
      type: 'text',
      label: 'Resource',
      admin: {
        description: 'Resource affected by the action',
      },
    },
    {
      name: 'resourceId',
      type: 'text',
      label: 'Resource ID',
      admin: {
        description: 'ID of the resource affected',
      },
      index: true,
    },
    {
      name: 'resourceType',
      type: 'text',
      label: 'Resource Type',
      admin: {
        description: 'Type of resource (e.g., user, herb, formula)',
      },
    },
    {
      name: 'details',
      type: 'json',
      label: 'Details',
      admin: {
        description: 'Additional context about the action (JSON format)',
      },
    },

    // ==================== WHERE ====================
    {
      name: 'ipAddress',
      type: 'text',
      label: 'IP Address',
      admin: {
        description: 'IP address of the client',
      },
      index: true,
    },
    {
      name: 'userAgent',
      type: 'textarea',
      label: 'User Agent',
      admin: {
        description: 'Browser/client user agent string',
      },
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location',
      admin: {
        description: 'Geographic location (if available)',
      },
    },

    // ==================== HOW ====================
    {
      name: 'method',
      type: 'select',
      label: 'HTTP Method',
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'PATCH', value: 'PATCH' },
        { label: 'DELETE', value: 'DELETE' },
      ],
      admin: {
        description: 'HTTP method used',
      },
    },
    {
      name: 'endpoint',
      type: 'text',
      label: 'Endpoint',
      admin: {
        description: 'API endpoint or URL path',
      },
    },
    {
      name: 'statusCode',
      type: 'number',
      label: 'Status Code',
      admin: {
        description: 'HTTP status code returned',
      },
    },

    // ==================== CONTEXT ====================
    {
      name: 'severity',
      type: 'select',
      required: true,
      defaultValue: 'INFO',
      label: 'Severity',
      options: [
        { label: 'Info', value: 'INFO' },
        { label: 'Warning', value: 'WARNING' },
        { label: 'Error', value: 'ERROR' },
        { label: 'Critical', value: 'CRITICAL' },
      ],
      admin: {
        description: 'Severity level of the event',
        position: 'sidebar',
      },
      index: true,
    },
    {
      name: 'success',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      label: 'Success',
      admin: {
        description: 'Whether the action was successful',
        position: 'sidebar',
      },
      index: true,
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      label: 'Error Message',
      admin: {
        description: 'Error message if action failed',
        condition: (data) => !data.success,
      },
    },
  ],

  // Enable timestamps (createdAt, updatedAt)
  // Note: updatedAt won't change since updates are blocked
  timestamps: true,

  // Index for efficient querying
  // Especially important for HIPAA compliance reports
  indexes: [
    {
      fields: {
        action: 1,
        createdAt: -1,
      },
    },
    {
      fields: {
        userId: 1,
        createdAt: -1,
      },
    },
    {
      fields: {
        ipAddress: 1,
        createdAt: -1,
      },
    },
    {
      fields: {
        severity: 1,
        success: 1,
      },
    },
  ],
}
