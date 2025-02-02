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

const FirePredictionMap = () => {
  const [firePredictions, setFirePredictions] = useState([]);
  const mapRef = useRef(null);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5002/ws");

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received fire prediction:", data);

        setFirePredictions((prev) => {
          const alreadyExists = prev.some(
            (fire) => fire.latitude === data.latitude && fire.longitude === data.longitude
          );

          if (alreadyExists) return prev;

          return [data, ...prev];
        });
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

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
      mapRef.current.panTo({ lat: fire.latitude, lng: fire.longitude });
      mapRef.current.setZoom(zoomedInLevel);
    }
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ position: "relative" }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={defaultZoom}
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
                <th>Timestamp</th><th>Latitude</th><th>Longitude</th><th>Probability</th>
                <th>Temp (°C)</th><th>Humidity (%)</th><th>Wind (km/h)</th>
                <th>Precip (mm)</th><th>Vegetation Index</th><th>Human Activity</th>
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
    </LoadScript>
  );
};

export default FirePredictionMap;
