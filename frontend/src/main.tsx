import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Устанавливаем обработчик для показа ошибок в консоли
window.addEventListener('error', (event) => {
  console.error('Глобальная ошибка:', event.error);
});

// Отрисовываем приложение
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Добавляем информацию для отладки
console.log("Приложение RationX запущено");
console.log("Окружение:", import.meta.env.MODE);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
