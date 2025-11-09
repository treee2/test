import jwt from 'jsonwebtoken';

// Секретный ключ для подписи токенов
// В production-среде этот ключ должен храниться в переменных окружения!
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware для проверки JWT токена
export const authenticateToken = (req, res, next) => {
  // Получаем токен из заголовка Authorization
  // Формат: "Bearer TOKEN_HERE"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Извлекаем сам токен

  // Если токена нет, возвращаем ошибку 401 (Unauthorized)
  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  try {
    // Проверяем токен и извлекаем данные пользователя
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Добавляем информацию о пользователе в объект запроса
    // Теперь во всех защищённых маршрутах мы можем использовать req.user
    req.user = decoded;
    
    // Передаём управление следующему обработчику
    next();
  } catch (error) {
    // Если токен невалидный или истёк, возвращаем ошибку 403 (Forbidden)
    return res.status(403).json({ error: 'Недействительный или истёкший токен' });
  }
};

// Дополнительный middleware для проверки роли администратора
export const requireAdmin = (req, res, next) => {
  // Этот middleware должен использоваться ПОСЛЕ authenticateToken
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
};

export { JWT_SECRET };