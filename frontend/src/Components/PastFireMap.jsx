import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Circle } from "@react-google-maps/api";

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
    id: 1,
    location: { lat: 45.47, lng: -73.50 },
    severity: "High",
  },
  {
    id: 2,
    location: { lat: 45.54, lng: -73.58 },
    severity: "Medium",
  },
];

const severityToRadius = {
  High: 5000,
  Medium: 3000,
  Low: 1000,
};

const severityToColor = {
  High: "#FF0000",
  Medium: "#FFA500",
  Low: "#FFFF00",
};

const PastFireMap = ({ selectedFire }) => {
  const [map, setMap] = useState(null);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (selectedFire && map) {
      const fire = initialFires.find((fire) => fire.id === selectedFire);
      if (fire) {
        map.panTo(fire.location);
        map.setZoom(12);
      }
    }
  }, [selectedFire, map]);

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        mapTypeId="satellite"
        onLoad={(mapInstance) => setMap(mapInstance)}
      >
        {initialFires.map((fire) => (
          <Circle
            key={fire.id}
            center={fire.location}
            radius={severityToRadius[fire.severity]}
            options={{
              fillColor: severityToColor[fire.severity],
              fillOpacity: 0.3,
              strokeColor: severityToColor[fire.severity],
              strokeOpacity: 0.7,
              strokeWeight: 1,
            }}
            onClick={() => map?.panTo(fire.location)}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default PastFireMap;
