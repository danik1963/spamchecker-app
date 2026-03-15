export default {
  // Общие
  common: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    retry: 'Повторить',
    cancel: 'Отмена',
    save: 'Сохранить',
    delete: 'Удалить',
    confirm: 'Подтвердить',
    back: 'Назад',
    search: 'Поиск',
    noResults: 'Ничего не найдено',
  },

  // Навигация
  tabs: {
    phones: 'Телефоны',
    add: 'Добавить',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    instagram: 'Instagram',
  },

  // Главный экран
  home: {
    title: 'Проверка спама',
    subtitle: 'Защитите себя от мошенников',
    searchPlaceholder: 'Введите номер или никнейм...',
    stats: {
      records: 'Записей',
      todayReports: 'Жалоб сегодня',
      scammers: 'Мошенников',
    },
    platforms: {
      title: 'Платформы',
      phone: 'Телефоны',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      instagram: 'Instagram',
    },
    recentReports: 'Последние жалобы',
    viewAll: 'Смотреть все',
  },

  // Экран платформы
  platform: {
    title: {
      phone: 'Телефонные номера',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      instagram: 'Instagram',
    },
    emptyList: 'Записей пока нет',
    reports: 'жалоб',
  },

  // Детали записи
  recordDetails: {
    confirmed: 'Подтверждён',
    category: {
      spam: 'Спам',
      fraud: 'Мошенник',
      scam: 'Скам',
      fake: 'Фейк',
      unknown: 'Неизвестно',
    },
    reports: 'жалоб',
    dangerWarning: 'Внимание! Этот номер подтверждён как опасный',
    comments: 'Комментарии',
    noComments: 'Комментариев пока нет',
    beFirst: 'Будьте первым!',
    writeComment: 'Написать комментарий...',
    replyingTo: 'Ответ на комментарий',
    reply: 'Ответить',
    timeAgo: {
      justNow: 'только что',
      minutes: 'мин',
      hours: 'ч',
      days: 'д',
    },
  },

  // Добавление жалобы
  addReport: {
    title: 'Добавить жалобу',
    selectPlatform: 'Выберите платформу',
    identifier: {
      phone: 'Номер телефона',
      whatsapp: 'Номер WhatsApp',
      telegram: 'Telegram никнейм',
      instagram: 'Instagram никнейм',
    },
    identifierPlaceholder: {
      phone: '+7 XXX XXX XX XX',
      whatsapp: '+7 XXX XXX XX XX',
      telegram: '@username',
      instagram: '@username',
    },
    category: 'Категория',
    categories: {
      spam: 'Спам',
      fraud: 'Мошенничество',
      scam: 'Скам',
      fake: 'Фейк аккаунт',
    },
    comment: 'Комментарий (необязательно)',
    commentPlaceholder: 'Опишите ситуацию...',
    submit: 'Отправить жалобу',
    submitting: 'Отправка...',
    success: 'Жалоба успешно отправлена!',
    error: 'Ошибка при отправке жалобы',
  },

  // Настройки
  settings: {
    title: 'Настройки',
    language: 'Язык',
    languages: {
      ru: 'Русский',
      kk: 'Қазақша',
    },
    theme: 'Тема',
    notifications: 'Уведомления',
    about: 'О приложении',
    version: 'Версия',
  },

  // Поиск
  search: {
    title: 'Результаты поиска',
    noResults: 'Ничего не найдено',
    tryDifferent: 'Попробуйте другой запрос',
  },
};
