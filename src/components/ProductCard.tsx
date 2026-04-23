import Link from 'next/link'
import Image from 'next/image'
import { memo } from 'react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    coverImage?: string | null
    _count?: {
      likes: number
      comments: number
    }
  }
}

function ProductCardComponent({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <article className="bg-white/70 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-amber-100/50">
        {product.coverImage && (
          <div className="relative h-48 w-full">
            <Image
              src={product.coverImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {product.name}
          </h2>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-primary-600">
              ¥{product.price.toFixed(2)}
            </span>
            {product._count && (
              <span className="text-xs text-gray-500">
                {product._count.likes} 赞 · {product._count.comments} 评论
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

export default memo(ProductCardComponent)