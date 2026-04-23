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