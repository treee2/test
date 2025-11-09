import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Эти строки нужны для работы с путями в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к файлу базы данных
const dbPath = path.join(__dirname, 'apartments.db');

// Создаём или открываем базу данных
let db;
try {
  db = new Database(dbPath);
  
  // Создаём бэкап перед инициализацией
  if (fs.existsSync(dbPath)) {
    const backupPath = `${dbPath}.backup-${Date.now()}`;
    fs.copyFileSync(dbPath, backupPath);
    console.log(`📦 Создан бэкап базы данных: ${backupPath}`);
  }

  // Включаем поддержку внешних ключей и другие важные PRAGMA
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL'); // Улучшаем производительность
  db.pragma('synchronous = NORMAL'); // Баланс между безопасностью и скоростью
} catch (error) {
  console.error('❌ Ошибка при создании/открытии базы данных:', error);
  throw error;
}

// Функция для инициализации базы данных
export function initDatabase() {
  console.log('🔧 Инициализация базы данных...');
  
  try {
    // Читаем SQL-файл с инструкциями
    const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
    
    // Выполняем все SQL-команды
    db.exec(initSQL);
    
    console.log('✅ База данных успешно инициализирована!');
  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    throw error;
  }
}

// Экспортируем объект базы данных для использования в других файлах
export default db;