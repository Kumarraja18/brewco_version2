import React, { useState } from 'react'

export default function WaiterDashboard({ user }){
  const [readyOrders, setReadyOrders] = useState([
    { id: 102, items: ['Latte', 'Sandwich'], table: 'T3', cafe: 'Brew Haven' },
    { id: 103, items: ['Espresso', 'Cake'], table: 'T5', cafe: 'Brew Haven' }
  ])

  const handleServeOrder = (orderId) => {
    setReadyOrders(readyOrders.filter(order => order.id !== orderId))
  }

  return (
    <div className="page dashboard waiter-dashboard">
      <h2>Waiter Dashboard</h2>
      <p className="subtitle">Ready orders to serve</p>

      <section>
        <h3>Ready to Serve</h3>
        <div className="ready-orders">
          {readyOrders.length === 0 ? (
            <p className="empty">No ready orders at the moment</p>
          ) : (
            readyOrders.map(order => (
              <div key={order.id} className="ready-order card">
                <div className="order-details">
                  <h4>Order #{order.id}</h4>
                  <p><strong>Table:</strong> {order.table}</p>
                  <p><strong>Items:</strong></p>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>✓ {item}</li>
                    ))}
                  </ul>
                </div>
                <button 
                  className="btn primary large"
                  onClick={() => handleServeOrder(order.id)}
                >
                  Served ✓
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="stats">
        <div className="stat card">
          <h4>Ready Orders</h4>
          <p className="number">{readyOrders.length}</p>
        </div>
        <div className="stat card">
          <h4>Served Today</h4>
          <p className="number">12</p>
        </div>
      </div>
    </div>
  )
}
