import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import toast from 'react-hot-toast';
import '../../styles/login.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const emailParam = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailParam);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast.error('OTP must be exactly 6 digits');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            toast.success('Password successfully reset! You can now login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to reset password');
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
            await api.post('/auth/forgot-password', { email });
            toast.success('A new OTP has been sent to your email.');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to resend link');
        }
    };


    return (
        <div className="login-page">
            <div className="login-page__container" style={{ maxWidth: '500px' }}>
                <div className="login-page__form-wrapper" style={{ width: '100%' }}>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2 className="login-form__title">Reset Password</h2>

                        <p className="login-form__switch" style={{ marginBottom: '20px' }}>
                            Enter the OTP sent to your email along with your new password.
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

                        <label className="login-form__field">
                            New Password
                            <input
                                type="password"
                                className="login-form__input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                            />
                        </label>

                        <label className="login-form__field">
                            Confirm New Password
                            <input
                                type="password"
                                className="login-form__input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                            />
                        </label>

                        <div className="login-form__actions">
                            <button
                                type="submit"
                                className="login-form__btn login-form__btn--primary"
                                disabled={loading || otp.length !== 6 || !newPassword}
                            >
                                {loading ? 'Submitting...' : 'Reset Password'}
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

                        <p className="login-form__switch" style={{ marginTop: '10px' }}>
                            Remembered your password? <Link to="/login">Sign in</Link>
                        </p>

                    </form>
                </div>
            </div>
        </div>
    );
}
