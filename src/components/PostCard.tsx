import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { memo } from 'react'

interface PostCardProps {
  post: {
    id: string
    title: string
    summary?: string | null
    coverImage?: string | null
    createdAt: Date
    viewCount: number
    _count?: {
      likes: number
      comments: number
    }
  }
}

function PostCardComponent({ post }: PostCardProps) {
  return (
    <Link href={`/articles/${post.id}`} className="group block">
      <article className="bg-white/70 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-amber-100/50">
        {post.coverImage && (
          <div className="relative h-48 w-full">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
          {post.summary && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {post.summary}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>{format(new Date(post.createdAt), 'yyyy-MM-dd')}</span>
            <span>阅读 {post.viewCount}</span>
            {post._count && (
              <>
                <span>点赞 {post._count.likes}</span>
                <span>评论 {post._count.comments}</span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

export default memo(PostCardComponent)