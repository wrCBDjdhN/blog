'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

// 固定金额选项 (单位: 分)
const PAYMENT_AMOUNTS = [
  { value: 100, label: '1元', description: '一杯咖啡' },
  { value: 500, label: '5元', description: '一顿早餐' },
  { value: 1000, label: '10元', description: '一顿午餐' },
  { value: 2000, label: '20元', description: '一顿晚餐' },
  { value: 5000, label: '50元', description: '一周会员' },
]

export default function PayPage() {
  const router = useRouter()
  const [selectedAmount, setSelectedAmount] = useState<number>(100)
  const [isLoading, setIsLoading] = useState(false)
  const [customAmount, setCustomAmount] = useState<string>('')

  const handlePayment = async () => {
    const amount = customAmount ? parseInt(customAmount) * 100 : selectedAmount
    
    if (!amount || amount <= 0) {
      toast.error('请选择或输入有效金额')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          productName: '在线充值',
          description: '微信支付充值',
        }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      // 跳转到支付页面
      const params = new URLSearchParams({
        outTradeNo: data.outTradeNo,
        codeUrl: data.codeUrl,
        amount: amount.toString(),
        productName: '在线充值',
      })

      router.push(`/payment?${params.toString()}`)
    } catch (error) {
      console.error('发起支付失败:', error)
      toast.error('发起支付失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        {/* 渐变光晕 */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-violet-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl" />
        
        {/* 网格纹理 */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-16">
        {/* 标题区 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              在线充值
            </span>
          </h1>
          <p className="text-gray-400 text-lg">支持微信支付安全快捷</p>
        </div>

        {/* 金额选择卡片 */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 mb-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-cyan-500 rounded-full" />
            选择金额
          </h2>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {PAYMENT_AMOUNTS.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setSelectedAmount(item.value)
                  setCustomAmount('')
                }}
                className={`
                  relative p-4 rounded-2xl border-2 transition-all duration-300 group
                  ${selectedAmount === item.value 
                    ? 'border-cyan-500 bg-cyan-500/10' 
                    : 'border-white/10 hover:border-white/30 bg-white/5'
                  }
                `}
              >
                <div className={`
                  text-2xl font-bold mb-1 transition-colors
                  ${selectedAmount === item.value ? 'text-cyan-400' : 'text-white'}
                `}>
                  {item.label}
                </div>
                <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                  {item.description}
                </div>
                {selectedAmount === item.value && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* 自定义金额 */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-violet-500/0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <label className="block text-gray-400 text-sm mb-2">自定义金额</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">¥</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount(0)
                  }}
                  placeholder="输入金额"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 支付按钮 */}
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full relative group overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxwYXRoIGQ9Ik0wIDBoNHY0SDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvc3ZnPg==')] opacity-20" />
          
          <div className="relative py-4 flex items-center justify-center gap-3">
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-white font-bold text-lg">发起支付中...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247 0-.06-.024-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.03-.406-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
                </svg>
                <span className="text-white font-bold text-lg">立即支付</span>
              </>
            )}
          </div>
        </button>

        {/* 底部提示 */}
        <p className="text-center text-gray-500 text-sm mt-6">
          支付安全由微信支付保障
        </p>
      </div>
    </div>
  )
}