import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/Login'
import HomePage from './Homepage'
import DietPlan from './DietPlan';  
import Main from './Main';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/main',
    element: <Main />
  },
  {
    path: '/dietplan',
    element: <DietPlan />
  }
])

function App() {
  return (

      // <Routes>
      //   <Route path="/" element={<Login />} />
      //   <Route path="/homepage" element={<HomePage />} />
      //   <Route path="/dietplan" element={<DietPlan />} />
      //   <Route path="/main" element={<Main />} />
      // </Routes>

      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>

  );
}

export default App;
