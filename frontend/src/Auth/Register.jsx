import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/otp-verification', { state: { email: email } }); 
      } else {
        alert(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to connect to server:", error);
      alert("Could not connect to the server. Make sure your Node backend is running!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#F9FAFB', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '40px', width: '100%',
        maxWidth: '440px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6', textAlign: 'center', boxSizing: 'border-box'
      }}>
        
        <div style={{
          width: '48px', height: '48px', backgroundColor: '#EFF6FF', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#2563EB'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.025em' }}>Create an Account</h2>
        <p style={{ fontSize: '15px', color: '#6B7280', margin: '0 0 28px 0' }}>Join us today to get started.</p>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required 
                style={{ width: '100%', height: '46px', paddingLeft: '14px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Secure Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required 
                style={{ width: '100%', height: '46px', paddingLeft: '14px', paddingRight: '42px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                 👁️
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={isLoading} style={{ width: '100%', height: '48px', backgroundColor: isLoading ? '#93C5FD' : '#2563EB', color: '#FFFFFF', fontSize: '16px', fontWeight: '600', border: 'none', borderRadius: '10px', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '24px', marginBottom: '0', fontSize: '14px', color: '#6B7280' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}