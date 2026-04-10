import { format } from 'date-fns'

interface CommentProps {
  comment: {
    id: string
    content: string
    nickname?: string | null
    createdAt: Date
  }
}

export default function Comment({ comment }: CommentProps) {
  return (
    <div className="border-b border-gray-100 py-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-sm font-medium text-primary-600">
            {(comment.nickname || '匿名')[0]}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {comment.nickname || '匿名'}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm')}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
        </div>
      </div>
    </div>
  )
}