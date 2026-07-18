import { prisma } from '@/lib/prisma'
import FriendLinkAvatar from '@/components/FriendLinkAvatar'

export const dynamic = 'force-dynamic'

interface FriendLink {
  id: string
  name: string
  url: string
  description: string | null
  avatar: string | null
}

export default async function FriendsPage() {
  const friendLinks = await prisma.friendLink.findMany({
    orderBy: { order: 'desc' },
    select: {
      id: true,
      name: true,
      url: true,
      description: true,
      avatar: true,
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">友情链接</h1>
      <p className="text-gray-500 mb-8">交换友链请联系我</p>

      {friendLinks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {friendLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <FriendLinkAvatar avatar={link.avatar} name={link.name} />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 truncate">
                  {link.name}
                </h3>
                {link.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {link.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">暂无友链</p>
        </div>
      )}
    </div>
  )
}