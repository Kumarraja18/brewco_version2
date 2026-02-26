import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import toast from 'react-hot-toast';
import { FaChevronLeft, FaTrash, FaPlus, FaMinus, FaRegClock, FaUtensils, FaCreditCard } from 'react-icons/fa';
import '../styles/customer.css';

export default function ReviewOrder() {
    const location = useLocation();
    const navigate = useNavigate();
    const { cart: initialCart, cafe, orderType, bookingDetails } = location.state || {};

    const [cart, setCart] = useState(initialCart || []);
    const [loading, setLoading] = useState(false);
    const [specialInstructions, setInstructions] = useState('');

    if (!cafe || !cart.length) {
        useEffect(() => { navigate('/customer-dashboard'); }, []);
        return null;
    }

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(c => {
            if (c.id === id) {
                const newQty = c.qty + delta;
                return newQty > 0 ? { ...c, qty: newQty } : null;
            }
            return c;
        }).filter(Boolean));
    };

    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const gst = subTotal * 0.05;
    const grandTotal = subTotal + gst;

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            // 1. If Dine-in, create booking first (optional, backend placeOrder could handle this too but we follow controller)
            let tableId = bookingDetails?.tableId;
            if (orderType === 'DINE_IN') {
                await api.post('/customer/bookings', {
                    cafeId: cafe.id,
                    bookingDate: bookingDetails.date,
                    startTime: bookingDetails.time,
                    numberOfGuests: bookingDetails.guests,
                    tableId: tableId
                });
            }

            // 2. Place the order
            const orderPayload = {
                cafeId: cafe.id,
                orderType: orderType,
                tableId: tableId,
                specialInstructions: specialInstructions,
                items: cart.map(c => ({
                    menuItemId: c.id,
                    quantity: c.qty,
                    notes: ""
                }))
            };

            const res = await api.post('/customer/orders', orderPayload);
            const savedOrder = res.data.order;

            toast.success('Order placed successfully!');
            navigate(`/order-tracking/${savedOrder.id}`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '120px' }}>
            <div style={{ background: '#fff', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #eee' }}>
                <FaChevronLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
                <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Review Order</h1>
            </div>

            <div className="customer-container" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px', marginTop: '20px' }}>
                <div>
                    {/* Items Card */}
                    <div className="sw-form-card" style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <FaUtensils color="#6f4e37" />
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Order Items</h2>
                        </div>
                        {cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f1f1f6' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.name}</div>
                                    <div style={{ color: '#686b78', fontSize: '0.85rem' }}>₹{item.price} each</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div className="sw-add-btn" style={{ position: 'relative', bottom: 0, left: 0, transform: 'none' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 8px' }}>
                                            <span onClick={() => updateQty(item.id, -1)} style={{ cursor: 'pointer' }}><FaMinus size={10} /></span>
                                            <span>{item.qty}</span>
                                            <span onClick={() => updateQty(item.id, 1)} style={{ cursor: 'pointer' }}><FaPlus size={10} /></span>
                                        </div>
                                    </div>
                                    <div style={{ minWidth: '60px', textAlign: 'right', fontWeight: 800 }}>₹{item.price * item.qty}</div>
                                </div>
                            </div>
                        ))}
                        <div style={{ marginTop: '20px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#686b78', display: 'block', marginBottom: '8px' }}>Special Instructions</label>
                            <textarea 
                                placeholder="Add any notes (e.g. less sugar, extra hot)..."
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d4d5d9', resize: 'none', height: '80px', fontFamily: 'inherit' }}
                                value={specialInstructions}
                                onChange={e => setInstructions(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="sw-form-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <FaRegClock color="#6f4e37" />
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{orderType === 'DINE_IN' ? 'Dining Details' : 'Pickup Details'}</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Café</div>
                                <div style={{ fontWeight: 700 }}>{cafe.name}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Type</div>
                                <div style={{ fontWeight: 700 }}>{orderType === 'DINE_IN' ? 'Dine-In' : 'Takeaway'}</div>
                            </div>
                            {orderType === 'DINE_IN' && (
                                <>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Date & Time</div>
                                        <div style={{ fontWeight: 700 }}>{bookingDetails.date} at {bookingDetails.time}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Guests</div>
                                        <div style={{ fontWeight: 700 }}>{bookingDetails.guests} Persons</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <aside>
                    <div className="sw-cart-sidebar" style={{ width: '100%', position: 'sticky', top: '20px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 800 }}>Bill Details</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                            <span style={{ color: '#686b78' }}>Item Total</span>
                            <span>₹{subTotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                            <span style={{ color: '#686b78' }}>GST (5%)</span>
                            <span>₹{gst.toFixed(2)}</span>
                        </div>
                        <div style={{ margin: '15px 0', borderTop: '1px solid #eee' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                            <span>To Pay</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                        </div>

                        <div style={{ marginTop: '30px', background: '#f9fafb', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
                                <FaCreditCard color="#60b246" />
                                <span>CASH ON ARRIVAL</span>
                            </div>
                        </div>

                        <button 
                            className="brew-btn brew-btn--primary"
                            style={{ width: '100%', height: '55px', background: '#60b246', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}
                            disabled={loading}
                            onClick={handlePlaceOrder}
                        >
                            {loading ? 'Processing...' : `Confirm Order • ₹${grandTotal.toFixed(2)}`}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
