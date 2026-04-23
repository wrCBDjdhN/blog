'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface FriendLink {
  id: string
  name: string
  url: string
  description: string | null
  avatar: string | null
}

export default function FriendsPage() {
  const [friendLinks, setFriendLinks] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFriendLinks() {
      try {
        const res = await fetch('/api/friendlinks')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setFriendLinks(data)
      } catch {
        // Silently fail - no friend links yet
        setFriendLinks([])
      } finally {
        setLoading(false)
      }
    }

    fetchFriendLinks()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">友情链接</h1>
      <p className="text-gray-500 mb-8">交换友链请联系博主</p>

      {friendLinks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {friendLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {link.avatar ? (
                <img
                  src={link.avatar}
                  alt={link.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg text-primary-600">{link.name[0]}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 truncate">
                  {link.name}
                </h3>
                {link.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {link.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">暂无友链</p>
        </div>
      )}
    </div>
  )
}