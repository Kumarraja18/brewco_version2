import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'
import '../styles/login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    setError('')
    
    // Robust validation
    if (!role) {
      setError('Please select a role to login as')
      return
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (!password) {
      setError('Please enter your password')
      return
    }

    setLoading(true)

    try {
      // Role is sent to backend for cross-verification
      const data = await login(email, password, role)

      if (!data?.user) {
        throw new Error('Invalid server response: Missing user data')
      }

      // Backend role is authoritative (normalized to uppercase)
      const backendRole = data.user.role ? data.user.role.toUpperCase() : 'CUSTOMER'

      toast.success(`Welcome back, ${data.user.firstName}!`)

      switch (backendRole) {
        case 'ADMIN':
          navigate('/admin-dashboard')
          break
        case 'CAFE_OWNER':
          navigate(data.user.isProfileComplete ? '/cafe-owner-dashboard' : '/cafe-setup')
          break
        case 'CHEF':
          navigate('/chef-dashboard')
          break
        case 'WAITER':
          navigate('/waiter-dashboard')
          break
        default:
          navigate('/customer-dashboard')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__container">

        {/* LEFT SIDE */}
        <div className="login-page__hero">
          <div className="login-page__hero-overlay">
            <h2 className="login-page__hero-title">Welcome to Brew & Co</h2>
            <p className="login-page__hero-subtitle">
              Order your favorite coffee and enjoy a seamless table booking experience.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-page__form-wrapper">
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <h2 className="login-form__title">Sign In</h2>

            {error && (
              <div className="login-form__error" style={{ 
                background: '#fee2e2', 
                color: '#dc2626', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                fontSize: '0.85rem',
                borderLeft: '4px solid #dc2626',
                fontWeight: 500
              }}>
                {error}
                {error.toLowerCase().includes('sign up') && (
                  <span style={{ display: 'block', marginTop: '8px' }}>
                    <Link to="/register" style={{ color: '#6f4e37', fontWeight: 700, textDecoration: 'underline' }}>
                      Click here to Sign Up →
                    </Link>
                  </span>
                )}
              </div>
            )}

            <label className="login-form__field">
              Login As
              <select
                className="login-form__input"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value)
                  setError('')
                }}
                required
                style={{ appearance: 'auto', paddingRight: '10px' }}
              >
                <option value="" disabled>Select Role</option>
                <option value="CUSTOMER">Customer</option>
                <option value="CAFE_OWNER">Cafe Owner</option>
                <option value="CHEF">Chef</option>
                <option value="WAITER">Waiter</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>

            <label className="login-form__field">
              Email
              <input
                type="email"
                className="login-form__input"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
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
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Enter your password"
                required
              />
            </label>

            <div
              style={{
                textAlign: 'right',
                marginTop: '-8px',
                marginBottom: '12px'
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  color: '#A67C52',
                  fontSize: '0.85rem',
                  textDecoration: 'none'
                }}
              >
                Forgot Password?
              </Link>
            </div>

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