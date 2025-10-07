declare global {
  namespace BetterAuth {
    interface User {
      role?: string
      firstName?: string
      lastName?: string
      mfaEnabled?: boolean
      mfaEnrolledAt?: Date
    }

    interface Session {
      user: User
    }
  }
}