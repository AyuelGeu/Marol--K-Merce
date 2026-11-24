import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Login from '../Auth/Login';
import Register from '../Auth/Register';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const BANNERS = [
  { title: "One marketplace. Many independent stores!", subtitle: "Discover products from approved K-Merce vendors and shop from the stores behind them.", badge: "Welcome to K-Merce", bg: "linear-gradient(135deg, #312E81 0%, #1E1B4B 100%)" },
  { title: "Shop, sell, and manage in one place!", subtitle: "A connected marketplace with customer accounts, vendor workspaces, and tools for administrators.", badge: "Made for local commerce", bg: "linear-gradient(135deg, #065F46 0%, #064E3B 100%)" },
];

export default function LandingPage() {
  // --- INTERACTIVE STATES ---
  const [activeBanner, setActiveBanner] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [areFaqsVisible, setAreFaqsVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const randomFeaturedProducts = useMemo(() => {
    if (products.length === 0) return [];

    const shuffledProducts = [...products];
    for (let index = shuffledProducts.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffledProducts[index], shuffledProducts[randomIndex]] =
        [shuffledProducts[randomIndex], shuffledProducts[index]];
    }

    const productsByCategory = new Map();
    shuffledProducts.forEach((product) => {
      const category = product.category?.trim() || 'Other';
      if (!productsByCategory.has(category)) {
        productsByCategory.set(category, []);
      }
      productsByCategory.get(category).push(product);
    });

    const categoryItems = [...productsByCategory.values()]
      .slice(0, 8)
      .map((categoryProducts) => categoryProducts[0]);
    const featuredIds = new Set(categoryItems.map((product) => product.id));

    shuffledProducts.forEach((product) => {
      if (categoryItems.length >= 8) return;
      if (!featuredIds.has(product.id)) {
        categoryItems.push(product);
        featuredIds.add(product.id);
      }
    });

    return categoryItems;
  }, [products]);

  const toggleFaqs = (event) => {
    event.preventDefault();
    const shouldShowFaqs = !areFaqsVisible;
    setAreFaqsVisible(shouldShowFaqs);

    if (shouldShowFaqs) {
      window.requestAnimationFrame(() => {
        document.getElementById('landing-faqs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
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
          setProductsError(error.response?.data?.message || 'Unable to load marketplace products. Please try again.');
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoadingProducts(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  // Carousel Auto-slide Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isCartOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen]);

  const addToCart = (product) => {
    if (product.isAvailable === false) return;
    setCartItems((items) => {
      const existingItem = items.find((item) => item.id === product.id);
      if (existingItem) {
        return items.map((item) => (
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
      return [...items, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId, amount) => {
    setCartItems((items) => items
      .map((item) => item.id === productId
        ? { ...item, quantity: item.quantity + amount }
        : item)
      .filter((item) => item.quantity > 0));
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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

    .flashy-background {
      background: #f6f7f2 !important;
      width: 100%;
      min-height: 100vh;
    }
    .flashy-background,
    .flashy-background * {
      box-sizing: border-box;
      font-family: Inter, "Aptos", "Segoe UI", ui-sans-serif, system-ui, sans-serif !important;
    }
    .flashy-background {
      --landing-ink: #1d3129;
      --landing-muted: #68786f;
      --landing-green: #176b4d;
      --landing-green-dark: #103f31;
      --landing-line: #e5e9e2;
      color: var(--landing-ink) !important;
      letter-spacing: 0 !important;
      line-height: 1.5;
      text-align: left !important;
    }
    .flashy-background button,
    .flashy-background a,
    .flashy-background input,
    .flashy-background select {
      -webkit-tap-highlight-color: transparent;
    }
    .flashy-background button,
    .flashy-background a {
      transition: color .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease !important;
    }
    .flashy-background :is(button, a, input, select):focus-visible {
      outline: 3px solid rgba(42, 139, 94, .42) !important;
      outline-offset: 3px;
    }
    .flashy-background > div:first-child {
      padding: 8px 18px !important;
      background: #103f31 !important;
      color: #e8f4ec !important;
      font-size: 11px !important;
      font-weight: 600;
      letter-spacing: .035em !important;
      text-align: center;
    }
    .flashy-background > header {
      position: sticky !important;
      top: 0;
      z-index: 100;
      min-height: 82px;
      padding: 12px clamp(20px, 5vw, 76px) !important;
      border-bottom: 1px solid rgba(226, 233, 227, .9) !important;
      background: rgba(255, 255, 255, .94) !important;
      box-shadow: 0 7px 22px rgba(27, 55, 39, .045);
      backdrop-filter: blur(16px);
    }
    .flashy-background > header > div:first-child {
      flex: 0 0 auto;
      gap: 10px !important;
    }
    .flashy-background > header > div:first-child img {
      width: 48px !important;
      height: 48px !important;
    }
    .flashy-background > header > div:first-child span {
      color: #183c2d !important;
      font-size: 22px !important;
      font-weight: 800 !important;
      letter-spacing: -.055em !important;
    }
    .flashy-background > header > div:nth-child(2) {
      max-width: 520px !important;
      min-height: 44px;
      border: 1px solid #dfe8e1 !important;
      border-radius: 12px !important;
      background: #f8faf8;
      box-shadow: inset 0 1px 2px rgba(18, 60, 42, .025);
    }
    .flashy-background > header > div:nth-child(2):focus-within {
      border-color: #82b99a !important;
      box-shadow: 0 0 0 4px rgba(42, 139, 94, .1);
    }
    .flashy-background > header > div:nth-child(2) select {
      padding: 0 12px !important;
      background: #f0f5f1 !important;
      color: #496458 !important;
      font-size: 11px !important;
    }
    .flashy-background > header > div:nth-child(2) input {
      min-width: 0;
      padding: 10px 14px !important;
      background: transparent;
      color: #203d30 !important;
      font-size: 12px !important;
    }
    .flashy-background > header > div:nth-child(2) input::placeholder {
      color: #92a198;
    }
    .flashy-background > header > div:nth-child(2) button {
      min-width: 48px;
      background: #176b4d !important;
      font-size: 14px;
    }
    .flashy-background > header > div:nth-child(2) button:hover {
      background: #10553c !important;
    }
    .flashy-background > header > div:nth-child(3) {
      gap: 11px !important;
    }
    .flashy-background > header > div:nth-child(3) > a,
    .flashy-background > header > div:nth-child(3) > button {
      min-height: 39px;
      padding: 0 14px !important;
      border-radius: 10px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      text-decoration: none !important;
    }
    .flashy-background > header > div:nth-child(3) > a,
    .flashy-background > header > div:nth-child(3) > button:last-child {
      background: #176b4d !important;
      box-shadow: 0 5px 12px rgba(23, 107, 77, .14);
    }
    .flashy-background > header > div:nth-child(3) > a:hover,
    .flashy-background > header > div:nth-child(3) > button:last-child:hover {
      transform: translateY(-1px);
      background: #10553c !important;
      box-shadow: 0 8px 17px rgba(23, 107, 77, .2);
    }
    .flashy-background > header > div:nth-child(3) > button:nth-last-child(2) {
      border: 1px solid #dce5df !important;
      background: #fff !important;
      color: #41594d !important;
    }
    .flashy-background > header > div:nth-child(3) > button:nth-last-child(2):hover {
      border-color: #bdd7c7 !important;
      background: #f4faf6 !important;
    }
    .flashy-background > header > div:nth-child(3) > div[title="Wishlist"] {
      display: none;
    }
    .flashy-background .landing-cart-trigger {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: #f2f7f3;
    }
    .flashy-background .landing-cart-trigger:hover {
      background: #e5f1e9;
    }
    .flashy-background .landing-cart-trigger > span:first-child {
      font-size: 17px !important;
    }
    .flashy-background > header > div:nth-child(3) .authDivider {
      background: #e1e8e2 !important;
    }
    .flashy-background > nav {
      justify-content: center;
      gap: clamp(18px, 3vw, 38px) !important;
      padding: 11px 20px !important;
      border-bottom: 1px solid #e8ece7 !important;
      background: #fff !important;
      scrollbar-width: thin;
    }
    .flashy-background > nav a {
      position: relative;
      color: #64746b !important;
      font-size: 11px !important;
      font-weight: 650 !important;
      text-decoration: none;
    }
    .flashy-background > nav a:hover {
      color: #176b4d !important;
    }
    .flashy-background > section:nth-of-type(1) {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      min-height: 410px !important;
      margin: 30px clamp(16px, 4vw, 60px) 0;
      padding: clamp(44px, 7vw, 86px) clamp(28px, 7vw, 96px) !important;
      border: 1px solid rgba(255, 255, 255, .12);
      border-radius: 26px;
      background: linear-gradient(115deg, #103d30 0%, #145c43 57%, #237958 100%) !important;
      box-shadow: 0 22px 50px rgba(18, 67, 47, .2);
      text-align: left;
    }
    .flashy-background > section:nth-of-type(1)::before,
    .flashy-background > section:nth-of-type(1)::after {
      position: absolute;
      z-index: -1;
      border: 1px solid rgba(225, 251, 233, .15);
      border-radius: 50%;
      content: "";
      pointer-events: none;
    }
    .flashy-background > section:nth-of-type(1)::before {
      top: -245px;
      right: -85px;
      width: 560px;
      height: 560px;
      box-shadow: 0 0 0 44px rgba(225, 251, 233, .035), 0 0 0 90px rgba(225, 251, 233, .025);
    }
    .flashy-background > section:nth-of-type(1)::after {
      right: 15%;
      bottom: -240px;
      width: 390px;
      height: 390px;
      background: radial-gradient(circle, rgba(147, 211, 166, .16), transparent 70%);
    }
    .flashy-background > section:nth-of-type(1) > div:first-child {
      position: relative;
      z-index: 1;
      max-width: 650px !important;
    }
    .flashy-background > section:nth-of-type(1) > div:first-child > span {
      display: inline-flex;
      align-items: center;
      padding: 7px 12px !important;
      border: 1px solid rgba(224, 250, 234, .22);
      border-radius: 99px !important;
      background: rgba(255, 255, 255, .1) !important;
      color: #d3f0dc !important;
      font-size: 10px !important;
      font-weight: 700 !important;
      letter-spacing: .1em;
      text-transform: uppercase;
    }
    .flashy-background > section:nth-of-type(1) h1 {
      max-width: 650px;
      margin: 22px 0 15px !important;
      color: #fff !important;
      font-size: clamp(38px, 6vw, 66px) !important;
      font-weight: 780 !important;
      letter-spacing: -.065em !important;
      line-height: 1.03 !important;
      text-wrap: balance;
    }
    .flashy-background > section:nth-of-type(1) p {
      max-width: 540px;
      margin: 0 0 28px !important;
      color: rgba(239, 250, 243, .78) !important;
      font-size: clamp(14px, 1.6vw, 17px) !important;
      line-height: 1.7;
    }
    .flashy-background > section:nth-of-type(1) > div:first-child > div {
      flex-wrap: wrap;
      gap: 11px !important;
    }
    .flashy-background > section:nth-of-type(1) > div:first-child > div a,
    .flashy-background > section:nth-of-type(1) > div:first-child > div button {
      min-height: 48px;
      padding: 0 20px !important;
      border: 1px solid rgba(255, 255, 255, .28) !important;
      border-radius: 11px !important;
      font-size: 12px !important;
      font-weight: 700 !important;
      text-decoration: none;
    }
    .flashy-background > section:nth-of-type(1) > div:first-child > div a {
      background: #f4c18b !important;
      color: #2b3c30 !important;
      box-shadow: 0 7px 18px rgba(10, 37, 26, .17);
    }
    .flashy-background > section:nth-of-type(1) > div:first-child > div a:hover {
      transform: translateY(-2px);
      background: #ffd2a4 !important;
    }
    .flashy-background > section:nth-of-type(1) > div:first-child > div button {
      background: rgba(255, 255, 255, .08) !important;
      color: #f5fbf7 !important;
    }
    .flashy-background > section:nth-of-type(1) > div:first-child > div button:hover {
      background: rgba(255, 255, 255, .16) !important;
    }
    .flashy-background > section:nth-of-type(1) > div:last-child {
      z-index: 1;
      bottom: 25px !important;
      right: clamp(28px, 7vw, 96px) !important;
      gap: 9px !important;
    }
    .flashy-background > section:nth-of-type(1) > div:last-child span {
      width: 9px !important;
      height: 9px !important;
      border: 1px solid rgba(255, 255, 255, .55);
      box-shadow: 0 2px 6px rgba(0, 0, 0, .15);
    }
    .flashy-background > section:nth-of-type(2) {
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 0 !important;
      margin: 26px clamp(16px, 4vw, 60px) 0;
      padding: 19px 10px !important;
      border: 1px solid #e8ece6 !important;
      border-radius: 16px;
      background: rgba(255, 255, 255, .88) !important;
      box-shadow: 0 8px 22px rgba(34, 57, 41, .045);
    }
    .flashy-background > section:nth-of-type(2) > div {
      min-width: 0;
      padding: 5px 18px;
    }
    .flashy-background > section:nth-of-type(2) > div + div {
      border-left: 1px solid #e9eee9;
    }
    .flashy-background > section:nth-of-type(2) > div > span {
      display: grid;
      width: 42px;
      height: 42px;
      flex: 0 0 42px;
      place-items: center;
      border-radius: 12px;
      background: #edf6ef;
      color: #26734f;
      font-size: 20px !important;
    }
    .flashy-background > section:nth-of-type(2) strong {
      color: #294536;
      font-size: 11px;
      font-weight: 750;
    }
    .flashy-background > section:nth-of-type(2) p {
      margin: 3px 0 0 !important;
      color: #7d8b82 !important;
      font-size: 10px !important;
      line-height: 1.45;
    }
    .flashy-background > section:nth-of-type(3) {
      padding: 62px clamp(20px, 5vw, 72px) !important;
      border-bottom: 1px solid #e8ece6 !important;
      background: #eff3ed !important;
    }
    .flashy-background > section:nth-of-type(3) > div {
      max-width: 1160px !important;
      gap: clamp(28px, 6vw, 80px) !important;
    }
    .flashy-background > section:nth-of-type(3) > div > div:first-child > span {
      color: #347b58 !important;
      font-size: 10px !important;
      font-weight: 800 !important;
      letter-spacing: .16em;
    }
    .flashy-background > section:nth-of-type(3) h2 {
      margin: 12px 0 !important;
      color: #1d392b !important;
      font-size: clamp(27px, 3.2vw, 38px) !important;
      font-weight: 760 !important;
      letter-spacing: -.05em !important;
      line-height: 1.12;
      text-wrap: balance;
    }
    .flashy-background > section:nth-of-type(3) > div > div:first-child > p {
      max-width: 470px !important;
      color: #68796e !important;
      font-size: 13px !important;
      line-height: 1.7;
    }
    .flashy-background > section:nth-of-type(3) > div > div:first-child > a {
      min-height: 45px;
      margin-top: 21px;
      padding: 0 17px !important;
      border-radius: 10px !important;
      background: #176b4d !important;
      box-shadow: 0 7px 16px rgba(23, 107, 77, .15);
      font-size: 11px !important;
      text-decoration: none;
    }
    .flashy-background > section:nth-of-type(3) > div > div:first-child > a:hover {
      transform: translateY(-2px);
      background: #10553c !important;
    }
    .flashy-background > section:nth-of-type(3) > div > div:last-child {
      padding: 25px !important;
      border: 1px solid #e2eae2 !important;
      border-radius: 16px !important;
      background: #fff !important;
      box-shadow: 0 14px 34px rgba(39, 68, 46, .07) !important;
    }
    .flashy-background > section:nth-of-type(3) > div > div:last-child strong {
      color: #294536;
      font-size: 14px;
    }
    .flashy-background > section:nth-of-type(3) > div > div:last-child p {
      margin-top: 8px !important;
      color: #77877c !important;
      font-size: 11px !important;
      line-height: 1.65;
    }
    .flashy-background > main {
      width: 100% !important;
      max-width: 1360px !important;
      padding: 64px clamp(20px, 5vw, 72px) 72px !important;
    }
    .flashy-background > main > div:first-child {
      margin-bottom: 25px !important;
    }
    .flashy-background > main > div:first-child > div {
      padding: 0 !important;
      background: transparent !important;
      backdrop-filter: none !important;
    }
    .flashy-background > main h2 {
      color: #1d392b !important;
      font-size: clamp(26px, 3vw, 34px) !important;
      font-weight: 760 !important;
      letter-spacing: -.05em !important;
    }
    .flashy-background > main > div:first-child p {
      margin-top: 6px !important;
      color: #77877c !important;
      font-size: 12px !important;
      font-weight: 450 !important;
    }
    .flashy-background > main > div:nth-child(2) {
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 238px), 1fr)) !important;
      align-items: stretch;
      gap: 19px !important;
    }
    .flashy-background > main > div:nth-child(2) > p {
      grid-column: 1 / -1;
      margin: 0;
      padding: 30px 22px;
      border: 1px solid #e6ebe5;
      border-radius: 14px;
      background: #fff;
      color: #718177;
      font-size: 12px;
      text-align: center;
    }
    .flashy-background > main > div:nth-child(2) > div {
      min-width: 0;
      border: 1px solid #e7ebe5 !important;
      border-radius: 16px !important;
      background: #fff !important;
      box-shadow: 0 7px 20px rgba(34, 57, 41, .055) !important;
      transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease !important;
    }
    .flashy-background > main > div:nth-child(2) > div:hover {
      transform: translateY(-5px);
      border-color: #c9decf !important;
      box-shadow: 0 17px 30px rgba(34, 57, 41, .11) !important;
    }
    .flashy-background > main > div:nth-child(2) > div > div:first-child {
      height: auto !important;
      aspect-ratio: 1.25;
      overflow: hidden;
      background: #f1f5f1 !important;
    }
    .flashy-background > main > div:nth-child(2) > div > div:first-child > img {
      transition: transform .35s ease;
    }
    .flashy-background > main > div:nth-child(2) > div:hover > div:first-child > img {
      transform: scale(1.045);
    }
    .flashy-background > main > div:nth-child(2) > div > div:first-child > button {
      width: 38px !important;
      height: 38px !important;
      border: 1px solid rgba(32, 58, 42, .08) !important;
      background: rgba(255, 255, 255, .95) !important;
      box-shadow: 0 4px 12px rgba(26, 48, 34, .12) !important;
      font-size: 15px;
    }
    .flashy-background > main > div:nth-child(2) > div > div:first-child > button:hover {
      transform: scale(1.08);
    }
    .flashy-background > main > div:nth-child(2) > div > div:last-child {
      min-height: 146px;
      padding: 16px !important;
    }
    .flashy-background > main > div:nth-child(2) > div > div:last-child > span {
      color: #62806d !important;
      font-size: 9px !important;
      font-weight: 750 !important;
      letter-spacing: .09em;
    }
    .flashy-background > main > div:nth-child(2) > div > div:last-child > h3 {
      display: -webkit-box;
      overflow: hidden;
      min-height: 42px;
      margin: 6px 0 12px !important;
      color: #263d30 !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      letter-spacing: -.02em;
      line-height: 1.45 !important;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    .flashy-background > main > div:nth-child(2) > div > div:last-child > div {
      gap: 10px;
      padding-top: 11px;
      border-top: 1px solid #edf0ec;
    }
    .flashy-background > main > div:nth-child(2) > div > div:last-child > div > div > span {
      color: #176b4d !important;
      font-size: 14px !important;
      font-weight: 800 !important;
      letter-spacing: -.025em;
    }
    .flashy-background > main > div:nth-child(2) > div > div:last-child > div > button {
      min-height: 34px;
      padding: 0 12px !important;
      border: 1px solid #d5e8da !important;
      border-radius: 8px !important;
      background: #eff7f0 !important;
      color: #206847 !important;
      font-size: 10px !important;
      font-weight: 750 !important;
    }
    .flashy-background > main > div:nth-child(2) > div > div:last-child > div > button:hover {
      border-color: #b6d6c0 !important;
      background: #e2f1e5 !important;
    }
    .flashy-background > section:nth-of-type(4) {
      padding: 54px 22px !important;
      background:
        radial-gradient(circle at 85% 20%, rgba(119, 183, 142, .16), transparent 22rem),
        #123f31 !important;
      color: #f4fbf5 !important;
      text-align: center;
    }
    .flashy-background > section:nth-of-type(4) h2 {
      margin: 0 !important;
      color: #fff !important;
      font-size: clamp(25px, 3vw, 32px) !important;
      font-weight: 760 !important;
      letter-spacing: -.045em !important;
    }
    .flashy-background > section:nth-of-type(4) p {
      margin-top: 9px !important;
      color: #c0d8c8 !important;
      font-size: 12px !important;
    }
    .flashy-background > section:nth-of-type(4) form {
      gap: 9px !important;
    }
    .flashy-background > section:nth-of-type(4) input {
      min-width: 0;
      min-height: 45px;
      padding: 0 14px !important;
      border: 1px solid rgba(255, 255, 255, .16) !important;
      border-radius: 10px !important;
      background: rgba(255, 255, 255, .96);
      font-size: 11px;
    }
    .flashy-background > section:nth-of-type(4) form button {
      min-height: 45px;
      border-radius: 10px !important;
      background: #f2c18f !important;
      color: #233d2e !important;
      font-size: 11px !important;
      font-weight: 750 !important;
    }
    .flashy-background > section:nth-of-type(4) form button:hover {
      background: #ffd3a7 !important;
    }
    .flashy-background > section:nth-of-type(4) > div > div {
      color: #bce7c9 !important;
      font-size: 12px !important;
    }
    .flashy-background > footer {
      padding: 48px clamp(20px, 5vw, 72px) 20px !important;
      background: #0e2e25 !important;
      color: #bdcec3 !important;
    }
    .flashy-background > footer > div:first-child {
      max-width: 1360px;
      margin: 0 auto 34px !important;
      gap: 32px !important;
    }
    .flashy-background > footer > div:first-child > div:first-child > div span {
      color: #fff !important;
      font-size: 20px !important;
      letter-spacing: -.04em !important;
    }
    .flashy-background > footer h4 {
      margin: 0 0 14px !important;
      color: #f3f8f4 !important;
      font-size: 12px !important;
      font-weight: 750 !important;
    }
    .flashy-background > footer p,
    .flashy-background > footer li a,
    .flashy-background > footer li button {
      color: #b5c8bc !important;
      font-size: 11px !important;
      line-height: 1.7;
    }
    .flashy-background > footer li a:hover,
    .flashy-background > footer li button:hover {
      color: #e7c495 !important;
    }
    .flashy-background > footer > div:last-child {
      max-width: 1360px;
      margin: 0 auto;
      border-top-color: rgba(255, 255, 255, .12) !important;
      color: #94aca0 !important;
      font-size: 10px !important;
      text-align: center;
    }
    .landing-cart-backdrop {
      background: rgba(14, 35, 27, .52) !important;
      backdrop-filter: blur(5px);
    }
    .landing-cart-drawer {
      border-left: 1px solid #e5ece6;
      background: #fff !important;
      color: #203a2e !important;
    }
    .landing-cart-header {
      border-bottom-color: #e7eee8 !important;
    }
    .landing-cart-header h2 {
      color: #203a2e !important;
      font-size: 20px !important;
      font-weight: 750 !important;
      letter-spacing: -.04em;
    }
    .landing-cart-header span,
    .landing-cart-item-info > span,
    .landing-cart-empty p,
    .landing-cart-footer p {
      color: #77877c !important;
    }
    .landing-cart-close {
      border: 1px solid #e4ebe5 !important;
      background: #f5f8f5 !important;
    }
    .landing-cart-empty > strong,
    .landing-cart-item-info > strong,
    .landing-cart-item-total {
      color: #263e31 !important;
    }
    .landing-cart-empty button,
    .landing-cart-footer button {
      border-radius: 9px !important;
      background: #176b4d !important;
    }
    .landing-cart-empty button:hover,
    .landing-cart-footer button:hover {
      background: #10553c !important;
    }
    .landing-cart-item {
      border-bottom-color: #edf1ed !important;
    }
    .landing-cart-quantity {
      overflow: hidden;
      border-color: #e1e9e2 !important;
    }
    .landing-cart-quantity button {
      background: #f4f8f4 !important;
      color: #286448 !important;
    }
    .landing-cart-quantity button:hover {
      background: #e5f1e7 !important;
    }
    .landing-cart-footer {
      border-top-color: #e7eee8 !important;
      background: #fbfdfb !important;
    }
    @media (max-width: 1050px) {
      .flashy-background > header {
        flex-wrap: wrap;
        gap: 12px !important;
      }
      .flashy-background > header > div:nth-child(2) {
        order: 3;
        max-width: none !important;
        flex: 1 0 100% !important;
      }
      .flashy-background > section:nth-of-type(2) {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
      .flashy-background > section:nth-of-type(2) > div:nth-child(3) {
        border-left: 0;
      }
      .flashy-background > section:nth-of-type(2) > div:nth-child(n + 3) {
        border-top: 1px solid #e9eee9;
        padding-top: 14px;
      }
    }
    @media (max-width: 680px) {
      .flashy-background > header {
        padding: 10px 16px !important;
      }
      .flashy-background > header > div:first-child img {
        width: 40px !important;
        height: 40px !important;
      }
      .flashy-background > header > div:first-child span {
        font-size: 19px !important;
      }
      .flashy-background > header > div:nth-child(3) {
        gap: 7px !important;
      }
      .flashy-background > header > div:nth-child(3) > a {
        display: none !important;
      }
      .flashy-background > header > div:nth-child(3) > button {
        min-height: 35px;
        padding: 0 10px !important;
      }
      .flashy-background > header > div:nth-child(2) {
        min-height: 40px;
      }
      .flashy-background > header > div:nth-child(2) select {
        max-width: 105px;
        padding: 0 7px !important;
        font-size: 10px !important;
      }
      .flashy-background > nav {
        justify-content: flex-start;
        gap: 22px !important;
        padding: 10px 16px !important;
      }
      .flashy-background > nav a {
        font-size: 10px !important;
      }
      .flashy-background > section:nth-of-type(1) {
        min-height: 390px !important;
        margin: 16px 12px 0;
        padding: 42px 25px 58px !important;
        border-radius: 20px;
        text-align: center;
      }
      .flashy-background > section:nth-of-type(1) h1 {
        font-size: clamp(36px, 10vw, 52px) !important;
      }
      .flashy-background > section:nth-of-type(1) p {
        font-size: 14px !important;
      }
      .flashy-background > section:nth-of-type(1) > div:first-child > div a,
      .flashy-background > section:nth-of-type(1) > div:first-child > div button {
        min-height: 43px;
        padding: 0 13px !important;
        font-size: 10px !important;
      }
      .flashy-background > section:nth-of-type(1) > div:first-child > div {
        justify-content: center;
      }
      .flashy-background > section:nth-of-type(1) > div:last-child {
        right: 24px !important;
        bottom: 20px !important;
      }
      .flashy-background > section:nth-of-type(2) {
        margin: 16px 12px 0;
        padding: 10px 8px !important;
        border-radius: 13px;
      }
      .flashy-background > section:nth-of-type(2) > div {
        align-items: flex-start;
        gap: 9px;
        padding: 11px 8px;
      }
      .flashy-background > section:nth-of-type(2) > div > span {
        width: 34px;
        height: 34px;
        flex-basis: 34px;
        border-radius: 10px;
        font-size: 16px !important;
      }
      .flashy-background > section:nth-of-type(2) strong {
        font-size: 10px;
      }
      .flashy-background > section:nth-of-type(2) p {
        font-size: 9px !important;
      }
      .flashy-background > section:nth-of-type(3) {
        padding: 42px 21px !important;
      }
      .flashy-background > section:nth-of-type(3) > div {
        gap: 24px !important;
      }
      .flashy-background > section:nth-of-type(3) > div > div:last-child {
        padding: 19px !important;
      }
      .flashy-background > main {
        padding: 45px 16px 50px !important;
      }
      .flashy-background > main > div:nth-child(2) {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 11px !important;
      }
      .flashy-background > main > div:nth-child(2) > div {
        border-radius: 12px !important;
      }
      .flashy-background > main > div:nth-child(2) > div > div:last-child {
        min-height: 136px;
        padding: 11px !important;
      }
      .flashy-background > main > div:nth-child(2) > div > div:last-child > h3 {
        min-height: 40px;
        font-size: 12px !important;
      }
      .flashy-background > main > div:nth-child(2) > div > div:last-child > div > div > span {
        font-size: 11px !important;
      }
      .flashy-background > main > div:nth-child(2) > div > div:last-child > div > button {
        min-height: 31px;
        padding: 0 8px !important;
      }
      .flashy-background > section:nth-of-type(4) {
        padding: 42px 18px !important;
      }
      .flashy-background > section:nth-of-type(4) form {
        flex-direction: column;
      }
      .flashy-background > section:nth-of-type(4) form button {
        width: 100%;
      }
      .flashy-background > footer {
        padding: 38px 21px 18px !important;
      }
    }
    @media (max-width: 380px) {
      .flashy-background > section:nth-of-type(2) {
        grid-template-columns: 1fr !important;
      }
      .flashy-background > section:nth-of-type(2) > div + div {
        border-top: 1px solid #e9eee9;
        border-left: 0;
      }
      .flashy-background > section:nth-of-type(2) > div {
        align-items: center;
      }
      .flashy-background > main > div:nth-child(2) {
        grid-template-columns: 1fr !important;
      }
      .flashy-background > main > div:nth-child(2) > div > div:first-child {
        aspect-ratio: 1.45;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .flashy-background *,
      .flashy-background *::before,
      .flashy-background *::after {
        scroll-behavior: auto !important;
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
      }
    }
    .landing-cart-trigger {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
    .landing-cart-trigger:focus-visible,
    .landing-cart-close:focus-visible,
    .landing-cart-quantity button:focus-visible,
    .landing-cart-empty button:focus-visible,
    .landing-cart-footer button:focus-visible {
      outline: 3px solid #818cf8;
      outline-offset: 3px;
    }
    .landing-cart-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1200;
      display: flex;
      justify-content: flex-end;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(3px);
    }
    .landing-cart-drawer {
      display: flex;
      width: min(440px, 100%);
      height: 100%;
      flex-direction: column;
      background: #fff;
      color: #0f172a;
      box-shadow: -12px 0 36px rgba(15, 23, 42, 0.18);
      animation: landing-cart-enter .2s ease-out;
    }
    @keyframes landing-cart-enter {
      from { transform: translateX(24px); opacity: .7; }
      to { transform: translateX(0); opacity: 1; }
    }
    .landing-cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 22px;
      border-bottom: 1px solid #e2e8f0;
    }
    .landing-cart-header h2 {
      margin: 0;
      color: #0f172a;
      font-size: 1.25rem;
    }
    .landing-cart-header span {
      color: #64748b;
      font-size: .8rem;
    }
    .landing-cart-close {
      display: grid;
      width: 38px;
      height: 38px;
      place-items: center;
      border: 0;
      border-radius: 50%;
      background: #f1f5f9;
      color: #334155;
      cursor: pointer;
      font-size: 1.5rem;
    }
    .landing-cart-empty {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 28px;
      text-align: center;
    }
    .landing-cart-empty > span {
      font-size: 2.5rem;
    }
    .landing-cart-empty > strong {
      margin-top: 12px;
      font-size: 1.05rem;
    }
    .landing-cart-empty p,
    .landing-cart-footer p {
      color: #64748b;
      font-size: .85rem;
    }
    .landing-cart-empty button,
    .landing-cart-footer button {
      min-height: 42px;
      padding: 0 16px;
      border: 0;
      border-radius: 8px;
      background: #4f46e5;
      color: #fff;
      cursor: pointer;
      font: inherit;
      font-weight: 650;
    }
    .landing-cart-items {
      flex: 1;
      overflow-y: auto;
      padding: 4px 22px;
    }
    .landing-cart-item {
      display: grid;
      grid-template-columns: 58px minmax(0, 1fr) auto;
      align-items: start;
      gap: 12px;
      padding: 18px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .landing-cart-item-image {
      display: grid;
      width: 58px;
      height: 58px;
      place-items: center;
      border-radius: 9px;
      font-size: 1.5rem;
    }
    .landing-cart-item-info {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: 5px;
    }
    .landing-cart-item-info > strong {
      color: #1e293b;
      font-size: .85rem;
      line-height: 1.35;
    }
    .landing-cart-item-info > span {
      color: #64748b;
      font-size: .78rem;
    }
    .landing-cart-item-total {
      color: #0f172a;
      font-size: .83rem;
      white-space: nowrap;
    }
    .landing-cart-quantity {
      display: inline-flex;
      width: max-content;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
    }
    .landing-cart-quantity button {
      width: 30px;
      height: 30px;
      border: 0;
      background: #f8fafc;
      color: #334155;
      cursor: pointer;
      font-size: 1rem;
    }
    .landing-cart-quantity span {
      min-width: 12px;
      text-align: center;
      font-size: .8rem;
    }
    .landing-cart-footer {
      padding: 18px 22px max(18px, env(safe-area-inset-bottom));
      border-top: 1px solid #e2e8f0;
      background: #fff;
    }
    .landing-cart-footer > div {
      display: flex;
      justify-content: space-between;
      font-size: 1rem;
    }
    .landing-cart-footer p {
      margin: 7px 0 15px;
      font-size: .75rem;
    }
    .landing-cart-footer button {
      width: 100%;
    }
    @media (max-width: 480px) {
      .landing-cart-header { padding: 16px; }
      .landing-cart-items { padding: 4px 16px; }
      .landing-cart-footer { padding-right: 16px; padding-left: 16px; }
      .landing-cart-item { grid-template-columns: 48px minmax(0, 1fr) auto; gap: 9px; }
      .landing-cart-item-image { width: 48px; height: 48px; }
    }
    .flashy-background .landing-cart-empty {
      flex: 1;
      justify-content: center;
      padding: 36px 28px;
      background:
        radial-gradient(ellipse at 50% 42%, rgba(234, 244, 235, .76), transparent 58%),
        #fff;
    }
    .flashy-background .landing-cart-empty > span {
      display: grid;
      width: 88px;
      height: 88px;
      place-items: center;
      border: 1px solid #dceade;
      border-radius: 28px;
      background: linear-gradient(145deg, #f1f8f1, #e4f1e7);
      box-shadow: 0 12px 28px rgba(30, 93, 57, .1), inset 0 1px rgba(255, 255, 255, .9);
      font-size: 38px;
      animation: landing-cart-float 3s ease-in-out infinite;
    }
    .flashy-background .landing-cart-empty > strong {
      margin-top: 23px;
      color: #203a2e !important;
      font-size: 21px;
      font-weight: 760;
      letter-spacing: -.045em;
    }
    .flashy-background .landing-cart-empty > p {
      max-width: 250px;
      margin: 7px 0 22px;
      color: #78877d !important;
      font-size: 13px;
      line-height: 1.65;
    }
    .flashy-background .landing-cart-empty > button {
      min-height: 44px;
      padding: 0 20px;
      border: 1px solid #176b4d;
      border-radius: 10px;
      background: linear-gradient(135deg, #21815a, #176b4d) !important;
      box-shadow: 0 7px 16px rgba(23, 107, 77, .17);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
    }
    .flashy-background .landing-cart-empty > button:hover {
      transform: translateY(-2px);
      background: linear-gradient(135deg, #19724d, #10553c) !important;
      box-shadow: 0 10px 20px rgba(23, 107, 77, .23);
    }
    .flashy-background .landing-cart-empty > button:focus-visible {
      outline-color: rgba(42, 139, 94, .55);
    }
    @keyframes landing-cart-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .flashy-background .landing-cart-empty > span {
        animation: none;
      }
    }
  `;

  return (
    <>
      {/* Injecting CSS Keyframes and resets directly into the component */}
      <style>{flashyCSS}</style>

      <div className="flashy-background" style={styles.container}>
        
        {/* 1. TOP ANNOUNCEMENT BAR */}
        <div style={styles.topBar}>
          Shop independent stores, manage your orders, or grow your business with K-Merce.
        </div>

        {/* 2. MAIN HEADER */}
        <header style={styles.header}>
          <div style={styles.logoGroup}>
            <img src="/brand-logo.svg" alt="" style={{ width: '58px', height: '54px', objectFit: 'contain' }} />
            <span style={styles.logoText}>K-Merce</span>
          </div>

          <div style={styles.searchContainer}>
            <select style={styles.searchCategory}>
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home</option>
              <option>Beauty</option>
              <option>Sports</option>
              <option>Books</option>
              <option>Health</option>
              <option>Automotive</option>
              <option>Entertainment</option>
              <option>Other</option>
            </select>
            <input 
              type="text" 
              placeholder="Discover products from independent stores..."
              style={styles.searchInput}
            />
            <button style={styles.searchBtn}>🔍</button>
          </div>

          <div style={styles.userActions}>
            <Link
              to="/marketplace"
              style={{ ...styles.btn, ...styles.btnPrimary, ...styles.marketplaceLink }}
            >
              Browse marketplace
            </Link>
            <div style={styles.iconBadgeContainer} title="Wishlist">
              <span style={styles.actionIcon}>❤️</span>
              <span style={styles.badge}>{wishlist.length}</span>
            </div>
            
            <button
              type="button"
              className="landing-cart-trigger"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
              title="Cart"
            >
              <span style={styles.actionIcon}>🛒</span>
              <span style={styles.badge}>{cartCount}</span>
            </button>

            <div style={styles.authDivider}></div>

            <button
              type="button"
              style={{ ...styles.btn, ...styles.btnOutline }}
              onClick={() => setIsLoginOpen(true)}
            >
              Log In
            </button>
            <button
              type="button"
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={() => setIsRegisterOpen(true)}
            >
              Register
            </button>
          </div>
        </header>

        {/* 3. SUB-NAVIGATION BAR */}
        <nav style={styles.subNav}>
          {['Marketplace', 'Customer accounts', 'Vendor applications', 'Seller workspace', 'Orders & payments', 'Admin operations', 'M-Pesa checkout'].map((item, idx) => (
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
              <Link
                to="/marketplace"
                style={{ ...styles.btn, ...styles.btnHero }}
              >
                Browse marketplace →
              </Link>
              <button
                type="button"
                style={{ ...styles.btn, ...styles.btnHeroSecondary }}
                onClick={() => setIsLoginOpen(true)}
              >
                Existing Member Login
              </button>
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

        {/* 5. MARKETPLACE OVERVIEW */}
        <main style={styles.mainContent}>
          <div style={styles.sectionHeader}>
            <div style={styles.headerGlassBox}>
              <h2 style={styles.sectionTitle}>Explore the marketplace</h2>
              <p style={styles.sectionSub}>Products listed by approved K-Merce vendors.</p>
            </div>
          </div>

          <div style={styles.productGrid}>
            {isLoadingProducts ? (
              <p role="status">Loading products…</p>
            ) : productsError ? (
              <p role="alert">{productsError}</p>
            ) : products.length === 0 ? (
              <p>No products are currently listed by approved vendors.</p>
            ) : randomFeaturedProducts.map((prod) => (
              <div key={prod.id} style={styles.productCard}>
                <div style={{ ...styles.productImage, backgroundColor: '#f1f5f9' }}>
                  {prod.imageUrl && (
                    <img
                      src={new URL(prod.imageUrl, BACKEND_URL).toString()}
                      alt={prod.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                  <button
                    onClick={() => toggleWishlist(prod.id)}
                    style={styles.wishlistBtn}
                    type="button"
                    aria-label={`${wishlist.includes(prod.id) ? 'Remove' : 'Add'} ${prod.name} ${wishlist.includes(prod.id) ? 'from' : 'to'} wishlist`}
                  >
                    {wishlist.includes(prod.id) ? '❤️' : '🤍'}
                  </button>
                </div>

                <div style={styles.productInfo}>
                  <span style={styles.productCategory}>{prod.category}</span>
                  <h3 style={styles.productTitle}>{prod.name}</h3>
                  {prod.storeName && <span style={styles.productCategory}>Sold by {prod.storeName}</span>}

                  <div style={styles.priceRow}>
                    <div>
                      <span style={styles.price}>KSh {Number(prod.price).toLocaleString()}</span>
                    </div>
                    <button
                      type="button"
                      disabled={prod.isAvailable === false}
                      onClick={() => addToCart(prod)}
                      style={{
                        ...styles.addCartBtn,
                        ...(prod.isAvailable === false ? { opacity: 0.55, cursor: 'not-allowed' } : {})
                      }}
                    >
                      {prod.isAvailable === false ? 'Not available' : '+ Add'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* 6. TRUST BADGES */}
        <section style={styles.trustSection}>
          <div style={styles.trustItem}>
            <span style={styles.trustIcon}>🚚</span>
            <div>
              <strong>Marketplace for approved stores</strong>
              <p style={styles.trustDesc}>Browse products listed by K-Merce vendors.</p>
            </div>
          </div>
          <div style={styles.trustItem}>
            <span style={styles.trustIcon}>♙</span>
            <div>
              <strong>Customer account tools</strong>
              <p style={styles.trustDesc}>Verify your account and keep track of your orders.</p>
            </div>
          </div>
          <div style={styles.trustItem}>
            <span style={styles.trustIcon}>▤</span>
            <div>
              <strong>Vendor workspace</strong>
              <p style={styles.trustDesc}>Approved sellers manage their stores, products, and orders.</p>
            </div>
          </div>
          <div style={styles.trustItem}>
            <span style={styles.trustIcon}>⚙</span>
            <div>
              <strong>Administrator tools</strong>
              <p style={styles.trustDesc}>Review vendor applications, stores, accounts, and payments.</p>
            </div>
          </div>
        </section>

        <section id="vendor-application" style={styles.vendorApplication}>
          <div style={styles.vendorApplicationContent}>
            <div>
              <span style={styles.vendorApplicationEyebrow}>SELL ON K-MERCE</span>
              <h2 style={styles.vendorApplicationTitle}>Bring your independent store to K-Merce</h2>
              <p style={styles.vendorApplicationDescription}>
                Apply to join the marketplace, then manage your approved store and product listings from your seller workspace.
              </p>
              <Link to="/vendor-application" style={styles.vendorApplicationButton}>
                Apply to be a vendor
              </Link>
            </div>
            <div style={styles.vendorApplicationPreview}>
              <strong>What happens next?</strong>
              <p style={styles.vendorApplicationNote}>
                Create an account and verify your email. Administrators review vendor applications and store names before seller features are enabled.
              </p>
            </div>
          </div>
        </section>

        {/* 7. NEWSLETTER SECTION */}
        <section style={styles.newsletter}>
          <div style={styles.newsletterContent}>
            <h2>Be part of K-Merce!</h2>
            <p>Shop from independent stores, follow your orders, or apply to sell on the marketplace.</p>
            
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

        {/* 8. K-MERCE FOOTER */}
        <footer style={styles.footer}>
          <div style={styles.footerGrid}>
            <div>
              <div style={{ ...styles.logoGroup, marginBottom: '15px' }}>
                <img src="/brand-logo.svg" alt="" style={{ width: '50px', height: '46px', objectFit: 'contain' }} />
                <span style={{ ...styles.logoText, color: '#FFFFFF' }}>K-Merce</span>
              </div>
              <p style={styles.footerText}>K-Merce brings shoppers and independent stores together, with dedicated tools for customers, vendors, and administrators.</p>
            </div>

            <div>
              <h4 style={styles.footerColTitle}>Account & Portal</h4>
              <ul style={styles.footerList}>
                <li>
                  <button
                    type="button"
                    style={{ ...styles.footerLink, background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
                    onClick={() => setIsLoginOpen(true)}
                  >
                    Member Login
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    style={{ ...styles.footerLink, background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
                    onClick={() => setIsRegisterOpen(true)}
                  >
                    Register New Account
                  </button>
                </li>
                <li><Link to="/vendor-application" style={styles.footerLink}>Apply to sell on K-Merce</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={styles.footerColTitle}>Platform features</h4>
              <ul style={styles.footerList}>
                <li><Link to="/marketplace" style={styles.footerLink}>Browse approved stores</Link></li>
                <li><Link to="/login" style={styles.footerLink}>Customer account</Link></li>
                <li><Link to="/vendor-application" style={styles.footerLink}>Seller workspace</Link></li>
                <li>
                  <a
                    href="#landing-faqs"
                    aria-expanded={areFaqsVisible}
                    aria-controls="landing-faqs"
                    onClick={toggleFaqs}
                    style={styles.footerLink}
                  >
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={styles.footerColTitle}>Checkout & payments</h4>
              <p style={styles.footerText}>Place an order from the marketplace and pay using M-Pesa mobile money.</p>
              <div aria-label="Accepted payment methods" style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '14px' }}>
                <span style={{ color: '#43A047', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.04em' }}>M-PESA</span>
                <span style={{ color: '#E60000', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.04em' }}>airtel money</span>
              </div>
            </div>
          </div>

          <section
            id="landing-faqs"
            aria-labelledby="landing-faq-title"
            hidden={!areFaqsVisible}
            style={{ borderTop: '1px solid #1E293B', padding: '30px 0', marginBottom: '20px' }}
          >
            <h3 id="landing-faq-title" style={{ ...styles.footerColTitle, fontSize: '1.25rem', marginBottom: '12px' }}>
              Frequently Asked Questions
            </h3>
            <details style={{ borderBottom: '1px solid #1E293B', padding: '12px 0' }}>
              <summary style={{ color: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}>
                How do I create an account?
              </summary>
              <p style={styles.footerText}>Choose Register New Account, then verify your email with the one-time code.</p>
            </details>
            <details style={{ borderBottom: '1px solid #1E293B', padding: '12px 0' }}>
              <summary style={{ color: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}>
                How do I place an order?
              </summary>
              <p style={styles.footerText}>Browse approved stores, add products to your cart, and place your order from the marketplace.</p>
            </details>
            <details style={{ borderBottom: '1px solid #1E293B', padding: '12px 0' }}>
              <summary style={{ color: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}>
                Which payment methods are available?
              </summary>
              <p style={styles.footerText}>K-Merce lists M-Pesa and Airtel Money. Available options are confirmed during checkout.</p>
            </details>
            <details style={{ borderBottom: '1px solid #1E293B', padding: '12px 0' }}>
              <summary style={{ color: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}>
                How can I sell on K-Merce?
              </summary>
              <p style={styles.footerText}>Submit a vendor application. After email verification, an administrator reviews it before seller features are enabled.</p>
            </details>
          </section>

          <div style={styles.footerBottom}>
            © 2026 K-Merce Marketplace. Connecting shoppers with independent stores.
          </div>
        </footer>

      </div>
      {isCartOpen && (
        <div
          className="landing-cart-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsCartOpen(false);
          }}
        >
          <section className="landing-cart-drawer" role="dialog" aria-modal="true" aria-labelledby="landing-cart-title">
            <header className="landing-cart-header">
              <div>
                <h2 id="landing-cart-title">Your cart</h2>
                <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
              </div>
              <button
                type="button"
                className="landing-cart-close"
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart"
              >
                ×
              </button>
            </header>
            {cartItems.length === 0 ? (
              <div className="landing-cart-empty">
                <span aria-hidden="true">🛒</span>
                <strong>Your cart is empty</strong>
                <p>Add a product to get started.</p>
                <button type="button" onClick={() => setIsCartOpen(false)}>Continue shopping</button>
              </div>
            ) : (
              <>
                <div className="landing-cart-items">
                  {cartItems.map((item) => (
                    <article className="landing-cart-item" key={item.id}>
                      <span className="landing-cart-item-image" style={{ backgroundColor: '#f1f5f9' }}>
                        {item.imageUrl
                          ? <img src={new URL(item.imageUrl, BACKEND_URL).toString()} alt="" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
                          : '🛍️'}
                      </span>
                      <div className="landing-cart-item-info">
                        <strong>{item.name}</strong>
                        <span>KSh {item.price.toFixed(2)} each</span>
                        <div className="landing-cart-quantity" aria-label={`Quantity of ${item.name}`}>
                          <button type="button" onClick={() => updateCartQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}>−</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateCartQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}>+</button>
                        </div>
                      </div>
                      <strong className="landing-cart-item-total">KSh {(item.price * item.quantity).toLocaleString()}</strong>
                    </article>
                  ))}
                </div>
                <footer className="landing-cart-footer">
                  <div><span>Preview total</span><strong>KSh {cartTotal.toLocaleString()}</strong></div>
                  <p>Visit the live marketplace to place an order and continue to M-Pesa checkout.</p>
                  <button type="button" onClick={() => setIsCartOpen(false)}>Continue shopping</button>
                </footer>
              </>
            )}
          </section>
        </div>
      )}
      {isLoginOpen && <Login isModal onClose={() => setIsLoginOpen(false)} />}
      {isRegisterOpen && <Register isModal onClose={() => setIsRegisterOpen(false)} />}
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
  marketplaceLink: {
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
    whiteSpace: 'nowrap'
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
  vendorApplication: {
    padding: '56px 4%',
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0'
  },
  vendorApplicationContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    alignItems: 'center',
    gap: '40px',
    maxWidth: '1100px',
    margin: '0 auto'
  },
  vendorApplicationEyebrow: {
    color: '#4F46E5',
    fontSize: '.8rem',
    fontWeight: '700',
    letterSpacing: '1px'
  },
  vendorApplicationTitle: {
    margin: '12px 0',
    color: '#0F172A',
    fontSize: '2rem'
  },
  vendorApplicationDescription: {
    maxWidth: '460px',
    color: '#475569',
    lineHeight: 1.6
  },
  vendorApplicationPreview: {
    padding: '24px',
    color: '#334155',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, .06)'
  },
  vendorApplicationButton: {
    display: 'inline-flex',
    minHeight: '46px',
    alignItems: 'center',
    padding: '10px 18px',
    borderRadius: '7px',
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    fontSize: '.95rem',
    fontWeight: '700',
    textDecoration: 'none'
  },
  vendorApplicationNote: {
    margin: '10px 0 0',
    color: '#64748B',
    fontSize: '.8rem',
    lineHeight: 1.5
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
};