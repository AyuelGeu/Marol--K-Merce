import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setHasError(false);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/forgot-password`, { email });
      setMessage(response.data.message || "Reset link sent to your email.");
    } catch (error) {
      setHasError(true);
      setMessage(error.response?.data?.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '20px' }}>
      <div style={{ background: 'linear-gradient(180deg, #8D735C 0%, #4A3C35 45%, #141211 100%)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 8px 0' }}>Reset Password</h2>
        <p style={{ fontSize: '15px', color: '#D6D3D1', margin: '0 0 28px 0' }}>Enter your email to receive a reset link.</p>

        <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#E2E8F0', marginBottom: '6px' }}>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', height: '46px', paddingLeft: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          
          <button type="submit" disabled={isLoading} style={{ width: '100%', height: '48px', backgroundColor: isLoading ? '#8D735C' : '#5C4A3D', color: '#FFFFFF', fontSize: '16px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        {message && <p role="alert" style={{ marginTop: '16px', color: hasError ? '#F87171' : '#FCD34D', fontSize: '14px' }}>{message}</p>}
        <p style={{ marginTop: '24px', marginBottom: '0', fontSize: '14px', color: '#D6D3D1' }}>
          Remembered your password? <Link to="/login" style={{ color: '#FCD34D', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}