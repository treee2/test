// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Apartments from './pages/Apartments';
import ApartmentDetails from './pages/ApartmentDetails';
import MyBookings from './pages/MyBookings';
import AddApartment from './pages/AddApartment';
import Profile from './pages/Profile';

// Создаём клиент для TanStack Query
// Он будет управлять загрузкой и кэшированием данных
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Не перезагружать данные при возврате на вкладку
      retry: 1, // Повторять запрос только один раз при ошибке
    },
  },
});

function App() {
  return (
    // Оборачиваем всё приложение в провайдер для работы с запросами
    <QueryClientProvider client={queryClient}>
      {/* Настраиваем маршрутизацию */}
      <BrowserRouter>
        <Routes>
          {/* Главная страница перенаправляет на каталог квартир */}
          <Route path="/" element={<Navigate to="/apartments" replace />} />
          
          {/* Страница каталога квартир */}
          <Route
            path="/apartments"
            element={
              <Layout currentPageName="Apartments">
                <Apartments />
              </Layout>
            }
          />
          
          {/* Страница деталей квартиры */}
          <Route
            path="/apartmentdetails"
            element={
              <Layout currentPageName="ApartmentDetails">
                <ApartmentDetails />
              </Layout>
            }
          />
          
          {/* Страница с бронированиями пользователя */}
          <Route
            path="/mybookings"
            element={
              <Layout currentPageName="MyBookings">
                <MyBookings />
              </Layout>
            }
          />

          {/* Страница добавления квартиры */}
          <Route
            path="/addapartment"
            element={
              <Layout currentPageName="AddApartment">
                <AddApartment />
              </Layout>
            }
          />
          {/* Страница профиля пользователя */}
          <Route
            path="/profile"
            element={
              <Layout currentPageName="Profile">
                <Profile />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
