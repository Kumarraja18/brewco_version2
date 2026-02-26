import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import { FaChevronLeft, FaClock, FaCheckCircle, FaMapMarkerAlt, FaReceipt, FaMotorcycle, FaUtensils, FaUser } from 'react-icons/fa'
import '../styles/customer.css'

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: <FaReceipt /> },
  { key: 'CONFIRMED', label: 'Confirmed', icon: <FaCheckCircle /> },
  { key: 'SENT_TO_KITCHEN', label: 'In Kitchen', icon: <FaUtensils /> },
  { key: 'PREPARING', label: 'Preparing', icon: <FaClock /> },
  { key: 'READY', label: 'Ready for Pickup', icon: <FaCheckCircle /> },
  { key: 'DELIVERED', label: 'Served', icon: <FaUser /> }
]

export default function OrderTracking() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
    const interval = setInterval(loadOrder, 5000) // Poll every 5s for real-time feel
    return () => clearInterval(interval)
  }, [orderId])

  const loadOrder = async () => {
    try {
      const res = await api.get(`/customer/orders/${orderId}`)
      setOrder(res.data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  if (loading) return <div className="brew-spinner-container"><div className="brew-spinner" /></div>
  if (!order) return (
    <div style={{ textAlign: 'center', padding: '100px' }}>
      <h3>Order not found</h3>
      <button className="brew-btn brew-btn--primary" onClick={() => navigate('/customer-dashboard')}>Back to Home</button>
    </div>
  )

  const currentStep = STATUS_STEPS.findIndex(s => s.key === order.status)
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div className="customer-home" style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '50px' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 100 }}>
        <FaChevronLeft onClick={() => navigate('/my-orders')} style={{ cursor: 'pointer' }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Order Tracking</h1>
          <div style={{ fontSize: '0.75rem', color: '#686b78', fontWeight: 600 }}>#{order.orderRef}</div>
        </div>
      </div>

      <div className="customer-container" style={{ maxWidth: '600px', marginTop: '20px' }}>
        {/* Café Card */}
        <div className="sw-form-card" style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <img src={order.cafe?.profileImageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100'} 
            style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} 
          />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{order.cafe?.name}</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#686b78' }}>{order.cafe?.address}, {order.cafe?.city}</p>
          </div>
        </div>

        {/* Status Timeline */}
        {!isCancelled ? (
          <div className="sw-form-card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '25px', color: '#1c1c1c' }}>Live Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {STATUS_STEPS.map((step, i) => {
                const isActive = i <= currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div key={step.key} style={{ display: 'flex', gap: '20px', position: 'relative', paddingBottom: i === STATUS_STEPS.length - 1 ? 0 : '30px' }}>
                    {/* Line */}
                    {i !== STATUS_STEPS.length - 1 && (
                      <div style={{
                        position: 'absolute', left: '15px', top: '30px', bottom: 0, width: '2px',
                        background: i < currentStep ? '#60b246' : '#e9e9eb'
                      }} />
                    )}
                    {/* Dot/Icon */}
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', background: isActive ? '#60b246' : '#fff',
                      border: isActive ? 'none' : '2px solid #e9e9eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isActive ? '#fff' : '#d4d5d9', zIndex: 1, fontSize: '0.9rem'
                    }}>
                      {step.icon}
                    </div>
                    {/* Text */}
                    <div style={{ paddingTop: '5px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isActive ? '#1c1c1c' : '#93959f' }}>{step.label}</div>
                      {isCurrent && (
                        <div style={{ fontSize: '0.8rem', color: '#686b78', marginTop: '4px' }}>
                          {order.status === 'PLACED' && 'Waiting for café to accept...'}
                          {order.status === 'CONFIRMED' && 'Café has accepted your order.'}
                          {order.status === 'PREPARING' && 'Chef is working their magic!'}
                          {order.status === 'READY' && 'Your order is hot and ready!'}
                          {order.status === 'DELIVERED' && 'Order has been served. Enjoy!'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="sw-form-card" style={{ marginBottom: '20px', textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>❌</div>
            <h3 style={{ color: '#dc2626', fontWeight: 800 }}>Order Cancelled</h3>
            <p style={{ color: '#686b78', fontSize: '0.9rem' }}>This order was cancelled by the café or user.</p>
          </div>
        )}

        {/* Items Summary */}
        <div className="sw-form-card" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '15px' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {order.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <div style={{ color: '#3d4152', fontWeight: 600 }}>{item.menuItem?.name} x {item.quantity}</div>
                <div style={{ color: '#3d4152' }}>₹{item.subTotal}</div>
              </div>
            ))}
            <div style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #f1f1f6', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
              <span>Total Paid</span>
              <span>₹{order.grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="sw-form-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '15px' }}>Bill Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '0.85rem', color: '#686b78' }}>
            <div>Order Type:</div>
            <div style={{ fontWeight: 700, color: '#1c1c1c' }}>{order.orderType}</div>
            <div>Payment:</div>
            <div style={{ fontWeight: 700, color: '#1c1c1c' }}>{order.paymentStatus}</div>
            {order.table && (
              <>
                <div>Table:</div>
                <div style={{ fontWeight: 700, color: '#1c1c1c' }}>Table {order.table.tableNumber}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
