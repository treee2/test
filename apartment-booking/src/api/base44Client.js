const API_BASE_URL = 'http://localhost:3001/api';

// Функция для получения токена из localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Функция для сохранения токена
const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Функция для удаления токена
const removeToken = () => {
  localStorage.removeItem('authToken');
};

// Вспомогательная функция для выполнения запросов
async function fetchAPI(endpoint, options = {}) {
  try {
    const token = getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Добавляем токен в заголовок Authorization, если он есть
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Если получили 401 (Unauthorized), токен истёк
    if (response.status === 401) {
      removeToken();
      // Перенаправляем на страницу входа
      window.location.href = '/login';
      throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
    }

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

export const base44 = {
  auth: {
    // Регистрация нового пользователя
    register: async (email, password, full_name) => {
      const response = await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name }),
      });
      
      // Сохраняем токен после успешной регистрации
      if (response.token) {
        setToken(response.token);
      }
      
      return response.user;
    },
    
    // Вход в систему
    login: async (login, password) => {
      const response = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, password }),
      });
      
      // Сохраняем токен после успешного входа
      if (response.token) {
        setToken(response.token);
      }
      
      return response.user;
    },
    
    // Получить текущего пользователя
    me: async () => {
      return await fetchAPI('/auth/me');
    },
    
    // Обновить профиль
    updateMe: async (profileData) => {
      return await fetchAPI('/users/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },
    
    // Выход из системы
    logout: () => {
      removeToken();
      window.location.href = '/login';
    },
    
    // Обновить токен
    refresh: async () => {
      const response = await fetchAPI('/auth/refresh', {
        method: 'POST',
      });
      
      if (response.token) {
        setToken(response.token);
      }
      
      return response;
    },
    
    // Проверить доступность email
    checkEmail: async (email) => {
      return await fetchAPI('/auth/check-email', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    }
  },
  
  entities: {
    Apartment: {
      list: async (orderBy = '-created_date') => {
        return await fetchAPI('/apartments');
      },
      
      filter: async (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        return await fetchAPI(`/apartments?${params}`);
      },
      
      create: async (data) => {
        return await fetchAPI('/apartments', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      },
      
      update: async (id, data) => {
        return await fetchAPI(`/apartments/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      },
      
      delete: async (id) => {
        return await fetchAPI(`/apartments/${id}`, {
          method: 'DELETE',
        });
      }
    },
    
    Booking: {
      list: async (orderBy = '-created_date') => {
        return await fetchAPI('/bookings');
      },
      
      filter: async (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        return await fetchAPI(`/bookings?${params}`);
      },
      
      create: async (data) => {
        return await fetchAPI('/bookings', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      },
      
      update: async (id, data) => {
        return await fetchAPI(`/bookings/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      }
    },
    
    Review: {
      list: async (orderBy = '-created_date') => {
        return await fetchAPI('/reviews');
      },
      
      filter: async (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        const apartments = await fetchAPI(`/reviews?${params}`);
        return apartments.filter(apt => {
          return Object.entries(filters).every(([key, value]) => {
            if (key === 'id') return apt.id === value;
            if (key === 'apartment_id') return apt.apartment_id === value;
            if (key === 'booking_id') return apt.booking_id === value;
            return true;
          });
        });
      },
      
      create: async (data) => {
        return await fetchAPI('/reviews', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    },
    
    User: {
      list: async (orderBy = '-created_date') => {
        return await fetchAPI('/users');
      },
      
      filter: async (filters) => {
        const users = await fetchAPI('/users');
        return users.filter(user => {
          return Object.entries(filters).every(([key, value]) => {
            if (key === 'email') return user.email === value;
            if (key === 'id') return user.id === value;
            if (key === 'role') return user.role === value;
            return true;
          });
        });
      },
      
      update: async (id, data) => {
        return await fetchAPI(`/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      }
    }
  }
};