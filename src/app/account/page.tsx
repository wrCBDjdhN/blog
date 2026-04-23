'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface UserInfo {
  email: string
  name: string | null
  avatar: string | null
}

export default function AccountPage() {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Nickname form
  const [nickname, setNickname] = useState('')
  const [nicknameLoading, setNicknameLoading] = useState(false)

  // Avatar form
  const [avatar, setAvatar] = useState('')
  const [avatarLoading, setAvatarLoading] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Guard clause: redirect if not authenticated
  useEffect(() => {
    if (!session) {
      router.push('/admin/login')
    }
  }, [session, router])

  // Fetch user info on mount
  useEffect(() => {
    async function fetchUserInfo() {
      if (!session) return

      try {
        const res = await fetch('/api/account')
        if (!res.ok) throw new Error('Failed to fetch user info')
        const data = await res.json()
        setUserInfo(data)
        setNickname(data.name || '')
        setAvatar(data.avatar || '')
      } catch {
        toast.error('获取用户信息失败')
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [session])

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nickname.trim()) {
      toast.error('请输入昵称')
      return
    }

    try {
      setNicknameLoading(true)
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nickname.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || '更新昵称失败')
        return
      }

      toast.success('昵称更新成功')
      setUserInfo((prev) => (prev ? { ...prev, name: nickname.trim() } : null))
      await updateSession({ name: nickname.trim() })
    } catch {
      toast.error('更新昵称失败')
    } finally {
      setNicknameLoading(false)
    }
  }

  const handleAvatarSubmit = async () => {
    if (!avatar.trim()) {
      toast.error('请输入头像路径')
      return
    }

    try {
      setAvatarLoading(true)
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatar.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || '更新头像失败')
        return
      }

      toast.success('头像更新成功')
      setUserInfo((prev) => (prev ? { ...prev, avatar: avatar.trim() } : null))
    } catch {
      toast.error('更新头像失败')
    } finally {
      setAvatarLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword) {
      toast.error('请输入当前密码')
      return
    }

    if (!newPassword) {
      toast.error('请输入新密码')
      return
    }

    if (newPassword.length < 6) {
      toast.error('新密码至少需要6个字符')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    try {
      setPasswordLoading(true)
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || '更新密码失败')
        return
      }

      toast.success('密码更新成功')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('更新密码失败')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!session || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">账户设置</h1>

      {/* User Info Display */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">当前信息</h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-500">邮箱</span>
            <p className="text-gray-900">{userInfo?.email}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">昵称</span>
            <p className="text-gray-900">{userInfo?.name || '未设置'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">头像</span>
            <div className="mt-1 flex items-center gap-3">
              {userInfo?.avatar ? (
                <img src={userInfo.avatar} alt="头像" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-lg text-primary-600">{userInfo?.name?.[0] || 'U'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">修改头像</h2>
        <p className="text-sm text-gray-500 mb-4">
          头像图片请放置在 public/avatars/ 目录下，然后输入图片路径（如 /avatars/avatar.png）
        </p>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt="头像预览" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl text-gray-400">{nickname?.[0] || 'U'}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="/avatars/avatar.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="button"
              onClick={handleAvatarSubmit}
              disabled={avatarLoading || !avatar.trim()}
              className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {avatarLoading ? '保存中...' : '保存头像'}
            </button>
          </div>
        </div>
      </div>

      {/* Nickname Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">修改昵称</h2>
        <form onSubmit={handleNicknameSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">新昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入新昵称"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={nicknameLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {nicknameLoading ? '保存中...' : '保存昵称'}
          </button>
        </form>
      </div>

      {/* Password Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">修改密码</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">当前密码</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="请输入当前密码"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码（至少6位）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {passwordLoading ? '保存中...' : '修改密码'}
          </button>
        </form>
      </div>
    </div>
  )
}