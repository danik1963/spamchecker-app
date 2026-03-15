import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield, TrendingUp, FileText, AlertCircle, ShieldAlert,
  Phone, Instagram, MessageCircle, Send, ChevronRight, Search
} from 'lucide-react'
import { getRecentPhones, getStats, type Stats } from '../services/api'
import { useLanguage, formatPhoneKZ } from '../i18n'
import type { PhoneNumber, Platform } from '../types'

const platformCards = [
  { 
    id: 'phone' as Platform, 
    icon: Phone, 
    gradient: 'from-green-500 to-emerald-600',
    shadowColor: 'shadow-green-500/25'
  },
  { 
    id: 'instagram' as Platform, 
    icon: Instagram, 
    gradient: 'from-pink-500 to-rose-600',
    shadowColor: 'shadow-pink-500/25'
  },
  { 
    id: 'whatsapp' as Platform, 
    icon: MessageCircle, 
    gradient: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/25'
  },
  { 
    id: 'telegram' as Platform, 
    icon: Send, 
    gradient: 'from-blue-500 to-cyan-600',
    shadowColor: 'shadow-blue-500/25'
  },
]

export default function HomePage() {
  const [recentPhones, setRecentPhones] = useState<PhoneNumber[]>([])
  const [stats, setStats] = useState<Stats>({ totalRecords: 0, todayReports: 0, confirmedScammers: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { t, language } = useLanguage()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [phones, statsData] = await Promise.all([
        getRecentPhones(10),
        getStats()
      ])
      setRecentPhones(Array.isArray(phones) ? phones : [])
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
      setRecentPhones([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search/${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const getPlatformLabel = (id: Platform) => {
    const labels: Record<Platform, { ru: string; kz: string }> = {
      phone: { ru: 'Телефоны', kz: 'Телефондар' },
      instagram: { ru: 'Instagram', kz: 'Instagram' },
      whatsapp: { ru: 'WhatsApp', kz: 'WhatsApp' },
      telegram: { ru: 'Telegram', kz: 'Telegram' },
    }
    return labels[id][language]
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Logo */}
      <div className="text-center pt-8 pb-6">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full"></div>
            <div className="relative bg-gradient-to-br from-primary to-blue-600 p-5 rounded-2xl shadow-lg shadow-primary/30">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">SpamChecker</h1>
        <p className="text-gray-400 text-sm px-8">
          {t.home.subtitle}
        </p>
      </div>

      {/* Material Search Bar */}
      <div className="px-4 mb-6">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative bg-surface/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/20 border border-white/5 overflow-hidden transition-all focus-within:shadow-xl focus-within:shadow-primary/10 focus-within:border-primary/30">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'kz' ? 'Нөмір немесе @username...' : 'Введите номер или @username...'}
              className="w-full bg-transparent text-white placeholder-gray-500 px-5 py-4 pr-14 focus:outline-none text-base"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-white p-3 rounded-xl transition-all active:scale-95"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Platform Cards - Material Design */}
      <div className="px-4 mb-6">
        <h2 className="text-sm font-medium text-gray-400 mb-3 px-1">
          {language === 'kz' ? 'Платформаны таңдаңыз' : 'Выберите платформу'}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {platformCards.map((platform) => (
            <Link
              key={platform.id}
              to={`/${platform.id === 'phone' ? 'phones' : platform.id}`}
              className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${platform.gradient} shadow-lg ${platform.shadowColor} transition-all active:scale-[0.98] hover:shadow-xl group`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <platform.icon className="w-8 h-8 text-white mb-2 relative z-10" />
              <p className="text-white font-semibold relative z-10">{getPlatformLabel(platform.id)}</p>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Section - Material Cards */}
      <div className="px-4 mb-6">
        <div className="bg-surface/50 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 mb-2">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xl font-bold text-white">{loading ? '...' : stats.totalRecords}</p>
              <p className="text-gray-500 text-xs">{language === 'kz' ? 'Жазбалар' : 'Записей'}</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-warning/20 mb-2">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <p className="text-xl font-bold text-white">{loading ? '...' : stats.todayReports}</p>
              <p className="text-gray-500 text-xs">{language === 'kz' ? 'Бүгін' : 'Сегодня'}</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-danger/20 mb-2">
                <ShieldAlert className="w-5 h-5 text-danger" />
              </div>
              <p className="text-xl font-bold text-white">{loading ? '...' : stats.confirmedScammers}</p>
              <p className="text-gray-500 text-xs">{language === 'kz' ? 'Алаяқтар' : 'Мошенники'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports - Material List */}
      <div className="px-4 pb-24">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium text-gray-400">{t.home.recentReports}</h2>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="w-10 h-10 border-3 border-primary/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : recentPhones.length > 0 ? (
          <div className="space-y-2">
            {recentPhones.slice(0, 5).map((phone) => {
              const isPhonePlatform = phone.platform === 'phone' || phone.platform === 'whatsapp'
              const displayId = isPhonePlatform ? formatPhoneKZ(phone.identifier || phone.phone || '') : (phone.identifier || phone.phone || '')
              const platformIcon = platformCards.find(p => p.id === phone.platform)
              const Icon = platformIcon?.icon || Phone
              
              return (
                <Link
                  key={phone.id}
                  to={`/number/${phone.id}`}
                  className="flex items-center gap-3 bg-surface/50 backdrop-blur-sm rounded-xl p-3 border border-white/5 transition-all active:scale-[0.99] hover:bg-surface/80"
                >
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${platformIcon?.gradient || 'from-gray-500 to-gray-600'}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{displayId}</p>
                    <p className="text-gray-500 text-xs">
                      {phone.reportsCount} {t.details.reports} • {phone.category === 'fraud' ? '🚨' : '⚠️'} {t.categories[phone.category as keyof typeof t.categories] || phone.category}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface/50 mb-3">
              <Shield className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-500">{t.home.noReports}</p>
          </div>
        )}
      </div>
    </div>
  )
}
