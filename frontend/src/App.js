import React from 'react';
import Map from './Components/map';

export default function App() {
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center">
        <Map/>
      </div>
    </div>
  );
}
