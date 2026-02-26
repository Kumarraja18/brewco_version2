import React, { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axiosClient'
import toast from 'react-hot-toast'
import { FaStar, FaMapMarkerAlt, FaClock, FaShoppingBag } from 'react-icons/fa'
import '../styles/customer.css'

export default function CafeDetail() {
    const { cafeId } = useParams()
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()

    const [cafe, setCafe] = useState(null)
    const [categories, setCategories] = useState([])
    const [menuItems, setMenuItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState(null)
    const [cart, setCart] = useState([])
    const [orderType, setOrderType] = useState('TAKEAWAY') // Default to takeaway for platform feel

    useEffect(() => {
        loadCafe()
    }, [cafeId])

    const loadCafe = async () => {
        try {
            const [cafeRes, menuRes, itemRes] = await Promise.all([
                api.get(`/cafes/${cafeId}`),
                api.get(`/cafes/${cafeId}/menu/categories`),
                api.get(`/cafes/${cafeId}/menu/items`)
            ])
            setCafe(cafeRes.data)
            setCategories(menuRes.data || [])
            setMenuItems(itemRes.data || [])
            if (menuRes.data?.length > 0) setActiveCategory(menuRes.data[0].id)
        } catch (err) {
            toast.error('Failed to load café details')
        } finally {
            setLoading(false)
        }
    }

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === item.id)
            if (existing) {
                return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
            }
            return [...prev, { ...item, qty: 1 }]
        })
    }

    const removeFromCart = (itemId) => {
        setCart(prev => prev.map(c => {
            if (c.id === itemId) {
                const newQty = c.qty - 1
                return newQty <= 0 ? null : { ...c, qty: newQty }
            }
            return c
        }).filter(Boolean))
    }

    const cartTotal = cart.reduce((sum, c) => sum + (parseFloat(c.price) * c.qty), 0)

    if (loading) return <div className="dashboard-page"><div className="brew-spinner" /></div>
    if (!cafe) return <div className="dashboard-page"><div className="empty-state"><h3>Café not found</h3></div></div>

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            {/* 1. Restaurant Banner Section */}
            <div className="cafe-detail-banner">
                <div className="banner-content">
                    <img 
                        src={cafe.profileImageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600'} 
                        className="banner-img" 
                        alt={cafe.name} 
                    />
                    <div className="banner-info">
                        <h1>{cafe.name}</h1>
                        <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '15px' }}>{cafe.description || "Premium Coffee & Artisan Eats"}</p>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaMapMarkerAlt color="#6f4e37" />
                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{cafe.city}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaStar color="#10b981" />
                                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{cafe.avgRating || '4.5'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaClock color="#6b7280" />
                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{cafe.openingTime} - {cafe.closingTime}</span>
                            </div>
                        </div>
                        
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button 
                                className={`tag ${orderType === 'DINE_IN' ? 'active' : ''}`}
                                onClick={() => setOrderType('DINE_IN')}
                                style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e5e7eb', background: orderType === 'DINE_IN' ? '#6f4e37' : '#fff', color: orderType === 'DINE_IN' ? '#fff' : '#4b5563' }}
                            >
                                🍽️ Dine In
                            </button>
                            <button 
                                className={`tag ${orderType === 'TAKEAWAY' ? 'active' : ''}`}
                                onClick={() => setOrderType('TAKEAWAY')}
                                style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e5e7eb', background: orderType === 'TAKEAWAY' ? '#6f4e37' : '#fff', color: orderType === 'TAKEAWAY' ? '#fff' : '#4b5563' }}
                            >
                                🥡 Takeaway
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Menu Section with Sticky Category Nav */}
            <div className="menu-section-container">
                {/* Left: Category Navigation */}
                <aside className="menu-nav">
                    {categories.map(cat => (
                        <div 
                            key={cat.id} 
                            className={`menu-nav-item ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                const element = document.getElementById(`category-${cat.id}`);
                                if (element) element.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {cat.name}
                        </div>
                    ))}
                </aside>

                {/* Center: Menu Items */}
                <div className="menu-items-list">
                    {categories.map(cat => {
                        const items = menuItems.filter(item => item.category?.id === cat.id);
                        if (items.length === 0) return null;
                        
                        return (
                            <div key={cat.id} id={`category-${cat.id}`} className="category-group">
                                <h2>{cat.name}</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                    {items.map(item => {
                                        const cartItem = cart.find(c => c.id === item.id);
                                        return (
                                            <div key={item.id} className="menu-item-row">
                                                <div className="item-info">
                                                    <div className={`item-type-icon ${item.type === 'VEG' ? 'veg' : 'nonveg'}`} />
                                                    <h4>{item.name}</h4>
                                                    <div className="item-price">₹{item.price}</div>
                                                    <p className="item-desc">{item.description || "Freshly prepared with artisan ingredients."}</p>
                                                </div>
                                                <div className="item-image-action">
                                                    <img src={item.imageUrl || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200'} alt={item.name} />
                                                    <div className="add-btn-container">
                                                        {cartItem ? (
                                                            <div className="add-btn" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                                                <span onClick={() => removeFromCart(item.id)} style={{ cursor: 'pointer' }}>-</span>
                                                                <span style={{ color: '#6f4e37' }}>{cartItem.qty}</span>
                                                                <span onClick={() => addToCart(item)} style={{ cursor: 'pointer' }}>+</span>
                                                            </div>
                                                        ) : (
                                                            <button className="add-btn" onClick={() => addToCart(item)}>Add</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right: Cart Sidebar */}
                <aside className="cart-sidebar">
                    <h3>Your Order</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                        <FaShoppingBag color="#6f4e37" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{orderType} ORDER</span>
                    </div>

                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Your cart is empty.</p>
                            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '10px' }}>Add some delicious items to start your order!</p>
                        </div>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-info">
                                        <div className="cart-item-name">{item.name}</div>
                                        <div className="cart-item-price">₹{item.price}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <button className="qty-btn" onClick={() => removeFromCart(item.id)}>−</button>
                                        <span className="qty-display">{item.qty}</span>
                                        <button className="qty-btn" onClick={() => addToCart(item)}>+</button>
                                    </div>
                                </div>
                            ))}
                            
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px dashed #e5e7eb' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#2e241f', fontSize: '1.1rem' }}>
                                    <span>Total</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '5px' }}>Extra taxes may apply based on order type.</p>
                                
                                <button 
                                    className="brew-btn brew-btn--primary" 
                                    style={{ width: '100%', marginTop: '20px', height: '50px', borderRadius: '12px', fontSize: '1rem' }}
                                    onClick={() => {
                                        if (orderType === 'DINE_IN') {
                                            navigate(`/table-booking/${cafeId}`, { state: { cart, orderType } });
                                        } else {
                                            toast.success('Proceeding to checkout...');
                                        }
                                    }}
                                >
                                    {orderType === 'DINE_IN' ? 'Book Table & Order' : 'Checkout Order'}
                                </button>
                            </div>
                        </>
                    )}
                </aside>
            </div>
        </div>
    )
}
