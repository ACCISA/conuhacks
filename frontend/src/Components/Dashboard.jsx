import React, { useState, useEffect } from 'react';
import MapWithMultipleFires from './Map';
import PieChart from './PieChart';
import LineGraph from './LineGraph';
import FirePrediction from './FirePrediction';
import PastFireMap from './PastFireMap';

<<<<<<< HEAD
import axios from 'axios';

=======
>>>>>>> 08e2b88197b1a0b466a6d89bcd66b76c9eded101
// Map from backend resource keys -> your resource names
const RESOURCE_KEY_MAP = {
  smoke_jumpers: "Smoke Jumpers",
  fire_engines: "Fire Engines",
  helicopters: "Helicopters",
  tanker_planes: "Tanker Planes",
  ground_crews: "Ground Crews"
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fireInfo, setFireInfo] = useState([]);
  const [socket, setSocket] = useState(null);

  // If you need this for analytics
  const [fireData, setfireData] = useState([]);

  // ----------------------------------------------------------
  // Global resources (all start with 0 inUse).
  // ----------------------------------------------------------
  const [resources, setResources] = useState([
    {
      name: "Smoke Jumpers",
      total: 5,
      inUse: 0,
      cost: 5000,
      severity: "Medium",
      deploymentTime: "30 minutes"
    },
    {
      name: "Fire Engines",
      total: 10,
      inUse: 0,
      cost: 2000,
      severity: "Low",
      deploymentTime: "1 hour"
    },
    {
      name: "Helicopters",
      total: 3,
      inUse: 0,
      cost: 8000,
      severity: "Medium,High",
      deploymentTime: "45 minutes"
    },
    {
      name: "Tanker Planes",
      total: 2,
      inUse: 0,
      cost: 15000,
      severity: "High,Medium",
      deploymentTime: "2 hours"
    },
    {
      name: "Ground Crews",
      total: 8,
      inUse: 0,
      cost: 3000,
      severity: "Low",
      deploymentTime: "1.5 hours"
    },
  ]);

  // The currently “selected” fire from the map
  const [selectedFire, setSelectedFire] = useState(null);

  // Example metrics
  const [metrics, setMetrics] = useState([
    { id: 1, name: 'Response Time', value: '5 mins' },
    { id: 2, name: 'Water Usage', value: '2000 L' },
    { id: 3, name: 'Personnel Deployed', value: '50' },
  ]);

  // ----------------------------------------------------------
  // Resource usage color & status
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // For each resource from the server, increment usage globally.
  // ----------------------------------------------------------
  const allocateResources = (serverResources) => {
    setResources((prev) => {
      const newRes = [...prev];
      serverResources.forEach((key) => {
        const mappedName = RESOURCE_KEY_MAP[key];
        const idx = newRes.findIndex((r) => r.name === mappedName);
        if (idx >= 0) {
          const item = { ...newRes[idx] };
          item.inUse = Math.min(item.inUse + 1, item.total);
          newRes[idx] = item;
        }
      });
      return newRes;
    });
  };

  // ----------------------------------------------------------
  // Calculate cost for allocated resources
  // ----------------------------------------------------------
  const calculateCost = (serverResources) => {
    let totalCost = 0;
    serverResources.forEach((key) => {
      const mappedName = RESOURCE_KEY_MAP[key];
      const resObj = resources.find((r) => r.name === mappedName);
      if (resObj) {
        totalCost += resObj.cost;
      }
    });
    return totalCost;
  };

  // ----------------------------------------------------------
  // Called by the map: user clicked on a polygon / alert => set selectedFire
  // ----------------------------------------------------------
  const handleFireSelected = (fire) => {
    setSelectedFire(fire);
  };

  // ----------------------------------------------------------
  // WebSocket logic: if fire has status=allocated, allocate resources globally
  // ----------------------------------------------------------
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
          const newFires = taskData.map((task) => {
            let total_cost = 0;
            if (task.status === "allocated" && task.resources?.length > 0) {
              total_cost = calculateCost(task.resources);
              allocateResources(task.resources);
            }
            return {
              ...task,
              total_cost
            };
          });
          return [...prevFireInfo, ...newFires];
        });
      } else {
        // Single new task
        let total_cost = 0;
        if (taskData.status === "allocated" && taskData.resources?.length > 0) {
          total_cost = calculateCost(taskData.resources);
          allocateResources(taskData.resources);
        }
        setFireInfo((prevFireInfo) => [
          ...prevFireInfo,
          {
            ...taskData,
            total_cost
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
  }, [resources]); // keep resources in dependency

  // Debug log
  useEffect(() => {
    console.log("fireInfo updated:", fireInfo);
  }, [fireInfo]);

  // ----------------------------------------------------------
  // Tab handling
  // ----------------------------------------------------------
  const handleTabClick = (tab) => {
    if (tab === 'dashboard') {
      window.location.reload();
    } else {
      setActiveTab(tab);
    }
  };

  // ----------------------------------------------------------
  // Analytics table stuff
  // ----------------------------------------------------------
  const handleLocationClick = (fire) => {
    console.log("move map", fire);
  };

  const getCircleColor = (prob) => {
    if (prob === 3) return "#FF0000";
    if (prob === 2) return "#FFA500";
    return "#FFFF00";
  };

  // We do not filter the main resource list by severity anymore.  
  // Instead, show the global usage plus how many are used by the selected fire.
  const getResourceUsageByFire = (fire, resourceName) => {
    // If no fire selected or no resources allocated
    if (!fire?.resources?.length) return 0;

    // Count how many times resourceName's key appears
    // e.g. resourceName = "Tanker Planes", key => "tanker_planes"
    // We'll invert the map first:
    const resourceKey = Object.keys(RESOURCE_KEY_MAP)
      .find((k) => RESOURCE_KEY_MAP[k] === resourceName);

    if (!resourceKey) return 0;

    // Count occurrences
    return fire.resources.filter((r) => r === resourceKey).length;
  };

  useEffect(() => {
    axios.get('http://localhost:5002/get_past_fires')
    .then((res) => {
      setfireData(res.data)
    })
  },[])

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

      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Panel: ALWAYS show all resources. 
                Also show how many are used by the selected fire. */}
            <div className="lg:w-1/5 bg-gray-800 p-4 rounded-xl shadow-xl max-h-[665px] h-[665px] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-2">Fire Department Resources</h2>
              <div className="space-y-4">
                {resources.map((resource, index) => {
                  const { status, colorClass } = getResourceStatus(resource.inUse, resource.total);
                  // Find usage by the selected fire if any
                  const usageForThisFire = getResourceUsageByFire(selectedFire, resource.name);

                  return (
                    <div key={index} className="bg-gray-700 p-3 rounded-md shadow-md">
                      <h3 className={`text-lg font-semibold mb-1 ${colorClass}`}>
                        {resource.name}
                      </h3>
                      <div className="flex justify-between text-sm">
                        <p>Total: {resource.total}</p>
                        <p>Global In Use: {resource.inUse}</p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <p>Cost: ${resource.cost}</p>
                        <p>Severity: {resource.severity}</p>
                      </div>
                      {/* Status color based on global usage */}
                      <p className={`mt-1 text-sm font-semibold ${colorClass}`}>
                        Status: {status}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        Deployment Time: {resource.deploymentTime}
                      </p>

                      {/* Show usage for the selected fire if non-zero */}
                      {selectedFire && usageForThisFire > 0 && (
                        <p className="mt-2 text-sm text-blue-300">
                          Used by this Fire: {usageForThisFire}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Panel: Fire Incident Map */}
            <div className="lg:w-4/5 bg-gray-800 p-4 rounded-xl shadow-xl">
              <h2 className="text-xl font-semibold mb-2">Fire Incident Map</h2>
              <MapWithMultipleFires
                fireInfo={fireInfo}
                onFireSelected={handleFireSelected}
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
        <div className='flex row w-full justify-around'>
          <div className="bg-gray-800 w-full rounded-xl shadow-xl min-h-screen m-2">
            <iframe
              src='http://localhost:8501?embed=true&component=csv_processing'
              style={{ border: 'none', width: '100%', height: '100vh' }}
            />
          </div>
          <div className="bg-gray-800 w-full rounded-xl shadow-xl min-h-screen m-2">
            <iframe
              src='http://localhost:8501?embed=true&component=csv_processing_prediction'
              style={{ border: 'none', width: '100%', height: '100vh' }}
            />
          </div>
        </div>
        
      )}

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

    <div className="flex flex-row w-full space-x-4 mb-4">

      <div className="bg-gray-800 p-4 w-2/3 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold mb-2">Fire Data Table</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "white", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: "#111", textAlign: "left" }}>
              <th>Timestamp</th>
              <th>Fire Start Time</th>
              <th>Location</th>
              <th>Severity</th>
              <th>Resources</th>
              <th>Cost ($)</th>
            </tr>
          </thead>
          <tbody>
            {fireData.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "10px", color: "#999" }}>
                  [INFO] Waiting for db data...
                </td>
              </tr>
            ) : (
              fireData.map((fire, index) => {
                const details = fire.other_details || {};
                return (
                  <tr 
                    key={index} 
                    style={{ background: index % 2 === 0 ? "#111" : "#222", cursor: "pointer" }} 
                    onClick={() => handleLocationClick(fire)}
                  >
                    <td>{fire.timestamp}</td>
                    <td>{details.fire_start_time ?? "N/A"}</td>
                    <td>{fire.latitude.toFixed(4)},{fire.longitude.toFixed(4)}</td>
                    <td 
                      style={{
                        color: fire.severity === "high" ? "red" : fire.severity === "medium" ? "orange" : "green",
                        fontWeight: "bold"
                      }}
                    >
                      {fire.severity.charAt(0).toUpperCase() + fire.severity.slice(1)}
                    </td>
                    <td>{details.resources ? `$${details.resources.toLocaleString()}` : "N/A"}</td>
                    <td>{details.cost ? `$${details.cost.toLocaleString()}` : "N/A"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-800 p-4 w-1/3 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold mb-2">Past Fire Map</h2>
        <PastFireMap />
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