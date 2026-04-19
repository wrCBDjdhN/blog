import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail, sendPurchaseNotificationEmail } from '@/lib/email'

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-10)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `ORD${timestamp}${random}`
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { productId, buyerEmail, buyerName } = body

  if (!productId || !buyerEmail || !buyerName) {
    return NextResponse.json(
      { error: 'Missing required fields: productId, buyerEmail, buyerName' },
      { status: 400 }
    )
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const orderNumber = generateOrderNumber()

  const order = await prisma.order.create({
    data: {
      orderNumber,
      productId,
      productName: product.name,
      price: product.price,
      buyerName,
      buyerEmail,
      status: 'pending',
    },
  })

  try {
    await sendOrderConfirmationEmail(
      buyerEmail,
      orderNumber,
      product.name,
      product.price,
      buyerName
    )
    await sendPurchaseNotificationEmail(
      orderNumber,
      product.name,
      product.price,
      buyerName,
      buyerEmail
    )
  } catch (error) {
    console.error('Failed to send emails:', error)
  }

  return NextResponse.json(order)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')
  const orderNumber = searchParams.get('orderNumber')

  if (orderNumber) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
    })
    return NextResponse.json(order ? [order] : [])
  }

  if (!email) {
    return NextResponse.json(
      { error: 'Email or orderNumber parameter is required' },
      { status: 400 }
    )
  }

  const orders = await prisma.order.findMany({
    where: { buyerEmail: email },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}