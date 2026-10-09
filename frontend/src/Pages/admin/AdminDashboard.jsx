import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const roleLabels = {
  admin: 'Administrator',
  vendor: 'Vendor',
  customer: 'Customer'
};

function getInitials(name, email) {
  const label = name && name !== 'New User' ? name : email || 'User';
  return label
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function AdminDashboard() {
  const [adminName] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      return user?.name || user?.userName || user?.email?.split('@')[0] || 'Admin';
    } catch {
      return 'Admin';
    }
  });
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewingVendorId, setReviewingVendorId] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [approvingVendorId, setApprovingVendorId] = useState('');
  const [vendorApprovalError, setVendorApprovalError] = useState('');
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('jwt_token');
    const response = await axios.get(`${BACKEND_URL}/api/auth/admin/users`, {
      headers: {
        Authorization: token ? 'Bearer ' + token : '',
        'ngrok-skip-browser-warning': 'true'
      },
      withCredentials: true
    });
    return response.data;
  }, []);

  const reportLoadError = useCallback((requestError) => {
    setError(requestError.response?.data?.error || requestError.response?.data?.message || 'Unable to load the user directory.');
  }, []);

  const refreshUsers = () => {
    setIsLoading(true);
    setError('');
    fetchUsers()
      .then(setUsers)
      .catch(reportLoadError)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(reportLoadError)
      .finally(() => setIsLoading(false));
  }, [fetchUsers, reportLoadError]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchUsers().then(setUsers).catch(reportLoadError);
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [fetchUsers, reportLoadError]);

  const pendingStoreNameReviews = useMemo(() => users.filter(
    (user) => user.role === 'vendor'
      && user.vendorProfile?.storeNameStatus === 'pending'
      && user.vendorProfile?.pendingStoreName
  ), [users]);
  const pendingVendorApprovals = useMemo(() => users.filter(
    (user) => user.role === 'vendor' && !user.vendorProfile?.isApproved
  ), [users]);

  const reviewStoreName = async (vendorId, decision) => {
    setReviewingVendorId(vendorId);
    setReviewError('');
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.put(
        `${BACKEND_URL}/api/auth/admin/vendors/${vendorId}/store-name`,
        {
          decision,
          storeName: users.find((user) => user._id === vendorId)?.vendorProfile?.pendingStoreName
        },
        {
          headers: {
            Authorization: token ? 'Bearer ' + token : '',
            'ngrok-skip-browser-warning': 'true'
          },
          withCredentials: true
        }
      );
      setUsers((currentUsers) => currentUsers.map((user) => (
        user._id === vendorId
          ? {
            ...user,
            vendorProfile: {
              ...user.vendorProfile,
              storeName: response.data.storeName,
              pendingStoreName: response.data.pendingStoreName,
              storeNameStatus: response.data.storeNameStatus
            }
          }
          : user
      )));
    } catch (requestError) {
      setReviewError(
        requestError.response?.data?.message || 'Unable to review the store name. Please try again.'
      );
    } finally {
      setReviewingVendorId('');
    }
  };

  const approveVendorAccount = async (vendorId) => {
    setApprovingVendorId(vendorId);
    setVendorApprovalError('');
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.put(
        `${BACKEND_URL}/api/auth/admin/vendors/${vendorId}/approval`,
        {},
        {
          headers: {
            Authorization: token ? 'Bearer ' + token : '',
            'ngrok-skip-browser-warning': 'true'
          },
          withCredentials: true
        }
      );
      setUsers((currentUsers) => currentUsers.map((user) => (
        user._id === vendorId
          ? { ...user, vendorProfile: { ...user.vendorProfile, isApproved: response.data.isApproved } }
          : user
      )));
    } catch (requestError) {
      setVendorApprovalError(
        requestError.response?.data?.message || 'Unable to approve the vendor account. Please try again.'
      );
    } finally {
      setApprovingVendorId('');
    }
  };

  const counts = useMemo(() => ({
    total: users.length,
    admins: users.filter((user) => user.role === 'admin').length,
    vendors: users.filter((user) => user.role === 'vendor').length,
    customers: users.filter((user) => user.role === 'customer').length
  }), [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      [user.name, user.userName, user.email, user.role]
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
        <a className="admin-brand" href="/admin/dashboard" aria-label="K-Merce Admin home">
          <span className="admin-brand-mark">K</span>
          <span className="admin-brand-copy">
            <strong>K-MERCE</strong>
            <small>ADMIN CONSOLE</small>
          </span>
        </a>
        <div className="admin-nav-label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          <a className="admin-nav-link is-active" href="#overview">
            <span className="admin-nav-icon">▦</span>
            Overview
          </a>
          <a className="admin-nav-link" href="#users">
            <span className="admin-nav-icon">♙</span>
            User directory
            <span className="admin-nav-count">{counts.total}</span>
          </a>
          <a className="admin-nav-link" href="#vendors">
            <span className="admin-nav-icon">◇</span>
            Vendors
            <span className="admin-nav-count">{counts.vendors}</span>
          </a>
          <a className="admin-nav-link" href="#store-approvals">
            <span className="admin-nav-icon">!</span>
            Store approvals
            <span className="admin-nav-count">{pendingStoreNameReviews.length}</span>
          </a>
          <a className="admin-nav-link" href="#customers">
            <span className="admin-nav-icon">♡</span>
            Customers
            <span className="admin-nav-count">{counts.customers}</span>
          </a>
          <a className="admin-nav-link" href="#admins">
            <span className="admin-nav-icon">✦</span>
            Administrators
            <span className="admin-nav-count">{counts.admins}</span>
          </a>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-secure-card">
            <span className="admin-secure-dot" />
            <div>
              <strong>Admin access</strong>
              <span>Protected workspace</span>
            </div>
          </div>
          <div className="admin-sidebar-foot">K-Merce Management · 2026</div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">Workspace <span>/</span> Overview</div>
          <div className="admin-topbar-user">
            <span className="admin-topbar-avatar">{adminName.charAt(0)}</span>
            <span><strong>{adminName}</strong><br /><small>Platform management</small></span>
            <button className="admin-signout-button" type="button" onClick={signOut}>Log out</button>
          </div>
        </header>

        <div className="admin-content">
          <section className="admin-welcome" id="overview">
            <div>
              <div className="admin-eyebrow">MANAGEMENT OVERVIEW</div>
              <h1>Good to see you, {adminName}</h1>
              <p>Monitor your marketplace and manage the people who make it thrive.</p>
            </div>
            <button className="admin-refresh-button" type="button" onClick={refreshUsers} disabled={isLoading}>
              <span className={isLoading ? 'admin-refresh-icon is-spinning' : 'admin-refresh-icon'}>↻</span>
              {isLoading ? 'Refreshing' : 'Refresh data'}
            </button>
          </section>

          {error && (
            <div className="admin-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={refreshUsers}>Try again</button>
            </div>
          )}

          <section className="admin-approvals" id="store-approvals" aria-labelledby="store-approvals-title">
            <div className="admin-approvals-heading">
              <div>
                <div className="admin-eyebrow">VENDOR SUBMISSIONS</div>
                <h2 id="store-approvals-title">Store name approvals</h2>
                <p>Review store names submitted by vendors before publishing them.</p>
              </div>
              <span className={`admin-approval-count${pendingStoreNameReviews.length ? ' has-pending' : ''}`} role="status">
                {pendingStoreNameReviews.length} pending
              </span>
            </div>
            {reviewError && <div className="admin-review-error" role="alert">{reviewError}</div>}
            {pendingStoreNameReviews.length === 0 ? (
              <p className="admin-approvals-empty">
                {isLoading ? 'Loading store name submissions…' : 'No store names are waiting for review.'}
              </p>
            ) : (
              <div className="admin-approval-list">
                {pendingStoreNameReviews.map((vendor) => (
                  <article className="admin-approval-item" key={vendor._id}>
                    <div className="admin-approval-vendor">
                      <strong>{vendor.vendorProfile.pendingStoreName}</strong>
                      <span>{vendor.name || vendor.userName || 'Vendor'} · {vendor.email}</span>
                    </div>
                    <div className="admin-approval-actions">
                      <button
                        type="button"
                        className="admin-approval-button is-reject"
                        onClick={() => reviewStoreName(vendor._id, 'reject')}
                        disabled={Boolean(reviewingVendorId)}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="admin-approval-button is-approve"
                        onClick={() => reviewStoreName(vendor._id, 'approve')}
                        disabled={Boolean(reviewingVendorId)}
                      >
                        {reviewingVendorId === vendor._id ? 'Reviewing…' : 'Approve'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="admin-approvals" id="vendor-approvals" aria-labelledby="vendor-approvals-title">
            <div className="admin-approvals-heading">
              <div>
                <div className="admin-eyebrow">SELLER ACCESS</div>
                <h2 id="vendor-approvals-title">Vendor account approvals</h2>
                <p>Approve vendor accounts before they can publish products.</p>
              </div>
              <span className={`admin-approval-count${pendingVendorApprovals.length ? ' has-pending' : ''}`} role="status">
                {pendingVendorApprovals.length} pending
              </span>
            </div>
            {vendorApprovalError && <div className="admin-review-error" role="alert">{vendorApprovalError}</div>}
            {pendingVendorApprovals.length === 0 ? (
              <p className="admin-approvals-empty">
                {isLoading ? 'Loading vendor accounts…' : 'No vendor accounts are waiting for approval.'}
              </p>
            ) : (
              <div className="admin-approval-list">
                {pendingVendorApprovals.map((vendor) => (
                  <article className="admin-approval-item" key={vendor._id}>
                    <div className="admin-approval-vendor">
                      <strong>{vendor.name || vendor.userName || 'Vendor'}</strong>
                      <span>{vendor.email} · Store name: {vendor.vendorProfile?.storeName || 'Not approved yet'}</span>
                    </div>
                    <div className="admin-approval-actions">
                      <button
                        type="button"
                        className="admin-approval-button is-approve"
                        onClick={() => approveVendorAccount(vendor._id)}
                        disabled={Boolean(approvingVendorId)}
                      >
                        {approvingVendorId === vendor._id ? 'Approving…' : 'Approve vendor'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="admin-stat-grid" aria-label="Marketplace user statistics">
            <article className="admin-stat-card admin-stat-total">
              <div className="admin-stat-top">
                <span className="admin-stat-icon">♙</span>
                <span className="admin-stat-caption">ALL ACCOUNTS</span>
              </div>
              <strong className="admin-stat-value">{isLoading ? '—' : counts.total}</strong>
              <span className="admin-stat-detail">Registered marketplace users</span>
            </article>
            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-icon admin-stat-icon-vendor">◇</span>
                <span className="admin-stat-caption">VENDORS</span>
              </div>
              <strong className="admin-stat-value">{isLoading ? '—' : counts.vendors}</strong>
              <span className="admin-stat-detail">Marketplace sellers</span>
            </article>
            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-icon admin-stat-icon-customer">♡</span>
                <span className="admin-stat-caption">CUSTOMERS</span>
              </div>
              <strong className="admin-stat-value">{isLoading ? '—' : counts.customers}</strong>
              <span className="admin-stat-detail">Customer accounts</span>
            </article>
            <article className="admin-stat-card">
              <div className="admin-stat-top">
                <span className="admin-stat-icon admin-stat-icon-admin">✦</span>
                <span className="admin-stat-caption">ADMINS</span>
              </div>
              <strong className="admin-stat-value">{isLoading ? '—' : counts.admins}</strong>
              <span className="admin-stat-detail">Platform administrators</span>
            </article>
          </section>

          <section className="admin-directory" id="users">
            <div className="admin-directory-heading">
              <div>
                <div className="admin-eyebrow">PEOPLE</div>
                <h2>User directory</h2>
                <p>Review registered users and their platform roles.</p>
              </div>
              <label className="admin-search">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search users"
                  aria-label="Search users by name, email, or role"
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
                    <th scope="col">USER</th>
                    <th scope="col">ROLE</th>
                    <th scope="col">JOINED</th>
                    <th scope="col">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr><td className="admin-table-message" colSpan="4">Loading users…</td></tr>
                  )}
                  {!isLoading && !error && filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="admin-user-cell">
                          <span className={`admin-user-avatar role-${user.role || 'customer'}`}>
                            {getInitials(user.name || user.userName, user.email)}
                          </span>
                          <span className="admin-user-details">
                            <strong>{user.name || user.userName || 'New User'}</strong>
                            <small>{user.email}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-role-badge role-${user.role || 'customer'}`}>
                          <span />{roleLabels[user.role] || 'Unknown'}
                        </span>
                      </td>
                      <td className="admin-date-cell">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : '—'}
                      </td>
                      <td><span className="admin-status"><span />Active</span></td>
                    </tr>
                  ))}
                  {!isLoading && !error && filteredUsers.length === 0 && (
                    <tr>
                      <td className="admin-table-message" colSpan="4">
                        {search ? 'No users match your search.' : 'No registered users found.'}
                      </td>
                    </tr>
                  )}
                  {!isLoading && error && (
                    <tr><td className="admin-table-message" colSpan="4">User data is unavailable.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="admin-directory-footer">
              <span>Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users</span>
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
