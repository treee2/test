import express from 'express';
import db from '../database/db.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

// Получить список всех квартир
router.get('/', (req, res) => {
  try {
    // Подготавливаем SQL-запрос для получения всех квартир
    const stmt = db.prepare('SELECT * FROM apartments ORDER BY created_date DESC');
    const apartments = stmt.all();
    
    // Преобразуем amenities из JSON-строки обратно в массив
    const processedApartments = apartments.map(apt => ({
      ...apt,
      amenities: apt.amenities ? JSON.parse(apt.amenities) : [],
      is_available: Boolean(apt.is_available) // Преобразуем 0/1 в true/false
    }));
    
    res.json(processedApartments);
  } catch (error) {
    console.error('Ошибка при получении квартир:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить квартиру по ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM apartments WHERE id = ?');
    const apartment = stmt.get(id);
    
    if (!apartment) {
      return res.status(404).json({ error: 'Квартира не найдена' });
    }
    
    // Преобразуем данные для фронтенда
    const processedApartment = {
      ...apartment,
      amenities: apartment.amenities ? JSON.parse(apartment.amenities) : [],
      is_available: Boolean(apartment.is_available)
    };
    
    res.json(processedApartment);
  } catch (error) {
    console.error('Ошибка при получении квартиры:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;