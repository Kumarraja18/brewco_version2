import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaHistory, FaUser, FaSearch } from 'react-icons/fa';

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      height: '65px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid #eee',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      zIndex: 1000
    }}>
      <NavLink to="/customer-dashboard" style={({ isActive }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: isActive ? '#6f4e37' : '#9ca3af',
        fontSize: '0.75rem',
        fontWeight: 600
      })}>
        <FaHome size={20} />
        <span style={{ marginTop: '4px' }}>Home</span>
      </NavLink>
      <NavLink to="/search" style={({ isActive }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: isActive ? '#6f4e37' : '#9ca3af',
        fontSize: '0.75rem',
        fontWeight: 600
      })}>
        <FaSearch size={20} />
        <span style={{ marginTop: '4px' }}>Explore</span>
      </NavLink>
      <NavLink to="/order-history" style={({ isActive }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: isActive ? '#6f4e37' : '#9ca3af',
        fontSize: '0.75rem',
        fontWeight: 600
      })}>
        <FaHistory size={20} />
        <span style={{ marginTop: '4px' }}>Orders</span>
      </NavLink>
      <NavLink to="/profile" style={({ isActive }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: isActive ? '#6f4e37' : '#9ca3af',
        fontSize: '0.75rem',
        fontWeight: 600
      })}>
        <FaUser size={20} />
        <span style={{ marginTop: '4px' }}>Profile</span>
      </NavLink>
    </nav>
  );
}
