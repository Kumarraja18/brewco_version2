import React, { useState } from 'react'

export default function AdminDashboard({ user }){
  const [cafeOwners] = useState([
    { id: 1, name: 'John Doe', email: 'john@cafe.com', cafe: 'Brew Haven', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@cafe.com', cafe: 'Coffee Corner', status: 'Active' }
  ])

  return (
    <div className="page dashboard admin-dashboard">
      <h2>Admin Dashboard</h2>
      <p className="subtitle">Manage café owners and platform activities</p>

      <div className="admin-stats">
        <div className="stat card">
          <h4>Total Café Owners</h4>
          <p className="number">5</p>
        </div>
        <div className="stat card">
          <h4>Total Cafés</h4>
          <p className="number">8</p>
        </div>
        <div className="stat card">
          <h4>Active Bookings</h4>
          <p className="number">24</p>
        </div>
        <div className="stat card">
          <h4>Revenue</h4>
          <p className="number">$4,250</p>
        </div>
      </div>

      <section>
        <h3>Café Owners</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Café</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cafeOwners.map(owner => (
              <tr key={owner.id}>
                <td>{owner.name}</td>
                <td>{owner.email}</td>
                <td>{owner.cafe}</td>
                <td><span className="badge active">{owner.status}</span></td>
                <td>
                  <button className="btn small">Edit</button>
                  <button className="btn small">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="actions">
        <button className="btn primary">Add New Café Owner</button>
      </div>
    </div>
  )
}
