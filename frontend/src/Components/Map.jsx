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

const MapWithMultipleFires = ({ onFireClick, onClose, fireInfo }) => {
  const [fires, setFires] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const [simulatedDate, setSimulatedDate] = useState(new Date("2024-01-01"));
  const [map, setMap] = useState(null);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // ---------------------------------------------------------
  // Build polygons whenever fireInfo changes
  // and create new "alerts" for each fire
  // ---------------------------------------------------------
  useEffect(() => {
    // Build new polygons from the updated fireInfo
    const newFires = fireInfo.map((info, idx) => {
      // location = "lat,lng"
      const [lat, lng] = info.location.split(",").map(Number);

      // Create a small box around the location (adjust offset if desired)
      const offset = 0.01;
      const coordinates = [
        { lat: lat + offset, lng: lng + offset },
        { lat: lat + offset, lng: lng - offset },
        { lat: lat - offset, lng: lng - offset },
        { lat: lat - offset, lng: lng + offset },
      ];

      return {
        id: `${info.fire_start_time}-${idx}`, // unique
        fire_start_time: info.fire_start_time,
        severity: info.severity,
        coordinates,
      };
    });

    setFires(newFires);

    // Create alerts for each new fire
    // If you only wanted "brand new" fires, you'd compare with old state
    const newAlerts = newFires.map((fire, idx) => ({
      id: fire.id,
      text: `New Fire #${idx + 1} - Severity: ${fire.severity}`,
      visible: true,
    }));

    setAlerts(newAlerts);
  }, [fireInfo]);

  // ---------------------------------------------------------
  // Fade out each alert individually after 5 seconds
  // ---------------------------------------------------------
  useEffect(() => {
    const timers = alerts.map((alert) => {
      if (alert.visible) {
        return setTimeout(() => {
          setAlerts((prev) =>
            prev.map((a) =>
              a.id === alert.id ? { ...a, visible: false } : a
            )
          );
        }, 5000);
      }
      return null;
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [alerts]);

  // ---------------------------------------------------------
  // Randomly move polygons every 1s + increment simulated date
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
      // Advance date by 3 days each second
      setSimulatedDate((prevDate) => new Date(prevDate.getTime() + 3 * 24 * 60 * 60 * 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ---------------------------------------------------------
  // Helper: centroid of a polygon
  // ---------------------------------------------------------
  const calculateCentroid = (polygon) => {
    const lat = polygon.reduce((sum, p) => sum + p.lat, 0) / polygon.length;
    const lng = polygon.reduce((sum, p) => sum + p.lng, 0) / polygon.length;
    return { lat, lng };
  };

  // ---------------------------------------------------------
  // On polygon click => show overlay, filter resources
  // ---------------------------------------------------------
  const handleAlertClick = (fireIndex) => {
    setActiveInfoWindow(fireIndex);
    onFireClick(fires[fireIndex].severity);

    // Center the map on this polygon’s centroid
    const centroid = calculateCentroid(fires[fireIndex].coordinates);
    if (map) {
      map.panTo(centroid);
    }
  };

  // ---------------------------------------------------------
  // Close overlay
  // ---------------------------------------------------------
  const handleCloseOverlay = () => {
    setActiveInfoWindow(null);
    onClose();
  };

  // ---------------------------------------------------------
  // Keep center/zoom in localStorage
  // ---------------------------------------------------------
  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);

    // If we have saved center/zoom, apply them
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
      const center = map.getCenter();
      if (center) {
        const position = {
          lat: center.lat(),
          lng: center.lng(),
        };
        localStorage.setItem("mapCenter", JSON.stringify(position));
      }
    }
  };

  const handleZoomChanged = () => {
    if (map) {
      const newZoom = map.getZoom();
      localStorage.setItem("mapZoom", newZoom);
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
                onClick={() => handleAlertClick(index)}
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

      {/* Top-right alerts (fade individually after 5s) */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
        }}
      >
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
                opacity: alert.visible ? 1 : 0,
                transition: "opacity 0.5s",
              }}
              onClick={() => handleAlertClick(idx)}
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
