// Базовый URL для API (сервер работает на порту 3001)
const API_BASE_URL = 'http://localhost:3001/api';

// Вспомогательная функция для выполнения запросов
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при выполнении запроса');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Экспортируем объект для работы с API
export const base44 = {
  entities: {
    Apartment: {
      // Получить список всех квартир
      list: async (sortOrder) => {
        return await fetchAPI('/apartments');
      },
      
      // Найти квартиру по ID
      filter: async (params) => {
        if (params.id) {
          const apartment = await fetchAPI(`/apartments/${params.id}`);
          return [apartment]; // Возвращаем массив для совместимости с существующим кодом
        }
        return await fetchAPI('/apartments');
      }
    },
    
    Booking: {
      // Получить список всех бронирований
      list: async (sortOrder) => {
        return await fetchAPI('/bookings');
      },
      
      // Создать новое бронирование
      create: async (bookingData) => {
        return await fetchAPI('/bookings', {
          method: 'POST',
          body: JSON.stringify(bookingData),
        });
      }
    }
  }
};