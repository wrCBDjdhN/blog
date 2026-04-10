import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'

export const metadata = {
  title: '商品 - Personal Blog',
}

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">商品</h1>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">暂无商品</p>
        </div>
      )}
    </div>
  )
}