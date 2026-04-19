'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Order {
  orderNumber: string
  productName: string
  price: number
  buyerName: string
  buyerEmail: string
  status: string
  createdAt: string
}

export default function OrderPage() {
  const params = useParams()
  const orderNumber = params.orderNumber as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders?orderNumber=${orderNumber}`)
        const data = await res.json()
        if (data && data[0]) {
          setOrder(data[0])
        }
      } catch (err) {
        console.error('Failed to fetch order:', err)
      } finally {
        setLoading(false)
      }
    }
    if (orderNumber) {
      fetchOrder()
    }
  }, [orderNumber])

  const copyOrderNumber = async () => {
    if (!order) return
    try {
      await navigator.clipboard.writeText(order.orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">订单不存在</h1>
          <a href="/products" className="text-amber-600 hover:underline mt-4 inline-block">
            返回商品列表
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden animate-fadeInUp">
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              订单创建成功
            </h1>

            <p className="mt-2 text-gray-600">
              感谢您的购买！请查看订单详情
            </p>
          </div>

          <div className="border-t border-gray-100 p-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-gray-500">订单号</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span>
                  <button
                    onClick={copyOrderNumber}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="复制订单号"
                  >
                    {copied ? (
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-gray-500">商品名称</span>
                <span className="font-medium text-gray-900">{order.productName}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-gray-500">订单金额</span>
                <span className="text-xl font-bold text-amber-600">¥{order.price.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-gray-500">购买人</span>
                <span className="text-gray-900">{order.buyerName}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-gray-500">邮箱</span>
                <span className="text-gray-900">{order.buyerEmail}</span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-gray-500">订单状态</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                  等待审核中
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 p-8">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800">请注意查收邮箱</p>
                  <p className="text-sm text-blue-600 mt-1">
                    我��已向 {order.buyerEmail} 发送了订单确认邮件，请注意查收。
                    您的订单目前正在审核中，商品相关信息将在审核通过后通过邮件发送给您。
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <a
                href="/products"
                className="flex-1 py-3 px-6 text-center border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 font-medium"
              >
                继续购物
              </a>
              <button
                onClick={copyOrderNumber}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-amber-500/30"
              >
                {copied ? '已复制' : '复制订单号'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}