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

  // V7 修复：若未配置 INIT_SECRET，直接拒绝，避免空密钥被绕过。
  if (!process.env.INIT_SECRET) {
    return NextResponse.json({ error: 'Initialization is not configured' }, { status: 503 })
  }

  if (secret !== process.env.INIT_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  // V7 修复：支持通过 INIT_DISABLED=true 关闭初始化端点；
  // 同时若已存在管理员账号则拒绝重复初始化。
  if (process.env.INIT_DISABLED === 'true') {
    return NextResponse.json({ error: 'Initialization is disabled' }, { status: 403 })
  }

  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { id: true },
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'An admin account already exists. Initialization is locked.' },
        { status: 403 }
      )
    }

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