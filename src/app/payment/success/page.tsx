'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PaymentInfo {
  outTradeNo: string
  productName?: string
  amount: number
  paidAt?: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const outTradeNo = searchParams.get('outTradeNo')
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (!outTradeNo) return

      try {
        // 可以调用 status API 获取详细信息
        const response = await fetch(`/api/payment/status/${outTradeNo}`)
        const data = await response.json()
        
        // 这里可以扩展为获取完整支付信息
        setPaymentInfo({
          outTradeNo,
          amount: 100, // 默认值，实际应从数据库获取
        })
      } catch (err) {
        console.error('获取支付信息失败:', err)
      }
    }

    fetchPaymentInfo()
  }, [outTradeNo])

  if (!outTradeNo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">参数错误</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center">
        {/* 成功图标 */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* 标题 */}
        <h1 className="text-3xl font-bold text-white mb-2">支付成功</h1>
        <p className="text-gray-300 mb-6">感谢您的支持</p>

        {/* 订单信息 */}
        <div className="bg-white/5 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400">订单号</span>
            <span className="text-white font-mono text-sm">{outTradeNo}</span>
          </div>
          {paymentInfo?.productName && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">商品名称</span>
              <span className="text-white">{paymentInfo.productName}</span>
            </div>
          )}
          {paymentInfo?.amount && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">支付金额</span>
              <span className="text-green-400 font-bold">
                ¥{(paymentInfo.amount / 100).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* 按钮 */}
        <div className="space-y-3">
          <a
            href="/"
            className="block w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300"
          >
            返回首页
          </a>
          <a
            href="/pay"
            className="block w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-300"
          >
            继续支付
          </a>
        </div>
      </div>
    </div>
  )
}