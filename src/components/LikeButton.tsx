'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface LikeButtonProps {
  targetId: string
  targetType: 'post' | 'product'
  initialLiked?: boolean
  initialCount?: number
}

export default function LikeButton({
  targetId,
  targetType,
  initialLiked = false,
  initialCount = 0,
}: LikeButtonProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (!session) {
      toast.error('请先登录')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId,
          targetType,
        }),
      })

      if (!res.ok) throw new Error('Failed to like')

      const data = await res.json()
      setLiked(data.liked)
      setCount(data.count)
    } catch (error) {
      toast.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
        liked
          ? 'bg-red-50 text-red-500'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${loading ? 'opacity-50' : ''}`}
    >
      <svg
        className="w-4 h-4"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{count}</span>
    </button>
  )
}