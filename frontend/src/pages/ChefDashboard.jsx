import React, { useState } from 'react'

export default function ChefDashboard({ user }){
  const [orders, setOrders] = useState([
    { id: 101, items: ['Cappuccino', 'Croissant'], table: 'T1', status: 'Pending' },
    { id: 102, items: ['Latte', 'Sandwich'], table: 'T3', status: 'Preparing' }
  ])

  const handleMarkReady = (orderId) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'Ready' } : order
    ))
  }

  return (
    <div className="page dashboard chef-dashboard">
      <h2>Chef Dashboard</h2>
      <p className="subtitle">Manage orders and food preparation</p>

      <section>
        <h3>Incoming Orders</h3>
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-item card">
              <div className="order-info">
                <h4>Order #{order.id}</h4>
                <p>Table: {order.table}</p>
                <ul>
                  {order.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="order-actions">
                <span className={`status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
                {order.status !== 'Ready' && (
                  <button 
                    className="btn primary"
                    onClick={() => handleMarkReady(order.id)}
                  >
                    Mark Ready
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="stats">
        <div className="stat card">
          <h4>Pending Orders</h4>
          <p className="number">{orders.filter(o => o.status === 'Pending').length}</p>
        </div>
        <div className="stat card">
          <h4>Being Prepared</h4>
          <p className="number">{orders.filter(o => o.status === 'Preparing').length}</p>
        </div>
        <div className="stat card">
          <h4>Ready to Serve</h4>
          <p className="number">{orders.filter(o => o.status === 'Ready').length}</p>
        </div>
      </div>
    </div>
  )
}
