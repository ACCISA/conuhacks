import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, LoadScript, Circle } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const defaultCenter = {
  lat: 45.5019,
  lng: -73.5674,
};

const defaultZoom = 5;
const zoomedInLevel = 10;
const transitionDuration = 1000;

const FirePredictionMap = () => {
  const [firePredictions, setFirePredictions] = useState([]);
  const [socket, setSocket] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);
  const mapRef = useRef(null);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    console.log("API Key Loaded:", apiKey);
  }, [apiKey]);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket("ws://localhost:5002/ws"); // Fixed endpoint URL
    
    ws.onopen = () => {
      console.log("✅ Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("🔥 Received fire prediction:", data);
        
        // Update state using functional update to ensure fresh state
        setFirePredictions(prev => [
          ...prev,
          {
            latitude: data.latitude,
            longitude: data.longitude,
            fire_risk_probability: data.fire_risk_probability,
            other_details: data.other_details
          }
        ]);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("❌ Disconnected from WebSocket");
    };

    setSocket(ws);

    // Cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);
  const getCircleColor = (probability) => {
    if (probability > 0.75) return "#FF0000";
    if (probability > 0.5) return "#FFA500";
    return "#FFFF00";
  };

  const handleLocationClick = (fire) => {
    if (mapRef.current) {
      const newCenter = { lat: fire.latitude, lng: fire.longitude };

      // i thin kthas cool
      const steps = 30;
      const stepDuration = transitionDuration / steps;
      let stepCount = 0;

      const startLat = mapRef.current.getCenter().lat();
      const startLng = mapRef.current.getCenter().lng();
      const deltaLat = (newCenter.lat - startLat) / steps;
      const deltaLng = (newCenter.lng - startLng) / steps;

      const smoothMove = setInterval(() => {
        if (stepCount >= steps) {
          clearInterval(smoothMove);
          mapRef.current.panTo(newCenter);
        } else {
          mapRef.current.panTo({
            lat: startLat + deltaLat * stepCount,
            lng: startLng + deltaLng * stepCount,
          });
          stepCount++;
        }
      }, stepDuration);

      mapRef.current.setZoom(zoomedInLevel);
    }
  };


  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ position: "relative" }}>
       
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={mapZoom}
            mapTypeId="satellite"
            onLoad={(map) => (mapRef.current = map)}
          >
            {firePredictions.map((fire, index) => (
              <Circle
                key={index}
                center={{ lat: fire.latitude, lng: fire.longitude }}
                radius={fire.fire_risk_probability * 5000}
                options={{
                  fillColor: getCircleColor(fire.fire_risk_probability),
                  fillOpacity: 0.3,
                  strokeColor: getCircleColor(fire.fire_risk_probability),
                  strokeOpacity: 0.7,
                  strokeWeight: 1,
                }}
                onClick={() => handleLocationClick(fire)}
              />
            ))}
          </GoogleMap>
        </div>

        <div style={{ maxHeight: "300px", overflowY: "auto", background: "#000", padding: "10px", borderRadius: "5px", color: "white", fontFamily: "monospace" }}>
          <h3 style={{ textAlign: "center", color: "#388299" }}>Fire Prediction Log</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "white", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "#111", textAlign: "left" }}>
                <th style={{ padding: "5px", borderBottom: "1px solid #333", color: "#388299" }}>Time</th>
                <th style={{ padding: "5px", borderBottom: "1px solid #333", color: "#388299" }}>Latitude</th>
                <th style={{ padding: "5px", borderBottom: "1px solid #333", color: "#388299" }}>Longitude</th>
                <th style={{ padding: "5px", borderBottom: "1px solid #333", color: "#388299" }}>Probability</th>
                <th style={{ padding: "5px", borderBottom: "1px solid #333", color: "#388299" }}>Temp (°C)</th>
                <th style={{ padding: "5px", borderBottom: "1px solid #333", color: "#388299" }}>Humidity (%)</th>
                <th style={{ padding: "5px", borderBottom: "1px solid #333", color: "#388299" }}>Wind (km/h)</th>
                <th style={{ padding: "5px", borderBottom: "1px solid #333", color: "#388299" }}>Precip (mm)</th>
                <th style={{ padding: "5px", borderBottom: "1px solid #333", color: "#388299" }}>Vegetation Index</th>
                <th style={{ padding: "5px", borderBottom: "1px solid #333", color: "#388299" }}>Human Activity</th>
              </tr>
            </thead>
            <tbody>
              {firePredictions.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "10px", color: "#999" }}>
                    [INFO] Waiting for fire predictions...
                  </td>
                </tr>
              ) : (
                firePredictions.map((fire, index) => {
                  console.log("Fire"+fire)
                  const details = fire.other_details || {}; // Ensure other_details exists
                  return (
                    <tr
                      key={index}
                      style={{ background: index % 2 === 0 ? "#111" : "#222", cursor: "pointer" }}
                      onClick={() => handleLocationClick(fire)}
                    >
                      <td style={{ padding: "5px", borderBottom: "1px solid #333" }}>{new Date().toLocaleTimeString()}</td>
                      <td style={{ padding: "5px", borderBottom: "1px solid #333" }}>
                      {fire.latitude ? fire.latitude.toFixed(4) : "N/A"}
                      </td>
                      <td style={{ padding: "5px", borderBottom: "1px solid #333" }}>
                      {fire.longitude ? fire.longitude.toFixed(4) : "N/A"}
                      </td>
                      <td style={{ padding: "5px", borderBottom: "1px solid #333", color: getCircleColor(fire.fire_risk_probability) }}>
                        {Math.round(fire.fire_risk_probability * 100)}%
                      </td>
                      <td style={{ padding: "5px", borderBottom: "1px solid #333" }}>{details.temperature ?? "N/A"}°C</td>
                      <td style={{ padding: "5px", borderBottom: "1px solid #333" }}>{details.humidity ?? "N/A"}%</td>
                      <td style={{ padding: "5px", borderBottom: "1px solid #333" }}>{details.wind_speed ?? "N/A"} km/h</td>
                      <td style={{ padding: "5px", borderBottom: "1px solid #333" }}>{details.precipitation ?? "N/A"} mm</td>
                      <td style={{ padding: "5px", borderBottom: "1px solid #333" }}>{details.vegetation_index ?? "N/A"}</td>
                      <td style={{ padding: "5px", borderBottom: "1px solid #333" }}>{details.human_activity_index ?? "N/A"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </LoadScript>
  );
};

export default FirePredictionMap;