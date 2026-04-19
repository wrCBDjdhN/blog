import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  const [postCount, productCount, totalViews, recentPosts, recentProducts] = await Promise.all([
    prisma.post.count(),
    prisma.product.count(),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">管理后台</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">文章数量</div>
          <div className="text-3xl font-bold text-gray-900">{postCount}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">商品数量</div>
          <div className="text-3xl font-bold text-gray-900">{productCount}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">总阅读量</div>
          <div className="text-3xl font-bold text-gray-900">{totalViews._sum.viewCount || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">文章管理</h2>
            <Link href="/admin/posts/new" className="text-sm text-primary-600 hover:text-primary-700">
              新建文章
            </Link>
          </div>
          {recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href="/admin/posts"
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-900 truncate">{post.title}</span>
                  <span className="text-xs text-gray-500">
                    {post.published ? '已发布' : '草稿'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">暂无文章</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">商品管理</h2>
            <Link href="/admin/products/new" className="text-sm text-primary-600 hover:text-primary-700">
              新建商品
            </Link>
          </div>
          {recentProducts.length > 0 ? (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <Link
                  key={product.id}
                  href="/admin/products"
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-900 truncate">{product.name}</span>
                  <span className="text-xs text-gray-500">
                    {product.published ? '已发布' : '草稿'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">暂无商品</p>
          )}
        </div>
      </div>
    </div>
  )
}