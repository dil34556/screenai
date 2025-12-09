import React, { useState, useEffect } from 'react';
import Home from './components/home';
import CreateEmployee from './components/CreateEmployee';
import ViewEmployees from './components/ViewEmployees';
const API_BASE_URL = 'http://127.0.0.1:8000/api/employees';

export default function App() {
  const [currentView, setCurrentView] = useState('home');

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleBack = () => {
    setCurrentView('home');
  };

  return (
    <>
      {currentView === 'home' && <Home onNavigate={handleNavigate} />}
      {currentView === 'create' && <CreateEmployee onBack={handleBack} />}
      {currentView === 'view' && <ViewEmployees onBack={handleBack} />}
    </>
  );
}