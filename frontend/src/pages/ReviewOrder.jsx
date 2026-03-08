import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosClient';
import toast from 'react-hot-toast';
import { FaChevronLeft, FaPlus, FaMinus, FaRegClock, FaUtensils, FaCreditCard, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa';
import '../styles/customer.css';

export default function ReviewOrder() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { cart: initialCart, cafe, orderType, bookingDetails } = location.state || {};

    const [cart, setCart] = useState(initialCart || []);
    const [loading, setLoading] = useState(false);
    const [specialInstructions, setInstructions] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH or RAZORPAY

    useEffect(() => {
        if (!cafe || !initialCart?.length) {
            navigate('/customer-dashboard');
        }
    }, []);

    if (!cafe || !cart.length) return null;

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

    // Open Razorpay checkout modal
    const openRazorpayCheckout = (razorpayData, orderId) => {
        const options = {
            key: razorpayData.keyId,
            amount: razorpayData.amount,
            currency: razorpayData.currency,
            name: 'Brew & Co',
            description: `Order at ${cafe.name} (Demo)`,
            order_id: razorpayData.razorpayOrderId,
            handler: async function (response) {
                try {
                    await api.post('/payments/verify', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        payment_id: String(razorpayData.paymentId)
                    });
                    toast.success('Payment successful!');
                    navigate(`/order-tracking/${orderId}`);
                } catch (err) {
                    toast.error('Payment verification failed. Contact support.');
                    navigate(`/order-tracking/${orderId}`);
                }
            },
            prefill: {
                name: user ? `${user.firstName} ${user.lastName}` : '',
                email: user?.email || '',
            },
            theme: {
                color: '#6f4e37'
            },
            modal: {
                ondismiss: function () {
                    toast('Payment cancelled. Order is placed — pay at arrival.', { icon: 'i' });
                    navigate(`/order-tracking/${orderId}`);
                }
            }
        };

        if (!window.Razorpay) {
            toast.error('Razorpay SDK not loaded. Please refresh the page.');
            return;
        }
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            let tableId = bookingDetails?.tableId;
            let bookingId = null;

            // 1. If Dine-in, create booking first
            if (orderType === 'DINE_IN') {
                const bookingRes = await api.post('/customer/bookings', {
                    cafeId: cafe.id,
                    bookingDate: bookingDetails.date,
                    startTime: bookingDetails.time,
                    slotDuration: bookingDetails.slotDuration || 60,
                    numberOfGuests: bookingDetails.guests,
                    tableId: tableId
                });
                bookingId = bookingRes.data.bookingId;
            }

            // 2. Place the order
            const orderPayload = {
                cafeId: cafe.id,
                orderType: orderType,
                tableId: tableId,
                bookingId: bookingId,
                specialInstructions: specialInstructions,
                items: cart.map(c => ({
                    menuItemId: c.id,
                    quantity: c.qty,
                    notes: ""
                }))
            };

            const res = await api.post('/customer/orders', orderPayload);
            const savedOrder = res.data.order;

            // 3. If Razorpay payment, initiate payment flow
            if (paymentMethod === 'RAZORPAY') {
                try {
                    const payRes = await api.post('/payments/create-order', {
                        orderId: savedOrder.id
                    });
                    setLoading(false);
                    openRazorpayCheckout(payRes.data, savedOrder.id);
                    return;
                } catch (payErr) {
                    const errMsg = payErr.response?.data?.error || 'Payment initiation failed';
                    toast.error(errMsg);
                    navigate(`/order-tracking/${savedOrder.id}`);
                    return;
                }
            }

            // 4. Cash payment — go directly to tracking
            if (orderType === 'DINE_IN') {
                toast.success('Booking submitted! Your order will be confirmed once the cafe approves.');
            } else {
                toast.success('Order placed successfully!');
            }
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
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Cafe</div>
                                <div style={{ fontWeight: 700 }}>{cafe.name}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Type</div>
                                <div style={{ fontWeight: 700 }}>{orderType === 'DINE_IN' ? 'Dine-In' : 'Takeaway'}</div>
                            </div>
                            {orderType === 'DINE_IN' && (
                                <>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Date & Time Slot</div>
                                        <div style={{ fontWeight: 700 }}>{bookingDetails.date} at {bookingDetails.time} ({bookingDetails.slotDuration === 120 ? '2 hrs' : '1 hr'})</div>
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

                        {/* Payment Method Selector */}
                        <div style={{ marginTop: '24px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#686b78', textTransform: 'uppercase', marginBottom: '10px' }}>
                                Payment Method
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* Cash on Arrival */}
                                <div
                                    onClick={() => setPaymentMethod('CASH')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                                        background: paymentMethod === 'CASH' ? '#f5ede6' : '#f9fafb',
                                        border: paymentMethod === 'CASH' ? '2px solid #6f4e37' : '2px solid #e5e7eb',
                                        transition: 'all 0.2s ease'
                                    }}>
                                    <div style={{
                                        width: '18px', height: '18px', borderRadius: '50%',
                                        border: paymentMethod === 'CASH' ? '5px solid #6f4e37' : '2px solid #ccc',
                                        flexShrink: 0
                                    }} />
                                    <FaMoneyBillWave size={16} color={paymentMethod === 'CASH' ? '#6f4e37' : '#999'} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: paymentMethod === 'CASH' ? '#6f4e37' : '#1c1c1c' }}>Cash on Arrival</div>
                                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Pay when you arrive at the cafe</div>
                                    </div>
                                </div>
                                {/* Pay Online (Razorpay) */}
                                <div
                                    onClick={() => setPaymentMethod('RAZORPAY')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                                        background: paymentMethod === 'RAZORPAY' ? '#f5ede6' : '#f9fafb',
                                        border: paymentMethod === 'RAZORPAY' ? '2px solid #6f4e37' : '2px solid #e5e7eb',
                                        transition: 'all 0.2s ease'
                                    }}>
                                    <div style={{
                                        width: '18px', height: '18px', borderRadius: '50%',
                                        border: paymentMethod === 'RAZORPAY' ? '5px solid #6f4e37' : '2px solid #ccc',
                                        flexShrink: 0
                                    }} />
                                    <FaCreditCard size={16} color={paymentMethod === 'RAZORPAY' ? '#6f4e37' : '#999'} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: paymentMethod === 'RAZORPAY' ? '#6f4e37' : '#1c1c1c' }}>Pay Online</div>
                                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>UPI, Card, Net Banking via Razorpay</div>
                                    </div>
                                </div>
                            </div>

                            {paymentMethod === 'RAZORPAY' && (
                                <div style={{
                                    marginTop: '10px', padding: '10px 12px', borderRadius: '8px',
                                    background: '#fef3c7', fontSize: '0.75rem', color: '#92400e',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    <FaShieldAlt size={12} />
                                    Demo mode -- Razorpay test payment (no real charge)
                                </div>
                            )}
                        </div>

                        <button
                            className="brew-btn brew-btn--primary"
                            style={{
                                width: '100%', height: '55px', marginTop: '20px',
                                background: paymentMethod === 'RAZORPAY' ? '#2563eb' : '#60b246',
                                color: '#fff', border: 'none', borderRadius: '12px',
                                fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            disabled={loading}
                            onClick={handlePlaceOrder}
                        >
                            {loading ? 'Processing...'
                                : paymentMethod === 'RAZORPAY'
                                    ? `Pay Online \u2022 \u20B9${grandTotal.toFixed(2)}`
                                    : `Confirm Order \u2022 \u20B9${grandTotal.toFixed(2)}`
                            }
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
