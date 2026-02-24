import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axiosClient'
import toast from 'react-hot-toast'
import '../styles/dashboard.css'

const SIDEBAR_ITEMS = [
  { key: 'overview', icon: '📊', label: 'Overview' },
  { key: 'orders', icon: '📦', label: 'Orders' },
  { key: 'menu', icon: '📋', label: 'Menu' },
  { key: 'tables', icon: '🪑', label: 'Tables' },
  { key: 'chefs', icon: '👨‍🍳', label: 'Chefs' },
  { key: 'waiters', icon: '🍽️', label: 'Waiters' },
  { key: 'bookings', icon: '📅', label: 'Bookings' },
]

export default function CafeOwnerDashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [cafes, setCafes] = useState([])
  const [selectedCafe, setSelectedCafe] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  // Sub-data
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [staff, setStaff] = useState([])
  const [bookings, setBookings] = useState([])

  // Modals
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [showAddTable, setShowAddTable] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [staffForm, setStaffForm] = useState({ firstName: '', lastName: '', email: '', role: 'CHEF' })
  const [tableForm, setTableForm] = useState({ tableNumber: '', capacity: 2, tableType: 'STANDARD' })
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', type: 'VEG', categoryId: '' })
  const [categoryForm, setCategoryForm] = useState({ name: '', displayOrder: 1 })

  // Assign waiter modal
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignOrderId, setAssignOrderId] = useState(null)
  const [selectedWaiterId, setSelectedWaiterId] = useState('')

  useEffect(() => { loadCafes() }, [])

  const loadCafes = async () => {
    try {
      const res = await api.get('/cafe-owner/cafes')
      setCafes(res.data || [])
      if (res.data?.length > 0) {
        setSelectedCafe(res.data[0])
        await loadCafeData(res.data[0].id)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  const loadCafeData = async (cafeId) => {
    try {
      const [dashRes, ordRes, tabRes, catRes, itemRes, staffRes, bookRes] = await Promise.all([
        api.get(`/cafe-owner/cafes/${cafeId}/dashboard`),
        api.get(`/cafe-owner/cafes/${cafeId}/orders`),
        api.get(`/cafe-owner/cafes/${cafeId}/tables`),
        api.get(`/cafe-owner/cafes/${cafeId}/menu/categories`),
        api.get(`/cafe-owner/cafes/${cafeId}/menu/items`),
        api.get(`/cafe-owner/cafes/${cafeId}/staff`),
        api.get(`/cafe-owner/cafes/${cafeId}/bookings`)
      ])
      setDashboard(dashRes.data)
      setOrders(ordRes.data || [])
      setTables(tabRes.data || [])
      setCategories(catRes.data || [])
      setMenuItems(itemRes.data || [])
      setStaff(staffRes.data || [])
      setBookings(bookRes.data || [])
    } catch { /* ignore */ }
  }

  // Confirm order + assign waiter
  const confirmAndAssign = async (orderId, waiterId) => {
    try {
      await api.put(`/cafe-owner/cafes/${selectedCafe.id}/orders/${orderId}/assign`, {
        waiterId: waiterId ? parseInt(waiterId) : null
      })
      toast.success('Order confirmed & waiter assigned!')
      setShowAssignModal(false)
      setAssignOrderId(null)
      setSelectedWaiterId('')
      loadCafeData(selectedCafe.id)
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const confirmOrder = async (orderId) => {
    const waiters = staff.filter(s => s.role === 'WAITER')
    if (waiters.length > 0) {
      setAssignOrderId(orderId)
      setShowAssignModal(true)
    } else {
      // No waiters — just confirm
      try {
        await api.put(`/cafe-owner/cafes/${selectedCafe.id}/orders/${orderId}/confirm`)
        toast.success('Order confirmed!')
        loadCafeData(selectedCafe.id)
      } catch (err) { toast.error('Failed to confirm') }
    }
  }

  const addStaff = async () => {
    try {
      const res = await api.post(`/cafe-owner/cafes/${selectedCafe.id}/staff`, staffForm)
      toast.success(res.data?.message || 'Staff added! Login password has been sent to their email.', {
        duration: 5000,
        style: { border: '1px solid #16a34a', padding: '16px', color: '#16a34a' }
      })
      setShowAddStaff(false)
      setStaffForm({ firstName: '', lastName: '', email: '', role: staffForm.role })
      loadCafeData(selectedCafe.id)
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const addTable = async () => {
    try {
      await api.post(`/cafe-owner/cafes/${selectedCafe.id}/tables`, tableForm)
      toast.success('Table added!')
      setShowAddTable(false)
      setTableForm({ tableNumber: '', capacity: 2, tableType: 'STANDARD' })
      loadCafeData(selectedCafe.id)
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const addMenuItem = async () => {
    try {
      const payload = { ...itemForm, category: { id: parseInt(itemForm.categoryId) } }
      await api.post(`/cafe-owner/cafes/${selectedCafe.id}/menu/items`, payload)
      toast.success('Menu item added!')
      setShowAddItem(false)
      setItemForm({ name: '', description: '', price: '', type: 'VEG', categoryId: '' })
      loadCafeData(selectedCafe.id)
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const addCategory = async () => {
    try {
      await api.post(`/cafe-owner/cafes/${selectedCafe.id}/menu/categories`, categoryForm)
      toast.success('Category added!')
      setShowAddCategory(false)
      setCategoryForm({ name: '', displayOrder: categories.length + 1 })
      loadCafeData(selectedCafe.id)
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  if (loading) return <div className="dashboard-page"><div className="brew-spinner" /></div>

  if (cafes.length === 0) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="empty-state__icon">🏪</div>
          <div className="empty-state__text">No café registered yet</div>
          <button className="brew-btn brew-btn--primary" onClick={() => navigate('/cafe-setup')}>Set Up Your Café</button>
        </div>
      </div>
    )
  }

  const chefs = staff.filter(s => s.role === 'CHEF')
  const waiters = staff.filter(s => s.role === 'WAITER')
  const pendingOrders = orders.filter(o => o.status === 'PLACED')

  return (
    <div className="owner-layout">
      {/* ─────── LEFT SIDEBAR ─────── */}
      <aside className="owner-sidebar">
        <div className="owner-sidebar__header">
          <div style={{ fontSize: '1.5rem' }}>☕</div>
          <div>
            <div className="owner-sidebar__cafe-name">{selectedCafe?.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--brew-muted)' }}>
              {selectedCafe?.isVerified ? '✅ Verified' : '⏳ Pending'}
            </div>
          </div>
        </div>

        <nav className="owner-sidebar__nav">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.key}
              className={`owner-sidebar__item ${activeTab === item.key ? 'owner-sidebar__item--active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="owner-sidebar__item-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.key === 'orders' && pendingOrders.length > 0 && (
                <span className="owner-sidebar__badge">{pendingOrders.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="owner-sidebar__footer">
          <div style={{ fontSize: '0.75rem', color: 'var(--brew-muted)' }}>
            Logged in as<br /><strong>{user?.firstName} {user?.lastName}</strong>
          </div>
        </div>
      </aside>

      {/* ─────── MAIN CONTENT ─────── */}
      <main className="owner-main">

        {/* ══════ OVERVIEW ══════ */}
        {activeTab === 'overview' && dashboard && (
          <>
            <h2 className="owner-main__title">Dashboard Overview</h2>

            {/* Revenue Row */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div className="stat-card stat-card--revenue">
                <div className="stat-card__icon">💰</div>
                <div className="stat-card__value">₹{parseFloat(dashboard.totalRevenue || 0).toLocaleString()}</div>
                <div className="stat-card__label">Total Revenue</div>
              </div>
              <div className="stat-card stat-card--revenue">
                <div className="stat-card__icon">📈</div>
                <div className="stat-card__value">₹{parseFloat(dashboard.todayRevenue || 0).toLocaleString()}</div>
                <div className="stat-card__label">Today's Revenue</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">📦</div>
                <div className="stat-card__value">{dashboard.todayOrders || 0}</div>
                <div className="stat-card__label">Today's Orders</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">🎯</div>
                <div className="stat-card__value">{dashboard.deliveredOrders || 0}</div>
                <div className="stat-card__label">Completed Orders</div>
              </div>
            </div>

            {/* Order Status Row */}
            <h3 className="section-title" style={{ margin: '1.5rem 0 0.75rem' }}>Order Pipeline</h3>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-card__icon">⏳</div><div className="stat-card__value">{dashboard.pendingOrders}</div><div className="stat-card__label">Pending</div></div>
              <div className="stat-card"><div className="stat-card__icon">✅</div><div className="stat-card__value">{dashboard.confirmedOrders}</div><div className="stat-card__label">Confirmed</div></div>
              <div className="stat-card"><div className="stat-card__icon">🔥</div><div className="stat-card__value">{dashboard.preparingOrders}</div><div className="stat-card__label">In Kitchen</div></div>
              <div className="stat-card"><div className="stat-card__icon">🔔</div><div className="stat-card__value">{dashboard.readyOrders}</div><div className="stat-card__label">Ready</div></div>
            </div>

            {/* Resources Row */}
            <h3 className="section-title" style={{ margin: '1.5rem 0 0.75rem' }}>Resources</h3>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-card__icon">🪑</div><div className="stat-card__value">{dashboard.totalTables}</div><div className="stat-card__label">Tables ({dashboard.availableTables} free)</div></div>
              <div className="stat-card"><div className="stat-card__icon">👨‍🍳</div><div className="stat-card__value">{dashboard.totalChefs}</div><div className="stat-card__label">Chefs</div></div>
              <div className="stat-card"><div className="stat-card__icon">🍽️</div><div className="stat-card__value">{dashboard.totalWaiters}</div><div className="stat-card__label">Waiters</div></div>
              <div className="stat-card"><div className="stat-card__icon">📋</div><div className="stat-card__value">{dashboard.totalMenuItems}</div><div className="stat-card__label">Menu Items</div></div>
            </div>

            {/* Pending Orders quick action */}
            {pendingOrders.length > 0 && (
              <>
                <h3 className="section-title" style={{ margin: '1.5rem 0 0.75rem' }}>🔔 Pending Orders ({pendingOrders.length})</h3>
                <div className="cards-grid">
                  {pendingOrders.slice(0, 4).map(o => (
                    <div key={o.id} className="glass-card order-card glass-card--accent">
                      <div className="order-card__header">
                        <span className="order-card__ref">#{o.orderRef}</span>
                        <span className="status-badge status-badge--placed">PLACED</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--brew-muted)' }}>{o.orderType}</div>
                      <div className="order-card__total"><span>Total</span><span>₹{o.grandTotal}</span></div>
                      <div className="order-card__actions">
                        <button className="brew-btn brew-btn--success brew-btn--sm" onClick={() => confirmOrder(o.id)}>✓ Confirm & Assign</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ══════ ORDERS ══════ */}
        {activeTab === 'orders' && (
          <>
            <h2 className="owner-main__title">All Orders ({orders.length})</h2>

            {/* Flow info */}
            <div className="glass-card" style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(139,94,60,0.05)' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--brew-muted)', fontWeight: 500 }}>
                <strong>Flow:</strong> You confirm & assign waiter → Waiter sends to kitchen → Chef prepares → Chef marks ready → Waiter delivers
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="empty-state"><div className="empty-state__icon">📦</div><div className="empty-state__text">No orders yet</div></div>
            ) : (
              <div className="cards-grid">
                {orders.map(o => (
                  <div key={o.id} className={`glass-card order-card ${o.status === 'PLACED' ? 'glass-card--accent' : ''}`}>
                    <div className="order-card__header">
                      <span className="order-card__ref">#{o.orderRef}</span>
                      <span className={`status-badge status-badge--${o.status.toLowerCase().replace('_', '-')}`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--brew-muted)' }}>{o.orderType} • ₹{o.grandTotal}</div>
                    {o.assignedWaiter && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--brew-brown)' }}>🍽️ {o.assignedWaiter.firstName}</div>
                    )}
                    {o.status === 'PLACED' && (
                      <div className="order-card__actions">
                        <button className="brew-btn brew-btn--success brew-btn--sm" onClick={() => confirmOrder(o.id)}>Confirm & Assign</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════ MENU ══════ */}
        {activeTab === 'menu' && (
          <>
            <div className="section-header">
              <h2 className="owner-main__title">Menu Items ({menuItems.length})</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="brew-btn brew-btn--secondary brew-btn--sm" onClick={() => setShowAddCategory(true)}>+ Add Category</button>
                <button className="brew-btn brew-btn--primary brew-btn--sm" onClick={() => setShowAddItem(true)}>+ Add Item</button>
              </div>
            </div>

            {/* Category chips */}
            {categories.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {categories.map(cat => (
                  <span key={cat.id} className="status-badge status-badge--confirmed" style={{ fontSize: '0.82rem', padding: '0.3rem 0.8rem' }}>
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {menuItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">📋</div>
                <div className="empty-state__text">No menu items yet</div>
                <div className="empty-state__subtext">{categories.length === 0 ? 'Add categories first, then add menu items' : 'Click "+ Add Item" to add your first menu item'}</div>
              </div>
            ) : (
              <div className="cards-grid">
                {menuItems.map(item => (
                  <div key={item.id} className="glass-card menu-item-card">
                    <div className="menu-item-card__image">{item.imageUrl ? <img src={item.imageUrl} alt="" /> : '🍽️'}</div>
                    <div className="menu-item-card__info">
                      <div className="menu-item-card__name"><span className={`menu-item-card__type menu-item-card__type--${item.type?.toLowerCase()}`} />{item.name}</div>
                      <div className="menu-item-card__price">₹{item.price}</div>
                      <span className={`status-badge ${item.isAvailable ? 'status-badge--active' : 'status-badge--inactive'}`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      {item.isAddon && <span className="status-badge status-badge--confirmed" style={{ marginLeft: '0.25rem' }}>Add-on</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════ TABLES ══════ */}
        {activeTab === 'tables' && (
          <>
            <div className="section-header">
              <h2 className="owner-main__title">Tables ({tables.length})</h2>
              <button className="brew-btn brew-btn--primary brew-btn--sm" onClick={() => setShowAddTable(true)}>+ Add Table</button>
            </div>
            <div className="table-grid">
              {tables.map(t => (
                <div key={t.id} className="glass-card table-card">
                  <div className="table-card__number">T{t.tableNumber}</div>
                  <div className="table-card__type">{t.tableType}</div>
                  <div className="table-card__capacity">{t.capacity} seats</div>
                  <span className={`status-badge status-badge--${t.status.toLowerCase()}`} style={{ marginTop: '0.5rem' }}>{t.status}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══════ CHEFS ══════ */}
        {activeTab === 'chefs' && (
          <>
            <div className="section-header">
              <h2 className="owner-main__title">Chefs ({chefs.length})</h2>
              <button className="brew-btn brew-btn--primary brew-btn--sm" onClick={() => { setStaffForm(f => ({ ...f, role: 'CHEF' })); setShowAddStaff(true) }}>+ Add Chef</button>
            </div>
            {chefs.length === 0 ? (
              <div className="empty-state"><div className="empty-state__icon">👨‍🍳</div><div className="empty-state__text">No chefs added yet</div><div className="empty-state__subtext">Add chefs to assign kitchen orders</div></div>
            ) : (
              <div className="cards-grid">
                {chefs.map(s => (
                  <div key={s.id} className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--brew-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                        {s.staff?.firstName?.[0] || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--brew-dark)' }}>{s.staff?.firstName} {s.staff?.lastName}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--brew-muted)' }}>{s.staff?.email}</div>
                        <span className="status-badge status-badge--preparing" style={{ marginTop: '0.25rem' }}>Chef</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════ WAITERS ══════ */}
        {activeTab === 'waiters' && (
          <>
            <div className="section-header">
              <h2 className="owner-main__title">Waiters ({waiters.length})</h2>
              <button className="brew-btn brew-btn--primary brew-btn--sm" onClick={() => { setStaffForm(f => ({ ...f, role: 'WAITER' })); setShowAddStaff(true) }}>+ Add Waiter</button>
            </div>
            {waiters.length === 0 ? (
              <div className="empty-state"><div className="empty-state__icon">🍽️</div><div className="empty-state__text">No waiters added yet</div><div className="empty-state__subtext">Add waiters to manage order delivery</div></div>
            ) : (
              <div className="cards-grid">
                {waiters.map(s => (
                  <div key={s.id} className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                        {s.staff?.firstName?.[0] || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--brew-dark)' }}>{s.staff?.firstName} {s.staff?.lastName}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--brew-muted)' }}>{s.staff?.email}</div>
                        <span className="status-badge status-badge--confirmed" style={{ marginTop: '0.25rem' }}>Waiter</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════ BOOKINGS ══════ */}
        {activeTab === 'bookings' && (
          <>
            <h2 className="owner-main__title">Bookings ({bookings.length})</h2>
            {bookings.length === 0 ? (
              <div className="empty-state"><div className="empty-state__icon">📅</div><div className="empty-state__text">No bookings yet</div></div>
            ) : (
              <div className="cards-grid">
                {bookings.map(b => (
                  <div key={b.id} className="glass-card">
                    <div style={{ fontWeight: 700, color: 'var(--brew-dark)' }}>Booking #{b.bookingRef}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--brew-muted)', marginTop: '0.25rem' }}>
                      📅 {b.bookingDate} • 🕐 {b.startTime}{b.endTime ? ` - ${b.endTime}` : ''}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--brew-muted)' }}>
                      👥 {b.numberOfGuests} guests {b.table && `• Table T${b.table.tableNumber}`}
                    </div>
                    <span className={`status-badge status-badge--${b.status?.toLowerCase()}`} style={{ marginTop: '0.5rem' }}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ─────── MODALS ─────── */}

      {/* Assign Waiter Modal */}
      {showAssignModal && (
        <div className="brew-modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="brew-modal" onClick={e => e.stopPropagation()}>
            <h3 className="brew-modal__title">Confirm Order & Assign Waiter</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--brew-muted)', marginBottom: '1rem' }}>
              Select a waiter to handle this order. The waiter will forward it to the kitchen.
            </p>
            <div className="brew-field">
              <label className="brew-label">Assign Waiter *</label>
              <select className="brew-select" value={selectedWaiterId} onChange={e => setSelectedWaiterId(e.target.value)}>
                <option value="">Select a waiter</option>
                {waiters.map(w => (
                  <option key={w.id} value={w.staff?.id}>{w.staff?.firstName} {w.staff?.lastName}</option>
                ))}
              </select>
            </div>
            <div className="brew-modal__actions">
              <button className="brew-btn brew-btn--secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button className="brew-btn brew-btn--primary" onClick={() => confirmAndAssign(assignOrderId, selectedWaiterId)}
                disabled={!selectedWaiterId}>
                Confirm & Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div className="brew-modal-overlay" onClick={() => setShowAddStaff(false)}>
          <div className="brew-modal" onClick={e => e.stopPropagation()}>
            <h3 className="brew-modal__title">Add {staffForm.role === 'CHEF' ? 'Chef' : 'Waiter'}</h3>
            <div className="brew-field-row">
              <div className="brew-field"><label className="brew-label">First Name *</label><input className="brew-input" value={staffForm.firstName} onChange={e => setStaffForm(p => ({ ...p, firstName: e.target.value }))} /></div>
              <div className="brew-field"><label className="brew-label">Last Name</label><input className="brew-input" value={staffForm.lastName} onChange={e => setStaffForm(p => ({ ...p, lastName: e.target.value }))} /></div>
            </div>
            <div className="brew-field"><label className="brew-label">Email *</label><input className="brew-input" type="email" value={staffForm.email} onChange={e => setStaffForm(p => ({ ...p, email: e.target.value }))} /></div>
            <p style={{ fontSize: '0.82rem', color: 'var(--brew-muted)', marginBottom: '1rem' }}>🔐 A password will be auto-generated and emailed to the staff member.</p>
            <div className="brew-modal__actions">
              <button className="brew-btn brew-btn--secondary" onClick={() => setShowAddStaff(false)}>Cancel</button>
              <button className="brew-btn brew-btn--primary" onClick={addStaff}>Add {staffForm.role === 'CHEF' ? 'Chef' : 'Waiter'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddTable && (
        <div className="brew-modal-overlay" onClick={() => setShowAddTable(false)}>
          <div className="brew-modal" onClick={e => e.stopPropagation()}>
            <h3 className="brew-modal__title">Add Table</h3>
            <div className="brew-field-row">
              <div className="brew-field"><label className="brew-label">Table Number *</label><input className="brew-input" type="number" value={tableForm.tableNumber} onChange={e => setTableForm(p => ({ ...p, tableNumber: e.target.value }))} /></div>
              <div className="brew-field"><label className="brew-label">Capacity *</label>
                <select className="brew-select" value={tableForm.capacity} onChange={e => setTableForm(p => ({ ...p, capacity: parseInt(e.target.value) }))}>
                  <option value={2}>2 Seats</option><option value={4}>4 Seats</option><option value={6}>6 Seats</option><option value={8}>8 Seats</option>
                </select>
              </div>
            </div>
            <div className="brew-field"><label className="brew-label">Table Type</label>
              <select className="brew-select" value={tableForm.tableType} onChange={e => setTableForm(p => ({ ...p, tableType: e.target.value }))}>
                <option value="ECONOMY">Economy</option><option value="STANDARD">Standard</option><option value="PREMIUM">Premium</option><option value="EXCLUSIVE">Exclusive / VIP</option>
              </select>
            </div>
            <div className="brew-modal__actions">
              <button className="brew-btn brew-btn--secondary" onClick={() => setShowAddTable(false)}>Cancel</button>
              <button className="brew-btn brew-btn--primary" onClick={addTable}>Add Table</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddItem && (
        <div className="brew-modal-overlay" onClick={() => setShowAddItem(false)}>
          <div className="brew-modal" onClick={e => e.stopPropagation()}>
            <h3 className="brew-modal__title">Add Menu Item</h3>
            <div className="brew-field"><label className="brew-label">Item Name *</label><input className="brew-input" value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="brew-field"><label className="brew-label">Description</label><textarea className="brew-input" rows={2} value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="brew-field-row">
              <div className="brew-field"><label className="brew-label">Price (₹) *</label><input className="brew-input" type="number" value={itemForm.price} onChange={e => setItemForm(p => ({ ...p, price: e.target.value }))} /></div>
              <div className="brew-field"><label className="brew-label">Type *</label>
                <select className="brew-select" value={itemForm.type} onChange={e => setItemForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="VEG">Veg</option><option value="NON_VEG">Non-Veg</option><option value="EGG">Egg</option>
                </select>
              </div>
            </div>
            <div className="brew-field"><label className="brew-label">Category *</label>
              <select className="brew-select" value={itemForm.categoryId} onChange={e => setItemForm(p => ({ ...p, categoryId: e.target.value }))}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {categories.length === 0 && (
              <p style={{ fontSize: '0.82rem', color: '#e67e22', marginBottom: '0.5rem' }}>⚠ No categories yet. Add a category first before adding menu items.</p>
            )}
            <div className="brew-modal__actions">
              <button className="brew-btn brew-btn--secondary" onClick={() => setShowAddItem(false)}>Cancel</button>
              <button className="brew-btn brew-btn--primary" onClick={addMenuItem} disabled={categories.length === 0}>Add Item</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="brew-modal-overlay" onClick={() => setShowAddCategory(false)}>
          <div className="brew-modal" onClick={e => e.stopPropagation()}>
            <h3 className="brew-modal__title">Add Menu Category</h3>
            <div className="brew-field"><label className="brew-label">Category Name *</label><input className="brew-input" value={categoryForm.name} onChange={e => setCategoryForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Beverages, Snacks, Main Course" /></div>
            <div className="brew-field"><label className="brew-label">Display Order</label><input className="brew-input" type="number" value={categoryForm.displayOrder} onChange={e => setCategoryForm(p => ({ ...p, displayOrder: parseInt(e.target.value) || 1 }))} /></div>
            <div className="brew-modal__actions">
              <button className="brew-btn brew-btn--secondary" onClick={() => setShowAddCategory(false)}>Cancel</button>
              <button className="brew-btn brew-btn--primary" onClick={addCategory}>Add Category</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
