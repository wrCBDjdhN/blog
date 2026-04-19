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

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
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

  const product = await prisma.product.findUnique({
    where: { id },
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  await prisma.product.delete({
    where: { id },
  })

  return NextResponse.json({ message: 'Product deleted successfully' })
}