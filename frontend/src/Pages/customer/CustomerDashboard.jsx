import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../vendor/RoleDashboard.css';

export default function CustomerDashboard() {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_data')) || {};
    } catch {
      return {};
    }
  });
  const navigate = useNavigate();
  const displayName = user.name && user.name !== 'New User' ? user.name : 'there';
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Member';
  const addressCount = Number.isInteger(user.addressCount) ? user.addressCount : 0;

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
            <span className="workspace-user-avatar customer-avatar">{(displayName[0] || 'C').toUpperCase()}</span>
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

          <section className="workspace-panel" id="profile">
            <div className="workspace-panel-heading">
              <div>
                <div className="workspace-eyebrow">PERSONAL INFORMATION</div>
                <h2>Account profile</h2>
                <p>Details currently associated with your customer account.</p>
              </div>
              <span className="workspace-status-pill is-approved"><span />Account active</span>
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
