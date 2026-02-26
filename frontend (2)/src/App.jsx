import React, { useEffect, useContext } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Auth Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Customer Pages
import CustomerDashboard from './pages/CustomerDashboard';
import CafeList from './pages/CafeList';
import CafeDetail from './pages/CafeDetail';
import OrderTracking from './pages/OrderTracking';
import OrderHistory from './pages/OrderHistory';
import ProfileCompletion from './pages/ProfileCompletion';

// Cafe Owner Pages
import CafeSetup from './pages/CafeSetup';
import CafeOwnerDashboard from './pages/CafeOwnerDashboard';

// Staff Pages
import ChefDashboard from './pages/ChefDashboard';
import WaiterDashboard from './pages/WaiterDashboard';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';

import { FaLinkedin, FaYoutube } from 'react-icons/fa';
import { MdEmail, MdPhone } from 'react-icons/md';

export default function App() {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we are on the admin dashboard route
  const isAdminRoute = location.pathname.startsWith('/admin-dashboard');
  // Full-screen routes without header/footer
  const isFullscreen = isAdminRoute;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleScrollNav = (sectionId) => {
    navigate(`/#${sectionId}`);
  };

  // Scroll to hash on location change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (!isFullscreen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  if (loading) return <div>Loading Application...</div>;

  // If admin dashboard, render without the main app wrapper layout
  if (isFullscreen) {
    return (
      <Routes>
        <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard user={user} /></ProtectedRoute>} />
      </Routes>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex' }}>
          <img src="/logo.png" alt="logo" className="app-logo" />
          <div className="brand">brew & co</div>
        </div>

        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/#features">Service</Link>
          <Link to="/#how-it-works">How it Works</Link>
          <Link to="/#footer">Contact us</Link>

          {!user ? (
            <div>
              <Link to="/login" className="btn-nav">Login</Link>
              <Link to="/register" className="btn-nav btn-primary">Register</Link>
            </div>
          ) : (
            <>
              <span className="user-info">{user.firstName} {user.lastName} ({user.role})</span>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
      </header>

      <main className="containers">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Customer Routes */}
          <Route path="/customer-dashboard" element={<ProtectedRoute requiredRole="CUSTOMER"><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/cafes" element={<CafeList />} />
          <Route path="/cafe/:cafeId" element={<CafeDetail />} />
          <Route path="/order-tracking/:orderId" element={<ProtectedRoute requiredRole="CUSTOMER"><OrderTracking /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute requiredRole="CUSTOMER"><OrderHistory /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute requiredRole="CUSTOMER"><OrderHistory /></ProtectedRoute>} />
          <Route path="/profile-completion" element={<ProfileCompletion />} />

          {/* Legacy routes (backward compat) */}
          <Route path="/cafe-selection" element={<CafeList />} />
          <Route path="/order-tracking" element={<ProtectedRoute requiredRole="CUSTOMER"><OrderHistory /></ProtectedRoute>} />

          {/* Cafe Owner Routes */}
          <Route path="/cafe-setup" element={<ProtectedRoute requiredRole="CAFE_OWNER"><CafeSetup /></ProtectedRoute>} />
          <Route path="/cafe-owner-dashboard" element={<ProtectedRoute requiredRole="CAFE_OWNER"><CafeOwnerDashboard /></ProtectedRoute>} />

          {/* Staff Routes */}
          <Route path="/chef-dashboard" element={<ProtectedRoute requiredRole="CHEF"><ChefDashboard /></ProtectedRoute>} />
          <Route path="/waiter-dashboard" element={<ProtectedRoute requiredRole="WAITER"><WaiterDashboard /></ProtectedRoute>} />
        </Routes>
      </main>

      <Toaster position="top-right" />

      <footer className="footer" id="footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="brand">© Brew & Co</span>
            <p>Coffee Ordering & Management Platform</p>
          </div>

          <div className="footer-links">
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              <FaLinkedin />
              <span>LinkedIn</span>
            </a>

            <a href="https://www.youtube.com" target="_blank" rel="noreferrer">
              <FaYoutube />
              <span>YouTube</span>
            </a>

            <a href="mailto:support@brewco.com">
              <MdEmail />
              <span>support@brewco.com</span>
            </a>

            <a href="tel:+911234567890">
              <MdPhone />
              <span>+91 12345 67890</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
