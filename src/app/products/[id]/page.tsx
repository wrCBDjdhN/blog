import { notFound } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import LikeButton from '@/components/LikeButton'
import Comment from '@/components/Comment'
import CommentForm from '@/components/CommentForm'

interface ProductPageProps {
  params: { id: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const session = await getServerSession(authOptions)
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      likes: { select: { userId: true } },
      comments: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, content: true, nickname: true, createdAt: true },
      },
      _count: { select: { likes: true, comments: true } },
    },
  })

  if (!product) {
    notFound()
  }

  const images = JSON.parse(product.images || '[]') as string[]
  const isLiked = session?.user
    ? product.likes.some((like) => like.userId === session.user.id)
    : false

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {product.coverImage && (
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
              <Image
                src={product.coverImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded overflow-hidden">
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          
          <p className="mt-4 text-4xl font-bold text-primary-600">
            ¥{product.price.toFixed(2)}
          </p>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span>{format(new Date(product.createdAt), 'yyyy-MM-dd')}</span>
          </div>

          <div className="mt-6 prose prose-sm max-w-none">
            <p>{product.description}</p>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <LikeButton
              targetId={product.id}
              targetType="product"
              initialLiked={isLiked}
              initialCount={product._count.likes}
            />
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          评论 ({product._count.comments})
        </h2>

        <CommentForm targetId={product.id} targetType="product" />

        <div className="mt-8 space-y-0">
          {product.comments.length > 0 ? (
            product.comments.map((comment) => (
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