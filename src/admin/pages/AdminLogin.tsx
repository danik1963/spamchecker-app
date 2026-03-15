import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Shield, Loader2, AlertCircle } from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function AdminLogin() {
  const { isAuthenticated, isLoading, login } = useAdminAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(username, password)
      navigate('/admin')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка авторизации')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-primary/20 rounded-full mb-4">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">SpamChecker Admin</h1>
          <p className="text-gray-500 mt-2">Войдите для доступа к панели управления</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-card rounded-xl p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-danger bg-danger/10 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm mb-2">Имя пользователя</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-background border border-card rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-card rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/80 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Войти'
            )}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-4">
          По умолчанию: admin / admin123
        </p>
      </div>
    </div>
  )
}
