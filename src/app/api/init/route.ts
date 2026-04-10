import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const email = searchParams.get('email')
  const password = searchParams.get('password')
  const name = searchParams.get('name') || '博主'
  const bio = searchParams.get('bio') || '欢迎来到我的博客'

  if (secret !== process.env.INIT_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
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