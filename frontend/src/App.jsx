import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css'; // You can keep your existing CSS file

const Login = lazy(() => import('./Auth/Login'));
const Register = lazy(() => import('./Auth/Register'));
const OtpVerification = lazy(() => import('./Auth/OtpVerification'));
const LandingPage = lazy(() => import('./Pages/LandingPage'));
const ForgotPassword = lazy(() => import('./Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./Auth/ResetPassword'));
const OAuthCallback = lazy(() => import('./Auth/OAuthCallback'));
const AdminDashboard = lazy(() => import('./Pages/admin/AdminDashboard.jsx'));
const AdminPayments = lazy(() => import('./Pages/admin/AdminPayments.jsx'));
const AdminCustomers = lazy(() => import('./Pages/admin/AdminCustomers.jsx'));
const AdminVendors = lazy(() => import('./Pages/admin/AdminVendors.jsx'));
const VendorDashboard = lazy(() => import('./Pages/vendor/VendorDashboard.jsx'));
const CustomerDashboard = lazy(() => import('./Pages/customer/CustomerDashboard.jsx'));
const Marketplace = lazy(() => import('./Pages/Marketplace.jsx'));
const VendorApplication = lazy(() => import('./Pages/VendorApplication.jsx'));

//Security Components
import ProtectedRoute from './components/ProtectedRoute';
import { getDashboardPath } from './utils/roleRoutes';

const INACTIVITY_TIMEOUT_MS = 3 * 60 * 1000;

function InactivityLogout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!localStorage.getItem('jwt_token')) {
      return undefined;
    }

    let timeoutId;
    const resetTimeout = () => {
      if (!localStorage.getItem('jwt_token')) {
        return;
      }

      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (!localStorage.getItem('jwt_token')) {
          return;
        }

        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        navigate('/login', { replace: true });
      }, INACTIVITY_TIMEOUT_MS);
    };
    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'pointerdown'];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetTimeout, { passive: true });
    });
    resetTimeout();

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimeout);
      });
    };
  }, [navigate, pathname]);

  return null;
}

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
      <InactivityLogout />
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading…</div>}>
      <Routes>
        {/* Start visitors in the marketplace */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/vendor-application" element={<VendorApplication />} />
        
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
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/vendors" element={<AdminVendors />} />
        </Route>

        {/*Vendor Portal */}
        <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/products" element={<VendorDashboard />} />
          <Route path="/vendor/orders" element={<VendorDashboard />} />
        </Route>
        
        {/*Customer Portal */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/orders" element={<CustomerDashboard />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<RoleDashboardRedirect />} />
        </Route>
        <Route path="*" element={<Navigate to="/unauthorized" />} />
      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;