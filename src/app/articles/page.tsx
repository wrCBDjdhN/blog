import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'

export const metadata = {
  title: '文章 - Personal Blog',
}

export default async function ArticlesPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { likes: true, comments: true },
      },
    },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">文章</h1>
      
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">暂无文章</p>
        </div>
      )}
    </div>
  )
}