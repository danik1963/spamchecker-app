import { useState, useEffect } from 'react'
import { 
  Loader2, Filter, ChevronLeft, ChevronRight,
  User, FileText, Database, MessageSquare, Trash2, RefreshCw, Edit
} from 'lucide-react'
import { 
  getAuditLogs, AuditLog, PaginatedResponse, AuditLogsParams 
} from '../services/adminApi'

const actionIcons: Record<string, typeof User> = {
  DELETE_REPORT: Trash2,
  DELETE_COMMENT: Trash2,
  UPDATE_REPORT: Edit,
  UPDATE_RECORD: Edit,
  RESTORE_REPORT: RefreshCw,
  RESTORE_COMMENT: RefreshCw,
  CREATE_ADMIN_USER: User,
  DELETE_ADMIN_USER: Trash2,
}

const actionLabels: Record<string, string> = {
  DELETE_REPORT: 'Удалил жалобу',
  DELETE_COMMENT: 'Удалил комментарий',
  UPDATE_REPORT: 'Обновил жалобу',
  UPDATE_RECORD: 'Обновил запись',
  RESTORE_REPORT: 'Восстановил жалобу',
  RESTORE_COMMENT: 'Восстановил комментарий',
  CREATE_ADMIN_USER: 'Создал пользователя',
  DELETE_ADMIN_USER: 'Удалил пользователя',
}

const entityIcons: Record<string, typeof User> = {
  Report: FileText,
  SpamRecord: Database,
  Comment: MessageSquare,
  AdminUser: User,
}

export default function AdminAuditLog() {
  const [data, setData] = useState<PaginatedResponse<AuditLog> | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<AuditLogsParams>({
    page: 1,
    pageSize: 50,
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadLogs()
  }, [filters])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const logs = await getAuditLogs(filters)
      setData(logs)
    } catch (err) {
      console.error('Failed to load audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const setPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Аудит-лог</h1>
          <p className="text-gray-500">История действий модераторов</p>
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
            <label className="block text-gray-500 text-sm mb-1">Тип действия</label>
            <select
              value={filters.actionType || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value, page: 1 }))}
              className="w-full bg-card border border-card rounded-lg px-3 py-2 text-white"
            >
              <option value="">Все</option>
              {Object.keys(actionLabels).map(action => (
                <option key={action} value={action}>{actionLabels[action]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Тип сущности</label>
            <select
              value={filters.entityType || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value, page: 1 }))}
              className="w-full bg-card border border-card rounded-lg px-3 py-2 text-white"
            >
              <option value="">Все</option>
              <option value="Report">Жалобы</option>
              <option value="SpamRecord">Записи</option>
              <option value="Comment">Комментарии</option>
              <option value="AdminUser">Пользователи</option>
            </select>
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
          <div>
            <label className="block text-gray-500 text-sm mb-1">До даты</label>
            <input
              type="date"
              value={filters.to || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value, page: 1 }))}
              className="w-full bg-card border border-card rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-surface border border-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !data?.data.length ? (
          <div className="text-center py-20 text-gray-500">
            Записей в логе не найдено
          </div>
        ) : (
          <div className="divide-y divide-card">
            {data.data.map((log) => {
              const ActionIcon = actionIcons[log.actionType] || Edit
              const EntityIcon = entityIcons[log.entityType] || Database
              
              return (
                <div key={log.id} className="px-4 py-4 flex items-start gap-4">
                  <div className="p-2 bg-card rounded-lg">
                    <ActionIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">
                        {log.adminUser.username}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-card rounded text-gray-400 capitalize">
                        {log.adminUser.role}
                      </span>
                    </div>
                    <p className="text-gray-400">
                      {actionLabels[log.actionType] || log.actionType}
                      <span className="inline-flex items-center gap-1 ml-2 text-gray-500">
                        <EntityIcon className="w-3 h-3" />
                        {log.entityType}
                      </span>
                    </p>
                    {log.payload && Object.keys(log.payload).length > 0 && (
                      <pre className="mt-2 text-xs text-gray-600 bg-card rounded p-2 overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(log.createdAt).toLocaleDateString('ru-RU')}</p>
                    <p>{new Date(log.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              )
            })}
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
