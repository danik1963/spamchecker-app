export type Language = 'ru' | 'kz';

export const translations = {
  ru: {
    // Навигация
    nav: {
      home: 'Главная',
      phones: 'Телефоны',
      instagram: 'Instagram',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      addNumber: 'Добавить номер',
    },
    // Главная страница
    home: {
      title: 'Проверка номеров на спам',
      subtitle: 'Защитите себя от мошенников и спамеров',
      searchPlaceholder: 'Введите номер телефона...',
      searchButton: 'Проверить',
      recentReports: 'Последние жалобы',
      noReports: 'Нет последних жалоб',
      phonePlaceholder: '+7 (XXX) XXX-XX-XX',
    },
    // Поиск
    search: {
      title: 'Результаты поиска',
      noResults: 'Ничего не найдено',
      searching: 'Поиск...',
      foundResults: 'Найдено результатов:',
    },
    // Категории
    categories: {
      spam: 'Спам',
      fraud: 'Мошенничество',
      scam: 'Обман',
      fake: 'Фейк',
      unknown: 'Неизвестно',
    },
    // Статусы
    status: {
      pending: 'На проверке',
      confirmed: 'Подтверждён',
    },
    // Форма добавления
    addForm: {
      title: 'Сообщить о спаме',
      numberLabel: 'Номер телефона или аккаунт',
      categoryLabel: 'Категория',
      descriptionLabel: 'Описание (необязательно)',
      descriptionPlaceholder: 'Опишите ситуацию...',
      submitButton: 'Отправить жалобу',
      success: 'Жалоба успешно отправлена!',
      error: 'Ошибка при отправке жалобы',
    },
    // Детали записи
    details: {
      reports: 'жалоб',
      comments: 'Комментарии',
      noComments: 'Пока нет комментариев',
      addComment: 'Написать комментарий...',
      reply: 'Ответить',
      replies: 'ответов',
      showReplies: 'Показать ответы',
      hideReplies: 'Скрыть ответы',
    },
    // Платформы
    platforms: {
      phone: 'Телефоны',
      instagram: 'Instagram аккаунты',
      whatsapp: 'WhatsApp номера',
      telegram: 'Telegram аккаунты',
    },
    // Общие
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      retry: 'Повторить',
      cancel: 'Отмена',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Редактировать',
      back: 'Назад',
      language: 'Язык',
    },
  },
  kz: {
    // Навигация
    nav: {
      home: 'Басты бет',
      phones: 'Телефондар',
      instagram: 'Instagram',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      addNumber: 'Нөмір қосу',
    },
    // Главная страница
    home: {
      title: 'Нөмірлерді спамға тексеру',
      subtitle: 'Алаяқтар мен спамерлерден қорғаныңыз',
      searchPlaceholder: 'Телефон нөмірін енгізіңіз...',
      searchButton: 'Тексеру',
      recentReports: 'Соңғы шағымдар',
      noReports: 'Соңғы шағымдар жоқ',
      phonePlaceholder: '+7 (XXX) XXX-XX-XX',
    },
    // Поиск
    search: {
      title: 'Іздеу нәтижелері',
      noResults: 'Ештеңе табылмады',
      searching: 'Іздеу...',
      foundResults: 'Табылған нәтижелер:',
    },
    // Категории
    categories: {
      spam: 'Спам',
      fraud: 'Алаяқтық',
      scam: 'Алдау',
      fake: 'Жалған',
      unknown: 'Белгісіз',
    },
    // Статусы
    status: {
      pending: 'Тексерілуде',
      confirmed: 'Расталған',
    },
    // Форма добавления
    addForm: {
      title: 'Спам туралы хабарлау',
      numberLabel: 'Телефон нөмірі немесе аккаунт',
      categoryLabel: 'Санат',
      descriptionLabel: 'Сипаттама (міндетті емес)',
      descriptionPlaceholder: 'Жағдайды сипаттаңыз...',
      submitButton: 'Шағым жіберу',
      success: 'Шағым сәтті жіберілді!',
      error: 'Шағымды жіберу кезінде қате',
    },
    // Детали записи
    details: {
      reports: 'шағым',
      comments: 'Пікірлер',
      noComments: 'Әзірге пікірлер жоқ',
      addComment: 'Пікір жазу...',
      reply: 'Жауап беру',
      replies: 'жауап',
      showReplies: 'Жауаптарды көрсету',
      hideReplies: 'Жауаптарды жасыру',
    },
    // Платформы
    platforms: {
      phone: 'Телефондар',
      instagram: 'Instagram аккаунттары',
      whatsapp: 'WhatsApp нөмірлері',
      telegram: 'Telegram аккаунттары',
    },
    // Общие
    common: {
      loading: 'Жүктелуде...',
      error: 'Қате',
      retry: 'Қайталау',
      cancel: 'Болдырмау',
      save: 'Сақтау',
      delete: 'Жою',
      edit: 'Өңдеу',
      back: 'Артқа',
      language: 'Тіл',
    },
  },
};

export type Translations = typeof translations.ru;
