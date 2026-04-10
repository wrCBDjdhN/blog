import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const published = searchParams.get('published')

  const where: Record<string, unknown> = {}
  if (published !== null) {
    where.published = published === 'true'
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.post.count({ where }),
  ])

  return NextResponse.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, summary, content, coverImage, published } = body

  const post = await prisma.post.create({
    data: {
      title,
      summary,
      content,
      coverImage,
      published,
      authorId: session.user.id,
    },
  })

  return NextResponse.json(post)
}