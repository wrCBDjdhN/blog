'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ImageUploader from '@/components/ImageUploader'

interface FriendLink {
  id: string
  name: string
  url: string
  description: string | null
  avatar: string | null
  order: number
  createdAt: string
}

export default function FriendLinksPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  const [friendLinks, setFriendLinks] = useState<FriendLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    avatar: '',
    order: 0,
  })
  const [submitting, setSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('请输入网站名称')
      return
    }

    if (!formData.url.trim()) {
      toast.error('请输入网站URL')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/friendlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to create')

      toast.success('创建成功')
      setFormData({ name: '', url: '', description: '', avatar: '', order: 0 })
      setShowForm(false)
      
      const listRes = await fetch('/api/admin/friendlinks')
      if (listRes.ok) {
        const data = await listRes.json()
        setFriendLinks(data)
      }
    } catch {
      toast.error('创建失败')
    } finally {
      setSubmitting(false)
    }
  }

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
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {showForm ? '取消' : '新增友链'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">网站名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入网站名称"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">网站URL *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">描述</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入描述（可选）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">头像</label>
              {formData.avatar && (
                <img
                  src={formData.avatar}
                  alt="头像预览"
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <ImageUploader
                onUpload={(url) => setFormData({ ...formData, avatar: url })}
              />
            </div>
            <div className="w-24">
              <label className="block text-sm text-gray-600 mb-1">排序</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? '创建中...' : '创建'}
          </button>
        </form>
      )}

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
                排序
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {friendLinks.length > 0 ? (
              friendLinks.map((link) => (
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
                  <td className="px-6 py-4 text-sm text-gray-500">{link.order}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
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
                  colSpan={4}
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