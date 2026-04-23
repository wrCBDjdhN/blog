import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const friendLinks = await prisma.friendLink.findMany({
    where: { status: 'approved' },
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