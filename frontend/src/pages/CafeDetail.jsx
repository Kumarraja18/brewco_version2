import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosClient';
import toast from 'react-hot-toast';
import { FaStar, FaMapMarkerAlt, FaClock, FaShoppingBag, FaChevronLeft, FaUsers, FaCalendarAlt, FaChair } from 'react-icons/fa';
import '../styles/customer.css';

export default function CafeDetail() {
    const { cafeId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // States
    const [cafe, setCafe] = useState(null);
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1); // 1: Option, 2: Dine-in Details, 3: Table, 4: Menu
    const [orderType, setOrderType] = useState(null); // 'DINE_IN' or 'TAKEAWAY'
    
    // Booking Details
    const [bookingForm, setBookingDetails] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        guests: 2,
        tableId: null
    });

    const [cart, setCart] = useState([]);
    const [activeCategory, setActiveCategory] = useState('ALL');

    useEffect(() => {
        loadCafe();
    }, [cafeId]);

    const loadCafe = async () => {
        try {
            const [cafeRes, catRes, itemRes, tableRes] = await Promise.all([
                api.get(`/cafes/${cafeId}`),
                api.get(`/cafes/${cafeId}/menu`),
                api.get(`/cafes/${cafeId}/menu/items`),
                api.get(`/cafes/${cafeId}/tables`)
            ]);
            setCafe(cafeRes.data);
            setCategories(catRes.data || []);
            setMenuItems(itemRes.data || []);
            setTables(tableRes.data || []);
        } catch (err) {
            toast.error('Failed to load café data');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === item.id);
            if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.map(c => {
            if (c.id === itemId) return c.qty > 1 ? { ...c, qty: c.qty - 1 } : null;
            return c;
        }).filter(Boolean));
    };

    const cartTotal = cart.reduce((sum, c) => sum + (parseFloat(c.price) * c.qty), 0);

    const filteredCategories = activeCategory === 'ALL' 
        ? categories 
        : categories.filter(c => c.id === activeCategory);

    // Reusable centered container style
    const page = { maxWidth: '700px', margin: '0 auto', padding: '0 24px' };
    const wideContainer = { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' };

    if (loading) return <div className="brew-spinner-container"><div className="brew-spinner" /></div>;
    if (!cafe) return <div style={{textAlign: 'center', padding: '100px'}}><h3>Café not found</h3></div>;

    return (
        <div className="customer-home" style={{background: '#f7f7f9', minHeight: '100vh', paddingBottom: '100px'}}>

            {/* Top Navigation */}
            <div style={{background: '#fff', borderBottom: '1px solid #f1f1f6', position: 'sticky', top: 0, zIndex: 100}}>
                <div style={{...wideContainer, display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 24px'}}>
                    <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
                        style={{background: '#f7f7f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <FaChevronLeft size={14} />
                    </button>
                    <div style={{fontWeight: 800, fontSize: '1.1rem'}}>{cafe.name}</div>
                    {/* Step indicator */}
                    <div style={{marginLeft: 'auto', display: 'flex', gap: '6px'}}>
                        {[1,2,3,4].map(s => (
                            <div key={s} style={{width: s === step ? '20px' : '8px', height: '8px', borderRadius: '4px',
                                background: s === step ? '#6f4e37' : s < step ? '#10b981' : '#e0e0e0',
                                transition: 'all 0.3s ease'}} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Step 1: Dine-In / Take-Away Selection */}
            {step === 1 && (
                <div style={{...page, paddingTop: '24px'}}>
                    {/* Hero Image */}
                    <div style={{height: '240px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}>
                        <img
                            src={cafe.profileImageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'}
                            alt={cafe.name}
                            style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        />
                    </div>

                    {/* Cafe Info Card */}
                    <div style={{background: '#fff', borderRadius: '20px', padding: '24px', marginTop: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
                        <h1 style={{fontSize: '1.7rem', fontWeight: 800, marginBottom: '10px', color: '#1c1c1c'}}>{cafe.name}</h1>
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#686b78', fontSize: '0.88rem'}}>
                            <span style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <FaStar color="#10b981" /> <strong style={{color: '#1c1c1c'}}>{cafe.avgRating || '4.5'}</strong>
                            </span>
                            <span style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <FaMapMarkerAlt color="#6f4e37" /> {cafe.city}
                            </span>
                            <span style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <FaClock color="#6f4e37" /> {cafe.openingTime} – {cafe.closingTime}
                            </span>
                        </div>
                        {cafe.description && (
                            <p style={{marginTop: '12px', color: '#686b78', fontSize: '0.87rem', lineHeight: 1.6}}>{cafe.description}</p>
                        )}
                    </div>

                    {/* Order Type Selection */}
                    <div style={{marginTop: '24px'}}>
                        <h3 style={{fontSize: '1rem', fontWeight: 800, marginBottom: '16px', color: '#1c1c1c'}}>
                            How would you like to enjoy your coffee?
                        </h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                            <div
                                onClick={() => { setOrderType('DINE_IN'); setStep(2); }}
                                style={{
                                    background: '#fff', borderRadius: '18px', padding: '20px 24px', cursor: 'pointer',
                                    border: orderType === 'DINE_IN' ? '2px solid #6f4e37' : '2px solid transparent',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '20px',
                                    transition: 'all 0.2s ease'
                                }}>
                                <div style={{fontSize: '2.5rem', lineHeight: 1}}>🍽️</div>
                                <div style={{flex: 1}}>
                                    <div style={{fontWeight: 800, fontSize: '1.05rem', color: '#1c1c1c'}}>Dine-In</div>
                                    <div style={{fontSize: '0.83rem', color: '#686b78', marginTop: '3px'}}>Book a table and enjoy your meal at the café.</div>
                                </div>
                                <div style={{color: '#6f4e37', fontSize: '1.1rem'}}>›</div>
                            </div>
                            <div
                                onClick={() => { setOrderType('TAKEAWAY'); setStep(4); }}
                                style={{
                                    background: '#fff', borderRadius: '18px', padding: '20px 24px', cursor: 'pointer',
                                    border: orderType === 'TAKEAWAY' ? '2px solid #6f4e37' : '2px solid transparent',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '20px',
                                    transition: 'all 0.2s ease'
                                }}>
                                <div style={{fontSize: '2.5rem', lineHeight: 1}}>🥡</div>
                                <div style={{flex: 1}}>
                                    <div style={{fontWeight: 800, fontSize: '1.05rem', color: '#1c1c1c'}}>Take-Away</div>
                                    <div style={{fontSize: '0.83rem', color: '#686b78', marginTop: '3px'}}>Skip the line and pick up your order on the go.</div>
                                </div>
                                <div style={{color: '#6f4e37', fontSize: '1.1rem'}}>›</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Dine-in Booking Details */}
            {step === 2 && (
                <div style={{...page, paddingTop: '24px'}}>
                    <h2 style={{fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px', color: '#1c1c1c'}}>Booking Details</h2>
                    <p style={{color: '#686b78', fontSize: '0.88rem', marginBottom: '24px'}}>Select your preferred date, time and party size.</p>
                    <div style={{background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'}}>
                        <div style={{marginBottom: '20px'}}>
                            <label className="admin-filter-label" style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                                <FaCalendarAlt color="#6f4e37" /> Preferred Date
                            </label>
                            <input type="date" className="sw-input" value={bookingForm.date}
                                onChange={e => setBookingDetails({...bookingForm, date: e.target.value})} />
                        </div>
                        <div style={{marginBottom: '20px'}}>
                            <label className="admin-filter-label" style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                                <FaClock color="#6f4e37" /> Preferred Time
                            </label>
                            <input type="time" className="sw-input" value={bookingForm.time}
                                onChange={e => setBookingDetails({...bookingForm, time: e.target.value})} />
                        </div>
                        <div>
                            <label className="admin-filter-label" style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                                <FaUsers color="#6f4e37" /> Number of Guests
                            </label>
                            <select className="sw-input" value={bookingForm.guests}
                                onChange={e => setBookingDetails({...bookingForm, guests: parseInt(e.target.value)})}>
                                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Person{n > 1 ? 's' : ''}</option>)}
                            </select>
                        </div>
                    </div>
                    <button
                        style={{width: '100%', height: '54px', marginTop: '20px', background: '#1c1c1c', color: '#fff',
                            border: 'none', borderRadius: '15px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer'}}
                        onClick={() => setStep(3)}>
                        Select a Table →
                    </button>
                </div>
            )}

            {/* Step 3: Table Selection */}
            {step === 3 && (
                <div style={{...page, paddingTop: '24px'}}>
                    <h2 style={{fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px', color: '#1c1c1c'}}>Pick Your Spot</h2>
                    <p style={{color: '#686b78', marginBottom: '24px', fontSize: '0.88rem'}}>
                        Available tables for {bookingForm.guests} guest{bookingForm.guests > 1 ? 's' : ''} on {bookingForm.date} at {bookingForm.time}.
                    </p>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                        {tables.filter(t => t.capacity >= bookingForm.guests && t.status === 'AVAILABLE').map(table => (
                            <div key={table.id}
                                onClick={() => setBookingDetails({...bookingForm, tableId: table.id})}
                                style={{
                                    background: bookingForm.tableId === table.id ? '#fff9f5' : '#fff',
                                    border: bookingForm.tableId === table.id ? '2px solid #ff5200' : '2px solid #f1f1f6',
                                    borderRadius: '16px', padding: '20px', textAlign: 'center', cursor: 'pointer',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s ease'
                                }}>
                                <FaChair size={26} color={bookingForm.tableId === table.id ? '#ff5200' : '#c4c4cf'} />
                                <div style={{fontWeight: 800, marginTop: '10px', color: '#1c1c1c'}}>Table {table.tableNumber}</div>
                                <div style={{fontSize: '0.75rem', color: '#686b78', marginTop: '4px'}}>{table.tableType} • {table.capacity} Seats</div>
                            </div>
                        ))}
                        {tables.filter(t => t.capacity >= bookingForm.guests && t.status === 'AVAILABLE').length === 0 && (
                            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0', color: '#686b78'}}>
                                <FaChair size={32} color="#d1d5db" />
                                <p style={{marginTop: '12px'}}>No available tables for {bookingForm.guests} guests right now.</p>
                            </div>
                        )}
                    </div>
                    <button
                        disabled={!bookingForm.tableId}
                        onClick={() => setStep(4)}
                        style={{
                            width: '100%', height: '54px', marginTop: '24px',
                            background: bookingForm.tableId ? '#1c1c1c' : '#e0e0e0',
                            color: bookingForm.tableId ? '#fff' : '#999',
                            border: 'none', borderRadius: '15px', fontWeight: 800, fontSize: '1rem',
                            cursor: bookingForm.tableId ? 'pointer' : 'not-allowed', transition: 'all 0.2s'
                        }}>
                        {bookingForm.tableId ? 'View Menu →' : 'Select a Table to Continue'}
                    </button>
                </div>
            )}

            {/* Step 4: Menu */}
            {step === 4 && (
                <div style={{...wideContainer, paddingTop: '24px'}}>
                    <div className="sw-menu-layout">
                        <div className="menu-items-list">
                            {/* Category Pills */}
                            <div style={{display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '28px',
                                padding: '4px 0', zIndex: 10}} className="hide-scrollbar">
                                <button
                                    className={`admin-filter-pill ${activeCategory === 'ALL' ? 'active' : ''}`}
                                    onClick={() => setActiveCategory('ALL')}>
                                    All Items
                                </button>
                                {categories.map(cat => (
                                    <button key={cat.id}
                                        className={`admin-filter-pill ${activeCategory === cat.id ? 'active' : ''}`}
                                        onClick={() => setActiveCategory(cat.id)}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {filteredCategories.map(cat => {
                                const items = menuItems.filter(item => item.category?.id === cat.id);
                                if (items.length === 0) return null;
                                return (
                                    <div key={cat.id} style={{marginBottom: '40px'}} id={`cat-${cat.id}`}>
                                        <h3 style={{fontWeight: 800, fontSize: '1.15rem', marginBottom: '16px', color: '#1c1c1c'}}>{cat.name}</h3>
                                        {items.map(item => {
                                            const cartItem = cart.find(c => c.id === item.id);
                                            return (
                                                <div key={item.id} className="sw-menu-item">
                                                    {/* Left: Details */}
                                                    <div className="sw-item-details">
                                                        {/* Veg / Non-veg indicator */}
                                                        <div style={{display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '9px'}}>
                                                            <div style={{
                                                                width: '16px', height: '16px', flexShrink: 0,
                                                                border: `2px solid ${item.type === 'VEG' ? '#10b981' : '#ef4444'}`,
                                                                borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                                <div style={{width: '8px', height: '8px', borderRadius: '50%', background: item.type === 'VEG' ? '#10b981' : '#ef4444'}} />
                                                            </div>
                                                            <span style={{fontSize: '0.68rem', fontWeight: 700, color: item.type === 'VEG' ? '#10b981' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                                                                {item.type === 'VEG' ? 'Veg' : 'Non-Veg'}
                                                            </span>
                                                        </div>

                                                        <div style={{fontWeight: 700, fontSize: '1rem', color: '#1c1c1c', lineHeight: 1.35}}>{item.name}</div>

                                                        {/* Price row */}
                                                        <div style={{display: 'flex', alignItems: 'baseline', gap: '7px', marginTop: '5px'}}>
                                                            <span style={{fontWeight: 800, fontSize: '1rem', color: '#1c1c1c'}}>₹{item.price}</span>
                                                        </div>

                                                        <div style={{fontSize: '0.8rem', color: '#93959f', marginTop: '7px', lineHeight: 1.55,
                                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                                                            {item.description || 'A café favorite.'}
                                                        </div>

                                                        {item.avgRating > 0 && (
                                                            <div style={{display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '9px',
                                                                background: '#f3faf7', padding: '3px 8px', borderRadius: '6px', border: '1px solid #d1f2e1'}}>
                                                                <FaStar size={10} color="#10b981" />
                                                                <span style={{fontSize: '0.73rem', fontWeight: 700, color: '#10b981'}}>{item.avgRating}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right: Image + ADD button */}
                                                    <div className="sw-item-image">
                                                        <img src={item.imageUrl || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200'} alt={item.name} />
                                                        <div className="sw-add-btn">
                                                            {cartItem ? (
                                                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 10px'}}>
                                                                    <span onClick={() => removeFromCart(item.id)} style={{fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', color: '#00a877', lineHeight: 1}}>−</span>
                                                                    <span style={{fontWeight: 800, fontSize: '0.9rem', color: '#1c1c1c'}}>{cartItem.qty}</span>
                                                                    <span onClick={() => addToCart(item)} style={{fontSize: '1.3rem', fontWeight: 700, cursor: 'pointer', color: '#00a877', lineHeight: 1}}>+</span>
                                                                </div>
                                                            ) : (
                                                                <div onClick={() => addToCart(item)} style={{width: '100%', textAlign: 'center', cursor: 'pointer'}}>ADD</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}

                            {filteredCategories.length === 0 && (
                                <div style={{textAlign: 'center', padding: '60px 0', color: '#686b78'}}>
                                    <p style={{fontSize: '1rem'}}>No items available in this category.</p>
                                </div>
                            )}
                        </div>

                        <aside className="sw-cart-sidebar" style={{background: '#fff', borderRadius: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)'}}>
                            <h3 style={{fontWeight: 800, fontSize: '1.1rem', marginBottom: '20px', color: '#1c1c1c'}}>
                                🛒 Cart Summary
                            </h3>
                            {cart.length === 0 ? (
                                <div style={{textAlign: 'center', padding: '40px 0'}}>
                                    <div style={{fontSize: '2.5rem', marginBottom: '12px', opacity: 0.25}}>🛒</div>
                                    <p style={{color: '#686b78', fontSize: '0.85rem'}}>Your cart is empty.</p>
                                    <p style={{color: '#686b78', fontSize: '0.8rem', marginTop: '4px'}}>Add items from the menu.</p>
                                </div>
                            ) : (
                                <div>
                                    <div style={{maxHeight: '300px', overflowY: 'auto'}} className="hide-scrollbar">
                                        {cart.map(item => (
                                            <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px'}}>
                                                <div style={{fontSize: '0.88rem', fontWeight: 600, color: '#1c1c1c', flex: 1}}>
                                                    {item.name}
                                                    <span style={{color: '#686b78', fontWeight: 400}}> × {item.qty}</span>
                                                </div>
                                                <div style={{fontWeight: 800, color: '#6f4e37', whiteSpace: 'nowrap'}}>₹{item.price * item.qty}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '2px dashed #e9e9eb'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: '#1c1c1c'}}>
                                            <span>Grand Total</span>
                                            <span style={{color: '#6f4e37'}}>₹{cartTotal.toFixed(2)}</span>
                                        </div>
                                        {orderType === 'DINE_IN' && bookingForm.tableId && (
                                            <div style={{marginTop: '12px', fontSize: '0.8rem', color: '#686b78', background: '#f7f7f9', borderRadius: '10px', padding: '10px 12px'}}>
                                                🍽️ Table booked for {bookingForm.guests} guest{bookingForm.guests > 1 ? 's' : ''} · {bookingForm.date} {bookingForm.time}
                                            </div>
                                        )}
                                        <button
                                            style={{width: '100%', marginTop: '20px', height: '50px', background: '#ff5200', color: '#fff',
                                                border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer'}}
                                            onClick={() => navigate('/review-order', { state: { cart, cafe, orderType, bookingDetails: orderType === 'DINE_IN' ? bookingForm : null } })}>
                                            Proceed to Checkout →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            )}
        </div>
    );
}