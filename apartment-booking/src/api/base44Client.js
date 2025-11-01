// Базовый URL для API (сервер работает на порту 3001)
const API_BASE_URL = 'http://localhost:3001/api';

// Вспомогательная функция для выполнения запросов
// Эта функция обрабатывает все HTTP запросы к серверу
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Если сервер вернул ошибку, выбрасываем исключение
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
// Этот объект содержит все методы для взаимодействия с сервером
export const base44 = {
  // Методы для работы с сущностями (квартиры, бронирования)
  entities: {
    Apartment: {
      // Получить список всех квартир
      // sortOrder - параметр для сортировки (пока не используется на бэкенде)
      list: async (sortOrder) => {
        return await fetchAPI('/apartments');
      },
      
      // Найти квартиры по фильтру
      // Если передан id, вернет конкретную квартиру
      filter: async (params) => {
        if (params.id) {
          const apartment = await fetchAPI(`/apartments/${params.id}`);
          return [apartment]; // Возвращаем массив для совместимости
        }
        return await fetchAPI('/apartments');
      },
      
      // Создать новую квартиру
      // apartmentData - объект с данными квартиры
      create: async (apartmentData) => {
        return await fetchAPI('/apartments', {
          method: 'POST',
          body: JSON.stringify(apartmentData),
        });
      },
      
      // Обновить существующую квартиру
      update: async (id, apartmentData) => {
        return await fetchAPI(`/apartments/${id}`, {
          method: 'PUT',
          body: JSON.stringify(apartmentData),
        });
      },
      
      // Удалить квартиру
      delete: async (id) => {
        return await fetchAPI(`/apartments/${id}`, {
          method: 'DELETE',
        });
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
  },
  
  // Методы для работы с аутентификацией и профилем пользователя
  auth: {
    // Получить информацию о текущем пользователе
    // В реальном приложении это бы требовало аутентификации
    me: async () => {
      return await fetchAPI('/users/me');
    },
    
    // Обновить профиль текущего пользователя
    // profileData - объект с новыми данными профиля
    updateMe: async (profileData) => {
      return await fetchAPI('/users/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },
    
    // Заглушка для выхода из системы
    // В реальном приложении это бы удаляло токен аутентификации
    logout: () => {
      console.log('Выход из системы');
      // Здесь можно добавить логику очистки токенов
    }
  },
  
  // Методы для интеграций (например, загрузка файлов)
  integrations: {
    Core: {
      // Заглушка для загрузки файлов
      // В реальном приложении это бы загружало файл на сервер
      UploadFile: async ({ file }) => {
        // Для демонстрации просто возвращаем временный URL
        // В реальном приложении здесь был бы запрос на сервер
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ file_url: reader.result });
          };
          reader.readAsDataURL(file);
        });
      }
    }
  }
};