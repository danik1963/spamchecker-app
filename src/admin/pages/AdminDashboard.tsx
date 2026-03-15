import { useState, useEffect } from 'react'
import { 
  FileText, Database, MessageSquare, TrendingUp, 
  Phone, Loader2, AlertCircle
} from 'lucide-react'
import { getAnalytics, AnalyticsSummary } from '../services/adminApi'

const platformIcons: Record<string, string> = {
  phone: '📞',
  instagram: '📸',
  whatsapp: '💬',
  telegram: '✈️',
}

const categoryColors: Record<string, string> = {
  spam: 'bg-yellow-500',
  fraud: 'bg-red-500',
  scam: 'bg-pink-500',
  fake: 'bg-orange-500',
  unknown: 'bg-gray-500',
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const analytics = await getAnalytics()
      setData(analytics)
    } catch (err) {
      setError('Не удалось загрузить аналитику')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-danger">
        <AlertCircle className="w-6 h-6 mr-2" />
        {error}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Дашборд</h1>
        <p className="text-gray-500">Обзор статистики SpamChecker</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Всего жалоб"
          value={data.reports.total}
          subtitle={`+${data.reports.today} сегодня`}
          icon={FileText}
          color="text-blue-500"
        />
        <StatCard
          title="За неделю"
          value={data.reports.week}
          subtitle="жалоб"
          icon={TrendingUp}
          color="text-green-500"
        />
        <StatCard
          title="Записей"
          value={data.records.total}
          subtitle={`+${data.records.today} сегодня`}
          icon={Database}
          color="text-purple-500"
        />
        <StatCard
          title="Комментариев"
          value={data.comments.total}
          subtitle="всего"
          icon={MessageSquare}
          color="text-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Platform */}
        <div className="bg-surface border border-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">По платформам</h2>
          <div className="space-y-3">
            {data.byPlatform.map((item) => (
              <div key={item.platform} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{platformIcons[item.platform] || '📱'}</span>
                  <span className="text-white capitalize">{item.platform}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-card rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(item.count / Math.max(...data.byPlatform.map(p => p.count))) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-gray-400 w-12 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Category */}
        <div className="bg-surface border border-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">По категориям</h2>
          <div className="space-y-3">
            {data.byCategory.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${categoryColors[item.category] || 'bg-gray-500'}`} />
                  <span className="text-white capitalize">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-card rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${categoryColors[item.category] || 'bg-gray-500'}`}
                      style={{
                        width: `${(item.count / Math.max(...data.byCategory.map(c => c.count))) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-gray-400 w-12 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Identifiers */}
      <div className="bg-surface border border-card rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Топ-10 по жалобам</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b border-card">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Идентификатор</th>
                <th className="pb-3 font-medium">Платформа</th>
                <th className="pb-3 font-medium">Категория</th>
                <th className="pb-3 font-medium text-right">Жалоб</th>
              </tr>
            </thead>
            <tbody>
              {data.topIdentifiers.map((item, index) => (
                <tr key={item.identifier + item.platform} className="border-b border-card/50">
                  <td className="py-3 text-gray-500">{index + 1}</td>
                  <td className="py-3 text-white font-mono">{item.identifier}</td>
                  <td className="py-3">
                    <span className="text-gray-400 capitalize flex items-center gap-1">
                      {platformIcons[item.platform]} {item.platform}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs text-white ${categoryColors[item.category]}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 text-right text-primary font-semibold">{item.reportsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, value, subtitle, icon: Icon, color 
}: { 
  title: string
  value: number
  subtitle: string
  icon: typeof Phone
  color: string 
}) {
  return (
    <div className="bg-surface border border-card rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value.toLocaleString()}</p>
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl bg-card ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
