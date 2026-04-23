import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import LikeButton from '@/components/LikeButton'
import Comment from '@/components/Comment'
import CommentForm from '@/components/CommentForm'

interface ArticlePageProps {
  params: { id: string }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const session = await getServerSession(authOptions)
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { name: true } },
      likes: { select: { userId: true } },
      comments: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, content: true, nickname: true, createdAt: true },
      },
      _count: { select: { likes: true, comments: true } },
    },
  })

  if (!post) {
    notFound()
  }

  await prisma.post.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  })

  const isLiked = session?.user
    ? post.likes.some((like) => like.userId === session.user.id)
    : false

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <article>
        {post.coverImage && (
          <div className="relative h-64 md:h-96 w-full mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{post.title}</h1>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span>{post.author?.name || '博主'}</span>
          <span>·</span>
          <span>{format(new Date(post.createdAt), 'yyyy-MM-dd')}</span>
          <span>·</span>
          <span>{post.viewCount} 阅读</span>
        </div>

        <div className="prose mt-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      <div className="mt-12 flex items-center gap-4 border-t pt-8">
        <LikeButton
          targetId={post.id}
          targetType="post"
          initialLiked={isLiked}
          initialCount={post._count.likes}
        />
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          评论 ({post._count.comments})
        </h2>

        <CommentForm targetId={post.id} targetType="post" />

        <div className="mt-8 space-y-0">
          {post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))
          ) : (
            <p className="text-gray-500 text-sm">暂无评论，快来抢沙发吧</p>
          )}
        </div>
      </section>
    </div>
  )
}