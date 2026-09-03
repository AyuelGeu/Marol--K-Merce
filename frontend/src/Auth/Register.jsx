import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (confirmPassword && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! You can now log in.");
        navigate('/login'); 
      } else {
        alert(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to connect to server:", error);
      alert("Could not connect to the server. Make sure your Node backend is running!");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ff3b8d 0%, #ff6c6c 35%, #ffd255 68%, #52e066 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <style>{`
        .gradient-btn {
          transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease;
        }
        .gradient-btn:hover {
          opacity: 0.93;
          transform: translateY(-1px);
        }
        .gradient-btn:active {
          transform: translateY(0);
        }
        .input-field {
          transition: box-shadow 0.2s ease, opacity 0.2s ease;
        }
        .input-field:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4);
        }
      `}</style>

      {/* Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '470px',
        backgroundColor: '#f3fbf7',
        borderRadius: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.18)',
        padding: '44px 36px',
        boxSizing: 'border-box'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '26px',
            fontWeight: '700',
            color: '#18181b',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em'
          }}>
            Create an Account
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#71717a',
            margin: 0
          }}>
            Join us today to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Full Name Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#27272a' }}>Full Name</label>
            <input 
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #ff4081',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                color: '#18181b'
              }}
            />
          </div>

          {/* Email Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#27272a' }}>Email Address</label>
            <input 
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #f97316',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                color: '#18181b'
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#27272a' }}>Password</label>
            <input 
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #facc15',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                color: '#18181b'
              }}
            />
          </div>

          {/* Confirm Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#27272a' }}>Confirm Password</label>
            <input 
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #4ade80',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                color: '#18181b'
              }}
            />
          </div>

          {/* Sign Up Button */}
          <button 
            type="submit"
            className="gradient-btn"
            style={{
              marginTop: '10px',
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(90deg, #ff4081 0%, #ffab40 100%)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 8px 18px rgba(255, 64, 129, 0.3)'
            }}
          >
            Sign Up
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '22px 0',
          gap: '12px'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
          <span style={{ fontSize: '13px', color: '#9ca3af' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
        </div>

        {/* Social Logins */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Sign up with Google */}
          <button 
            type="button"
            className="gradient-btn"
            style={{
              width: '100%',
              padding: '12px',
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(90deg, #ff4081 0%, #ffab40 100%)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
            Sign up with Google
          </button>

          {/* Sign up with Apple */}
          <button 
            type="button"
            className="gradient-btn"
            style={{
              width: '100%',
              padding: '12px',
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(90deg, #22c55e 0%, #ff4081 100%)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.01c.66-.82 1.12-1.96.99-3.11-.97.04-2.17.65-2.85 1.45-.61.71-1.15 1.88-1.01 3 1.09.08 2.22-.52 2.87-1.34z" />
            </svg>
            Sign up with Apple
          </button>
        </div>

        {/* Footer Link */}
        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280',
          margin: '28px 0 0 0'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}