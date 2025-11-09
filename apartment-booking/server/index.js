import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database/db.js';
import apartmentsRouter from './routes/apartments.js';
import bookingsRouter from './routes/bookings.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import reviewsRouter from './routes/reviews.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём приложение Express
const app = express();
const PORT = process.env.PORT || 3001;

// Инициализируем базу данных при запуске сервера
initDatabase();

// Настраиваем middleware (промежуточные обработчики)
// Настраиваем CORS с более безопасными опциями
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // В продакшене разрешаем только конкретные домены
    : 'http://localhost:3000', // В разработке разрешаем фронтенд
  credentials: true, // Разрешаем отправку куки и авторизационных заголовков
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Защита от DDoS: ограничиваем размер запросов
app.use(express.json({ limit: '10mb' })); // Уменьшаем до разумного предела
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Подключаем маршруты API
app.use('/api/auth', authRouter);
app.use('/api/apartments', apartmentsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/reviews', reviewsRouter);

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
  console.log(`  🔐 POST /api/auth/login           - Вход в систему`);
  console.log(`  📋 GET  /api/apartments          - Список квартир`);
  console.log(`  ➕ POST /api/apartments          - Создать квартиру`);
  console.log(`  👤 GET  /api/users/me            - Текущий пользователь`);
  console.log(`  ✏️  PUT  /api/users/me            - Обновить профиль`);
  console.log(`  📅 GET  /api/bookings            - Список бронирований`);
  console.log(`  ➕ POST /api/bookings            - Создать бронирование`);
  console.log(`  ⭐ GET  /api/reviews             - Список отзывов`);
  console.log(`  ➕ POST /api/reviews             - Создать отзыв`);
  console.log('═══════════════════════════════════════════════');
});