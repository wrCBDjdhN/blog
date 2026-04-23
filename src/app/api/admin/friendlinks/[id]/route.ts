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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminSession()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Forbidden' ? 403 : 401
    return NextResponse.json({ error: message }, { status })
  }

  const { id } = await params

  const friendLink = await prisma.friendLink.findUnique({
    where: { id },
  })

  if (!friendLink) {
    return NextResponse.json({ error: 'Friend link not found' }, { status: 404 })
  }

  return NextResponse.json(friendLink)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminSession()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Forbidden' ? 403 : 401
    return NextResponse.json({ error: message }, { status })
  }

  const { id } = await params
  const body = await request.json()
  const { name, url, description, avatar, order, status } = body

  const friendLink = await prisma.friendLink.findUnique({
    where: { id },
  })

  if (!friendLink) {
    return NextResponse.json({ error: 'Friend link not found' }, { status: 404 })
  }

  const updated = await prisma.friendLink.update({
    where: { id },
    data: {
      name: name ?? undefined,
      url: url ?? undefined,
      description: description ?? undefined,
      avatar: avatar ?? undefined,
      order: order ?? undefined,
      status: status ?? undefined,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminSession()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Forbidden' ? 403 : 401
    return NextResponse.json({ error: message }, { status })
  }

  const { id } = await params

  const friendLink = await prisma.friendLink.findUnique({
    where: { id },
  })

  if (!friendLink) {
    return NextResponse.json({ error: 'Friend link not found' }, { status: 404 })
  }

  await prisma.friendLink.delete({
    where: { id },
  })

  return NextResponse.json({ message: 'Friend link deleted successfully' })
}