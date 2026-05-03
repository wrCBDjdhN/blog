'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 未登录跳转
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // 构建消息历史
      const chatMessages = [
        { role: 'system', content: '你是一个友好的AI助手，请用中文回答用户的问题。' },
        ...messages,
        userMessage
      ]

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || '发送失败')
        return
      }

      const assistantMessage: Message = { role: 'assistant', content: data.message }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      toast.error('发送失败')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-500">加载中...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto w-full">
      {/* 顶部标题 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">AI 助手</h1>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">开始和AI聊天吧</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-[#07c160] text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <p className="text-gray-400">正在思考...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="发送消息..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07c160] focus:border-[#07c160]"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-[#07c160] text-white rounded-lg hover:bg-[#06ad56] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}