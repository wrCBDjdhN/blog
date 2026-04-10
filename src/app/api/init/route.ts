import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { secret, email, password, name, bio } = body

  if (secret !== process.env.INIT_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        bio,
      },
    })

    return NextResponse.json({ message: 'User created', userId: user.id })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}