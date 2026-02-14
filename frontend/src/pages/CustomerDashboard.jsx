import React from 'react'
import { Link } from 'react-router-dom'

export default function CustomerDashboard({ user }) {
  return (
    <div className="page dashboard customer-dashboard">
      <h2>Welcome, {user?.firstName} {user?.lastName}</h2>
      <p className="subtitle">Discover great coffee experiences at brew & co</p>

      <div className="dashboard-grid">
        <Link to="/cafe-selection" className="dashboard-card card">
          <h3>☕ Browse Cafés</h3>
          <p>Explore our brew & co locations near you</p>
        </Link>

        <Link to="/order-tracking" className="dashboard-card card">
          <h3>📦 Track Orders</h3>
          <p>View your active orders and their status</p>
        </Link>

        <div className="dashboard-card card">
          <h3>📋 My Bookings</h3>
          <p>View all your table reservations</p>
        </div>

        <Link to="/profile-completion" className="dashboard-card card">
          <h3>👤 Complete Profile</h3>
          <p>Add your details for a personalized experience</p>
        </Link>

        <div className="dashboard-card card">
          <h3>❤️ Favorites</h3>
          <p>Your favorite brew & co spots for quick booking</p>
        </div>

        <div className="dashboard-card card">
          <h3>💳 Payment Methods</h3>
          <p>Manage your saved payment options</p>
        </div>
      </div>
    </div>
  )
}
