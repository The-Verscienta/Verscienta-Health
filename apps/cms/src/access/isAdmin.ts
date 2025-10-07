import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}

export const isAdminOrEditor: Access = ({ req: { user } }) => {
  return user?.role === 'admin' || user?.role === 'editor'
}

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (user?.role === 'admin') return true

  return {
    id: {
      equals: user?.id,
    },
  }
}

export const isPublished: Access = ({ req: { user } }) => {
  // Admins and editors can see all
  if (user?.role === 'admin' || user?.role === 'editor') {
    return true
  }

  // Everyone else can only see published content
  return {
    status: {
      equals: 'published',
    },
  }
}
