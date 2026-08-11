import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SessionProvider from '@/components/SessionProvider'
import { authOptions } from '@/lib/auth'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'wrCBDjdh的博客',
  description: 'wrCBDjdh的个人博客',
  icons: {
    icon: '/favicon.png',
  },
}

// CSP nonce 方案要求：页面必须按请求动态渲染，不能静态预渲染。
// 静态页面在构建期渲染，其内联脚本没有 nonce；而 middleware 下发的 CSP
// 要求 nonce 匹配，脚本会被拦截，页面无法水合（V9 CSP 修复）。
export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} min-h-screen flex flex-col`}>
        <SessionProvider>
          <Header user={session?.user} />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="top-center" />
        </SessionProvider>
      </body>
    </html>
  )
}