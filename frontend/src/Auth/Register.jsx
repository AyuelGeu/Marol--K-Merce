import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return { label: '', color: 'transparent', width: '0%' };
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { label: 'Weak', color: '#EF4444', width: '33.33%' };
    if (score <= 4) return { label: 'Fair', color: '#F59E0B', width: '66.66%' };
    return { label: 'Strong', color: '#10B981', width: '100%' };
  };

  const strength = calculateStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
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
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex' }}>
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                  <span>Password strength:</span>
                  <span style={{ color: strength.color, fontWeight: '600' }}>{strength.label}</span>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: strength.width, height: '100%', backgroundColor: strength.color, transition: 'all 0.3s ease' }}></div>
                </div>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required 
                style={{ width: '100%', height: '46px', paddingLeft: '14px', paddingRight: '42px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex' }}>
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={isLoading} style={{ width: '100%', height: '48px', backgroundColor: isLoading ? '#93C5FD' : '#2563EB', color: '#FFFFFF', fontSize: '16px', fontWeight: '600', border: 'none', borderRadius: '10px', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
            <span style={{ padding: '0 10px', color: '#6B7280', fontSize: '14px' }}>Or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
          </div>

          <a href={`${BACKEND_URL}/auth/google`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '48px', backgroundColor: '#FFFFFF',
              color: '#374151', border: '1px solid #D1D5DB', borderRadius: '10px',
              fontSize: '16px', fontWeight: '600', textDecoration: 'none', cursor: 'pointer',
              marginBottom: '10px'
            }}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', marginRight: '10px' }} />
            Continue with Google
          </a>

          <a href={`${BACKEND_URL}/auth/facebook`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '48px', backgroundColor: '#1877F2',
              color: '#FFFFFF', border: 'none', borderRadius: '10px',
              fontSize: '16px', fontWeight: '600', textDecoration: 'none', cursor: 'pointer',
              marginBottom: '10px'
            }}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '10px' }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continue with Facebook
          </a>

          <a href={`${BACKEND_URL}/auth/tiktok`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '48px', backgroundColor: '#000000',
              color: '#FFFFFF', border: 'none', borderRadius: '10px',
              fontSize: '16px', fontWeight: '600', textDecoration: 'none', cursor: 'pointer'
            }}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '10px' }}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.42-5.46.02-3.33 2.87-5.96 6.18-5.83.17 0 .33.02.5.04v4.06c-.84-.11-1.74-.01-2.48.46-.8.47-1.35 1.25-1.42 2.18-.08 1.2.66 2.45 1.82 2.9 1.15.42 2.52.26 3.46-.48.96-.75 1.48-1.93 1.48-3.15.01-4.73 0-9.45.02-14.18z"/></svg>
            Continue with TikTok
          </a>
        </div>

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