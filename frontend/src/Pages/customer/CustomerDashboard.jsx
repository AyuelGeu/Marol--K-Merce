import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../vendor/RoleDashboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function CustomerDashboard() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_data')) || {};
    } catch {
      return {};
    }
  });
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [pictureMessage, setPictureMessage] = useState('');
  const [pictureError, setPictureError] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState('');
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState('');
  const [orderActionError, setOrderActionError] = useState('');
  const pictureInputRef = useRef(null);
  const navigate = useNavigate();
  const displayName = user.name && user.name !== 'New User' ? user.name : 'there';
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Member';
  const addressCount = Number.isInteger(user.addressCount) ? user.addressCount : 0;
  const profilePictureUrl = user.profilePicture
    ? new URL(user.profilePicture, BACKEND_URL).toString()
    : '';

  useEffect(() => {
    let isCurrent = true;
    axios.get(`${BACKEND_URL}/api/marketplace/orders/mine`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        'ngrok-skip-browser-warning': 'true'
      },
      withCredentials: true
    })
      .then((response) => {
        if (isCurrent) setOrders(response.data);
      })
      .catch((error) => {
        if (isCurrent) setOrdersError(error.response?.data?.message || 'Unable to load your orders.');
      })
      .finally(() => {
        if (isCurrent) setIsLoadingOrders(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const cancelOrder = async (orderId) => {
    setCancellingOrderId(orderId);
    setOrderActionError('');
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/marketplace/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
            'ngrok-skip-browser-warning': 'true'
          },
          withCredentials: true
        }
      );
      setOrders((currentOrders) => currentOrders.map((order) => (
        order._id === orderId ? response.data : order
      )));
    } catch (error) {
      setOrderActionError(error.response?.data?.message || 'Unable to cancel this order. Please try again.');
    } finally {
      setCancellingOrderId('');
    }
  };

  const uploadProfilePicture = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPictureError('');
    setPictureMessage('');
    if (file.size > 5 * 1024 * 1024) {
      setPictureError('Choose an image that is 5 MB or smaller.');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);
    setIsUploadingPicture(true);

    try {
      const response = await axios.put(`${BACKEND_URL}/api/auth/profile-picture`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        withCredentials: true
      });
      const updatedUser = { ...user, profilePicture: response.data.profilePicture };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setPictureMessage('Profile picture updated.');
    } catch (error) {
      setPictureError(error.response?.data?.message || 'Unable to upload your profile picture. Please try again.');
    } finally {
      setIsUploadingPicture(false);
      if (pictureInputRef.current) pictureInputRef.current.value = '';
    }
  };

  const signOut = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    navigate('/login', { replace: true });
  };

  return (
    <div className="workspace-shell customer-workspace">
      <aside className="workspace-sidebar">
        <Link className="workspace-brand" to="/customer/dashboard">
          <span className="workspace-brand-mark">K</span>
          <span className="workspace-brand-copy"><strong>K-MERCE</strong><small>YOUR ACCOUNT</small></span>
        </Link>
        <div className="workspace-nav-label">YOUR ACCOUNT</div>
        <nav className="workspace-nav" aria-label="Customer navigation">
          <a className="workspace-nav-link is-active" href="#overview"><span>▦</span>Overview</a>
          <a className="workspace-nav-link" href="#orders"><span>▤</span>My orders</a>
          <a className="workspace-nav-link" href="#profile"><span>♙</span>Profile</a>
          <a className="workspace-nav-link" href="#security"><span>⌑</span>Security</a>
        </nav>
        <div className="workspace-sidebar-bottom">
          <div className="workspace-secure-card"><span className="workspace-live-dot" /><div><strong>Customer account</strong><small>Your personal marketplace space</small></div></div>
          <div className="workspace-sidebar-foot">K-Merce Marketplace · 2026</div>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-breadcrumb">My account <span>/</span> Overview</div>
          <div className="workspace-user-menu">
            <span className="workspace-user-avatar customer-avatar">
              {profilePictureUrl
                ? <img src={profilePictureUrl} alt="" />
                : (displayName[0] || 'C').toUpperCase()}
            </span>
            <span className="workspace-user-copy"><strong>{displayName}</strong><small>Customer account</small></span>
            <button className="workspace-signout" type="button" onClick={signOut}>Sign out</button>
          </div>
        </header>

        <div className="workspace-content">
          <section className="workspace-welcome" id="overview">
            <div>
              <div className="workspace-eyebrow">YOUR MARKETPLACE ACCOUNT</div>
              <h1>Hello, {displayName}</h1>
              <p>Welcome to your account. Your marketplace details are all in one place.</p>
            </div>
            <span className="workspace-role-chip customer-chip"><span /> Customer</span>
          </section>

          <section className="workspace-card-grid" aria-label="Customer account overview">
            <article className="workspace-info-card">
              <span className="workspace-info-icon customer-icon">♙</span>
              <span className="workspace-info-label">ACCOUNT TYPE</span>
              <strong className="workspace-info-value">Customer</strong>
              <span className="workspace-info-detail">Your marketplace role</span>
            </article>
            <article className="workspace-info-card">
              <span className="workspace-info-icon workspace-icon-gold">✉</span>
              <span className="workspace-info-label">ACCOUNT EMAIL</span>
              <strong className="workspace-info-value workspace-email-value">{user.email || 'Not available'}</strong>
              <span className="workspace-info-detail">Your sign-in email address</span>
            </article>
            <article className="workspace-info-card">
              <span className="workspace-info-icon">⌂</span>
              <span className="workspace-info-label">SAVED ADDRESSES</span>
              <strong className="workspace-info-value">{addressCount}</strong>
              <span className="workspace-info-detail">{addressCount === 1 ? 'Address on your account' : 'Addresses on your account'}</span>
            </article>
          </section>

          <section className="workspace-panel customer-orders-panel" id="orders">
            <div className="workspace-panel-heading">
              <div>
                <div className="workspace-eyebrow">PURCHASE HISTORY</div>
                <h2>My orders</h2>
                <p>Review your purchases and check their delivery status.</p>
              </div>
            </div>
            {ordersError && <p className="customer-orders-error" role="alert">{ordersError}</p>}
            {orderActionError && <p className="customer-orders-error" role="alert">{orderActionError}</p>}
            {isLoadingOrders ? (
              <div className="customer-orders-empty"><p>Loading your orders…</p></div>
            ) : ordersError ? null : orders.length === 0 ? (
              <div className="customer-orders-empty">
                <span className="customer-orders-empty-icon" aria-hidden="true">▤</span>
                <h3>No orders yet</h3>
                <p>Your orders will appear here after you place an order.</p>
                <Link className="customer-orders-shop-link" to="/marketplace">Browse the marketplace</Link>
              </div>
            ) : (
              <div className="customer-order-list">
                {orders.map((order) => (
                  <article className="customer-order-card" key={order._id}>
                    <header>
                      <div>
                        <strong>Order {order._id}</strong>
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <span className="customer-order-status">{order.status}</span>
                    </header>
                    <div className="customer-order-items">
                      {order.items.map((item, index) => (
                        <div key={`${item.product}-${index}`}>
                          <span>{item.productName} × {item.quantity}<small>Sold by {item.storeName}</small></span>
                          <strong>${(item.unitPrice * item.quantity).toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>
                    <footer><span>Order total</span><strong>${order.total.toFixed(2)}</strong></footer>
                    {order.status === 'pending' && (
                      <button
                        className="customer-order-cancel"
                        type="button"
                        onClick={() => cancelOrder(order._id)}
                        disabled={Boolean(cancellingOrderId)}
                      >
                        {cancellingOrderId === order._id ? 'Cancelling…' : 'Cancel order'}
                      </button>
                    )}
                    {order.status === 'cancelled' && (
                      <p className="customer-order-cancelled" role="status">This order was cancelled.</p>
                    )}
                  </article>
                ))}
                <Link className="customer-orders-shop-link" to="/marketplace">Continue shopping</Link>
              </div>
            )}
          </section>

          <section className="workspace-panel" id="profile">
            <div className="workspace-panel-heading">
              <div>
                <div className="workspace-eyebrow">PERSONAL INFORMATION</div>
                <h2>Account profile</h2>
                <p>Details currently associated with your customer account.</p>
              </div>
              <span className="workspace-status-pill is-approved"><span />Account active</span>
            </div>
            <div className="customer-profile-picture">
              <span className="customer-profile-picture-preview">
                {profilePictureUrl
                  ? <img src={profilePictureUrl} alt={`${displayName}'s profile`} />
                  : (displayName[0] || 'C').toUpperCase()}
              </span>
              <div className="customer-profile-picture-controls">
                <strong>Profile picture</strong>
                <small>JPG, PNG, WebP, or GIF. Maximum size: 5 MB.</small>
                <button
                  type="button"
                  className="customer-profile-picture-button"
                  onClick={() => pictureInputRef.current?.click()}
                  disabled={isUploadingPicture}
                >
                  {isUploadingPicture ? 'Uploading…' : profilePictureUrl ? 'Change picture' : 'Add picture'}
                </button>
                <input
                  ref={pictureInputRef}
                  className="customer-profile-picture-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  aria-label="Choose a profile picture"
                  onChange={uploadProfilePicture}
                />
                {pictureError && <span className="customer-profile-picture-error" role="alert">{pictureError}</span>}
                {pictureMessage && <span className="customer-profile-picture-success" role="status">{pictureMessage}</span>}
              </div>
            </div>
            <div className="workspace-detail-grid">
              <div className="workspace-detail-item">
                <span>NAME</span>
                <strong>{user.name || user.userName || 'Not provided'}</strong>
              </div>
              <div className="workspace-detail-item">
                <span>EMAIL ADDRESS</span>
                <strong>{user.email || 'Not available'}</strong>
              </div>
              <div className="workspace-detail-item">
                <span>MEMBER SINCE</span>
                <strong>{joinedDate}</strong>
              </div>
            </div>
          </section>

          <section className="workspace-panel workspace-account-panel" id="security">
            <div className="workspace-panel-heading">
              <div>
                <div className="workspace-eyebrow">SECURITY</div>
                <h2>Keep your account secure</h2>
                <p>Your account uses email verification during sign-in.</p>
              </div>
            </div>
            <div className="workspace-account-row">
              <span className="workspace-account-lock">✓</span>
              <div><strong>Two-step sign-in</strong><small>A verification code is sent when you sign in.</small></div>
              <span className="workspace-security-state">Enabled</span>
            </div>
            <div className="workspace-account-row">
              <span className="workspace-account-lock">✉</span>
              <div><strong>Registered email</strong><small>{user.email || 'No email available'}</small></div>
              <Link className="workspace-text-link" to="/forgot-password">Reset password</Link>
            </div>
          </section>

          <footer className="workspace-footer"><span>K-Merce Customer Account</span><span>Member since {joinedDate}</span></footer>
        </div>
      </main>
    </div>
  );
}
