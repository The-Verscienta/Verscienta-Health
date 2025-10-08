import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request) {
  try {
    // Validate authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email } = body

    // Validate required fields
    if (!firstName && !lastName && !email) {
      return NextResponse.json(
        { error: 'At least one field is required to update' },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }

      // Check if email is already in use by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: session.user.id },
        },
      })

      if (existingUser) {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 400 })
      }
    }

    // Validate name lengths if provided
    if (firstName && (firstName.trim().length < 2 || firstName.trim().length > 50)) {
      return NextResponse.json(
        { error: 'First name must be between 2 and 50 characters' },
        { status: 400 }
      )
    }

    if (lastName && (lastName.trim().length < 2 || lastName.trim().length > 50)) {
      return NextResponse.json(
        { error: 'Last name must be between 2 and 50 characters' },
        { status: 400 }
      )
    }

    // Build update data object
    const updateData: {
      name?: string
      email?: string
      firstName?: string
      lastName?: string
    } = {}

    if (firstName) updateData.firstName = firstName.trim()
    if (lastName) updateData.lastName = lastName.trim()
    if (email) updateData.email = email.trim()

    // Update full name if either first or last name is provided
    if (firstName || lastName) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { firstName: true, lastName: true },
      })

      const newFirstName = firstName || user?.firstName || ''
      const newLastName = lastName || user?.lastName || ''
      updateData.name = `${newFirstName} ${newLastName}`.trim()
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    console.log('Profile updated successfully:', {
      userId: session.user.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: updatedUser.name,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile. Please try again later.' },
      { status: 500 }
    )
  }
}
