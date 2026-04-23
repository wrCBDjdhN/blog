import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { queryOrder } from '@/lib/wechatpay'

export async function GET(
  request: NextRequest,
  { params }: { params: { outTradeNo: string } }
) {
  try {
    const { outTradeNo } = params

    if (!outTradeNo) {
      return NextResponse.json(
        { error: '缺少订单号' },
        { status: 400 }
      )
    }

    // 从数据库查询订单状态
    const payment = await prisma.payment.findUnique({
      where: { outTradeNo },
    })

    if (!payment) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      )
    }

    // 检查是否过期
    if (payment.status === 'pending' && new Date() > payment.expiresAt) {
      await prisma.payment.update({
        where: { outTradeNo },
        data: { status: 'expired' },
      })
      
      return NextResponse.json({
        status: 'expired',
        message: '订单已过期',
      })
    }

    // 如果数据库状态是 pending，可以尝试查询微信确认最新状态
    if (payment.status === 'pending') {
      try {
        const wechatResult = await queryOrder(outTradeNo)
        
        if (wechatResult.trade_state) {
          const tradeStateMap: Record<string, string> = {
            SUCCESS: 'success',
            NOTPAY: 'pending',
            CLOSED: 'closed',
            REFUND: 'refund',
            PAYERROR: 'closed',
            USERPAYING: 'pending',
          }
          
          const dbStatus = tradeStateMap[wechatResult.trade_state] || payment.status
          
          // 如果微信端已支付，更新数据库
          if (dbStatus === 'success') {
            await prisma.payment.update({
              where: { outTradeNo },
              data: {
                status: 'success',
                transactionId: wechatResult.transaction_id,
                paidAt: wechatResult.time_end 
                  ? new Date(wechatResult.time_end) 
                  : new Date(),
              },
            })
            
            return NextResponse.json({
              status: 'success',
              message: '支付成功',
            })
          }
          
          // 如果订单已关闭或过期
          if (dbStatus === 'closed') {
            await prisma.payment.update({
              where: { outTradeNo },
              data: { status: 'closed' },
            })
            
            return NextResponse.json({
              status: 'closed',
              message: '订单已关闭',
            })
          }
        }
      } catch (queryError) {
        console.error('查询微信订单状态失败:', queryError)
        // 继续返回数据库状态
      }
    }

    return NextResponse.json({
      status: payment.status,
      message: payment.status === 'success' ? '支付成功' : 
               payment.status === 'expired' ? '订单已过期' : 
               payment.status === 'closed' ? '订单已关闭' : '等待支付',
    })
  } catch (error: any) {
    console.error('查询支付状态失败:', error)
    return NextResponse.json(
      { error: error.message || '查询失败' },
      { status: 500 }
    )
  }
}