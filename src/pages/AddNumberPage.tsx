import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Phone, ShieldAlert, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { reportPhone } from '../services/api'
import { useLanguage, formatPhoneKZ } from '../i18n'

type Category = 'spam' | 'fraud' | 'scam' | 'fake'

export default function AddNumberPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialPhone = searchParams.get('phone') || ''
  const platform = (searchParams.get('platform') || 'phone') as 'phone' | 'instagram' | 'whatsapp' | 'telegram'
  const { t, language } = useLanguage()

  const [phone, setPhone] = useState(initialPhone)
  const [category, setCategory] = useState<Category>('spam')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPhonePlatform = platform === 'phone' || platform === 'whatsapp'

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (isPhonePlatform) {
      const formatted = formatPhoneKZ(value)
      setPhone(formatted)
    } else {
      setPhone(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (isPhonePlatform) {
      const cleaned = phone.replace(/[^\d+]/g, '')
      if (cleaned.length < 3) {
        setError(language === 'kz' ? 'Дұрыс телефон нөмірін енгізіңіз' : 'Введите корректный номер телефона')
        return
      }
    } else {
      if (phone.trim().length < 3) {
        setError(language === 'kz' ? 'Аккаунт атын енгізіңіз' : 'Введите имя аккаунта')
        return
      }
    }

    setLoading(true)
    try {
      await reportPhone(phone, category, description || undefined, platform)
      setSuccess(true)
      setTimeout(() => {
        navigate(`/search/${encodeURIComponent(phone)}`)
      }, 1500)
    } catch (err: any) {
      setError(err.message || (language === 'kz' ? 'Қате орын алды' : 'Произошла ошибка'))
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { 
      value: 'spam' as Category, 
      label: t.categories.spam, 
      icon: Phone, 
      description: language === 'kz' ? 'Жарнама, сауалнамалар, автоқоңырау' : 'Реклама, опросы, автообзвон' 
    },
    { 
      value: 'fraud' as Category, 
      label: t.categories.fraud, 
      icon: ShieldAlert, 
      description: language === 'kz' ? 'Алдау әрекеті, бопсалау' : 'Попытка обмана, вымогательство' 
    },
    { 
      value: 'scam' as Category, 
      label: t.categories.scam, 
      icon: ShieldAlert, 
      description: language === 'kz' ? 'Скам-жоба, жалған жеңіс' : 'Скам-проект, фейковый выигрыш' 
    },
    { 
      value: 'fake' as Category, 
      label: t.categories.fake, 
      icon: AlertCircle, 
      description: language === 'kz' ? 'Жалған аккаунт, бөтен атынан' : 'Фейковый аккаунт, от чужого имени' 
    },
  ]

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-success/20 p-6 rounded-full mb-4">
          <CheckCircle className="w-16 h-16 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t.addForm.success}
        </h2>
        <p className="text-gray-400">
          {language === 'kz' ? 'Көмегіңіз үшін рахмет' : 'Спасибо за вашу помощь'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">{t.addForm.title}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-400 mb-2">{t.addForm.numberLabel}</label>
          <input
            type={isPhonePlatform ? "tel" : "text"}
            value={phone}
            onChange={handlePhoneChange}
            placeholder={isPhonePlatform 
              ? t.home.phonePlaceholder 
              : (language === 'kz' ? '@username немесе сілтеме' : '@username или ссылка')
            }
            className="w-full bg-surface border border-card rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-gray-400 mb-3">{t.addForm.categoryLabel}</label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  category === cat.value
                    ? 'border-primary bg-primary/10'
                    : 'border-card bg-surface hover:border-gray-600'
                }`}
              >
                <cat.icon className={`w-8 h-8 mb-2 ${
                  category === cat.value ? 'text-primary' : 'text-gray-400'
                }`} />
                <p className="font-semibold text-white">{cat.label}</p>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-400 mb-2">{t.addForm.descriptionLabel}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.addForm.descriptionPlaceholder}
            rows={3}
            maxLength={500}
            className="w-full bg-surface border border-card rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
          />
          <p className="text-right text-gray-500 text-sm mt-1">{description.length}/500</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-danger bg-danger/10 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (isPhonePlatform ? phone.replace(/[^\d+]/g, '').length < 3 : phone.trim().length < 3)}
          className="w-full bg-primary hover:bg-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              {t.addForm.submitButton}
            </>
          )}
        </button>

        <p className="text-center text-gray-500 text-sm">
          {language === 'kz' 
            ? 'Нөмір 3+ бірегей шағымнан кейін спам ретінде белгіленеді'
            : 'Номер будет помечен как спам после 3+ уникальных жалоб'
          }
        </p>
      </form>
    </div>
  )
}
