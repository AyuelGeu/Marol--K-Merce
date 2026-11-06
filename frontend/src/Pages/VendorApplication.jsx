import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import './VendorApplication.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const initialApplication = {
  name: '',
  email: '',
  storeName: '',
  storeDescription: '',
  password: '',
  contactNumber: '',
  storeAddress: '',
  storeCategory: '',
  location: { type: 'Point', coordinates: [36.8219, 1.2921] }
};

export default function VendorApplication({ isModal = false, onClose }) {
  const Wrapper = isModal ? 'div' : 'main';
  const [application, setApplication] = useState(initialApplication);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isModal) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, onClose]);

  const updateApplication = (event) => {
    setApplication((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleMapClick = (event) => {
    const clickedLatLng = event.detail?.latLng;
    if (clickedLatLng) {
      setApplication((current) => ({
        ...current,
        location: {
          type: 'Point',
          coordinates: [clickedLatLng.lng, clickedLatLng.lat]
        }
      }));
    }
  };

  const submitApplication = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/vendor-application`,
        application,
        { withCredentials: true }
      );
      navigate('/otp-verification', { state: { email: response.data.email } });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to submit your application. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCoords = application.location.coordinates;
  const mapPosition = { lat: currentCoords[1], lng: currentCoords[0] };

  return (
    <Wrapper
      onClick={isModal ? (event) => {
        if (event.target === event.currentTarget) onClose?.();
      } : undefined}
      role={isModal ? 'dialog' : undefined}
      aria-modal={isModal ? 'true' : undefined}
      aria-labelledby={isModal ? 'vendor-application-title' : undefined}
      className={`vendor-application-overlay${isModal ? ' is-modal' : ''}`}
      style={{
        minHeight: isModal ? undefined : '100vh',
        display: 'grid',
        placeItems: 'center',
        boxSizing: 'border-box',
        background: isModal ? 'rgba(3, 7, 18, 0.62)' : 'linear-gradient(135deg, #EEF2FF, #F8FAFC)',
        backdropFilter: isModal ? 'blur(6px)' : undefined,
        WebkitBackdropFilter: isModal ? 'blur(6px)' : undefined,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        position: isModal ? 'fixed' : 'relative',
        inset: isModal ? 0 : undefined,
        zIndex: isModal ? 1000 : undefined,
        overflowY: isModal ? 'auto' : undefined
      }}
    >
      {isModal && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close vendor application"
          style={{
            position: 'fixed',
            top: '18px',
            right: '20px',
            zIndex: 2,
            width: '42px',
            height: '42px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '25px',
            lineHeight: 1
          }}
        >
          ×
        </button>
      )}
      <section className={`vendor-application-card${isModal ? ' is-modal' : ''}`}>
        {!isModal && (
          <Link className="vendor-application-back" to="/">
            ← Back to K-Merce
          </Link>
        )}
        <p className="vendor-application-eyebrow">
          SELL ON K-MERCE
        </p>
        <h1 id="vendor-application-title" className="vendor-application-title">
          Vendor application
        </h1>
        <p className="vendor-application-description">
          Tell us about yourself and your store. You’ll verify your email before our administrators review your application.
        </p>

        <form onSubmit={submitApplication} className="vendor-application-form">
          <label className="vendor-application-label">
            Your name
            <input
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              required
              value={application.name}
              onChange={updateApplication}
              className="vendor-application-input"
            />
          </label>
          <label className="vendor-application-label">
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={application.email}
              onChange={updateApplication}
              className="vendor-application-input"
            />
          </label>
          <label className="vendor-application-label">
            Store name
            <input
              name="storeName"
              type="text"
              maxLength={100}
              required
              value={application.storeName}
              onChange={updateApplication}
              className="vendor-application-input"
            />
          </label>
          <label className="vendor-application-label">
            Contact number
            <input
              name="contactNumber"
              type="tel"
              maxLength={20}
              required
              value={application.contactNumber}
              onChange={updateApplication}
              className="vendor-application-input"
            />
          </label>
          <label className="vendor-application-label">
            Store description — what will you sell?
            <textarea
              name="storeDescription"
              maxLength={500}
              rows={4}
              required
              value={application.storeDescription}
              onChange={updateApplication}
              className="vendor-application-input vendor-application-textarea"
            />
          </label>
          <label className="vendor-application-label vendor-application-full-width">
            Store address
            <input
              name="storeAddress"
              type="text"
              maxLength={200}
              required
              value={application.storeAddress}
              onChange={updateApplication}
              className="vendor-application-input"
            />
          </label>

          <label className="vendor-application-label vendor-application-full-width">
            Pin Store Location on Map (Click to set location)
            <div style={{ width: '100%', height: '300px', marginTop: '8px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
              {GOOGLE_MAPS_API_KEY ? (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <Map
                    defaultCenter={mapPosition}
                    defaultZoom={12}
                    onClick={handleMapClick}
                    gestureHandling="greedy"
                  >
                  <Marker position={mapPosition} />
                  </Map>
                </APIProvider>
              ) : (
                <p className="vendor-application-map-unavailable" role="status">
                  Map selection is unavailable. Please provide the store address above.
                </p>
              )}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Selected Coordinates: {currentCoords[1].toFixed(4)}, {currentCoords[0].toFixed(4)}
            </span>
          </label>

          <label className="vendor-application-label">
            Store category
            <input
              name="storeCategory"
              type="text"
              maxLength={100}
              required
              value={application.storeCategory}
              onChange={updateApplication}
              className="vendor-application-input"
            />
          </label>
          <label className="vendor-application-label vendor-application-full-width">
            Create a password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
              value={application.password}
              onChange={updateApplication}
              className="vendor-application-input"
            />
          </label>
          {error && <p role="alert" className="vendor-application-error">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="vendor-application-submit"
          >
            {isSubmitting ? 'Submitting…' : 'Submit application'}
          </button>
        </form>
      </section>
    </Wrapper>
  );
}