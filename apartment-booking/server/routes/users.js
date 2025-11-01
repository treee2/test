import express from 'express';
import db from '../database/db.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

// Получить текущего пользователя
// В реальном приложении здесь бы была аутентификация через JWT токены
// Пока мы возвращаем тестового пользователя
router.get('/me', (req, res) => {
  try {
    // В реальном приложении ID брался бы из токена аутентификации
    // Сейчас просто возвращаем первого пользователя из базы
    const stmt = db.prepare('SELECT * FROM users LIMIT 1');
    const user = stmt.get();
    
    if (!user) {
      // Если пользователя нет, создаём нового
      const newUserId = generateId();
      const insertStmt = db.prepare(`
        INSERT INTO users (id, email, full_name)
        VALUES (?, ?, ?)
      `);
      insertStmt.run(newUserId, 'guest@example.com', 'Гость');
      
      const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(newUserId);
      return res.json({
        ...newUser,
        preferences: newUser.preferences ? JSON.parse(newUser.preferences) : {}
      });
    }
    
    // Парсим JSON-поля перед отправкой клиенту
    res.json({
      ...user,
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
      profile_completed
    } = req.body;
    
    // В реальном приложении ID брался бы из токена аутентификации
    // Сейчас обновляем первого пользователя
    const currentUser = db.prepare('SELECT id FROM users LIMIT 1').get();
    
    if (!currentUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Преобразуем preferences в JSON-строку для хранения
    const preferencesJson = preferences ? JSON.stringify(preferences) : null;
    
    // Обновляем профиль пользователя
    const stmt = db.prepare(`
      UPDATE users SET
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
    
    // Получаем и возвращаем обновленного пользователя
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUser.id);
    res.json({
      ...updatedUser,
      preferences: updatedUser.preferences ? JSON.parse(updatedUser.preferences) : {}
    });
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить всех пользователей (для административных целей)
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_date DESC');
    const users = stmt.all();
    
    // Преобразуем JSON-поля для каждого пользователя
    const processedUsers = users.map(user => ({
      ...user,
      preferences: user.preferences ? JSON.parse(user.preferences) : {}
    }));
    
    res.json(processedUsers);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;