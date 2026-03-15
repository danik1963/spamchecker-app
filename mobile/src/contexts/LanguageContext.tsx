import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n, { initializeLanguage, setLanguage as saveLanguage } from '../i18n';

type Language = 'ru' | 'kk';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, options?: object) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ru');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const savedLang = await initializeLanguage();
      setLanguageState(savedLang as Language);
      setIsLoading(false);
    };
    init();
  }, []);

  const setLanguage = async (lang: Language) => {
    await saveLanguage(lang);
    setLanguageState(lang);
  };

  const t = (key: string, options?: object): string => {
    return i18n.t(key, options);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
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

export default LanguageContext;
