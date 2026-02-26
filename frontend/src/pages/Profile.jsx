import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSignOutAlt, FaChevronRight, FaShieldAlt } from 'react-icons/fa';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';
import '../styles/customer.css';

export default function Profile() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            toast.success("Logged out successfully");
        } catch (err) {
            toast.error("Logout failed");
        }
    };

    return (
        <div className="customer-home" style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ background: '#fff', padding: '30px 20px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                <div style={{ 
                    width: '80px', height: '80px', borderRadius: '50%', background: '#6f4e37', color: '#fff', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px',
                    fontSize: '2.5rem', fontWeight: 800
                }}>
                    {user?.firstName?.charAt(0)}
                </div>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1c1c1c' }}>{user?.firstName} {user?.lastName}</h1>
                <p style={{ margin: '5px 0 0 0', color: '#686b78', fontSize: '0.9rem' }}>{user?.email}</p>
            </div>

            <div className="customer-container" style={{ maxWidth: '600px', marginTop: '20px' }}>
                {/* Account Settings */}
                <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                    <div className="profile-item" onClick={() => navigate('/profile-completion')} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', cursor: 'pointer', borderBottom: '1px solid #f1f1f6' }}>
                        <div style={{ color: '#6f4e37' }}><FaUserCircle size={20} /></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Edit Profile</div>
                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Update your personal information</div>
                        </div>
                        <FaChevronRight color="#d1d5db" size={12} />
                    </div>
                    
                    <div className="profile-item" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', cursor: 'pointer', borderBottom: '1px solid #f1f1f6' }}>
                        <div style={{ color: '#6f4e37' }}><FaShieldAlt size={20} /></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Security</div>
                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Change password and account privacy</div>
                        </div>
                        <FaChevronRight color="#d1d5db" size={12} />
                    </div>

                    <div className="profile-item" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', cursor: 'pointer', color: '#dc2626' }}>
                        <FaSignOutAlt size={20} />
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Log Out</div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="sw-form-card" style={{ background: '#fff' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1c1c1c', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Info</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <FaEnvelope color="#d4c0a8" />
                            <div style={{ fontSize: '0.9rem' }}>{user?.email}</div>
                        </div>
                        {user?.phoneNumber && (
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <FaPhone color="#d4c0a8" />
                                <div style={{ fontSize: '0.9rem' }}>{user.phoneNumber}</div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <FaMapMarkerAlt color="#d4c0a8" />
                            <div style={{ fontSize: '0.9rem' }}>{user?.city || 'No location added'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
