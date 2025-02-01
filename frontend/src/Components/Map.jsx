import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Polygon, OverlayView } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px',
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
      { lat: 45.46, lng: -73.50 },
      { lat: 45.47, lng: -73.49 },
    ],
    severity: 'High',
  },
  {
    coordinates: [
      { lat: 45.55, lng: -73.58 },
      { lat: 45.54, lng: -73.60 },
      { lat: 45.53, lng: -73.59 },
      { lat: 45.54, lng: -73.57 },
    ],
    severity: 'Medium',
  },
];

const resources = [
  { name: 'Smoke Jumpers', total: 5, inUse: 2, cost: 5000 },
  { name: 'Fire Engines', total: 10, inUse: 8, cost: 2000 },
  { name: 'Helicopters', total: 3, inUse: 1, cost: 8000 },
  { name: 'Tanker Planes', total: 2, inUse: 1, cost: 15000 },
  { name: 'Ground Crews', total: 8, inUse: 3, cost: 3000 },
];

const polygonOptions = {
  fillColor: 'red',
  fillOpacity: 0.4,
  strokeColor: 'red',
  strokeOpacity: 0.8,
  strokeWeight: 2,
};

const getStatusColor = (available, total) => {
  const usageRate = available / total;
  if (usageRate > 0.6) return 'green';
  if (usageRate > 0.3) return 'yellow';
  return 'red';
};

const MapWithFiresAndStations = () => {
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const [map, setMap] = useState(null);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

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

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
          {initialFires.map((fire, index) => (
            <div
              key={index}
              style={{ backgroundColor: 'red', color: 'white', padding: '10px', margin: '5px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => handleAlertClick(index)}
            >
              <span style={{ marginRight: '8px' }}>⚠️</span>
              New Fire Alert #{index + 1} ({fire.severity})
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
          {resources.map((resource, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#333',
                color: 'white',
                padding: '10px',
                marginBottom: '5px',
                borderRadius: '5px',
                width: '300px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <strong>{resource.name}</strong>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <span>Total: {resource.total}</span>
                  <span>In Use: {resource.inUse}</span>
                </div>
              </div>
              <div style={{
                backgroundColor: getStatusColor(resource.total - resource.inUse, resource.total),
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                marginLeft:'5px',
              }}></div>
            </div>
          ))}
        </div>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
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
                  <div style={{ backgroundColor: 'red', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', minWidth: '220px', maxWidth: '280px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'red', padding: '5px', borderRadius: '5px' }}>
                      <strong style={{ color: 'white' }}>Fire Details</strong>
                      <button style={{ background: 'transparent', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setActiveInfoWindow(null)}>X</button>
                    </div>
                    <div style={{ padding: '5px' }}>
                      <p>Location: Zone {index + 1}</p>
                      <p>Severity: {fire.severity}</p>
                    </div>
                  </div>
                </OverlayView>
              )}
            </React.Fragment>
          ))}
        </GoogleMap>
      </div>
    </LoadScript>
  );
};

export default MapWithFiresAndStations;
