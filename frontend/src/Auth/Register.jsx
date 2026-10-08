import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function Register() {
  const [name, setName] = useState('');
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
      await axios.post(`${BACKEND_URL}/api/auth/register`, {
        name,
        email,
        password,
      }, {
        withCredentials: true 
      });

      navigate('/otp-verification', { state: { email: email } }); 
    } catch (error) {
      console.error("Failed to connect to server:", error);
      if (error.response) {
        alert(`Registration failed: ${error.response.data?.message || error.response.data?.error || 'Registration failed'}`);
      } else {
        alert("Could not connect to the server. Make sure your Node backend is running!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#020617', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #8D735C 0%, #4A3C35 45%, #141211 100%)', 
        borderRadius: '24px', padding: '40px', width: '100%',
        maxWidth: '440px', boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center', boxSizing: 'border-box'
      }}>
        
        <div style={{
          width: '48px', height: '48px', backgroundColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#FCD34D',
          backdropFilter: 'blur(8px)'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 8px 0', letterSpacing: '-0.025em' }}>Create an Account</h2>
        <p style={{ fontSize: '15px', color: '#D6D3D1', margin: '0 0 28px 0' }}>Join us today to get started.</p>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#E2E8F0', marginBottom: '6px' }}>Full Name</label>
            <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required 
              style={{ width: '100%', height: '46px', paddingLeft: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#E2E8F0', marginBottom: '6px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required 
                style={{ width: '100%', height: '46px', paddingLeft: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#E2E8F0', marginBottom: '6px' }}>Secure Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required 
                style={{ width: '100%', height: '46px', paddingLeft: '14px', paddingRight: '42px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A8A29E', cursor: 'pointer', display: 'flex' }}>
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#D6D3D1', marginBottom: '4px' }}>
                  <span>Password strength:</span>
                  <span style={{ color: strength.color, fontWeight: '600' }}>{strength.label}</span>
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: strength.width, height: '100%', backgroundColor: strength.color, transition: 'all 0.3s ease' }}></div>
                </div>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#E2E8F0', marginBottom: '6px' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required 
                style={{ width: '100%', height: '46px', paddingLeft: '14px', paddingRight: '42px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#FFFFFF', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A8A29E', cursor: 'pointer', display: 'flex' }}>
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={isLoading} style={{ width: '100%', height: '48px', backgroundColor: isLoading ? '#8D735C' : '#5C4A3D', color: '#FFFFFF', fontSize: '16px', fontWeight: '600', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }}></div>
            <span style={{ padding: '0 10px', color: '#D6D3D1', fontSize: '14px' }}>Or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }}></div>
          </div>

          <a href={`${BACKEND_URL}/auth/google`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '48px', backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)', color: '#FFFFFF', borderRadius: '10px',
              fontSize: '16px', fontWeight: '600', textDecoration: 'none', cursor: 'pointer',
              marginBottom: '10px', backdropFilter: 'blur(4px)'
            }}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', marginRight: '10px' }} />
            Continue with Google
          </a>
        </div>

        <p style={{ marginTop: '24px', marginBottom: '0', fontSize: '14px', color: '#D6D3D1' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#FCD34D', fontWeight: '600', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}