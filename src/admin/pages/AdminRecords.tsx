import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Loader2, Search, Filter, Trash2, RotateCcw, 
  ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react'
import { 
  getRecords, updateRecord, deleteRecord, restoreRecord,
  SpamRecord, PaginatedResponse, RecordsParams 
} from '../services/adminApi'

const platforms = ['phone', 'instagram', 'whatsapp', 'telegram']
const categories = ['spam', 'fraud', 'scam', 'fake', 'unknown']
const statuses = ['pending', 'confirmed']

const categoryColors: Record<string, string> = {
  spam: 'bg-yellow-500',
  fraud: 'bg-red-500',
  scam: 'bg-pink-500',
  fake: 'bg-orange-500',
  unknown: 'bg-gray-500',
}

export default function AdminRecords() {
  const [searchParams] = useSearchParams()
  const [data, setData] = useState<PaginatedResponse<SpamRecord> | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<RecordsParams>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    identifier: searchParams.get('identifier') || undefined,
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadRecords()
  }, [filters])

  const loadRecords = async () => {
    try {
      setLoading(true)
      const records = await getRecords(filters)
      setData(records)
    } catch (err) {
      console.error('Failed to load records:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateRecord(id, { status })
      loadRecords()
    } catch (err) {
      console.error('Failed to update:', err)
    }
  }

  const handleUpdateCategory = async (id: string, category: string) => {
    try {
      await updateRecord(id, { category })
      loadRecords()
    } catch (err) {
      console.error('Failed to update:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Скрыть эту запись? Она не будет отображаться пользователям.')) return
    try {
      await deleteRecord(id)
      loadRecords()
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreRecord(id)
      loadRecords()
    } catch (err) {
      console.error('Failed to restore:', err)
    }
  }

  const setPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Записи</h1>
          <p className="text-gray-500">Все записи спам-номеров и аккаунтов</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-card text-white rounded-lg hover:bg-card/80"
        >
          <Filter className="w-4 h-4" />
          Фильтры
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-surface border border-card rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-gray-500 text-sm mb-1">Платформа</label>
            <select
              value={filters.platform || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value, page: 1 }))}
              className="w-full bg-card border border-card rounded-lg px-3 py-2 text-white"
            >
              <option value="">Все</option>
              {platforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Категория</label>
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
              className="w-full bg-card border border-card rounded-lg px-3 py-2 text-white"
            >
              <option value="">Все</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Статус</label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-full bg-card border border-card rounded-lg px-3 py-2 text-white"
            >
              <option value="">Все</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Идентификатор</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={filters.identifier || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, identifier: e.target.value, page: 1 }))}
                placeholder="Поиск..."
                className="w-full bg-card border border-card rounded-lg pl-9 pr-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-gray-400">
              <input
                type="checkbox"
                checked={filters.includeHidden === 'true'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  includeHidden: e.target.checked ? 'true' : undefined,
                  page: 1 
                }))}
                className="rounded"
              />
              Показать скрытые
            </label>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !data?.data.length ? (
          <div className="text-center py-20 text-gray-500">
            Записей не найдено
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b border-card bg-card/50">
                  <th className="px-4 py-3 font-medium">Идентификатор</th>
                  <th className="px-4 py-3 font-medium">Платформа</th>
                  <th className="px-4 py-3 font-medium">Категория</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Жалоб</th>
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((record) => (
                  <tr 
                    key={record.id} 
                    className={`border-b border-card/50 ${record.hiddenAt ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-white font-mono">{record.identifier}</span>
                      {record.hiddenAt && (
                        <span className="ml-2 text-xs text-red-400">(скрыта)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{record.platform}</td>
                    <td className="px-4 py-3">
                      <select
                        value={record.category}
                        onChange={(e) => handleUpdateCategory(record.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs text-white border-0 cursor-pointer ${categoryColors[record.category]}`}
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={record.status}
                        onChange={(e) => handleUpdateStatus(record.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs border-0 cursor-pointer ${
                          record.status === 'confirmed' 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-primary font-semibold">
                      {record.reportsCount}
                      {record._count && (
                        <span className="text-gray-500 font-normal text-sm ml-1">
                          ({record._count.comments} комм.)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {new Date(record.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!record.hiddenAt ? (
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded"
                            title="Скрыть запись"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(record.id)}
                            className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded"
                            title="Восстановить запись"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          to={`/number/${record.id}`}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded"
                          title="Открыть"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-card">
            <p className="text-gray-500 text-sm">
              Показано {((data.pagination.page - 1) * data.pagination.pageSize) + 1} - {Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} из {data.pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(data.pagination.page - 1)}
                disabled={data.pagination.page === 1}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-gray-400">
                {data.pagination.page} / {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(data.pagination.page + 1)}
                disabled={data.pagination.page >= data.pagination.totalPages}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
