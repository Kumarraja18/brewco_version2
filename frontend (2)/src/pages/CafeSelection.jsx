import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function CafeSelection(){
  const [cafes] = useState([
    { id: 1, name: 'brew & co Downtown', location: 'Downtown Area', rating: 4.8, tables: 15, specialty: 'Espresso Bar', image: 'https://images.pexels.com/photos/3407627/pexels-photo-3407627.jpeg?w=400&h=300&fit=crop' },
    { id: 2, name: 'brew & co Mall', location: 'Shopping Mall', rating: 4.6, tables: 12, specialty: 'Cold Brew', image: 'https://images.pexels.com/photos/3407627/pexels-photo-3407627.jpeg?w=400&h=300&fit=crop' },
    { id: 3, name: 'brew & co Central', location: 'City Center', rating: 4.9, tables: 20, specialty: 'Artisan Blend', image: 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?w=400&h=300&fit=crop' },
    { id: 4, name: 'brew & co Business District', location: 'Business Hub', rating: 4.5, tables: 18, specialty: 'Quick Service', image: 'https://images.pexels.com/photos/3735222/pexels-photo-3735222.jpeg?w=400&h=300&fit=crop' },
    { id: 5, name: 'brew & co Heritage', location: 'Heritage Area', rating: 4.7, tables: 25, specialty: 'Classic Roast', image: 'https://images.pexels.com/photos/2313712/pexels-photo-2313712.jpeg?w=400&h=300&fit=crop' }
  ])
  const [selectedCafe, setSelectedCafe] = useState(null)

  return (
    <div className="page cafe-selection">
      <h2>Discover brew & co Locations</h2>
      <p className="subtitle">Choose from our premium coffee destinations</p>

      <div className="cafes-grid">
        {cafes.map(cafe => (
          <div key={cafe.id} className="cafe-card card">
            <img src={cafe.image} alt={cafe.name} className="cafe-image" />
            <h3>{cafe.name}</h3>
            <p className="location">📍 {cafe.location}</p>
            <p className="specialty">{cafe.specialty}</p>
            <p className="rating">⭐ {cafe.rating} rating</p>
            <p className="tables">🪑 {cafe.tables} tables available</p>
            <Link 
              className="btn primary" 
              to={`/table-booking/${cafe.id}`}
            >
              Reserve Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
