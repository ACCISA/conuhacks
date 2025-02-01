import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Polygon, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const center = {
  lat: 45.5019,
  lng: -73.5674,
};

const initialFires = [
  [
    { lat: 45.48, lng: -73.51 },
    { lat: 45.47, lng: -73.52 },
    { lat: 45.46, lng: -73.50 },
    { lat: 45.47, lng: -73.49 },
  ],
  [
    { lat: 45.55, lng: -73.58 },
    { lat: 45.54, lng: -73.60 },
    { lat: 45.53, lng: -73.59 },
    { lat: 45.54, lng: -73.57 },
  ],
];

const polygonOptions = {
  fillColor: 'red',
  fillOpacity: 0.4,
  strokeColor: 'red',
  strokeOpacity: 0.8,
  strokeWeight: 2,
};

const GROWTH_RATE = 0.0005;

const MapWithFiresAndStations = () => {
  const [fires, setFires] = useState(initialFires);
  const [fireStations, setFireStations] = useState([]);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const interval = setInterval(() => {
      setFires((prevFires) =>
        prevFires.map((fire) =>
          fire.map((point) => ({
            lat: point.lat + (Math.random() > 0.5 ? GROWTH_RATE : -GROWTH_RATE),
            lng: point.lng + (Math.random() > 0.5 ? GROWTH_RATE : -GROWTH_RATE),
          }))
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadFireStations = (map) => {
    if (window.google && window.google.maps && window.google.maps.places) {
      const service = new window.google.maps.places.PlacesService(map);

      const request = {
        location: center,
        radius: '10000', 
        keyword: 'fire station',
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setFireStations(results);
        }
      });
    } else {
      console.error('Google Places API not loaded.');
    }
  };

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={['places']}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={loadFireStations}
      >
        {fires.map((fire, index) => (
          <Polygon key={index} paths={fire} options={polygonOptions} />
        ))}

        {fireStations.map((station, index) => (
          <Marker
            key={index}
            position={station.geometry.location}
            icon={{
              url: 'fireStation.png',
              scaledSize: new window.google.maps.Size(30, 30),
            }}
            title={station.name}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapWithFiresAndStations;
