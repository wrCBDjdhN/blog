import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const body = await request.json()
  const { targetId, targetType, content, nickname } = body

  if (!content || !targetId || !targetType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const createData: {
    content: string
    postId?: string
    productId?: string
    userId?: string
    nickname?: string
  } = { content }

  if (targetType === 'post') {
    createData.postId = targetId
  } else if (targetType === 'product') {
    createData.productId = targetId
  }

  if (session?.user?.id) {
    createData.userId = session.user.id
  } else if (nickname) {
    createData.nickname = nickname
  }

  const comment = await prisma.comment.create({
    data: createData,
  })

  return NextResponse.json(comment)
}