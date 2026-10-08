import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardPath } from '../utils/roleRoutes';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    axios.get(`${BACKEND_URL}/api/auth/oauth-session`, {
      withCredentials: true,
      headers: { 'ngrok-skip-browser-warning': 'true' }
    }).then(({ data }) => {
      if (!data.token || !data.staff?.role) {
        throw new Error('The sign-in provider did not return a valid account.');
      }

      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.staff));
      const destination = getDashboardPath(data.staff.role);

      if (isMounted) {
        navigate(destination || '/unauthorized', { replace: true });
      }
    }).catch((requestError) => {
      if (isMounted) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        setError(
          requestError.response?.data?.message ||
          requestError.message ||
          'Could not complete social sign-in. Please try again.'
        );
      }
    });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: '24px',
      background: '#f6f7fb',
      color: '#20283a',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      textAlign: 'center'
    }}>
      <section>
        <h1 style={{ fontSize: '24px', margin: '0 0 10px' }}>
          {error ? 'Sign-in could not be completed' : 'Completing sign-in…'}
        </h1>
        {error && (
          <>
            <p role="alert" style={{ margin: '0 0 18px', color: '#9f3d45' }}>{error}</p>
            <Link to="/login" style={{ color: '#624bd7', fontWeight: 650 }}>Return to login</Link>
          </>
        )}
      </section>
    </main>
  );
}
