import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axiosClient';
import toast from 'react-hot-toast';
import '../../styles/login.css';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const emailParam = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailParam);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('OTP must be exactly 6 digits');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/verify-email', { email, otp });
            toast.success('Email verified successfully! You can now login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error('Please enter an email address first');
            return;
        }

        try {
            await api.post('/auth/resend-otp', { email });
            toast.success('A new OTP has been sent to your email.');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to resend OTP');
        }
    };

    return (
        <div className="login-page">
            <div className="login-page__container" style={{ maxWidth: '500px' }}>
                <div className="login-page__form-wrapper" style={{ width: '100%' }}>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2 className="login-form__title">Verify Your Email</h2>
                        <p className="login-form__switch" style={{ marginBottom: '20px' }}>
                            We've sent a 6-digit OTP to your registered email address.
                        </p>

                        <label className="login-form__field">
                            Email Address
                            <input
                                type="email"
                                className="login-form__input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={!!emailParam}
                            />
                        </label>

                        <label className="login-form__field">
                            6-Digit OTP
                            <input
                                type="text"
                                maxLength="6"
                                className="login-form__input"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="------"
                                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px' }}
                                required
                            />
                        </label>

                        <div className="login-form__actions">
                            <button
                                type="submit"
                                className="login-form__btn login-form__btn--primary"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </button>
                        </div>

                        <p className="login-form__switch" style={{ marginTop: '20px' }}>
                            Didn't receive the code?{' '}
                            <button
                                type="button"
                                onClick={handleResend}
                                style={{ background: 'none', border: 'none', color: '#6F4E37', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Resend OTP
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
