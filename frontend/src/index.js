import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
// import Homepage from './Homepage';
import Main from './Main';
import DietPlan from './DietPlan';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <BrowserRouter>
    <App />
  // </BrowserRouter>
);
