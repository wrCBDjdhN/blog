import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1'
const MODEL = 'meta/llama-3.1-405b-instruct'

export async function POST(request: Request) {
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

    console.log('Sending to NVIDIA API:', { model: MODEL, messages })

    // 调用 Nvidia API
    const response = await fetch(`${NVIDIA_API_URL}/chat/completions`, {
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
    })

    const status = response.status
    const responseText = await response.text()
    
    console.log('NVIDIA API response:', status, responseText.substring(0, 500))

    if (status !== 200) {
      return NextResponse.json({ error: `AI响应失败: ${status}` }, { status: 502 })
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      return NextResponse.json({ error: 'AI响应解析失败' }, { status: 502 })
    }
    
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      console.error('No content in response:', data)
      return NextResponse.json({ error: 'AI无响应' }, { status: 502 })
    }

    return NextResponse.json({ message: content })
  } catch (error: any) {
    console.error('Chat API error:', error.message || error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}