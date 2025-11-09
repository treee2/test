import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Эндпоинт для входа в систему
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    if (!login || !password) {
      return res.status(400).json({ error: 'Необходимо указать логин и пароль' });
    }
    
    // Ищем пользователя по логину
    const stmt = db.prepare('SELECT * FROM users WHERE login = ?');
    const user = stmt.get(login);
    
    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    // Проверяем блокировку пользователя
    if (user.is_blocked) {
      return res.status(403).json({ error: 'Ваш аккаунт заблокирован. Обратитесь к администратору.' });
    }
    
        // Проверяем пароль (теперь всегда используем bcrypt)
    let isPasswordValid = false;
    
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (err) {
      // Если возникла ошибка при проверке пароля, значит он не захеширован
      // Хешируем его и обновляем в базе
      if (password === user.password) { // Временная проверка
        const hashedPassword = await bcrypt.hash(password, 12); // Увеличиваем сложность хеширования
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id);
        isPasswordValid = true;
      }
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    // Создаём JWT токен
    // Включаем в токен важную информацию о пользователе
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Токен действителен 7 дней
    );
    
    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = user;
    
    // Отправляем токен и данные пользователя
    res.json({
      token,
      user: {
        ...userWithoutPassword,
        preferences: user.preferences ? JSON.parse(user.preferences) : {}
      }
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Эндпоинт для получения текущего пользователя
// Теперь защищён токеном — используем authenticateToken middleware
router.get('/me', authenticateToken, (req, res) => {
  try {
    // req.user содержит данные из токена (добавлены middleware)
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(req.user.email);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      ...userWithoutPassword,
      preferences: user.preferences ? JSON.parse(user.preferences) : {}
    });
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Эндпоинт для обновления токена (refresh)
router.post('/refresh', authenticateToken, (req, res) => {
  try {
    // Создаём новый токен с теми же данными
    const newToken = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        full_name: req.user.full_name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token: newToken });
  } catch (error) {
    console.error('Ошибка при обновлении токена:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;