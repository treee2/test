// Получить текущего пользователя
// В реальном приложении здесь бы была аутентификация через JWT токены
// Пока мы возвращаем тестового пользователя
// В реальном приложении ID брался бы из токена аутентификации
// Сейчас обновляем первого пользователя

import express from 'express';
import db from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Все маршруты ниже требуют авторизации
router.use(authenticateToken);

// Получить текущего пользователя
router.get('/me', (req, res) => {
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

// Обновить профиль текущего пользователя
router.put('/me', (req, res) => {
  try {
    const {
      phone,
      date_of_birth,
      address,
      passport_series,
      passport_number,
      passport_issued_by,
      passport_issue_date,
      preferences,
      profile_completed,
      full_name
    } = req.body;
    
    // Используем email из токена — пользователь может редактировать только свой профиль
    const email = req.user.email;
    
    const currentUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const preferencesJson = preferences ? JSON.stringify(preferences) : null;
    
    const stmt = db.prepare(`
      UPDATE users SET
        full_name = ?,
        phone = ?,
        date_of_birth = ?,
        address = ?,
        passport_series = ?,
        passport_number = ?,
        passport_issued_by = ?,
        passport_issue_date = ?,
        preferences = ?,
        profile_completed = ?,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      full_name,
      phone,
      date_of_birth,
      address,
      passport_series,
      passport_number,
      passport_issued_by,
      passport_issue_date,
      preferencesJson,
      profile_completed ? 1 : 0,
      currentUser.id
    );
    
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUser.id);
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    res.json({
      ...userWithoutPassword,
      preferences: updatedUser.preferences ? JSON.parse(updatedUser.preferences) : {}
    });
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Остальные маршруты аналогично...

export default router;