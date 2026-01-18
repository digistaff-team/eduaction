# EduAction - Платформа корпоративного онлайн-обучения

## 🔧 Установка и запуск локально

1. Клонируйте репозиторий:
cd C:\Projects\EduAction\app
git clone https://github.com/digistaff-team/eduaction.git

2. Установите зависимости:
npm install

3. Создайте файл .env.local на основе .env.example:
cp .env.example .env.local

4. Заполните .env.local вашими Firebase credentials:

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Pro-Talk API
VITE_PROTALK_BOT_TOKEN=your_bot_token
VITE_PROTALK_BOT_ID=your_bot_id
VITE_PROTALK_API_URL=https://api.pro-talk.ru/api/v1.0

5. Запустите dev server:
npm run dev

## Аутентификация
- Firebase Authentication (Email/Password)
- Автоматическое управление сессией

## Деплой на Vercel.com
- Push в `main` → Production автоматически 
- Feature ветки → Preview URLs

## Админ-панель
- Ctrl+Shift+A или клик на аватар → Админ-панель
- Генерация курсов с помощью AI
