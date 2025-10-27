-- Удаляем таблицы, если они уже существуют (для чистого старта)
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS apartments;

-- Создаём таблицу квартир
CREATE TABLE apartments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT,
    price_per_night REAL NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER DEFAULT 1,
    max_guests INTEGER DEFAULT 2,
    is_available INTEGER DEFAULT 1,  -- В SQLite нет типа BOOLEAN, используем INTEGER (0 или 1)
    amenities TEXT,  -- Храним JSON-строку с удобствами
    image_filename TEXT,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Создаём таблицу бронирований
CREATE TABLE bookings (
    id TEXT PRIMARY KEY,
    apartment_id TEXT NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    guests INTEGER NOT NULL,
    total_price REAL NOT NULL,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    special_requests TEXT,
    status TEXT DEFAULT 'pending',
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
);

-- Создаём индексы для ускорения поиска
CREATE INDEX idx_apartments_available ON apartments(is_available);
CREATE INDEX idx_apartments_price ON apartments(price_per_night);
CREATE INDEX idx_bookings_apartment ON bookings(apartment_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Вставляем тестовые данные
INSERT INTO apartments (id, title, description, address, price_per_night, bedrooms, bathrooms, max_guests, is_available, amenities, image_filename)
VALUES 
('1', 'Уютная студия в центре', 'Современная квартира с прекрасным видом на город. Идеально подходит для одного или двух человек.', 'ул. Пушкина, д. 10, Москва', 5000, 1, 1, 2, 1, '["Wi-Fi","ТВ","Кондиционер"]', 'apartment-1.jpg'),
('2', 'Просторные апартаменты', 'Роскошная квартира для семейного отдыха с тремя спальнями и современной кухней.', 'Невский проспект, д. 25, Санкт-Петербург', 12000, 3, 2, 6, 1, '["Wi-Fi","ТВ","Кондиционер","Парковка"]', 'apartment-2.jpg'),
('3', 'Элитная квартира с видом', 'Премиальное жильё в историческом центре города.', 'Тверская улица, д. 15, Москва', 18000, 2, 2, 4, 1, '["Wi-Fi","ТВ","Кондиционер","Парковка"]', 'apartment-3.jpg'),
('4', 'Просторная квартира', 'C отдельными спальнями, идеально подходящая для семейного отдыха, Детская площадка во дворе.', 'Казань, улица Баумана, 12', 8000, 3, 2, 5, 1, '["Wi-Fi","ТВ","Кондиционер","Детская площадка"]', 'apartment-4.jpg');