import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Quote from '@/components/Quote'
import PostCard from '@/components/PostCard'
import ProductCard from '@/components/ProductCard'

export default async function HomePage() {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
  })

  const recentPosts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      _count: {
        select: { likes: true, comments: true },
      },
    },
  })

  const recentProducts = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: {
      _count: {
        select: { likes: true, comments: true },
      },
    },
  })

  const stats = await prisma.post.aggregate({
    _sum: { viewCount: true },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 min-h-screen bg-gradient-to-b from-amber-50/50 via-violet-25/30 to-orange-50/50">
      <Quote />
      <section className="flex flex-col md:flex-row items-center gap-12 mb-16">
        <div className="w-32 h-32 md:w-40 md:h-40 relative flex-shrink-0">
          <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <Image src={user.avatar} alt={user.name || ''} fill className="object-cover" />
            ) : (
              <span className="text-4xl text-primary-600">{user?.name?.[0] || 'B'}</span>
            )}
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'wrCBDjdh'}</h1>
          <p className="mt-2 text-gray-600 max-w-lg">{user?.bio || 'Welcome to my personal blog. I am a beginner programmer, skilled in backend development, accustomed to using Python, Java, Rust, and C++, and develop using VS Code, Docker, and Windows.'}</p>
          <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
            {user?.github && (
              <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            )}
            {user?.email && (
              <a href={`mailto:${user.email}`} className="text-gray-500 hover:text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            )}
            {user?.bilibili && (
              <a href={user.bilibili} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 16.5c0 .828-.672 1.5-1.5 1.5h-6c-.828 0-1.5-.672-1.5-1.5v-4.5c0-.828.672-1.5 1.5-1.5h6c.828 0 1.5.672 1.5 1.5v4.5zm-1.5-6h-4.5v3h4.5v-3zm-2.25-1.5v4.5h-1.5v-4.5h1.5z"/>
                </svg>
              </a>
            )}
          </div>
          <div className="mt-6 flex items-center justify-center md:justify-start gap-6 text-sm text-gray-500">
            <div>
              <span className="block text-2xl font-bold text-gray-900">{stats._sum.viewCount || 0}</span>
              <span>总阅读</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-gray-900">{recentPosts.length}</span>
              <span>文章</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-gray-900">{recentProducts.length}</span>
              <span>商品</span>
            </div>
          </div>
        </div>
      </section>

      {recentPosts.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">最新文章</h2>
            <Link href="/articles" className="text-sm text-primary-600 hover:text-primary-700">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {recentProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">商品展示</h2>
            <Link href="/products" className="text-sm text-primary-600 hover:text-primary-700">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {recentPosts.length === 0 && recentProducts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">博主还没有发布任何内容</p>
        </div>
      )}
    </div>
  )
}