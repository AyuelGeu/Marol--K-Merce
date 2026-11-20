import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const [deliveryErrors, setDeliveryErrors] = useState({});
  const [deliveringOrderId, setDeliveringOrderId] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isPublishingProduct, setIsPublishingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState('');
  const [productThumbnail, setProductThumbnail] = useState(null);
  const [productGallery, setProductGallery] = useState([]);
  const [productImageInputKey, setProductImageInputKey] = useState(0);
  const [productError, setProductError] = useState('');
  const [productMessage, setProductMessage] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    inventory: ''
  });
  const location = useLocation();
  const isOrdersPage = location.pathname === '/vendor/orders';
  const isProductsPage = location.pathname === '/vendor/products';
  const navigate = useNavigate();
  const vendorProfile = user.vendorProfile || {};
  const displayName = user.name && user.name !== 'New User' ? user.name : 'Vendor';
  const profilePictureUrl = user.profilePicture
    ? new URL(user.profilePicture, BACKEND_URL).toString()
    : '';
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Member';
  const canListProducts = Boolean(
    vendorProfile.isApproved &&
    storeNameStatus === 'approved' &&
    vendorProfile.storeName?.trim()
  );
  const priorityOrders = [...orders]
    .filter((order) => order.deliveryStatus !== 'delivered' && order.status !== 'cancelled')
    .sort((firstOrder, secondOrder) => Number(secondOrder.total) - Number(firstOrder.total))
    .slice(0, 3);
  const dailySales = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      return {
        key,
        label: date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
        units: 0
      };
    });
    const daysByKey = new Map(days.map((day) => [day.key, day]));
    const today = days[days.length - 1];
    const productsSoldToday = new Map();

    orders.forEach((order) => {
      if (order.status === 'cancelled') return;

      const orderDate = new Date(order.createdAt);
      if (Number.isNaN(orderDate.getTime())) return;
      const orderKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}-${orderDate.getDate()}`;
      const day = daysByKey.get(orderKey);
      if (!day) return;

      (order.items || []).forEach((item) => {
        const quantity = Number(item.quantity);
        if (!Number.isFinite(quantity) || quantity <= 0) return;

        day.units += quantity;
        if (orderKey === today.key) {
          const productName = item.productName || 'Product';
          productsSoldToday.set(productName, (productsSoldToday.get(productName) || 0) + quantity);
        }
      });
    });

    return {
      days,
      todayUnits: today.units,
      todayProducts: [...productsSoldToday.entries()]
        .map(([productName, quantity]) => ({ productName, quantity }))
        .sort((firstProduct, secondProduct) => secondProduct.quantity - firstProduct.quantity)
    };
  }, [orders]);
  const salesChartMax = Math.max(4, Math.ceil(Math.max(...dailySales.days.map((day) => day.units)) / 4) * 4);
  const salesChartTop = 20;
  const salesChartLeft = 44;
  const salesChartPlotWidth = 644;
  const salesChartPlotHeight = 180;
  const salesChartBase = salesChartTop + salesChartPlotHeight;
  const salesChartBandWidth = salesChartPlotWidth / dailySales.days.length;

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

    const confirmDelivery = async (orderId) => {
      setDeliveringOrderId(orderId);
      setDeliveryErrors((errors) => ({ ...errors, [orderId]: '' }));
      try {
        const response = await axios.put(
          `${BACKEND_URL}/api/marketplace/orders/${orderId}/deliver`,
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
          order.id === orderId
            ? { ...order, status: response.data.status, deliveryStatus: response.data.deliveryStatus }
            : order
        )));
      } catch (error) {
        setDeliveryErrors((errors) => ({
          ...errors,
          [orderId]: error.response?.data?.message || 'Unable to confirm delivery and email the customer.'
        }));
      } finally {
        setDeliveringOrderId('');
      }
    };

  const updateProductForm = (event) => {
    const { name, value } = event.target;
    setProductForm((form) => ({ ...form, [name]: value }));
  };

  const updateProductGallery = (event) => {
    const selectedImages = Array.from(event.target.files || []);
    if (selectedImages.length > 5) {
      setProductError('Choose no more than 5 gallery images.');
      setProductGallery([]);
      setProductImageInputKey((key) => key + 1);
      return;
    }
    setProductGallery(selectedImages);
    setProductError('');
  };

  const publishProduct = async (event) => {
    event.preventDefault();
    setIsPublishingProduct(true);
    setProductError('');
    setProductMessage('');
    try {
      const productData = new FormData();
      productData.append('name', productForm.name);
      productData.append('description', productForm.description);
      productData.append('category', productForm.category);
      productData.append('price', String(Number(productForm.price)));
      productData.append('inventory', String(Number(productForm.inventory)));
      if (productThumbnail) {
        productData.append('thumbnail', productThumbnail);
      }
      productGallery.forEach((image) => productData.append('gallery', image));

      const request = editingProductId
        ? axios.put(`${BACKEND_URL}/api/marketplace/products/${editingProductId}`, productData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
            'ngrok-skip-browser-warning': 'true'
          },
          withCredentials: true
        })
        : axios.post(`${BACKEND_URL}/api/marketplace/products`, productData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
            'ngrok-skip-browser-warning': 'true'
          },
          withCredentials: true
        });
      const response = await request;
      if (editingProductId) {
        setProducts((current) => current.map((product) => (
          product._id === editingProductId ? response.data : product
        )));
        setProductMessage('Product updated successfully.');
      } else {
        setProducts((current) => [response.data, ...current]);
        setProductMessage('Product published to the marketplace.');
      }
      setEditingProductId('');
      setProductForm({ name: '', description: '', category: '', price: '', inventory: '' });
      setProductThumbnail(null);
      setProductGallery([]);
      setProductImageInputKey((key) => key + 1);
    } catch (error) {
      setProductError(error.response?.data?.message || 'Unable to save your product. Please try again.');
    } finally {
      setIsPublishingProduct(false);
    }
  };

  const editProduct = (product) => {
    setEditingProductId(product._id);
    setProductForm({
      name: product.name,
      description: product.description || '',
      category: product.category,
      price: String(product.price),
      inventory: String(product.inventory ?? 0)
    });
    setProductThumbnail(null);
    setProductGallery([]);
    setProductImageInputKey((key) => key + 1);
    setProductError('');
    setProductMessage('');
    document.getElementById('vendor-product-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const cancelProductEdit = () => {
    setEditingProductId('');
    setProductForm({ name: '', description: '', category: '', price: '', inventory: '' });
    setProductThumbnail(null);
    setProductGallery([]);
    setProductImageInputKey((key) => key + 1);
    setProductError('');
    setProductMessage('');
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
      <style>{`
        .vendor-workspace,
        .vendor-workspace * {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        }

        .vendor-workspace {
          --vendor-forest: #146b55;
          --vendor-deep: #103c32;
          --vendor-mint: #e7f5ef;
          --vendor-ink: #18352e;
          position: relative;
          isolation: isolate;
          overflow: clip;
          background:
            radial-gradient(ellipse at 82% 4%, rgba(201, 235, 220, .42), transparent 34rem),
            #f4f8f6;
          color: var(--vendor-ink);
        }

        .vendor-workspace .workspace-sidebar {
          border-right-color: rgba(255, 255, 255, .09);
          background: linear-gradient(175deg, #123f34 0%, #0d3029 100%);
          box-shadow: 12px 0 34px rgba(13, 48, 41, .09);
        }

        .vendor-workspace .workspace-brand {
          padding: 5px 8px;
        }

        .vendor-workspace .workspace-brand-mark {
          padding: 5px;
          border: 1px solid rgba(255, 255, 255, .16);
          background: rgba(255, 255, 255, .11);
        }

        .vendor-workspace .workspace-brand-copy strong {
          color: #fff;
          font-size: 13px;
          letter-spacing: .13em;
        }

        .vendor-workspace .workspace-brand-copy small,
        .vendor-workspace .workspace-nav-label,
        .vendor-workspace .workspace-sidebar-foot {
          color: #a9c8bd;
        }

        .vendor-workspace .workspace-nav-label {
          margin-top: 44px;
        }

        .vendor-workspace .workspace-nav-link {
          color: #d3e2dc;
          transition: background .2s ease, color .2s ease, transform .2s ease;
        }

        .vendor-workspace .workspace-nav-link:hover,
        .vendor-workspace .workspace-nav-link.is-active {
          transform: translateX(2px);
          background: rgba(161, 225, 198, .15);
          color: #b6f0d1;
        }

        .vendor-workspace .workspace-nav-link.is-active::before {
          width: 3px;
          height: 22px;
          margin-left: -12px;
          border-radius: 0 4px 4px 0;
          background: #79e0ad;
          content: "";
        }

        .vendor-workspace .workspace-secure-card {
          border-color: rgba(255, 255, 255, .15);
          background: rgba(255, 255, 255, .08);
          color: #f0faf5;
        }

        .vendor-workspace .workspace-secure-card small {
          color: #a9c8bd;
        }

        .vendor-workspace .workspace-live-dot {
          box-shadow: 0 0 0 4px rgba(115, 224, 169, .12);
          background: #79e0ad;
        }

        .vendor-workspace .workspace-topbar {
          position: relative;
          z-index: 1;
          border-bottom-color: #e7efeb;
          background: rgba(255, 255, 255, .82);
          backdrop-filter: blur(14px);
        }

        .vendor-workspace .workspace-breadcrumb {
          color: #7e9189;
          font-weight: 600;
        }

        .vendor-workspace .workspace-breadcrumb > span {
          color: #b4c6be;
        }

        .vendor-workspace .workspace-user-avatar.vendor-avatar {
          overflow: hidden;
          border: 2px solid #fff;
          background: linear-gradient(145deg, #d9f2e6, #a9dec5);
          box-shadow: 0 0 0 1px #d5e9df;
          color: #17684f;
        }

        .vendor-workspace .workspace-user-copy strong {
          color: #263d35;
          font-size: 12px;
        }

        .vendor-workspace .workspace-signout {
          min-height: 35px;
          padding: 0 13px;
          border-color: #dce9e2;
          border-radius: 10px;
          background: #fff;
          color: #4b665a;
          font-size: 11px;
          transition: border-color .2s ease, background .2s ease, color .2s ease;
        }

        .vendor-workspace .workspace-signout:hover {
          border-color: #9dcdb6;
          background: #f0faf5;
          color: #17684f;
        }

        .vendor-workspace .workspace-content {
          max-width: 1540px;
          padding-top: 32px;
          padding-bottom: 34px;
        }

        .vendor-workspace .workspace-welcome {
          position: relative;
          overflow: hidden;
          min-height: 190px;
          align-items: center;
          margin-bottom: 24px;
          padding: 30px clamp(24px, 4vw, 42px);
          border: 1px solid rgba(255, 255, 255, .14);
          border-radius: 22px;
          background:
            radial-gradient(circle at 85% 50%, rgba(139, 221, 175, .24), transparent 17rem),
            linear-gradient(115deg, #124d3e 0%, #18765b 57%, #29956f 100%);
          box-shadow: 0 16px 38px rgba(23, 100, 75, .17);
        }

        .vendor-workspace .workspace-welcome::after {
          position: absolute;
          top: -110px;
          right: 12%;
          width: 300px;
          height: 300px;
          border: 1px solid rgba(255, 255, 255, .13);
          border-radius: 50%;
          box-shadow: 0 0 0 32px rgba(255, 255, 255, .035), 0 0 0 66px rgba(255, 255, 255, .025);
          content: "";
          pointer-events: none;
        }

        .vendor-workspace .workspace-welcome > div,
        .vendor-workspace .workspace-role-chip {
          position: relative;
          z-index: 1;
        }

        .vendor-workspace .workspace-welcome .workspace-eyebrow {
          color: #b9f1d2;
          font-size: 10px;
          letter-spacing: .18em;
        }

        .vendor-workspace .workspace-welcome h1 {
          margin: 0;
          color: #fff;
          font-size: clamp(29px, 3.2vw, 40px);
          font-weight: 760;
          letter-spacing: -.055em;
          line-height: 1.12;
        }

        .vendor-workspace .workspace-welcome p {
          max-width: 520px;
          margin-top: 10px;
          color: rgba(240, 255, 247, .78);
          font-size: 13px;
        }

        .vendor-workspace .workspace-role-chip.vendor-chip {
          padding: 9px 13px;
          border: 1px solid rgba(255, 255, 255, .23);
          background: rgba(255, 255, 255, .12);
          color: #e5fff0;
          font-size: 11px;
          backdrop-filter: blur(8px);
        }

        .vendor-workspace .workspace-role-chip.vendor-chip > span {
          background: #8af0b5;
          box-shadow: 0 0 0 4px rgba(138, 240, 181, .14);
        }

        .vendor-workspace .workspace-card-grid {
          gap: 16px;
          margin-bottom: 22px;
        }

        .vendor-workspace .workspace-info-card {
          position: relative;
          overflow: hidden;
          min-height: 164px;
          padding: 20px;
          border-color: #e4eee8;
          border-radius: 17px;
          background: linear-gradient(150deg, #fff 0%, #fbfefc 100%);
          box-shadow: 0 7px 22px rgba(35, 83, 64, .055);
          transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
        }

        .vendor-workspace .workspace-info-card::after {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #43ae7d, #b9e8cf);
          content: "";
        }

        .vendor-workspace .workspace-info-card:hover {
          transform: translateY(-3px);
          border-color: #c6e3d3;
          box-shadow: 0 13px 28px rgba(35, 83, 64, .1);
        }

        .vendor-workspace .workspace-info-icon {
          width: 36px;
          height: 36px;
          margin-bottom: 14px;
          border-radius: 11px;
          background: #edf7f1;
          color: #328863;
        }

        .vendor-workspace .workspace-info-icon.vendor-icon {
          background: #e4f5eb;
          color: #25825d;
        }

        .vendor-workspace .workspace-info-icon.workspace-icon-gold {
          background: #fff6df;
          color: #c08b28;
        }

        .vendor-workspace .workspace-info-label {
          color: #86978f;
          font-size: 9px;
          letter-spacing: .13em;
        }

        .vendor-workspace .workspace-info-value {
          margin-top: 6px;
          color: #1d3c31;
          font-size: 20px;
        }

        .vendor-workspace .workspace-info-value.workspace-email-value {
          font-size: 14px;
        }

        .vendor-workspace .workspace-info-detail {
          color: #82948b;
          font-size: 10px;
        }

        .vendor-workspace .workspace-panel {
          margin-bottom: 20px;
          border-color: #e3ede7;
          border-radius: 17px;
          background: rgba(255, 255, 255, .96);
          box-shadow: 0 7px 24px rgba(35, 83, 64, .055);
        }

        .vendor-workspace .workspace-panel-heading {
          padding: 23px 24px 18px;
        }

        .vendor-workspace .workspace-panel-heading .workspace-eyebrow {
          color: #358563;
          font-size: 9px;
          letter-spacing: .15em;
        }

        .vendor-workspace .workspace-panel-heading h2 {
          color: #1d3c31;
          font-size: 19px;
          letter-spacing: -.035em;
        }

        .vendor-workspace .workspace-panel-heading p {
          color: #84958d;
          font-size: 11px;
        }

        .vendor-workspace .workspace-status-pill {
          padding: 7px 11px;
          border: 1px solid #d5ecdf;
          background: #edf8f1;
          color: #26734f;
          font-size: 10px;
        }

        .vendor-workspace .workspace-status-pill.is-pending {
          border-color: #f1e4c4;
          background: #fff8e9;
          color: #9c7425;
        }

        .vendor-workspace .vendor-order-notifications {
          background: linear-gradient(135deg, #fff 0%, #fbfefc 100%);
        }

        .vendor-workspace .vendor-daily-sales-content {
          display: grid;
          grid-template-columns: minmax(180px, .7fr) minmax(0, 1.3fr);
          gap: 20px;
          padding: 0 24px 23px;
        }

        .vendor-workspace .vendor-sales-today,
        .vendor-workspace .vendor-sales-history {
          padding: 17px;
          border: 1px solid #e5eee8;
          border-radius: 12px;
          background: #fcfefc;
        }

        .vendor-workspace .vendor-sales-today > span,
        .vendor-workspace .vendor-sales-history > h3 {
          color: #71867b;
          font-size: 10px;
          font-weight: 650;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .vendor-workspace .vendor-sales-today > strong {
          display: block;
          margin: 8px 0 14px;
          color: #1d6b49;
          font-size: 30px;
          line-height: 1;
        }

        .vendor-workspace .vendor-sales-today > strong small {
          margin-left: 6px;
          color: #71867b;
          font-size: 12px;
          font-weight: 500;
        }

        .vendor-workspace .vendor-sales-products {
          display: grid;
          gap: 9px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .vendor-workspace .vendor-sales-products li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: #587267;
          font-size: 11px;
        }

        .vendor-workspace .vendor-sales-products strong {
          color: #254438;
          white-space: nowrap;
        }

        .vendor-workspace .vendor-sales-empty {
          margin: 0;
          color: #84958d;
          font-size: 11px;
        }

        .vendor-workspace .vendor-sales-history > h3 {
          margin: 0 0 14px;
        }

        .vendor-workspace .vendor-sales-chart {
          width: 100%;
          min-width: 0;
        }

        .vendor-workspace .vendor-sales-chart svg {
          display: block;
          width: 100%;
          height: auto;
        }

        .vendor-workspace .vendor-priority-link {
          padding: 8px 11px;
          border: 1px solid #d7eade;
          border-radius: 9px;
          background: #f3faf5;
          color: #26734f;
          transition: background .2s ease, border-color .2s ease;
        }

        .vendor-workspace .vendor-priority-link:hover {
          border-color: #a8d1b8;
          background: #e8f6ed;
          color: #15583b;
          text-decoration: none;
        }

        .vendor-workspace .vendor-priority-list {
          gap: 10px;
          padding: 0 24px 23px;
        }

        .vendor-workspace .vendor-priority-item {
          padding: 13px 14px;
          border-color: #e5eee8;
          border-radius: 11px;
          background: #fcfefc;
          transition: border-color .18s ease, background .18s ease, transform .18s ease;
        }

        .vendor-workspace .vendor-priority-item:hover {
          transform: translateY(-1px);
          border-color: #c6e3d3;
          background: #f7fcf8;
        }

        .vendor-workspace .vendor-priority-rank {
          border-radius: 7px;
          background: #eaf6ee;
          color: #317b53;
        }

        .vendor-workspace .vendor-priority-details strong,
        .vendor-workspace .vendor-product-row strong {
          color: #254438;
        }

        .vendor-workspace .vendor-priority-value {
          color: #23744e;
        }

        .vendor-workspace .vendor-store-name-form > label,
        .vendor-workspace .vendor-product-form-grid > label {
          color: #587267;
          font-size: 11px;
          font-weight: 650;
        }

        .vendor-workspace .vendor-store-name-controls > input,
        .vendor-workspace .vendor-product-form-grid input,
        .vendor-workspace .vendor-product-form-grid textarea {
          min-height: 42px;
          padding: 10px 12px;
          border-color: #dce9e1;
          border-radius: 9px;
          background: #fff;
          color: #254438;
          font-size: 12px;
          transition: border-color .18s ease, box-shadow .18s ease;
        }

        .vendor-workspace .vendor-store-name-controls > input:focus,
        .vendor-workspace .vendor-product-form-grid input:focus,
        .vendor-workspace .vendor-product-form-grid textarea:focus {
          border-color: #48a77a;
          outline: 0;
          box-shadow: 0 0 0 3px rgba(72, 167, 122, .16);
        }

        .vendor-workspace .vendor-store-name-controls > button,
        .vendor-workspace .vendor-product-submit-row > button {
          min-height: 41px;
          padding: 0 16px;
          border: 1px solid #176a4c;
          border-radius: 9px;
          background: linear-gradient(135deg, #25865e, #17684d);
          box-shadow: 0 4px 10px rgba(23, 104, 77, .14);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
        }

        .vendor-workspace .vendor-store-name-controls > button:hover:not(:disabled),
        .vendor-workspace .vendor-product-submit-row > button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 7px 15px rgba(23, 104, 77, .2);
          filter: brightness(1.05);
        }

        .vendor-workspace .vendor-product-form {
          gap: 15px;
          padding: 18px;
          border-color: #e5eee8;
          border-radius: 13px;
          background: linear-gradient(145deg, #f8fbf9, #fff);
        }

        .vendor-workspace .vendor-product-form-grid {
          gap: 14px;
        }

        .vendor-workspace .vendor-product-image-field input[type="file"] {
          min-height: 44px;
          padding: 7px;
          background: #fbfdfb;
        }

        .vendor-workspace .vendor-product-image-field input[type="file"]::file-selector-button {
          margin-right: 10px;
          padding: 7px 10px;
          border: 0;
          border-radius: 6px;
          background: #e8f4ec;
          color: #28714d;
          cursor: pointer;
          font: inherit;
          font-weight: 650;
        }

        .vendor-workspace .vendor-listing-notice {
          border-color: #f0e2bd;
          border-radius: 10px;
          background: #fffaf0;
          color: #8e6e2b;
          line-height: 1.6;
        }

        .vendor-workspace .vendor-product-list {
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
          gap: 20px;
          padding: 8px 22px 24px;
        }

        .vendor-workspace .vendor-product-row {
          display: flex;
          min-width: 0;
          flex-direction: column;
          overflow: hidden;
          padding: 10px;
          border-color: #e3ece6;
          border-radius: 16px;
          background: linear-gradient(160deg, #fff 0%, #fbfdfb 100%);
          box-shadow: 0 7px 22px rgba(30, 75, 55, .055);
          transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
        }

        .vendor-workspace .vendor-product-row:hover {
          border-color: #b8d9c7;
          box-shadow: 0 14px 30px rgba(35, 83, 64, .12);
          transform: translateY(-3px);
        }

        .vendor-workspace .vendor-product-card-media {
          position: relative;
          overflow: hidden;
          width: 100%;
          aspect-ratio: 4 / 3;
          border-radius: 11px;
          background: linear-gradient(145deg, #edf5ef, #e1eee5);
        }

        .vendor-workspace .vendor-product-thumbnail {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .vendor-workspace .vendor-product-image-placeholder {
          display: grid;
          width: 100%;
          height: 100%;
          align-content: center;
          justify-items: center;
          gap: 7px;
          color: #789286;
        }

        .vendor-workspace .vendor-product-image-placeholder > span {
          font-size: 32px;
          line-height: 1;
        }

        .vendor-workspace .vendor-product-image-placeholder > small {
          font-size: 11px;
          font-weight: 650;
        }

        .vendor-workspace .vendor-product-category,
        .vendor-workspace .vendor-product-gallery-count {
          position: absolute;
          display: inline-flex;
          min-height: 26px;
          align-items: center;
          padding: 0 9px;
          border: 1px solid rgba(255, 255, 255, .72);
          border-radius: 999px;
          background: rgba(255, 255, 255, .92);
          box-shadow: 0 2px 8px rgba(19, 55, 39, .1);
          color: #315947;
          font-size: 10px;
          font-weight: 700;
          backdrop-filter: blur(8px);
        }

        .vendor-workspace .vendor-product-category {
          top: 10px;
          left: 10px;
          max-width: calc(100% - 20px);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .vendor-workspace .vendor-product-gallery-count {
          right: 10px;
          bottom: 10px;
          gap: 5px;
          color: #5a6e63;
        }

        .vendor-workspace .vendor-product-gallery-count > span {
          font-size: 12px;
        }

        .vendor-workspace .vendor-product-card-body {
          display: flex;
          min-width: 0;
          flex: 1;
          flex-direction: column;
          padding: 14px 4px 3px;
        }

        .vendor-workspace .vendor-product-card-copy {
          min-width: 0;
        }

        .vendor-workspace .vendor-product-card-copy h3 {
          overflow: hidden;
          margin: 0;
          color: #203d31;
          font-size: 15px;
          font-weight: 750;
          line-height: 1.4;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .vendor-workspace .vendor-product-card-copy p {
          display: -webkit-box;
          min-height: 36px;
          overflow: hidden;
          margin: 6px 0 0;
          color: #77877e;
          font-size: 11px;
          line-height: 1.6;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .vendor-workspace .vendor-product-inventory {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 12px;
          padding: 8px 10px;
          border-radius: 9px;
          background: #f5f8f5;
        }

        .vendor-workspace .vendor-product-inventory > span {
          color: #84958b;
          font-size: 10px;
          font-weight: 650;
        }

        .vendor-workspace .vendor-product-inventory > strong {
          color: #28714d;
          font-size: 10px;
          font-weight: 750;
        }

        .vendor-workspace .vendor-product-inventory.is-empty {
          background: #fff5f2;
        }

        .vendor-workspace .vendor-product-inventory.is-empty > strong {
          color: #ad5144;
        }

        .vendor-workspace .vendor-product-card-footer {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
          margin-top: 15px;
          padding-top: 12px;
          border-top: 1px solid #edf2ee;
        }

        .vendor-workspace .vendor-product-price {
          display: grid;
          min-width: 0;
          gap: 2px;
        }

        .vendor-workspace .vendor-product-price > span {
          color: #98a79e;
          font-size: 9px;
          font-weight: 750;
          letter-spacing: .1em;
        }

        .vendor-workspace .vendor-product-price > strong {
          color: #17684d;
          font-size: 16px;
          font-weight: 800;
          white-space: nowrap;
        }

        .vendor-workspace .vendor-product-edit {
          min-height: 35px;
          padding: 0 12px;
          border: 1px solid #cfe5d7;
          border-radius: 9px;
          background: #f0f8f2;
          color: #26734f;
          cursor: pointer;
          font: inherit;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
          transition: background .18s ease, border-color .18s ease, transform .18s ease;
        }

        .vendor-workspace .vendor-product-edit:hover:not(:disabled) {
          transform: translateY(-1px);
          border-color: #a9d2b8;
          background: #e3f3e8;
        }

        .vendor-workspace .vendor-product-edit:disabled {
          cursor: not-allowed;
          opacity: .55;
        }

        .vendor-workspace .vendor-product-empty {
          display: grid;
          justify-items: center;
          gap: 8px;
          margin: 4px 22px 22px;
          padding: 34px 20px;
          border: 1px dashed #cddfd2;
          border-radius: 14px;
          background: linear-gradient(145deg, #fbfdfb, #f3f8f4);
          color: #71877a;
          text-align: center;
        }

        .vendor-workspace .vendor-product-empty > span {
          color: #438565;
          font-size: 28px;
          line-height: 1;
        }

        .vendor-workspace .vendor-product-empty > strong {
          color: #345746;
          font-size: 13px;
        }

        .vendor-workspace .vendor-product-empty > p {
          max-width: 360px;
          margin: 0;
          font-size: 11px;
        }

        .vendor-workspace .vendor-order-card {
          border-color: #e1ece5;
          border-left-color: #50a77b;
          border-radius: 14px;
          box-shadow: 0 4px 15px rgba(35, 83, 64, .05);
        }

        .vendor-workspace .vendor-order-card:hover {
          border-color: #bfdfcd;
          box-shadow: 0 10px 24px rgba(35, 83, 64, .1);
        }

        .vendor-workspace .vendor-order-status {
          border-color: #d5ecdf;
          background: #edf8f1;
          color: #26734f;
        }

        .vendor-workspace .vendor-order-status.is-cancelled {
          border-color: #f2d3d0;
          background: #fff0ef;
          color: #a23d36;
        }

        .vendor-workspace .workspace-account-panel {
          background: linear-gradient(145deg, #fff, #fbfefc);
        }

        .vendor-workspace .workspace-account-row {
          border-top-color: #edf2ee;
        }

        .vendor-workspace .workspace-account-lock {
          background: #eaf6ee;
          color: #28714d;
        }

        .vendor-workspace .workspace-security-state {
          color: #28714d;
        }

        .vendor-workspace .workspace-text-link {
          color: #287b55;
        }

        .vendor-workspace .workspace-footer {
          color: #84958d;
        }

        .vendor-workspace :is(a, button, input, textarea):focus-visible {
          outline: 3px solid rgba(53, 153, 103, .45);
          outline-offset: 3px;
        }

        @media (max-width: 760px) {
          .vendor-workspace .workspace-sidebar {
            border-bottom-color: rgba(255, 255, 255, .12);
          }

          .vendor-workspace .workspace-nav {
            overflow-x: auto;
            padding: 2px 0 3px;
            scrollbar-width: thin;
          }

          .vendor-workspace .workspace-nav-link {
            flex: 0 0 auto;
          }

          .vendor-workspace .workspace-nav-link.is-active::before {
            display: none;
          }

          .vendor-workspace .workspace-welcome {
            min-height: 170px;
            padding: 24px;
            border-radius: 18px;
          }
        }

        @media (max-width: 600px) {
          .vendor-workspace .workspace-content {
            padding-top: 22px;
          }

          .vendor-workspace .workspace-welcome {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .vendor-workspace .workspace-welcome::after {
            right: -120px;
          }

          .vendor-workspace .workspace-info-card {
            min-height: 145px;
          }

          .vendor-workspace .workspace-panel-heading {
            gap: 12px;
            padding: 19px 17px 15px;
          }

          .vendor-workspace .vendor-priority-list {
            padding-right: 16px;
            padding-left: 16px;
          }

          .vendor-workspace .vendor-daily-sales-content {
            grid-template-columns: 1fr;
            padding-right: 16px;
            padding-left: 16px;
          }

          .vendor-workspace .vendor-priority-item {
            grid-template-columns: auto minmax(0, 1fr);
          }

          .vendor-workspace .vendor-priority-value {
            grid-column: 2;
          }

          .vendor-workspace .vendor-product-form {
            margin-right: 16px;
            margin-left: 16px;
            padding: 13px;
          }

          .vendor-workspace .vendor-product-form-grid {
            grid-template-columns: 1fr;
          }

          .vendor-workspace .vendor-product-description {
            grid-column: auto;
          }

          .vendor-workspace .vendor-product-list,
          .vendor-workspace .vendor-order-list {
            padding-right: 16px;
            padding-left: 16px;
          }

        }

        @media (prefers-reduced-motion: reduce) {
          .vendor-workspace *,
          .vendor-workspace *::before,
          .vendor-workspace *::after {
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
            animation-duration: .01ms !important;
          }
        }
      `}</style>
      <aside className="workspace-sidebar">
        <Link className="workspace-brand" to="/vendor/dashboard">
          <span className="workspace-brand-mark"><img src="/brand-logo.png" alt="" /></span>
          <span className="workspace-brand-copy"><strong>K-MERCE</strong><small>SELLER WORKSPACE</small></span>
        </Link>
        <div className="workspace-nav-label">YOUR WORKSPACE</div>
        <nav className="workspace-nav" aria-label="Vendor navigation">
          <a className={`workspace-nav-link${!isOrdersPage && !isProductsPage ? ' is-active' : ''}`} href={isOrdersPage || isProductsPage ? '/vendor/dashboard#overview' : '#overview'}><span>▦</span>Overview</a>
          <a className="workspace-nav-link" href={isOrdersPage || isProductsPage ? '/vendor/dashboard#store' : '#store'}><span>◇</span>Store profile</a>
          <Link className={`workspace-nav-link${isProductsPage ? ' is-active' : ''}`} to="/vendor/products"><span>▧</span>Products</Link>
          <Link className={`workspace-nav-link${isOrdersPage ? ' is-active' : ''}`} to="/vendor/orders"><span>▤</span>Orders</Link>
          <a className="workspace-nav-link" href={isOrdersPage || isProductsPage ? '/vendor/dashboard#account' : '#account'}><span>♙</span>Account</a>
        </nav>
        <div className="workspace-sidebar-bottom">
          <div className="workspace-secure-card"><span className="workspace-live-dot" /><div><strong>Seller account</strong><small>Role-protected workspace</small></div></div>
          <div className="workspace-sidebar-foot">K-Merce Marketplace · 2026</div>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-breadcrumb">Seller workspace <span>/</span> {isOrdersPage ? 'Orders' : isProductsPage ? 'Products' : 'Overview'}</div>
          <div className="workspace-user-menu">
            <span className="workspace-user-avatar vendor-avatar">
              {profilePictureUrl
                ? <img src={profilePictureUrl} alt="" />
                : (displayName[0] || 'V').toUpperCase()}
            </span>
            <span className="workspace-user-copy"><strong>{displayName}</strong><small>Vendor account</small></span>
            <button className="workspace-signout" type="button" onClick={signOut}>Sign out</button>
          </div>
        </header>

        <div className="workspace-content">
          {!isOrdersPage && !isProductsPage && <>
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

          <section className="workspace-panel vendor-daily-sales" aria-label="Daily product sales">
            <div className="workspace-panel-heading">
              <div>
                <div className="workspace-eyebrow">SALES TRACKING</div>
                <h2>Products sold per day</h2>
                <p>Daily product quantities from paid orders, excluding cancellations.</p>
              </div>
              <span className="workspace-status-pill is-approved">Today</span>
            </div>
            {ordersError ? (
              <p className="vendor-data-error" role="alert">{ordersError}</p>
            ) : isLoadingOrders ? (
              <p className="vendor-data-state">Loading sales data…</p>
            ) : (
              <div className="vendor-daily-sales-content">
                <div className="vendor-sales-today">
                  <span>Units sold today</span>
                  <strong>{dailySales.todayUnits}<small>{dailySales.todayUnits === 1 ? 'unit' : 'units'}</small></strong>
                  {dailySales.todayProducts.length > 0 ? (
                    <ul className="vendor-sales-products">
                      {dailySales.todayProducts.map((product) => (
                        <li key={product.productName}>
                          <span>{product.productName}</span>
                          <strong>{product.quantity} sold</strong>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="vendor-sales-empty">No products sold today.</p>
                  )}
                </div>
                <div className="vendor-sales-history">
                  <h3>Last 7 days</h3>
                  <div className="vendor-sales-chart">
                    <svg viewBox="0 0 700 260" role="img" aria-label="Units sold each day over the last seven days">
                      <title>Products sold over the last seven days</title>
                      {Array.from({ length: 5 }, (_, index) => {
                        const value = salesChartMax * (1 - index / 4);
                        const y = salesChartTop + (salesChartPlotHeight * index) / 4;
                        return (
                          <g key={value}>
                            <line
                              x1={salesChartLeft}
                              x2={688}
                              y1={y}
                              y2={y}
                              stroke="#e8f0ea"
                              strokeDasharray="3 3"
                            />
                            <text
                              x={salesChartLeft - 8}
                              y={y + 3}
                              textAnchor="end"
                              fill="#71867b"
                              fontSize="10"
                            >
                              {value}
                            </text>
                          </g>
                        );
                      })}
                      {dailySales.days.map((day, index) => {
                        const barHeight = (day.units / salesChartMax) * salesChartPlotHeight;
                        const barX = salesChartLeft + index * salesChartBandWidth + (salesChartBandWidth - 44) / 2;
                        const barY = salesChartBase - barHeight;
                        const centerX = barX + 22;
                        return (
                          <g key={day.key}>
                            <title>{`${day.label}: ${day.units} ${day.units === 1 ? 'unit' : 'units'} sold`}</title>
                            <rect
                              x={barX}
                              y={barY}
                              width="44"
                              height={barHeight}
                              rx="5"
                              fill="#43ae7d"
                            />
                            <text
                              x={centerX}
                              y={Math.max(salesChartTop - 2, barY - 8)}
                              textAnchor="middle"
                              fill="#254438"
                              fontSize="11"
                              fontWeight="600"
                            >
                              {day.units}
                            </text>
                            <text
                              x={centerX}
                              y={salesChartBase + 24}
                              textAnchor="middle"
                              fill="#71867b"
                              fontSize="11"
                            >
                              {day.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="workspace-panel vendor-order-notifications" aria-label="Order priority notifications">
            <div className="workspace-panel-heading">
              <div>
                <div className="workspace-eyebrow">ORDER ACTIVITY</div>
                <h2>Order priority notifications</h2>
                <p>Undelivered orders with the highest value are listed first.</p>
              </div>
              <Link className="vendor-priority-link" to="/vendor/orders">View all orders</Link>
            </div>
            {ordersError ? (
              <p className="vendor-data-error" role="alert">{ordersError}</p>
            ) : isLoadingOrders ? (
              <p className="vendor-data-state">Loading order notifications…</p>
            ) : priorityOrders.length === 0 ? (
              <p className="vendor-data-state">No undelivered orders right now.</p>
            ) : (
              <ol className="vendor-priority-list">
                {priorityOrders.map((order, index) => (
                  <li className="vendor-priority-item" key={order.id}>
                    <span className="vendor-priority-rank">Priority {index + 1}</span>
                    <div className="vendor-priority-details">
                      <strong>Order {order.id}</strong>
                      <span>
                        {order.customer.name} · {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <strong className="vendor-priority-value">KSh {Number(order.total).toFixed(2)}</strong>
                  </li>
                ))}
              </ol>
            )}
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

          </>}

          {isProductsPage && <section className="workspace-panel vendor-products-panel" id="products">
            <div className="workspace-panel-heading">
              <div>
                <div className="workspace-eyebrow">YOUR CATALOG</div>
                <h2>Products</h2>
                <p>Publish products customers can discover and update your catalog at any time.</p>
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
            <form className="vendor-product-form" id="vendor-product-form" onSubmit={publishProduct}>
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
                  Price (KSh)
                  <input name="price" type="number" min="1" step="1" value={productForm.price} onChange={updateProductForm} required />
                </label>
                <label>
                  Available inventory
                  <input
                    name="inventory"
                    type="number"
                    min="0"
                    max="1000000000"
                    step="1"
                    value={productForm.inventory}
                    onChange={updateProductForm}
                    required
                  />
                </label>
                <label className="vendor-product-image-field">
                  Product thumbnail (JPG, PNG, WebP, or GIF; max 5 MB)
                  <input
                    key={`${productImageInputKey}-thumbnail`}
                    name="thumbnail"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(event) => setProductThumbnail(event.target.files?.[0] || null)}
                    required={!editingProductId}
                  />
                  {productThumbnail && <span>Selected thumbnail: {productThumbnail.name}</span>}
                  {!productThumbnail && editingProductId && products.find((product) => product._id === editingProductId)?.imageUrl && (
                    <span>Current thumbnail will be kept unless you choose another.</span>
                  )}
                </label>
                <label className="vendor-product-image-field">
                  Gallery images (up to 5; each max 5 MB)
                  <input
                    key={`${productImageInputKey}-gallery`}
                    name="gallery"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={updateProductGallery}
                  />
                  {productGallery.length > 0 ? (
                    <span>Selected: {productGallery.map((image) => image.name).join(', ')}</span>
                  ) : editingProductId && products.find((product) => product._id === editingProductId)?.galleryUrls?.length > 0 ? (
                    <span>Current gallery ({products.find((product) => product._id === editingProductId).galleryUrls.length} images) will be kept unless you choose replacements.</span>
                  ) : (
                    <span>Optional additional product photos.</span>
                  )}
                </label>
                <label className="vendor-product-description">
                  Description
                  <textarea name="description" value={productForm.description} onChange={updateProductForm} maxLength={2000} rows={3} />
                </label>
              </div>
              <div className="vendor-product-submit-row">
                <button type="submit" disabled={!canListProducts || isPublishingProduct}>
                  {isPublishingProduct
                    ? editingProductId ? 'Saving…' : 'Publishing…'
                    : editingProductId ? 'Save changes' : 'Publish product'}
                </button>
                {editingProductId && (
                  <button type="button" onClick={cancelProductEdit} disabled={isPublishingProduct}>
                    Cancel edit
                  </button>
                )}
                {productError && <span className="vendor-store-name-error" role="alert">{productError}</span>}
                {productMessage && <span className="vendor-store-name-success" role="status">{productMessage}</span>}
              </div>
            </form>
            {productsError && <p className="vendor-data-error" role="alert">{productsError}</p>}
            {isLoadingProducts ? (
              <p className="vendor-data-state">Loading products…</p>
            ) : productsError ? null : products.length === 0 ? (
              <div className="vendor-product-empty">
                <span aria-hidden="true">▧</span>
                <strong>Your catalog is ready for its first product</strong>
                <p>Publish a product using the form above and it will appear here for you to manage.</p>
              </div>
            ) : (
              <div className="vendor-product-list">
                {products.map((product) => (
                  <article className="vendor-product-row" key={product._id}>
                    <div className="vendor-product-card-media">
                      {product.imageUrl ? (
                        <img
                          className="vendor-product-thumbnail"
                          src={new URL(product.imageUrl, BACKEND_URL).toString()}
                          alt={product.name}
                        />
                      ) : (
                        <div className="vendor-product-image-placeholder">
                          <span aria-hidden="true">▧</span>
                          <small>Product image</small>
                        </div>
                      )}
                      <span className="vendor-product-category">{product.category}</span>
                      {product.galleryUrls?.length > 0 && (
                        <span className="vendor-product-gallery-count">
                          <span aria-hidden="true">▧</span>
                          {product.galleryUrls.length} {product.galleryUrls.length === 1 ? 'photo' : 'photos'}
                        </span>
                      )}
                    </div>
                    <div className="vendor-product-card-body">
                      <div className="vendor-product-card-copy">
                        <h3 title={product.name}>{product.name}</h3>
                        <p>{product.description?.trim() || 'No description provided for this product.'}</p>
                      </div>
                      <div className={`vendor-product-inventory${product.inventory > 0 ? '' : ' is-empty'}`}>
                        <span>Inventory</span>
                        <strong>{product.inventory > 0 ? `${product.inventory} available` : 'Out of stock'}</strong>
                      </div>
                      <div className="vendor-product-card-footer">
                        <div className="vendor-product-price">
                          <span>PRICE</span>
                          <strong>KSh {Number(product.price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}</strong>
                        </div>
                        <button
                          className="vendor-product-edit"
                          type="button"
                          onClick={() => editProduct(product)}
                          disabled={!canListProducts || Boolean(editingProductId) || isPublishingProduct}
                          aria-label={`Edit ${product.name}`}
                        >
                          Edit listing
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>}

          {isOrdersPage && <section className="workspace-panel vendor-orders-panel" id="orders">
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
                      <span className={`vendor-order-status${order.status === 'cancelled' ? ' is-cancelled' : ''}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="vendor-order-customer">
                      Customer: {order.customer.name}{order.customer.email ? ` · ${order.customer.email}` : ''}
                    </p>
                    <div className="vendor-order-items">
                      {order.items.map((item, index) => (
                        <div key={`${item.productName}-${index}`}>
                          <span>{item.productName} × {item.quantity}</span>
                          <strong>KSh {(item.unitPrice * item.quantity).toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="vendor-order-total"><span>Your order total</span><strong>KSh {order.total.toFixed(2)}</strong></div>
                    <div className="vendor-order-delivery">
                      {order.deliveryStatus === 'delivered' ? (
                        <p className="vendor-delivery-message is-success" role="status">
                          Delivered — confirmation email sent to the customer.
                        </p>
                      ) : order.status === 'cancelled' ? (
                        <p className="vendor-delivery-message">Cancelled orders cannot be marked as delivered.</p>
                      ) : (
                        <button
                          className="vendor-delivery-button"
                          type="button"
                          onClick={() => confirmDelivery(order.id)}
                          disabled={Boolean(deliveringOrderId)}
                        >
                          {deliveringOrderId === order.id ? 'Sending confirmation…' : 'Mark delivered & email customer'}
                        </button>
                      )}
                      {deliveryErrors[order.id] && (
                        <p className="vendor-delivery-message is-error" role="alert">
                          {deliveryErrors[order.id]}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>}

          {!isOrdersPage && !isProductsPage && <>
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
          </>}
        </div>
      </main>
    </div>
  );
}
