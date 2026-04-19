'use client'

import { useState, useEffect, useCallback } from 'react'

interface Order {
  orderNumber: string
  productName: string
  price: number
  buyerName: string
  buyerEmail: string
  status: string
  createdAt: string
}

interface OrderPaymentDetectorProps {
  order: Order
  onStatusChange: (newOrder: Order) => void
}

export function OrderPaymentDetector({ order, onStatusChange }: OrderPaymentDetectorProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'timeout' | 'checking'>(
    order.status === 'paid' ? 'paid' : 'pending'
  )
  const [elapsedTime, setElapsedTime] = useState(0)
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null)
  const maxWaitTime = 5 * 60 * 1000

  const checkPaymentStatus = useCallback(async () => {
    if (paymentStatus === 'paid' || paymentStatus === 'timeout') return

    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: order.orderNumber, checkStatusOnly: true }),
      })

      if (!res.ok) return

      const data = await res.json()

      if (data.status === 'paid') {
        setPaymentStatus('paid')
        const updatedOrder: Order = { ...order, status: 'paid' }
        onStatusChange(updatedOrder)
      }
    } catch (err) {
      console.error('Failed to check payment status:', err)
    }
  }, [order, paymentStatus, onStatusChange])

  useEffect(() => {
    if (paymentStatus === 'paid' || paymentStatus === 'timeout') return

    const interval = setInterval(() => {
      setLastCheckTime(new Date())
      checkPaymentStatus()
      setElapsedTime((prev) => {
        const newTime = prev + 3000
        if (newTime >= maxWaitTime) {
          setPaymentStatus('timeout')
        }
        return newTime
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [paymentStatus, checkPaymentStatus, maxWaitTime])

  const handleManualConfirm = async () => {
    setPaymentStatus('checking')
    await checkPaymentStatus()
    setPaymentStatus(order.status === 'paid' ? 'paid' : 'timeout')
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (paymentStatus === 'paid' || order.status === 'paid') {
    return (
      <div className="p-4 bg-green-50 rounded-xl">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-green-800">支付成功！</p>
            <p className="text-sm text-green-600 mt-1">
              您的订单已完成支付，商品相关信息已发送到您的邮箱 {order.buyerEmail}。
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'timeout') {
    return (
      <div className="p-4 bg-red-50 rounded-xl">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-red-800">支付超时</p>
            <p className="text-sm text-red-600 mt-1">
              订单已超时未完成支付，请重新下单或联系客服。
            </p>
            <a
              href="/products"
              className="inline-block mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              重新下单
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-amber-50 rounded-xl">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-amber-800">等待支付中...</p>
          <p className="text-sm text-amber-600 mt-1">
            请在5分钟内完成支付。当前等待时间: {formatTime(elapsedTime)}
            {lastCheckTime && (
              <span className="text-xs text-amber-500 ml-2">
                (最近检查: {lastCheckTime.toLocaleTimeString()})
              </span>
            )}
          </p>
          <button
            onClick={handleManualConfirm}
            className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            我已支付
          </button>
        </div>
      </div>
    </div>
  )
}