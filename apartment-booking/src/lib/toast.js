// src/lib/toast.js
// Простая библиотека для показа уведомлений без дополнительных зависимостей

let toastContainer = null;
let toastId = 0;

const createToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      max-width: 500px;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

const addToastStyles = () => {
  if (!document.querySelector('#toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(calc(100% + 20px));
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(calc(100% + 20px));
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

const showToast = (message, type = 'info', duration = 3000) => {
  addToastStyles();
  const container = createToastContainer();
  
  const id = `toast-${toastId++}`;
  const toast = document.createElement('div');
  toast.id = id;
  
  const colors = {
    success: {
      bg: '#10b981',
      text: '#ffffff'
    },
    error: {
      bg: '#ef4444',
      text: '#ffffff'
    },
    info: {
      bg: '#3b82f6',
      text: '#ffffff'
    }
  };
  
  const color = colors[type] || colors.info;
  
  toast.style.cssText = `
    background: ${color.bg};
    color: ${color.text};
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    font-size: 14px;
    font-weight: 500;
    pointer-events: auto;
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 300px;
    max-width: 500px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: transform 0.2s;
  `;
  
  // Добавляем иконку
  const icon = document.createElement('span');
  icon.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  `;
  
  icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  
  // Добавляем текст
  const textNode = document.createElement('span');
  textNode.textContent = message;
  textNode.style.flex = '1';
  
  toast.appendChild(icon);
  toast.appendChild(textNode);
  
  // Hover эффект
  toast.addEventListener('mouseenter', () => {
    toast.style.transform = 'scale(1.02)';
  });
  
  toast.addEventListener('mouseleave', () => {
    toast.style.transform = 'scale(1)';
  });
  
  // Клик для закрытия
  toast.addEventListener('click', () => {
    removeToast(toast, container);
  });
  
  container.appendChild(toast);
  
  // Автоматическое удаление
  setTimeout(() => {
    removeToast(toast, container);
  }, duration);
  
  return id;
};

const removeToast = (toast, container) => {
  if (!toast || !toast.parentNode) return;
  
  toast.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
  
  setTimeout(() => {
    if (toast.parentNode === container) {
      container.removeChild(toast);
      
      // Удаляем контейнер если пустой
      if (container.children.length === 0 && container.parentNode) {
        document.body.removeChild(container);
        toastContainer = null;
      }
    }
  }, 300);
};

export const toast = {
  success: (message, duration = 3000) => showToast(message, 'success', duration),
  error: (message, duration = 4000) => showToast(message, 'error', duration),
  info: (message, duration = 3000) => showToast(message, 'info', duration),
};

export default toast;