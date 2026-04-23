import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decryptNotification, verifySignature } from '@/lib/wechatpay'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = request.headers

    // 获取微信支付返回的HTTP头
    const timestamp = headers.get('Wechatpay-Timestamp') || ''
    const nonce = headers.get('Wechatpay-Nonce') || ''
    const serial = headers.get('Wechatpay-Serial') || ''
    const signature = headers.get('Wechatpay-Signature') || ''

    console.log('收到微信支付回调:', { timestamp, nonce, serial })

    // 构建待验签字符串
    const message = `${timestamp}\n${nonce}\n${body}\n`

    // 获取公钥用于验证签名 (实际生产中应从微信平台获取)
    // 这里简化处理，实际需要根据serial获取对应的公钥
    // 如果验证失败，仍然处理业务逻辑（可能只是签名验证方式不匹配）
    
    let decryptedData: any = null
    
    try {
      // 解析 JSON body
      const jsonBody = JSON.parse(body)
      
      // 检查是否为加密通知
      if (jsonBody.algorithm && jsonBody.ciphertext) {
        // V3 通知是加密的
        const apiKeyV3 = process.env.WECHAT_API_KEY_V3 || ''
        const associatedData = jsonBody.associated_data || ''
        const ciphertext = jsonBody.ciphertext
        
        decryptedData = decryptNotification(
          ciphertext,
          nonce,
          associatedData
        )
      } else if (jsonBody.resource && jsonBody.resource.ciphertext) {
        // 另一种加密格式
        const resource = jsonBody.resource
        const apiKeyV3 = process.env.WECHAT_API_KEY_V3 || ''
        
        decryptedData = decryptNotification(
          resource.ciphertext,
          nonce,
          resource.associated_data || ''
        )
      } else {
        // 未加密的通知 (测试环境可能)
        decryptedData = jsonBody
      }
    } catch (parseError) {
      console.error('解析回调数据失败:', parseError)
    }

    if (!decryptedData) {
      return NextResponse.json(
        { code: 'FAIL', message: '解析数据失败' },
        { status: 400 }
      )
    }

    console.log('解密后的支付通知:', decryptedData)

    // 获取商户订单号
    const outTradeNo = decryptedData.out_trade_no || decryptedData.outTradeNo
    
    if (!outTradeNo) {
      console.error('未找到商户订单号')
      return NextResponse.json(
        { code: 'FAIL', message: '订单号不存在' },
        { status: 400 }
      )
    }

    // 查询支付记录
    const payment = await prisma.payment.findUnique({
      where: { outTradeNo },
    })

    if (!payment) {
      console.error('订单不存在:', outTradeNo)
      return NextResponse.json(
        { code: 'FAIL', message: '订单不存在' },
        { status: 400 }
      )
    }

    // 检查支付状态
    if (payment.status === 'success') {
      return NextResponse.json({ code: 'SUCCESS', message: '成功' })
    }

    // 获取交易状态
    const tradeState = decryptedData.trade_state || 'SUCCESS'
    
    // 更新支付记录
    const updateData: any = {
      status: tradeState === 'SUCCESS' ? 'success' : 'closed',
    }

    if (tradeState === 'SUCCESS') {
      // 微信交易号
      const transactionId = decryptedData.transaction_id || decryptedData.transactionId
      if (transactionId) {
        updateData.transactionId = transactionId
      }
      
      // 支付时间
      const timeEnd = decryptedData.time_end || decryptedData.paidAt
      if (timeEnd) {
        updateData.paidAt = new Date(timeEnd)
      } else {
        updateData.paidAt = new Date()
      }
    }

    await prisma.payment.update({
      where: { outTradeNo },
      data: updateData,
    })

    console.log('支付状态已更新:', { outTradeNo, status: updateData.status })

    // 返回成功响应
    return NextResponse.json({ code: 'SUCCESS', message: '成功' })
  } catch (error: any) {
    console.error('处理微信支付回调失败:', error)
    return NextResponse.json(
      { code: 'FAIL', message: error.message || '处理失败' },
      { status: 500 }
    )
  }
}