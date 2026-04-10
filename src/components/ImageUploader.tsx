'use client'

import { useState, useRef } from 'react'
import toast from 'react-hot-toast'

interface ImageUploaderProps {
  onUpload?: (url: string) => void
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()
      toast.success('上传成功')
      
      if (onUpload) {
        onUpload(data.url)
      } else {
        await navigator.clipboard.writeText(data.url)
        toast.success('URL 已复制到剪贴板')
      }
    } catch (error) {
      toast.error('上传失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={loading}
        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
      >
        {loading ? '上传中...' : '上传图片'}
      </button>
    </div>
  )
}