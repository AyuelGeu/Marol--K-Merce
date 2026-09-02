import { useState } from 'react'; //[cite: 1]
import { useNavigate, Link } from 'react-router-dom'; //[cite: 1]

export default function Login() {
  const [email, setEmail] = useState(''); //[cite: 1]
  const [password, setPassword] = useState(''); //[cite: 1]
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate(); //[cite: 1]

  const handleLogin = async (e) => { //[cite: 1]
    e.preventDefault(); //[cite: 1]
    
    try { //[cite: 1]
      const response = await fetch('http://localhost:5000/api/auth/login', { //[cite: 1]
        method: 'POST', //[cite: 1]
        headers: { //[cite: 1]
          'Content-Type': 'application/json', //[cite: 1]
        }, //[cite: 1]
        body: JSON.stringify({ email, password }), //[cite: 1]
      }); //[cite: 1]

      const data = await response.json(); //[cite: 1]

      if (response.ok) { //[cite: 1]
        alert("Login successful!"); //[cite: 1]
        navigate('/dashboard'); //[cite: 1]
      } else { //[cite: 1]
        alert(`Login failed: ${data.message}`); //[cite: 1]
      } //[cite: 1]
    } catch (error) { //[cite: 1]
      console.error("Failed to connect to server:", error); //[cite: 1]
      alert("Could not connect to the server. Make sure your Node backend is running!"); //[cite: 1]
    } //[cite: 1]
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'radial-gradient(circle at 15% 30%, rgba(224, 231, 255, 0.5) 0%, transparent 40%), radial-gradient(circle at 85% 60%, rgba(253, 232, 243, 0.4) 0%, transparent 40%), #fafafa'
    }}>
      <style>
        {`
          .breeze-input:focus {
            border-color: #635bff !important;
            outline: none;
          }
          .breeze-btn:hover {
            opacity: 0.9;
          }
        `}
      </style>

      {/* Header Navigation */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: '#635bff', borderRadius: '10px' }}>
          {/* Logo Tree Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22v-8"></path>
            <path d="M12 14a4 4 0 0 0-4-4 4 4 0 1 1 8 0 4 4 0 0 0-4 4z"></path>
          </svg>
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '16px' }}>
          New to K-Merce? 
          <Link to="/register" style={{ textDecoration: 'none' }}> {/*[cite: 1] */}
            <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #c7d2fe', backgroundColor: 'transparent', color: '#635bff', fontWeight: '500', cursor: 'pointer' }}>
              Create account
            </button>
          </Link>
        </div>
      </header>

      {/* Main Card Container */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '48px', width: '100%', maxWidth: '420px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>Welcome back!</h1>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}> {/*[cite: 1] */}
            
            {/* Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Email address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <svg style={{ position: 'absolute', left: '14px', color: '#9ca3af' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input 
                  type="email" 
                  className="breeze-input"
                  placeholder="johndoe@gmail.com" 
                  value={email} //[cite: 1]
                  onChange={(e) => setEmail(e.target.value)} //[cite: 1]
                  required //[cite: 1]
                  style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <svg style={{ position: 'absolute', left: '14px', color: '#9ca3af' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="breeze-input"
                  placeholder="shh_super_secret" 
                  value={password} //[cite: 1]
                  onChange={(e) => setPassword(e.target.value)} //[cite: 1]
                  required //[cite: 1]
                  style={{ width: '100%', padding: '12px 42px 12px 42px', borderRadius: '10px', border: password ? '1px solid #635bff' : '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box', transition: 'border-color 0.2s', backgroundColor: password ? '#f8f9ff' : 'white' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                <div onClick={() => setRememberMe(!rememberMe)} style={{ width: '36px', height: '20px', borderRadius: '12px', backgroundColor: rememberMe ? '#635bff' : '#d1d5db', position: 'relative', transition: 'background-color 0.2s' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '2px', left: rememberMe ? '18px' : '2px', transition: 'left 0.2s' }} />
                </div>
                Remember me
              </label>
              <a href="#" style={{ color: '#635bff', fontSize: '13px', fontWeight: '500', textDecoration: 'none' }}>Forgot password?</a>
            </div>

            {/* Submit Button */}
            <button type="submit" className="breeze-btn" style={{ width: '100%', padding: '14px', marginTop: '8px', backgroundColor: '#635bff', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s' }}>
              Sign In to K-Merce
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '32px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#f3f4f6' }}></div>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>or continue with</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#f3f4f6' }}></div>
          </div>

          {/* Social Logins */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button type="button" style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button type="button" style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.05 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.62 1.6-1.58 3.12-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', padding: '30px 40px', fontSize: '12px', color: '#9ca3af' }}>
        <div>© 2025 K-Merce Inc. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}