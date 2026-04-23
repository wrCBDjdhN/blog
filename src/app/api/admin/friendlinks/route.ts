import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

async function verifyAdminSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  })

  if (user?.role !== 'admin') {
    throw new Error('Forbidden')
  }
}

export async function GET() {
  try {
    await verifyAdminSession()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Forbidden' ? 403 : 401
    return NextResponse.json({ error: message }, { status })
  }

  const friendLinks = await prisma.friendLink.findMany({
    orderBy: { order: 'desc' },
  })

  return NextResponse.json(friendLinks)
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdminSession()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Forbidden' ? 403 : 401
    return NextResponse.json({ error: message }, { status })
  }

  const body = await request.json()
  const { name, url, description, avatar, order } = body

  if (!name || !url) {
    return NextResponse.json({ error: 'Missing required fields: name, url' }, { status: 400 })
  }

  const friendLink = await prisma.friendLink.create({
    data: {
      name,
      url,
      description: description || null,
      avatar: avatar || null,
      order: order || 0,
    },
  })

  return NextResponse.json(friendLink)
}