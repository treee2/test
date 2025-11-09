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
  // ... остальной код entities остаётся без изменений
  
  auth: {
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
    
    me: async () => {
      // Теперь не нужен email — берём данные из токена на сервере
      return await fetchAPI('/auth/me');
    },
    
    updateMe: async (profileData) => {
      return await fetchAPI('/users/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },
    
    logout: () => {
      removeToken();
      window.location.href = '/login';
    },
    
    refresh: async () => {
      const response = await fetchAPI('/auth/refresh', {
        method: 'POST',
      });
      
      if (response.token) {
        setToken(response.token);
      }
      
      return response;
    }
  },
  
  // Остальные методы остаются без изменений
};