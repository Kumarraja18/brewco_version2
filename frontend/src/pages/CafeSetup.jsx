import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axiosClient'
import toast from 'react-hot-toast'
import '../styles/dashboard.css'

export default function CafeSetup() {
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: '', description: '', address: '', city: '', state: '', zipCode: '',
        contactNumber: '', email: user?.email || '',
        openingTime: '08:00', closingTime: '22:00',
        gstNumber: '', fssaiLicense: '', foodLicenseNumber: ''
    })

    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.address || !formData.city) {
            toast.error('Please fill in required fields')
            return
        }
        setLoading(true)
        try {
            await api.post('/cafe-owner/cafes', formData)
            // Mark profile as complete
            await api.put('/auth/profile', { isProfileComplete: true })
            toast.success('Café registered successfully! Pending admin verification.')
            navigate('/cafe-owner-dashboard')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create café')
        }
        setLoading(false)
    }

    const steps = [
        { num: 1, label: 'Basic Info' },
        { num: 2, label: 'Location' },
        { num: 3, label: 'Licenses' }
    ]

    return (
        <div className="dashboard-page">
            <div className="setup-wizard">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="dashboard-page__title">Set Up Your Café</h1>
                    <p className="dashboard-page__subtitle">Complete these steps to start managing your café on Brew & Co</p>
                </div>

                {/* Steps */}
                <div className="setup-wizard__steps">
                    {steps.map((s, i) => (
                        <React.Fragment key={s.num}>
                            <div className={`setup-wizard__step ${step === s.num ? 'setup-wizard__step--active' : ''} ${step > s.num ? 'setup-wizard__step--done' : ''}`}>
                                <div className="setup-wizard__step-num">
                                    {step > s.num ? '✓' : s.num}
                                </div>
                                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: step >= s.num ? 'var(--brew-dark)' : 'var(--brew-muted)' }}>
                                    {s.label}
                                </span>
                            </div>
                            {i < steps.length - 1 && <div className="setup-wizard__step-line" />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <>
                            <h3 style={{ fontWeight: 700, color: 'var(--brew-dark)', marginBottom: '1.5rem' }}>Café Details</h3>
                            <div className="brew-field">
                                <label className="brew-label">Café Name *</label>
                                <input className="brew-input" name="name" value={formData.name} onChange={handleChange}
                                    placeholder="e.g., The Brew Haven" required />
                            </div>
                            <div className="brew-field">
                                <label className="brew-label">Description</label>
                                <textarea className="brew-input" name="description" value={formData.description} onChange={handleChange}
                                    placeholder="Tell customers about your café..." rows={3} style={{ resize: 'vertical' }} />
                            </div>
                            <div className="brew-field-row">
                                <div className="brew-field">
                                    <label className="brew-label">Contact Number</label>
                                    <input className="brew-input" name="contactNumber" value={formData.contactNumber} onChange={handleChange}
                                        placeholder="+91 98765 43210" />
                                </div>
                                <div className="brew-field">
                                    <label className="brew-label">Café Email</label>
                                    <input className="brew-input" name="email" value={formData.email} onChange={handleChange}
                                        placeholder="cafe@example.com" />
                                </div>
                            </div>
                            <div className="brew-field-row">
                                <div className="brew-field">
                                    <label className="brew-label">Opening Time</label>
                                    <input className="brew-input" type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} />
                                </div>
                                <div className="brew-field">
                                    <label className="brew-label">Closing Time</label>
                                    <input className="brew-input" type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 2: Location */}
                    {step === 2 && (
                        <>
                            <h3 style={{ fontWeight: 700, color: 'var(--brew-dark)', marginBottom: '1.5rem' }}>Location</h3>
                            <div className="brew-field">
                                <label className="brew-label">Full Address *</label>
                                <input className="brew-input" name="address" value={formData.address} onChange={handleChange}
                                    placeholder="Street address" required />
                            </div>
                            <div className="brew-field-row">
                                <div className="brew-field">
                                    <label className="brew-label">City *</label>
                                    <input className="brew-input" name="city" value={formData.city} onChange={handleChange}
                                        placeholder="City" required />
                                </div>
                                <div className="brew-field">
                                    <label className="brew-label">State</label>
                                    <input className="brew-input" name="state" value={formData.state} onChange={handleChange}
                                        placeholder="State" />
                                </div>
                            </div>
                            <div className="brew-field">
                                <label className="brew-label">ZIP Code</label>
                                <input className="brew-input" name="zipCode" value={formData.zipCode} onChange={handleChange}
                                    placeholder="PIN / ZIP code" />
                            </div>
                        </>
                    )}

                    {/* Step 3: Licenses */}
                    {step === 3 && (
                        <>
                            <h3 style={{ fontWeight: 700, color: 'var(--brew-dark)', marginBottom: '1.5rem' }}>Business Licenses</h3>
                            <div className="brew-field">
                                <label className="brew-label">GST Number</label>
                                <input className="brew-input" name="gstNumber" value={formData.gstNumber} onChange={handleChange}
                                    placeholder="22AAAAA0000A1Z5" />
                            </div>
                            <div className="brew-field">
                                <label className="brew-label">FSSAI License Number</label>
                                <input className="brew-input" name="fssaiLicense" value={formData.fssaiLicense} onChange={handleChange}
                                    placeholder="FSSAI license number" />
                            </div>
                            <div className="brew-field">
                                <label className="brew-label">Food License Number</label>
                                <input className="brew-input" name="foodLicenseNumber" value={formData.foodLicenseNumber} onChange={handleChange}
                                    placeholder="Food license number" />
                            </div>
                            <div className="glass-card" style={{ background: '#FEF3C7', border: '1px solid #F0C040', marginTop: '1rem', padding: '1rem' }}>
                                <p style={{ fontSize: '0.85rem', color: '#92400E', fontWeight: 600 }}>
                                    📋 Your café will be reviewed by our admin team. You'll receive an email once verified.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                        {step > 1 ? (
                            <button className="brew-btn brew-btn--secondary" onClick={() => setStep(step - 1)}>← Previous</button>
                        ) : <div />}
                        {step < 3 ? (
                            <button className="brew-btn brew-btn--primary" onClick={() => setStep(step + 1)}>Next →</button>
                        ) : (
                            <button className="brew-btn brew-btn--primary brew-btn--lg" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Café Application'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
