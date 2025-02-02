import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Polygon } from "@react-google-maps/api";
import FireDetailsOverlay from "./FireDetailsOverlay";

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

const polygonOptions = {
  fillColor: "red",
  fillOpacity: 0.4,
  strokeColor: "red",
  strokeOpacity: 0.8,
  strokeWeight: 2,
};

const MapWithMultipleFires = ({ onFireClick, onClose }) => {
  const [fires, setFires] = useState(initialFires);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const [simulatedDate, setSimulatedDate] = useState(new Date("2024-01-01"));
  const [map, setMap] = useState(null); // Store map instance
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const timer = setInterval(() => {
      setFires((prevFires) =>
        prevFires.map((fire) => ({
          ...fire,
          coordinates: fire.coordinates.map((coord) => ({
            lat: coord.lat + (Math.random() - 0.5) * 0.01,
            lng: coord.lng + (Math.random() - 0.5) * 0.01,
          })),
        }))
      );
      // Advance the date by 3 days every second
      setSimulatedDate((prevDate) => new Date(prevDate.getTime() + 3 * 24 * 60 * 60 * 1000));
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
    onFireClick(fires[index].severity);

    // Center the map on this fire's centroid
    const centroid = calculateCentroid(fires[index].coordinates);
    if (map) {
      map.panTo(centroid);
    }
  };

  const handleClose = () => {
    setActiveInfoWindow(null);
    onClose();
  };

  return (
    <div className="relative">
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          mapTypeId="satellite"
          onLoad={(mapInstance) => setMap(mapInstance)} // capture map instance
        >
          {fires.map((fire, index) => (
            <React.Fragment key={index}>
              <Polygon
                paths={fire.coordinates}
                options={polygonOptions}
                onClick={() => handleAlertClick(index)}
              />
              {activeInfoWindow === index && (
                <FireDetailsOverlay
                  fire={fire}
                  onClose={handleClose}
                  centroid={calculateCentroid(fire.coordinates)}
                />
              )}
            </React.Fragment>
          ))}
        </GoogleMap>
      </LoadScript>

      {/* New top-right alerts */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
        }}
      >
        {fires.map((_, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "red",
              color: "white",
              marginBottom: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => handleAlertClick(index)}
          >
            Alert: New Fire #{index + 1}
          </div>
        ))}
      </div>

      <div className="absolute bottom-2 left-2 bg-gray-800 text-white p-2 rounded-md shadow-md text-sm">
        {simulatedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </div>
  );
};

export default MapWithMultipleFires;
