import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Loader2, Search, Filter, Trash2, RotateCcw, 
  CheckCircle, XCircle, ExternalLink, ChevronLeft, ChevronRight
} from 'lucide-react'
import { 
  getReports, deleteReport, restoreReport, updateReport,
  Report, PaginatedResponse, ReportsParams 
} from '../services/adminApi'

const platforms = ['phone', 'instagram', 'whatsapp', 'telegram']
const categories = ['spam', 'fraud', 'scam', 'fake', 'unknown']

export default function AdminReports() {
  const [data, setData] = useState<PaginatedResponse<Report> | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ReportsParams>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadReports()
  }, [filters])

  const loadReports = async () => {
    try {
      setLoading(true)
      const reports = await getReports(filters)
      setData(reports)
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить жалобу?')) return
    try {
      await deleteReport(id)
      loadReports()
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreReport(id)
      loadReports()
    } catch (err) {
      console.error('Failed to restore:', err)
    }
  }

  const handleValidate = async (id: string, isValid: boolean) => {
    try {
      await updateReport(id, { isValid })
      loadReports()
    } catch (err) {
      console.error('Failed to update:', err)
    }
  }

  const setPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Жалобы</h1>
          <p className="text-gray-500">Все жалобы из базы данных</p>
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
        <div className="bg-surface border border-card rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-gray-400">
              <input
                type="checkbox"
                checked={filters.includeDeleted === 'true'}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  includeDeleted: e.target.checked ? 'true' : undefined,
                  page: 1 
                }))}
                className="rounded"
              />
              Показать удалённые
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
            Жалоб не найдено
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b border-card bg-card/50">
                  <th className="px-4 py-3 font-medium">Идентификатор</th>
                  <th className="px-4 py-3 font-medium">Платформа</th>
                  <th className="px-4 py-3 font-medium">Категория</th>
                  <th className="px-4 py-3 font-medium">Описание</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((report) => (
                  <tr 
                    key={report.id} 
                    className={`border-b border-card/50 ${report.deletedAt ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <Link 
                        to={`/admin/records?identifier=${report.record.identifier}`}
                        className="text-primary hover:underline font-mono"
                      >
                        {report.record.identifier}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{report.record.platform}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs text-white ${
                        report.category === 'fraud' ? 'bg-red-500' :
                        report.category === 'scam' ? 'bg-pink-500' :
                        report.category === 'fake' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`}>
                        {report.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate">
                      {report.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {report.deletedAt ? (
                        <span className="text-red-400 text-sm">Удалена</span>
                      ) : report.isValid === true ? (
                        <span className="text-green-400 text-sm">✓ Валидна</span>
                      ) : report.isValid === false ? (
                        <span className="text-red-400 text-sm">✗ Невалидна</span>
                      ) : (
                        <span className="text-gray-500 text-sm">Не проверена</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {new Date(report.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!report.deletedAt && (
                          <>
                            <button
                              onClick={() => handleValidate(report.id, true)}
                              className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded"
                              title="Пометить как валидную"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleValidate(report.id, false)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded"
                              title="Пометить как невалидную"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(report.id)}
                              className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger/10 rounded"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {report.deletedAt && (
                          <button
                            onClick={() => handleRestore(report.id)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded"
                            title="Восстановить"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          to={`/number/${report.recordId}`}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded"
                          title="Открыть запись"
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
