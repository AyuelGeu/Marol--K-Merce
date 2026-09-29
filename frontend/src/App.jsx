import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Auth/Login';
import Register from './Auth/Register';
import OtpVerification from './Auth/OtpVerification';
import TestDashboard from './Pages/TestDashboard';
import './App.css'; // You can keep your existing CSS file
import LandingPage from './Pages/LandingPage'; // Import the LandingPage component

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to Landing */}
        <Route path="/" element={<Navigate to="/Pages/LandingPage"/>} />
        
        {/* Auth Routes */}
        <Route element={<LandingPage />} path="/Pages/LandingPage" />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        {/* Protected/Test Page Route */}
        <Route path="/dashboard" element={<TestDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;