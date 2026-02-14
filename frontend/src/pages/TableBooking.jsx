import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function TableBooking(){
  const { cafeId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    tableSize: '',
    guests: 2
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.date || !formData.time || !formData.tableSize) {
      setError('Please fill all fields')
      return
    }

    // Mock booking - in real app, save to backend
    const bookingId = Math.floor(Math.random() * 10000)
    navigate(`/menu/${bookingId}`)
  }

  return (
    <div className="page table-booking">
      <form className="card large" onSubmit={handleSubmit}>
        <h2>Book a Table</h2>
        <p className="subtitle">Café ID: {cafeId}</p>
        
        {error && <div className="error-message">{error}</div>}

        <label className="field">
          Date *
          <input 
            type="date" 
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </label>

        <label className="field">
          Time *
          <input 
            type="time" 
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </label>

        <label className="field">
          Table Size *
          <select name="tableSize" value={formData.tableSize} onChange={handleChange} required>
            <option value="">Select Table Size</option>
            <option value="small">Small (2 persons)</option>
            <option value="medium">Medium (4 persons)</option>
            <option value="large">Large (6+ persons)</option>
          </select>
        </label>

        <label className="field">
          Number of Guests
          <input 
            type="number" 
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            min="1"
            max="10"
          />
        </label>

        <div className="actions">
          <button className="btn primary" type="submit">Continue to Menu</button>
        </div>
      </form>
    </div>
  )
}
