import React from 'react';
import Dashboard from './Components/Dashboard';
import Header from './Components/Header';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="p-1">
        <Dashboard />
      </div>
    </div>
  );
}