import React, { useState, useEffect } from 'react';
import MapWithMultipleFires from './Map';
import PieChart from './PieChart';
import LineGraph from './LineGraph';
import FirePrediction from './FirePrediction';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState('');
  const [socket, setSocket] = useState(null);

  const [resources, setResources] = useState([
    { name: "Smoke Jumpers", total: 5, inUse: 2, cost: 5000, severity: "Medium" },
    { name: "Fire Engines", total: 10, inUse: 8, cost: 2000, severity: "Low" },
    { name: "Helicopters", total: 3, inUse: 1, cost: 8000, severity: "Medium,High" },
    { name: "Tanker Planes", total: 2, inUse: 1, cost: 15000, severity: "High,Medium" },
    { name: "Ground Crews", total: 8, inUse: 6, cost: 3000, severity: "Low,Medium,High" },
  ]);
  const [filteredResources, setFilteredResources] = useState(resources);
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

  const handleMetricChange = (id, newValue) => {
    setMetrics(metrics.map(metric => metric.id === id ? { ...metric, value: newValue } : metric));
  };

  useEffect(() => {
    const taskSocket = new WebSocket("ws://localhost:5002/ws/tasks");

    taskSocket.onopen = () => {
      console.log("✅ Connected to WebSocket");
    };
    
  
    taskSocket.onmessage = (event) => {
      const taskData = JSON.parse(event.data);
      console.log("New Task:", taskData);
      setTasks((prev) => [...prev, taskData]);
    };

    taskSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    taskSocket.onclose = () => {
      console.log("❌ Disconnected from WebSocket");
    };

    setSocket(taskSocket);

    // Cleanup function
    return () => {
      if (taskSocket.readyState === WebSocket.OPEN) {
        taskSocket.close();
      }
    };

  }, []);
  


  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex space-x-8 border-b border-gray-700 mb-4">
        {['dashboard', 'prediction','csv', 'analytics', 'metrics' ].map((tab) => (
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:w-1/5 bg-gray-800 p-4 rounded-xl shadow-xl max-h-[665px] h-[665px] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-2">Fire Department Resources</h2>
              <div className="space-y-4">
                {filteredResources.map((resource, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-md shadow-md">
                    <h3 className={`text-lg font-semibold mb-1 ${getSeverityColor(resource.severity)}`}>{resource.name}</h3>
                    <div className="flex justify-between text-sm">
                      <p>Total: {resource.total}</p>
                      <p>In Use: {resource.inUse}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <p>Cost: ${resource.cost}</p>
                      <p className={`${getSeverityColor(resource.severity)}`}>Severity: {resource.severity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-4/5 bg-gray-800 p-4 rounded-xl shadow-xl">
              <h2 className="text-xl font-semibold mb-2">Fire Incident Map</h2>
              <MapWithMultipleFires onFireClick={handleFireClick} onClose={handleClose} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PieChart />
            <LineGraph />
          </div>
        </div>
      )}

      {activeTab === 'csv' && (
        <div className="bg-gray-800 rounded-xl shadow-xl min-h-screen">
          <iframe 
            src='http://localhost:8501?embed=true&component=csv_processing'
            style={{ border: 'none', width: '100%', height: '100vh' }}
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-gray-800 p-4 rounded-xl shadow-xl">
   
        
          <iframe 
                src="http://localhost:8501?embed=true&component=analytics" 
                style={{
                  border: 'none',
                  width: '100%',
                  height: '100vh'
                }}
              />
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="flex space-x-4">
          <div className="bg-gray-800 p-4 rounded-xl shadow-xl w-1/2">
            <div className="space-y-4">
              <iframe 
                src="http://localhost:8501?embed=true&component=resource_update_units" 
                style={{
                  border: 'none',
                  width: '100%',
                  height: '100vh'
                }}
              />
            </div>          
          </div>
          <div className="bg-gray-800 p-4 rounded-xl shadow-xl w-1/2">
            <div className="space-y-4">
              <iframe 
                src="http://localhost:8501?embed=true&component=resource_update_cost" 
                style={{
                  border: 'none',
                  width: '100%',
                  height: '100vh'
                }}
              />
            </div>          
          </div>
          <div className="bg-gray-800 p-4 rounded-xl shadow-xl w-1/2">
            <div className="space-y-4">
              <iframe 
                src="http://localhost:8501?embed=true&component=resource_update_depl" 
                style={{
                  border: 'none',
                  width: '100%',
                  height: '100vh'
                }}
              />
            </div>          
          </div>
        </div>
      )}

      {activeTab === 'prediction' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-3 bg-gray-800 p-4 rounded-xl shadow-xl">
            <FirePrediction/>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
