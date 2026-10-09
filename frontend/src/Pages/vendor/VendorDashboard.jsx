import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RoleDashboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function VendorDashboard() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_data')) || {};
    } catch {
      return {};
    }
  });
  const [storeName, setStoreName] = useState(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('user_data'))?.vendorProfile;
      return profile?.pendingStoreName || profile?.storeName || '';
    } catch {
      return '';
    }
  });
  const [storeNameStatus, setStoreNameStatus] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user_data'))?.vendorProfile?.storeNameStatus || 'not_submitted';
    } catch {
      return 'not_submitted';
    }
  });
  const [isSavingStoreName, setIsSavingStoreName] = useState(false);
  const [storeNameMessage, setStoreNameMessage] = useState('');
  const [storeNameError, setStoreNameError] = useState('');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productsError, setProductsError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isPublishingProduct, setIsPublishingProduct] = useState(false);
  const [productError, setProductError] = useState('');
  const [productMessage, setProductMessage] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    imageUrl: ''
  });
  const navigate = useNavigate();
  const vendorProfile = user.vendorProfile || {};
  const displayName = user.name && user.name !== 'New User' ? user.name : 'Vendor';
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Member';
  const canListProducts = Boolean(
    vendorProfile.isApproved &&
    storeNameStatus === 'approved' &&
    vendorProfile.storeName?.trim()
  );

  useEffect(() => {
    let isCurrent = true;
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
      'ngrok-skip-browser-warning': 'true'
    };

    axios.get(`${BACKEND_URL}/api/auth/me`, { headers, withCredentials: true })
      .then((response) => {
        if (!isCurrent) return;
        setUser(response.data);
        setStoreName(response.data.vendorProfile?.pendingStoreName || response.data.vendorProfile?.storeName || '');
        setStoreNameStatus(response.data.vendorProfile?.storeNameStatus || 'not_submitted');
        localStorage.setItem('user_data', JSON.stringify(response.data));
      })
      .catch((error) => {
        if (isCurrent) {
          setProductsError(error.response?.data?.message || 'Unable to refresh your vendor approval status.');
        }
      });

    axios.get(`${BACKEND_URL}/api/marketplace/vendor/products`, { headers, withCredentials: true })
      .then((response) => {
        if (isCurrent) setProducts(response.data);
      })
      .catch((error) => {
        if (isCurrent) setProductsError(error.response?.data?.message || 'Unable to load your products.');
      })
      .finally(() => {
        if (isCurrent) setIsLoadingProducts(false);
      });

    axios.get(`${BACKEND_URL}/api/marketplace/orders/vendor`, { headers, withCredentials: true })
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

  const updateProductForm = (event) => {
    const { name, value } = event.target;
    setProductForm((form) => ({ ...form, [name]: value }));
  };

  const publishProduct = async (event) => {
    event.preventDefault();
    setIsPublishingProduct(true);
    setProductError('');
    setProductMessage('');
    try {
      const response = await axios.post(`${BACKEND_URL}/api/marketplace/products`, {
        ...productForm,
        price: Number(productForm.price)
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        withCredentials: true
      });
      setProducts((current) => [response.data, ...current]);
      setProductForm({ name: '', description: '', category: '', price: '', imageUrl: '' });
      setProductMessage('Product published to the marketplace.');
    } catch (error) {
      setProductError(error.response?.data?.message || 'Unable to publish your product. Please try again.');
    } finally {
      setIsPublishingProduct(false);
    }
  };

  const saveStoreName = async (event) => {
    event.preventDefault();
    const trimmedStoreName = storeName.trim();
    if (!trimmedStoreName) {
      setStoreNameError('Enter a store name before saving.');
      setStoreNameMessage('');
      return;
    }

    setIsSavingStoreName(true);
    setStoreNameError('');
    setStoreNameMessage('');
    try {
      const response = await axios.put(`${BACKEND_URL}/api/auth/vendor-store`, {
        storeName: trimmedStoreName
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        withCredentials: true
      });
      const updatedUser = {
        ...user,
        vendorProfile: {
          ...vendorProfile,
          pendingStoreName: response.data.pendingStoreName,
          storeNameStatus: response.data.storeNameStatus
        }
      };
      setUser(updatedUser);
      setStoreNameStatus(response.data.storeNameStatus);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      setStoreNameMessage('Store name submitted for admin approval.');
    } catch (error) {
      setStoreNameError(error.response?.data?.message || 'Unable to save the store name. Please try again.');
    } finally {
      setIsSavingStoreName(false);
    }
  };

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
          <a className="workspace-nav-link" href="#products"><span>▧</span>Products</a>
          <a className="workspace-nav-link" href="#orders"><span>▤</span>Orders</a>
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
                <p>Submit your store name for admin review before it appears to customers.</p>
              </div>
              <span className={`workspace-status-pill ${vendorProfile.isApproved ? 'is-approved' : 'is-pending'}`}>
                <span />{vendorProfile.isApproved ? 'Approved' : 'Approval pending'}
              </span>
            </div>
            {storeNameStatus === 'approved' ? (
              <div className="vendor-store-name-form">
                <span className="vendor-store-name-success" role="status">
                  Your store “{vendorProfile.storeName || storeName}” has been approved. Each vendor account can have only one store, so another store name cannot be submitted.
                </span>
              </div>
            ) : storeNameStatus === 'pending' ? (
              <div className="vendor-store-name-form">
                <span className="vendor-store-name-pending" role="status">
                  Store name “{vendorProfile.pendingStoreName || storeName}” is waiting for administrator approval. You can’t change it while it’s under review.
                </span>
                {storeNameMessage && <span className="vendor-store-name-success">{storeNameMessage}</span>}
              </div>
            ) : (
              <form className="vendor-store-name-form" onSubmit={saveStoreName}>
                <label htmlFor="vendor-store-name">Store name</label>
                <div className="vendor-store-name-controls">
                  <input
                    id="vendor-store-name"
                    type="text"
                    value={storeName}
                    onChange={(event) => setStoreName(event.target.value)}
                    maxLength={100}
                    placeholder="Enter your store name"
                    required
                  />
                  <button type="submit" disabled={isSavingStoreName}>
                    {isSavingStoreName ? 'Saving…' : 'Save store name'}
                  </button>
                </div>
                {storeNameError && <span className="vendor-store-name-error" role="alert">{storeNameError}</span>}
                {storeNameStatus === 'rejected' && (
                  <span className="vendor-store-name-error" role="status">Your last store name was rejected. Update it and submit again.</span>
                )}
              </form>
            )}
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
                  : 'Your vendor account needs administrator approval before seller features become available. You can enter your store name while your application is under review.'}
              </p>
            </div>
          </section>

          <section className="workspace-panel vendor-products-panel" id="products">
            <div className="workspace-panel-heading">
              <div>
                <div className="workspace-eyebrow">YOUR CATALOG</div>
                <h2>Products</h2>
                <p>Publish products customers can discover and order from your store.</p>
              </div>
              <span className="workspace-status-pill is-approved">{products.length} listed</span>
            </div>
            {!canListProducts && (
              <p className="vendor-listing-notice" role="status">
                {!vendorProfile.isApproved
                  ? 'Publishing is disabled until an admin approves your vendor account.'
                  : storeNameStatus !== 'approved'
                    ? storeNameStatus === 'rejected'
                      ? 'Your store name was rejected. Submit another store name and wait for admin approval before publishing.'
                      : 'Publishing is disabled until an admin approves your submitted store name.'
                    : 'Add and submit a store name before publishing products.'}
              </p>
            )}
            <form className="vendor-product-form" onSubmit={publishProduct}>
              <div className="vendor-product-form-grid">
                <label>
                  Product name
                  <input name="name" value={productForm.name} onChange={updateProductForm} maxLength={120} required />
                </label>
                <label>
                  Category
                  <input name="category" value={productForm.category} onChange={updateProductForm} maxLength={60} required />
                </label>
                <label>
                  Price
                  <input name="price" type="number" min="0.01" step="0.01" value={productForm.price} onChange={updateProductForm} required />
                </label>
                <label>
                  Product image URL (optional)
                  <input name="imageUrl" type="url" value={productForm.imageUrl} onChange={updateProductForm} placeholder="https://…" />
                </label>
                <label className="vendor-product-description">
                  Description
                  <textarea name="description" value={productForm.description} onChange={updateProductForm} maxLength={2000} rows={3} />
                </label>
              </div>
              <div className="vendor-product-submit-row">
                <button type="submit" disabled={!canListProducts || isPublishingProduct}>
                  {isPublishingProduct ? 'Publishing…' : 'Publish product'}
                </button>
                {productError && <span className="vendor-store-name-error" role="alert">{productError}</span>}
                {productMessage && <span className="vendor-store-name-success" role="status">{productMessage}</span>}
              </div>
            </form>
            {productsError && <p className="vendor-data-error" role="alert">{productsError}</p>}
            {isLoadingProducts ? (
              <p className="vendor-data-state">Loading products…</p>
            ) : productsError ? null : products.length === 0 ? (
              <p className="vendor-data-state">You haven’t published any products yet.</p>
            ) : (
              <div className="vendor-product-list">
                {products.map((product) => (
                  <article className="vendor-product-row" key={product._id}>
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.category}</span>
                    </div>
                    <strong>${Number(product.price).toFixed(2)}</strong>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="workspace-panel vendor-orders-panel" id="orders">
            <div className="workspace-panel-heading">
              <div>
                <div className="workspace-eyebrow">CUSTOMER PURCHASES</div>
                <h2>Orders for your store</h2>
                <p>Only items ordered from your approved store are shown here.</p>
              </div>
              <span className="workspace-status-pill is-pending">{orders.length} orders</span>
            </div>
            {ordersError && <p className="vendor-data-error" role="alert">{ordersError}</p>}
            {isLoadingOrders ? (
              <p className="vendor-data-state">Loading orders…</p>
            ) : ordersError ? null : orders.length === 0 ? (
              <p className="vendor-data-state">No customer orders yet. Orders for your products will appear here.</p>
            ) : (
              <div className="vendor-order-list">
                {orders.map((order) => (
                  <article className="vendor-order-card" key={order.id}>
                    <div className="vendor-order-heading">
                      <div>
                        <strong>Order {order.id}</strong>
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <span className="vendor-order-status">{order.status}</span>
                    </div>
                    <p className="vendor-order-customer">
                      Customer: {order.customer.name}{order.customer.email ? ` · ${order.customer.email}` : ''}
                    </p>
                    <div className="vendor-order-items">
                      {order.items.map((item, index) => (
                        <div key={`${item.productName}-${index}`}>
                          <span>{item.productName} × {item.quantity}</span>
                          <strong>${(item.unitPrice * item.quantity).toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="vendor-order-total"><span>Your order total</span><strong>${order.total.toFixed(2)}</strong></div>
                  </article>
                ))}
              </div>
            )}
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
