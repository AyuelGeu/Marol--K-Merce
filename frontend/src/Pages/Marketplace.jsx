import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Marketplace.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const CART_STORAGE_KEY = 'marketplace_cart';
const PAYMENT_STORAGE_KEY = 'marketplace_pending_payment';

function readStoredCart() {
  try {
    const storedItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(storedItems)
      ? storedItems.filter((item) =>
        typeof item.id === 'string' && Number.isInteger(item.quantity) && item.quantity > 0
      )
      : [];
  } catch {
    return [];
  }
}

function readCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user_data')) || {};
  } catch {
    return {};
  }
}

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState(readStoredCart);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [paymentPhone, setPaymentPhone] = useState(() => {
    const currentUser = readCurrentUser();
    return currentUser.phone || currentUser.phoneNumber || '';
  });
  const [isPaying, setIsPaying] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState(
    () => localStorage.getItem(PAYMENT_STORAGE_KEY) || ''
  );
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const user = readCurrentUser();
  const isCustomer = user.role === 'customer' && Boolean(localStorage.getItem('jwt_token'));

  const normalizeMpesaPhone = (value) => {
    const cleaned = String(value || '').replace(/\D/g, '');
    if (cleaned.startsWith('254')) return cleaned;
    if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`;
    if (/^[17]\d{8}$/.test(cleaned)) return `254${cleaned}`;
    return cleaned;
  };

  useEffect(() => {
    let isCurrent = true;
    axios.get(`${BACKEND_URL}/api/marketplace/products`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    })
      .then((response) => {
        if (isCurrent) setProducts(response.data);
      })
      .catch((error) => {
        if (isCurrent) {
          setLoadError(error.response?.data?.message || 'Unable to load products. Please try again.');
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (pendingPaymentId) {
      localStorage.setItem(PAYMENT_STORAGE_KEY, pendingPaymentId);
    } else {
      localStorage.removeItem(PAYMENT_STORAGE_KEY);
    }
  }, [pendingPaymentId]);

  useEffect(() => {
    if (!pendingPaymentId) return undefined;

    let isCurrent = true;
    const checkPaymentStatus = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/mpesa/status/${pendingPaymentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
              'ngrok-skip-browser-warning': 'true'
            },
            withCredentials: true
          }
        );
        if (!isCurrent) return;

        if (response.data.status === 'paid' && response.data.order) {
          setCartItems([]);
          setPaymentError('');
          setPaymentSuccess(`Payment received. Order ${response.data.order.id} has been placed.`);
          setPendingPaymentId('');
        } else if (response.data.status === 'failed') {
          setPaymentSuccess('');
          setPaymentError(response.data.resultDesc || 'M-Pesa payment was not completed. You can try again.');
          setPendingPaymentId('');
        } else if (response.data.status === 'review') {
          setPaymentSuccess('');
          setPaymentError(
            response.data.resultDesc ||
            'Payment details need verification. Check your M-Pesa messages or contact support before trying again.'
          );
          setPendingPaymentId('');
        }
      } catch (error) {
        if (isCurrent) {
          if (error.response?.status === 404) {
            setPendingPaymentId('');
            setPaymentError('This payment could not be found. Please start checkout again.');
          } else {
            setPaymentError(error.response?.data?.message || 'Unable to check payment status. Retrying…');
          }
        }
      }
    };

    checkPaymentStatus();
    const intervalId = window.setInterval(checkPaymentStatus, 3000);
    return () => {
      isCurrent = false;
      window.clearInterval(intervalId);
    };
  }, [pendingPaymentId]);

  const categories = useMemo(
    () => ['All categories', ...new Set(products.map((product) => product.category))],
    [products]
  );
  const visibleProducts = products.filter((product) => {
    const matchesCategory = category === 'All categories' || product.category === category;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query ||
      `${product.name} ${product.description} ${product.storeName}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (product) => {
    setPaymentError('');
    setPaymentSuccess('');
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) => (
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
      return [...items, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, change) => {
    setCartItems((items) => items
      .map((item) => item.id === productId ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0));
    setPaymentError('');
    setPaymentSuccess('');
  };

  const payWithMpesa = async () => {
    if (!isCustomer) {
      setPaymentError('Sign in with a customer account to pay.');
      return;
    }
    if (cartItems.length === 0) {
      setPaymentError('Add items to your cart before paying.');
      return;
    }

    const sanitizedPhone = normalizeMpesaPhone(paymentPhone || user.phone || user.phoneNumber || '');
    if (!/^254[17]\d{8}$/.test(sanitizedPhone)) {
      setPaymentError('Enter a valid Kenyan M-Pesa phone number.');
      return;
    }

    setIsPaying(true);
    setPaymentError('');
    setPaymentSuccess('');
    try {
      const response = await axios.post(`${BACKEND_URL}/api/mpesa/stkpush`, {
        phoneNumber: sanitizedPhone,
        items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity }))
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        withCredentials: true
      });
      setPaymentSuccess(
        `${response.data.message} Total: KSh ${Number(response.data.amount).toFixed(2)}.`
      );
      setPendingPaymentId(response.data.paymentId);
    } catch (error) {
      setPaymentError(
        error.response?.data?.error || 'Unable to start M-Pesa payment. Please try again.'
      );
      if (error.response?.data?.paymentId) {
        setPendingPaymentId(error.response.data.paymentId);
      }
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <main className="marketplace-page">
      <header className="marketplace-header">
        <Link className="marketplace-brand" to="/" aria-label="K-Merce home">
          <img src="/brand-logo.png" alt="K-Merce" />
        </Link>
        <nav aria-label="Marketplace navigation">
          <Link to="/customer/dashboard">Home</Link>
          {isCustomer && <Link to="/customer/dashboard#orders">My orders</Link>}
          {user.role === 'vendor' && <Link to="/vendor/dashboard#products">Seller workspace</Link>}
          {!isCustomer && <Link to="/login">Sign in</Link>}
        </nav>
      </header>

      <section className="marketplace-intro">
        <span>THE K-MERCE MARKETPLACE</span>
        <h1>Shop independent stores</h1>
        <p>Discover products listed by approved K-Merce vendors and order directly from their stores.</p>
      </section>

      <div className="marketplace-toolbar">
        <label className="marketplace-search">
          <span className="marketplace-visually-hidden">Search products and stores</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products or stores"
          />
        </label>
        <label className="marketplace-category">
          <span className="marketplace-visually-hidden">Filter by category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
      </div>

      <div className="marketplace-layout">
        <section className="marketplace-results" aria-label="Marketplace products">
          {isLoading && <p className="marketplace-state">Loading products…</p>}
          {loadError && <p className="marketplace-error" role="alert">{loadError}</p>}
          {!isLoading && !loadError && visibleProducts.length === 0 && (
            <div className="marketplace-empty">
              <span aria-hidden="true">◇</span>
              <h2>{products.length ? 'No matching products' : 'No products listed yet'}</h2>
              <p>
                {products.length
                  ? 'Try another search or category.'
                  : 'Approved vendors can add products from their seller workspace. Check back soon.'}
              </p>
              {products.length === 0 && <Link to="/register">Become a vendor</Link>}
            </div>
          )}
          <div className="marketplace-product-grid">
            {visibleProducts.map((product) => (
              <article className="marketplace-product-card" key={product.id}>
                {product.imageUrl
                  ? <img
                    className="marketplace-product-image"
                    src={new URL(product.imageUrl, BACKEND_URL).toString()}
                    alt={product.name}
                  />
                  : <div className="marketplace-product-placeholder" aria-hidden="true">◇</div>}
                <div className="marketplace-product-content">
                  <span className="marketplace-product-category">{product.category}</span>
                  <h2>{product.name}</h2>
                  {product.description && <p>{product.description}</p>}
                  <span className="marketplace-store-name">Sold by {product.storeName}</span>
                  <div className="marketplace-product-buy">
                    <strong>KSh {Number(product.price).toFixed(2)}</strong>
                    <button
                      type="button"
                      disabled={isPaying || Boolean(pendingPaymentId)}
                      onClick={() => addToCart(product)}
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="marketplace-cart" aria-label="Shopping cart">
          <div className="marketplace-cart-heading">
            <h2>Your cart</h2>
            <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
          </div>
          {cartItems.length === 0 ? (
            <p className="marketplace-cart-empty">Add a product to begin your order.</p>
          ) : (
            <div className="marketplace-cart-items">
              {cartItems.map((item) => (
                <article className="marketplace-cart-item" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.storeName}</span>
                    <span>KSh {Number(item.price).toFixed(2)} each</span>
                  </div>
                  <div className="marketplace-quantity">
                    <button
                      type="button"
                      disabled={isPaying || Boolean(pendingPaymentId)}
                      onClick={() => updateQuantity(item.id, -1)}
                      aria-label={`Remove one ${item.name}`}
                    >−</button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      disabled={isPaying || Boolean(pendingPaymentId)}
                      onClick={() => updateQuantity(item.id, 1)}
                      aria-label={`Add one ${item.name}`}
                    >+</button>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="marketplace-cart-total">
            <span>Estimated total</span>
            <strong>KSh {cartTotal.toFixed(2)}</strong>
          </div>

          <div className="marketplace-payment-form">
            <label htmlFor="mpesa-phone" className="marketplace-payment-label">M-Pesa phone number</label>
            <input
              id="mpesa-phone"
              type="tel"
              inputMode="numeric"
              value={paymentPhone}
              onChange={(event) => setPaymentPhone(event.target.value)}
              placeholder="2547XXXXXXXX"
              disabled={isPaying || Boolean(pendingPaymentId)}
            />
            <button
              className="marketplace-payment-button"
              type="button"
              disabled={!cartItems.length || isPaying || Boolean(pendingPaymentId)}
              onClick={payWithMpesa}
            >
              {isPaying ? 'Starting payment…' : pendingPaymentId ? 'Waiting for payment…' : 'Pay with M-Pesa'}
            </button>
          </div>

          <p className="marketplace-payment-note">Your order is placed only after M-Pesa confirms payment. Approve the prompt sent to your phone.</p>
          {!isCustomer && <span className="marketplace-signin-hint">Customer sign-in is required to pay and order.</span>}
          {paymentError && <p className="marketplace-error" role="alert">{paymentError}</p>}
          {paymentSuccess && (
            <p className="marketplace-success" role="status">
              {paymentSuccess}
              {!pendingPaymentId && <Link to="/customer/dashboard#orders"> View my orders</Link>}
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
