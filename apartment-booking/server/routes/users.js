import express from 'express';
import db from '../database/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

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

// Получить список всех пользователей (только для админа)
router.get('/', requireAdmin, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_date DESC');
    const users = stmt.all();
    
    const processedUsers = users.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        preferences: user.preferences ? JSON.parse(user.preferences) : {}
      };
    });
    
    res.json(processedUsers);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить пользователя по ID (только для админа)
router.get('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id);
    
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

// Обновить пользователя по ID (только для админа)
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Предотвращаем обновление пароля через этот endpoint
    if (updateData.password) {
      delete updateData.password;
    }
    
    const updates = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (key === 'preferences') {
        updates.push(`${key} = ?`);
        values.push(JSON.stringify(updateData[key]));
      } else if (key === 'is_blocked' || key === 'profile_completed') {
        updates.push(`${key} = ?`);
        values.push(updateData[key] ? 1 : 0);
      } else if (key !== 'id' && key !== 'created_date') {
        updates.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }
    
    updates.push('updated_date = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE users SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...values);
    
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    res.json({
      ...userWithoutPassword,
      preferences: updatedUser.preferences ? JSON.parse(updatedUser.preferences) : {}
    });
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;