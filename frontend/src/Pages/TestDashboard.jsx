import React, { useState } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [timeframe, setTimeframe] = useState('12 Months');

  const navItems = [
    { name: 'Dashboard', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>
    )},
    { name: 'Products', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
    )},
    { name: 'Orders', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
    )},
    { name: 'Customers', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    )},
    { name: 'Analytics', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
    )},
    { name: 'Settings', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 3.03l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1 1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 3.03 2 2 0 0 1-3.03 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-3.03 0 2 2 0 0 1 0-3.03l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-3.03 2 2 0 0 1 3.03 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51z"></path></svg>
    )}
  ];

  const stats = [
    { title: 'Total Revenue', value: '$124,800.00', pct: '+14.2%', pos: true, sparkline: [15, 25, 20, 35, 30, 45, 50] },
    { title: 'Total Orders', value: '3,124', pct: '+8.4%', pos: true, sparkline: [10, 20, 15, 28, 25, 38, 42] },
    { title: 'Average Order Value', value: '$84.50', pct: '-2.1%', pos: false, sparkline: [40, 35, 30, 38, 25, 20, 18] },
    { title: 'Conversion Rate', value: '3.42%', pct: '+0.8%', pos: true, sparkline: [20, 22, 25, 23, 28, 30, 35] }
  ];

  const categories = [
    { name: 'Electronics', pct: 45, color: '#a855f7' },
    { name: 'Apparel', pct: 30, color: '#10b981' },
    { name: 'Home & Living', pct: 15, color: '#06b6d4' },
    { name: 'Others', pct: 10, color: '#f59e0b' }
  ];

  const topProducts = [
    { name: 'Pro Wireless Headset', units: '1,420 units', pct: '85%' },
    { name: 'Minimalist Leather Backpack', units: '1,150 units', pct: '68%' },
    { name: 'Mechanical Keyboard (RGB)', units: '890 units', pct: '52%' },
    { name: 'Ultra-thin Power Bank', units: '620 units', pct: '36%' }
  ];

  const recentOrders = [
    { id: '#ORD-8942', customer: 'Esther Howard', product: 'Pro Wireless Headset', amount: '$149.00', status: 'Completed', date: 'Oct 24, 2026' },
    { id: '#ORD-8941', customer: 'Dianne Russell', product: 'Minimalist Leather Backpack', amount: '$85.00', status: 'Processing', date: 'Oct 24, 2026' },
    { id: '#ORD-8940', customer: 'Cody Fisher', product: 'Mechanical Keyboard (RGB)', amount: '$120.00', status: 'Shipped', date: 'Oct 23, 2026' },
    { id: '#ORD-8939', customer: 'Kristin Watson', product: 'Ultra-thin Power Bank', amount: '$45.00', status: 'Cancelled', date: 'Oct 22, 2026' }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      Completed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' },
      Processing: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' },
      Shipped: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' },
      Cancelled: { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.3)' }
    };
    const current = styles[status] || styles.Completed;
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: current.bg,
        color: current.text,
        border: current.border,
        boxShadow: `0 0 10px ${current.bg}`
      }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#090d16',
      color: '#f3f4f6',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background Neon Glowing Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '15%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none', filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none', filter: 'blur(70px)' }}></div>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); borderRadius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }

        .glass-card {
          background: rgba(17, 24, 39, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease;
        }

        .glass-card:hover {
          border-color: rgba(168, 85, 247, 0.3);
          box-shadow: 0 12px 30px -10px rgba(168, 85, 247, 0.15);
        }

        .nav-btn {
          transition: all 0.2s ease;
        }
        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: #ffffff !important;
        }

        .pulse-dot {
          animation: pulseGlow 2s infinite;
        }

        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.8); }
          70% { box-shadow: 0 0 0 8px rgba(244, 63, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
        }

        .chart-glow {
          filter: drop-shadow(0px 8px 12px rgba(168, 85, 247, 0.4));
        }

        .gradient-text {
          background: linear-gradient(135deg, #a855f7 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* SIDEBAR */}
      <div style={{
        width: '260px',
        backgroundColor: 'rgba(13, 18, 30, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Pulse<span className="gradient-text">Analytics</span>
          </span>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <div
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className="nav-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  color: isActive ? '#ffffff' : '#9ca3af',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  background: isActive ? 'linear-gradient(90deg, rgba(168, 85, 247, 0.25) 0%, rgba(59, 130, 246, 0.1) 100%)' : 'transparent',
                  borderLeft: isActive ? '3px solid #a855f7' : '3px solid transparent',
                  boxShadow: isActive ? '0 4px 20px rgba(168, 85, 247, 0.2)' : 'none'
                }}
              >
                <div style={{ color: isActive ? '#a855f7' : '#6b7280' }}>{item.icon}</div>
                {item.name}
              </div>
            );
          })}
        </div>

        {/* User Profile */}
        <div style={{
          padding: '20px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <img
                src="https://i.pravatar.cc/150?img=11"
                alt="Alex Mercer"
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #a855f7', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', border: '2px solid #0d121e' }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>Marol Ayuel</span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>ayuelgeu34@gmail.com</span>
            </div>
          </div>
          <div style={{ cursor: 'pointer', color: '#6b7280', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <header style={{
          height: '76px',
          backgroundColor: 'rgba(13, 18, 30, 0.6)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          {/* Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '10px 16px',
            width: '320px',
            transition: 'all 0.2s ease'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Search transactions, products, orders..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f3f4f6',
                fontSize: '13px',
                width: '100%'
              }}
            />
          </div>

          {/* Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#d1d5db',
              cursor: 'pointer'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Jan 1, 2026 - Dec 31, 2026
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>

            {/* Notification Bell */}
            <div style={{
              position: 'relative',
              width: '42px',
              height: '42px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d1d5db',
              cursor: 'pointer'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <div className="pulse-dot" style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', backgroundColor: '#f43f5e', borderRadius: '50%' }}></div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Grid */}
        <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Top 4 Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {stats.map((stat, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9ca3af', fontSize: '13px', fontWeight: '600' }}>
                  {stat.title}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ cursor: 'pointer' }}><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                </div>

                <div style={{ margin: '14px 0 10px 0' }}>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.03em' }}>{stat.value}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: stat.pos ? '#34d399' : '#fb7185',
                    backgroundColor: stat.pos ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: stat.pos ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points={stat.pos ? "23 6 13.5 15.5 8.5 10.5 1 18" : "23 18 13.5 8.5 8.5 13.5 1 6"}></polyline>
                    </svg>
                    {stat.pct}
                  </div>

                  {/* Sparkline */}
                  <svg width="70" height="24" viewBox="0 0 70 24" fill="none" stroke={stat.pos ? "#10b981" : "#f43f5e"} strokeWidth="2.5" strokeLinecap="round">
                    <path d={`M 0 ${30 - stat.sparkline[0]} Q 10 ${30 - stat.sparkline[1]}, 20 ${30 - stat.sparkline[2]} T 40 ${30 - stat.sparkline[4]} T 70 ${30 - stat.sparkline[6]}`} fill="none" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Performance Section */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Revenue Performance</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Monthly track record of gross product sales</p>
              </div>

              <div style={{ display: 'flex', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '4px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {['12 Months', '30 Days'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setTimeframe(option)}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: '700',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: timeframe === option ? '#a855f7' : 'transparent',
                      color: timeframe === option ? '#ffffff' : '#9ca3af',
                      boxShadow: timeframe === option ? '0 0 12px rgba(168, 85, 247, 0.4)' : 'none'
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Glowing SVG Chart */}
            <div style={{ position: 'relative', height: '260px', width: '100%' }}>
              <svg width="100%" height="100%" viewBox="0 0 1000 240" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 60, 120, 180, 240].map((y) => (
                  <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                ))}

                {/* Fill Gradient Area */}
                <path
                  d="M0 160 L100 150 L200 155 L300 130 L400 140 L500 110 L600 80 L700 95 L800 65 L900 45 L1000 30 L1000 240 L0 240 Z"
                  fill="url(#chartGradient)"
                />

                {/* Main Glowing Line */}
                <path
                  className="chart-glow"
                  d="M0 160 L100 150 L200 155 L300 130 L400 140 L500 110 L600 80 L700 95 L800 65 L900 45 L1000 30"
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="4"
                />

                {/* Data Points */}
                {[
                  { cx: 100, cy: 150 }, { cx: 200, cy: 155 }, { cx: 300, cy: 130 },
                  { cx: 400, cy: 140 }, { cx: 500, cy: 110 }, { cx: 600, cy: 80 },
                  { cx: 700, cy: 95 }, { cx: 800, cy: 65 }, { cx: 900, cy: 45 }, { cx: 1000, cy: 30 }
                ].map((pt, i) => (
                  <circle key={i} cx={pt.cx} cy={pt.cy} r="5" fill="#090d16" stroke="#06b6d4" strokeWidth="3" />
                ))}
              </svg>

              {/* Glowing Tooltip Card */}
              <div style={{
                position: 'absolute',
                right: '10px',
                top: '-15px',
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                border: '1px solid #a855f7',
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
                padding: '10px 16px',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px', fontWeight: '600' }}>Dec Gross Revenue</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#34d399' }}>$124,800.00</div>
              </div>
            </div>

            {/* X-Axis Months */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', color: '#6b7280', fontSize: '12px', fontWeight: '600', padding: '0 8px' }}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          {/* Middle Row: Sales by Category & Top Selling Products */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Sales by Category */}
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '700', color: '#ffffff' }}>Sales by Category</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Breakdown of active product lines</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
                {/* Donut Chart */}
                <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                  <svg width="160" height="160" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    {/* Electronics 45% */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#a855f7" strokeWidth="12" strokeDasharray="107 238" strokeDashoffset="0" />
                    {/* Apparel 30% */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="71 238" strokeDashoffset="-107" />
                    {/* Home & Living 15% */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" strokeWidth="12" strokeDasharray="35 238" strokeDashoffset="-178" />
                    {/* Others 10% */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="25 238" strokeDashoffset="-213" />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>3,124</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>Orders</div>
                  </div>
                </div>

                {/* Category Legend */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {categories.map((cat) => (
                    <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}` }}></div>
                        <span style={{ fontSize: '13px', color: '#d1d5db', fontWeight: '500' }}>{cat.name}</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>{cat.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '700', color: '#ffffff' }}>Top Selling Products</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Top 4 performers based on unit gross volume</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {topProducts.map((prod) => (
                  <div key={prod.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                      <span style={{ color: '#e5e7eb' }}>{prod.name}</span>
                      <span style={{ color: '#a855f7', fontWeight: '700' }}>{prod.units}</span>
                    </div>
                    {/* Glowing Progress Bar */}
                    <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: prod.pct,
                        background: 'linear-gradient(90deg, #a855f7 0%, #06b6d4 100%)',
                        borderRadius: '10px',
                        boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Recent Orders Section */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Recent Orders</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Check current status metrics of new customer acquisitions</p>
              </div>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                View All Orders &rarr;
              </button>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#6b7280', fontWeight: '600' }}>
                    <th style={{ padding: '12px 16px' }}>Order ID</th>
                    <th style={{ padding: '12px 16px' }}>Customer</th>
                    <th style={{ padding: '12px 16px' }}>Product</th>
                    <th style={{ padding: '12px 16px' }}>Amount</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px', fontWeight: '700', color: '#a855f7' }}>{order.id}</td>
                      <td style={{ padding: '16px', color: '#f3f4f6', fontWeight: '600' }}>{order.customer}</td>
                      <td style={{ padding: '16px', color: '#9ca3af' }}>{order.product}</td>
                      <td style={{ padding: '16px', fontWeight: '700', color: '#ffffff' }}>{order.amount}</td>
                      <td style={{ padding: '16px' }}>{getStatusBadge(order.status)}</td>
                      <td style={{ padding: '16px', color: '#6b7280' }}>{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}