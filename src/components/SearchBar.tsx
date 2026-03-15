import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import { useLanguage, formatPhoneKZ } from '../i18n'

export default function SearchBar() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatPhoneKZ(value)
    setPhone(formatted)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = phone.replace(/[^\d+]/g, '')
    if (cleaned.length >= 3) {
      setLoading(true)
      navigate(`/search/${encodeURIComponent(cleaned)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder={t.home.phonePlaceholder}
          className="w-full bg-surface border border-card rounded-xl px-5 py-4 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg"
        />
        <button
          type="submit"
          disabled={loading || phone.replace(/[^\d+]/g, '').length < 3}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className="text-gray-500 text-sm mt-2 text-center">
        {language === 'kz' 
          ? 'Нөмірді кез келген форматта енгізіңіз: +7, 8 немесе ел кодынсыз'
          : 'Введите номер в любом формате: +7, 8, или без кода страны'
        }
      </p>
    </form>
  )
}
