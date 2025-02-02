import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
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

  const initiateConnection = () => {
    const newSocket = io("http://127.0.0.1:5002");

    newSocket.on("connect", () => {
      console.log("✅ Connected to Socket.IO");
      newSocket.emit("request_fire_predictions");
    });

    newSocket.on("fire_predictions", (data) => {
      console.log("🔥 Received fire prediction:", data);
      setFirePredictions((prevPredictions) => [...prevPredictions, data]);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO");
    });

    setSocket(newSocket);
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <div style={{ position: "relative" }}>
        <button 
          onClick={initiateConnection} 
          style={{ position: "absolute", top: 10, left: 10, zIndex: 1000, padding: "10px", background: "blue", color: "white", border: "none", cursor: "pointer", borderRadius: "5px" }}
        >
          Connect & Get Fire Predictions
        </button>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} mapTypeId="satellite">
          {firePredictions.map((fire, index) => (
            <Marker key={index} position={{ lat: fire.latitude, lng: fire.longitude }} />
          ))}
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default FirePredictionMap;
