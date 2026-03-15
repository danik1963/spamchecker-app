import { Link } from 'react-router-dom'
import { Phone, AlertTriangle, ShieldAlert, MessageSquare, ChevronRight } from 'lucide-react'
import { useLanguage } from '../i18n'
import type { PhoneNumber } from '../types'

interface PhoneCardProps {
  phone: PhoneNumber
}

export default function PhoneCard({ phone }: PhoneCardProps) {
  const { t } = useLanguage()

  const formatPhone = (p: string) => {
    if (p.startsWith('+7')) {
      return `+7 (${p.slice(2, 5)}) ${p.slice(5, 8)}-${p.slice(8, 10)}-${p.slice(10)}`
    }
    return p
  }

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'spam':
        return { label: t.categories.spam, icon: Phone, color: 'text-warning bg-warning/20' }
      case 'fraud':
        return { label: t.categories.fraud, icon: ShieldAlert, color: 'text-danger bg-danger/20' }
      case 'scam':
        return { label: t.categories.scam, icon: ShieldAlert, color: 'text-red-500 bg-red-500/20' }
      case 'fake':
        return { label: t.categories.fake, icon: AlertTriangle, color: 'text-orange-400 bg-orange-400/20' }
      default:
        return { label: t.categories.unknown, icon: AlertTriangle, color: 'text-gray-400 bg-gray-400/20' }
    }
  }

  const categoryInfo = getCategoryInfo(phone.category)
  const CategoryIcon = categoryInfo.icon
  const displayPhone = phone.phone || phone.identifier || ''

  return (
    <Link
      to={`/number/${phone.id}`}
      className="block bg-surface hover:bg-card border border-card rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${categoryInfo.color}`}>
            <CategoryIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{formatPhone(displayPhone)}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-sm px-2 py-0.5 rounded ${categoryInfo.color}`}>
                {categoryInfo.label}
              </span>
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {phone.reportsCount} {t.details.reports}
              </span>
              {phone.status === 'pending' && (
                <span className="text-yellow-500 text-xs">{t.status.pending}</span>
              )}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </div>
    </Link>
  )
}
