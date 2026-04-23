import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNativeOrder, generateOutTradeNo } from '@/lib/wechatpay'

// 支付订单过期时间 (15分钟)
const PAYMENT_EXPIRES_MINUTES = 15

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, productName, amount, description, openid } = body

    // 验证必填参数
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: '请提供有效的支付金额' },
        { status: 400 }
      )
    }

    // 生成商户订单号
    const outTradeNo = generateOutTradeNo()
    
    // 计算过期时间
    const expiresAt = new Date(Date.now() + PAYMENT_EXPIRES_MINUTES * 60 * 1000)

    // 在数据库中创建支付记录
    const payment = await prisma.payment.create({
      data: {
        outTradeNo,
        productId: productId || null,
        productName: productName || '充值',
        amount,
        description: description || '微信支付',
        status: 'pending',
        openid: openid || null,
        expiresAt,
      },
    })

    // 获取回调URL
    const notifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payment/webhook`

    // 调用微信统一下单接口
    const result = await createNativeOrder({
      outTradeNo,
      description: productName || '支付',
      amount, // 单位: 分
      notifyUrl,
      openid: openid || undefined,
    })

    if (result.error) {
      // 更新订单状态为失败
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'closed' },
      })

      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      outTradeNo: payment.outTradeNo,
      codeUrl: result.code_url,
      expiresAt: payment.expiresAt,
    })
  } catch (error: any) {
    console.error('创建支付订单失败:', error)
    return NextResponse.json(
      { error: error.message || '创建支付订单失败' },
      { status: 500 }
    )
  }
}