import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Send, Plus, Phone, Instagram, MessageCircle as WhatsAppIcon, Send as TelegramIcon, User } from 'lucide-react'
import { addComment, getPhoneComments, getRecordById } from '../services/api'
import { useLanguage, formatPhoneKZ } from '../i18n'
import type { Comment, PhoneNumber, Platform } from '../types'

const platformConfig: Record<Platform, { icon: typeof Phone; gradient: string; shadowColor: string; label: { ru: string; kz: string } }> = {
  phone: { icon: Phone, gradient: 'from-green-500 to-emerald-600', shadowColor: 'shadow-green-500/30', label: { ru: 'Телефон', kz: 'Телефон' } },
  instagram: { icon: Instagram, gradient: 'from-pink-500 to-rose-600', shadowColor: 'shadow-pink-500/30', label: { ru: 'Instagram', kz: 'Instagram' } },
  whatsapp: { icon: WhatsAppIcon, gradient: 'from-emerald-500 to-teal-600', shadowColor: 'shadow-emerald-500/30', label: { ru: 'WhatsApp', kz: 'WhatsApp' } },
  telegram: { icon: TelegramIcon, gradient: 'from-blue-500 to-cyan-600', shadowColor: 'shadow-blue-500/30', label: { ru: 'Telegram', kz: 'Telegram' } },
}

export default function NumberDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const [record, setRecord] = useState<PhoneNumber | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadPhoneDetails()
    }
  }, [id])

  const loadPhoneDetails = async () => {
    setLoading(true)
    try {
      const [recordData, commentsData] = await Promise.all([
        getRecordById(id!),
        getPhoneComments(id!)
      ])
      setRecord(recordData)
      setComments(commentsData)
    } catch (err) {
      console.error('Error loading details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !id) return

    setSubmitting(true)
    setError(null)
    try {
      const comment = await addComment(id, newComment.trim())
      if (comment) {
        setComments([comment, ...comments])
        setNewComment('')
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось добавить комментарий')
    } finally {
      setSubmitting(false)
    }
  }

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'spam': return { label: t.categories.spam, emoji: '⚠️' }
      case 'fraud': return { label: t.categories.fraud, emoji: '🚨' }
      case 'scam': return { label: t.categories.scam, emoji: '💀' }
      case 'fake': return { label: t.categories.fake, emoji: '🎭' }
      default: return { label: t.categories.unknown, emoji: '❓' }
    }
  }

  const platform = (record?.platform || 'phone') as Platform
  const config = platformConfig[platform]
  const Icon = config.icon
  const displayIdentifier = record?.identifier || record?.phone || ''
  const formattedIdentifier = (platform === 'phone' || platform === 'whatsapp') 
    ? formatPhoneKZ(displayIdentifier) 
    : displayIdentifier
  const catInfo = record ? getCategoryInfo(record.category) : null

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-primary/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header with gradient */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} px-4 pt-4 pb-6 -mx-4 -mt-4 mb-4`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            {language === 'kz' ? 'Артқа' : 'Назад'}
          </button>

          {record && (
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-xl">{formattedIdentifier}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-white/80 text-sm">{config.label[language]}</span>
                  {catInfo && (
                    <>
                      <span className="text-white/50">•</span>
                      <span className="text-white/80 text-sm">{catInfo.emoji} {catInfo.label}</span>
                    </>
                  )}
                  <span className="text-white/50">•</span>
                  <span className="text-white/80 text-sm">{record.reportsCount} {t.details.reports}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Report Button */}
      <div className="px-4 mb-4">
        <Link
          to={`/add${record ? `?platform=${platform}` : ''}`}
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r ${config.gradient} shadow-lg ${config.shadowColor} text-white font-medium transition-all active:scale-[0.98]`}
        >
          <Plus className="w-5 h-5" />
          {language === 'kz' ? 'Шағым қосу' : 'Добавить жалобу'}
        </Link>
      </div>

      {/* Comments Section */}
      <div className="px-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-medium text-gray-400">{t.details.comments} ({comments.length})</h2>
        </div>

        {/* Desktop comment form */}
        <form onSubmit={handleSubmitComment} className="mb-4 hidden md:block">
          <div className="flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={language === 'kz' ? 'Пікір жазыңыз...' : 'Напишите комментарий...'}
              maxLength={500}
              className="flex-1 bg-surface/50 backdrop-blur-sm border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/30"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className={`bg-gradient-to-r ${config.gradient} disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-5 rounded-2xl transition-all active:scale-95`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {error && <p className="text-danger text-sm mt-2">{error}</p>}
        </form>

        {comments.length > 0 ? (
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-surface/50 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{comment.author}</span>
                      <span className="text-gray-600 text-xs">
                        {new Date(comment.createdAt).toLocaleDateString(language === 'kz' ? 'kk-KZ' : 'ru-RU')}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface/50 mb-3">
              <MessageSquare className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-500">{t.details.noComments}</p>
            <p className="text-gray-600 text-sm mt-1">{language === 'kz' ? 'Бірінші болыңыз!' : 'Будьте первым!'}</p>
          </div>
        )}
      </div>

      {/* Mobile sticky comment input */}
      <form 
        onSubmit={handleSubmitComment} 
        className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-white/5 p-4 md:hidden z-50"
      >
        <div className="flex gap-3 max-w-xl mx-auto">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={language === 'kz' ? 'Пікір жазыңыз...' : 'Напишите комментарий...'}
            maxLength={500}
            className="flex-1 bg-background/50 border border-white/10 rounded-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/30"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className={`bg-gradient-to-r ${config.gradient} disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all active:scale-95`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {error && <p className="text-danger text-sm mt-2 text-center">{error}</p>}
      </form>
    </div>
  )
}
