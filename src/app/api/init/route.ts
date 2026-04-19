import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

interface InitBody {
  secret: string
  email: string
  password: string
  name?: string
  bio?: string
}

export async function POST(request: NextRequest) {
  let body: InitBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be JSON' }, { status: 400 })
  }

  const { secret, email, password, name = '博主', bio = '欢迎来到我的博客' } = body

  if (!secret || !email || !password) {
    return NextResponse.json({ error: 'Secret, email, and password are required' }, { status: 400 })
  }

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

    return NextResponse.json({ message: 'User created successfully!', userId: user.id, email: user.email })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}