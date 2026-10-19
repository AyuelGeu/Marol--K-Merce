import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function AdminPayments() {
  const [vendorPaymentTotals, setVendorPaymentTotals] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchPayments = useCallback(async () => {
    const token = localStorage.getItem('jwt_token');
    const response = await axios.get(`${BACKEND_URL}/api/marketplace/admin/payments`, {
      headers: {
        Authorization: token ? 'Bearer ' + token : '',
        'ngrok-skip-browser-warning': 'true'
      },
      withCredentials: true
    });
    return response.data;
  }, []);

  const refreshPayments = useCallback(() => {
    setIsLoading(true);
    setError('');
    fetchPayments()
      .then((data) => {
        setVendorPaymentTotals(data.vendorTotals);
        setRecentPayments(data.recentPayments);
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Unable to load payment tracking data.');
      })
      .finally(() => setIsLoading(false));
  }, [fetchPayments]);

  useEffect(() => {
    fetchPayments()
      .then((data) => {
        setVendorPaymentTotals(data.vendorTotals);
        setRecentPayments(data.recentPayments);
      })
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Unable to load payment tracking data.');
      })
      .finally(() => setIsLoading(false));
  }, [fetchPayments]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchPayments()
        .then((data) => {
          setVendorPaymentTotals(data.vendorTotals);
          setRecentPayments(data.recentPayments);
          setError('');
        })
        .catch((requestError) => {
          setError(requestError.response?.data?.message || 'Unable to refresh payment tracking data.');
        });
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [fetchPayments]);

  const signOut = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    navigate('/login', { replace: true });
  };

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
  const recentStorePayments = recentPayments.flatMap((payment) => (
    payment.vendors.map((vendor) => ({
      ...payment,
      vendor,
      rowId: `${payment.id}-${vendor.vendorId}-${vendor.storeName}`
    }))
  ));

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
          <Link className="admin-nav-link is-active" to="/admin/payments"><span className="admin-nav-icon">🪙</span>Payments</Link>
          <Link className="admin-nav-link" to="/admin/dashboard#store-approvals"><span className="admin-nav-icon">!</span>Store approvals</Link>
          <Link className="admin-nav-link" to="/admin/customers"><span className="admin-nav-icon">♡</span>Customers</Link>
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
          <div className="admin-breadcrumb">Workspace <span>/</span> Payments</div>
          <div className="admin-topbar-user">
            <span className="admin-topbar-avatar">
              {profilePictureUrl ? <img src={profilePictureUrl} alt="" /> : adminName.charAt(0)}
            </span>
            <span><strong>{adminName}</strong><br /><small>Platform management</small></span>
            <button className="admin-signout-button" type="button" onClick={signOut}>Log out</button>
          </div>
        </header>

        <div className="admin-content">
          <section className="admin-welcome">
            <div>
              <div className="admin-eyebrow">REVENUE MONITORING</div>
              <h1>Vendor payments</h1>
              <p>Track paid sales and payment status by vendor. Paid sales are successful customer payments, not vendor payouts.</p>
            </div>
            <button
              className="admin-refresh-button"
              type="button"
              onClick={refreshPayments}
              disabled={isLoading}
            >
              <span className={isLoading ? 'admin-refresh-icon is-spinning' : 'admin-refresh-icon'}>↻</span>
              {isLoading ? 'Refreshing' : 'Refresh payments'}
            </button>
          </section>

          {error && (
            <div className="admin-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={refreshPayments}>Try again</button>
            </div>
          )}

          {isLoading && (
            <section className="admin-directory admin-payment-tracking">
              <div className="admin-payment-subheading"><h3>Vendor payments</h3></div>
              <p className="admin-table-message">Loading vendor payments…</p>
            </section>
          )}
          {!isLoading && !error && vendorPaymentTotals.length === 0 && (
            <section className="admin-directory admin-payment-tracking">
              <div className="admin-payment-subheading"><h3>Vendor payments</h3></div>
              <p className="admin-table-message">No vendor payment activity has been recorded.</p>
            </section>
          )}
          {!isLoading && !error && vendorPaymentTotals.map((vendor) => {
            const storePayments = recentStorePayments.filter((payment) =>
              payment.vendor.vendorId === vendor.vendorId &&
              payment.vendor.storeName === vendor.storeName
            );

            return (
              <section
                className="admin-directory admin-payment-tracking"
                key={`${vendor.vendorId}-${vendor.storeName}`}
              >
                <div className="admin-directory-heading">
                  <div>
                    <div className="admin-eyebrow">VENDOR PAYMENT HISTORY</div>
                    <h2>{vendor.storeName || vendor.name}</h2>
                    <p>{vendor.name}{vendor.email ? ` · ${vendor.email}` : ''}</p>
                  </div>
                </div>
                <div className="admin-payment-summary">
                  <span><small>Paid sales</small><strong>KSh {Number(vendor.paidAmount).toLocaleString()}</strong></span>
                  <span><small>Paid payments</small><strong>{vendor.paidTransactions}</strong></span>
                  <span><small>Pending</small><strong>KSh {Number(vendor.pendingAmount).toLocaleString()}</strong></span>
                  <span><small>Needs review</small><strong>KSh {Number(vendor.reviewAmount).toLocaleString()}</strong></span>
                  <span><small>Failed</small><strong>KSh {Number(vendor.failedAmount).toLocaleString()}</strong></span>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-payment-table">
                    <thead>
                      <tr>
                        <th scope="col">TRANSACTION</th>
                        <th scope="col">CUSTOMER</th>
                        <th scope="col">STORE AMOUNT</th>
                        <th scope="col">PAYMENT TOTAL</th>
                        <th scope="col">STATUS</th>
                        <th scope="col">DATE / RECEIPT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storePayments.map((payment) => (
                        <tr key={payment.rowId}>
                          <td className="admin-payment-id">{payment.id}</td>
                          <td>
                            <span className="admin-payment-vendor">
                              <strong>{payment.customerName}</strong>
                              <small>{payment.customerEmail}</small>
                            </span>
                          </td>
                          <td className="admin-payment-amount">KSh {Number(payment.vendor.amount).toLocaleString()}</td>
                          <td>KSh {Number(payment.amount).toLocaleString()}</td>
                          <td><span className={`admin-payment-status is-${payment.status}`}>{payment.status}</span></td>
                          <td>
                            <span className="admin-payment-vendor">
                              <strong>{new Date(payment.transactionDate).toLocaleString()}</strong>
                              <small>{payment.receiptNumber || 'No receipt recorded'}</small>
                            </span>
                          </td>
                        </tr>
                      ))}
                      {storePayments.length === 0 && (
                        <tr><td className="admin-table-message" colSpan="6">No recent payments for this store.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}

          <footer className="admin-page-footer">
            <span>K-Merce Admin Console</span>
            <span>Built by Cartoon.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
