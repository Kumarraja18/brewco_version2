import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import { FaChevronLeft, FaClock, FaCheckCircle, FaUtensils, FaShoppingBag } from 'react-icons/fa';
import BottomNav from '../components/BottomNav';
import '../styles/customer.css';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('DINE_IN');
    const navigate = useNavigate();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await api.get('/customer/orders');
            setOrders(res.data || []);
        } catch (err) {
            console.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const filtered = orders.filter(o => o.orderType === activeTab);

    if (loading) return <div className="brew-spinner-container"><div className="brew-spinner" /></div>;

    return (
        <div className="customer-home" style={{paddingBottom: '100px', background: '#f8f8f8', minHeight: '100vh'}}>
            <div style={{padding: '20px', background: '#fff', display: 'flex', alignItems: 'center', gap: '15px', position: 'sticky', top: 0, zIndex: 100}}>
                <FaChevronLeft onClick={() => navigate('/customer-dashboard')} style={{cursor: 'pointer'}} />
                <h2 style={{margin: 0, fontSize: '1.1rem', fontWeight: 800}}>My Orders</h2>
            </div>

            <div style={{padding: '20px'}}>
                <div className="sw-toggle-container">
                    <button className={`sw-toggle-btn ${activeTab === 'DINE_IN' ? 'active' : ''}`} onClick={() => setActiveTab('DINE_IN')}>Dine-In</button>
                    <button className={`sw-toggle-btn ${activeTab === 'TAKEAWAY' ? 'active' : ''}`} onClick={() => setActiveTab('TAKEAWAY')}>Takeaway</button>
                </div>

                <div style={{marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    {filtered.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '60px 0'}}>
                            <div style={{fontSize: '3rem', marginBottom: '20px', opacity: 0.2}}>☕</div>
                            <h3 style={{color: '#686b78'}}>No {activeTab.toLowerCase()} orders yet</h3>
                            <button className="brew-btn brew-btn--primary" style={{marginTop: '20px', border: 'none', background: '#ff5200', color: '#fff', padding: '10px 25px', borderRadius: '10px'}} onClick={() => navigate('/customer-dashboard')}>Browse Cafes</button>
                        </div>
                    ) : (
                        filtered.map(order => (
                            <div key={order.id} className="sw-form-card" style={{cursor: 'pointer'}} onClick={() => navigate(`/order-tracking/${order.id}`)}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                    <div>
                                        <div style={{fontWeight: 800, fontSize: '1rem', color: '#1c1c1c'}}>{order.cafe?.name || 'Cafe'}</div>
                                        <div style={{fontSize: '0.8rem', color: '#686b78', marginTop: '4px'}}>{order.cafe?.city || 'Your City'}</div>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <div style={{fontWeight: 800, fontSize: '1rem'}}>₹{order.grandTotal}</div>
                                        <div style={{fontSize: '0.75rem', fontWeight: 700, color: order.status === 'DELIVERED' ? '#10b981' : '#ff5200', marginTop: '4px'}}>{order.status}</div>
                                    </div>
                                </div>
                                
                                <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f1f1f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div style={{fontSize: '0.85rem', color: '#686b78', display: 'flex', alignItems: 'center', gap: '6px'}}>
                                        <FaClock size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                    <button style={{background: 'none', border: 'none', color: '#ff5200', fontWeight: 700, fontSize: '0.85rem'}}>Track Order →</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <BottomNav />
        </div>
    );
}