import React, { useState, useEffect } from 'react';
import MapWithMultipleFires from './Map';
import PieChart from './PieChart';
import LineGraph from './LineGraph';
import FirePrediction from './FirePrediction';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fireInfo, setFireInfo] = useState([]);
  const [socket, setSocket] = useState(null);
  const [fireData, setfireData] = useState([]);

  // -------------------------------------
  // Fake Resources (unchanged)
  // -------------------------------------
  const [resources] = useState([
    { name: "Smoke Jumpers", total: 5, inUse: 2, cost: 5000, severity: "Medium" },
    { name: "Fire Engines", total: 10, inUse: 8, cost: 2000, severity: "Low" },
    { name: "Helicopters", total: 3, inUse: 1, cost: 8000, severity: "Medium,High" },
    { name: "Tanker Planes", total: 2, inUse: 1, cost: 15000, severity: "High,Medium" },
    { name: "Ground Crews", total: 8, inUse: 6, cost: 3000, severity: "Low" },
  ]);

  // By default, all resources are shown
  const [filteredResources, setFilteredResources] = useState(resources);

  // Example metrics (unchanged)
  const [metrics, setMetrics] = useState([
    { id: 1, name: 'Response Time', value: '5 mins' },
    { id: 2, name: 'Water Usage', value: '2000 L' },
    { id: 3, name: 'Personnel Deployed', value: '50' },
  ]);

  // -------------------------------------
  // Resource usage color & status
  // -------------------------------------
  const getResourceStatus = (inUse, total) => {
    if (total === 0) {
      return { status: 'N/A', colorClass: 'text-gray-400' };
    }
    const usage = inUse / total;
    if (usage === 0) {
      return { status: 'Free', colorClass: 'text-green-400' };
    } else if (usage > 0 && usage <= 0.4) {
      return { status: 'Moderately Used', colorClass: 'text-yellow-400' };
    } else if (usage > 0.4 && usage <= 0.8) {
      return { status: 'Highly Used', colorClass: 'text-orange-400' };
    } else {
      return { status: 'Near Max Usage', colorClass: 'text-red-400' };
    }
  };

  // -------------------------------------
  // Filter resources by severity
  // -------------------------------------
  const handleFireClick = (severity) => {
    setFilteredResources(resources.filter((res) => res.severity.includes(severity)));
  };

  // -------------------------------------
  // Reset resource filter
  // -------------------------------------
  const handleClose = () => {
    setFilteredResources(resources);
  };

  // -------------------------------------
  // Tab handling
  // -------------------------------------
  const handleTabClick = (tab) => {
    if (tab === 'dashboard') {
      // Force reload for demonstration
      window.location.reload();
    } else {
      setActiveTab(tab);
    }
  };

  // -------------------------------------
  // Example: handle metric changes
  // -------------------------------------
  const handleMetricChange = (id, newValue) => {
    setMetrics((prev) =>
      prev.map((metric) => (metric.id === id ? { ...metric, value: newValue } : metric))
    );
  };

  // -------------------------------------
  // WebSocket to receive new fires
  // -------------------------------------
  useEffect(() => {
    const taskSocket = new WebSocket("ws://localhost:5002/ws/tasks");

    taskSocket.onopen = () => {
      console.log("✅ Connected to WebSocket");
    };

    taskSocket.onmessage = (event) => {
      const taskData = JSON.parse(event.data);

      if (Array.isArray(taskData)) {
        // If array of tasks
        setFireInfo((prevFireInfo) => {
          const newFires = taskData.map((task) => ({
            fire_start_time: task.fire_start_time,
            location: task.location,
            severity: task.severity,
          }));
          return [...prevFireInfo, ...newFires];
        });
      } else {
        // Single new task
        setFireInfo((prevFireInfo) => [
          ...prevFireInfo,
          {
            fire_start_time: taskData.fire_start_time,
            location: taskData.location,
            severity: taskData.severity,
          },
        ]);
      }
    };

    taskSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    taskSocket.onclose = () => {
      console.log("❌ Disconnected from WebSocket");
    };

    setSocket(taskSocket);

    return () => {
      if (taskSocket.readyState === WebSocket.OPEN) {
        taskSocket.close();
      }
    };
  }, []);

  const handleLocationClick = (fire) => {
    console.log("move map")
  }


  const getCircleColor = (serverity) => {
    if (serverity == 3) return "#FF0000";
    if (serverity == 2) return "#FFA500";
    return "#FFFF00";
  };
  // -------------------------------------
  // Log whenever fireInfo changes
  // -------------------------------------
  useEffect(() => {
    console.log("fireInfo updated:", fireInfo);
  }, [fireInfo]);

  // -------------------------------------
  // Render
  // -------------------------------------
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Tabs */}
      <div className="flex space-x-8 border-b border-gray-700 mb-4">
        {['dashboard', 'prediction', 'csv', 'analytics', 'metrics'].map((tab) => (
          <div
            key={tab}
            className={`pb-2 cursor-pointer ${
              activeTab === tab
                ? 'border-b-4 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => handleTabClick(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {/* Dashboard content */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Panel: Fire Department Resources */}
            <div className="lg:w-1/5 bg-gray-800 p-4 rounded-xl shadow-xl max-h-[665px] h-[665px] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-2">Fire Department Resources</h2>
              <div className="space-y-4">
                {filteredResources.map((resource, index) => {
                  const { status, colorClass } = getResourceStatus(resource.inUse, resource.total);

                  return (
                    <div key={index} className="bg-gray-700 p-3 rounded-md shadow-md">
                      <h3 className={`text-lg font-semibold mb-1 ${colorClass}`}>
                        {resource.name}
                      </h3>
                      <div className="flex justify-between text-sm">
                        <p>Total: {resource.total}</p>
                        <p>In Use: {resource.inUse}</p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <p>Cost: ${resource.cost}</p>
                        <p>Severity: {resource.severity}</p>
                      </div>
                      <p className={`mt-1 text-sm font-semibold ${colorClass}`}>
                        Status: {status}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Panel: Fire Incident Map */}
            <div className="lg:w-4/5 bg-gray-800 p-4 rounded-xl shadow-xl">
              <h2 className="text-xl font-semibold mb-2">Fire Incident Map</h2>
              <MapWithMultipleFires
                onFireClick={handleFireClick}
                onClose={handleClose}
                fireInfo={fireInfo}
              />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PieChart fireInfo={fireInfo} />
            <LineGraph fireInfo={fireInfo} />
          </div>
        </div>
      )}

      {/* CSV Tab */}
      {activeTab === 'csv' && (
        <div className="bg-gray-800 rounded-xl shadow-xl min-h-screen">
          <iframe
            src="http://localhost:8501?embed=true&component=csv_processing"
            style={{ border: 'none', width: '100%', height: '100vh' }}
          />
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className=''>
          <div className="flex flex-row w-full justify-around mb-4">
            <div className='bg-gray-800 p-4 flex justify-center w-full rounded-xl shadow-xl m-2'>
              <iframe
              className='w-full'
                src="http://localhost:8501?embed=true&component=metric_total&embed_options=disable_scrolling"
                style={{
                  border: 'none',
                  height: '20vh'
                }}
              />
            </div>
            <div className='bg-gray-800 p-4 w-full rounded-xl shadow-xl m-2'>
              <iframe
                className='w-full'  
                src="http://localhost:8501?embed=true&component=metric_support&embed_options=disable_scrolling"
                style={{
                  border: 'none',
                  height: '20vh'
                }}
              />
            </div>
            <div className='bg-gray-800 p-4 w-full rounded-xl shadow-xl m-2'>
              <iframe
                className='w-full'  
                src="http://localhost:8501?embed=true&component=metric_signup&embed_options=disable_scrolling"
                style={{
                  border: 'none',
                  height: '20vh'
                }}
              />
            </div>
            <div className='bg-gray-800 p-4 w-full rounded-xl shadow-xl m-2'>
              <iframe
                className='w-full'  
                src="http://localhost:8501?embed=true&component=metric_resource&embed_options=disable_scrolling"
                style={{
                  border: 'none',
                  height: '20vh'
                }}
              />
            </div>
            
          </div>
            <div className="bg-gray-800 p-4 w-full rounded-xl shadow-xl">
              <iframe
                src="http://localhost:8501?embed=true&component=metric_graph"
                style={{
                  border: 'none',
                  width: '100%',
                  height: '100vh'
                }}
              />
            </div>
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse", color: "white", fontSize: "12px" }}>
              <thead>
                <tr style={{ background: "#111", textAlign: "left" }}>
                  <th>Timestamp</th><th>Latitude</th><th>Longitude</th><th>Probability</th>
                  <th>Temp (°C)</th><th>Humidity (%)</th><th>Wind (km/h)</th>
                  <th>Precip (mm)</th><th>Vegetation Index</th><th>Human Activity</th>
                </tr>
              </thead>
              <tbody>
                {fireData.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "10px", color: "#999" }}>
                      [INFO] Waiting for db data...
                    </td>
                  </tr>
                ) : (
                  fireData.map((fire, index) => {
                    const details = fire.other_details || {};
                    return (
                      <tr key={index} style={{ background: index % 2 === 0 ? "#111" : "#222", cursor: "pointer" }} onClick={() => handleLocationClick(fire)}>
                        <td>{fire.timestamp}</td>
                        <td>{fire.latitude.toFixed(4)}</td>
                        <td>{fire.longitude.toFixed(4)}</td>
                        <td style={{ color: getCircleColor(fire.fire_risk_probability) }}>{Math.round(fire.fire_risk_probability * 100)}%</td>
                        <td>{details.temperature ?? "N/A"}°C</td>
                        <td>{details.humidity ?? "N/A"}%</td>
                        <td>{details.wind_speed ?? "N/A"} km/h</td>
                        <td>{details.precipitation ?? "N/A"} mm</td>
                        <td>{details.vegetation_index ?? "N/A"}</td>
                        <td>{details.human_activity_index ?? "N/A"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
        </div>
        
      )}

      {activeTab === 'metrics' && (
        <div className="flex space-x-4">
          <div className="bg-gray-800 p-4 rounded-xl shadow-xl w-1/2">
            <iframe
              src="http://localhost:8501?embed=true&component=resource_update_units"
              style={{ border: 'none', width: '100%', height: '100vh' }}
            />
          </div>
          <div className="bg-gray-800 p-4 rounded-xl shadow-xl w-1/2">
            <iframe
              src="http://localhost:8501?embed=true&component=resource_update_cost"
              style={{ border: 'none', width: '100%', height: '100vh' }}
            />
          </div>
          <div className="bg-gray-800 p-4 rounded-xl shadow-xl w-1/2">
            <iframe
              src="http://localhost:8501?embed=true&component=resource_update_depl"
              style={{ border: 'none', width: '100%', height: '100vh' }}
            />
          </div>
        </div>
      )}

      {/* Prediction Tab */}
      {activeTab === 'prediction' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-3 bg-gray-800 p-4 rounded-xl shadow-xl">
            <FirePrediction />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
