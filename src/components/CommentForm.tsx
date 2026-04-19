'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface CommentFormProps {
  targetId: string
  targetType: 'post' | 'product'
  onSuccess?: () => void
}

export default function CommentForm({
  targetId,
  targetType,
  onSuccess,
}: CommentFormProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Guard clause: content is required
    if (!content.trim()) {
      toast.error('请输入评论内容')
      return
    }

    // Guard clause: nickname is required for anonymous users
    const finalNickname = session?.user?.name || nickname.trim() || '匿名'

    try {
      setLoading(true)
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId,
          targetType,
          content,
          nickname: finalNickname,
        }),
      })

      if (!res.ok) throw new Error('Failed to comment')

      toast.success('评论成功')
      setContent('')
      setNickname('')
      onSuccess?.()
    } catch (error) {
      toast.error('评论失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Show nickname input only when user is not logged in */}
      {!session && (
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="昵称（留空默认为匿名）"
          defaultValue="匿名"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的评论..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {loading ? '提交中...' : '提交评论'}
      </button>
    </form>
  )
}