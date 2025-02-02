import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const center = {
  lat: 45.5019,
  lng: -73.5674,
};

const FirePredictionMap = () => {
  const [firePredictions, setFirePredictions] = useState([]);
  const [socket, setSocket] = useState(null);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

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
            lat: data.latitude,
            lng: data.longitude,
            risk: data.fire_risk_probability
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

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <div style={{ position: "relative" }}>
        <GoogleMap 
          mapContainerStyle={containerStyle} 
          center={center} 
          zoom={12} 
          mapTypeId="satellite"
        >
          {firePredictions.map((fire, index) => (
            <Marker
              key={`${fire.lat}-${fire.lng}-${index}`}
              position={{ lat: fire.lat, lng: fire.lng }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: fire.risk > 0.5 ? "red" : "green",
                fillOpacity: 0.6,
                scale: 8 + (fire.risk * 20), // Scale based on risk
                strokeColor: "white",
                strokeWeight: 1
              }}
            />
          ))}
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default FirePredictionMap;