import React, { useState, useEffect } from 'react';
import MapWithMultipleFires from './Map';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [resources, setResources] = useState([
    { name: "Smoke Jumpers", total: 5, inUse: 2, cost: 5000, severity: "Medium" },
    { name: "Fire Engines", total: 10, inUse: 8, cost: 2000, severity: "Low" },
    { name: "Helicopters", total: 3, inUse: 1, cost: 8000, severity: "Medium,High" },
    { name: "Tanker Planes", total: 2, inUse: 1, cost: 15000, severity: "High,Medium" },
    { name: "Ground Crews", total: 8, inUse: 6, cost: 3000, severity: "Low,Medium,High" },
  ]);
  const [filteredResources, setFilteredResources] = useState(resources);

  const handleTabClick = (tab) => setActiveTab(tab);

  const getSeverityColor = (severity) => {
    if (severity.includes('High')) return 'text-red-400';
    if (severity.includes('Medium')) return 'text-yellow-400';
    if (severity.includes('Low')) return 'text-green-400';
    return 'text-gray-400';
  };

  const handleFireClick = (severity) => {
    setFilteredResources(resources.filter((resource) => resource.severity.includes(severity)));
  };

  const handleClose = () => {
    setFilteredResources(resources);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex space-x-8 border-b border-gray-700 mb-4">
        {['dashboard', 'csv', 'analytics', 'metrics'].map((tab) => (
          <div
            key={tab}
            className={`pb-2 cursor-pointer ${activeTab === tab ? 'border-b-4 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/4 bg-gray-800 p-4 rounded-xl shadow-xl overflow-y-auto max-h-[600px]">
            <h2 className="text-xl font-semibold mb-2">Fire Department Resources</h2>
            <div className="space-y-4">
              {filteredResources.map((resource, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded-md shadow-md">
                  <h3 className={`text-lg font-semibold mb-1 ${getSeverityColor(resource.severity)}`}>{resource.name}</h3>
                  <p className="text-sm">Total: {resource.total}</p>
                  <p className="text-sm">In Use: {resource.inUse}</p>
                  <p className="text-sm">Cost: ${resource.cost}</p>
                  <p className={`text-sm ${getSeverityColor(resource.severity)}`}>Severity: {resource.severity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-3/4 bg-gray-800 p-4 rounded-xl shadow-xl">
            <h2 className="text-xl font-semibold mb-2">Fire Incident Map</h2>
            <MapWithMultipleFires onFireClick={handleFireClick} onClose={handleClose} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;