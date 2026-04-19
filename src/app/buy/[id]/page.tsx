'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  price: number
  coverImage: string | null
}

export default function BuyPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
  })
  const [error, setError] = useState('')
  const [showQrCode, setShowQrCode] = useState(false)
  const wechatPayUrl = '/wechat-pay.png'

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products?ids=${productId}`)
        const data = await res.json()
        if (data.products && data.products[0]) {
          setProduct(data.products[0])
        }
      } catch (err) {
        console.error('Failed to fetch product:', err)
      } finally {
        setLoading(false)
      }
    }
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleNextStep = () => {
    setError('')

    if (!formData.buyerName.trim() || !formData.buyerEmail.trim()) {
      setError('请填写购买人姓名和邮箱')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.buyerEmail)) {
      setError('请填写有效的邮箱地址')
      return
    }

    setShowQrCode(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (!showQrCode) {
      handleNextStep()
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId,
          buyerName: formData.buyerName,
          buyerEmail: formData.buyerEmail,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '创建订单失败')
      }

      router.push(`/order/${data.orderNumber}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建订单失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">商品不存在</h1>
          <a href="/products" className="text-amber-600 hover:underline mt-4 inline-block">
            返回商品列表
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden animate-fadeInUp">
          {product.coverImage && (
            <div className="relative h-64 w-full">
              <Image
                src={product.coverImage}
                alt={product.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          )}

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            <p className="mt-2 text-4xl font-bold text-amber-600">
              ¥{product.price.toFixed(2)}
            </p>

            <p className="mt-4 text-gray-600">{product.description}</p>
          </div>
        </div>

        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 animate-fadeInUp">
          <h2 className="text-xl font-bold text-gray-900 mb-6">立即购买</h2>

          {wechatPayUrl && showQrCode && (
            <div className="mb-8 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <p className="text-sm font-medium text-green-800 mb-3">
                微信扫码付款
              </p>
              <div className="relative w-48 h-48 mx-auto bg-white rounded-lg overflow-hidden shadow-sm">
                <Image
                  src={wechatPayUrl}
                  alt="微信付款码"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                购买人姓名
              </label>
              <input
                type="text"
                value={formData.buyerName}
                onChange={(e) =>
                  setFormData({ ...formData, buyerName: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                placeholder="请输入您的姓名"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <input
                type="email"
                value={formData.buyerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, buyerEmail: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                placeholder="请输入您的邮箱，用于接收订单通知"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  处理中...
                </span>
              ) : (
                showQrCode
                  ? `立即购买 ¥${product.price.toFixed(2)}`
                  : '下一步'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              {showQrCode
                ? '点击"立即购买"即表示您同意我们的购买条款'
                : '点击"下一步"显示付款码'}
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}