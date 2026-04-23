import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Quote from '@/components/Quote'
import PostCard from '@/components/PostCard'
import ProductCard from '@/components/ProductCard'
import Clock from '@/components/Clock'
import { GithubIcon, EmailIcon, BilibiliIcon } from '@/components/Icons'

// 固定头像路径 - 使用本地头像
const AVATAR_PATH = '/avatars/my-photo.png'

export default async function HomePage() {
  // 并行执行所有数据库查询，消除 waterfall
  const [user, recentPosts, recentProducts, stats] = await Promise.all([
    prisma.user.findFirst({ orderBy: { createdAt: 'asc' } }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { _count: { select: { likes: true, comments: true } } },
    }),
    prisma.product.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { _count: { select: { likes: true, comments: true } } },
    }),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 pt-20 min-h-screen bg-gradient-to-b from-amber-50/50 via-violet-25/30 to-orange-50/50">
      <Quote />
      <section className="flex flex-col md:flex-row items-center gap-12 mb-16">
        <div className="w-32 h-32 md:w-40 md:h-40 relative flex-shrink-0">
          <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
            {/* 固定使用本地头像，显示首字母作为备用 */}
            <img src={AVATAR_PATH} alt={user?.name || ''} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'wrCBDjdh'}</h1>
          <p className="mt-2 text-gray-600 max-w-lg">{user?.bio || 'Welcome to my personal blog. I am a beginner programmer, skilled in backend development, accustomed to using Python, Java, Rust, and C++, and develop using VS Code, Docker, and Windows.'}</p>
          <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
            {user?.github && (
              <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                <GithubIcon />
              </a>
            )}
            {user?.email && (
              <a href={`mailto:${user.email}`} className="text-gray-500 hover:text-gray-900">
                <EmailIcon />
              </a>
            )}
            {user?.bilibili && (
              <a href={user.bilibili} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900">
                <BilibiliIcon />
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
          <div className="mt-4">
            <Clock />
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