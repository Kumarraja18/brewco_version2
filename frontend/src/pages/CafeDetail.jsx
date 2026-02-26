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

    useEffect(() => {
        loadCafe();
    }, [cafeId]);

    const loadCafe = async () => {
        try {
            const [cafeRes, catRes, itemRes, tableRes] = await Promise.all([
                api.get(`/cafes/${cafeId}`),
                api.get(`/cafes/${cafeId}/menu/categories`),
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

    if (loading) return <div className="brew-spinner-container"><div className="brew-spinner" /></div>;
    if (!cafe) return <div style={{textAlign: 'center', padding: '100px'}}><h3>Café not found</h3></div>;

    return (
        <div className="customer-home" style={{background: '#fff', minHeight: '100vh', paddingBottom: '100px'}}>
            {/* Top Navigation */}
            <div style={{padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', position: 'sticky', top: 0, background: '#fff', zIndex: 100}}>
                <FaChevronLeft onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} style={{cursor: 'pointer'}} />
                <div style={{fontWeight: 800, fontSize: '1.1rem'}}>{cafe.name}</div>
            </div>

            {/* Step 1: Selection */}
            {step === 1 && (
                <div style={{padding: '0 20px'}}>
                    <div className="sw-image-wrapper" style={{height: '220px', borderRadius: '24px'}}>
                        <img src={cafe.profileImageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'} alt={cafe.name} />
                    </div>
                    <div style={{marginTop: '25px', textAlign: 'center'}}>
                        <h1 style={{fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px'}}>{cafe.name}</h1>
                        <div style={{display: 'flex', justifyContent: 'center', gap: '15px', color: '#686b78', fontSize: '0.9rem'}}>
                            <span><FaStar color="#10b981" /> {cafe.avgRating || '4.5'}</span>
                            <span>{cafe.city}</span>
                            <span>{cafe.openingTime} - {cafe.closingTime}</span>
                        </div>
                    </div>

                    <div style={{marginTop: '40px'}}>
                        <h3 style={{fontSize: '1rem', fontWeight: 800, marginBottom: '20px', textAlign: 'center'}}>How would you like to enjoy your coffee?</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            <div className="sw-form-card" style={{cursor: 'pointer', borderColor: orderType === 'DINE_IN' ? '#ff5200' : '#f1f1f6'}}
                                onClick={() => { setOrderType('DINE_IN'); setStep(2); }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                                    <div style={{fontSize: '2.5rem'}}>🍽️</div>
                                    <div>
                                        <div style={{fontWeight: 800, fontSize: '1.1rem'}}>Dine-In</div>
                                        <div style={{fontSize: '0.85rem', color: '#686b78'}}>Book a table and enjoy your meal at the café.</div>
                                    </div>
                                </div>
                            </div>
                            <div className="sw-form-card" style={{cursor: 'pointer', borderColor: orderType === 'TAKEAWAY' ? '#ff5200' : '#f1f1f6'}}
                                onClick={() => { setOrderType('TAKEAWAY'); setStep(4); }}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                                    <div style={{fontSize: '2.5rem'}}>🥡</div>
                                    <div>
                                        <div style={{fontWeight: 800, fontSize: '1.1rem'}}>Take-Away</div>
                                        <div style={{fontSize: '0.85rem', color: '#686b78'}}>Skip the line and pick up your order on the go.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Dine-in Details */}
            {step === 2 && (
                <div style={{padding: '20px'}}>
                    <h2 style={{fontSize: '1.4rem', fontWeight: 800, marginBottom: '25px'}}>Booking Details</h2>
                    <div className="sw-form-card">
                        <div style={{marginBottom: '20px'}}>
                            <label className="admin-filter-label"><FaCalendarAlt /> Preferred Date</label>
                            <input type="date" className="sw-input" value={bookingForm.date} onChange={e => setBookingDetails({...bookingForm, date: e.target.value})} />
                        </div>
                        <div style={{marginBottom: '20px'}}>
                            <label className="admin-filter-label"><FaClock /> Preferred Time</label>
                            <input type="time" className="sw-input" value={bookingForm.time} onChange={e => setBookingDetails({...bookingForm, time: e.target.value})} />
                        </div>
                        <div style={{marginBottom: '10px'}}>
                            <label className="admin-filter-label"><FaUsers /> Number of Guests</label>
                            <select className="sw-input" value={bookingForm.guests} onChange={e => setBookingDetails({...bookingForm, guests: parseInt(e.target.value)})}>
                                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Persons</option>)}
                            </select>
                        </div>
                    </div>
                    <button className="brew-btn brew-btn--primary" style={{width: '100%', height: '55px', marginTop: '20px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: '15px'}}
                        onClick={() => setStep(3)}>
                        Select a Table
                    </button>
                </div>
            )}

            {/* Step 3: Table Selection */}
            {step === 3 && (
                <div style={{padding: '20px'}}>
                    <h2 style={{fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px'}}>Pick your spot</h2>
                    <p style={{color: '#686b78', marginBottom: '25px', fontSize: '0.9rem'}}>Showing available tables for {bookingForm.guests} guests.</p>
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                        {tables.filter(t => t.capacity >= bookingForm.guests && t.status === 'AVAILABLE').map(table => (
                            <div key={table.id} className="sw-form-card" 
                                style={{
                                    textAlign: 'center', 
                                    cursor: 'pointer', 
                                    borderColor: bookingForm.tableId === table.id ? '#ff5200' : '#f1f1f6',
                                    background: bookingForm.tableId === table.id ? '#fff9f5' : '#fff'
                                }}
                                onClick={() => setBookingDetails({...bookingForm, tableId: table.id})}>
                                <FaChair size={24} color={bookingForm.tableId === table.id ? '#ff5200' : '#d1d5db'} />
                                <div style={{fontWeight: 800, marginTop: '10px'}}>Table {table.tableNumber}</div>
                                <div style={{fontSize: '0.75rem', color: '#686b78'}}>{table.tableType} • {table.capacity} Seats</div>
                            </div>
                        ))}
                    </div>

                    <button className="brew-btn brew-btn--primary" 
                        style={{width: '100%', height: '55px', marginTop: '30px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: '15px'}}
                        disabled={!bookingForm.tableId}
                        onClick={() => setStep(4)}>
                        {bookingForm.tableId ? 'View Menu' : 'Please select a table'}
                    </button>
                </div>
            )}

            {/* Step 4: Menu */}
            {step === 4 && (
                <div className="sw-menu-layout">
                    <div className="menu-items-list">
                        <div style={{display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '30px'}} className="hide-scrollbar">
                            <button className="admin-filter-pill active">Recommended</button>
                            {categories.map(cat => <button key={cat.id} className="admin-filter-pill">{cat.name}</button>)}
                        </div>

                        {categories.map(cat => {
                            const items = menuItems.filter(item => item.category?.id === cat.id);
                            if (items.length === 0) return null;
                            return (
                                <div key={cat.id} style={{marginBottom: '40px'}}>
                                    <h3 style={{fontWeight: 800, fontSize: '1.2rem', marginBottom: '20px', color: '#1c1c1c'}}>{cat.name}</h3>
                                    {items.map(item => {
                                        const cartItem = cart.find(c => c.id === item.id);
                                        return (
                                            <div key={item.id} className="sw-menu-item">
                                                <div className="sw-item-details">
                                                    <div style={{width: '14px', height: '14px', border: '1px solid #ccc', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px'}}>
                                                        <div style={{width: '8px', height: '8px', borderRadius: '50%', background: item.type === 'VEG' ? '#10b981' : '#ef4444'}}></div>
                                                    </div>
                                                    <div style={{fontWeight: 700, fontSize: '1.05rem', color: '#1c1c1c'}}>{item.name}</div>
                                                    <div style={{fontWeight: 600, marginTop: '4px'}}>₹{item.price}</div>
                                                    <div style={{fontSize: '0.85rem', color: '#686b78', marginTop: '8px', lineHeight: 1.4}}>{item.description || "A café favorite."}</div>
                                                </div>
                                                <div className="sw-item-image">
                                                    <img src={item.imageUrl || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200'} alt={item.name} />
                                                    <div className="sw-add-btn">
                                                        {cartItem ? (
                                                            <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 5px'}}>
                                                                <span onClick={() => removeFromCart(item.id)}>−</span>
                                                                <span>{cartItem.qty}</span>
                                                                <span onClick={() => addToCart(item)}>+</span>
                                                            </div>
                                                        ) : (
                                                            <div onClick={() => addToCart(item)}>ADD</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    <aside className="sw-cart-sidebar" style={{width: '320px'}}>
                        <h3 style={{fontWeight: 800, fontSize: '1.1rem', marginBottom: '20px'}}>Cart Summary</h3>
                        {cart.length === 0 ? (
                            <div style={{textAlign: 'center', padding: '40px 0'}}>
                                <div style={{fontSize: '2rem', marginBottom: '10px', opacity: 0.3}}>🛒</div>
                                <p style={{color: '#686b78', fontSize: '0.85rem'}}>Hungry? Add some items!</p>
                            </div>
                        ) : (
                            <div>
                                {cart.map(item => (
                                    <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                                        <div style={{fontSize: '0.9rem', fontWeight: 600}}>{item.name} x {item.qty}</div>
                                        <div style={{fontWeight: 700}}>₹{item.price * item.qty}</div>
                                    </div>
                                ))}
                                <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '2px dashed #e9e9eb'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem'}}>
                                        <span>Grand Total</span>
                                        <span>₹{cartTotal}</span>
                                    </div>
                                    <button className="brew-btn brew-btn--primary" 
                                        style={{width: '100%', marginTop: '25px', height: '50px', background: '#ff5200', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800}}
                                        onClick={() => navigate('/review-order', { state: { cart, cafe, orderType, bookingDetails: orderType === 'DINE_IN' ? bookingForm : null } })}>
                                        Review Order
                                    </button>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
}