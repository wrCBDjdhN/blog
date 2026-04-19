import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ids = searchParams.get('ids')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const published = searchParams.get('published')

  if (ids) {
    const idList = ids.split(',')
    const products = await prisma.product.findMany({
      where: { id: { in: idList } },
    })
    return NextResponse.json({ products })
  }

  const where: Record<string, unknown> = {}
  if (published !== null) {
    where.published = published === 'true'
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({
    products,
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
  const { name, description, price, coverImage, images, published } = body

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      coverImage,
      images,
      published,
    },
  })

  return NextResponse.json(product)
}