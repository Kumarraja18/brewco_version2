import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosClient';
import { FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSignOutAlt, FaChevronRight, FaShieldAlt, FaEdit, FaTimes, FaCheck, FaClock, FaChevronLeft } from 'react-icons/fa';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';
import '../styles/customer.css';

export default function Profile() {
    const { user, setUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Edit profile state
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({
        firstName: '', lastName: '', mobileNumber: '', gender: ''
    });
    const [saving, setSaving] = useState(false);

    // Change password state
    const [showPassword, setShowPassword] = useState(false);
    const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwSaving, setPwSaving] = useState(false);

    // Recent orders
    const [orders, setOrders] = useState([]);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [ordersRes, bookingsRes] = await Promise.all([
                api.get('/customer/orders').catch(() => ({ data: [] })),
                api.get('/customer/bookings').catch(() => ({ data: [] }))
            ]);
            setOrders(ordersRes.data || []);
            setBookings(bookingsRes.data || []);
        } catch { /* ignore */ }
    };

    const startEdit = () => {
        setEditData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            mobileNumber: user?.mobileNumber || user?.phoneNumber || '',
            gender: user?.gender || ''
        });
        setEditing(true);
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            const res = await api.put('/auth/profile', editData);
            setUser(res.data);
            toast.success('Profile updated');
            setEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async () => {
        if (pwData.newPassword !== pwData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (pwData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setPwSaving(true);
        try {
            await api.put('/auth/change-password', {
                currentPassword: pwData.currentPassword,
                newPassword: pwData.newPassword
            });
            toast.success('Password changed successfully');
            setShowPassword(false);
            setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to change password');
        } finally {
            setPwSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            toast.success('Logged out');
        } catch {
            toast.error('Logout failed');
        }
    };

    const recentOrders = orders.slice(0, 5);
    const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status));

    // Styles
    const card = { background: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #f0ebe4' };
    const row = { display: 'flex', alignItems: 'center', gap: 15, padding: '16px 20px', cursor: 'pointer', borderBottom: '1px solid #f5f0eb' };
    const label = { fontSize: '0.72rem', fontWeight: 700, color: '#8b6f63', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 };
    const val = { fontSize: '0.92rem', fontWeight: 600, color: '#2e241f' };
    const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e2d5c8', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', color: '#2e241f' };

    return (
        <div style={{ background: '#f0ebe4', minHeight: '100vh', paddingBottom: 100, fontFamily: "'Inter', sans-serif" }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #2e241f 0%, #4a3427 55%, #6f4e37 100%)', padding: '30px 20px', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(166,124,82,0.12)', pointerEvents: 'none' }} />
                <div style={{
                    width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                    border: '2px solid rgba(255,255,255,0.3)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                    fontSize: '2rem', fontWeight: 800, backdropFilter: 'blur(8px)'
                }}>
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{user?.firstName} {user?.lastName}</h1>
                <p style={{ margin: '4px 0 0', color: 'rgba(245,233,220,0.7)', fontSize: '0.85rem' }}>{user?.email}</p>
                <p style={{ margin: '4px 0 0', color: 'rgba(245,233,220,0.5)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{user?.role}</p>
            </div>

            {/* Quick Stats */}
            <div style={{ maxWidth: 600, margin: '-20px auto 0', padding: '0 16px', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                    {[
                        { v: orders.length, l: 'Total Orders' },
                        { v: activeOrders.length, l: 'Active' },
                        { v: bookings.length, l: 'Bookings' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 10px', textAlign: 'center', boxShadow: '0 2px 10px rgba(42,30,24,0.07)', border: '1px solid #f0ebe4' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2e241f' }}>{s.v}</div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8b6f63', marginTop: 2 }}>{s.l}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>

                {/* Personal Info / Edit */}
                <div style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f5f0eb' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#2e241f' }}>Personal Information</h3>
                        {!editing ? (
                            <button onClick={startEdit} style={{ background: 'none', border: '1px solid #d4c0a8', borderRadius: 8, padding: '5px 12px', fontSize: '0.75rem', fontWeight: 600, color: '#6f4e37', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <FaEdit size={11} /> Edit
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => setEditing(false)} style={{ background: '#f5f0eb', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: '0.75rem', fontWeight: 600, color: '#8b6f63', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button onClick={saveProfile} disabled={saving} style={{ background: '#6f4e37', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: '0.75rem', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    {!editing ? (
                        <div style={{ padding: '4px 0' }}>
                            {[
                                { icon: <FaUserCircle size={16} color="#a67c52" />, l: 'Name', v: `${user?.firstName} ${user?.lastName}` },
                                { icon: <FaEnvelope size={14} color="#a67c52" />, l: 'Email', v: user?.email },
                                { icon: <FaPhone size={14} color="#a67c52" />, l: 'Phone', v: user?.mobileNumber || user?.phoneNumber || 'Not added' },
                                { icon: <FaMapMarkerAlt size={14} color="#a67c52" />, l: 'Gender', v: user?.gender || 'Not specified' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: i < 3 ? '1px solid #faf5ef' : 'none' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 10, background: '#faf5ef', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                                    <div>
                                        <div style={label}>{item.l}</div>
                                        <div style={{ ...val, color: item.v?.includes('Not') ? '#d4c0a8' : '#2e241f' }}>{item.v}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <div style={label}>First Name</div>
                                    <input style={inputStyle} value={editData.firstName} onChange={e => setEditData({ ...editData, firstName: e.target.value })} />
                                </div>
                                <div>
                                    <div style={label}>Last Name</div>
                                    <input style={inputStyle} value={editData.lastName} onChange={e => setEditData({ ...editData, lastName: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <div style={label}>Phone Number</div>
                                <input style={inputStyle} value={editData.mobileNumber} onChange={e => setEditData({ ...editData, mobileNumber: e.target.value })} placeholder="10-digit phone" />
                            </div>
                            <div>
                                <div style={label}>Gender</div>
                                <select style={inputStyle} value={editData.gender} onChange={e => setEditData({ ...editData, gender: e.target.value })}>
                                    <option value="">Select</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Security - Change Password */}
                <div style={card}>
                    <div onClick={() => setShowPassword(!showPassword)} style={{ ...row, borderBottom: showPassword ? '1px solid #f5f0eb' : 'none' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: '#faf5ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaShieldAlt size={14} color="#a67c52" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2e241f' }}>Change Password</div>
                            <div style={{ fontSize: '0.75rem', color: '#8b6f63' }}>Update your account password</div>
                        </div>
                        <FaChevronRight color="#d4c0a8" size={12} style={{ transform: showPassword ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>

                    {showPassword && (
                        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <div style={label}>Current Password</div>
                                <input type="password" style={inputStyle} value={pwData.currentPassword}
                                    onChange={e => setPwData({ ...pwData, currentPassword: e.target.value })} />
                            </div>
                            <div>
                                <div style={label}>New Password</div>
                                <input type="password" style={inputStyle} value={pwData.newPassword}
                                    onChange={e => setPwData({ ...pwData, newPassword: e.target.value })} />
                            </div>
                            <div>
                                <div style={label}>Confirm New Password</div>
                                <input type="password" style={inputStyle} value={pwData.confirmPassword}
                                    onChange={e => setPwData({ ...pwData, confirmPassword: e.target.value })} />
                            </div>
                            <button onClick={changePassword} disabled={pwSaving || !pwData.currentPassword || !pwData.newPassword}
                                style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                    background: 'linear-gradient(135deg, #6f4e37, #a67c52)', color: '#fff', fontWeight: 700, fontSize: '0.88rem', fontFamily: 'inherit' }}>
                                {pwSaving ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                <div style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f5f0eb' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#2e241f' }}>Recent Orders</h3>
                        <button onClick={() => navigate('/my-orders')} style={{ background: 'none', border: '1px solid #d4c0a8', borderRadius: 8, padding: '5px 12px', fontSize: '0.72rem', fontWeight: 600, color: '#6f4e37', cursor: 'pointer' }}>
                            View All
                        </button>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div style={{ padding: '30px 20px', textAlign: 'center', color: '#8b6f63', fontSize: '0.85rem' }}>
                            No orders yet. Browse cafes to get started!
                        </div>
                    ) : (
                        recentOrders.map((order, i) => (
                            <div key={order.id} onClick={() => navigate(`/order-tracking/${order.id}`)}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', cursor: 'pointer', borderBottom: i < recentOrders.length - 1 ? '1px solid #faf5ef' : 'none' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#2e241f' }}>{order.cafe?.name || 'Order'}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#8b6f63', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <FaClock size={10} /> {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                        <span style={{ margin: '0 4px' }}>-</span>
                                        {order.orderType === 'DINE_IN' ? 'Dine-In' : 'Takeaway'}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#2e241f' }}>Rs. {parseFloat(order.grandTotal || 0).toFixed(0)}</div>
                                    <div style={{
                                        fontSize: '0.68rem', fontWeight: 700, marginTop: 2,
                                        color: order.status === 'DELIVERED' ? '#16a34a' : order.status === 'CANCELLED' ? '#dc2626' : '#b45309'
                                    }}>{order.status}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Logout */}
                <div style={card}>
                    <div onClick={handleLogout} style={{ ...row, borderBottom: 'none', color: '#dc2626' }}>
                        <FaSignOutAlt size={16} />
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Log Out</div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
