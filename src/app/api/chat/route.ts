import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'
const MODEL = 'meta/llama-3.1-405b-instruct'

// 处理异步响应的轮询
async function pollForResult(apiKey: string, requestId: string, attempt = 0): Promise<string> {
  const maxAttempts = 30 // 最多轮询30次
  const delayMs = 2000 // 每次等待2秒

  if (attempt >= maxAttempts) {
    throw new Error('响应超时，请重试')
  }

  await new Promise(resolve => setTimeout(resolve, delayMs))

  const response = await fetch(`${NVIDIA_API_URL}?requestId=${requestId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (response.status === 202) {
    return pollForResult(apiKey, requestId, attempt + 1)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function POST(request: Request) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 300000) // 5分钟超时

  try {
    // 验证登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: '无效的消息格式' }, { status: 400 })
    }

    const apiKey = process.env.NVIDIA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API配置错误' }, { status: 500 })
    }

    // 调用 Nvidia API
    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
      }),
      signal: controller.signal,
    })

    // 处理202异步响应
    if (response.status === 202) {
      const requestId = response.headers.get('NVCF-REQID')
      if (!requestId) {
        return NextResponse.json({ error: 'AI响应失败：无法获取请求ID' }, { status: 502 })
      }

      try {
        const content = await pollForResult(apiKey, requestId)
        return NextResponse.json({ message: content })
      } catch (pollError) {
        console.error('Polling error:', pollError)
        return NextResponse.json({ error: 'AI响应超时' }, { status: 504 })
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Nvidia API error:', response.status, errorText)
      return NextResponse.json({ error: `AI响应失败: ${response.status}` }, { status: 502 })
    }

    const data = await response.json()

    return NextResponse.json({
      message: data.choices?.[0]?.message?.content || '无响应'
    })
  } catch (error: any) {
    console.error('Chat API error:', error.message || error)

    if (error.name === 'AbortError' || error.code === 'ABORT_ERR') {
      return NextResponse.json({ error: '请求超时，AI响应时间过长' }, { status: 504 })
    }

    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  } finally {
    clearTimeout(timeoutId)
  }
}