'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import QRCode from 'qrcode'

interface PaymentStatus {
  status: string
  message?: string
}

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const outTradeNo = searchParams.get('outTradeNo')
  const codeUrl = searchParams.get('codeUrl')
  const amount = searchParams.get('amount')
  const productName = searchParams.get('productName')

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'pending' })
  const [error, setError] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState<number>(900) // 15分钟倒计时
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 生成二维码
  useEffect(() => {
    if (!codeUrl || !canvasRef.current) return

    const generateQRCode = async () => {
      try {
        await QRCode.toCanvas(canvasRef.current, codeUrl, {
          width: 250,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        })
      } catch (err) {
        console.error('生成二维码失败:', err)
        setError('生成二维码失败')
      }
    }

    generateQRCode()
  }, [codeUrl])

  // 轮询支付状态
  const checkPaymentStatus = async () => {
    if (!outTradeNo) return

    try {
      const response = await fetch(`/api/payment/status/${outTradeNo}`)
      const data = await response.json()

      setPaymentStatus(data)

      if (data.status === 'success') {
        // 支付成功，跳转到成功页面
        setTimeout(() => {
          router.push(`/payment/success?outTradeNo=${outTradeNo}`)
        }, 1500)
        return true
      }

      if (data.status === 'expired' || data.status === 'closed') {
        // 订单过期或关闭
        return true
      }

      return false
    } catch (err) {
      console.error('查询支付状态失败:', err)
      return false
    }
  }

  // 启动轮询
  useEffect(() => {
    if (!outTradeNo || !codeUrl) return

    // 立即检查一次
    checkPaymentStatus()

    // 每2秒轮询一次
    pollingRef.current = setInterval(async () => {
      const shouldStop = await checkPaymentStatus()
      if (shouldStop && pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }, 2000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [outTradeNo, codeUrl])

  // 倒计时
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!outTradeNo || !codeUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">参数错误</h1>
          <p className="text-gray-400">缺少必要的支付参数</p>
        </div>
      </div>
    )
  }

  const getStatusMessage = () => {
    switch (paymentStatus.status) {
      case 'success':
        return { text: '支付成功', color: 'text-green-400' }
      case 'expired':
        return { text: '订单已过期', color: 'text-red-400' }
      case 'closed':
        return { text: '订单已关闭', color: 'text-red-400' }
      default:
        return { text: '等待支付中...', color: 'text-yellow-400' }
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">微信支付</h1>
          <p className="text-gray-300">{productName || '在线支付'}</p>
        </div>

        {/* 金额 */}
        <div className="text-center mb-6">
          <span className="text-4xl font-bold text-white">
            ¥{amount ? (parseInt(amount) / 100).toFixed(2) : '0.00'}
          </span>
        </div>

        {/* 二维码 */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-2xl">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* 状态提示 */}
        <div className="text-center mb-4">
          <p className={`text-lg font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            请使用微信扫描二维码完成支付
          </p>
        </div>

        {/* 倒计时 */}
        {paymentStatus.status === 'pending' && timeLeft > 0 && (
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              剩余支付时间: <span className="text-white font-mono">{formatTime(timeLeft)}</span>
            </p>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* 底部提示 */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-gray-500 text-xs text-center">
            支付完成后将自动跳转
          </p>
        </div>
      </div>
    </div>
  )
}