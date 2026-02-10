import React, { useState } from 'react'

export default function CafeOwnerDashboard({ user }){
  const [tables] = useState([
    { id: 1, number: 'T1', size: 'Small (2)', status: 'Available' },
    { id: 2, number: 'T2', size: 'Medium (4)', status: 'Booked' },
    { id: 3, number: 'T3', size: 'Large (6)', status: 'Available' }
  ])

  return (
    <div className="page dashboard cafe-owner-dashboard">
      <h2>Café Owner Dashboard</h2>
      <p className="subtitle">Manage your café operations</p>

      <div className="owner-stats">
        <div className="stat card">
          <h4>Total Tables</h4>
          <p className="number">15</p>
        </div>
        <div className="stat card">
          <h4>Today's Bookings</h4>
          <p className="number">8</p>
        </div>
        <div className="stat card">
          <h4>Menu Items</h4>
          <p className="number">45</p>
        </div>
        <div className="stat card">
          <h4>Staff Members</h4>
          <p className="number">12</p>
        </div>
      </div>

      <section>
        <h3>Table Status</h3>
        <div className="tables-grid">
          {tables.map(table => (
            <div key={table.id} className="table-card card">
              <h4>{table.number}</h4>
              <p>{table.size}</p>
              <p className={`status ${table.status.toLowerCase()}`}>{table.status}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="actions">
        <button className="btn primary">Add Table</button>
        <button className="btn">Manage Menu</button>
        <button className="btn">Manage Staff</button>
      </div>
    </div>
  )
}
