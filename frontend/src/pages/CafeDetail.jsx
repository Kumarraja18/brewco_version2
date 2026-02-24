import React, { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axiosClient'
import toast from 'react-hot-toast'
import '../styles/dashboard.css'

export default function CafeDetail() {
    const { cafeId } = useParams()
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()

    const [cafe, setCafe] = useState(null)
    const [categories, setCategories] = useState([])
    const [menuItems, setMenuItems] = useState([])
    const [tables, setTables] = useState([])
    const [loading, setLoading] = useState(true)

    // Order flow state
    const [orderType, setOrderType] = useState(null) // null, DINE_IN, TAKEAWAY
    const [selectedTable, setSelectedTable] = useState(null)
    const [bookingDate, setBookingDate] = useState('')
    const [bookingTime, setBookingTime] = useState('')
    const [numberOfGuests, setNumberOfGuests] = useState(2)
    const [dateTimeConfirmed, setDateTimeConfirmed] = useState(false)
    const [cart, setCart] = useState([])
    const [specialInstructions, setSpecialInstructions] = useState('')
    const [placing, setPlacing] = useState(false)
    const [activeCategory, setActiveCategory] = useState(null)

    useEffect(() => {
        loadCafe()
    }, [cafeId])

    const loadCafe = async () => {
        try {
            const [cafeRes, menuRes, tableRes] = await Promise.all([
                api.get(`/cafes/${cafeId}`),
                api.get(`/cafes/${cafeId}/menu`),
                api.get(`/cafes/${cafeId}/tables`)
            ])
            setCafe(cafeRes.data)
            setCategories(menuRes.data || [])
            setTables(tableRes.data || [])

            // Load all menu items for each category
            const allItems = []
            for (const cat of (menuRes.data || [])) {
                try {
                    const itemRes = await api.get(`/cafes/${cafeId}/menu/items?categoryId=${cat.id}`)
                    if (itemRes.data) allItems.push(...itemRes.data)
                } catch { /* ignore */ }
            }
            if (allItems.length === 0) {
                try {
                    const itemRes = await api.get(`/cafes/${cafeId}/menu/items`)
                    if (itemRes.data) allItems.push(...itemRes.data)
                } catch { /* ignore */ }
            }
            setMenuItems(allItems)
            if (menuRes.data?.length > 0) setActiveCategory(menuRes.data[0].id)
        } catch (err) {
            toast.error('Failed to load café details')
        }
        setLoading(false)
    }

    // Cart functions
    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === item.id)
            if (existing) {
                return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
            }
            return [...prev, { ...item, qty: 1 }]
        })
        toast.success(`${item.name} added to cart`)
    }

    const updateQty = (itemId, delta) => {
        setCart(prev => prev.map(c => {
            if (c.id === itemId) {
                const newQty = c.qty + delta
                return newQty <= 0 ? null : { ...c, qty: newQty }
            }
            return c
        }).filter(Boolean))
    }

    const cartTotal = cart.reduce((sum, c) => sum + (parseFloat(c.price) * c.qty), 0)
    const cartCount = cart.reduce((sum, c) => sum + c.qty, 0)

    // Get today's date as min for booking
    const today = new Date().toISOString().split('T')[0]

    // Generate time slots (every 30 min from cafe opening to closing)
    const timeSlots = []
    if (cafe) {
        const open = cafe.openingTime || '08:00'
        const close = cafe.closingTime || '22:00'
        let [h, m] = open.split(':').map(Number)
        const [ch, cm] = close.split(':').map(Number)
        while (h < ch || (h === ch && m < cm)) {
            timeSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
            m += 30
            if (m >= 60) { h += 1; m = 0 }
        }
    }

    const handleConfirmDateTime = () => {
        if (!bookingDate) { toast.error('Please select a date'); return }
        if (!bookingTime) { toast.error('Please select a time slot'); return }
        setDateTimeConfirmed(true)
    }

    const handlePlaceOrder = async () => {
        if (!user) { navigate('/login'); return }
        if (cart.length === 0) { toast.error('Add items to cart first'); return }
        if (orderType === 'DINE_IN' && !selectedTable) { toast.error('Select a table'); return }

        setPlacing(true)
        try {
            // If dine-in, first create a booking
            if (orderType === 'DINE_IN' && selectedTable) {
                try {
                    await api.post('/customer/bookings', {
                        cafeId: parseInt(cafeId),
                        tableId: selectedTable.id,
                        bookingDate: bookingDate,
                        startTime: bookingTime,
                        numberOfGuests: numberOfGuests,
                        specialRequests: specialInstructions
                    })
                } catch { /* booking is optional side-effect */ }
            }

            const payload = {
                cafeId: parseInt(cafeId),
                orderType: orderType,
                tableId: selectedTable?.id || null,
                specialInstructions: specialInstructions,
                items: cart.map(c => ({
                    menuItemId: c.id,
                    quantity: c.qty,
                    unitPrice: c.price,
                    specialRequests: ''
                }))
            }
            const res = await api.post('/customer/orders', payload)
            toast.success('Order placed successfully!')
            navigate(`/order-tracking/${res.data?.order?.id || res.data?.id || ''}`)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to place order')
        }
        setPlacing(false)
    }

    const filteredItems = activeCategory
        ? menuItems.filter(i => i.category?.id === activeCategory)
        : menuItems
    const availableItems = filteredItems.filter(i => i.isAvailable && !i.isAddon)
    const addonItems = menuItems.filter(i => i.isAddon && i.isAvailable)

    // Determine if menu should be visible
    const showMenu = orderType && (orderType === 'TAKEAWAY' || (selectedTable && dateTimeConfirmed))

    if (loading) return <div className="dashboard-page"><div className="brew-spinner" /></div>
    if (!cafe) return <div className="dashboard-page"><div className="empty-state"><div className="empty-state__text">Café not found</div></div></div>

    return (
        <div className="dashboard-page">
            {/* Cafe Header */}
            <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '16px', background: 'var(--brew-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', flexShrink: 0, overflow: 'hidden' }}>
                    {cafe.profileImageUrl ? <img src={cafe.profileImageUrl} alt={cafe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '☕'}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 className="dashboard-page__title" style={{ marginBottom: '0.25rem' }}>{cafe.name}</h1>
                    <p style={{ color: 'var(--brew-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        📍 {cafe.address}, {cafe.city}
                    </p>
                    <p style={{ color: 'var(--brew-muted)', fontSize: '0.85rem' }}>
                        🕐 {cafe.openingTime} - {cafe.closingTime} &nbsp; ⭐ {cafe.avgRating || '4.5'}
                    </p>
                    {cafe.description && (
                        <p style={{ color: 'var(--brew-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{cafe.description}</p>
                    )}
                </div>
            </div>

            {/* ────────── STEP 1: Order Type Selection ────────── */}
            {!orderType && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2 className="section-title" style={{ marginBottom: '1rem' }}>How would you like to order?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '500px' }}>
                        <div className="glass-card glass-card--clickable" onClick={() => setOrderType('DINE_IN')}
                            style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍽️</div>
                            <h3 style={{ color: 'var(--brew-dark)', fontWeight: 700 }}>Dine In</h3>
                            <p style={{ color: 'var(--brew-muted)', fontSize: '0.82rem' }}>Select a table and eat here</p>
                        </div>
                        <div className="glass-card glass-card--clickable" onClick={() => setOrderType('TAKEAWAY')}
                            style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🥡</div>
                            <h3 style={{ color: 'var(--brew-dark)', fontWeight: 700 }}>Takeaway</h3>
                            <p style={{ color: 'var(--brew-muted)', fontSize: '0.82rem' }}>Pack it and take it with you</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ────────── STEP 2 (Dine-In): Table Selection ────────── */}
            {orderType === 'DINE_IN' && !selectedTable && (
                <div style={{ marginBottom: '2rem' }}>
                    <div className="section-header">
                        <h2 className="section-title">Select a Table</h2>
                        <button className="brew-btn brew-btn--secondary brew-btn--sm" onClick={() => setOrderType(null)}>← Back</button>
                    </div>
                    {tables.length === 0 ? (
                        <div className="empty-state"><div className="empty-state__icon">🪑</div><div className="empty-state__text">No tables available</div></div>
                    ) : (
                        <div className="table-grid">
                            {tables.map(table => (
                                <div key={table.id}
                                    className={`glass-card table-card ${table.status !== 'AVAILABLE' ? 'table-card--unavailable' : ''}`}
                                    onClick={() => table.status === 'AVAILABLE' && setSelectedTable(table)}
                                >
                                    <div className="table-card__number">T{table.tableNumber}</div>
                                    <div className="table-card__type">{table.tableType}</div>
                                    <div className="table-card__capacity">{table.capacity} seats</div>
                                    <span className={`status-badge status-badge--${table.status.toLowerCase()}`} style={{ marginTop: '0.5rem' }}>
                                        {table.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ────────── STEP 3 (Dine-In): Date, Time & Guests ────────── */}
            {orderType === 'DINE_IN' && selectedTable && !dateTimeConfirmed && (
                <div style={{ marginBottom: '2rem' }}>
                    <div className="section-header">
                        <h2 className="section-title">Choose Date & Time</h2>
                        <button className="brew-btn brew-btn--secondary brew-btn--sm" onClick={() => setSelectedTable(null)}>← Back</button>
                    </div>

                    <div className="glass-card" style={{ maxWidth: '520px', padding: '2rem' }}>
                        {/* Selected table summary */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(139,94,60,0.08)' }}>
                            <div style={{ fontSize: '2rem' }}>🪑</div>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--brew-dark)' }}>Table T{selectedTable.tableNumber}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--brew-muted)' }}>
                                    {selectedTable.tableType} • {selectedTable.capacity} seats
                                </div>
                            </div>
                        </div>

                        {/* Date picker */}
                        <div className="brew-field">
                            <label className="brew-label">Reservation Date *</label>
                            <input
                                type="date"
                                className="brew-input"
                                min={today}
                                value={bookingDate}
                                onChange={e => setBookingDate(e.target.value)}
                            />
                        </div>

                        {/* Time slot selection */}
                        <div className="brew-field">
                            <label className="brew-label">Time Slot *</label>
                            {timeSlots.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.5rem' }}>
                                    {timeSlots.map(slot => (
                                        <button
                                            key={slot}
                                            className={`brew-btn ${bookingTime === slot ? 'brew-btn--primary' : 'brew-btn--secondary'} brew-btn--sm`}
                                            style={{ justifyContent: 'center', fontSize: '0.82rem' }}
                                            onClick={() => setBookingTime(slot)}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--brew-muted)', fontSize: '0.85rem' }}>No time slots available</p>
                            )}
                        </div>

                        {/* Number of guests */}
                        <div className="brew-field">
                            <label className="brew-label">Number of Guests</label>
                            <select className="brew-select" value={numberOfGuests} onChange={e => setNumberOfGuests(parseInt(e.target.value))}>
                                {Array.from({ length: selectedTable.capacity }, (_, i) => i + 1).map(n => (
                                    <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                                ))}
                            </select>
                        </div>

                        <button className="brew-btn brew-btn--primary brew-btn--lg" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                            onClick={handleConfirmDateTime}
                        >
                            Confirm Reservation & Continue to Menu →
                        </button>
                    </div>
                </div>
            )}

            {/* ────────── STEP 4: Menu (after all selections done) ────────── */}
            {showMenu && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
                    {/* Menu Items */}
                    <div>
                        <div className="section-header">
                            <h2 className="section-title">
                                Menu
                                {orderType === 'DINE_IN' && selectedTable && (
                                    <span style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--brew-muted)' }}>
                                        &nbsp;• Table T{selectedTable.tableNumber} • {bookingDate} at {bookingTime}
                                    </span>
                                )}
                                {orderType === 'TAKEAWAY' && (
                                    <span style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--brew-muted)' }}>&nbsp;• Takeaway</span>
                                )}
                            </h2>
                            <button className="brew-btn brew-btn--secondary brew-btn--sm"
                                onClick={() => {
                                    if (orderType === 'DINE_IN') { setDateTimeConfirmed(false) }
                                    else { setOrderType(null) }
                                }}
                            >
                                ← Back
                            </button>
                        </div>

                        {/* Category Tabs */}
                        {categories.length > 0 && (
                            <div className="brew-tabs" style={{ flexWrap: 'wrap' }}>
                                {categories.map(cat => (
                                    <button key={cat.id}
                                        className={`brew-tab ${activeCategory === cat.id ? 'brew-tab--active' : ''}`}
                                        onClick={() => setActiveCategory(cat.id)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Items */}
                        {availableItems.length === 0 ? (
                            <div className="empty-state"><div className="empty-state__icon">📋</div><div className="empty-state__text">No items in this category</div></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {availableItems.map(item => {
                                    const inCart = cart.find(c => c.id === item.id)
                                    return (
                                        <div key={item.id} className="glass-card menu-item-card">
                                            <div className="menu-item-card__image">
                                                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : '🍽️'}
                                            </div>
                                            <div className="menu-item-card__info">
                                                <div className="menu-item-card__name">
                                                    <span className={`menu-item-card__type menu-item-card__type--${item.type?.toLowerCase()}`} />
                                                    {item.name}
                                                </div>
                                                {item.description && <div className="menu-item-card__desc">{item.description}</div>}
                                                <div className="menu-item-card__price">₹{item.price}</div>
                                            </div>
                                            <div>
                                                {inCart ? (
                                                    <div className="cart-item__qty">
                                                        <button onClick={() => updateQty(item.id, -1)}>−</button>
                                                        <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{inCart.qty}</span>
                                                        <button onClick={() => updateQty(item.id, 1)}>+</button>
                                                    </div>
                                                ) : (
                                                    <button className="brew-btn brew-btn--primary brew-btn--sm" onClick={() => addToCart(item)}>
                                                        Add +
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Add-ons Section */}
                        {addonItems.length > 0 && (
                            <div style={{ marginTop: '2rem' }}>
                                <h3 className="section-title" style={{ marginBottom: '0.75rem' }}>
                                    ✨ Would you like to add more?
                                </h3>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {addonItems.map(item => (
                                        <div key={item.id} className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '200px' }}>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brew-dark)' }}>{item.name}</div>
                                                <div style={{ fontWeight: 800, color: 'var(--brew-brown)', fontSize: '0.85rem' }}>+₹{item.price}</div>
                                            </div>
                                            <button className="brew-btn brew-btn--secondary brew-btn--sm" onClick={() => addToCart(item)}>
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cart Sidebar */}
                    <div className="cart-sidebar">
                        <div className="cart-summary glass-card">
                            <h3 style={{ fontWeight: 700, color: 'var(--brew-dark)', marginBottom: '1rem' }}>
                                🛒 Your Order ({cartCount})
                            </h3>

                            {/* Dine-in reservation info */}
                            {orderType === 'DINE_IN' && selectedTable && (
                                <div style={{ background: 'rgba(139,94,60,0.08)', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--brew-dark)' }}>🪑 Table T{selectedTable.tableNumber}</div>
                                    <div style={{ color: 'var(--brew-muted)' }}>📅 {bookingDate} at {bookingTime}</div>
                                    <div style={{ color: 'var(--brew-muted)' }}>👥 {numberOfGuests} {numberOfGuests === 1 ? 'guest' : 'guests'}</div>
                                </div>
                            )}

                            {cart.length === 0 ? (
                                <p style={{ color: 'var(--brew-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                                    Your cart is empty
                                </p>
                            ) : (
                                <>
                                    {cart.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--brew-dark)' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--brew-muted)' }}>₹{item.price} × {item.qty}</div>
                                            </div>
                                            <div className="cart-item__qty">
                                                <button onClick={() => updateQty(item.id, -1)}>−</button>
                                                <span style={{ fontWeight: 700 }}>{item.qty}</span>
                                                <button onClick={() => updateQty(item.id, 1)}>+</button>
                                            </div>
                                        </div>
                                    ))}

                                    <div style={{ marginTop: '1rem' }}>
                                        <label className="brew-label">Special Instructions</label>
                                        <textarea className="brew-input" rows={2} placeholder="Any preferences..."
                                            value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)}
                                            style={{ resize: 'vertical' }}
                                        />
                                    </div>

                                    <div className="order-card__total" style={{ margin: '1rem 0' }}>
                                        <span>Subtotal</span>
                                        <span>₹{cartTotal.toFixed(2)}</span>
                                    </div>

                                    <button className="brew-btn brew-btn--primary brew-btn--lg"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                        onClick={handlePlaceOrder}
                                        disabled={placing}
                                    >
                                        {placing ? 'Placing Order...' : `Place Order • ₹${cartTotal.toFixed(2)}`}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
