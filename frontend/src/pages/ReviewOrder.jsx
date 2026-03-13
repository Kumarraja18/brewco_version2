import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosClient';
import toast from 'react-hot-toast';
import {
    FaChevronLeft, FaPlus, FaMinus, FaRegClock, FaUtensils,
    FaCreditCard, FaMoneyBillWave, FaShieldAlt, FaLock,
    FaMobileAlt, FaUniversity, FaWallet, FaPercent
} from 'react-icons/fa';
import '../styles/customer.css';

/**
 * ReviewOrder — Production-grade checkout page with Razorpay integration.
 *
 * Features:
 *  - Cart item quantity adjustment
 *  - Order summary with subtotal, GST, and grand total
 *  - Payment method selection (Cash / Online via Razorpay)
 *  - All Razorpay payment methods listed (UPI, Cards, Net Banking, Wallets, EMI)
 *  - Proper loading states with animated spinner
 *  - Error handling with toast notifications
 *  - Razorpay checkout modal with proper callbacks
 *  - Navigation to PaymentResult page post-checkout
 */
export default function ReviewOrder() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { cart: initialCart, cafe, orderType, bookingDetails } = location.state || {};

    const [cart, setCart] = useState(initialCart || []);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [specialInstructions, setInstructions] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    useEffect(() => {
        if (!cafe || !initialCart?.length) {
            navigate('/customer-dashboard');
        }
    }, []);

    // Redirect if cart becomes empty
    useEffect(() => {
        if (cart.length === 0 && initialCart?.length > 0) {
            toast('Cart is empty. Redirecting...', { icon: '🛒' });
            setTimeout(() => navigate(-1), 1000);
        }
    }, [cart]);

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

    // ─────────────────────────────────────────────────────────────────
    //  RAZORPAY CHECKOUT
    // ─────────────────────────────────────────────────────────────────

    const openRazorpayCheckout = useCallback((paymentData, orderId) => {
        if (!window.Razorpay) {
            toast.error('Razorpay SDK not loaded. Please refresh the page.');
            return;
        }

        const options = {
            key: paymentData.keyId,
            amount: paymentData.amount,
            currency: paymentData.currency,
            name: 'Brew & Co',
            description: `Order at ${paymentData.cafeName || cafe.name}${paymentData.testMode ? ' (Demo)' : ''}`,
            image: '/logo.png',
            order_id: paymentData.razorpayOrderId,

            // ── Payment Success Handler ──
            handler: async function (response) {
                setLoading(true);
                setLoadingMessage('Verifying payment...');
                try {
                    await api.post('/payments/verify', {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        payment_id: paymentData.paymentId
                    });

                    toast.success('Payment verified successfully!');
                    navigate(`/order-tracking/${orderId}`);
                } catch (err) {
                    toast.error('Payment verification failed. Order placed.');
                    navigate(`/order-tracking/${orderId}`);
                } finally {
                    setLoading(false);
                    setLoadingMessage('');
                }
            },

            // ── Pre-fill customer details ──
            prefill: {
                name: user ? `${user.firstName} ${user.lastName}` : '',
                email: user?.email || '',
                contact: user?.phone || ''
            },

            // ── Theme ──
            theme: {
                color: '#6f4e37',
                backdrop_color: 'rgba(0,0,0,0.6)'
            },

            // ── Notes (visible on Razorpay dashboard) ──
            notes: {
                order_ref: paymentData.orderRef,
                cafe: paymentData.cafeName || cafe.name,
                customer: user?.email || ''
            },

            // ── Checkout modal dismiss ──
            modal: {
                ondismiss: function () {
                    // Record the cancellation on the backend
                    api.post('/payments/failure', {
                        payment_id: paymentData.paymentId,
                        reason: 'User dismissed checkout modal'
                    }).catch(() => {});

                    toast('Payment cancelled. Order placed — pay at arrival.', { icon: 'ℹ️' });
                    navigate(`/order-tracking/${orderId}`);
                },
                confirm_close: true,
                escape: true,
                animation: true
            },

            // ── Retry on failure ──
            retry: {
                enabled: true,
                max_count: 3
            }
        };

        const rzp = new window.Razorpay(options);

        // Handle checkout-level errors
        rzp.on('payment.failed', function (response) {
            const errorDesc = response.error?.description || 'Payment failed';
            const errorCode = response.error?.code || 'UNKNOWN';

            api.post('/payments/failure', {
                payment_id: paymentData.paymentId,
                reason: `${errorCode}: ${errorDesc}`
            }).catch(() => {});

            toast.error(`Payment failed: ${errorDesc}. Order placed.`);
            navigate(`/order-tracking/${orderId}`);
        });

        rzp.open();
    }, [cafe, user, navigate]);

    // ─────────────────────────────────────────────────────────────────
    //  PLACE ORDER
    // ─────────────────────────────────────────────────────────────────

    const handlePlaceOrder = async () => {
        setLoading(true);
        setLoadingMessage(paymentMethod === 'RAZORPAY' ? 'Initiating payment...' : 'Placing order...');

        try {
            let tableId = bookingDetails?.tableId;
            let bookingId = null;

            // 1. Dine-in → Create booking first
            if (orderType === 'DINE_IN') {
                setLoadingMessage('Creating reservation...');
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
            setLoadingMessage('Placing your order...');
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

            // 3. Razorpay payment flow
            if (paymentMethod === 'RAZORPAY') {
                try {
                    setLoadingMessage('Creating payment order...');
                    const payRes = await api.post('/payments/create-order', {
                        orderId: savedOrder.id
                    });
                    setLoading(false);
                    setLoadingMessage('');
                    openRazorpayCheckout(payRes.data, savedOrder.id);
                    return;
                } catch (payErr) {
                    const errMsg = payErr.response?.data?.error || 'Payment initiation failed';
                    toast.error(errMsg);
                    navigate(`/order-tracking/${savedOrder.id}`);
                    return;
                }
            }

            // 4. Cash payment → go to tracking
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
            setLoadingMessage('');
        }
    };

    // ─────────────────────────────────────────────────────────────────
    //  RENDER
    // ─────────────────────────────────────────────────────────────────

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{
                background: '#fff',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                borderBottom: '1px solid #eee',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <FaChevronLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer', fontSize: '1.1rem' }} />
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Review & Pay</h1>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>{cafe.name}</div>
                </div>
            </div>

            <div className="customer-container" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 400px',
                gap: '30px',
                marginTop: '20px'
            }}>
                {/* LEFT COLUMN */}
                <div>
                    {/* Order Items Card */}
                    <div className="sw-form-card" style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <FaUtensils color="#6f4e37" />
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Order Items</h2>
                            <span style={{
                                marginLeft: 'auto',
                                background: '#f3f4f6',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#6b7280'
                            }}>{cart.length} item{cart.length > 1 ? 's' : ''}</span>
                        </div>

                        {cart.map(item => (
                            <div key={item.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '15px 0',
                                borderBottom: '1px solid #f1f1f6'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.name}</div>
                                    <div style={{ color: '#686b78', fontSize: '0.85rem' }}>₹{item.price} each</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div className="sw-add-btn" style={{
                                        position: 'relative', bottom: 0, left: 0, transform: 'none'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            padding: '0 8px'
                                        }}>
                                            <span onClick={() => updateQty(item.id, -1)} style={{ cursor: 'pointer' }}>
                                                <FaMinus size={10} />
                                            </span>
                                            <span>{item.qty}</span>
                                            <span onClick={() => updateQty(item.id, 1)} style={{ cursor: 'pointer' }}>
                                                <FaPlus size={10} />
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ minWidth: '60px', textAlign: 'right', fontWeight: 800 }}>
                                        ₹{item.price * item.qty}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Special Instructions */}
                        <div style={{ marginTop: '20px' }}>
                            <label style={{
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: '#686b78',
                                display: 'block',
                                marginBottom: '8px'
                            }}>Special Instructions</label>
                            <textarea
                                placeholder="Add any notes (e.g. less sugar, extra hot)..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid #d4d5d9',
                                    resize: 'none',
                                    height: '80px',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                value={specialInstructions}
                                onChange={e => setInstructions(e.target.value)}
                                onFocus={e => e.target.style.borderColor = '#6f4e37'}
                                onBlur={e => e.target.style.borderColor = '#d4d5d9'}
                            />
                        </div>
                    </div>

                    {/* Dining / Pickup Details Card */}
                    <div className="sw-form-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <FaRegClock color="#6f4e37" />
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                                {orderType === 'DINE_IN' ? 'Dining Details' : 'Pickup Details'}
                            </h2>
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
                                        <div style={{ fontWeight: 700 }}>
                                            {bookingDetails.date} at {bookingDetails.time} ({bookingDetails.slotDuration === 120 ? '2 hrs' : '1 hr'})
                                        </div>
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

                {/* RIGHT COLUMN — Bill & Payment */}
                <aside>
                    <div className="sw-cart-sidebar" style={{ width: '100%', position: 'sticky', top: '80px' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 800 }}>Bill Details</h3>

                        {/* Bill Breakdown */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                            <span style={{ color: '#686b78' }}>Item Total</span>
                            <span>₹{subTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                            <span style={{ color: '#686b78' }}>GST (5%)</span>
                            <span>₹{gst.toFixed(2)}</span>
                        </div>
                        <div style={{ margin: '15px 0', borderTop: '2px dashed #e5e7eb' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem' }}>
                            <span>To Pay</span>
                            <span style={{ color: '#15803d' }}>₹{grandTotal.toFixed(2)}</span>
                        </div>

                        {/* ─── Payment Method Selection ─── */}
                        <div style={{ marginTop: '28px' }}>
                            <div style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: '#686b78',
                                textTransform: 'uppercase',
                                marginBottom: '12px',
                                letterSpacing: '0.5px'
                            }}>
                                Payment Method
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* Cash on Arrival */}
                                <PaymentOptionCard
                                    selected={paymentMethod === 'CASH'}
                                    onClick={() => setPaymentMethod('CASH')}
                                    icon={<FaMoneyBillWave size={16} />}
                                    title="Cash on Arrival"
                                    subtitle="Pay when you arrive at the cafe"
                                />

                                {/* Pay Online (Razorpay) */}
                                <PaymentOptionCard
                                    selected={paymentMethod === 'RAZORPAY'}
                                    onClick={() => setPaymentMethod('RAZORPAY')}
                                    icon={<FaCreditCard size={16} />}
                                    title="Pay Online"
                                    subtitle="UPI, Cards, Net Banking, Wallets, EMI"
                                />
                            </div>


                        </div>

                        {/* ─── Place Order Button ─── */}
                        <button
                            style={{
                                width: '100%',
                                height: '56px',
                                marginTop: '24px',
                                background: loading
                                    ? '#d1d5db'
                                    : paymentMethod === 'RAZORPAY'
                                        ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                                        : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: 800,
                                fontSize: '1rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: loading ? 'none'
                                    : paymentMethod === 'RAZORPAY'
                                        ? '0 4px 16px rgba(37,99,235,0.3)'
                                        : '0 4px 16px rgba(34,197,94,0.3)',
                                transform: 'translateY(0)',
                                letterSpacing: '0.3px'
                            }}
                            disabled={loading}
                            onClick={handlePlaceOrder}
                            onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
                        >
                            {loading ? (
                                <>
                                    <span className="brew-spinner" style={{
                                        width: '18px',
                                        height: '18px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: '#fff'
                                    }} />
                                    {loadingMessage || 'Processing...'}
                                </>
                            ) : paymentMethod === 'RAZORPAY' ? (
                                <>
                                    <FaLock size={13} />
                                    Pay Online • ₹{grandTotal.toFixed(2)}
                                </>
                            ) : (
                                <>Confirm Order • ₹{grandTotal.toFixed(2)}</>
                            )}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────

function PaymentOptionCard({ selected, onClick, icon, title, subtitle }) {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: selected ? '#f5ede6' : '#f9fafb',
                border: selected ? '2px solid #6f4e37' : '2px solid #e5e7eb',
                transition: 'all 0.2s ease',
                userSelect: 'none'
            }}
        >
            <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: selected ? '5px solid #6f4e37' : '2px solid #ccc',
                flexShrink: 0,
                transition: 'all 0.2s ease'
            }} />
            <div style={{ color: selected ? '#6f4e37' : '#999', transition: 'color 0.2s' }}>
                {icon}
            </div>
            <div>
                <div style={{
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: selected ? '#6f4e37' : '#1c1c1c'
                }}>{title}</div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{subtitle}</div>
            </div>
        </div>
    );
}

