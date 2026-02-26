import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosClient'
import '../styles/dashboard.css'

export default function CafeList() {
    const [cafes, setCafes] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/cafes')
                setCafes(res.data || [])
            } catch { /* ignore */ }
            setLoading(false)
        }
        load()
    }, [])

    const filtered = cafes.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.city?.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <div className="dashboard-page"><div className="brew-spinner" /></div>

    return (
        <div className="dashboard-page">
            <div className="dashboard-page__header">
                <h1 className="dashboard-page__title">Browse Cafés</h1>
                <p className="dashboard-page__subtitle">Discover the perfect spot for your next coffee</p>
            </div>

            <div className="brew-field" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    className="brew-input"
                    placeholder="🔍 Search cafés by name or city..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">☕</div>
                    <div className="empty-state__text">No cafés found</div>
                    <div className="empty-state__subtext">Try a different search or check back later</div>
                </div>
            ) : (
                <div className="cards-grid">
                    {filtered.map(cafe => (
                        <div key={cafe.id} className="glass-card cafe-card glass-card--clickable"
                            onClick={() => navigate(`/cafe/${cafe.id}`)}
                        >
                            <div className="cafe-card__image">
                                {cafe.profileImageUrl
                                    ? <img src={cafe.profileImageUrl} alt={cafe.name} />
                                    : '☕'
                                }
                            </div>
                            <div className="cafe-card__body">
                                <div className="cafe-card__name">{cafe.name}</div>
                                <div className="cafe-card__location">
                                    📍 {cafe.city}{cafe.state ? `, ${cafe.state}` : ''}
                                </div>
                                <div className="cafe-card__footer">
                                    <span className="cafe-card__rating">
                                        ⭐ {cafe.avgRating || '4.5'}
                                    </span>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--brew-muted)' }}>
                                        {cafe.openingTime} - {cafe.closingTime}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
