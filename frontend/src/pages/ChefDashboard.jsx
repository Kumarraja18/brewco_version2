import React, { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axiosClient'
import toast from 'react-hot-toast'
import '../styles/dashboard.css'

/**
 * Chef Dashboard — receives orders from waiter (SENT_TO_KITCHEN),
 * starts preparing (PREPARING), then marks ready (READY).
 */
export default function ChefDashboard() {
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('SENT_TO_KITCHEN')

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 12000) // Poll every 12s
    return () => clearInterval(interval)
  }, [])

  const loadOrders = async () => {
    try {
      const res = await api.get('/chef/orders')
      setOrders(res.data || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  const startPreparing = async (orderId) => {
    try {
      await api.put(`/chef/orders/${orderId}/start`)
      toast.success('Started preparing!')
      loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    }
  }

  const markReady = async (orderId) => {
    try {
      await api.put(`/chef/orders/${orderId}/ready`)
      toast.success('Order marked as ready!')
      loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    }
  }

  const filtered = orders.filter(o => {
    if (filter === 'ALL') return true
    return o.status === filter
  })

  const newCount = orders.filter(o => o.status === 'SENT_TO_KITCHEN').length
  const preparingCount = orders.filter(o => o.status === 'PREPARING').length
  const readyCount = orders.filter(o => o.status === 'READY').length

  if (loading) return <div className="dashboard-page"><div className="brew-spinner" /></div>

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">Chef Dashboard 👨‍🍳</h1>
        <p className="dashboard-page__subtitle">Welcome, {user?.firstName}. Orders from waiters appear here.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon">📥</div>
          <div className="stat-card__value">{newCount}</div>
          <div className="stat-card__label">New from Waiter</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">🔥</div>
          <div className="stat-card__value">{preparingCount}</div>
          <div className="stat-card__label">Preparing</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">✅</div>
          <div className="stat-card__value">{readyCount}</div>
          <div className="stat-card__label">Ready</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="brew-tabs" style={{ maxWidth: '550px', marginBottom: '1.5rem' }}>
        {['ALL', 'SENT_TO_KITCHEN', 'PREPARING', 'READY'].map(f => (
          <button key={f} className={`brew-tab ${filter === f ? 'brew-tab--active' : ''}`}
            onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'All' : f === 'SENT_TO_KITCHEN' ? 'New' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Flow description */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(139,94,60,0.05)' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--brew-muted)', fontWeight: 500 }}>
          <strong>Flow:</strong> Owner confirms → <strong>Waiter sends to you</strong> → You prepare → Mark ready → Waiter delivers
        </p>
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">👨‍🍳</div>
          <div className="empty-state__text">No orders in this category</div>
          <div className="empty-state__subtext">Orders sent by waiters will appear here</div>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map(order => (
            <div key={order.id}
              className={`glass-card order-card ${order.status === 'SENT_TO_KITCHEN' ? 'glass-card--accent' : ''}`}
            >
              <div className="order-card__header">
                <span className="order-card__ref">#{order.orderRef}</span>
                <span className={`status-badge status-badge--${order.status === 'SENT_TO_KITCHEN' ? 'confirmed' : order.status.toLowerCase()}`}>
                  {order.status === 'SENT_TO_KITCHEN' ? '🍳 NEW' : order.status}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--brew-muted)', marginBottom: '0.5rem' }}>
                {order.orderType === 'DINE_IN' ? '🍽️ Dine-In' : '🥡 Takeaway'}
                {order.cafeTable && ` • Table T${order.cafeTable.tableNumber}`}
              </div>
              {order.specialInstructions && (
                <div style={{ fontSize: '0.8rem', color: '#92400E', background: '#FEF3C7', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  📝 {order.specialInstructions}
                </div>
              )}
              <div className="order-card__actions">
                {order.status === 'SENT_TO_KITCHEN' && (
                  <button className="brew-btn brew-btn--primary brew-btn--sm" onClick={() => startPreparing(order.id)}>
                    🔥 Start Preparing
                  </button>
                )}
                {order.status === 'PREPARING' && (
                  <button className="brew-btn brew-btn--success brew-btn--sm" onClick={() => markReady(order.id)}>
                    ✅ Mark Ready
                  </button>
                )}
                {order.status === 'READY' && (
                  <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                    ⏳ Waiting for waiter pickup
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
