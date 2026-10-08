// src/components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate, Outlet } from 'react-router-dom';
import { getDashboardPath } from '../utils/roleRoutes';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('jwt_token');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      return undefined;
    }

    axios.get(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      withCredentials: true
    }).then((response) => {
      if (isMounted) {
        setUser(response.data);
        localStorage.setItem('user_data', JSON.stringify(response.data));
      }
    }).catch(() => {
      if (isMounted) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        setHasError(true);
      }
    }).finally(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <div className="role-route-loading" role="status">Verifying your account…</div>;
  }

  if (hasError || !user || !getDashboardPath(user.role)) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
}