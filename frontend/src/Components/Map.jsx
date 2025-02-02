import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Polygon } from "@react-google-maps/api";
import FireAlert from "./FireAlert";
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
  };

  const handleClose = () => {
    setActiveInfoWindow(null);
    onClose();
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        mapTypeId="satellite"
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
  );
};

export default MapWithMultipleFires;