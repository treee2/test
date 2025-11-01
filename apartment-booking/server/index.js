import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database/db.js';
import apartmentsRouter from './routes/apartments.js';
import bookingsRouter from './routes/bookings.js';
import usersRouter from './routes/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём приложение Express
const app = express();
const PORT = process.env.PORT || 3001;

// Инициализируем базу данных при запуске сервера
// Это создаст все необходимые таблицы и заполнит их тестовыми данными
initDatabase();

// Настраиваем middleware (промежуточные обработчики)
app.use(cors()); // Разрешаем запросы с фронтенда
app.use(express.json()); // Позволяем обрабатывать JSON в запросах

// Подключаем маршруты API
// Все запросы к /api/apartments будут обрабатываться apartmentsRouter
app.use('/api/apartments', apartmentsRouter);
// Все запросы к /api/bookings будут обрабатываться bookingsRouter
app.use('/api/bookings', bookingsRouter);
// Все запросы к /api/users будут обрабатываться usersRouter
app.use('/api/users', usersRouter);

// Простой тестовый маршрут для проверки работы сервера
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Сервер работает!',
    timestamp: new Date().toISOString()
  });
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════');
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 API доступен по адресу: http://localhost:${PORT}/api`);
  console.log('');
  console.log('Доступные endpoints:');
  console.log(`  📋 GET  /api/apartments          - Список квартир`);
  console.log(`  ➕ POST /api/apartments          - Создать квартиру`);
  console.log(`  👤 GET  /api/users/me            - Текущий пользователь`);
  console.log(`  ✏️  PUT  /api/users/me            - Обновить профиль`);
  console.log(`  📅 GET  /api/bookings            - Список бронирований`);
  console.log(`  ➕ POST /api/bookings            - Создать бронирование`);
  console.log('═══════════════════════════════════════════════');
});