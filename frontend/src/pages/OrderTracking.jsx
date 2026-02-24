import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import '../styles/dashboard.css'

// Full flow: Owner confirms → Waiter forwards → Chef prepares → Chef marks ready → Waiter delivers
const STATUS_STEPS = [
  { key: 'PLACED', label: 'Placed', icon: '📝' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: '✅' },
  { key: 'SENT_TO_KITCHEN', label: 'In Kitchen', icon: '🍳' },
  { key: 'PREPARING', label: 'Preparing', icon: '🔥' },
  { key: 'READY', label: 'Ready', icon: '🔔' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉' }
]

export default function OrderTracking() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
    const interval = setInterval(loadOrder, 8000) // Poll every 8s
    return () => clearInterval(interval)
  }, [orderId])

  const loadOrder = async () => {
    try {
      const res = await api.get(`/customer/orders/${orderId}`)
      setOrder(res.data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  if (loading) return <div className="dashboard-page"><div className="brew-spinner" /></div>
  if (!order) return (
    <div className="dashboard-page">
      <div className="empty-state">
        <div className="empty-state__icon">📦</div>
        <div className="empty-state__text">Order not found</div>
        <button className="brew-btn brew-btn--primary" onClick={() => navigate('/customer-dashboard')}>Go to Dashboard</button>
      </div>
    </div>
  )

  const currentStep = STATUS_STEPS.findIndex(s => s.key === order.status)
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div className="dashboard-page" style={{ maxWidth: '750px' }}>
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">Order #{order.orderRef}</h1>
        <p className="dashboard-page__subtitle">
          {order.orderType === 'DINE_IN' ? '🍽️ Dine-In' : '🥡 Takeaway'}
          {order.createdAt && ` • Placed ${new Date(order.createdAt).toLocaleString()}`}
        </p>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--brew-dark)', marginBottom: '1.5rem' }}>Order Progress</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 0.5rem' }}>
            {/* Progress bar background */}
            <div style={{
              position: 'absolute', top: '20px', left: '2rem', right: '2rem',
              height: '3px', background: 'var(--brew-border)', zIndex: 0
            }} />
            {/* Progress bar fill */}
            <div style={{
              position: 'absolute', top: '20px', left: '2rem',
              height: '3px',
              width: currentStep >= 0
                ? `${Math.max(0, currentStep / (STATUS_STEPS.length - 1)) * (100 - 8)}%`
                : '0%',
              background: 'var(--brew-gradient)', zIndex: 1,
              transition: 'width 0.6s ease', borderRadius: '2px'
            }} />
            {STATUS_STEPS.map((step, i) => (
              <div key={step.key} style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 0.5rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: i <= currentStep ? '1.1rem' : '0.75rem', fontWeight: 700,
                  background: i <= currentStep ? 'var(--brew-gradient)' : '#fff',
                  color: i <= currentStep ? '#fff' : 'var(--brew-muted)',
                  border: i <= currentStep ? 'none' : '2px solid var(--brew-border)',
                  transition: 'all 0.3s ease',
                  boxShadow: i === currentStep ? '0 0 0 4px rgba(139,94,60,0.2)' : 'none'
                }}>
                  {i <= currentStep ? step.icon : i + 1}
                </div>
                <div style={{
                  fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.3px',
                  color: i <= currentStep ? 'var(--brew-dark)' : 'var(--brew-muted)'
                }}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>

          {/* Current status message */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(139,94,60,0.06)' }}>
            {order.status === 'PLACED' && <p style={{ color: 'var(--brew-brown)', fontWeight: 600 }}>📝 Your order has been placed. Waiting for the café owner to confirm.</p>}
            {order.status === 'CONFIRMED' && <p style={{ color: 'var(--brew-brown)', fontWeight: 600 }}>✅ Order confirmed! A waiter is picking up your order.</p>}
            {order.status === 'SENT_TO_KITCHEN' && <p style={{ color: 'var(--brew-brown)', fontWeight: 600 }}>🍳 Your order has been sent to the kitchen. The chef will start soon!</p>}
            {order.status === 'PREPARING' && <p style={{ color: 'var(--brew-brown)', fontWeight: 600 }}>🔥 The chef is preparing your order right now!</p>}
            {order.status === 'READY' && <p style={{ color: 'var(--brew-brown)', fontWeight: 600 }}>🔔 Your order is ready! The waiter is bringing it to you.</p>}
            {order.status === 'DELIVERED' && <p style={{ color: '#16a34a', fontWeight: 600 }}>🎉 Order delivered! Enjoy your meal!</p>}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>❌</div>
          <h3 style={{ color: '#dc2626', fontWeight: 700 }}>Order Cancelled</h3>
        </div>
      )}

      {/* Order Details */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, color: 'var(--brew-dark)', marginBottom: '1rem' }}>Order Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.88rem' }}>
          <div><span style={{ color: 'var(--brew-muted)' }}>Status:</span></div>
          <div><span className={`status-badge status-badge--${order.status.toLowerCase().replace('_', '-')}`}>{order.status.replace('_', ' ')}</span></div>
          <div><span style={{ color: 'var(--brew-muted)' }}>Subtotal:</span></div>
          <div style={{ fontWeight: 600 }}>₹{order.totalAmount}</div>
          {parseFloat(order.taxAmount) > 0 && <>
            <div><span style={{ color: 'var(--brew-muted)' }}>Tax:</span></div>
            <div>₹{order.taxAmount}</div>
          </>}
          <div><span style={{ color: 'var(--brew-muted)' }}>Grand Total:</span></div>
          <div style={{ fontWeight: 800, color: 'var(--brew-brown)', fontSize: '1.1rem' }}>₹{order.grandTotal}</div>
          <div><span style={{ color: 'var(--brew-muted)' }}>Payment:</span></div>
          <div><span className={`status-badge status-badge--${order.paymentStatus?.toLowerCase()}`}>{order.paymentStatus}</span></div>
        </div>
      </div>

      {order.specialInstructions && (
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--brew-dark)', marginBottom: '0.5rem' }}>Special Instructions</h3>
          <p style={{ color: 'var(--brew-muted)', fontSize: '0.88rem' }}>{order.specialInstructions}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="brew-btn brew-btn--secondary" onClick={() => navigate('/my-orders')}>← All Orders</button>
        <button className="brew-btn brew-btn--secondary" onClick={() => navigate('/customer-dashboard')}>Dashboard</button>
      </div>
    </div>
  )
}
