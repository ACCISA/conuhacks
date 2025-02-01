import React from 'react';
import { GoogleMap, LoadScript, Polygon } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const center = {
  lat: 37.7749,
  lng: -122.4194,
};


const dataPoints = [
  { lat: 37.78, lng: -122.41 },
  { lat: 37.77, lng: -122.43 },
  { lat: 37.76, lng: -122.42 },
  { lat: 37.77, lng: -122.40 },
  { lat: 38.77, lng: -122.40 },
];


const polygonOptions = {
  fillColor: 'red',
  fillOpacity: 0.4,
  strokeColor: 'red',
  strokeOpacity: 0.8,
  strokeWeight: 2,
};

const MapWithPolygon = () => (
  <LoadScript googleMapsApiKey="AIzaSyAohCmfIN5EjN-jBmkR8LmeDVZUrm4uDms">
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
      <Polygon paths={dataPoints} options={polygonOptions} />
    </GoogleMap>
  </LoadScript>
);

export default MapWithPolygon;
