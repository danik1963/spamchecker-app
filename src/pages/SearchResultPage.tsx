import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Phone, ShieldAlert, AlertTriangle, CheckCircle, 
  Loader2, ArrowLeft, Flag, MessageSquare 
} from 'lucide-react'
import { searchPhone } from '../services/api'
import { useLanguage } from '../i18n'
import type { SearchResult, Platform } from '../types'

export default function SearchResultPage() {
  const { phone } = useParams<{ phone: string }>()
  const [searchParams] = useSearchParams()
  const platform = (searchParams.get('platform') || 'phone') as Platform
  const navigate = useNavigate()
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()

  useEffect(() => {
    if (phone) {
      loadSearchResult()
    }
  }, [phone, platform])

  const loadSearchResult = async () => {
    setLoading(true)
    const data = await searchPhone(phone!, platform)
    setResult(data)
    setLoading(false)
  }

  const formatPhone = (p: string) => {
    if (p.startsWith('+7')) {
      return `+7 (${p.slice(2, 5)}) ${p.slice(5, 8)}-${p.slice(8, 10)}-${p.slice(10)}`
    }
    return p
  }

  const displayIdentifier = (identifier: string) => {
    if (identifier.startsWith('+7') || identifier.startsWith('7')) {
      return formatPhone(identifier)
    }
    return identifier
  }

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'spam':
        return { label: t.categories.spam, icon: Phone, color: 'text-warning', bg: 'bg-warning/20' }
      case 'fraud':
        return { label: t.categories.fraud, icon: ShieldAlert, color: 'text-danger', bg: 'bg-danger/20' }
      case 'scam':
        return { label: t.categories.scam, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/20' }
      case 'fake':
        return { label: t.categories.fake, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/20' }
      default:
        return { label: t.categories.unknown, icon: AlertTriangle, color: 'text-gray-400', bg: 'bg-gray-400/20' }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        {language === 'kz' ? 'Артқа' : 'Назад'}
      </button>

      <div className="bg-surface border border-card rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          {displayIdentifier(phone || '')}
        </h1>

        {result?.found && (result.record || result.phone) ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {(() => {
                const recordData = result.record || result.phone!
                const info = getCategoryInfo(recordData.category)
                const Icon = info.icon
                return (
                  <>
                    <div className={`p-4 rounded-xl ${info.bg}`}>
                      <Icon className={`w-10 h-10 ${info.color}`} />
                    </div>
                    <div>
                      <p className={`text-xl font-semibold ${info.color}`}>{info.label}</p>
                      <p className="text-gray-400">
                        {recordData.reportsCount} {language === 'kz' ? 'пайдаланушы шағымданды' : 'пользователей пожаловались'}
                        {recordData.status === 'pending' && ` • ${t.status.pending}`}
                        {recordData.status === 'confirmed' && ` • ${t.status.confirmed}`}
                      </p>
                    </div>
                  </>
                )
              })()}
            </div>

            <div className="flex gap-3">
              <Link
                to={`/number/${(result.record || result.phone)!.id}`}
                className="flex-1 bg-primary hover:bg-primary/80 text-white py-3 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                {t.details.comments} ({result.comments.length})
              </Link>
              <Link
                to={`/add?phone=${encodeURIComponent(phone || '')}&platform=${platform}`}
                className="flex-1 bg-card hover:bg-card/80 text-white py-3 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
              >
                <Flag className="w-5 h-5" />
                {language === 'kz' ? 'Шағым қосу' : 'Добавить жалобу'}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-success/20">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <div>
                <p className="text-xl font-semibold text-success">
                  {language === 'kz' ? 'Таза аккаунт' : 'Аккаунт чистый'}
                </p>
                <p className="text-gray-400">
                  {language === 'kz' ? 'Бұл аккаунтқа шағым түскен жоқ' : 'На этот аккаунт жалоб не поступало'}
                </p>
              </div>
            </div>

            <Link
              to={`/add?phone=${encodeURIComponent(phone || '')}&platform=${platform}`}
              className="block bg-secondary hover:bg-secondary/80 text-white py-3 px-4 rounded-lg text-center transition-colors"
            >
              <Flag className="w-5 h-5 inline mr-2" />
              {language === 'kz' ? 'Бұл аккаунтқа шағымдану' : 'Пожаловаться на этот аккаунт'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
