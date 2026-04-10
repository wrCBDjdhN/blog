'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ImageUploader from '@/components/ImageUploader'

export default function NewPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    coverImage: '',
    published: true,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check')
      if (res.ok) {
        setAuthorized(true)
      } else {
        router.push('/admin/login')
      }
    } catch {
      router.push('/admin/login')
    } finally {
      setChecking(false)
    }
  }

  const handleImageUpload = (url: string) => {
    setForm({ ...form, coverImage: url })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title || !form.content) {
      toast.error('请填写标题和内容')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          content: form.content,
          coverImage: form.coverImage,
          published: form.published,
        }),
      })

      if (!res.ok) throw new Error('Failed to create post')

      toast.success('文章创建成功')
      router.push('/admin')
      router.refresh()
    } catch (error) {
      toast.error('创建失败')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">新建文章</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标题 *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="文章标题"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            摘要
          </label>
          <textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            placeholder="文章摘要（可选）"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            封面图片
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="图片URL"
            />
            <ImageUploader onUpload={handleImageUpload} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            内容 * (Markdown)
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={20}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm resize-none"
            placeholder="使用 Markdown 编写文章内容..."
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">立即发布</span>
          </label>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '保存中...' : '保存文章'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}