# SpamChecker 🛡️

Веб-приложение для ведения публичной базы данных спам-номеров и мошенников.

## Функционал

- 🔍 **Поиск номера** — проверка номера на спам/мошенничество
- ➕ **Добавление номера** — пользователи могут сообщать о спам-звонках
- 💬 **Комментарии** — обсуждение и отзывы под каждым номером
- 🛡️ **Защита от злоупотреблений** — номер помечается как спам только после 3+ жалоб

## Технологии

### Frontend
- React + Vite
- TypeScript
- TailwindCSS
- React Router
- Lucide Icons

### Backend
- Node.js + Express
- PostgreSQL
- Prisma ORM

## Быстрый старт

### 1. Установка зависимостей

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 2. Настройка базы данных

```bash
cd backend

# Скопируйте .env.example в .env и настройте DATABASE_URL
cp .env.example .env

# Создайте базу данных PostgreSQL и выполните миграции
npx prisma migrate dev --name init

# (Опционально) Заполните тестовыми данными
npm run db:seed
```

### 3. Запуск

```bash
# Backend (в папке backend)
npm run dev

# Frontend (в корневой папке, в новом терминале)
npm run dev
```

Frontend откроется на http://localhost:3000
Backend работает на http://localhost:3001

## Структура проекта

```
├── src/
│   ├── components/         # UI компоненты
│   │   ├── Layout.tsx
│   │   ├── SearchBar.tsx
│   │   ├── PhoneCard.tsx
│   │   └── CommentItem.tsx
│   ├── pages/              # Страницы
│   │   ├── HomePage.tsx
│   │   ├── SearchResultPage.tsx
│   │   ├── AddNumberPage.tsx
│   │   └── NumberDetailsPage.tsx
│   ├── services/           # API сервисы
│   ├── types/              # TypeScript типы
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── backend/
│   ├── src/
│   │   ├── index.js        # Точка входа сервера
│   │   └── routes/         # API роуты
│   └── prisma/
│       ├── schema.prisma   # Схема базы данных
│       └── seed.js         # Тестовые данные
└── package.json
```

## API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/phones/:phone` | Поиск номера |
| POST | `/api/phones/report` | Добавить жалобу на номер |
| GET | `/api/phones/recent` | Последние добавленные номера |
| GET | `/api/phones/:id/comments` | Комментарии к номеру |
| POST | `/api/phones/:id/comments` | Добавить комментарий |

## Защита от злоупотреблений

- **Порог 3+ жалоб** — номер помечается как спам только после 3 уникальных жалоб
- **Device fingerprint** — 1 устройство = 1 голос за номер
- **Rate limiting** — ограничение 100 запросов в день с одного IP

## Лицензия

MIT
