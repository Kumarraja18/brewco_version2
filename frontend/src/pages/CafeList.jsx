import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import { FaStar, FaMapMarkerAlt, FaClock, FaSearch } from 'react-icons/fa'
import '../styles/customer.css'

export default function CafeList() {
    const [cafes, setCafes] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        loadCafes()
    }, [])

    const loadCafes = async () => {
        try {
            const res = await api.get('/cafes')
            setCafes(res.data || [])
        } catch (err) {
            console.error("Failed to load cafes")
        } finally {
            setLoading(false)
        }
    }

    const filtered = cafes.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.city?.toLowerCase().includes(search.toLowerCase())
    )

    // Top rated for carousel
    const topRated = [...cafes].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0)).slice(0, 5)

    if (loading) return <div className="dashboard-page"><div className="brew-spinner" /></div>

    return (
        <div className="customer-container">
            {/* 1. Header Section */}
            <div className="section-header" style={{ marginTop: '20px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#2e241f' }}>Discover Best Coffee Spots</h1>
                <p style={{ color: '#6b7280' }}>Handpicked cafés just for you</p>
            </div>

            {/* 2. Search Bar */}
            <div style={{ position: 'relative', marginBottom: '40px', maxWidth: '600px' }}>
                <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                    type="text"
                    placeholder="Search for cafés, locations or cuisines..."
                    style={{ 
                        width: '100%', 
                        padding: '15px 15px 15px 45px', 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb',
                        fontSize: '1rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                    }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* 3. Featured Carousel */}
            {topRated.length > 0 && !search && (
                <div className="cafe-carousel">
                    <div className="section-header">
                        <h2>Featured Collections</h2>
                    </div>
                    <div className="carousel-track">
                        {topRated.map(cafe => (
                            <div key={cafe.id} className="carousel-card" onClick={() => navigate(`/cafe/${cafe.id}`)}>
                                <img src={cafe.profileImageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500'} alt={cafe.name} />
                                <div className="carousel-overlay">
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{cafe.name}</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', opacity: 0.9 }}>Top Rated in {cafe.city}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. All Restaurants List */}
            <div className="section-header">
                <h2>{search ? `Search Results for "${search}"` : 'All Restaurants'}</h2>
            </div>

            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>☕</div>
                    <h3>No cafés found matching your search</h3>
                    <p style={{ color: '#6b7280' }}>Try searching for a different city or name</p>
                </div>
            ) : (
                <div className="cafes-list-grid">
                    {filtered.map(cafe => (
                        <div key={cafe.id} className="cafe-platform-card" onClick={() => navigate(`/cafe/${cafe.id}`)}>
                            <div className="cafe-card-image-wrapper">
                                <img src={cafe.profileImageUrl || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500'} alt={cafe.name} />
                                <div className="rating-badge">
                                    {cafe.avgRating || '4.5'} <FaStar size={10} />
                                </div>
                            </div>
                            <div className="cafe-card-details">
                                <div className="cafe-name-row">
                                    <h3>{cafe.name}</h3>
                                </div>
                                <div className="cafe-meta-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                                        <FaMapMarkerAlt size={12} color="#6f4e37" /> {cafe.city}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <FaClock size={12} color="#10b981" /> {cafe.openingTime} - {cafe.closingTime}
                                    </div>
                                </div>
                                <div className="cafe-tags">
                                    <span className="tag">Coffee</span>
                                    <span className="tag">Dine-in</span>
                                    <span className="tag">Takeaway</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
