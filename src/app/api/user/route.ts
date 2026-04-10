import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(null)
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      bio: true,
      github: true,
      twitter: true,
    },
  })

  return NextResponse.json(user)
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, bio, avatar, github, twitter } = body

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, bio, avatar, github, twitter },
  })

  return NextResponse.json(user)
}