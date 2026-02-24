import React, { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axiosClient'
import toast from 'react-hot-toast'
import '../styles/dashboard.css'

/**
 * Waiter Dashboard — the middle person in the flow.
 * 
 * Flow: Owner confirms + assigns waiter →
 *   1) Waiter picks up CONFIRMED order → sends to kitchen (SENT_TO_KITCHEN)
 *   2) Chef prepares → marks READY
 *   3) Waiter picks up READY order → marks DELIVERED
 */
export default function WaiterDashboard() {
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('CONFIRMED')

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 8000) // Poll every 8s
    return () => clearInterval(interval)
  }, [])

  const loadOrders = async () => {
    try {
      const res = await api.get('/waiter/orders')
      setOrders(res.data || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  const sendToKitchen = async (orderId) => {
    try {
      await api.put(`/waiter/orders/${orderId}/send-to-kitchen`)
      toast.success('Order sent to kitchen!')
      loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    }
  }

  const markDelivered = async (orderId) => {
    try {
      await api.put(`/waiter/orders/${orderId}/deliver`)
      toast.success('Order delivered!')
      loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    }
  }

  const filtered = orders.filter(o => {
    if (filter === 'ALL') return true
    return o.status === filter
  })

  const confirmedCount = orders.filter(o => o.status === 'CONFIRMED').length
  const inKitchenCount = orders.filter(o => o.status === 'SENT_TO_KITCHEN' || o.status === 'PREPARING').length
  const readyCount = orders.filter(o => o.status === 'READY').length
  const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length

  if (loading) return <div className="dashboard-page"><div className="brew-spinner" /></div>

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">Waiter Dashboard 🍽️</h1>
        <p className="dashboard-page__subtitle">Welcome, {user?.firstName}. Manage order flow between owner and chef.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon">📥</div>
          <div className="stat-card__value">{confirmedCount}</div>
          <div className="stat-card__label">To Send to Kitchen</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">🔥</div>
          <div className="stat-card__value">{inKitchenCount}</div>
          <div className="stat-card__label">In Kitchen</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">🔔</div>
          <div className="stat-card__value">{readyCount}</div>
          <div className="stat-card__label">Ready to Deliver</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">✅</div>
          <div className="stat-card__value">{deliveredCount}</div>
          <div className="stat-card__label">Delivered</div>
        </div>
      </div>

      {/* Flow description */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(139,94,60,0.05)' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--brew-muted)', fontWeight: 500 }}>
          <strong>Your Flow:</strong> Owner confirms → <strong>You send to kitchen</strong> → Chef prepares → <strong>You deliver</strong> → Done
        </p>
      </div>

      {/* Filter */}
      <div className="brew-tabs" style={{ maxWidth: '600px', marginBottom: '1.5rem' }}>
        {['ALL', 'CONFIRMED', 'SENT_TO_KITCHEN', 'READY', 'DELIVERED'].map(f => (
          <button key={f} className={`brew-tab ${filter === f ? 'brew-tab--active' : ''}`}
            onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'All'
              : f === 'CONFIRMED' ? 'New'
                : f === 'SENT_TO_KITCHEN' ? 'In Kitchen'
                  : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🍽️</div>
          <div className="empty-state__text">No orders in this category</div>
          <div className="empty-state__subtext">New confirmed orders will appear here</div>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map(order => (
            <div key={order.id}
              className={`glass-card order-card ${order.status === 'CONFIRMED' ? 'glass-card--accent'
                  : order.status === 'READY' ? 'glass-card--accent'
                    : ''
                }`}
            >
              <div className="order-card__header">
                <span className="order-card__ref">#{order.orderRef}</span>
                <span className={`status-badge status-badge--${order.status === 'SENT_TO_KITCHEN' ? 'preparing'
                    : order.status.toLowerCase()
                  }`}>
                  {order.status === 'SENT_TO_KITCHEN' ? '🍳 IN KITCHEN'
                    : order.status === 'CONFIRMED' ? '📥 NEW'
                      : order.status}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--brew-muted)', marginBottom: '0.25rem' }}>
                {order.orderType === 'DINE_IN' ? '🍽️ Dine-In' : '🥡 Takeaway'}
                {order.cafeTable && ` • Table T${order.cafeTable.tableNumber}`}
              </div>
              <div className="order-card__total">
                <span>Total</span><span>₹{order.grandTotal}</span>
              </div>

              <div className="order-card__actions">
                {order.status === 'CONFIRMED' && (
                  <button className="brew-btn brew-btn--primary" onClick={() => sendToKitchen(order.id)}>
                    🍳 Send to Kitchen
                  </button>
                )}
                {order.status === 'SENT_TO_KITCHEN' && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--brew-muted)', fontWeight: 600 }}>
                    ⏳ Waiting for chef...
                  </span>
                )}
                {order.status === 'PREPARING' && (
                  <span style={{ fontSize: '0.82rem', color: '#d97706', fontWeight: 600 }}>
                    🔥 Chef is preparing...
                  </span>
                )}
                {order.status === 'READY' && (
                  <button className="brew-btn brew-btn--success" onClick={() => markDelivered(order.id)}>
                    ✅ Mark Delivered
                  </button>
                )}
                {order.status === 'DELIVERED' && (
                  <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600 }}>
                    🎉 Delivered
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
