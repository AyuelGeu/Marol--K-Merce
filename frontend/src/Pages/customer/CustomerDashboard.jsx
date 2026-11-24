import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../vendor/RoleDashboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function CustomerDashboard() {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_data')) || {};
    } catch {
      return {};
    }
  });
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState('');
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState('');
  const [orderActionError, setOrderActionError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const isOrdersPage = location.pathname === '/customer/orders';
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

  useEffect(() => {
    if (!isOrdersPage && location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [isOrdersPage, location.hash]);

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
      if (response.data.status === 'cancelled') {
        setOrders((currentOrders) => currentOrders.filter((order) => order._id !== orderId));
      }
    } catch (error) {
      setOrderActionError(error.response?.data?.message || 'Unable to cancel this order. Please try again.');
    } finally {
      setCancellingOrderId('');
    }
  };

  const signOut = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    navigate('/login', { replace: true });
  };

  return (
    <div className="workspace-shell customer-workspace">
      <style>{`
        .customer-workspace,
        .customer-workspace * {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }

        .customer-workspace {
          --customer-ink: #332821;
          --customer-muted: #897a71;
          --customer-accent: #bb6745;
          --customer-dark: #4b3027;
          position: relative;
          isolation: isolate;
          overflow: clip;
          background:
            radial-gradient(ellipse at 86% 5%, rgba(244, 215, 187, .5), transparent 34rem),
            #faf7f3;
          color: var(--customer-ink);
        }

        .customer-workspace .workspace-sidebar {
          border-right-color: rgba(255, 255, 255, .1);
          background:
            radial-gradient(circle at 18% 0%, rgba(237, 176, 138, .17), transparent 19rem),
            linear-gradient(175deg, #55382e 0%, #38251f 100%);
          box-shadow: 12px 0 34px rgba(58, 35, 26, .1);
        }

        .customer-workspace .workspace-brand {
          padding: 5px 8px;
        }

        .customer-workspace .workspace-brand-mark {
          padding: 5px;
          border: 1px solid rgba(255, 255, 255, .17);
          background: rgba(255, 255, 255, .1);
        }

        .customer-workspace .workspace-brand-copy strong {
          color: #fff9f4;
          font-size: 13px;
          letter-spacing: .13em;
        }

        .customer-workspace .workspace-brand-copy small,
        .customer-workspace .workspace-nav-label,
        .customer-workspace .workspace-sidebar-foot {
          color: #d3b9ab;
        }

        .customer-workspace .workspace-nav-label {
          margin-top: 44px;
        }

        .customer-workspace .workspace-nav-link {
          color: #ebddd5;
          transition: background .2s ease, color .2s ease, transform .2s ease;
        }

        .customer-workspace .workspace-nav-link:hover,
        .customer-workspace .workspace-nav-link.is-active {
          transform: translateX(2px);
          background: rgba(246, 190, 151, .15);
          color: #ffd1b4;
        }

        .customer-workspace .workspace-nav-link.is-active::before {
          width: 3px;
          height: 22px;
          margin-left: -12px;
          border-radius: 0 4px 4px 0;
          background: #f2ad7e;
          content: "";
        }

        .customer-workspace .workspace-secure-card {
          border-color: rgba(255, 255, 255, .15);
          background: rgba(255, 255, 255, .08);
          color: #fff5ee;
        }

        .customer-workspace .workspace-secure-card small {
          color: #d3b9ab;
        }

        .customer-workspace .workspace-live-dot {
          box-shadow: 0 0 0 4px rgba(128, 213, 163, .13);
          background: #83d6a5;
        }

        .customer-workspace .workspace-topbar {
          position: relative;
          z-index: 1;
          border-bottom-color: #efe7e0;
          background: rgba(255, 255, 255, .84);
          backdrop-filter: blur(14px);
        }

        .customer-workspace .workspace-breadcrumb {
          color: #8e7f75;
          font-weight: 600;
        }

        .customer-workspace .workspace-breadcrumb > span {
          color: #c9b9ae;
        }

        .customer-workspace .workspace-user-avatar.customer-avatar {
          overflow: hidden;
          border: 2px solid #fff;
          background: linear-gradient(145deg, #f8dfca, #eab895);
          box-shadow: 0 0 0 1px #eed8c8;
          color: #874b34;
        }

        .customer-workspace .workspace-user-copy strong {
          color: #403127;
          font-size: 12px;
        }

        .customer-workspace .workspace-signout {
          min-height: 35px;
          padding: 0 13px;
          border-color: #ebdfd6;
          border-radius: 10px;
          background: #fff;
          color: #705b4d;
          font-size: 11px;
          transition: border-color .2s ease, background .2s ease, color .2s ease;
        }

        .customer-workspace .workspace-signout:hover {
          border-color: #e4b89d;
          background: #fff8f2;
          color: #a35335;
        }

        .customer-workspace .workspace-content {
          max-width: 1540px;
          padding-top: 32px;
          padding-bottom: 34px;
        }

        .customer-workspace .workspace-welcome {
          position: relative;
          overflow: hidden;
          min-height: 190px;
          align-items: center;
          margin-bottom: 24px;
          padding: 30px clamp(24px, 4vw, 42px);
          border: 1px solid rgba(255, 255, 255, .18);
          border-radius: 22px;
          background:
            radial-gradient(circle at 85% 50%, rgba(255, 216, 184, .24), transparent 18rem),
            linear-gradient(115deg, #56372c 0%, #87513b 56%, #bc7451 100%);
          box-shadow: 0 16px 38px rgba(102, 62, 43, .18);
        }

        .customer-workspace .workspace-welcome::after {
          position: absolute;
          top: -110px;
          right: 12%;
          width: 300px;
          height: 300px;
          border: 1px solid rgba(255, 255, 255, .14);
          border-radius: 50%;
          box-shadow: 0 0 0 32px rgba(255, 255, 255, .04), 0 0 0 66px rgba(255, 255, 255, .025);
          content: "";
          pointer-events: none;
        }

        .customer-workspace .workspace-welcome > div,
        .customer-workspace .workspace-role-chip {
          position: relative;
          z-index: 1;
        }

        .customer-workspace .workspace-welcome .workspace-eyebrow {
          color: #ffddc3;
          font-size: 10px;
          letter-spacing: .18em;
        }

        .customer-workspace .workspace-welcome h1 {
          margin: 0;
          color: #fffaf6;
          font-size: clamp(29px, 3.2vw, 40px);
          font-weight: 760;
          letter-spacing: -.055em;
          line-height: 1.12;
        }

        .customer-workspace .workspace-welcome p {
          max-width: 520px;
          margin-top: 10px;
          color: rgba(255, 247, 241, .8);
          font-size: 13px;
        }

        .customer-workspace .workspace-role-chip.customer-chip {
          padding: 9px 13px;
          border: 1px solid rgba(255, 255, 255, .24);
          background: rgba(255, 255, 255, .12);
          color: #fff4ea;
          font-size: 11px;
          backdrop-filter: blur(8px);
        }

        .customer-workspace .workspace-role-chip.customer-chip > span {
          background: #ffd0a8;
          box-shadow: 0 0 0 4px rgba(255, 208, 168, .14);
        }

        .customer-workspace .workspace-card-grid {
          gap: 16px;
          margin-bottom: 22px;
        }

        .customer-workspace .workspace-info-card {
          position: relative;
          overflow: hidden;
          min-height: 164px;
          padding: 20px;
          border-color: #eee5de;
          border-radius: 17px;
          background: linear-gradient(150deg, #fff 0%, #fffdfa 100%);
          box-shadow: 0 7px 22px rgba(91, 61, 43, .055);
          transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
        }

        .customer-workspace .workspace-info-card::after {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #cf8059, #f2d0b6);
          content: "";
        }

        .customer-workspace .workspace-info-card:hover {
          transform: translateY(-3px);
          border-color: #e5c7b2;
          box-shadow: 0 13px 28px rgba(91, 61, 43, .1);
        }

        .customer-workspace .workspace-info-icon {
          width: 36px;
          height: 36px;
          margin-bottom: 14px;
          border-radius: 11px;
          background: #f9eee5;
          color: #aa6040;
        }

        .customer-workspace .workspace-info-icon.customer-icon {
          background: #f8e9df;
          color: #aa6040;
        }

        .customer-workspace .workspace-info-icon.workspace-icon-gold {
          background: #fff4df;
          color: #ae812e;
        }

        .customer-workspace .workspace-info-label {
          color: #99877a;
          font-size: 9px;
          letter-spacing: .13em;
        }

        .customer-workspace .workspace-info-value {
          margin-top: 6px;
          color: #453329;
          font-size: 20px;
        }

        .customer-workspace .workspace-info-value.workspace-email-value {
          font-size: 14px;
        }

        .customer-workspace .workspace-info-detail {
          color: #958478;
          font-size: 10px;
        }

        .customer-workspace .workspace-panel {
          margin-bottom: 20px;
          border-color: #eee5de;
          border-radius: 17px;
          background: rgba(255, 255, 255, .97);
          box-shadow: 0 7px 24px rgba(91, 61, 43, .055);
        }

        .customer-workspace .workspace-panel-heading {
          padding: 23px 24px 18px;
        }

        .customer-workspace .workspace-panel-heading .workspace-eyebrow {
          color: #b46b48;
          font-size: 9px;
          letter-spacing: .15em;
        }

        .customer-workspace .workspace-panel-heading h2 {
          color: #453329;
          font-size: 19px;
          letter-spacing: -.035em;
        }

        .customer-workspace .workspace-panel-heading p {
          color: #958478;
          font-size: 11px;
        }

        .customer-workspace .workspace-status-pill {
          padding: 7px 11px;
          border: 1px solid #d8ebdc;
          background: #eef8ef;
          color: #347249;
          font-size: 10px;
        }

        .customer-workspace .customer-orders-panel .workspace-panel-heading {
          border-bottom: 1px solid #f1e9e3;
          background: linear-gradient(120deg, #fff7f0 0%, #fff 72%);
        }

        .customer-workspace .customer-orders-empty {
          min-height: 225px;
          border-top: 0;
        }

        .customer-workspace .customer-orders-empty-icon {
          width: 54px;
          height: 54px;
          border: 1px solid #f1dfd2;
          border-radius: 17px;
          background: linear-gradient(145deg, #fff4e9, #f8e5d7);
          color: #ad6748;
          box-shadow: 0 6px 14px rgba(119, 72, 48, .07);
        }

        .customer-workspace .customer-orders-empty h3 {
          color: #453329;
          font-size: 15px;
        }

        .customer-workspace .customer-orders-empty p {
          color: #958478;
          font-size: 11px;
        }

        .customer-workspace .customer-orders-shop-link {
          min-height: 38px;
          margin-top: 15px;
          padding: 0 14px;
          border-color: #ead4c4;
          border-radius: 9px;
          background: #fffaf6;
          color: #a45b3c;
          font-size: 11px;
          transition: transform .18s ease, background .18s ease, border-color .18s ease;
        }

        .customer-workspace .customer-orders-shop-link:hover {
          transform: translateY(-1px);
          border-color: #d8b49a;
          background: #fff2e8;
        }

        .customer-workspace .customer-order-list {
          gap: 13px;
          padding: 20px 24px 24px;
        }

        .customer-workspace .customer-order-card {
          position: relative;
          overflow: hidden;
          padding: 17px;
          border-color: #eee5de;
          border-radius: 13px;
          background: linear-gradient(145deg, #fff 0%, #fffdfa 100%);
          box-shadow: 0 4px 14px rgba(91, 61, 43, .04);
          transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
        }

        .customer-workspace .customer-order-card:hover {
          transform: translateY(-2px);
          border-color: #e5c7b2;
          box-shadow: 0 10px 22px rgba(91, 61, 43, .09);
        }

        .customer-workspace .customer-order-card > header {
          align-items: center;
          padding-bottom: 13px;
          border-bottom: 1px solid #f1e9e3;
        }

        .customer-workspace .customer-order-card > header strong {
          color: #453329;
          font-size: 13px;
        }

        .customer-workspace .customer-order-card > header > div > span {
          color: #99877a;
          font-size: 10px;
        }

        .customer-workspace .customer-order-status {
          padding: 5px 10px;
          border: 1px solid #f0dfc2;
          background: #fff7e9;
          color: #966e2a;
          font-size: 10px;
        }

        .customer-workspace .customer-order-items {
          gap: 8px;
          padding: 13px 0;
          border-color: #f1e9e3;
        }

        .customer-workspace .customer-order-items > div {
          align-items: center;
          padding: 9px 11px;
          border-radius: 8px;
          background: #fbf7f3;
          color: #746257;
          font-size: 11px;
        }

        .customer-workspace .customer-order-items > div:hover {
          background: #f8eee6;
        }

        .customer-workspace .customer-order-items small {
          color: #a08e81;
          font-size: 10px;
        }

        .customer-workspace .customer-order-items strong,
        .customer-workspace .customer-order-card > footer strong {
          color: #4c392d;
        }

        .customer-workspace .customer-order-card > footer {
          align-items: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f1e9e3;
          color: #78665a;
          font-size: 11px;
        }

        .customer-workspace .customer-order-card > footer strong {
          font-size: 14px;
        }

        .customer-workspace .customer-order-cancel {
          min-height: 34px;
          padding: 0 12px;
          border-color: #efd0c8;
          border-radius: 8px;
          background: #fff9f7;
          color: #ad4f42;
          font-size: 11px;
          transition: background .18s ease, border-color .18s ease;
        }

        .customer-workspace .customer-order-cancel:hover:not(:disabled) {
          border-color: #e5b3a9;
          background: #fff0ed;
        }

        .customer-workspace .customer-orders-error {
          margin: 12px 24px;
          padding: 11px 13px;
          border: 1px solid #f0d0cb;
          border-radius: 9px;
          background: #fff6f4;
          color: #a23d36;
          font-size: 11px;
        }

        .customer-workspace .customer-profile-picture {
          margin: 0 24px 18px;
          padding: 16px;
          border-color: #f0e7e0;
          border-radius: 12px;
          background: #fdfaf7;
        }

        .customer-workspace .customer-profile-picture-preview {
          width: 70px;
          height: 70px;
          border: 3px solid #fff;
          background: linear-gradient(145deg, #f9e3d2, #edc1a4);
          box-shadow: 0 0 0 1px #ecd5c5, 0 5px 14px rgba(91, 61, 43, .1);
          color: #874b34;
        }

        .customer-workspace .customer-profile-picture > strong {
          color: #5b4538;
          font-size: 12px;
        }

        .customer-workspace .workspace-detail-grid {
          border-top-color: #f0e8e2;
        }

        .customer-workspace .workspace-detail-item {
          padding-top: 18px;
          padding-bottom: 19px;
        }

        .customer-workspace .workspace-detail-item > span {
          color: #99877a;
          letter-spacing: .12em;
        }

        .customer-workspace .workspace-detail-item > strong {
          color: #4c392d;
          font-size: 12px;
        }

        .customer-workspace .workspace-account-panel {
          background: linear-gradient(145deg, #fff, #fffdfa);
        }

        .customer-workspace .workspace-account-row {
          border-top-color: #f0e8e2;
        }

        .customer-workspace .workspace-account-lock {
          background: #f9eee5;
          color: #a45b3c;
        }

        .customer-workspace .workspace-account-row > div strong {
          color: #4c392d;
        }

        .customer-workspace .workspace-account-row > div small {
          color: #958478;
        }

        .customer-workspace .workspace-security-state {
          color: #347249;
        }

        .customer-workspace .workspace-text-link {
          color: #a45b3c;
        }

        .customer-workspace .workspace-text-link:hover {
          color: #83452f;
        }

        .customer-workspace .workspace-footer {
          color: #958478;
        }

        .customer-workspace :is(a, button, input, textarea):focus-visible {
          outline: 3px solid rgba(194, 109, 72, .45);
          outline-offset: 3px;
        }

        @media (max-width: 760px) {
          .customer-workspace .workspace-sidebar {
            border-bottom-color: rgba(255, 255, 255, .12);
          }

          .customer-workspace .workspace-nav {
            overflow-x: auto;
            padding: 2px 0 3px;
            scrollbar-width: thin;
          }

          .customer-workspace .workspace-nav-link {
            flex: 0 0 auto;
          }

          .customer-workspace .workspace-nav-link.is-active::before {
            display: none;
          }

          .customer-workspace .workspace-welcome {
            min-height: 170px;
            padding: 24px;
            border-radius: 18px;
          }
        }

        @media (max-width: 600px) {
          .customer-workspace .workspace-content {
            padding-top: 22px;
          }

          .customer-workspace .workspace-welcome {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .customer-workspace .workspace-welcome::after {
            right: -120px;
          }

          .customer-workspace .workspace-info-card {
            min-height: 145px;
          }

          .customer-workspace .workspace-panel-heading {
            gap: 12px;
            padding: 19px 17px 15px;
          }

          .customer-workspace .customer-order-list {
            padding: 16px;
          }

          .customer-workspace .customer-order-card {
            padding: 14px;
          }

          .customer-workspace .customer-order-items > div {
            align-items: flex-start;
          }

          .customer-workspace .customer-profile-picture {
            margin-right: 16px;
            margin-left: 16px;
          }

          .customer-workspace .workspace-detail-grid {
            margin-right: 16px;
            margin-left: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .customer-workspace *,
          .customer-workspace *::before,
          .customer-workspace *::after {
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
            animation-duration: .01ms !important;
          }
        }
      `}</style>
      <aside className="workspace-sidebar">
        <Link className="workspace-brand" to="/customer/dashboard">
          <span className="workspace-brand-mark"><img src="/brand-logo.svg" alt="" /></span>
          <span className="workspace-brand-copy"><strong>K-MERCE</strong><small>YOUR ACCOUNT</small></span>
        </Link>
        <div className="workspace-nav-label">YOUR ACCOUNT</div>
        <nav className="workspace-nav" aria-label="Customer navigation">
          <Link className={`workspace-nav-link${isOrdersPage ? '' : ' is-active'}`} to="/customer/dashboard"><span>▦</span>Overview</Link>
          <Link className={`workspace-nav-link${isOrdersPage ? ' is-active' : ''}`} to="/customer/orders"><span>▤</span>My orders</Link>
          <Link className="workspace-nav-link" to="/customer/dashboard#profile"><span>♙</span>Profile</Link>
          <Link className="workspace-nav-link" to="/customer/dashboard#security"><span>⌑</span>Security</Link>
        </nav>
        <div className="workspace-sidebar-bottom">
          <div className="workspace-secure-card"><span className="workspace-live-dot" /><div><strong>Customer account</strong><small>Your personal marketplace space</small></div></div>
          <div className="workspace-sidebar-foot">K-Merce Marketplace · 2026</div>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-breadcrumb">My account <span>/</span> {isOrdersPage ? 'Orders' : 'Overview'}</div>
          <div className="workspace-user-menu">
            <span className="workspace-user-avatar customer-avatar">
              {(displayName[0] || 'C').toUpperCase()}
              {profilePictureUrl
                ? (
                  <img
                    src={profilePictureUrl}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                )
                : null}
            </span>
            <span className="workspace-user-copy"><strong>{displayName}</strong><small>Customer account</small></span>
            <button className="workspace-signout" type="button" onClick={signOut}>Sign out</button>
          </div>
        </header>

        <div className="workspace-content">
          <section className="workspace-welcome" id={isOrdersPage ? undefined : 'overview'}>
            <div>
              <div className="workspace-eyebrow">{isOrdersPage ? 'PURCHASE HISTORY' : 'YOUR MARKETPLACE ACCOUNT'}</div>
              <h1>{isOrdersPage ? 'My orders' : `Hello, ${displayName}`}</h1>
              <p>{isOrdersPage ? 'Review your purchases and check their delivery status.' : 'Welcome to your account. Your marketplace details are all in one place.'}</p>
            </div>
            <span className="workspace-role-chip customer-chip"><span /> Customer</span>
          </section>

          {!isOrdersPage && <section className="workspace-card-grid" aria-label="Customer account overview">
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
          </section>}

          {isOrdersPage && <section className="workspace-panel customer-orders-panel">
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
                    <footer><span>Order total</span><strong>KSh {order.total.toFixed(2)}</strong></footer>
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
          </section>}

          {!isOrdersPage && <section className="workspace-panel" id="profile">
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
                {(displayName[0] || 'C').toUpperCase()}
                {profilePictureUrl
                  ? (
                    <img
                      src={profilePictureUrl}
                      alt={`${displayName}'s profile`}
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  )
                  : null}
              </span>
              <strong>Google account profile photo</strong>
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
          </section>}

          {!isOrdersPage && <section className="workspace-panel workspace-account-panel" id="security">
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
          </section>}

          <footer className="workspace-footer"><span>K-Merce Customer Account</span><span>Member since {joinedDate}</span></footer>
        </div>
      </main>
    </div>
  );
}
