import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Auth/Login';
import Register from './Auth/Register';
import OtpVerification from './Auth/OtpVerification';
import TestDashboard from './Pages/TestDashboard';
import './App.css'; // You can keep your existing CSS file
import LandingPage from './Pages/LandingPage'; // Import the LandingPage component

//Role-Specific Dashboards
import AdminDashboard from './Pages/admin/Dashboard';
import VendorDashboard from './Pages/vendor/Dashboard';
import CustomerDashboard from './Pages/customer/Dashboard';

//Security Components
import ProtectedRoute from './compoments/ProtectedRoute';

function Unauthorized() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 style={{ color: 'red', fontSize:'36px' }}>404 - Access Denied</h1>
      <p style={{ fontSize: '18px' }}>You do not have permission to view this page.</p>
      <button>
        onClick={() => window.history.back()}
         style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        Go Back
      </button>
    </div>
  );
}


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
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/*Admin Portal formerly TestDashboard */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/*Vendor Portal */}
        <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        </Route>
        
        {/*Customer Portal */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        </Route>

        {/* Fallback for the old dashboard path */}
        <Route path="/dashboard" element={<TestDashboard />} />

        {/* 404 Route */}
        <Route path="/dashboard" element={<Navigate to="/unauthorized" />} />
        <Route path="*" element={<Navigate to="/unauthorized" />} />
      </Routes>
    </Router>
  );
}

export default App;