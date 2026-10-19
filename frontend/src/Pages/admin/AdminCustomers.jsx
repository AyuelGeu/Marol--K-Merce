import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function getInitials(name, email) {
  const label = name && name !== 'New User' ? name : email || 'User';
  return label
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchCustomers = useCallback(async () => {
    const token = localStorage.getItem('jwt_token');
    const response = await axios.get(`${BACKEND_URL}/api/auth/admin/users`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'ngrok-skip-browser-warning': 'true'
      },
      withCredentials: true
    });
    return response.data.filter((user) => user.role === 'customer');
  }, []);

  const refreshCustomers = useCallback(() => {
    setIsLoading(true);
    setError('');
    fetchCustomers()
      .then(setUsers)
      .catch((requestError) => {
        setError(
          requestError.response?.data?.error ||
          requestError.response?.data?.message ||
          'Unable to load customer accounts.'
        );
      })
      .finally(() => setIsLoading(false));
  }, [fetchCustomers]);

  useEffect(() => {
    let isCurrent = true;
    fetchCustomers()
      .then((customers) => {
        if (isCurrent) setUsers(customers);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(
            requestError.response?.data?.error ||
            requestError.response?.data?.message ||
            'Unable to load customer accounts.'
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    const intervalId = window.setInterval(() => {
      fetchCustomers()
        .then((customers) => {
          if (!isCurrent) return;
          setUsers(customers);
          setError('');
        })
        .catch((requestError) => {
          if (isCurrent) {
            setError(
              requestError.response?.data?.error ||
              requestError.response?.data?.message ||
              'Unable to refresh customer accounts.'
            );
          }
        });
    }, 30000);

    return () => {
      isCurrent = false;
      window.clearInterval(intervalId);
    };
  }, [fetchCustomers]);

  const admin = (() => {
    try {
      return JSON.parse(localStorage.getItem('user_data')) || {};
    } catch {
      return {};
    }
  })();
  const adminName = admin.name || admin.userName || admin.email?.split('@')[0] || 'Admin';
  const profilePictureUrl = admin.profilePicture
    ? new URL(admin.profilePicture, BACKEND_URL).toString()
    : '';
  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((customer) =>
      [customer.name, customer.userName, customer.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [search, users]);

  const signOut = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/admin/dashboard" aria-label="K-Merce Admin home">
          <span className="admin-brand-mark"><img src="/brand-logo.png" alt="" /></span>
          <span className="admin-brand-copy">
            <strong>K-MERCE</strong>
            <small>ADMIN CONSOLE</small>
          </span>
        </Link>
        <div className="admin-nav-label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          <Link className="admin-nav-link" to="/admin/dashboard#overview"><span className="admin-nav-icon">▦</span>Overview</Link>
          <Link className="admin-nav-link" to="/admin/dashboard#users"><span className="admin-nav-icon">♙</span>User directory</Link>
          <Link className="admin-nav-link" to="/admin/vendors"><span className="admin-nav-icon">◇</span>Vendors</Link>
          <Link className="admin-nav-link" to="/admin/payments"><span className="admin-nav-icon">🪙</span>Payments</Link>
          <Link className="admin-nav-link" to="/admin/dashboard#store-approvals"><span className="admin-nav-icon">!</span>Store approvals</Link>
          <Link className="admin-nav-link is-active" to="/admin/customers"><span className="admin-nav-icon">♡</span>Customers<span className="admin-nav-count">{users.length}</span></Link>
          <Link className="admin-nav-link" to="/admin/dashboard#admins"><span className="admin-nav-icon">✦</span>Administrators</Link>
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-secure-card">
            <span className="admin-secure-dot" />
            <div><strong>Admin access</strong><span>Protected workspace</span></div>
          </div>
          <div className="admin-sidebar-foot">K-Merce Management · 2026</div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">Workspace <span>/</span> Customers</div>
          <div className="admin-topbar-user">
            <span className="admin-topbar-avatar">
              {profilePictureUrl
                ? <img src={profilePictureUrl} alt="" />
                : adminName.charAt(0)}
            </span>
            <span><strong>{adminName}</strong><br /><small>Platform management</small></span>
            <button className="admin-signout-button" type="button" onClick={signOut}>Log out</button>
          </div>
        </header>

        <div className="admin-content">
          <section className="admin-welcome">
            <div>
              <div className="admin-eyebrow">CUSTOMER ACCOUNTS</div>
              <h1>Customers</h1>
              <p>Review and search customer accounts separately from vendors and administrators.</p>
            </div>
            <button
              className="admin-refresh-button"
              type="button"
              onClick={refreshCustomers}
              disabled={isLoading}
            >
              <span className={isLoading ? 'admin-refresh-icon is-spinning' : 'admin-refresh-icon'}>↻</span>
              {isLoading ? 'Refreshing' : 'Refresh data'}
            </button>
          </section>

          {error && (
            <div className="admin-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={refreshCustomers}>Try again</button>
            </div>
          )}

          <section className="admin-directory" aria-label="Customer directory">
            <div className="admin-directory-heading">
              <div>
                <div className="admin-eyebrow">PEOPLE</div>
                <h2>Customer directory</h2>
                <p>Registered marketplace customer accounts.</p>
              </div>
              <label className="admin-search">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customers"
                  aria-label="Search customers by name or email"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} aria-label="Clear search">×</button>
                )}
              </label>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-user-table">
                <thead>
                  <tr>
                    <th scope="col">CUSTOMER</th>
                    <th scope="col">ROLE</th>
                    <th scope="col">JOINED</th>
                    <th scope="col">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr><td className="admin-table-message" colSpan="4">Loading customers…</td></tr>
                  )}
                  {!isLoading && !error && filteredCustomers.map((customer) => (
                    <tr key={customer._id}>
                      <td>
                        <div className="admin-user-cell">
                          <span className="admin-user-avatar role-customer">
                            {customer.profilePicture && (
                              <img
                                src={new URL(customer.profilePicture, BACKEND_URL).toString()}
                                alt=""
                                onError={(event) => {
                                  event.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            {getInitials(customer.name || customer.userName, customer.email)}
                          </span>
                          <span className="admin-user-details">
                            <strong>{customer.name || customer.userName || 'New User'}</strong>
                            <small>{customer.email}</small>
                          </span>
                        </div>
                      </td>
                      <td><span className="admin-role-badge role-customer"><span />Customer</span></td>
                      <td className="admin-date-cell">
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : '—'}
                      </td>
                      <td><span className="admin-status"><span />Active</span></td>
                    </tr>
                  ))}
                  {!isLoading && !error && filteredCustomers.length === 0 && (
                    <tr>
                      <td className="admin-table-message" colSpan="4">
                        {search ? 'No customers match your search.' : 'No customer accounts found.'}
                      </td>
                    </tr>
                  )}
                  {!isLoading && error && (
                    <tr><td className="admin-table-message" colSpan="4">Customer data is unavailable.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="admin-directory-footer">
              <span>Showing <strong>{filteredCustomers.length}</strong> of <strong>{users.length}</strong> customers</span>
              <span className="admin-data-note"><span /> Live account data</span>
            </div>
          </section>

          <footer className="admin-page-footer">
            <span>K-Merce Admin Console</span>
            <span>Built by Cartoon.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
