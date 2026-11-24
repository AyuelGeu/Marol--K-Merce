import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import './AdminDashboard.css';
import MarketplaceChatbot from '../../components/MarketplaceChatbot';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const roleLabels = {
  admin: 'Administrator',
  vendor: 'Vendor',
  customer: 'Customer'
};

const salesTrendColors = ['#7c6cf0', '#25a879', '#e39a39', '#e05f72', '#3e9bc7', '#b569ce'];

function getInitials(name, email) {
  const label = name && name !== 'New User' ? name : email || 'User';
  return label
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function getTimeBasedGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function AdminDashboard() {
  const backgroundCanvasRef = useRef(null);
  const [adminProfilePicture] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_data'))?.profilePicture || '';
    } catch {
      return '';
    }
  });
  const [adminName] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user_data'));
      return user?.name || user?.userName || user?.email?.split('@')[0] || 'Admin';
    } catch {
      return 'Admin';
    }
  });
  const [users, setUsers] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [isSalesTrendLoading, setIsSalesTrendLoading] = useState(true);
  const [salesTrendError, setSalesTrendError] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState('0');
  const [payoutPhoneNumber, setPayoutPhoneNumber] = useState('');
  const [dailyCommission, setDailyCommission] = useState([]);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewingVendorId, setReviewingVendorId] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [vendorApplicationReviewingId, setVendorApplicationReviewingId] = useState('');
  const [vendorApprovalError, setVendorApprovalError] = useState('');
  const navigate = useNavigate();
  const adminProfilePictureUrl = adminProfilePicture
    ? new URL(adminProfilePicture, BACKEND_URL).toString()
    : '';

  useEffect(() => {
    const canvas = backgroundCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let pointer = null;
    let particles = [];

    const resizeCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const particleCount = Math.min(90, Math.max(28, Math.floor((width * height) / 14000)));
      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        velocityX: (Math.random() - 0.5) * 0.32,
        velocityY: (Math.random() - 0.5) * 0.32
      }));
      drawFrame(false);
    };

    const drawFrame = (animate) => {
      context.clearRect(0, 0, width, height);
      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        if (animate) {
          particle.x += particle.velocityX;
          particle.y += particle.velocityY;
          if (particle.x < 0 || particle.x > width) particle.velocityX *= -1;
          if (particle.y < 0 || particle.y > height) particle.velocityY *= -1;
        }

        for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
          const other = particles[otherIndex];
          const distanceX = particle.x - other.x;
          const distanceY = particle.y - other.y;
          const distance = Math.hypot(distanceX, distanceY);
          if (distance < 145) {
            const opacity = (1 - distance / 145) * 0.25;
            context.strokeStyle = `rgba(137, 177, 220, ${opacity})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }

        if (pointer) {
          const pointerDistance = Math.hypot(particle.x - pointer.x, particle.y - pointer.y);
          if (pointerDistance < 175) {
            context.strokeStyle = `rgba(165, 196, 235, ${(1 - pointerDistance / 175) * 0.42})`;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(pointer.x, pointer.y);
            context.stroke();
          }
        }

        context.fillStyle = 'rgba(184, 208, 238, 0.45)';
        context.beginPath();
        context.arc(particle.x, particle.y, 1.4, 0, Math.PI * 2);
        context.fill();
      }

      if (animate) {
        animationFrameId = window.requestAnimationFrame(() => drawFrame(true));
      }
    };

    const updateMotion = () => {
      window.cancelAnimationFrame(animationFrameId);
      drawFrame(!motionPreference.matches);
    };
    const updatePointer = (event) => {
      pointer = { x: event.clientX, y: event.clientY };
    };
    const clearPointer = (event) => {
      if (!event.relatedTarget) pointer = null;
    };

    resizeCanvas();
    updateMotion();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('pointerout', clearPointer);
    motionPreference.addEventListener('change', updateMotion);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', updatePointer);
      window.removeEventListener('pointerout', clearPointer);
      motionPreference.removeEventListener('change', updateMotion);
    };
  }, []);

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

  const fetchSalesTrend = useCallback(async () => {
    const token = localStorage.getItem('jwt_token');
    const response = await axios.get(`${BACKEND_URL}/api/marketplace/admin/payments`, {
      headers: {
        Authorization: token ? 'Bearer ' + token : '',
        'ngrok-skip-browser-warning': 'true'
      },
      withCredentials: true
    });
    return response.data.salesTrend;
  }, []);

  const fetchAdminSettings = useCallback(async () => {
    const token = localStorage.getItem('jwt_token');
    const response = await axios.get(`${BACKEND_URL}/api/marketplace/admin/settings`, {
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

  const refreshSalesTrend = useCallback(() => {
    setIsSalesTrendLoading(true);
    setSalesTrendError('');
    fetchSalesTrend()
      .then(setSalesTrend)
      .catch((requestError) => {
        setSalesTrendError(
          requestError.response?.data?.message || 'Unable to load the sales trend.'
        );
      })
      .finally(() => setIsSalesTrendLoading(false));
  }, [fetchSalesTrend]);

  useEffect(() => {
    let isCurrent = true;
    fetchSalesTrend()
      .then((trend) => {
        if (isCurrent) setSalesTrend(trend);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setSalesTrendError(
            requestError.response?.data?.message || 'Unable to load the sales trend.'
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsSalesTrendLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [fetchSalesTrend]);

  useEffect(() => {
    let isCurrent = true;
    fetchAdminSettings()
      .then((settings) => {
        if (!isCurrent) return;
        setCommissionPercentage(String(settings.dailyCommissionPercentage));
        setPayoutPhoneNumber(settings.payoutPhoneNumber);
        setDailyCommission(settings.dailyCommission);
        setIsSettingsLoaded(true);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setSettingsError(
            requestError.response?.data?.message || 'Unable to load admin settings.'
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsSettingsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [fetchAdminSettings]);

  const saveAdminSettings = async (event) => {
    event.preventDefault();
    setIsSettingsSaving(true);
    setSettingsError('');
    setSettingsSuccess('');
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.put(
        `${BACKEND_URL}/api/marketplace/admin/settings`,
        {
          dailyCommissionPercentage: Number(commissionPercentage),
          payoutPhoneNumber
        },
        {
          headers: {
            Authorization: token ? 'Bearer ' + token : '',
            'ngrok-skip-browser-warning': 'true'
          },
          withCredentials: true
        }
      );
      setCommissionPercentage(String(response.data.dailyCommissionPercentage));
      setPayoutPhoneNumber(response.data.payoutPhoneNumber);
      setDailyCommission(response.data.dailyCommission);
      setIsSettingsLoaded(true);
      setSettingsSuccess('Commission and payout settings saved.');
    } catch (requestError) {
      setSettingsError(requestError.response?.data?.message || 'Unable to save admin settings.');
    } finally {
      setIsSettingsSaving(false);
    }
  };

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
    (user) => user.vendorApplication?.status === 'pending'
      || (user.role === 'vendor' && !user.vendorProfile?.isApproved)
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

  const reviewVendorApplication = async (vendorId, decision) => {
    setVendorApplicationReviewingId(vendorId);
    setVendorApprovalError('');
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.put(
        `${BACKEND_URL}/api/auth/admin/vendors/${vendorId}/approval`,
        { decision },
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
            role: response.data.role,
            vendorProfile: response.data.vendorProfile,
            vendorApplication: response.data.vendorApplication
          }
          : user
      )));
    } catch (requestError) {
      setVendorApprovalError(
        requestError.response?.data?.message || 'Unable to review the vendor application. Please try again.'
      );
    } finally {
      setVendorApplicationReviewingId('');
    }
  };

  const counts = useMemo(() => ({
    total: users.length,
    admins: users.filter((user) => user.role === 'admin').length,
    vendors: users.filter((user) => user.role === 'vendor').length,
    customers: users.filter((user) => user.role === 'customer').length
  }), [users]);

  const salesTrendChart = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const days = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() - (29 - index));
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        label: date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC'
        })
      };
    });
    const stores = new Map();
    salesTrend.forEach((entry) => {
      if (!stores.has(entry.storeId)) {
        stores.set(entry.storeId, {
          id: entry.storeId,
          name: `${entry.storeName || 'Store'} · ${entry.vendorName || 'Vendor'}`
        });
      }
    });
    const rows = days.map((day) => ({ date: day.label, dateKey: day.key }));
    const rowByDate = new Map(rows.map((row) => [row.dateKey, row]));
    salesTrend.forEach((entry) => {
      const row = rowByDate.get(entry.date);
      if (row) row[entry.storeId] = (row[entry.storeId] || 0) + Number(entry.amount || 0);
    });

    return { stores: [...stores.values()], rows };
  }, [salesTrend]);

  const directoryUsers = useMemo(
    () => users.filter((user) => user.role !== 'customer' && user.role !== 'vendor'),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return directoryUsers;
    return directoryUsers.filter((user) =>
      [user.name, user.userName, user.email, user.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [directoryUsers, search]);

  const signOut = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      <canvas
        ref={backgroundCanvasRef}
        className="admin-background-animation"
        aria-hidden="true"
      />
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/admin/dashboard" aria-label="K-Merce Admin home">
          <span className="admin-brand-mark"><img src="/brand-logo.svg" alt="" /></span>
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
          <Link className="admin-nav-link" to="/admin/vendors">
            <span className="admin-nav-icon">◇</span>
            Vendors
            <span className="admin-nav-count">{counts.vendors}</span>
          </Link>
          <a className="admin-nav-link" href="/admin/payments">
            <span className="admin-nav-icon">🪙</span>
            Payments
          </a>
          <a className="admin-nav-link" href="#store-approvals">
            <span className="admin-nav-icon">!</span>
            Store approvals
            <span className="admin-nav-count">{pendingStoreNameReviews.length}</span>
          </a>
          <Link className="admin-nav-link" to="/admin/customers">
            <span className="admin-nav-icon">♡</span>
            Customers
            <span className="admin-nav-count">{counts.customers}</span>
          </Link>
          <a className="admin-nav-link" href="#admins">
            <span className="admin-nav-icon">✦</span>
            Administrators
            <span className="admin-nav-count">{counts.admins}</span>
          </a>
          <a className="admin-nav-link" href="#settings">
            <span className="admin-nav-icon">⚙</span>
            Settings
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
            <span className="admin-topbar-avatar">
              {adminProfilePictureUrl
                ? <img src={adminProfilePictureUrl} alt="" />
                : adminName.charAt(0)}
            </span>
            <span><strong>{adminName}</strong><br /><small>Platform management</small></span>
            <button className="admin-signout-button" type="button" onClick={signOut}>Log out</button>
          </div>
        </header>

        <div className="admin-content">
          <section className="admin-welcome" id="overview">
            <div>
              <div className="admin-eyebrow">MANAGEMENT OVERVIEW</div>
              <h1>{getTimeBasedGreeting()}, {adminName.split(/\s+/)[0]}</h1>
              <p>Monitor your marketplace and manage the people who make it thrive.</p>
            </div>
            <button
              className="admin-refresh-button"
              type="button"
              onClick={refreshUsers}
              disabled={isLoading}
            >
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
                <h2 id="vendor-approvals-title">Vendor application approvals</h2>
                <p>Approved applicants become vendors; rejected applicants remain customers.</p>
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
                      <span>{vendor.email} · Store name: {vendor.vendorApplication?.storeName || vendor.vendorProfile?.pendingStoreName || vendor.vendorProfile?.storeName || 'Not submitted'}</span>
                      {vendor.vendorApplication?.storeDescription && (
                        <span>Store details: {vendor.vendorApplication.storeDescription}</span>
                      )}
                      {vendor.vendorApplication?.contactNumber && (
                        <span>Contact: {vendor.vendorApplication.contactNumber}</span>
                      )}
                      {vendor.vendorApplication?.storeAddress && (
                        <span>Address: {vendor.vendorApplication.storeAddress}</span>
                      )}
                      {vendor.vendorApplication?.storeCategory && (
                        <span>Category: {vendor.vendorApplication.storeCategory}</span>
                      )}
                      {vendor.vendorApplication?.location?.coordinates && (
                        <span>
                          Location: {vendor.vendorApplication.location.coordinates[1].toFixed(4)},{' '}
                          {vendor.vendorApplication.location.coordinates[0].toFixed(4)}
                        </span>
                      )}
                    </div>
                    <div className="admin-approval-actions">
                      <button
                        type="button"
                        className="admin-approval-button is-approve"
                        onClick={() => reviewVendorApplication(vendor._id, 'approve')}
                        disabled={Boolean(vendorApplicationReviewingId)}
                      >
                        {vendorApplicationReviewingId === vendor._id ? 'Reviewing…' : 'Approve application'}
                      </button>
                      <button
                        type="button"
                        className="admin-approval-button is-reject"
                        onClick={() => reviewVendorApplication(vendor._id, 'reject')}
                        disabled={Boolean(vendorApplicationReviewingId)}
                      >
                        {vendorApplicationReviewingId === vendor._id ? 'Reviewing…' : 'Reject application'}
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

          <section className="admin-directory admin-sales-trend" aria-labelledby="sales-trend-title">
            <div className="admin-directory-heading">
              <div>
                <div className="admin-eyebrow">REVENUE MONITORING</div>
                <h2 id="sales-trend-title">Sales trend by store</h2>
                <p>Daily paid sales over the past 30 days, grouped by store.</p>
              </div>
              <button
                className="admin-refresh-button"
                type="button"
                onClick={refreshSalesTrend}
                disabled={isSalesTrendLoading}
              >
                <span className={isSalesTrendLoading ? 'admin-refresh-icon is-spinning' : 'admin-refresh-icon'}>↻</span>
                {isSalesTrendLoading ? 'Loading sales' : 'Refresh sales'}
              </button>
            </div>
            <div className="admin-sales-chart-wrap">
              {salesTrendError ? (
                <div className="admin-sales-chart-message" role="alert">
                  <span>{salesTrendError}</span>
                  <button type="button" onClick={refreshSalesTrend}>Try again</button>
                </div>
              ) : isSalesTrendLoading ? (
                <p className="admin-sales-chart-message">Loading sales trend…</p>
              ) : salesTrendChart.stores.length === 0 ? (
                <p className="admin-sales-chart-message">No paid sales have been recorded in the past 30 days.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesTrendChart.rows} margin={{ top: 12, right: 20, bottom: 4, left: 12 }}>
                    <CartesianGrid stroke="#344054" strokeDasharray="3 5" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#9eabc0', fontSize: 11 }}
                      axisLine={{ stroke: '#344054' }}
                      tickLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      tick={{ fill: '#9eabc0', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={76}
                      tickFormatter={(value) => `KSh ${Number(value).toLocaleString()}`}
                    />
                    <Tooltip
                      contentStyle={{ background: '#171e2b', border: '1px solid #344054', borderRadius: 10 }}
                      labelStyle={{ color: '#e8edf5' }}
                      formatter={(value, name) => [`KSh ${Number(value).toLocaleString()}`, name]}
                    />
                    <Legend />
                    {salesTrendChart.stores.map((store, index) => (
                      <Bar
                        key={store.id}
                        dataKey={store.id}
                        name={store.name}
                        fill={salesTrendColors[index % salesTrendColors.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="admin-directory" id="users">
            <div className="admin-directory-heading">
              <div>
                <div className="admin-eyebrow">PEOPLE</div>
                <h2>User directory</h2>
                <p>Review administrator accounts. Vendor and customer accounts are listed separately.</p>
              </div>
              <label className="admin-search">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search users"
                  aria-label="Search administrator accounts by name, email, or role"
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
                            {user.profilePicture && (
                              <img
                                src={new URL(user.profilePicture, BACKEND_URL).toString()}
                                alt=""
                                onError={(event) => {
                                  event.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
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
              <span>Showing <strong>{filteredUsers.length}</strong> of <strong>{directoryUsers.length}</strong> accounts</span>
              <span className="admin-data-note"><span /> Live account data</span>
            </div>
          </section>

          <section className="admin-directory admin-settings" id="settings" aria-labelledby="admin-settings-title">
            <div className="admin-directory-heading">
              <div>
                <div className="admin-eyebrow">PLATFORM SETTINGS</div>
                <h2 id="admin-settings-title">Commission &amp; payout</h2>
                <p>Set the daily commission rate and the admin M-Pesa destination.</p>
              </div>
            </div>
            <div className="admin-settings-content">
              {settingsError && <div className="admin-settings-message is-error" role="alert">{settingsError}</div>}
              {settingsSuccess && <div className="admin-settings-message is-success" role="status">{settingsSuccess}</div>}
              <form className="admin-settings-form" onSubmit={saveAdminSettings}>
                <label className="admin-settings-field">
                  <span>Commission percentage</span>
                  <span className="admin-settings-input-wrap">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                      value={commissionPercentage}
                      onChange={(event) => setCommissionPercentage(event.target.value)}
                      disabled={!isSettingsLoaded || isSettingsSaving}
                    />
                    <span>%</span>
                  </span>
                  <small>Applied to paid gross item sales, grouped by transaction day.</small>
                </label>
                <label className="admin-settings-field">
                  <span>Admin M-Pesa phone number</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="e.g. 0712345678"
                    value={payoutPhoneNumber}
                    onChange={(event) => setPayoutPhoneNumber(event.target.value)}
                    disabled={!isSettingsLoaded || isSettingsSaving}
                  />
                  <small>Used as the intended payout destination when outbound transfers are configured.</small>
                </label>
                <div className="admin-settings-payout-note" role="status">
                  Automatic transfers are disabled. Saving this destination will not send money; M-Pesa B2C payout credentials and callback configuration are not set up.
                </div>
                <button
                  className="admin-settings-save"
                  type="submit"
                  disabled={!isSettingsLoaded || isSettingsSaving}
                >
                  {isSettingsLoading ? 'Loading settings…' : isSettingsSaving ? 'Saving…' : 'Save settings'}
                </button>
              </form>

              <div className="admin-settings-history">
                <div className="admin-settings-history-heading">
                  <h3>Daily commission estimates</h3>
                  <span>Past 30 days · current rate · not transferred</span>
                </div>
                {isSettingsLoading ? (
                  <p className="admin-table-message">Loading commission history…</p>
                ) : dailyCommission.length === 0 ? (
                  <p className="admin-table-message">No paid sales have been recorded in the past 30 days.</p>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-payment-table admin-settings-table">
                      <thead>
                        <tr>
                          <th scope="col">DATE</th>
                          <th scope="col">PAID GROSS SALES</th>
                          <th scope="col">ESTIMATED COMMISSION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyCommission.map((day) => (
                          <tr key={day.date}>
                            <td>{new Date(`${day.date}T00:00:00Z`).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              timeZone: 'UTC'
                            })}</td>
                            <td className="admin-payment-amount">KSh {Number(day.grossSales).toLocaleString()}</td>
                            <td className="admin-payment-amount">KSh {Number(day.commissionAmount).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>

          <footer className="admin-page-footer">
            <span>K-Merce Admin Console</span>
            <span>Built by Cartoon.</span>
          </footer>
        </div>
      </main>
      <MarketplaceChatbot />
    </div>
  );
}
