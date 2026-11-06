import { useState } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

export default function VendorLocationPicker({ onLocationSelect }) {
  // Default center (e.g., starting coordinates)
  const [position, setPosition] = useState({ lat: 1.2921, lng: 36.8219 });

  // Handle clicking on the map to set the store pin
  const handleMapClick = (event) => {
    const clickedLatLng = event.detail?.latLng;
    if (clickedLatLng) {
      setPosition(clickedLatLng);
      
      // Send coordinates back to parent vendor registration form
      if (onLocationSelect) {
        onLocationSelect(clickedLatLng);
      }
    }
  };

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <div className="location-picker-container" style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
        Pin Your Store Location (Click on the map to set your shop's position):
      </label>
      
      <div style={{ width: '100%', height: '350px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #ddd' }}>
        {API_KEY ? (
          <APIProvider apiKey={API_KEY}>
            <Map
              defaultCenter={position}
              defaultZoom={12}
              onClick={handleMapClick}
              gestureHandling="greedy"
            >
              <Marker position={position} />
            </Map>
          </APIProvider>
        ) : (
          <p role="status" style={{ padding: '1rem', color: '#666' }}>
            Map selection is unavailable. Please enter the store address.
          </p>
        )}
      </div>
      
      <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
        📍 Selected Pin: <strong>{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</strong>
      </p>
    </div>
  );
}