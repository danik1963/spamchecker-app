import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Phone, Instagram, MessageCircle, Send, 
  Search, Plus, ChevronRight, Shield
} from 'lucide-react'
import type { Platform, PhoneNumber } from '../types'
import { useLanguage, formatPhoneKZ } from '../i18n'
import { getRecentPhones } from '../services/api'

interface PlatformPageProps {
  platform: Platform
}

interface PlatformConfig {
  title: { ru: string; kz: string }
  icon: typeof Phone
  gradient: string
  shadowColor: string
  placeholder: { ru: string; kz: string }
  description: { ru: string; kz: string }
}

const platformConfigs: Record<Platform, PlatformConfig> = {
  phone: {
    title: { ru: 'Телефоны', kz: 'Телефондар' },
    icon: Phone,
    gradient: 'from-green-500 to-emerald-600',
    shadowColor: 'shadow-green-500/30',
    placeholder: { ru: '+7 (XXX) XXX-XX-XX', kz: '+7 (XXX) XXX-XX-XX' },
    description: { 
      ru: 'Проверка на спам и мошенничество',
      kz: 'Спам мен алаяқтыққа тексеру'
    },
  },
  instagram: {
    title: { ru: 'Instagram', kz: 'Instagram' },
    icon: Instagram,
    gradient: 'from-pink-500 to-rose-600',
    shadowColor: 'shadow-pink-500/30',
    placeholder: { ru: '@username', kz: '@username' },
    description: { 
      ru: 'Проверка аккаунтов на фейки',
      kz: 'Аккаунттарды жалғанға тексеру'
    },
  },
  whatsapp: {
    title: { ru: 'WhatsApp', kz: 'WhatsApp' },
    icon: MessageCircle,
    gradient: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/30',
    placeholder: { ru: '+7 (XXX) XXX-XX-XX', kz: '+7 (XXX) XXX-XX-XX' },
    description: { 
      ru: 'Проверка на спам-рассылки',
      kz: 'Спам-таратылымдарға тексеру'
    },
  },
  telegram: {
    title: { ru: 'Telegram', kz: 'Telegram' },
    icon: Send,
    gradient: 'from-blue-500 to-cyan-600',
    shadowColor: 'shadow-blue-500/30',
    placeholder: { ru: '@username', kz: '@username' },
    description: { 
      ru: 'Проверка аккаунтов и каналов',
      kz: 'Аккаунттар мен каналдарды тексеру'
    },
  },
}

export default function PlatformPage({ platform }: PlatformPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<PhoneNumber[]>([])
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  const currentPlatform = platform
  const config = platformConfigs[currentPlatform] || platformConfigs.phone
  const Icon = config.icon

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true)
      try {
        const data = await getRecentPhones(20, currentPlatform)
        setRecords(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error loading records:', error)
        setRecords([])
      } finally {
        setLoading(false)
      }
    }
    loadRecords()
  }, [currentPlatform])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (currentPlatform === 'phone' || currentPlatform === 'whatsapp') {
      setSearchQuery(formatPhoneKZ(value))
    } else {
      setSearchQuery(value)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery)}?platform=${currentPlatform}`)
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

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Header - Material Design */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} px-4 pt-6 pb-8 -mx-4 -mt-4 mb-6`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{config.title[language]}</h1>
              <p className="text-white/70 text-sm">{config.description[language]}</p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch}>
            <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={config.placeholder[language]}
                className="w-full bg-transparent text-white placeholder-white/60 px-4 py-3.5 pr-12 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/40 text-white p-2.5 rounded-xl transition-all active:scale-95"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Report Button */}
      <div className="px-4 mb-6">
        <Link
          to={`/add?platform=${currentPlatform}`}
          className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r ${config.gradient} shadow-lg ${config.shadowColor} text-white font-medium transition-all active:scale-[0.98]`}
        >
          <Plus className="w-5 h-5" />
          {language === 'kz' ? 'Шағым қосу' : 'Добавить жалобу'}
        </Link>
      </div>

      {/* Records List */}
      <div className="px-4">
        <h2 className="text-sm font-medium text-gray-400 mb-3">
          {t.home.recentReports}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="w-10 h-10 border-3 border-primary/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : records.length > 0 ? (
          <div className="space-y-2">
            {records.map((record) => {
              const catInfo = getCategoryInfo(record.category)
              const displayIdentifier = record.identifier || record.phone || ''
              const formattedIdentifier = (currentPlatform === 'phone' || currentPlatform === 'whatsapp') 
                ? formatPhoneKZ(displayIdentifier)
                : displayIdentifier
              return (
                <Link 
                  key={record.id}
                  to={`/number/${record.id}`}
                  className="flex items-center gap-3 bg-surface/50 backdrop-blur-sm rounded-xl p-3 border border-white/5 transition-all active:scale-[0.99] hover:bg-surface/80"
                >
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.gradient}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{formattedIdentifier}</p>
                    <p className="text-gray-500 text-xs">
                      {catInfo.emoji} {catInfo.label} • {record.reportsCount} {t.details.reports}
                      {record.status === 'confirmed' && ' • 🚫'}
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
            <p className="text-gray-600 text-sm mt-1">
              {language === 'kz' ? 'Бірінші шағым жіберіңіз' : 'Станьте первым, кто добавит жалобу'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
