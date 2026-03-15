import { User, Clock } from 'lucide-react'
import type { Comment } from '../types'

interface CommentItemProps {
  comment: Comment
}

export default function CommentItem({ comment }: CommentItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-surface border border-card rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="bg-card p-2 rounded-full">
          <User className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-400 text-sm">Аноним</span>
            <span className="text-gray-600 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-white">{comment.text}</p>
        </div>
      </div>
    </div>
  )
}
