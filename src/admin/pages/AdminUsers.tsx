import { useState, useEffect } from 'react'
import { 
  Loader2, Plus, Trash2, Shield, User, AlertCircle
} from 'lucide-react'
import { 
  getAdminUsers, createAdminUser, deleteAdminUser, AdminUser 
} from '../services/adminApi'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminUsers() {
  const { user: currentUser } = useAdminAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ username: '', password: '', role: 'moderator' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getAdminUsers()
      setUsers(data)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await createAdminUser(formData)
      setFormData({ username: '', password: '', role: 'moderator' })
      setShowForm(false)
      loadUsers()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось создать пользователя')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Удалить пользователя ${username}?`)) return
    
    try {
      await deleteAdminUser(id)
      loadUsers()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Не удалось удалить пользователя')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Пользователи</h1>
          <p className="text-gray-500">Управление администраторами и модераторами</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-surface border border-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Новый пользователь</h2>
          
          {error && (
            <div className="flex items-center gap-2 text-danger bg-danger/10 p-3 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Имя пользователя</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full bg-card border border-card rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Пароль</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full bg-card border border-card rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Роль</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full bg-card border border-card rounded-lg px-3 py-2 text-white"
              >
                <option value="moderator">Модератор</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Создать'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-card text-white rounded-lg hover:bg-card/80"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-surface border border-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-card">
            {users.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    user.role === 'admin' ? 'bg-primary/20' : 'bg-card'
                  }`}>
                    {user.role === 'admin' ? (
                      <Shield className="w-6 h-6 text-primary" />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {user.username}
                      {user.id === currentUser?.id && (
                        <span className="ml-2 text-xs text-primary">(вы)</span>
                      )}
                    </p>
                    <p className="text-gray-500 text-sm capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="text-gray-500">Создан</p>
                    <p className="text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '-'}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-500">Последний вход</p>
                    <p className="text-gray-400">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('ru-RU') : '-'}
                    </p>
                  </div>
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDelete(user.id, user.username)}
                      className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg"
                      title="Удалить"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
