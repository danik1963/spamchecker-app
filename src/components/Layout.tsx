import { Link, useLocation } from 'react-router-dom'
import { Home, PlusCircle, Shield, Phone, Instagram, MessageCircle, Send, Globe } from 'lucide-react'
import { useLanguage } from '../i18n'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { language, setLanguage, t } = useLanguage()

  const mainNavItems = [
    { path: '/', icon: Home, label: t.nav.home },
    { path: '/add', icon: PlusCircle, label: t.nav.addNumber },
  ]

  const platformTabs = [
    { path: '/phones', icon: Phone, label: t.nav.phones, color: 'text-green-400' },
    { path: '/instagram', icon: Instagram, label: t.nav.instagram, color: 'text-pink-400' },
    { path: '/whatsapp', icon: MessageCircle, label: t.nav.whatsapp, color: 'text-emerald-400' },
    { path: '/telegram', icon: Send, label: t.nav.telegram, color: 'text-blue-400' },
  ]

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'kz' : 'ru')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface border-b border-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-white">SpamChecker KZ</span>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card hover:bg-gray-700 transition-colors text-gray-300 hover:text-white"
                title={t.common.language}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium uppercase">{language}</span>
              </button>
              <nav className="flex gap-2">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary text-white'
                        : 'text-gray-400 hover:text-white hover:bg-card'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        
        <div className="border-t border-card">
          <div className="max-w-4xl mx-auto px-4">
            <nav className="flex overflow-x-auto">
              {platformTabs.map((tab) => (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    location.pathname.startsWith(tab.path)
                      ? `border-primary ${tab.color}`
                      : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 flex-1 w-full">
        {children}
      </main>

      <footer className="bg-surface border-t border-card">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          SpamChecker KZ {new Date().getFullYear()} - {language === 'kz' ? 'Спам мен алаяқтардан қорғау' : 'Защита от спама и мошенников'}
        </div>
      </footer>
    </div>
  )
}