import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import { FaStar, FaMapMarkerAlt, FaClock, FaSearch, FaChevronRight } from 'react-icons/fa'
import { AuthContext } from '../context/AuthContext'
import '../styles/customer.css'

export default function CustomerHome() {
    const { user } = useContext(AuthContext)
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

    const isCafeOpen = (openTime, closeTime) => {
        if (!openTime || !closeTime) return true;
        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();
        
        const [oH, oM] = openTime.split(':').map(Number);
        const [cH, cM] = closeTime.split(':').map(Number);
        
        const openVal = oH * 100 + oM;
        const closeVal = cH * 100 + cM;
        
        return currentTime >= openVal && currentTime <= closeVal;
    }

    const openCafes = cafes.filter(c => isCafeOpen(c.openingTime, c.closingTime))
    const filtered = cafes.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.city?.toLowerCase().includes(search.toLowerCase())
    )

    // Top rated for carousel
    const topRated = [...cafes].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0)).slice(0, 5)

    if (loading) return <div className="dashboard-page"><div className="brew-spinner" /></div>

    return (
        <div className="customer-container" style={{ paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ marginTop: '20px', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2e241f' }}>
                    Hey {user?.firstName || 'Coffee Lover'}! ☕
                </h1>
                <p style={{ color: '#8b6f63', fontWeight: 500 }}>Find your perfect brew for today</p>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '40px' }}>
                <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#a67c52' }} />
                <input
                    type="text"
                    placeholder="Search cafes or locations..."
                    style={{ 
                        width: '100%', 
                        padding: '14px 15px 14px 45px', 
                        borderRadius: '12px', 
                        border: '1px solid #d4c0a8',
                        fontSize: '0.95rem',
                        background: '#fff',
                        outline: 'none'
                    }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Featured Carousel */}
            {!search && topRated.length > 0 && (
                <section style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2e241f' }}>Featured Cafes</h2>
                    </div>
                    <div className="carousel-track hide-scrollbar" style={{ display: 'flex', gap: '15px', overflowX: 'auto' }}>
                        {topRated.map(cafe => (
                            <div key={cafe.id} className="carousel-card" 
                                style={{ minWidth: '280px', height: '160px', borderRadius: '16px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                                onClick={() => navigate(`/cafe/${cafe.id}`)}
                            >
                                <img src={cafe.profileImageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500'} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                    <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>{cafe.name}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', margin: '4px 0 0 0' }}>{cafe.city} • {cafe.avgRating || '4.5'} ⭐</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Open Now Section */}
            {!search && openCafes.length > 0 && (
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2e241f', marginBottom: '15px' }}>Open Now</h2>
                    <div style={{ display: 'flex', gap: '15px', overflowX: 'auto' }} className="hide-scrollbar">
                        {openCafes.map(cafe => (
                            <div key={cafe.id} 
                                style={{ minWidth: '140px', cursor: 'pointer' }}
                                onClick={() => navigate(`/cafe/${cafe.id}`)}
                            >
                                <img src={cafe.profileImageUrl || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200'} 
                                    style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} 
                                />
                                <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.85rem', fontWeight: 700, color: '#2e241f' }}>{cafe.name}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* All Cafes Section */}
            <section>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2e241f', marginBottom: '20px' }}>
                    {search ? `Results for "${search}"` : 'Explore All Cafes'}
                </h2>
                <div style={{ display: 'grid', gap: '20px' }}>
                    {filtered.map(cafe => (
                        <div key={cafe.id} 
                            style={{ background: '#fff', borderRadius: '16px', padding: '12px', display: 'flex', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer' }}
                            onClick={() => navigate(`/cafe/${cafe.id}`)}
                        >
                            <img src={cafe.profileImageUrl || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200'} 
                                style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }} 
                            />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#2e241f' }}>{cafe.name}</h3>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                                        {cafe.avgRating || '4.5'} ⭐
                                    </div>
                                </div>
                                <p style={{ margin: '5px 0', fontSize: '0.8rem', color: '#8b6f63' }}>{cafe.city} • {cafe.address}</p>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                                    <span className="tag">Dine-in</span>
                                    <span className="tag">Takeaway</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', color: '#d4c0a8' }}>
                                <FaChevronRight />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
