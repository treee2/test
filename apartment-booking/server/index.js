import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database/db.js';
import apartmentsRouter from './routes/apartments.js';
import bookingsRouter from './routes/bookings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём приложение Express
const app = express();
const PORT = process.env.PORT || 3001;

// Инициализируем базу данных при запуске сервера
initDatabase();

// Настраиваем middleware (промежуточные обработчики)
app.use(cors()); // Разрешаем запросы с фронтенда
app.use(express.json()); // Позволяем обрабатывать JSON в запросах

// Подключаем маршруты API
app.use('/api/apartments', apartmentsRouter);
app.use('/api/bookings', bookingsRouter);

// Простой тестовый маршрут для проверки работы сервера
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Сервер работает!' });
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 API доступен по адресу: http://localhost:${PORT}/api`);
});