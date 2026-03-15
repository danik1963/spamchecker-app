import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Loader2, Search, Filter, Trash2, RotateCcw, 
  ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react'
import { 
  getComments, deleteComment, restoreComment,
  Comment, PaginatedResponse, CommentsParams 
} from '../services/adminApi'

export default function AdminComments() {
  const [data, setData] = useState<PaginatedResponse<Comment> | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<CommentsParams>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadComments()
  }, [filters])

  const loadComments = async () => {
    try {
      setLoading(true)
      const comments = await getComments(filters)
      setData(comments)
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить комментарий?')) return
    try {
      await deleteComment(id)
      loadComments()
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreComment(id)
      loadComments()
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
          <h1 className="text-2xl font-bold text-white">Комментарии</h1>
          <p className="text-gray-500">Все комментарии пользователей</p>
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
            <label className="block text-gray-500 text-sm mb-1">Идентификатор записи</label>
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
          <div>
            <label className="block text-gray-500 text-sm mb-1">Автор</label>
            <input
              type="text"
              value={filters.author || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value, page: 1 }))}
              placeholder="Имя автора..."
              className="w-full bg-card border border-card rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">От даты</label>
            <input
              type="date"
              value={filters.from || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value, page: 1 }))}
              className="w-full bg-card border border-card rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div className="flex items-end">
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
            Комментариев не найдено
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 border-b border-card bg-card/50">
                  <th className="px-4 py-3 font-medium">Автор</th>
                  <th className="px-4 py-3 font-medium">Текст</th>
                  <th className="px-4 py-3 font-medium">Запись</th>
                  <th className="px-4 py-3 font-medium">Лайки</th>
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((comment) => (
                  <tr 
                    key={comment.id} 
                    className={`border-b border-card/50 ${comment.deletedAt ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-white">
                      {comment.author}
                      {comment.parentId && (
                        <span className="ml-2 text-xs text-gray-500">(ответ)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-md">
                      <p className="truncate">{comment.text}</p>
                      {comment.deletedAt && (
                        <span className="text-xs text-red-400">Удалён</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {comment.record ? (
                        <Link 
                          to={`/admin/records?identifier=${comment.record.identifier}`}
                          className="text-primary hover:underline font-mono text-sm"
                        >
                          {comment.record.identifier}
                        </Link>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{comment.likes}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!comment.deletedAt ? (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger/10 rounded"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(comment.id)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded"
                            title="Восстановить"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          to={`/number/${comment.recordId}`}
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
