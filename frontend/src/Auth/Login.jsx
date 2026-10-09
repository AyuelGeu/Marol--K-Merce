import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getDashboardPath } from '../utils/roleRoutes';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function Login({ isModal = false, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isModal) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, onClose]);

  const handleLogin = async (e) => {
    e.preventDefault();
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email,
        password,
      }, {
        withCredentials: true,
        // NEW: This header tells Ngrok to skip the HTML warning page and let the request through to your Node server.
        headers: {
          'ngrok-skip-browser-warning': 'true' 
        }
      });

      const data = response.data;

      // Checks if the server provided a JWT in the response data.
      if (data.token) {
        // Saves the JWT into the browser's localStorage. This establishes the second security layer.
        localStorage.setItem('jwt_token', data.token);
      }

      if (data.staff) {
        localStorage.setItem('user_data', JSON.stringify(data.staff));
      }

      if (data.requiresOTP) {
        navigate('/otp-verification', { state: { email: email } });
      } else if (data.token && data.staff?.role) {
        navigate(getDashboardPath(data.staff.role) || '/unauthorized', { replace: true });
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response) {
        // Server returned 4xx or 5xx status code
        alert(`Login failed: ${error.response.data?.message || error.response.data?.error || 'Invalid credentials'}`);
      } else {
        alert("Could not connect to the server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={isModal ? (event) => {
        if (event.target === event.currentTarget) onClose?.();
      } : undefined}
      style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isModal ? 'rgba(3, 7, 18, 0.62)' : '#090d16',
      backgroundImage: isModal ? 'none' : 'radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(217, 70, 239, 0.15) 0%, transparent 40%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '20px',
      position: isModal ? 'fixed' : 'relative',
      inset: isModal ? 0 : undefined,
      zIndex: isModal ? 1000 : undefined,
      overflow: isModal ? 'auto' : 'hidden',
      backdropFilter: isModal ? 'blur(3px)' : undefined,
      boxSizing: 'border-box'
    }}>
      <style>{`
        @keyframes floatGlow {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(30px, -20px) scale(1.1); opacity: 0.8; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .flashy-card {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .flashy-input {
          background-color: rgba(15, 23, 42, 0.6) !important;
          color: #f8fafc !important;
          transition: all 0.3s ease !important;
        }
        .flashy-input::placeholder {
          color: #64748b;
        }
        .flashy-input:focus {
          border-color: #818cf8 !important;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.25), 0 0 20px rgba(99, 102, 241, 0.2) !important;
        }
        .flashy-btn-primary {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #d946ef 100%);
          background-size: 200% 200%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .flashy-btn-primary:hover:not(:disabled) {
          background-position: 100% 0;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.5), 0 0 15px rgba(217, 70, 239, 0.4);
        }
        .flashy-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .social-btn {
          transition: all 0.25s ease !important;
        }
        .social-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          filter: brightness(1.1);
        }
        .social-btn-google {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          color: #f3f4f6 !important;
        }
        .social-btn-google:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        .signup-link {
          transition: all 0.2s ease;
        }
        .signup-link:hover {
          color: #a7f3d0 !important;
          text-shadow: 0 0 10px rgba(167, 243, 208, 0.5);
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 0.8s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }
      `}</style>

      {/* Background Animated Glowing Orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '20%', width: '300px', height: '300px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(0,0,0,0) 70%)',
        animation: 'floatGlow 8s ease-in-out infinite', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '20%', width: '350px', height: '350px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,70,239,0.2) 0%, rgba(0,0,0,0) 70%)',
        animation: 'floatGlow 10s ease-in-out infinite reverse', pointerEvents: 'none'
      }} />
      {isModal && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login"
          style={{
            position: 'fixed',
            top: '18px',
            right: '20px',
            zIndex: 2,
            width: '42px',
            height: '42px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '25px',
            lineHeight: 1
          }}
        >
          ×
        </button>
      )}

      {/* Main Glassmorphic Form Card */}
      <div className="flashy-card" style={{
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        borderRadius: '28px',
        padding: '44px 40px',
        width: '100%',
        maxWidth: '440px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        boxSizing: 'border-box',
        zIndex: 1,
        maxHeight: isModal ? 'calc(100vh - 40px)' : undefined,
        overflowY: isModal ? 'auto' : undefined
      }}>
        
        {/* Animated Icon Header */}
        <div style={{
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(217, 70, 239, 0.2) 100%)',
          border: '1px solid rgba(129, 140, 248, 0.3)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          margin: '0 auto 20px auto',
          color: '#818cf8',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>

        <h2 style={{
          fontSize: '30px',
          fontWeight: '800',
          color: '#ffffff',
          margin: '0 0 8px 0',
          letterSpacing: '-0.03em',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>Welcome Back</h2>
        
        <p style={{ fontSize: '15px', color: '#94a3b8', margin: '0 0 28px 0' }}>Please enter your credentials to sign in.</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="flashy-input" 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{
                  width: '100%',
                  height: '48px',
                  paddingLeft: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="flashy-input" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{
                  width: '100%',
                  height: '48px',
                  paddingLeft: '16px',
                  paddingRight: '46px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: '4px',
                  borderRadius: '6px',
                  transition: 'color 0.2s'
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '10px' }}>
            <Link to="/forgot-password" style={{ color: '#FCD34D', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="flashy-btn-primary"
            style={{
              width: '100%',
              height: '50px',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              opacity: isLoading ? 0.7 : 1,
              letterSpacing: '0.01em'
            }}
          >
            {isLoading && <span className="spinner"></span>}
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
            <span style={{ padding: '0 12px', color: '#64748b', fontSize: '13px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
          </div>

          <a href={`${BACKEND_URL}/auth/google`} 
            className="social-btn social-btn-google"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '48px',
              borderRadius: '12px',
              fontSize: '15px', fontWeight: '600', textDecoration: 'none', cursor: 'pointer',
              marginBottom: '12px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxSizing: 'border-box'
            }}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', marginRight: '10px' }} />
            Continue with Google
          </a>

          <a href={`${BACKEND_URL}/auth/facebook`} 
            className="social-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '48px', backgroundColor: '#1877F2',
              color: '#FFFFFF', border: 'none', borderRadius: '12px',
              fontSize: '15px', fontWeight: '600', textDecoration: 'none', cursor: 'pointer',
              marginBottom: '12px',
              boxSizing: 'border-box'
            }}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '10px' }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continue with Facebook
          </a>

          <a href={`${BACKEND_URL}/auth/tiktok`}
            className="social-btn"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '48px', backgroundColor: '#000000',
              color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px',
              fontSize: '15px', fontWeight: '600', textDecoration: 'none', cursor: 'pointer',
              boxSizing: 'border-box'
            }}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ marginRight: '10px' }}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.42-5.46.02-3.33 2.87-5.96 6.18-5.83.17 0 .33.02.5.04v4.06c-.84-.11-1.74-.01-2.48.46-.8.47-1.35 1.25-1.42 2.18-.08 1.2.66 2.45 1.82 2.9 1.15.42 2.52.26 3.46-.48.96-.75 1.48-1.93 1.48-3.15.01-4.73 0-9.45.02-14.18z"/></svg>
            Continue with TikTok
          </a>
        </div>
        
        <p style={{ marginTop: '28px', marginBottom: '0', fontSize: '14px', color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register" className="signup-link" style={{ color: '#818cf8', fontWeight: '700', textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}