import { useState, useEffect } from 'react'
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, 
  Send, User, Clock, ChevronDown, ChevronUp
} from 'lucide-react'
import { useLanguage } from '../i18n'
import { getPhoneComments, addComment as apiAddComment } from '../services/api'

interface Comment {
  id: string
  author: string
  avatar?: string
  text: string
  likes: number
  replies: Comment[]
  createdAt: string
  isLiked?: boolean
}

interface ThreadsCommentsProps {
  recordId: string
  initialComments?: Comment[]
}


function formatTimeAgo(dateString: string, language: 'ru' | 'kz'): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (language === 'kz') {
    if (diffMins < 1) return 'жаңа ғана'
    if (diffMins < 60) return `${diffMins} мин`
    if (diffHours < 24) return `${diffHours} сағ`
    if (diffDays < 7) return `${diffDays} күн`
    return date.toLocaleDateString('kk-KZ', { day: 'numeric', month: 'short' })
  }
  
  if (diffMins < 1) return 'только что'
  if (diffMins < 60) return `${diffMins} мин`
  if (diffHours < 24) return `${diffHours} ч`
  if (diffDays < 7) return `${diffDays} д`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function ThreadComment({ 
  comment, 
  isLast = false,
  depth = 0,
  language = 'ru'
}: { 
  comment: Comment
  isLast?: boolean
  depth?: number
  language?: 'ru' | 'kz'
}) {
  const [isLiked, setIsLiked] = useState(comment.isLiked || false)
  const [likes, setLikes] = useState(comment.likes)
  const [showReplies, setShowReplies] = useState(depth === 0)
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const handleReply = () => {
    if (replyText.trim()) {
      alert(language === 'kz' ? `Жауап: ${replyText}` : `Ответ: ${replyText}`)
      setReplyText('')
      setIsReplying(false)
    }
  }

  return (
    <div className="flex gap-3">
      {/* Avatar and thread line */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        {(!isLast || comment.replies.length > 0) && (
          <div className="w-0.5 flex-1 bg-card mt-2 min-h-[20px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">{comment.author}</span>
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(comment.createdAt, language)}
            </span>
          </div>
          <button className="text-gray-500 hover:text-gray-300 p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Text */}
        <p className="text-white text-sm leading-relaxed mb-3">{comment.text}</p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            {likes > 0 && <span>{likes}</span>}
          </button>
          
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {comment.replies.length > 0 && <span>{comment.replies.length}</span>}
          </button>
          
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Reply input */}
        {isReplying && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={language === 'kz' ? 'Жауап жазу...' : 'Написать ответ...'}
              className="flex-1 bg-card border border-gray-700 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleReply()}
            />
            <button 
              onClick={handleReply}
              disabled={!replyText.trim()}
              className="bg-primary hover:bg-primary/80 disabled:bg-gray-600 text-white p-2 rounded-full transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Replies toggle */}
        {comment.replies.length > 0 && depth === 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-primary text-sm mt-3 hover:underline"
          >
            {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showReplies 
              ? (language === 'kz' ? 'Жауаптарды жасыру' : 'Скрыть ответы')
              : (language === 'kz' ? `${comment.replies.length} жауапты көрсету` : `Показать ${comment.replies.length} ответов`)
            }
          </button>
        )}

        {/* Nested replies */}
        {showReplies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-0">
            {comment.replies.map((reply, index) => (
              <ThreadComment 
                key={reply.id} 
                comment={reply} 
                isLast={index === comment.replies.length - 1}
                depth={depth + 1}
                language={language}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ThreadsComments({ recordId, initialComments }: ThreadsCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || [])
  const [newComment, setNewComment] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const { t, language } = useLanguage()

  useEffect(() => {
    if (isExpanded && recordId) {
      loadComments()
    }
  }, [isExpanded, recordId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const data = await getPhoneComments(recordId)
      if (Array.isArray(data)) {
        const formattedComments: Comment[] = data.map((c: any) => ({
          id: c.id,
          author: c.author || 'Аноним',
          text: c.text,
          likes: c.likes || 0,
          createdAt: c.createdAt,
          replies: c.replies || [],
        }))
        setComments(formattedComments)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (newComment.trim()) {
      try {
        const result = await apiAddComment(recordId, newComment.trim())
        if (result) {
          const comment: Comment = {
            id: result.id || Date.now().toString(),
            author: result.author || `Аноним_${Math.floor(Math.random() * 9999)}`,
            text: newComment.trim(),
            likes: 0,
            createdAt: new Date().toISOString(),
            replies: [],
          }
          setComments([comment, ...comments])
          setNewComment('')
        }
      } catch (error) {
        console.error('Error adding comment:', error)
        // Fallback to local add
        const comment: Comment = {
          id: Date.now().toString(),
          author: `Аноним_${Math.floor(Math.random() * 9999)}`,
          text: newComment.trim(),
          likes: 0,
          createdAt: new Date().toISOString(),
          replies: [],
        }
        setComments([comment, ...comments])
        setNewComment('')
      }
    }
  }

  return (
    <div className="bg-surface border border-card rounded-xl overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-card/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <span className="font-semibold text-white">{t.details.comments}</span>
          <span className="text-gray-500 text-sm">({comments.length})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {isExpanded && (
        <>
          {loading && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {/* New comment input */}
          <div className="px-4 pb-4 border-b border-card">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t.details.addComment}
                  rows={2}
                  className="w-full bg-transparent text-white placeholder-gray-500 text-sm resize-none focus:outline-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={!newComment.trim()}
                    className="bg-primary hover:bg-primary/80 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
                  >
                    {t.addForm.submitButton}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments list */}
          <div className="p-4 space-y-0">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <ThreadComment 
                  key={comment.id} 
                  comment={comment} 
                  isLast={index === comments.length - 1}
                  language={language}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t.details.noComments}</p>
                <p className="text-sm">{language === 'kz' ? 'Бірінші болыңыз!' : 'Будьте первым!'}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
