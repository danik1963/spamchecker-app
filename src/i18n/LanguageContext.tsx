import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, type Language } from './translations';

type Translations = typeof translations.ru;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'spamchecker_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ru');

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'kz' || saved === 'ru') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
  };

  useEffect(() => {
    document.documentElement.lang = language === 'kz' ? 'kk' : 'ru';
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const formatPhoneKZ = (phone: string): string => {
  // Убираем все нецифровые символы
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 0) return '';
  
  // Короткие номера (до 7 цифр) - не форматируем
  if (cleaned.length <= 7 && !cleaned.startsWith('7') && !cleaned.startsWith('8')) {
    return cleaned;
  }
  
  // Нормализуем: убираем 8 в начале, оставляем только последние 10 цифр после 7
  if (cleaned.startsWith('8') && cleaned.length === 11) {
    cleaned = '7' + cleaned.slice(1);
  }
  
  // Если начинается с 7 и длина 11, берём последние 10 цифр
  const digits = cleaned.startsWith('7') && cleaned.length >= 11 
    ? cleaned.slice(1, 11) 
    : cleaned.startsWith('7') 
      ? cleaned.slice(1) 
      : cleaned;
  
  // Если после обработки осталось мало цифр - не форматируем
  if (digits.length <= 6) {
    return cleaned;
  }
  
  if (digits.length === 0) return '+7';
  
  let formatted = '+7 (' + digits.slice(0, 3);
  
  if (digits.length >= 3) {
    formatted += ') ' + digits.slice(3, 6);
  }
  if (digits.length >= 6) {
    formatted += '-' + digits.slice(6, 8);
  }
  if (digits.length >= 8) {
    formatted += '-' + digits.slice(8, 10);
  }
  
  return formatted;
};

export const normalizePhoneKZ = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('8') && cleaned.length === 11) {
    return '7' + cleaned.slice(1);
  }
  
  if (cleaned.startsWith('7') && cleaned.length === 11) {
    return cleaned;
  }
  
  if (cleaned.length === 10) {
    return '7' + cleaned;
  }
  
  return cleaned;
};
