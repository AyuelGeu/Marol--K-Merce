import { useNavigate } from 'react-router-dom'; //[cite: 2]
import React from 'react';

export default function TestDashboard() {
  const navigate = useNavigate(); //[cite: 2]

  const handleLogout = () => { //[cite: 2]
    // Later, you'll clear tokens from local storage here //[cite: 2]
    navigate('/login'); //[cite: 2]
  };

  return (
    <div style={styles.appContainer}>
      {/* Retained from original code as requested to not alter existing sections */}
      <div data-theme="dark" style={{ display: 'none' }}></div> {/*[cite: 2]*/}

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M2 12h4l3-9 5 18 3-9h5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={styles.logoText}>PulseAnalytics</span>
        </div>

        <nav style={styles.navMenu}>
          <a href="#" style={{...styles.navItem, ...styles.navItemActive}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </a>
          <a href="#" style={styles.navItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Products
          </a>
          <a href="#" style={styles.navItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            Orders
          </a>
          <a href="#" style={styles.navItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Customers
          </a>
          <a href="#" style={styles.navItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Analytics
          </a>
          <a href="#" style={styles.navItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </a>
        </nav>

        <div style={styles.userProfile}>
          <img src="IMG_20251225_231512_910.jpg" alt="Ayuel Geu" style={styles.userAvatar} />
          <div style={styles.userInfo}>
            <div style={styles.userName}>Ayuel Geu</div>
            <div style={styles.userEmail}>ayuelgeu34@gmail.com</div>
          </div>
          {/* Integrated original logout functionality here */}
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout"> {/*[cite: 2]*/}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.searchBar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search transactions, products, orders..." style={styles.searchInput} />
          </div>
          <div style={styles.headerActions}>
            <div style={styles.datePicker}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Jan 1, 2026 - Dec 31, 2026
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            <button style={styles.bellBtn}>
              <div style={styles.notificationDot}></div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </button>
          </div>
        </header>

        <div style={styles.dashboardBody}>
          {/* Top Metric Cards */}
          <div style={styles.metricsGrid}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Total Revenue</span>
                <span style={styles.moreIcon}>•••</span>
              </div>
              <div style={styles.cardValue}>$124,800.00</div>
              <div style={styles.cardTrend}>
                <span style={styles.trendUp}>↗ +14.2%</span> <span style={styles.trendText}>vs last month</span>
                <svg width="60" height="20" viewBox="0 0 60 20" style={styles.trendSparkline}><path d="M0 15 Q 10 10 20 12 T 40 5 T 60 2" fill="none" stroke="#10b981" strokeWidth="2"/></svg>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Total Orders</span>
                <span style={styles.moreIcon}>•••</span>
              </div>
              <div style={styles.cardValue}>3,124</div>
              <div style={styles.cardTrend}>
                <span style={styles.trendUp}>↗ +8.4%</span> <span style={styles.trendText}>vs last month</span>
                <svg width="60" height="20" viewBox="0 0 60 20" style={styles.trendSparkline}><path d="M0 18 Q 15 15 30 10 T 60 4" fill="none" stroke="#10b981" strokeWidth="2"/></svg>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Average Order Value</span>
                <span style={styles.moreIcon}>•••</span>
              </div>
              <div style={styles.cardValue}>$84.50</div>
              <div style={styles.cardTrend}>
                <span style={styles.trendDown}>↘ -2.1%</span> <span style={styles.trendText}>vs last month</span>
                <svg width="60" height="20" viewBox="0 0 60 20" style={styles.trendSparkline}><path d="M0 5 Q 10 15 20 12 T 40 18 T 60 10" fill="none" stroke="#ef4444" strokeWidth="2"/></svg>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Conversion Rate</span>
                <span style={styles.moreIcon}>•••</span>
              </div>
              <div style={styles.cardValue}>3.42%</div>
              <div style={styles.cardTrend}>
                <span style={styles.trendUp}>↗ +0.8%</span> <span style={styles.trendText}>vs last month</span>
                <svg width="60" height="20" viewBox="0 0 60 20" style={styles.trendSparkline}><path d="M0 15 Q 20 15 40 5 T 60 2" fill="none" stroke="#10b981" strokeWidth="2"/></svg>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div style={styles.card}>
            <div style={styles.chartHeader}>
              <div>
                <h3 style={styles.sectionTitle}>Revenue Performance</h3>
                <p style={styles.sectionSubtitle}>Monthly track record of gross product sales</p>
              </div>
              <div style={styles.toggleGroup}>
                <button style={{...styles.toggleBtn, ...styles.toggleBtnActive}}>12 Months</button>
                <button style={styles.toggleBtn}>30 Days</button>
              </div>
            </div>
            
            <div style={styles.chartArea}>
              <div style={styles.yAxis}>
                <span>$140k</span><span>$105k</span><span>$70k</span><span>$35k</span><span>$0</span>
              </div>
              <div style={styles.chartMain}>
                {/* Horizontal Grid Lines */}
                <div style={styles.gridLine}></div><div style={styles.gridLine}></div><div style={styles.gridLine}></div><div style={styles.gridLine}></div><div style={styles.gridLine}></div>
                
                {/* Line Graph SVG Approximation */}
                <svg width="100%" height="100%" viewBox="0 0 1000 250" preserveAspectRatio="none" style={styles.svgLine}>
                  <path d="M 0 160 L 90 150 L 180 155 L 270 140 L 360 148 L 450 130 L 540 115 L 630 120 L 720 100 L 810 85 L 900 70 L 1000 65" fill="none" stroke="#3b82f6" strokeWidth="3" />
                  {/* Data Points */}
                  <circle cx="0" cy="160" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
                  <circle cx="90" cy="150" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
                  <circle cx="180" cy="155" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
                  <circle cx="270" cy="140" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
                  <circle cx="360" cy="148" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
                  <circle cx="450" cy="130" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
                  <circle cx="540" cy="115" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
                  <circle cx="630" cy="120" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
                  <circle cx="720" cy="100" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
                  <circle cx="810" cy="85" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
                  <circle cx="900" cy="70" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
                  <circle cx="1000" cy="65" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
                </svg>

                {/* Tooltip on last point */}
                <div style={styles.tooltip}>
                  <div style={styles.tooltipTitle}>Dec Gross Revenue</div>
                  <div style={styles.tooltipValue}>$124,800.00</div>
                </div>
              </div>
            </div>
            <div style={styles.xAxis}>
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>

          {/* Bottom Grid: Donut Chart & Bar Charts */}
          <div style={styles.twoColGrid}>
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Sales by Category</h3>
              <p style={styles.sectionSubtitle}>Breakdown of active product lines</p>
              
              <div style={styles.donutContainer}>
                <div style={styles.donutChartWrapper}>
                  <div style={styles.donutChart}></div>
                  <div style={styles.donutCenter}>
                    <div style={styles.donutCenterValue}>3,124</div>
                    <div style={styles.donutCenterLabel}>Orders</div>
                  </div>
                </div>
                
                <div style={styles.legendContainer}>
                  <div style={styles.legendItem}><span style={{...styles.legendColor, backgroundColor: '#3b82f6'}}></span><span style={styles.legendText}>Electronics</span><span style={styles.legendPercent}>45%</span></div>
                  <div style={styles.legendItem}><span style={{...styles.legendColor, backgroundColor: '#10b981'}}></span><span style={styles.legendText}>Apparel</span><span style={styles.legendPercent}>30%</span></div>
                  <div style={styles.legendItem}><span style={{...styles.legendColor, backgroundColor: '#8b5cf6'}}></span><span style={styles.legendText}>Home & Living</span><span style={styles.legendPercent}>15%</span></div>
                  <div style={styles.legendItem}><span style={{...styles.legendColor, backgroundColor: '#f97316'}}></span><span style={styles.legendText}>Others</span><span style={styles.legendPercent}>10%</span></div>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Top Selling Products</h3>
              <p style={styles.sectionSubtitle}>Top 4 performers based on unit gross volume</p>
              
              <div style={styles.barsContainer}>
                <div style={styles.barItem}>
                  <div style={styles.barHeader}><span>Pro Wireless Headset</span><span style={styles.barValue}>1,420 units</span></div>
                  <div style={styles.barTrack}><div style={{...styles.barFill, width: '100%'}}></div></div>
                </div>
                <div style={styles.barItem}>
                  <div style={styles.barHeader}><span>Minimalist Leather Backpack</span><span style={styles.barValue}>1,150 units</span></div>
                  <div style={styles.barTrack}><div style={{...styles.barFill, width: '80%'}}></div></div>
                </div>
                <div style={styles.barItem}>
                  <div style={styles.barHeader}><span>Mechanical Keyboard (RGB)</span><span style={styles.barValue}>890 units</span></div>
                  <div style={styles.barTrack}><div style={{...styles.barFill, width: '60%'}}></div></div>
                </div>
                <div style={styles.barItem}>
                  <div style={styles.barHeader}><span>Ultra-thin Power Bank</span><span style={styles.barValue}>620 units</span></div>
                  <div style={styles.barTrack}><div style={{...styles.barFill, width: '45%'}}></div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{...styles.card, padding: 0}}>
            <div style={{padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h3 style={styles.sectionTitle}>Recent Orders</h3>
                <p style={styles.sectionSubtitle}>Check current status metrics of new customer acquisitions</p>
              </div>
              <button style={styles.viewAllBtn}>View All Orders →</button>
            </div>
            
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr style={styles.tr}>
                  <td style={styles.tdBold}>#ORD-8942</td>
                  <td style={styles.tdBold}>Esther Howard</td>
                  <td style={styles.tdMuted}>Pro Wireless Headset</td>
                  <td style={styles.tdBold}>$149.00</td>
                  <td style={styles.td}><span style={styles.statusCompleted}>Completed</span></td>
                  <td style={styles.tdMuted}>Oct 24, 2026</td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.tdBold}>#ORD-8941</td>
                  <td style={styles.tdBold}>Dianne Russell</td>
                  <td style={styles.tdMuted}>Minimalist Leather Backpack</td>
                  <td style={styles.tdBold}>$85.00</td>
                  <td style={styles.td}><span style={styles.statusProcessing}>Processing</span></td>
                  <td style={styles.tdMuted}>Oct 24, 2026</td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.tdBold}>#ORD-8940</td>
                  <td style={styles.tdBold}>Cody Fisher</td>
                  <td style={styles.tdMuted}>Mechanical Keyboard (RGB)</td>
                  <td style={styles.tdBold}>$120.00</td>
                  <td style={styles.td}><span style={styles.statusShipped}>Shipped</span></td>
                  <td style={styles.tdMuted}>Oct 23, 2026</td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.tdBold}>#ORD-8939</td>
                  <td style={styles.tdBold}>Kristin Watson</td>
                  <td style={styles.tdMuted}>Ultra-thin Power Bank</td>
                  <td style={styles.tdBold}>$45.00</td>
                  <td style={styles.td}><span style={styles.statusCancelled}>Cancelled</span></td>
                  <td style={styles.tdMuted}>Oct 22, 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#111827',
  },
  sidebar: {
    width: '260px',
    backgroundColor: 'white',
    borderRight: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
  },
  sidebarHeader: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    backgroundColor: '#3b82f6',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: '700',
    fontSize: '18px',
  },
  navMenu: {
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    borderRadius: '8px',
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '15px',
  },
  navItemActive: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  userProfile: {
    padding: '20px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    fontSize: '14px',
  },
  userEmail: {
    fontSize: '12px',
    color: '#64748b',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
  },
  mainContent: {
    marginLeft: '260px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: '72px',
    backgroundColor: 'white',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '400px',
    padding: '10px 16px',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    color: '#111827',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  datePicker: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569',
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
  },
  bellBtn: {
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px',
    color: '#64748b',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
  },
  notificationDot: {
    position: 'absolute',
    top: '6px',
    right: '8px',
    width: '6px',
    height: '6px',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
  },
  dashboardBody: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
  },
  moreIcon: {
    color: '#94a3b8',
    cursor: 'pointer',
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  cardTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    position: 'relative',
  },
  trendUp: {
    color: '#10b981',
    fontWeight: '600',
    backgroundColor: '#dcfce7',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  trendDown: {
    color: '#ef4444',
    fontWeight: '600',
    backgroundColor: '#fee2e2',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  trendText: {
    color: '#94a3b8',
  },
  trendSparkline: {
    position: 'absolute',
    right: 0,
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
  },
  toggleGroup: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    padding: '4px',
    borderRadius: '8px',
  },
  toggleBtn: {
    border: 'none',
    background: 'none',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  toggleBtnActive: {
    backgroundColor: 'white',
    color: '#3b82f6',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  chartArea: {
    display: 'flex',
    height: '280px',
    gap: '16px',
    position: 'relative',
  },
  yAxis: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: '#94a3b8',
    fontSize: '12px',
    paddingBottom: '20px', // to align with x-axis space
  },
  chartMain: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    borderTop: '1px dashed #e2e8f0',
    height: '25%',
  },
  svgLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  tooltip: {
    position: 'absolute',
    right: '-10px',
    top: '15px',
    backgroundColor: '#111827',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  tooltipTitle: {
    color: '#9ca3af',
    marginBottom: '2px',
  },
  tooltipValue: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#10b981',
  },
  xAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: '45px', // offset for yAxis
    color: '#94a3b8',
    fontSize: '12px',
    marginTop: '16px',
  },
  twoColGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  donutContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '32px',
    padding: '0 24px',
  },
  donutChartWrapper: {
    position: 'relative',
    width: '180px',
    height: '180px',
  },
  donutChart: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'conic-gradient(#3b82f6 0% 45%, #10b981 45% 75%, #8b5cf6 75% 90%, #f97316 90% 100%)',
    position: 'relative',
  },
  donutCenter: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    width: '140px',
    height: '140px',
    backgroundColor: 'white',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterValue: {
    fontSize: '24px',
    fontWeight: '700',
  },
  donutCenterLabel: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  legendContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
    marginLeft: '48px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
  },
  legendColor: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
    marginRight: '12px',
  },
  legendText: {
    flex: 1,
    color: '#475569',
    fontWeight: '500',
  },
  legendPercent: {
    fontWeight: '700',
  },
  barsContainer: {
    marginTop: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  barItem: {},
  barHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  barValue: {
    fontWeight: '700',
  },
  barTrack: {
    height: '8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: '4px',
  },
  viewAllBtn: {
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHead: {
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #f1f5f9',
    borderBottom: '1px solid #f1f5f9',
  },
  th: {
    textAlign: 'left',
    padding: '16px 24px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '16px 24px',
    fontSize: '14px',
  },
  tdBold: {
    padding: '16px 24px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },
  tdMuted: {
    padding: '16px 24px',
    fontSize: '14px',
    color: '#64748b',
  },
  statusCompleted: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusProcessing: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusShipped: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusCancelled: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
};