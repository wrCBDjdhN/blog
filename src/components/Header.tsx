'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

interface HeaderProps {
  user?: {
    name?: string | null
    email: string
  } | null
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            My Blog
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              关于
            </Link>
            <Link
              href="/articles"
              className={`text-sm font-medium transition-colors ${
                isActive('/articles') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              文章
            </Link>
            <Link
              href="/friends"
              className={`text-sm font-medium transition-colors ${
                isActive('/friends') ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              友链
            </Link>
            {user ? (
              <>
                <Link
                  href="/admin"
                    className={`text-sm font-medium transition-colors ${
pathname === '/admin' || pathname?.startsWith('/admin/posts') || pathname?.startsWith('/admin/friendlinks')
                        ? 'text-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    管理后台
                  </Link>
                <Link
                  href="/account"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/account' ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  账号设置
                </Link>
                <span className="text-sm text-gray-500">
                  {user.name || '用户'}
                </span>
              </>
            ) : (
              <Link
                href="/login"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/login' ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                登录
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                退出
              </button>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-3">
              <Link href="/" className="text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>
                关于
              </Link>
              <Link href="/articles" className="text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>
                文章
              </Link>
              {user ? (
                <>
                  <Link href="/admin" className="text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>
                    管理后台
                  </Link>
                </>
              ) : (
                <Link href="/login" className="text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>
                  登录
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}