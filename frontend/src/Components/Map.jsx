import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Polygon } from "@react-google-maps/api";
import FireAlert from "./FireAlert";
import ResourceCard from "./ResourceCard";
import FireDetailsOverlay from "./FireDetailsOverlay";

const containerStyle = {
  width: "100%",
  height: "630px",
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
    const lat = polygon.reduce((sum, point) => sum + point.lat, 0) / polygon.length;
    const lng = polygon.reduce((sum, point) => sum + point.lng, 0) / polygon.length;
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
            <FireAlert key={index} fire={fire} index={index} onClick={() => handleAlertClick(index)} />
          ))}
        </div>

        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
          {(activeInfoWindow !== null ? filteredResources(initialFires[activeInfoWindow].severity) : resources).map(
            (resource, resIndex) => (
              <ResourceCard key={resIndex} resource={resource} />
            )
          )}
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
              <Polygon
                paths={fire.coordinates}
                options={polygonOptions}
                onClick={() => handleAlertClick(index)}
              />
              {activeInfoWindow === index && (
                <FireDetailsOverlay
                  fire={fire}
                  onClose={() => setActiveInfoWindow(null)}
                  centroid={calculateCentroid(fire.coordinates)}
                />
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
