import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendOrderSuccessEmail, sendOrderFailedEmail } from '@/lib/email'

type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired'

async function verifyAdminSession() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error('Unauthorized')
  }
}

function isValidStatus(status: string): status is OrderStatus {
  return ['pending', 'paid', 'failed', 'expired'].includes(status)
}

export async function GET(request: NextRequest) {
  try {
    await verifyAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')

  const whereClause = status && isValidStatus(status) ? { status } : {}

  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}

export async function PATCH(request: NextRequest) {
  try {
    await verifyAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { orderNumber, action } = body

  if (!orderNumber || !action) {
    return NextResponse.json(
      { error: 'Missing required fields: orderNumber, action' },
      { status: 400 }
    )
  }

  if (!['confirm', 'fail', 'expire'].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Must be: confirm, fail, or expire' },
      { status: 400 }
    )
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  let newStatus: OrderStatus
  let emailFn: typeof sendOrderSuccessEmail | typeof sendOrderFailedEmail

  switch (action) {
    case 'confirm':
      newStatus = 'paid'
      emailFn = sendOrderSuccessEmail
      break
    case 'fail':
      newStatus = 'failed'
      emailFn = sendOrderFailedEmail
      break
    case 'expire':
      newStatus = 'expired'
      emailFn = sendOrderFailedEmail
      break
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const updatedOrder = await prisma.order.update({
    where: { orderNumber },
    data: {
      status: newStatus,
      paidAt: newStatus === 'paid' ? new Date() : null,
    },
  })

  try {
    await emailFn(
      order.buyerEmail,
      orderNumber,
      order.productName,
      order.price,
      order.buyerName,
      emailFn === sendOrderFailedEmail
        ? (action === 'expire' ? 'expired' : 'failed')
        : undefined
    )
  } catch (error) {
    console.error('Failed to send email:', error)
  }

  return NextResponse.json(updatedOrder)
}