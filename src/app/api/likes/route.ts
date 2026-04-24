import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const body = await request.json()
  const { targetId, targetType } = body

  if (!targetId || !targetType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Only support post likes now
  if (targetType !== 'post') {
    return NextResponse.json({ error: 'Invalid target type' }, { status: 400 })
  }

  const existingLike = await prisma.like.findFirst({
    where: { postId: targetId, userId: session.user.id },
  })

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    })

    const count = await prisma.like.count({
      where: { postId: targetId },
    })

    return NextResponse.json({ liked: false, count })
  } else {
    await prisma.like.create({
      data: {
        userId: session.user.id,
        postId: targetId,
      },
    })

    const count = await prisma.like.count({
      where: { postId: targetId },
    })

    return NextResponse.json({ liked: true, count })
  }
}