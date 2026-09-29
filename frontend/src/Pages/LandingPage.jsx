import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- MOCK PRODUCTS DATA ---
const PRODUCTS = [
  { id: 1, name: 'Wireless Noise-Canceling Headphones', price: 199.99, originalPrice: 249.99, rating: 4.8, reviews: 124, category: 'Electronics', tag: 'Hot', imageColor: '#1E293B' },
  { id: 2, name: 'Minimalist Mechanical Keyboard', price: 89.99, originalPrice: 119.99, rating: 4.9, reviews: 88, category: 'Electronics', tag: 'Sale', imageColor: '#334155' },
  { id: 3, name: 'Ergonomic Leather Desk Chair', price: 299.00, originalPrice: 349.00, rating: 4.7, reviews: 56, category: 'Furniture', tag: 'Top Rated', imageColor: '#475569' },
  { id: 4, name: 'Smart Fitness & Health Watch', price: 149.50, originalPrice: 179.99, rating: 4.6, reviews: 210, category: 'Tech', tag: 'New', imageColor: '#0F172A' },
];

const BANNERS = [
  { title: "Next-Gen Tech Essentials", subtitle: "Upgrade your workspace with premium performance gear.", badge: "New Arrival 2026", bg: "linear-gradient(135deg, #312E81 0%, #1E1B4B 100%)" },
  { title: "Mid-Season Flash Sale", subtitle: "Save up to 40% on selected audio and productivity devices.", badge: "Limited Time", bg: "linear-gradient(135deg, #065F46 0%, #064E3B 100%)" },
];

export default function LandingPage() {
  // --- INTERACTIVE STATES ---
  const [activeBanner, setActiveBanner] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  
  // Real-time Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  // Chat Widget States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'support', text: 'Hi there! How can we help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Carousel Auto-slide Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Flash Sale Ticking Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    setChatMessages((prev) => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');

    // Simulate auto-reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev, 
        { sender: 'support', text: "Thanks for reaching out! A representative will connect with you shortly." }
      ]);
    }, 1200);
  };

  // --- FLASHY ANIMATION STYLES (WITH FULL SCREEN RESET) ---
  const flashyCSS = `
    /* CSS Reset to remove default browser margins and make it fit the screen */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100%;
      min-height: 100vh;
      overflow-x: hidden;
    }
    #root {
      width: 100%;
      min-height: 100vh;
    }

    @keyframes moveGradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .flashy-background {
      background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab, #9b59b6, #3498db);
      background-size: 400% 400%;
      animation: moveGradient 12s ease infinite;
      width: 100%;
      min-height: 100vh;
    }
  `;

  return (
    <>
      {/* Injecting CSS Keyframes and resets directly into the component */}
      <style>{flashyCSS}</style>

      <div className="flashy-background" style={styles.container}>
        
        {/* 1. TOP ANNOUNCEMENT BAR */}
        <div style={styles.topBar}>
          🚀 Free Express Shipping on orders over $50 | Use code <strong>KMERCE2026</strong>
        </div>

        {/* 2. MAIN HEADER */}
        <header style={styles.header}>
          <div style={styles.logoGroup}>
            <span style={styles.logoIcon}>🛍️</span>
            <span style={styles.logoText}>K-Merce</span>
          </div>

          <div style={styles.searchContainer}>
            <select style={styles.searchCategory}>
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home</option>
            </select>
            <input 
              type="text" 
              placeholder="Search thousands of products..." 
              style={styles.searchInput}
            />
            <button style={styles.searchBtn}>🔍</button>
          </div>

          <div style={styles.userActions}>
            <div style={styles.iconBadgeContainer} title="Wishlist">
              <span style={styles.actionIcon}>❤️</span>
              <span style={styles.badge}>{wishlist.length}</span>
            </div>
            
            <div style={styles.iconBadgeContainer} title="Cart">
              <span style={styles.actionIcon}>🛒</span>
              <span style={styles.badge}>{cartCount}</span>
            </div>

            <div style={styles.authDivider}></div>

            <Link to="/login" style={styles.link}>
              <button style={{ ...styles.btn, ...styles.btnOutline }}>Log In</button>
            </Link>
            <Link to="/register" style={styles.link}>
              <button style={{ ...styles.btn, ...styles.btnPrimary }}>Register</button>
            </Link>
          </div>
        </header>

        {/* 3. SUB-NAVIGATION BAR */}
        <nav style={styles.subNav}>
          {['All Deals', 'Electronics', 'Fashion & Apparel', 'Home & Living', 'Smart Devices', 'Best Sellers', 'Customer Service'].map((item, idx) => (
            <a key={idx} href={`#${item}`} style={styles.subNavLink}>{item}</a>
          ))}
        </nav>

        {/* 4. DYNAMIC HERO CAROUSEL */}
        <section style={{ ...styles.hero, background: BANNERS[activeBanner].bg }}>
          <div style={styles.heroContent}>
            <span style={styles.heroBadge}>{BANNERS[activeBanner].badge}</span>
            <h1 style={styles.heroTitle}>{BANNERS[activeBanner].title}</h1>
            <p style={styles.heroSubtitle}>{BANNERS[activeBanner].subtitle}</p>
            
            <div style={styles.heroCTAGroup}>
              <Link to="/register" style={styles.link}>
                <button style={{ ...styles.btn, ...styles.btnHero }}>
                  Create Account & Shop →
                </button>
              </Link>
              <Link to="/login" style={styles.link}>
                <button style={{ ...styles.btn, ...styles.btnHeroSecondary }}>
                  Existing Member Login
                </button>
              </Link>
            </div>
          </div>

          <div style={styles.carouselIndicators}>
            {BANNERS.map((_, index) => (
              <span
                key={index}
                onClick={() => setActiveBanner(index)}
                style={{
                  ...styles.dot,
                  backgroundColor: activeBanner === index ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)'
                }}
              />
            ))}
          </div>
        </section>

        {/* 5. TRUST BADGES */}
        <section style={styles.trustSection}>
          <div style={styles.trustItem}>
            <span style={styles.trustIcon}>🚚</span>
            <div>
              <strong>Free Express Shipping</strong>
              <p style={styles.trustDesc}>On all orders over $50.00</p>
            </div>
          </div>
          <div style={styles.trustItem}>
            <span style={styles.trustIcon}>🛡️</span>
            <div>
              <strong>2-Year Warranty</strong>
              <p style={styles.trustDesc}>100% Guaranteed protection</p>
            </div>
          </div>
          <div style={styles.trustItem}>
            <span style={styles.trustIcon}>🎧</span>
            <div>
              <strong>24/7 Expert Support</strong>
              <p style={styles.trustDesc}>Live chat & email response</p>
            </div>
          </div>
          <div style={styles.trustItem}>
            <span style={styles.trustIcon}>💳</span>
            <div>
              <strong>Secure Payments</strong>
              <p style={styles.trustDesc}>Encrypted checkout portal</p>
            </div>
          </div>
        </section>

        {/* 6. FLASH SALE & PRODUCT CATALOG */}
        <main style={styles.mainContent}>
          <div style={styles.sectionHeader}>
            <div style={styles.headerGlassBox}>
              <h2 style={styles.sectionTitle}>🔥 Flash Deals</h2>
              <p style={styles.sectionSub}>Limited quantities available at special prices</p>
            </div>

            <div style={styles.timerBox}>
              <span style={styles.timerLabel}>Ends In:</span>
              <span style={styles.timeBlock}>{String(timeLeft.hours).padStart(2, '0')}h</span> :
              <span style={styles.timeBlock}>{String(timeLeft.minutes).padStart(2, '0')}m</span> :
              <span style={styles.timeBlock}>{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>

          <div style={styles.productGrid}>
            {PRODUCTS.map((prod) => (
              <div key={prod.id} style={styles.productCard}>
                <div style={{ ...styles.productImage, backgroundColor: prod.imageColor }}>
                  <span style={styles.productTag}>{prod.tag}</span>
                  <button 
                    onClick={() => toggleWishlist(prod.id)} 
                    style={styles.wishlistBtn}
                  >
                    {wishlist.includes(prod.id) ? '❤️' : '🤍'}
                  </button>
                </div>

                <div style={styles.productInfo}>
                  <span style={styles.productCategory}>{prod.category}</span>
                  <h3 style={styles.productTitle}>{prod.name}</h3>
                  
                  <div style={styles.ratingRow}>
                    <span style={styles.stars}>★ {prod.rating}</span>
                    <span style={styles.reviewCount}>({prod.reviews} reviews)</span>
                  </div>

                  <div style={styles.priceRow}>
                    <div>
                      <span style={styles.price}>${prod.price.toFixed(2)}</span>
                      <span style={styles.originalPrice}>${prod.originalPrice.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={() => setCartCount(c => c + 1)}
                      style={styles.addCartBtn}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* 7. NEWSLETTER SECTION */}
        <section style={styles.newsletter}>
          <div style={styles.newsletterContent}>
            <h2>Join the K-Merce Club</h2>
            <p>Subscribe to receive update drops, secret coupon codes, and tech news.</p>
            
            {subscribed ? (
              <div style={styles.subscribedMsg}>✓ Thank you for subscribing! Check your inbox soon.</div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }} style={styles.newsletterForm}>
                <input type="email" placeholder="Enter your email address" required style={styles.newsletterInput} />
                <button type="submit" style={{ ...styles.btn, ...styles.btnPrimary }}>Subscribe</button>
              </form>
            )}
          </div>
        </section>

        {/* 8. ENTERPRISE FOOTER */}
        <footer style={styles.footer}>
          <div style={styles.footerGrid}>
            <div>
              <div style={{ ...styles.logoGroup, marginBottom: '15px' }}>
                <span style={styles.logoIcon}>🛍️</span>
                <span style={{ ...styles.logoText, color: '#FFFFFF' }}>K-Merce</span>
              </div>
              <p style={styles.footerText}>Your one-stop enterprise marketplace for quality hardware, electronics, and lifestyle goods.</p>
            </div>

            <div>
              <h4 style={styles.footerColTitle}>Account & Portal</h4>
              <ul style={styles.footerList}>
                <li><Link to="/login" style={styles.footerLink}>Member Login</Link></li>
                <li><Link to="/register" style={styles.footerLink}>Register New Account</Link></li>
                <li><a href="#orders" style={styles.footerLink}>Track Order Status</a></li>
              </ul>
            </div>

            <div>
              <h4 style={styles.footerColTitle}>Customer Support</h4>
              <ul style={styles.footerList}>
                <li><a href="#help" style={styles.footerLink}>Help Center & FAQ</a></li>
                <li><a href="#returns" style={styles.footerLink}>Returns & Refunds</a></li>
                <li><a href="#shipping" style={styles.footerLink}>Shipping Policies</a></li>
              </ul>
            </div>

            <div>
              <h4 style={styles.footerColTitle}>Accepted Payments</h4>
              <p style={styles.footerText}>Visa, Mastercard, Apple Pay, PayPal, Bitcoin</p>
              <div style={{ marginTop: '10px', fontSize: '1.2rem' }}>💳 🪙 📲 🏦</div>
            </div>
          </div>

          <div style={styles.footerBottom}>
            © 2026 K-Merce Inc. All Rights Reserved. Designed for performance.
          </div>
        </footer>

        {/* 9. FLOATING CHAT WIDGET */}
        <div style={styles.chatWidget}>
          {isChatOpen ? (
            <div style={styles.chatWindow}>
              <div style={styles.chatHeader}>
                <span>Live Support</span>
                <button onClick={() => setIsChatOpen(false)} style={styles.chatCloseBtn}>✖</button>
              </div>
              
              <div style={styles.chatBody}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={msg.sender === 'user' ? styles.userMessage : styles.supportMessage}>
                    {msg.text}
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleSendMessage} style={styles.chatForm}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  style={styles.chatInput}
                />
                <button type="submit" style={styles.chatSendBtn}>Send</button>
              </form>
            </div>
          ) : (
            <button onClick={() => setIsChatOpen(true)} style={styles.chatBubble}>
              💬 Chat with us
            </button>
          )}
        </div>

      </div>
    </>
  );
}

// --- CSS-IN-JS STYLESHEET ---
const styles = {
  container: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#0F172A',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  topBar: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    textAlign: 'center',
    padding: '8px 16px',
    fontSize: '0.85rem',
    letterSpacing: '0.3px'
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
    padding: '16px 4%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  logoIcon: {
    fontSize: '1.6rem'
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: '-0.5px'
  },
  searchContainer: {
    display: 'flex',
    flex: '1',
    maxWidth: '600px',
    border: '2px solid #E2E8F0',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  searchCategory: {
    border: 'none',
    backgroundColor: '#F1F5F9',
    padding: '0 12px',
    fontSize: '0.85rem',
    color: '#475569',
    outline: 'none',
    borderRight: '1px solid #E2E8F0'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    padding: '10px 16px',
    outline: 'none',
    fontSize: '0.95rem'
  },
  searchBtn: {
    border: 'none',
    backgroundColor: '#4F46E5',
    color: 'white',
    padding: '0 18px',
    cursor: 'pointer'
  },
  userActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  iconBadgeContainer: {
    position: 'relative',
    cursor: 'pointer'
  },
  actionIcon: {
    fontSize: '1.2rem'
  },
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-8px',
    backgroundColor: '#EF4444',
    color: 'white',
    borderRadius: '999px',
    padding: '2px 6px',
    fontSize: '0.7rem',
    fontWeight: 'bold'
  },
  authDivider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#CBD5E1'
  },
  link: {
    textDecoration: 'none'
  },
  btn: {
    padding: '9px 18px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease'
  },
  btnOutline: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid #CBD5E1',
    color: '#334155'
  },
  btnPrimary: {
    backgroundColor: '#4F46E5',
    color: '#FFFFFF'
  },
  subNav: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
    padding: '10px 4%',
    display: 'flex',
    gap: '24px',
    overflowX: 'auto'
  },
  subNavLink: {
    textDecoration: 'none',
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  hero: {
    color: '#FFFFFF',
    padding: '60px 4%',
    position: 'relative',
    minHeight: '320px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  heroContent: {
    maxWidth: '650px'
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  heroTitle: {
    fontSize: '2.8rem',
    fontWeight: '800',
    margin: '16px 0 12px 0',
    lineHeight: 1.1
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: '#E2E8F0',
    marginBottom: '28px'
  },
  heroCTAGroup: {
    display: 'flex',
    gap: '12px'
  },
  btnHero: {
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    padding: '12px 24px',
    fontSize: '1rem'
  },
  btnHeroSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#FFFFFF',
    padding: '12px 24px',
    fontSize: '1rem'
  },
  carouselIndicators: {
    position: 'absolute',
    bottom: '20px',
    right: '4%',
    display: 'flex',
    gap: '8px'
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    cursor: 'pointer'
  },
  trustSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    backgroundColor: '#FFFFFF',
    padding: '24px 4%',
    borderBottom: '1px solid #E2E8F0'
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  trustIcon: {
    fontSize: '1.8rem'
  },
  trustDesc: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#64748B'
  },
  mainContent: {
    padding: '40px 4%',
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '24px'
  },
  headerGlassBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '10px 20px',
    borderRadius: '12px',
    backdropFilter: 'blur(5px)'
  },
  sectionTitle: {
    fontSize: '1.6rem',
    margin: 0,
    fontWeight: '700'
  },
  sectionSub: {
    margin: '4px 0 0 0',
    color: '#334155',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  timerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FEF2F2',
    padding: '8px 16px',
    borderRadius: '8px',
    color: '#991B1B',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  timerLabel: {
    fontSize: '0.85rem',
    marginRight: '4px'
  },
  timeBlock: {
    backgroundColor: '#EF4444',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px'
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  },
  productImage: {
    height: '200px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  productTag: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: '#EF4444',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  wishlistBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    border: 'none',
    backgroundColor: '#FFFFFF',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  productInfo: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  productCategory: {
    fontSize: '0.75rem',
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  productTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    margin: '6px 0',
    lineHeight: 1.3
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px'
  },
  stars: {
    color: '#F59E0B',
    fontWeight: 'bold',
    fontSize: '0.85rem'
  },
  reviewCount: {
    fontSize: '0.8rem',
    color: '#94A3B8'
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto'
  },
  price: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#0F172A'
  },
  originalPrice: {
    fontSize: '0.85rem',
    color: '#94A3B8',
    textDecoration: 'line-through',
    marginLeft: '6px'
  },
  addCartBtn: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  newsletter: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    color: 'white',
    padding: '50px 4%',
    textAlign: 'center',
    backdropFilter: 'blur(10px)'
  },
  newsletterContent: {
    maxWidth: '500px',
    margin: '0 auto'
  },
  newsletterForm: {
    display: 'flex',
    gap: '8px',
    marginTop: '20px'
  },
  newsletterInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '6px',
    border: 'none',
    outline: 'none'
  },
  subscribedMsg: {
    marginTop: '20px',
    color: '#34D399',
    fontWeight: 'bold'
  },
  footer: {
    backgroundColor: '#0F172A',
    color: '#94A3B8',
    padding: '50px 4% 20px 4%',
    marginTop: 'auto'
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    marginBottom: '40px'
  },
  footerColTitle: {
    color: '#FFFFFF',
    fontSize: '1rem',
    marginBottom: '16px'
  },
  footerText: {
    fontSize: '0.875rem',
    lineHeight: 1.5
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  footerLink: {
    color: '#94A3B8',
    textDecoration: 'none',
    fontSize: '0.875rem'
  },
  footerBottom: {
    borderTop: '1px solid #1E293B',
    paddingTop: '20px',
    textAlign: 'center',
    fontSize: '0.8rem'
  },
  
  // --- CHAT WIDGET STYLES ---
  chatWidget: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 1000,
  },
  chatBubble: {
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '999px',
    padding: '14px 24px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  chatWindow: {
    width: '320px',
    height: '420px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  chatHeader: {
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 'bold'
  },
  chatCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '1.2rem',
    cursor: 'pointer'
  },
  chatBody: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#F8FAFC'
  },
  supportMessage: {
    backgroundColor: '#E2E8F0',
    color: '#0F172A',
    padding: '10px 14px',
    borderRadius: '12px 12px 12px 2px',
    alignSelf: 'flex-start',
    maxWidth: '80%',
    fontSize: '0.9rem'
  },
  userMessage: {
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    padding: '10px 14px',
    borderRadius: '12px 12px 2px 12px',
    alignSelf: 'flex-end',
    maxWidth: '80%',
    fontSize: '0.9rem'
  },
  chatForm: {
    display: 'flex',
    borderTop: '1px solid #E2E8F0',
    padding: '12px',
    backgroundColor: '#FFFFFF'
  },
  chatInput: {
    flex: 1,
    border: '1px solid #CBD5E1',
    borderRadius: '20px',
    padding: '8px 16px',
    outline: 'none',
    fontSize: '0.9rem'
  },
  chatSendBtn: {
    backgroundColor: 'transparent',
    color: '#4F46E5',
    border: 'none',
    fontWeight: 'bold',
    marginLeft: '8px',
    cursor: 'pointer',
    padding: '0 8px'
  }
};