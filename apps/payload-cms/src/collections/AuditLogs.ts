import type { CollectionConfig } from 'payload'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'userEmail', 'resourceType', 'ipAddress', 'severity', 'createdAt'],
    description: 'HIPAA-compliant immutable audit logs',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    create: () => true, // System-level creation
    update: () => false, // Immutable
    delete: () => false, // Immutable
  },
  versions: false, // No versioning for audit logs
  timestamps: true,
  fields: [
    // User Information
    {
      name: 'userId',
      type: 'text',
      index: true,
      admin: {
        description: 'User ID who performed the action',
      },
    },
    {
      name: 'userEmail',
      type: 'email',
      index: true,
    },
    {
      name: 'userRole',
      type: 'text',
    },
    {
      name: 'sessionId',
      type: 'text',
      index: true,
      admin: {
        description: 'Session identifier for grouping related actions',
      },
    },

    // Action Details
    {
      name: 'action',
      type: 'select',
      required: true,
      index: true,
      options: [
        // Authentication
        { label: 'Login', value: 'LOGIN' },
        { label: 'Logout', value: 'LOGOUT' },
        { label: 'Login Failed', value: 'LOGIN_FAILED' },
        { label: 'Password Change', value: 'PASSWORD_CHANGE' },
        { label: 'MFA Enabled', value: 'MFA_ENABLED' },
        { label: 'MFA Disabled', value: 'MFA_DISABLED' },

        // PHI (Protected Health Information) Access
        { label: 'PHI View', value: 'PHI_VIEW' },
        { label: 'PHI Create', value: 'PHI_CREATE' },
        { label: 'PHI Update', value: 'PHI_UPDATE' },
        { label: 'PHI Delete', value: 'PHI_DELETE' },
        { label: 'PHI Export', value: 'PHI_EXPORT' },

        // Symptom Checker
        { label: 'Symptom Submit', value: 'SYMPTOM_SUBMIT' },
        { label: 'Symptom Result View', value: 'SYMPTOM_RESULT_VIEW' },

        // Profile
        { label: 'Profile View', value: 'PROFILE_VIEW' },
        { label: 'Profile Update', value: 'PROFILE_UPDATE' },

        // User Management
        { label: 'User Create', value: 'USER_CREATE' },
        { label: 'User Update', value: 'USER_UPDATE' },
        { label: 'User Delete', value: 'USER_DELETE' },
        { label: 'Role Change', value: 'ROLE_CHANGE' },

        // Security Events
        { label: 'Unauthorized Access', value: 'UNAUTHORIZED_ACCESS' },
        { label: 'Permission Denied', value: 'PERMISSION_DENIED' },
        { label: 'Suspicious Activity', value: 'SUSPICIOUS_ACTIVITY' },
      ],
    },

    // Resource Information
    {
      name: 'resource',
      type: 'text',
      admin: {
        description: 'Resource name or identifier',
      },
    },
    {
      name: 'resourceId',
      type: 'text',
      index: true,
      admin: {
        description: 'ID of the resource affected',
      },
    },
    {
      name: 'resourceType',
      type: 'text',
      index: true,
      admin: {
        description: 'Type of resource (user, herb, condition, etc.)',
      },
    },

    // Additional Details
    {
      name: 'details',
      type: 'json',
      admin: {
        description: 'Additional context and metadata',
      },
    },

    // Request Information
    {
      name: 'ipAddress',
      type: 'text',
      index: true,
    },
    {
      name: 'userAgent',
      type: 'textarea',
      admin: {
        description: 'Browser/client information',
      },
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'Geographic location (if available)',
      },
    },
    {
      name: 'method',
      type: 'select',
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'PATCH', value: 'PATCH' },
        { label: 'DELETE', value: 'DELETE' },
      ],
    },
    {
      name: 'endpoint',
      type: 'text',
      admin: {
        description: 'API endpoint accessed',
      },
    },
    {
      name: 'statusCode',
      type: 'number',
      admin: {
        description: 'HTTP status code',
      },
    },

    // Outcome
    {
      name: 'severity',
      type: 'select',
      required: true,
      defaultValue: 'INFO',
      index: true,
      options: [
        { label: 'Info', value: 'INFO' },
        { label: 'Warning', value: 'WARNING' },
        { label: 'Error', value: 'ERROR' },
        { label: 'Critical', value: 'CRITICAL' },
      ],
    },
    {
      name: 'success',
      type: 'checkbox',
      required: true,
      defaultValue: true,
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      admin: {
        condition: (data) => !data.success,
      },
    },
  ],
}
