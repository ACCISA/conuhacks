import React, { useState, useEffect } from 'react';
import MapWithMultipleFires from './Map';
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFile, setSelectedFile] = useState(null);
  const [metrics, setMetrics] = useState([
    { id: 1, name: 'Response Time', value: '5 mins' },
    { id: 2, name: 'Water Usage', value: '2000 L' },
    { id: 3, name: 'Personnel Deployed', value: '50' },
  ]);
  const handleTabClick = (tab) => {
    if (tab === 'dashboard') {
      window.location.reload();
    } else {
      setActiveTab(tab);
    }
  };
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  const handleMetricChange = (id, newValue) => {
    setMetrics(metrics.map(metric => metric.id === id ? { ...metric, value: newValue } : metric));
  };
  useEffect(() => {
    if (activeTab !== 'csv') {
      setSelectedFile(null);
    }
  }, [activeTab]);
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex space-x-8 border-b border-gray-700 mb-4">
        <div
          className={`pb-2 cursor-pointer ${activeTab === 'dashboard' ? 'border-b-4 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => handleTabClick('dashboard')}
        >
          Dashboard
        </div>
        <div
          className={`pb-2 cursor-pointer ${activeTab === 'csv' ? 'border-b-4 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => handleTabClick('csv')}
        >
          CSV Uploads
        </div>
        <div
          className={`pb-2 cursor-pointer ${activeTab === 'analytics' ? 'border-b-4 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => handleTabClick('analytics')}
        >
          Analytics
        </div>
        <div
          className={`pb-2 cursor-pointer ${activeTab === 'metrics' ? 'border-b-4 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => handleTabClick('metrics')}
        >
          Metrics
        </div>
      </div>
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-2 bg-gray-800 p-4 rounded-xl shadow-xl">
            <h2 className="text-xl font-semibold mb-2">Fire Incident Map</h2>
            <MapWithMultipleFires />
          </div>
          <div className="bg-red-800 p-4 rounded-xl shadow-xl">
            <h2 className="text-xl font-semibold mb-2">Live Fire Alerts</h2>
            <ul className="space-y-2">
              <li className="bg-red-600 p-3 rounded-lg shadow-md">Alert 1: Active fire at XYZ location</li>
              <li className="bg-red-600 p-3 rounded-lg shadow-md">Alert 2: Fire spreading towards ABC area</li>
              <li className="bg-red-600 p-3 rounded-lg shadow-md">Alert 3: Contained fire near DEF region</li>
            </ul>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl shadow-xl lg:col-span-3">
            <h2 className="text-xl font-semibold mb-2">Fire Department Resources</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-3">Resource</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Location</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-600">
                  <td className="p-3">Fire Truck A</td>
                  <td className="p-3 text-green-400">Available</td>
                  <td className="p-3">Station 1</td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="p-3">Rescue Team B</td>
                  <td className="p-3 text-yellow-400">On Duty</td>
                  <td className="p-3">Location XYZ</td>
                </tr>
                <tr className="border-t border-gray-600">
                  <td className="p-3">Water Tank C</td>
                  <td className="p-3 text-red-400">Deployed</td>
                  <td className="p-3">ABC Area</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'csv' && (
        <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-4">CSV Uploads</h2>
          <div className="flex flex-col items-start space-y-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all duration-200"
            />
            {selectedFile && (
              <p className="text-gray-400">Selected File: {selectedFile.name}</p>
            )}
          </div>
        </div>
      )}
      {activeTab === 'analytics' && (
        <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center shadow-inner">
            <p>Graph Placeholder</p>
          </div>
        </div>
      )}
      {activeTab === 'metrics' && (
        <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Edit Metrics</h2>
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                <span className="text-gray-300">{metric.name}</span>
                <input
                  type="text"
                  value={metric.value}
                  onChange={(e) => handleMetricChange(metric.id, e.target.value)}
                  className="bg-gray-600 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;