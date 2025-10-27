import express from 'express';
import db from '../database/db.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

// Получить все бронирования
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM bookings ORDER BY created_date DESC');
    const bookings = stmt.all();
    res.json(bookings);
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать новое бронирование
router.post('/', (req, res) => {
  try {
    const {
      apartment_id,
      check_in,
      check_out,
      guests,
      total_price,
      guest_name,
      guest_email,
      guest_phone,
      special_requests,
      status = 'pending'
    } = req.body;
    
    // Генерируем уникальный ID для бронирования
    const id = generateId();
    
    // Проверяем, доступна ли квартира в выбранные даты
    const conflictCheck = db.prepare(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE apartment_id = ? 
      AND status != 'cancelled'
      AND (
        (check_in <= ? AND check_out >= ?) OR
        (check_in <= ? AND check_out >= ?) OR
        (check_in >= ? AND check_out <= ?)
      )
    `).get(apartment_id, check_out, check_in, check_in, check_in, check_in, check_out);
    
    if (conflictCheck.count > 0) {
      return res.status(400).json({ error: 'Квартира уже забронирована на эти даты' });
    }
    
    // Вставляем новое бронирование
    const stmt = db.prepare(`
      INSERT INTO bookings (
        id, apartment_id, check_in, check_out, guests, total_price,
        guest_name, guest_email, guest_phone, special_requests, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, apartment_id, check_in, check_out, guests, total_price,
      guest_name, guest_email, guest_phone, special_requests, status
    );
    
    // Возвращаем созданное бронирование
    const newBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Ошибка при создании бронирования:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;