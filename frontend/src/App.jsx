import React, { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProfileCompletion from './pages/ProfileCompletion'
import CafeSelection from './pages/CafeSelection'
import TableBooking from './pages/TableBooking'
import Menu from './pages/Menu'
import OrderTracking from './pages/OrderTracking'
import AdminDashboard from './pages/AdminDashboard'
import CafeOwnerDashboard from './pages/CafeOwnerDashboard'
import ChefDashboard from './pages/ChefDashboard'
import WaiterDashboard from './pages/WaiterDashboard'
import CustomerDashboard from './pages/CustomerDashboard'

export default function App(){
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const handleLogout = () => {
    setUser(null)
    navigate('/')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">brew & co</div>
        <nav className="nav">
          <Link to="/">Home</Link>
          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              <span className="user-info">{user.email} ({user.role})</span>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login setUser={setUser}/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/profile-completion" element={<ProfileCompletion/>} />
          <Route path="/cafe-selection" element={<CafeSelection/>} />
          <Route path="/table-booking/:cafeId" element={<TableBooking/>} />
          <Route path="/menu/:bookingId" element={<Menu/>} />
          <Route path="/order-tracking" element={<OrderTracking/>} />
          <Route path="/admin-dashboard" element={<AdminDashboard user={user}/>} />
          <Route path="/cafe-owner-dashboard" element={<CafeOwnerDashboard user={user}/>} />
          <Route path="/chef-dashboard" element={<ChefDashboard user={user}/>} />
          <Route path="/waiter-dashboard" element={<WaiterDashboard user={user}/>} />
          <Route path="/customer-dashboard" element={<CustomerDashboard user={user}/>} />
        </Routes>
      </main>
      <footer className="footer">© brew & co — Coffee Ordering & Management Platform</footer>
    </div>
  )
}
