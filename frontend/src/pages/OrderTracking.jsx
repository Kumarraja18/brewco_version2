import React, { useState } from 'react'

export default function OrderTracking(){
  const [orders] = useState([
    { 
      id: 1001, 
      cafe: 'Brew Haven', 
      status: 'Preparing', 
      date: '2026-02-08',
      items: ['Cappuccino', 'Croissant'],
      total: 7.50,
      progress: 40
    },
    { 
      id: 1002, 
      cafe: 'Coffee Corner', 
      status: 'Ready', 
      date: '2026-02-08',
      items: ['Latte', 'Sandwich'],
      total: 11.25,
      progress: 80
    }
  ])

  const getStatusColor = (status) => {
    switch(status) {
      case 'Preparing': return 'status-preparing'
      case 'Ready': return 'status-ready'
      case 'Served': return 'status-served'
      default: return ''
    }
  }

  return (
    <div className="page order-tracking">
      <h2>Order Tracking</h2>
      <p className="subtitle">Track your orders in real-time</p>

      <div className="orders-container">
        {orders.map(order => (
          <div key={order.id} className="order-card card">
            <div className="order-header">
              <h3>Order #{order.id}</h3>
              <span className={`status ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <p className="cafe">{order.cafe} • {order.date}</p>

            <div className="order-items">
              <h4>Items:</h4>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${order.progress}%` }}></div>
            </div>

            <div className="order-footer">
              <span className="total">Total: ${order.total.toFixed(2)}</span>
              <span className="progress-text">{order.progress}% complete</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
