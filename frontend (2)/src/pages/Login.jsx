import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'
import '../styles/login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer') // Used for DEV guest login
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const { guestLogin } = useContext(AuthContext)



  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please fill all fields')
      setLoading(false)
      return
    }

    try {
      const data = await login(email, password)

      if (!data?.user) {
        throw new Error('Invalid server response')
      }

      const backendRole = data.user.role
        ? data.user.role.toLowerCase()
        : 'customer'

      toast.success(`Welcome back, ${data.user?.firstName || 'User'}!`)

      switch (backendRole) {
        case 'admin':
          navigate('/admin-dashboard')
          break
        case 'cafe_owner':
          navigate(
            data.user?.isProfileComplete
              ? '/cafe-owner-dashboard'
              : '/cafe-setup'
          )
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
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please try again.'

      setError(msg)
    } finally {
      setLoading(false)
    }
  }


  const handleGuestLogin = () => {
    toast.success(`Continuing as ${role.replace('_', ' ')}`)
    guestLogin(role)

    switch (role) {
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
          <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="login-form__title">Sign In</h2>

            {error && (
              <div className="login-form__error">
                {error}
                {error.toLowerCase().includes('sign up') && (
                  <span style={{ display: 'block', marginTop: '6px' }}>
                    <Link
                      to="/register"
                      style={{
                        color: '#6f4e37',
                        fontWeight: 700,
                        textDecoration: 'underline'
                      }}
                    >
                      Click here to Sign Up →
                    </Link>
                  </span>
                )}
              </div>
            )}

            {/* DEV ROLE SELECTOR */}
            <label className="login-form__field">
              Select Role (Development Mode)
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

              <button
                type="button"
                onClick={handleGuestLogin}
                className="login-form__btn login-form__btn--secondary"
                style={{
                  marginTop: '10px',
                  backgroundColor: '#ccc',
                  color: '#333'
                }}
              >
                Continue as Guest
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