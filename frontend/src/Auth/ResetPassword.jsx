import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setMessage('');
    setIsLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/reset-password/${encodeURIComponent(token)}`, { password });
      alert("Password updated successfully!");
      navigate('/login');
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        (error.response
          ? "The reset link is invalid or has expired. Request a new one and try again."
          : "Could not reach the server. Check your connection and try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '20px' }}>
      <div style={{ background: 'linear-gradient(180deg, #8D735C 0%, #4A3C35 45%, #141211 100%)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 8px 0' }}>New Password</h2>
        
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#E2E8F0', marginBottom: '6px' }}>Secure Password</label>
            <input type="password" autoComplete="new-password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', height: '46px', paddingLeft: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#E2E8F0', marginBottom: '6px' }}>Confirm Password</label>
            <input type="password" autoComplete="new-password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', height: '46px', paddingLeft: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          
          <button type="submit" disabled={isLoading} style={{ width: '100%', height: '48px', backgroundColor: isLoading ? '#8D735C' : '#5C4A3D', color: '#FFFFFF', fontSize: '16px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        {message && <p style={{ marginTop: '16px', color: '#EF4444', fontSize: '14px' }}>{message}</p>}
      </div>
    </div>
  );
}