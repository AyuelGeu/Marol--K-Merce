import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RoleDashboard.css';

export default function VendorDashboard() {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_data')) || {};
    } catch {
      return {};
    }
  });
  const navigate = useNavigate();
  const vendorProfile = user.vendorProfile || {};
  const displayName = user.name && user.name !== 'New User' ? user.name : 'Vendor';
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Member';

  const signOut = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    navigate('/login', { replace: true });
  };

  return (
    <div className="workspace-shell vendor-workspace">
      <aside className="workspace-sidebar">
        <Link className="workspace-brand" to="/vendor/dashboard">
          <span className="workspace-brand-mark">K</span>
          <span className="workspace-brand-copy"><strong>K-MERCE</strong><small>SELLER WORKSPACE</small></span>
        </Link>
        <div className="workspace-nav-label">YOUR WORKSPACE</div>
        <nav className="workspace-nav" aria-label="Vendor navigation">
          <a className="workspace-nav-link is-active" href="#overview"><span>▦</span>Overview</a>
          <a className="workspace-nav-link" href="#store"><span>◇</span>Store profile</a>
          <a className="workspace-nav-link" href="#account"><span>♙</span>Account</a>
        </nav>
        <div className="workspace-sidebar-bottom">
          <div className="workspace-secure-card"><span className="workspace-live-dot" /><div><strong>Seller account</strong><small>Role-protected workspace</small></div></div>
          <div className="workspace-sidebar-foot">K-Merce Marketplace · 2026</div>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-breadcrumb">Seller workspace <span>/</span> Overview</div>
          <div className="workspace-user-menu">
            <span className="workspace-user-avatar vendor-avatar">{(displayName[0] || 'V').toUpperCase()}</span>
            <span className="workspace-user-copy"><strong>{displayName}</strong><small>Vendor account</small></span>
            <button className="workspace-signout" type="button" onClick={signOut}>Sign out</button>
          </div>
        </header>

        <div className="workspace-content">
          <section className="workspace-welcome" id="overview">
            <div>
              <div className="workspace-eyebrow">SELLER WORKSPACE</div>
              <h1>Welcome, {displayName}</h1>
              <p>Your space to manage your seller profile and marketplace presence.</p>
            </div>
            <span className="workspace-role-chip vendor-chip"><span /> Vendor</span>
          </section>

          <section className="workspace-card-grid" aria-label="Vendor account overview">
            <article className="workspace-info-card">
              <span className="workspace-info-icon vendor-icon">◇</span>
              <span className="workspace-info-label">SELLER STATUS</span>
              <strong className="workspace-info-value">
                {vendorProfile.isApproved ? 'Approved' : 'Under review'}
              </strong>
              <span className="workspace-info-detail">
                {vendorProfile.isApproved ? 'Your seller account is approved.' : 'Your account is awaiting administrator approval.'}
              </span>
            </article>
            <article className="workspace-info-card">
              <span className="workspace-info-icon">✉</span>
              <span className="workspace-info-label">ACCOUNT EMAIL</span>
              <strong className="workspace-info-value workspace-email-value">{user.email || 'Not available'}</strong>
              <span className="workspace-info-detail">Your sign-in email address</span>
            </article>
            <article className="workspace-info-card">
              <span className="workspace-info-icon workspace-icon-gold">▤</span>
              <span className="workspace-info-label">STORE PROFILE</span>
              <strong className="workspace-info-value">{vendorProfile.storeName || 'Not configured'}</strong>
              <span className="workspace-info-detail">Seller profile on your account</span>
            </article>
          </section>

          <section className="workspace-panel" id="store">
            <div className="workspace-panel-heading">
              <div>
                <div className="workspace-eyebrow">SELLER DETAILS</div>
                <h2>Your store profile</h2>
                <p>Current store information associated with your vendor account.</p>
              </div>
              <span className={`workspace-status-pill ${vendorProfile.isApproved ? 'is-approved' : 'is-pending'}`}>
                <span />{vendorProfile.isApproved ? 'Approved' : 'Approval pending'}
              </span>
            </div>
            <div className="workspace-detail-grid">
              <div className="workspace-detail-item">
                <span>STORE NAME</span>
                <strong>{vendorProfile.storeName || 'No store name added yet'}</strong>
              </div>
              <div className="workspace-detail-item">
                <span>ACCOUNT CREATED</span>
                <strong>{joinedDate}</strong>
              </div>
              <div className="workspace-detail-item">
                <span>ACCOUNT ROLE</span>
                <strong>Vendor</strong>
              </div>
            </div>
            <div className="workspace-notice">
              <span className="workspace-notice-icon">i</span>
              <p>
                {vendorProfile.isApproved
                  ? 'Your vendor account is approved. Contact marketplace support if you need help managing your store.'
                  : 'Your vendor account needs administrator approval before seller features become available.'}
              </p>
            </div>
          </section>

          <section className="workspace-panel workspace-account-panel" id="account">
            <div className="workspace-panel-heading">
              <div>
                <div className="workspace-eyebrow">SECURITY</div>
                <h2>Account access</h2>
                <p>Keep your sign-in details up to date and secure.</p>
              </div>
            </div>
            <div className="workspace-account-row">
              <span className="workspace-account-lock">✓</span>
              <div><strong>Two-step sign-in</strong><small>Your account uses email verification when signing in.</small></div>
              <span className="workspace-security-state">Enabled</span>
            </div>
            <div className="workspace-account-row">
              <span className="workspace-account-lock">✉</span>
              <div><strong>Registered email</strong><small>{user.email || 'No email available'}</small></div>
              <Link className="workspace-text-link" to="/forgot-password">Reset password</Link>
            </div>
          </section>

          <footer className="workspace-footer"><span>K-Merce Seller Workspace</span><span>Signed in since {joinedDate}</span></footer>
        </div>
      </main>
    </div>
  );
}
