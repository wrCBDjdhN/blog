import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

function generateOrderNumber(): string {
  const uuid = randomUUID().replace(/-/g, '').toUpperCase()
  return `ORD${uuid.slice(0, 16)}`
}

async function verifySession() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

// POST - Create order (only supports general orders now, no product purchases)
export async function POST(request: NextRequest) {
  let session
  try {
    session = await verifySession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { productId, buyerEmail, buyerName } = body

  // Product functionality has been removed
  if (productId) {
    return NextResponse.json(
      { error: 'Product purchases are no longer available' },
      { status: 400 }
    )
  }

  if (!buyerEmail || !buyerName) {
    return NextResponse.json(
      { error: 'Missing required fields: buyerEmail, buyerName' },
      { status: 400 }
    )
  }

  // Verify buyer email matches logged-in user
  if (buyerEmail.toLowerCase() !== session.user.email.toLowerCase()) {
    return NextResponse.json(
      { error: 'Buyer email must match your account email' },
      { status: 403 }
    )
  }

  const orderNumber = generateOrderNumber()

  const order = await prisma.order.create({
    data: {
      orderNumber,
      productId: '',
      productName: 'General Order',
      price: 0,
      buyerName,
      buyerEmail,
      status: 'pending',
    },
  })

  return NextResponse.json(order)
}

// GET - Query orders
export async function GET(request: NextRequest) {
  let session
  try {
    session = await verifySession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')
  const orderNumber = searchParams.get('orderNumber')
  const userEmail = session.user.email.toLowerCase()
  const isAdmin = session.user.role === 'admin'

  // Admin with admin role can query any order
  if (orderNumber && isAdmin) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
    })
    return NextResponse.json(order ? [order] : [])
  }

  // Query by order number - only owner or admin can view
  if (orderNumber) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
    })
    if (!order) {
      return NextResponse.json([])
    }
    // Allow if admin or order belongs to user
    if (isAdmin || order.buyerEmail.toLowerCase() === userEmail) {
      return NextResponse.json([order])
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Query by email - only admin or own email
  if (!email) {
    return NextResponse.json(
      { error: 'Email or orderNumber parameter is required' },
      { status: 400 }
    )
  }

  // Non-admin can only query their own orders
  const targetEmail = email.toLowerCase()
  if (!isAdmin && targetEmail !== userEmail) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const orders = await prisma.order.findMany({
    where: { buyerEmail: email },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}