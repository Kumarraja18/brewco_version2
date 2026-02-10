import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../api'

export default function Login({ setUser }){
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
      const data = await loginUser({
        email,
        password,
      })

      const userData = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role ? data.user.role.toLowerCase() : 'customer',
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        gender: data.user.gender,
        isActive: data.user.isActive,
        profileComplete: false,
        emailVerified: true,
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      // Route based on role
      switch(userData.role) {
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
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page login">
      <form className="card auth" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        {error && <div className="error-message">{error}</div>}
        
        <label className="field">
          Select Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="cafe_owner">Café Owner</option>
            <option value="chef">Chef</option>
            <option value="waiter">Waiter</option>
          </select>
        </label>

        <label className="field">
          Email
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </label>

        <label className="field">
          Password
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </label>

        <div className="actions">
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </div>
  )
}
