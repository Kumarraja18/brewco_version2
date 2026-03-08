import React, { useState, useEffect, useCallback, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAdminDashboardStats,
  getPendingUsers,
  getAllUsers,
  getUserFullDetails,
  approveUser,
  rejectUser,
  deactivateUser,
  activateUser,
  getAllCafes,
  verifyCafe,
  rejectCafeApp,
  deleteCafe
} from '../api'
import '../styles/admin-dashboard.css'
import { AuthContext } from '../context/AuthContext'

// ── Helpers ──
const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (d) =>
  d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })

const formatFullDate = (d) =>
  d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const initials = (first, last) =>
  ((first?.[0] || '') + (last?.[0] || '')).toUpperCase()

// ── Bar Chart Data (static visual) ──
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const randomBars = () => DAYS.map(() => [
  Math.floor(Math.random() * 14) + 2,
  Math.floor(Math.random() * 12) + 1,
  Math.floor(Math.random() * 10) + 1,
])

// ── Component ──
export default function AdminDashboard({ user }) {
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data
  const [stats, setStats] = useState(null)
  const [pendingUsers, setPendingUsers] = useState([])
  const [allUsers, setAllUsersState] = useState([])
  const [allCafes, setAllCafes] = useState([])
  const [loading, setLoading] = useState(true)

  // Clock
  const [now, setNow] = useState(new Date())

  // Modal
  const [modal, setModal] = useState(null) // { type: 'view' | 'approve' | 'reject', userId }
  const [modalData, setModalData] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Toast
  const [toast, setToast] = useState(null) // { type: 'success'|'error', title, message }

  // Chart bars
  const [bars] = useState(randomBars)

  // ── Data Loading ──
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const [s, p, a, c] = await Promise.all([
        getAdminDashboardStats(),
        getPendingUsers(),
        getAllUsers(),
        getAllCafes()
      ])
      setStats(s)
      setPendingUsers(p)
      setAllUsersState(a)
      setAllCafes(c || [])
    } catch (err) {
      console.error('Dashboard load error:', err)
      showToast('error', 'Load Error', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ── Toast ──
  const showToast = (type, title, message) => {
    setToast({ type, title, message })
    setTimeout(() => setToast(null), 4000)
  }

  // ── Modal Actions ──
  const openViewModal = async (userId) => {
    setModal({ type: 'view', userId })
    setModalLoading(true)
    try {
      const data = await getUserFullDetails(userId)
      setModalData(data)
    } catch (err) {
      showToast('error', 'Error', err.message)
      setModal(null)
    } finally {
      setModalLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    try {
      const result = await approveUser(userId)
      showToast('success', 'User Approved!', result.message)
      setModal(null)
      setModalData(null)
      loadDashboard()
    } catch (err) {
      showToast('error', 'Approval Failed', err.message)
    }
  }

  const handleReject = async (userId) => {
    try {
      await rejectUser(userId)
      showToast('success', 'User Rejected', 'User has been removed from the system.')
      setModal(null)
      setModalData(null)
      loadDashboard()
    } catch (err) {
      showToast('error', 'Rejection Failed', err.message)
    }
  }

  const handleDeactivate = async (userId) => {
    try {
      await deactivateUser(userId)
      showToast('success', 'User Deactivated', 'User account has been deactivated.')
      loadDashboard()
    } catch (err) {
      showToast('error', 'Error', err.message)
    }
  }

  const handleActivate = async (userId) => {
    try {
      const result = await activateUser(userId)
      showToast('success', 'User Activated', result.message || 'User account has been activated.')
      loadDashboard()
    } catch (err) {
      showToast('error', 'Error', err.message)
    }
  }

  const handleVerifyCafe = async (cafeId) => {
    try {
      await verifyCafe(cafeId)
      showToast('success', 'Cafe Verified!', 'The cafe has been successfully verified.')
      loadDashboard()
    } catch (err) {
      showToast('error', 'Verification Failed', err.message)
    }
  }

  const handleRejectCafe = async (cafeId) => {
    try {
      await rejectCafeApp(cafeId)
      showToast('success', 'Cafe Rejected', 'The cafe application has been rejected.')
      loadDashboard()
    } catch (err) {
      showToast('error', 'Rejection Failed', err.message)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // ── Render ──
  if (!user || user.role?.toUpperCase() !== 'ADMIN') {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>⛔ Access Denied</h2>
        <p>You must be logged in as admin to view this page.</p>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      {/* ── SIDEBAR ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <div className="logo-icon">☕</div>
            <span>Brew & Co</span>
          </div>

          <div className="admin-sidebar-profile">
            <div className="admin-sidebar-avatar">
              {initials(user.firstName, user.lastName)}
            </div>
            <div className="admin-sidebar-profile-info">
              <h4>{user.firstName} {user.lastName}</h4>
              <p>Admin</p>
            </div>
          </div>


        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-sidebar-nav-label">Navigation</div>
          <button
            className={`admin-sidebar-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveNav('dashboard')}
          >
            <span className="nav-icon">📊</span> Dashboard
          </button>
          <button
            className={`admin-sidebar-nav-item ${activeNav === 'users' ? 'active' : ''}`}
            onClick={() => setActiveNav('users')}
          >
            <span className="nav-icon">👥</span> Users
            {stats?.pendingUsers > 0 && (
              <span className="nav-badge">{stats.pendingUsers}</span>
            )}
          </button>
          <button
            className={`admin-sidebar-nav-item ${activeNav === 'cafes' ? 'active' : ''}`}
            onClick={() => setActiveNav('cafes')}
          >
            <span className="nav-icon">🏪</span> Cafes
            {allCafes.filter(c => !c.isVerified && c.isActive).length > 0 && (
              <span className="nav-badge">{allCafes.filter(c => !c.isVerified && c.isActive).length}</span>
            )}
          </button>




        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-uptime">
            <span className="dot"></span> Uptime 99.9%
          </div>
          <button className="admin-sidebar-logout" onClick={handleLogout}>
            ↪ Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="admin-main">
        {/* Top bar */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div className="admin-breadcrumb">
              Home &gt; <span>{activeNav === 'dashboard' ? 'Dashboard' : activeNav === 'users' ? 'Users' : 'Cafes'}</span>
            </div>
          </div>
          <div className="admin-topbar-right">
            <span className="user-link">{user.firstName} {user.lastName}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">
          {loading ? (
            <div className="admin-loading">
              <div className="spinner"></div> Loading dashboard…
            </div>
          ) : activeNav === 'dashboard' ? (
            <DashboardView
              stats={stats}
              pendingUsers={pendingUsers}
              now={now}
              bars={bars}
              allUsers={allUsers}
              onView={openViewModal}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ) : activeNav === 'users' ? (
            <UsersView
              allUsers={allUsers}
              onView={openViewModal}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
            />
          ) : (
            <CafesView
              allCafes={allCafes}
              onVerify={handleVerifyCafe}
              onReject={handleRejectCafe}
              onDelete={async (cafeId) => {
                try {
                  await deleteCafe(cafeId)
                  showToast('success', 'Cafe Deleted', 'Cafe has been permanently deleted.')
                  loadDashboard()
                } catch (err) {
                  showToast('error', 'Delete Failed', err.message)
                }
              }}
            />
          )}
        </div>


      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => { setModal(null); setModalData(null) }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{modal.type === 'view' ? '👤 User Details' : modal.type === 'approve' ? '✅ Approve User' : '❌ Reject User'}</h3>
              <button className="admin-modal-close" onClick={() => { setModal(null); setModalData(null) }}>✕</button>
            </div>

            <div className="admin-modal-body">
              {modalLoading ? (
                <div className="admin-loading"><div className="spinner"></div> Loading details…</div>
              ) : modalData ? (
                <>
                  {/* Personal Details */}
                  <div className="admin-modal-section">
                    <h4>👤 Personal Information</h4>
                    <div className="admin-modal-detail-grid">
                      <DetailItem label="Full Name" value={`${modalData.firstName} ${modalData.lastName}`} />
                      <DetailItem label="Email" value={modalData.email} />
                      <DetailItem label="Phone" value={modalData.phoneNumber} />
                      <DetailItem label="Gender" value={modalData.gender} />
                      <DetailItem label="Date of Birth" value={modalData.dateOfBirth} />
                      <DetailItem label="Role" value={modalData.role} />
                      <DetailItem label="Status" value={modalData.isActive ? 'Active' : 'Pending'} />
                      <DetailItem label="Registered" value={formatDate(modalData.createdAt)} />
                    </div>
                  </div>

                  {/* Addresses */}
                  {modalData.addresses && modalData.addresses.length > 0 && (
                    <div className="admin-modal-section">
                      <h4>📍 Addresses</h4>
                      {modalData.addresses.map((addr, i) => (
                        <div key={i} className="admin-modal-detail-grid" style={{ marginBottom: '.5rem' }}>
                          <DetailItem label="Street" value={addr.street} />
                          <DetailItem label="City" value={addr.city} />
                          <DetailItem label="State" value={addr.state} />
                          <DetailItem label="Postal Code" value={addr.postalCode} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Work Experience */}
                  {modalData.workExperiences && modalData.workExperiences.length > 0 && (
                    <div className="admin-modal-section">
                      <h4>💼 Work Experience</h4>
                      {modalData.workExperiences.map((w, i) => (
                        <div key={i} className="admin-modal-detail-grid" style={{ marginBottom: '.5rem' }}>
                          <DetailItem label="Company" value={w.companyName} />
                          <DetailItem label="Position" value={w.position} />
                          <DetailItem label="Years" value={w.years?.toString()} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Government Proofs */}
                  {modalData.governmentProofs && modalData.governmentProofs.length > 0 && (
                    <div className="admin-modal-section">
                      <h4>🪪 Government Proofs</h4>
                      {modalData.governmentProofs.map((g, i) => (
                        <div key={i} className="admin-modal-detail-grid" style={{ marginBottom: '.5rem' }}>
                          <DetailItem label="Type" value={g.proofType} />
                          <DetailItem label="Number" value={g.proofNumber} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {modalData && !modalData.isActive && (
              <div className="admin-modal-footer">
                <button className="modal-btn cancel" onClick={() => { setModal(null); setModalData(null) }}>Close</button>
                <button className="modal-btn reject" onClick={() => handleReject(modalData.id)}>Reject</button>
                <button className="modal-btn approve" onClick={() => handleApprove(modalData.id)}>Approve & Send Password</button>
              </div>
            )}

            {modalData && modalData.isActive && (
              <div className="admin-modal-footer">
                <button className="modal-btn cancel" onClick={() => { setModal(null); setModalData(null) }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          <span className="toast-icon">{toast.type === 'success' ? '✅' : '❌'}</span>
          <div className="toast-content">
            <h4>{toast.title}</h4>
            <p>{toast.message}</p>
          </div>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </div>
  )
}

// ── Sub-component: DetailItem ──
function DetailItem({ label, value }) {
  return (
    <div className="admin-modal-detail">
      <span className="detail-label">{label}</span>
      <span className={`detail-value ${!value ? 'empty' : ''}`}>{value || 'Not provided'}</span>
    </div>
  )
}

// ══════════════════════════════════
//  DASHBOARD VIEW
// ══════════════════════════════════
function DashboardView({ stats, pendingUsers, now, bars, allUsers, onView, onApprove, onReject }) {
  const activeUsersCount = allUsers.filter(u => u.isActive).length
  const totalCount = allUsers.length

  // Donut percentages  
  const activePercent = totalCount > 0 ? Math.round((activeUsersCount / totalCount) * 100) : 0
  const pendingPercent = 100 - activePercent

  return (
    <>
      {/* ── STAT CARDS ── */}
      <div className="admin-stat-cards">
        <div className="admin-stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-sublabel">{formatDate(new Date().toISOString())}</div>
          <div className="stat-value">{stats?.totalUsers || 0}</div>
          <div className="stat-icon">👥</div>
          <div className="stat-dots">
            <span className="active"></span>
            <span className="active"></span>
            <span></span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-label">Pending Approvals</div>
          <div className="stat-sublabel">Awaiting your review</div>
          <div className="stat-value" style={{ color: stats?.pendingUsers > 0 ? '#e67e22' : '#2e241f' }}>
            {stats?.pendingUsers || 0}
          </div>
          <div className="stat-icon">📨</div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-label">Registered Users</div>
          <div className="stat-sublabel">On your platform</div>
          <div className="stat-value">{stats?.activeUsers || 0}</div>
          <div className="stat-icon">👤</div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-label">Active Orders</div>
          <div className="stat-sublabel">Across all cafés right now</div>
          <div className="stat-value" style={{ color: stats?.activeOrders > 0 ? '#27ae60' : '#2e241f' }}>
            {stats?.activeOrders || 0}
          </div>
          <div className="stat-icon">☕</div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-label">Occupied Tables</div>
          <div className="stat-sublabel">{stats?.occupiedTables || 0} of {stats?.totalTables || 0} tables</div>
          <div className="stat-value">{stats?.occupiedTables || 0}</div>
          <div className="stat-icon">🪑</div>
        </div>

        <div className="admin-stat-card clock">
          <div className="stat-value">{formatTime(now)}</div>
          <div className="clock-date">{formatFullDate(now)}</div>
        </div>
      </div>

      {/* ── MIDDLE GRID: Activity | Visitors | Projects ── */}
      <div className="admin-grid">
        {/* Users Activity Bar Chart */}
        <div className="admin-widget">
          <div className="admin-widget-head">
            <div>
              <h3>Users Activity</h3>
              <p>Users vs returning</p>
            </div>
            <div className="admin-widget-actions">
              <button>↻</button>
              <button>⚙</button>
            </div>
          </div>
          <div className="admin-widget-body">
            <div className="admin-chart-bars">
              {bars.map((group, i) => (
                <div className="admin-chart-bar-group" key={i}>
                  <div className="admin-chart-bar brown" style={{ height: `${group[0] * 10}px` }}></div>
                  <div className="admin-chart-bar amber" style={{ height: `${group[1] * 10}px` }}></div>
                  <div className="admin-chart-bar dark" style={{ height: `${group[2] * 10}px` }}></div>
                </div>
              ))}
            </div>
            <div className="admin-chart-labels">
              {DAYS.map(d => <span key={d}>{d}</span>)}
            </div>
          </div>
        </div>

        {/* Visitors Donut */}
        <div className="admin-widget">
          <div className="admin-widget-head">
            <div>
              <h3>Visitors</h3>
              <p>Visitors (last month)</p>
            </div>
            <div className="admin-widget-actions">
              <button>↻</button>
              <button>⚙</button>
            </div>
          </div>
          <div className="admin-widget-body">
            <div className="admin-donut-wrapper">
              <div
                className="admin-donut"
                style={{
                  background: `conic-gradient(
                    #6f4e37 0% ${activePercent}%,
                    #a67c52 ${activePercent}% ${activePercent + Math.round(pendingPercent / 2)}%,
                    #2e241f ${activePercent + Math.round(pendingPercent / 2)}% 100%
                  )`,
                }}
              >
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <span className="donut-label" style={{ fontSize: '.6rem', color: '#8b6f63' }}>Active</span>
                  <span className="donut-value" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2e241f' }}>
                    {activeUsersCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* ── BOTTOM GRID: Sales | Coffee Image + Line Chart ── */}
      <div className="admin-grid-2col">
        {/* Sales */}
        <div className="admin-widget">
          <div className="admin-widget-head">
            <div>
              <h3>Sales</h3>
              <p>Sales activity by period you selected</p>
            </div>
            <div className="admin-widget-actions">
              <button>↻</button>
              <button>⚙</button>
            </div>
          </div>
          <div className="admin-widget-body">
            <div className="admin-sales-date">{formatFullDate(now)}</div>
            <div className="admin-sales-items">
              <div className="admin-sales-item">
                <span className="sale-label">In Queue</span>
                <span className="sale-value">12%</span>
              </div>
              <div className="admin-sales-item">
                <span className="sale-label">Shipped Products</span>
                <span className="sale-value">13%</span>
              </div>
              <div className="admin-sales-item">
                <span className="sale-label">Returned Products</span>
                <span className="sale-value">12%</span>
              </div>
              <div className="admin-sales-item">
                <span className="sale-label">Progress Today</span>
                <span className="sale-value">1%</span>
              </div>
            </div>
            <img
              src="https://images.pexels.com/photos/2074122/pexels-photo-2074122.jpeg?w=400&h=150&fit=crop"
              alt="Coffee beans"
              className="admin-coffee-image"
            />
            <div className="admin-data-refresh">Data refreshes every 15 seconds.</div>
          </div>
        </div>

        {/* Sales & Event Line Chart */}
        <div className="admin-widget">
          <div className="admin-widget-head">
            <div>
              <h3>Sales & Event</h3>
              <p>Event "Purchase Button"</p>
            </div>
            <div className="admin-widget-actions">
              <button>↻</button>
              <button>⚙</button>
            </div>
          </div>
          <div className="admin-widget-body">
            <div className="admin-line-chart">
              <svg viewBox="0 0 300 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Grid lines */}
                <line x1="0" y1="26" x2="300" y2="26" stroke="#ece5dc" strokeWidth="0.5" />
                <line x1="0" y1="52" x2="300" y2="52" stroke="#ece5dc" strokeWidth="0.5" />
                <line x1="0" y1="78" x2="300" y2="78" stroke="#ece5dc" strokeWidth="0.5" />
                <line x1="0" y1="104" x2="300" y2="104" stroke="#ece5dc" strokeWidth="0.5" />

                {/* Line path */}
                <polyline
                  points="0,100 50,90 100,70 150,85 200,40 250,30 300,20"
                  stroke="#2e241f"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data dots */}
                {[[0, 100], [50, 90], [100, 70], [150, 85], [200, 40], [250, 30], [300, 20]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke="#2e241f" strokeWidth="2" />
                ))}
              </svg>
            </div>
            <div className="admin-line-chart-labels">
              {['Feb 10', 'Feb 11', 'Feb 12', 'Feb 13'].map(l => <span key={l}>{l}</span>)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ══════════════════════════════════
//  USERS VIEW
// ══════════════════════════════════
function UsersView({ allUsers, onView, onActivate, onDeactivate }) {
  const [filter, setFilter] = useState('all')

  const filtered = allUsers.filter(u => {
    if (filter === 'all') return true
    if (filter === 'active') return u.isActive
    if (filter === 'pending') return !u.isActive
    if (filter === 'admin') return u.role === 'ADMIN'
    if (filter === 'customer') return u.role === 'CUSTOMER'
    if (filter === 'cafe_owner') return u.role === 'CAFE_OWNER'
    return true
  })

  return (
    <div className="admin-users-table-wrapper">
      <div className="admin-users-table-head">
        <h3>All Users ({filtered.length})</h3>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          {['all', 'active', 'pending', 'admin', 'customer', 'cafe_owner'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '.3rem .7rem',
                borderRadius: '6px',
                border: filter === f ? '2px solid #6f4e37' : '1px solid #d4c0a8',
                background: filter === f ? '#6f4e37' : '#fff',
                color: filter === f ? '#f5e9dc' : '#6f4e37',
                fontSize: '.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {f === 'cafe_owner' ? 'Café Owner' : f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-no-data">
          <div className="no-data-icon">📭</div>
          <p>No users found for this filter.</p>
        </div>
      ) : (
        <table className="admin-full-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Last Login</th>
              <th>Logins</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="user-cell">
                    <div className="cell-avatar">{initials(u.firstName, u.lastName)}</div>
                    <div className="cell-info">
                      <h5>{u.firstName} {u.lastName}</h5>
                      <p>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${u.role?.toLowerCase()}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${u.isActive ? 'approved' : 'pending'}`}>
                    {u.isActive ? '● Active' : '○ Pending'}
                  </span>
                </td>
                <td>{formatDate(u.createdAt)}</td>
                <td>{formatDate(u.lastLoginAt)}</td>
                <td>{u.loginCount || 0}</td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn view" onClick={() => onView(u.id)}>View</button>
                    {u.role !== 'ADMIN' && (
                      u.isActive ? (
                        <button className="action-btn reject" onClick={() => onDeactivate(u.id)}>Deactivate</button>
                      ) : (
                        <button className="action-btn approve" onClick={() => onActivate(u.id)}>Activate</button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ══════════════════════════════════
//  CAFES VIEW
// ══════════════════════════════════
function CafesView({ allCafes, onVerify, onReject, onDelete }) {
  const [filter, setFilter] = useState('all')

  const filtered = allCafes.filter(cafe => {
    if (filter === 'all') return true
    if (filter === 'pending') return !cafe.isVerified && cafe.isActive
    if (filter === 'verified') return cafe.isVerified
    if (filter === 'rejected') return !cafe.isVerified && !cafe.isActive
    return true
  })

  const pendingCount = allCafes.filter(c => !c.isVerified && c.isActive).length
  const verifiedCount = allCafes.filter(c => c.isVerified).length
  const rejectedCount = allCafes.filter(c => !c.isVerified && !c.isActive).length

  const getCafeStatus = (cafe) => {
    if (cafe.isVerified) return { label: '● Verified', cls: 'approved' }
    if (!cafe.isActive) return { label: '✕ Rejected', cls: 'rejected' }
    return { label: '○ Pending', cls: 'pending' }
  }

  return (
    <div className="admin-users-table-wrapper">
      <div className="admin-users-table-head">
        <h3>All Cafes ({filtered.length})</h3>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All (${allCafes.length})` },
            { key: 'pending', label: `Pending (${pendingCount})` },
            { key: 'verified', label: `Verified (${verifiedCount})` },
            { key: 'rejected', label: `Rejected (${rejectedCount})` },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '.3rem .7rem',
                borderRadius: '6px',
                border: filter === f.key ? '2px solid #6f4e37' : '1px solid #d4c0a8',
                background: filter === f.key ? '#6f4e37' : '#fff',
                color: filter === f.key ? '#f5e9dc' : '#6f4e37',
                fontSize: '.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="admin-no-data">
          <div className="no-data-icon">🏪</div>
          <p>No cafes found for this filter.</p>
        </div>
      ) : (
        <table className="admin-full-table">
          <thead>
            <tr>
              <th>Cafe Name</th>
              <th>Owner</th>
              <th>Location</th>
              <th>GST / FSSAI</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Reg Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(cafe => {
              const status = getCafeStatus(cafe)
              return (
                <tr key={cafe.id}>
                  <td>
                    <div className="user-cell">
                      <div className="cell-avatar" style={{ background: cafe.isVerified ? '#27ae60' : !cafe.isActive ? '#c0392b' : '#e67e22' }}>
                        {cafe.name ? cafe.name[0].toUpperCase() : 'C'}
                      </div>
                      <div className="cell-info">
                        <h5>{cafe.name}</h5>
                        <p style={{ fontSize: '0.72rem', color: '#9ca3af' }}>ID #{cafe.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-info">
                      <h5>{cafe.owner?.firstName} {cafe.owner?.lastName}</h5>
                      <p>{cafe.contactNumber}</p>
                    </div>
                  </td>
                  <td>
                    <div className="cell-info">
                      <h5>{cafe.city}, {cafe.state}</h5>
                      <p>{cafe.zipCode}</p>
                    </div>
                  </td>
                  <td>
                    <div className="cell-info">
                      <h5>GST: {cafe.gstNumber || 'N/A'}</h5>
                      <p>FSSAI: {cafe.fssaiLicense || 'N/A'}</p>
                    </div>
                  </td>
                  <td>
                    <div className="cell-info">
                      <h5>{cafe.openingTime || '—'} – {cafe.closingTime || '—'}</h5>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                  <td>{formatDate(cafe.createdAt)}</td>
                  <td>
                    <div className="action-btns">
                      {!cafe.isVerified && cafe.isActive && (
                        <button className="action-btn approve" onClick={() => onVerify(cafe.id)}>Verify</button>
                      )}
                      {cafe.isVerified && (
                        <button className="action-btn reject" onClick={() => onReject(cafe.id)}>Revoke</button>
                      )}
                      {!cafe.isVerified && !cafe.isActive && (
                        <button className="action-btn approve" onClick={() => onVerify(cafe.id)}>Re-verify</button>
                      )}
                      <button
                        className="action-btn reject"
                        style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}
                        onClick={() => {
                          if (window.confirm(`Permanently delete "${cafe.name}"? This cannot be undone.`)) {
                            onDelete(cafe.id)
                          }
                        }}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
