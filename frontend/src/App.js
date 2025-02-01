import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Tailwind!</h1>
        <p className="text-gray-600 mb-6">Quick, aesthetic, and responsive UI with React and Tailwind CSS.</p>
        <button className="px-6 py-2 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105">
          Get Started
        </button>
        <iframe 
          title='Streamlit Embed'
          src='http://localhost:8501?embed=true&component=csv_processing'
          style={{
            border: 'none',
            width: '100%',
            height: '100%'
          }}
        />
      </div>
    </div>
  );
}
