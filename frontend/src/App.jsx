import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Auth/Login';
import Register from './Auth/Register';
import OtpVerification from './Auth/OtpVerification';
import './App.css'; // You can keep your existing CSS file
import LandingPage from './Pages/LandingPage'; // Import the LandingPage component
import ForgotPassword from './Auth/ForgotPassword';
import ResetPassword from './Auth/ResetPassword';
import OAuthCallback from './Auth/OAuthCallback';

//Role-Specific Dashboards
import AdminDashboard from './Pages/admin/AdminDashboard.jsx';
import VendorDashboard from './Pages/vendor/VendorDashboard.jsx';
import CustomerDashboard from './Pages/customer/CustomerDashboard.jsx';
import Marketplace from './Pages/Marketplace.jsx';

//Security Components
import ProtectedRoute from './components/ProtectedRoute';
import { getDashboardPath } from './utils/roleRoutes';

function Unauthorized() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 style={{ color: 'red', fontSize:'36px' }}>404 - Access Denied</h1>
      <p style={{ fontSize: '18px' }}>You do not have permission to view this page.</p>
      <button
        onClick={() => window.history.back()}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Go Back
      </button>
    </div>
  );
}

function RoleDashboardRedirect() {
  const token = localStorage.getItem('jwt_token');
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('user_data'));
  } catch {
    localStorage.removeItem('user_data');
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role) || '/unauthorized'} replace />;
}


function App() {
  return (
    <Router>
      <Routes>
        {/* Start visitors on the landing page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplace" element={<Marketplace />} />
        
        {/* Auth Routes */}
        <Route element={<LandingPage />} path="/Pages/LandingPage" />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

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

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<RoleDashboardRedirect />} />
        </Route>
        <Route path="*" element={<Navigate to="/unauthorized" />} />
      </Routes>
    </Router>
  );
}

export default App;