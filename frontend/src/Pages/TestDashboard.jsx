import { useNavigate } from 'react-router-dom';

export default function TestDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Later, you'll clear tokens from local storage here
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <span style={styles.badge}>Auth Flow Verified</span>
        <h1 style={styles.title}>🎉 You made it!</h1>
        <p style={styles.subtitle}>
          WELCOME TO K-MERCE! 😁🙌
        </p>

        <div style={styles.statusGrid}>
          <div style={styles.statusBox}>
            <span style={styles.statusLabel}>Session</span>
            <span style={styles.statusValue}>Active</span>
          </div>
          <div style={styles.statusBox}>
            <span style={styles.statusLabel}>Route</span>
            <span style={styles.statusValue}>Protected</span>
          </div>
        </div>

        <button onClick={handleLogout} style={{ ...styles.button, width: '80px',padding: '10px', backgroundColor: '#310606', color: 'white', borderRadius: '5px', fontWeight: 'bold' , display: 'flex', alignItems: 'center' }}>
          LOGOUT
        </button>
      </div>
    </div>
  );
}


const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
    padding: '40px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 12px',
    borderRadius: '9999px',
    marginBottom: '16px',
    letterSpacing: '0.03em',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5',
    margin: '0 0 24px 0',
  },
  statusGrid: {
    display: 'flex',
    gap: '12px',
    marginBottom: '28px',
  },
  statusBox: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: '12px',
    borderRadius: '10px',
  },
  statusLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  statusValue: {
    display: 'block',
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: '600',
    marginTop: '4px',
  },
  button: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};