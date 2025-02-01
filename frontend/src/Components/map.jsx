import React from 'react';
import { GoogleMap, LoadScript, Polygon } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const center = {
  lat: 45.5019,
  lng: -73.5674,
};


const fires = [
  [
    { lat: 45.48, lng: -73.51 },
    { lat: 45.47, lng: -73.52 },
    { lat: 45.46, lng: -73.50 },
    { lat: 45.47, lng: -73.49 },
    { lat: 45.57, lng: -73.39 },
  ],
  [
    { lat: 45.55, lng: -73.58 },
    { lat: 45.54, lng: -73.60 },
    { lat: 45.53, lng: -73.59 },
    { lat: 45.54, lng: -73.57 },
    { lat: 45.44, lng: -73.67 },
  ],
  [
    { lat: 45.50, lng: -73.55 },
    { lat: 45.49, lng: -73.56 },
    { lat: 45.48, lng: -73.54 },
    { lat: 45.49, lng: -73.53 },
  ],
];

const polygonOptions = {
  fillColor: 'red',
  fillOpacity: 0.4,
  strokeColor: 'red',
  strokeOpacity: 0.8,
  strokeWeight: 2,
};

const MapWithMultipleFires = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {fires.map((fire, index) => (
          <Polygon key={index} paths={fire} options={polygonOptions} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapWithMultipleFires;
