import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../api'
import '../styles/login.css'

export default function Login({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please fill all fields')
      setLoading(false)
      return
    }

    try {
      // Send selected role to backend for cross-verification
      const data = await loginUser({
        email,
        password,
        role: role.toUpperCase(),
      })

      // Use the role from the BACKEND response (verified & authoritative)
      const backendRole = data.user.role ? data.user.role.toLowerCase() : 'customer'

      const userData = {
        id: data.user.id,
        email: data.user.email,
        role: backendRole,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        gender: data.user.gender,
        isActive: data.user.isActive,
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      // Route based on the verified role from the backend
      switch (backendRole) {
        case 'admin':
          navigate('/admin-dashboard')
          break
        case 'cafe_owner':
          navigate('/cafe-owner-dashboard')
          break
        case 'chef':
          navigate('/chef-dashboard')
          break
        case 'waiter':
          navigate('/waiter-dashboard')
          break
        default:
          navigate('/customer-dashboard')
      }
    } catch (err) {
      const msg = err.message || 'Login failed. Please try again.'
      // If user not found, suggest signing up
      if (msg.includes('sign up')) {
        setError(msg)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__container">

        {/* LEFT IMAGE */}
        <div className="login-page__hero">
          <div className="login-page__hero-overlay">
            <h2 className="login-page__hero-title">Welcome to Brew & Co</h2>
            <p className="login-page__hero-subtitle">
              Order your favorite coffee and enjoy a seamless table booking experience.
            </p>
          </div>
        </div>


        {/* RIGHT FORM */}
        <div className="login-page__form-wrapper">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="login-form__title">Sign In</h2>

            {error && (
              <div className="login-form__error">
                {error}
                {error.includes('sign up') && (
                  <span style={{ display: 'block', marginTop: '6px' }}>
                    <Link to="/register" style={{ color: '#6f4e37', fontWeight: 700, textDecoration: 'underline' }}>
                      Click here to Sign Up →
                    </Link>
                  </span>
                )}
              </div>
            )}

            <label className="login-form__field">
              Select Role
              <select
                className="login-form__input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="cafe_owner">Café Owner</option>
                <option value="chef">Chef</option>
                <option value="waiter">Waiter</option>
              </select>
            </label>

            <label className="login-form__field">
              Email
              <input
                type="email"
                className="login-form__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </label>

            <label className="login-form__field">
              Password
              <input
                type="password"
                className="login-form__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>

            <div className="login-form__actions">
              <button
                type="submit"
                className="login-form__btn login-form__btn--primary"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>

            <p className="login-form__switch">
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </form>
        </div>

      </div>
    </div>


  )
}
