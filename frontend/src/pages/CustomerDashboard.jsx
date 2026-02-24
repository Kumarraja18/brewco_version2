import React, { useEffect, useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axiosClient'
import '../styles/dashboard.css'

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const res = await api.get('/customer/orders')
      setOrders(res.data || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
  const completedOrders = orders.filter(o => o.status === 'DELIVERED')

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">
          Welcome back, {user?.firstName || 'Coffee Lover'} ☕
        </h1>
        <p className="dashboard-page__subtitle">
          Discover, order, and enjoy premium coffee experiences
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon">📦</div>
          <div className="stat-card__value">{activeOrders.length}</div>
          <div className="stat-card__label">Active Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">✅</div>
          <div className="stat-card__value">{completedOrders.length}</div>
          <div className="stat-card__label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">☕</div>
          <div className="stat-card__value">{orders.length}</div>
          <div className="stat-card__label">Total Orders</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-header">
        <h2 className="section-title">Quick Actions</h2>
      </div>
      <div className="cards-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card glass-card--clickable" onClick={() => navigate('/cafes')}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏪</div>
          <h3 style={{ color: 'var(--brew-dark)', fontWeight: 700, marginBottom: '0.35rem' }}>
            Browse Cafés
          </h3>
          <p style={{ color: 'var(--brew-muted)', fontSize: '0.85rem' }}>
            Explore cafés near you and discover new favorites
          </p>
        </div>

        <div className="glass-card glass-card--clickable" onClick={() => navigate('/my-orders')}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
          <h3 style={{ color: 'var(--brew-dark)', fontWeight: 700, marginBottom: '0.35rem' }}>
            Order History
          </h3>
          <p style={{ color: 'var(--brew-muted)', fontSize: '0.85rem' }}>
            View all your past orders and reorder favorites
          </p>
        </div>

        <div className="glass-card glass-card--clickable" onClick={() => navigate('/my-bookings')}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
          <h3 style={{ color: 'var(--brew-dark)', fontWeight: 700, marginBottom: '0.35rem' }}>
            My Bookings
          </h3>
          <p style={{ color: 'var(--brew-muted)', fontSize: '0.85rem' }}>
            View and manage your table reservations
          </p>
        </div>

        <div className="glass-card glass-card--clickable" onClick={() => navigate('/profile-completion')}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👤</div>
          <h3 style={{ color: 'var(--brew-dark)', fontWeight: 700, marginBottom: '0.35rem' }}>
            My Profile
          </h3>
          <p style={{ color: 'var(--brew-muted)', fontSize: '0.85rem' }}>
            Update your details and change password
          </p>
        </div>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <>
          <div className="section-header">
            <h2 className="section-title">Active Orders</h2>
            <Link to="/my-orders" className="brew-btn brew-btn--secondary brew-btn--sm">
              View All
            </Link>
          </div>
          <div className="cards-grid">
            {activeOrders.slice(0, 3).map(order => (
              <div key={order.id} className="glass-card order-card">
                <div className="order-card__header">
                  <span className="order-card__ref">#{order.orderRef}</span>
                  <span className={`status-badge status-badge--${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--brew-muted)', marginBottom: '0.5rem' }}>
                  {order.orderType === 'DINE_IN' ? '🍽️ Dine-In' : '🥡 Takeaway'}
                </div>
                <div className="order-card__total">
                  <span>Total</span>
                  <span>₹{order.grandTotal}</span>
                </div>
                <div className="order-card__actions">
                  <button className="brew-btn brew-btn--secondary brew-btn--sm"
                    onClick={() => navigate(`/order-tracking/${order.id}`)}
                  >
                    Track Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
