import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import toast from 'react-hot-toast';
import '../../styles/login.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('Password reset instructions sent to your email.');
            navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to send reset link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-page__container" style={{ maxWidth: '500px' }}>
                <div className="login-page__form-wrapper" style={{ width: '100%' }}>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2 className="login-form__title">Forgot Password</h2>

                        <p className="login-form__switch" style={{ marginBottom: '20px' }}>
                            Enter your registered email address and we'll send you an OTP to reset your password.
                        </p>

                        <label className="login-form__field">
                            Email Address
                            <input
                                type="email"
                                className="login-form__input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </label>

                        <div className="login-form__actions">
                            <button
                                type="submit"
                                className="login-form__btn login-form__btn--primary"
                                disabled={loading || !email}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>

                        <p className="login-form__switch" style={{ marginTop: '20px' }}>
                            Remember your password? <Link to="/login">Sign in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
