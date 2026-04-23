'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface FriendLink {
  id: string
  name: string
  url: string
  description: string | null
  avatar: string | null
  order: number
  status: string
  createdAt: string
}

export default function FriendLinksPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  const [friendLinks, setFriendLinks] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [sessionStatus, router])

  useEffect(() => {
    async function fetchFriendLinks() {
      if (!session) return

      try {
        const res = await fetch('/api/admin/friendlinks')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setFriendLinks(data)
      } catch {
        toast.error('获取友链失败')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchFriendLinks()
    }
  }, [session])

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个友链吗？')) return

    try {
      const res = await fetch(`/api/admin/friendlinks/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast.success('删除成功')
      setFriendLinks((prev) => prev.filter((link) => link.id !== id))
    } catch {
      toast.error('删除失败')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/friendlinks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update')

      toast.success('状态更新成功')
      setFriendLinks((prev) =>
        prev.map((link) => (link.id === id ? { ...link, status: newStatus } : link))
      )
    } catch {
      toast.error('更新失败')
    }
  }

  const filteredLinks = friendLinks.filter((link) => {
    if (filter === 'all') return true
    return link.status === filter
  })

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">友链管理</h1>
        <Link
          href="/admin/friendlinks/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          新增友链
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            filter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            filter === 'approved'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          已通过
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            filter === 'pending'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          待审核
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            filter === 'rejected'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          已拒绝
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                描述
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                排序
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLinks.length > 0 ? (
              filteredLinks.map((link) => (
                <tr key={link.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {link.avatar && (
                        <img
                          src={link.avatar}
                          alt={link.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {link.name}
                        </div>
                        <div className="text-xs text-gray-500">{link.url}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {link.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        link.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : link.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {link.status === 'approved'
                        ? '已通过'
                        : link.status === 'pending'
                          ? '待审核'
                          : '已拒绝'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{link.order}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {link.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(link.id, 'approved')}
                            className="text-sm text-green-600 hover:text-green-700"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => handleStatusChange(link.id, 'rejected')}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            拒绝
                          </button>
                        </>
                      )}
                      {link.status === 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(link.id, 'approved')}
                          className="text-sm text-green-600 hover:text-green-700"
                        >
                          重新通过
                        </button>
                      )}
                      {link.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(link.id, 'rejected')}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          拒绝
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="text-sm text-gray-600 hover:text-gray-700"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  暂无友链
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}