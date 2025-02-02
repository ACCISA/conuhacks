import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Polygon } from "@react-google-maps/api";
import FireDetailsOverlay from "./FireDetailsOverlay";

const containerStyle = {
  width: "100%",
  height: "600px",
};

// Default center if none is saved in localStorage
const defaultCenter = {
  lat: 45.5019,
  lng: -73.5674,
};

// Polygon appearance
const polygonOptions = {
  fillColor: "red",
  fillOpacity: 0.4,
  strokeColor: "red",
  strokeOpacity: 0.8,
  strokeWeight: 2,
};

const MapWithMultipleFires = ({ fireInfo, onFireSelected }) => {
  const [fires, setFires] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const [simulatedDate, setSimulatedDate] = useState(new Date("2024-01-01"));
  const [map, setMap] = useState(null);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // ---------------------------------------------------------
  // Build polygons whenever fireInfo changes
  // ---------------------------------------------------------
  useEffect(() => {
    const newFires = fireInfo.map((info, idx) => {
      const [lat, lng] = info.location.split(",").map(Number);

      // Create a small box polygon
      const offset = 0.01;
      const coordinates = [
        { lat: lat + offset, lng: lng + offset },
        { lat: lat + offset, lng: lng - offset },
        { lat: lat - offset, lng: lng - offset },
        { lat: lat - offset, lng: lng + offset },
      ];

      return {
        ...info,
        id: `${info.fire_start_time}-${idx}`,
        lat,
        lng,
        coordinates,
      };
    });

    setFires(newFires);

    // Create top-right alerts
    const newAlerts = newFires.map((fire, index) => ({
      id: fire.id,
      text: `New Fire #${index + 1} - Severity: ${fire.severity}`,
      visible: true,
    }));
    setAlerts(newAlerts);
  }, [fireInfo]);

  // ---------------------------------------------------------
  // Fade out each alert individually after 5s
  // ---------------------------------------------------------
  useEffect(() => {
    const timers = alerts.map((alert) => {
      if (alert.visible) {
        return setTimeout(() => {
          setAlerts((prev) =>
            prev.map((a) => (a.id === alert.id ? { ...a, visible: false } : a))
          );
        }, 5000);
      }
      return null;
    });

    return () => {
      timers.forEach((t) => t && clearTimeout(t));
    };
  }, [alerts]);

  // ---------------------------------------------------------
  // Randomly move polygons + advance date (optional)
  // ---------------------------------------------------------
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
      setSimulatedDate((prev) => new Date(prev.getTime() + 1 * 24 * 60 * 60 * 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ---------------------------------------------------------
  // Helper: compute centroid
  // ---------------------------------------------------------
  const calculateCentroid = (polygon) => {
    const lat = polygon.reduce((sum, p) => sum + p.lat, 0) / polygon.length;
    const lng = polygon.reduce((sum, p) => sum + p.lng, 0) / polygon.length;
    return { lat, lng };
  };

  // ---------------------------------------------------------
  // Clicking a polygon or alert => show overlay, notify parent
  // ---------------------------------------------------------
  const handleFireClick = (index) => {
    setActiveInfoWindow(index);
    onFireSelected(fires[index]); // pass entire object to Dashboard

    // Center the map on this polygon’s centroid
    const centroid = calculateCentroid(fires[index].coordinates);
    if (map) {
      map.panTo(centroid);
    }
  };

  // ---------------------------------------------------------
  // Overlay close => clear info window, reset selection
  // ---------------------------------------------------------
  const handleCloseOverlay = () => {
    setActiveInfoWindow(null);
    onFireSelected(null);
  };

  // ---------------------------------------------------------
  // Keep center/zoom in localStorage
  // ---------------------------------------------------------
  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
    const savedCenter = localStorage.getItem("mapCenter");
    const savedZoom = localStorage.getItem("mapZoom");
    if (savedCenter && savedZoom) {
      const { lat, lng } = JSON.parse(savedCenter);
      mapInstance.setCenter({ lat, lng });
      mapInstance.setZoom(Number(savedZoom));
    }
  };

  const handleCenterChanged = () => {
    if (map) {
      const c = map.getCenter();
      if (c) {
        localStorage.setItem("mapCenter", JSON.stringify({ lat: c.lat(), lng: c.lng() }));
      }
    }
  };

  const handleZoomChanged = () => {
    if (map) {
      localStorage.setItem("mapZoom", map.getZoom());
    }
  };

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------
  return (
    <div className="relative">
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={12}
          mapTypeId="satellite"
          onLoad={handleMapLoad}
          onCenterChanged={handleCenterChanged}
          onZoomChanged={handleZoomChanged}
        >
          {fires.map((fire, index) => (
            <React.Fragment key={fire.id}>
              <Polygon
                paths={fire.coordinates}
                options={polygonOptions}
                onClick={() => handleFireClick(index)}
              />
              {activeInfoWindow === index && (
                <FireDetailsOverlay
                  fire={fire}
                  onClose={handleCloseOverlay}
                  centroid={calculateCentroid(fire.coordinates)}
                />
              )}
            </React.Fragment>
          ))}
        </GoogleMap>
      </LoadScript>

      {/* Top-right alerts: fade out after 5s individually */}
      <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
        {alerts.map((alert, idx) =>
          alert.visible ? (
            <div
              key={alert.id}
              style={{
                backgroundColor: "red",
                color: "white",
                marginBottom: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => handleFireClick(idx)}
            >
              {alert.text}
            </div>
          ) : null
        )}
      </div>

      {/* Simulated date display */}
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
