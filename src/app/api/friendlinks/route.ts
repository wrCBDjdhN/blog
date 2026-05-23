import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const friendLinks = await prisma.friendLink.findMany({
    orderBy: { order: 'desc' },
    select: {
      id: true,
      name: true,
      url: true,
      description: true,
      avatar: true,
    },
  })

  return NextResponse.json(friendLinks)
}