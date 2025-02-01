import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Polygon,
  OverlayView,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const center = {
  lat: 45.5019,
  lng: -73.5674,
};

const initialFires = [
  {
    coordinates: [
      { lat: 45.48, lng: -73.51 },
      { lat: 45.47, lng: -73.52 },
      { lat: 45.46, lng: -73.5 },
      { lat: 45.47, lng: -73.49 },
    ],
    severity: "High",
  },
  {
    coordinates: [
      { lat: 45.55, lng: -73.58 },
      { lat: 45.54, lng: -73.6 },
      { lat: 45.53, lng: -73.59 },
      { lat: 45.54, lng: -73.57 },
    ],
    severity: "Medium",
  },
];

const resources = [
  { name: "Smoke Jumpers", total: 5, inUse: 2, cost: 5000, severity: "Medium" },
  { name: "Fire Engines", total: 10, inUse: 8, cost: 2000, severity: "Low" },
  { name: "Helicopters", total: 3, inUse: 1, cost: 8000, severity: "Medium,High" },
  { name: "Tanker Planes", total: 2, inUse: 1, cost: 15000, severity: "High,Medium" },
  { name: "Ground Crews", total: 8, inUse: 6, cost: 3000, severity: "Low,Medium,High" },
];

const polygonOptions = {
  fillColor: "red",
  fillOpacity: 0.4,
  strokeColor: "red",
  strokeOpacity: 0.8,
  strokeWeight: 2,
};

const getStatusColor = (available, total) => {
  const usageRate = available / total;
  if (usageRate > 0.6) return "green";
  if (usageRate > 0.3) return "yellow";
  return "red";
};

const MapWithFiresAndStations = () => {
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const [map, setMap] = useState(null);
  const [simulatedDays, setSimulatedDays] = useState(0);
  const startDate = new Date("2024-01-01");
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedDays((prevDays) => prevDays + 3.04);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const calculateCentroid = (polygon) => {
    const lat =
      polygon.reduce((sum, point) => sum + point.lat, 0) / polygon.length;
    const lng =
      polygon.reduce((sum, point) => sum + point.lng, 0) / polygon.length;
    return { lat, lng };
  };

  const handleAlertClick = (index) => {
    setActiveInfoWindow(index);
    if (map) {
      map.panTo(calculateCentroid(initialFires[index].coordinates));
    }
  };

  const currentDate = new Date(startDate.getTime() + simulatedDays * 24 * 60 * 60 * 1000);

  const filteredResources = (severity) => {
    return resources.filter((res) => res.severity.includes(severity));
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
          {initialFires.map((fire, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "red",
                color: "white",
                padding: "5px",
                margin: "5px",
                borderRadius: "5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                height: "40px",
              }}
              onClick={() => handleAlertClick(index)}
            >
              <span style={{ marginRight: "8px" }}>⚠️</span>
              New Fire Alert #{index + 1} ({fire.severity})
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
          {resources.map((resource, resIndex) => (
            <div
              key={resIndex}
              style={{
                backgroundColor: "#333",
                color: "white",
                padding: "10px",
                marginBottom: "5px",
                borderRadius: "5px",
                width: "320px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                height: "40px",
              }}
            >
              <strong>{resource.name}</strong>
              <div style={{ display: "flex", gap: "10px" }}>
                <span>Total: {resource.total}</span>
                <span>In Use: {resource.inUse}</span>
              </div>
              <div
                style={{
                  backgroundColor: getStatusColor(
                    resource.total - resource.inUse,
                    resource.total
                  ),
                  width: "15px",
                  height: "15px",
                  borderRadius: "50%",
                  marginLeft: "5px",
                }}
              ></div>
            </div>
          ))}
        </div>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          mapTypeId="satellite"
          onLoad={(map) => setMap(map)}
        >
          {initialFires.map((fire, index) => (
            <React.Fragment key={index}>
              <Polygon paths={fire.coordinates} options={polygonOptions} />
              {activeInfoWindow === index && (
                <OverlayView
                  position={calculateCentroid(fire.coordinates)}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div
                    style={{
                      backgroundColor: "red",
                      padding: "5px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                      minWidth: "180px",
                      maxWidth: "220px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "red",
                        padding: "5px",
                        borderRadius: "5px",
                      }}
                    >
                      <strong style={{ color: "white" }}>Fire Details</strong>
                      <button
                        style={{
                          background: "transparent",
                          color: "white",
                          border: "none",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                        onClick={() => setActiveInfoWindow(null)}
                      >
                        X
                      </button>
                    </div>
                    <div style={{ padding: "5px" }}>
                      <p>Location: Zone {index + 1}</p>
                      <p>Severity: {fire.severity}</p>
                    </div>
                  </div>
                </OverlayView>
              )}
            </React.Fragment>
          ))}
        </GoogleMap>

        <div
          style={{
            backgroundColor: "#333",
            color: "white",
            padding: "5px",
            textAlign: "center",
            position: "absolute",
            bottom: 10,
            right: 10,
            borderRadius: "5px",
          }}
        >
          {currentDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>
    </LoadScript>
  );
};

export default MapWithFiresAndStations;
