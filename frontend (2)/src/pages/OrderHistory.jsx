import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import '../styles/dashboard.css'

export default function OrderHistory() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('ALL')
    const navigate = useNavigate()

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/customer/orders')
                setOrders(res.data || [])
            } catch { /* ignore */ }
            setLoading(false)
        }
        load()
    }, [])

    const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter)

    if (loading) return <div className="dashboard-page"><div className="brew-spinner" /></div>

    return (
        <div className="dashboard-page">
            <div className="dashboard-page__header">
                <h1 className="dashboard-page__title">Order History</h1>
                <p className="dashboard-page__subtitle">View all your past and active orders</p>
            </div>

            <div className="brew-tabs" style={{ maxWidth: '600px', marginBottom: '1.5rem' }}>
                {['ALL', 'PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'].map(f => (
                    <button key={f} className={`brew-tab ${filter === f ? 'brew-tab--active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">📋</div>
                    <div className="empty-state__text">No orders found</div>
                    <div className="empty-state__subtext">Place your first order to see it here</div>
                    <button className="brew-btn brew-btn--primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/cafes')}>
                        Browse Cafés
                    </button>
                </div>
            ) : (
                <div className="cards-grid">
                    {filtered.map(order => (
                        <div key={order.id} className="glass-card order-card glass-card--clickable"
                            onClick={() => navigate(`/order-tracking/${order.id}`)}
                        >
                            <div className="order-card__header">
                                <span className="order-card__ref">#{order.orderRef}</span>
                                <span className={`status-badge status-badge--${order.status.toLowerCase()}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--brew-muted)', marginBottom: '0.5rem' }}>
                                {order.orderType === 'DINE_IN' ? '🍽️ Dine-In' : '🥡 Takeaway'}
                                {order.createdAt && ` • ${new Date(order.createdAt).toLocaleDateString()}`}
                            </div>
                            <div className="order-card__total">
                                <span>Total</span>
                                <span>₹{order.grandTotal}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
