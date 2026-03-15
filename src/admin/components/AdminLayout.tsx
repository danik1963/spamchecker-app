import { Link, Outlet, useLocation, Navigate } from 'react-router-dom'
import { 
  LayoutDashboard, FileText, Database, MessageSquare, 
  ClipboardList, LogOut, Shield, Users, Loader2
} from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'

const navItems = [
  { path: '/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
  { path: '/admin/reports', label: 'Жалобы', icon: FileText },
  { path: '/admin/records', label: 'Записи', icon: Database },
  { path: '/admin/comments', label: 'Комментарии', icon: MessageSquare },
  { path: '/admin/audit', label: 'Аудит', icon: ClipboardList, adminOnly: true },
  { path: '/admin/users', label: 'Пользователи', icon: Users, adminOnly: true },
]

export default function AdminLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAdminAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const filteredNavItems = navItems.filter(
    item => !item.adminOnly || user?.role === 'admin'
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-card flex flex-col">
        <div className="p-4 border-b border-card">
          <Link to="/admin" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-white">SpamChecker</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:bg-card hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {user?.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-medium">{user?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
