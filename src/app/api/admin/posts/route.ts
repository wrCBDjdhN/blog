import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

async function verifyAdminSession() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error('Unauthorized')
  }
}

export async function GET(request: NextRequest) {
  try {
    await verifyAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(posts)
}

export async function DELETE(request: NextRequest) {
  try {
    await verifyAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 })
  }

  const post = await prisma.post.findUnique({
    where: { id },
  })

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  await prisma.post.delete({
    where: { id },
  })

  return NextResponse.json({ message: 'Post deleted successfully' })
}