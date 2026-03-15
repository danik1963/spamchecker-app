import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ru from './ru';
import kk from './kk';

const LANGUAGE_KEY = '@app_language';

const i18n = new I18n({
  ru,
  kk,
});

i18n.enableFallback = true;
i18n.defaultLocale = 'ru';

// Получить сохранённый язык или язык устройства
export const initializeLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'kk')) {
      i18n.locale = savedLanguage;
      return savedLanguage;
    }
    
    // Определяем язык устройства
    const deviceLocale = getLocales()[0]?.languageCode ?? 'ru';
    const locale = deviceLocale === 'kk' ? 'kk' : 'ru';
    i18n.locale = locale;
    return locale;
  } catch (error) {
    console.error('Error initializing language:', error);
    i18n.locale = 'ru';
    return 'ru';
  }
};

// Сохранить выбранный язык
export const setLanguage = async (language: 'ru' | 'kk'): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    i18n.locale = language;
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Получить текущий язык
export const getCurrentLanguage = (): string => {
  return i18n.locale;
};

export default i18n;
