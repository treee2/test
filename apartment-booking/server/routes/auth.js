import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

// Эндпоинт для регистрации нового пользователя
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    
    // Валидация обязательных полей
    if (!email || !password || !full_name) {
      return res.status(400).json({ 
        error: 'Необходимо указать email, пароль и полное имя' 
      });
    }
    
    // Проверка валидности email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Некорректный формат email' });
    }
    
    // Проверка длины пароля
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Пароль должен содержать минимум 6 символов' 
      });
    }
    
    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }
    
    // Генерируем логин из email (часть до @)
    const loginBase = email.split('@')[0];
    let login = loginBase;
    let counter = 1;
    
    // Проверяем уникальность логина
    while (db.prepare('SELECT id FROM users WHERE login = ?').get(login)) {
      login = `${loginBase}${counter}`;
      counter++;
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Генерируем ID для пользователя
    const userId = generateId();
    
    // Создаем нового пользователя
    const stmt = db.prepare(`
      INSERT INTO users (
        id, login, password, email, full_name, role, 
        profile_completed, is_blocked, preferences
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      userId,
      login,
      hashedPassword,
      email,
      full_name,
      'user', // По умолчанию обычный пользователь
      0, // Профиль не завершен
      0, // Не заблокирован
      JSON.stringify({ smoking: false, pets: false, early_checkin: false })
    );
    
    // Создаём JWT токен для автоматического входа после регистрации
    const token = jwt.sign(
      {
        id: userId,
        email: email,
        role: 'user',
        full_name: full_name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Получаем созданного пользователя
    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        ...userWithoutPassword,
        preferences: JSON.parse(userWithoutPassword.preferences || '{}')
      }
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// Эндпоинт для входа в систему
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    if (!login || !password) {
      return res.status(400).json({ error: 'Необходимо указать логин и пароль' });
    }
    
    // Ищем пользователя по логину или email
    const stmt = db.prepare('SELECT * FROM users WHERE login = ? OR email = ?');
    const user = stmt.get(login, login);
    
    if (!user) {
      return res.status(401).json({ error: 'Неверный логин/email или пароль' });
    }
    
    // Проверяем блокировку пользователя
    if (user.is_blocked) {
      return res.status(403).json({ 
        error: 'Ваш аккаунт заблокирован. Обратитесь к администратору.' 
      });
    }
    
    // Проверяем пароль
    let isPasswordValid = false;
    
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (err) {
      // Если возникла ошибка при проверке пароля, значит он не захеширован
      // Хешируем его и обновляем в базе (для миграции старых паролей)
      if (password === user.password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, user.id);
        isPasswordValid = true;
      }
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный логин/email или пароль' });
    }
    
    // Создаём JWT токен
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
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
router.get('/me', authenticateToken, (req, res) => {
  try {
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

// Эндпоинт для проверки доступности email
router.post('/check-email', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email не указан' });
    }
    
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    
    res.json({ 
      available: !existingUser,
      message: existingUser ? 'Email уже используется' : 'Email доступен'
    });
  } catch (error) {
    console.error('Ошибка при проверке email:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;