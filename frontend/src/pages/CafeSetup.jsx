import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axiosClient'
import toast from 'react-hot-toast'

/* ── Colour tokens ── */
const C = {
    brown: '#6f4e37',
    accent: '#a67c52',
    dark: '#2e241f',
    cream: '#f5e9dc',
    muted: '#8b6f63',
    bg: '#f0ebe4',
    white: '#ffffff',
    success: '#27ae60',
    danger: '#c0392b',
    border: '#e2d5c8',
}

const STEPS = ['Basic Info', 'Address', 'Business', 'Bank', 'Services', 'Review', 'Photos']

// ── Input component ──
function Field({ label, ...props }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            {label && (
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    {label}
                </label>
            )}
            <input
                style={{
                    padding: '12px 14px',
                    border: `1.5px solid ${C.border}`,
                    borderRadius: '10px',
                    fontSize: '0.92rem',
                    color: C.dark,
                    background: C.white,
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                    width: '100%',
                    boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = C.accent)}
                onBlur={e => (e.target.style.borderColor = C.border)}
                {...props}
            />
        </div>
    )
}

// ── Checkbox toggle card ──
function CheckCard({ label, name, checked, onChange }) {
    return (
        <label style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '10px',
            border: `1.5px solid ${checked ? C.accent : C.border}`,
            background: checked ? '#faf5ef' : C.white,
            cursor: 'pointer', fontWeight: 600, fontSize: '0.87rem',
            color: checked ? C.brown : C.dark, transition: 'all 0.2s',
        }}>
            <input type="checkbox" name={name} checked={checked} onChange={onChange}
                style={{ width: 16, height: 16, accentColor: C.brown }} />
            {label}
        </label>
    )
}

export default function CafeSetup() {
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        // Step 1
        name: '', ownerName: user ? `${user.firstName} ${user.lastName}` : '',
        contactNumber: '', email: user?.email || '',
        openingTime: '08:00', closingTime: '22:00',
        // Step 2
        street: '', city: '', state: '', pincode: '',
        // Step 3
        businessType: '', fssaiNumber: '', gstNumber: '',
        // Step 4
        accountHolderName: '', accountNumber: '', ifscCode: '', upiId: '',
        // Step 5
        totalTables: '', seatingCapacity: '',
        parkingAvailable: false, freeWifi: false, airConditioned: false,
        homeDelivery: false, takeaway: false, dineIn: false,
        // Step 7
        logo: null, exterior: null, interior: null, menuPhoto: null, foodPhoto: null,
    })

    const handleChange = e => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleFileChange = e => {
        const { name, files } = e.target
        setFormData(prev => ({ ...prev, [name]: files[0] }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const payload = {
                name: formData.name,
                description: `A ${formData.businessType} café with seating for ${formData.seatingCapacity}.`,
                street: formData.street, city: formData.city,
                state: formData.state, pincode: formData.pincode,
                contactNumber: formData.contactNumber, email: formData.email,
                openingTime: formData.openingTime, closingTime: formData.closingTime,
                gstNumber: formData.gstNumber, fssaiNumber: formData.fssaiNumber,
            }
            await api.post('/cafe-owner/cafes', payload)
            await api.put('/auth/profile', { isProfileComplete: true })
            toast.success('Application submitted successfully!')
            navigate('/cafe-owner-dashboard')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Submission failed')
        }
        setLoading(false)
    }

    /* ── Section label in review ── */
    const ReviewRow = ({ label, value }) => (
        <div style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ width: '160px', flexShrink: 0, fontWeight: 700, fontSize: '0.82rem', color: C.muted }}>{label}</span>
            <span style={{ fontSize: '0.9rem', color: C.dark }}>{value || '—'}</span>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', sans-serif", padding: '0 0 60px' }}>

            {/* ── Top bar ── */}
            <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(42,30,24,.06)' }}>
                <span style={{ fontSize: '1.5rem' }}>☕</span>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: C.dark }}>Set Up Your Café</h1>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: C.muted, fontWeight: 500 }}>Complete all steps to register your café on Brew &amp; Co</p>
                </div>
            </div>

            <div style={{ maxWidth: '820px', margin: '32px auto', padding: '0 20px' }}>

                {/* ── Stepper ── */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {STEPS.map((label, i) => {
                        const n = i + 1
                        const done = step > n
                        const active = step === n
                        const lineClr = done ? C.accent : '#d4c0a8'
                        return (
                            <React.Fragment key={n}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, cursor: done ? 'pointer' : 'default' }}
                                    onClick={() => done && setStep(n)}>
                                    {/* Circle */}
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: done ? C.accent : active ? C.brown : C.white,
                                        border: `2px solid ${done || active ? 'transparent' : C.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: done ? '1rem' : '0.85rem',
                                        fontWeight: 800,
                                        color: done || active ? C.white : C.muted,
                                        boxShadow: active ? `0 4px 12px rgba(111,78,55,0.35)` : 'none',
                                        transition: 'all 0.3s',
                                    }}>
                                        {done ? '✓' : n}
                                    </div>
                                    {/* Label */}
                                    <span style={{
                                        marginTop: 6, fontSize: '0.68rem', fontWeight: active ? 700 : 500,
                                        color: active ? C.brown : done ? C.accent : C.muted,
                                        whiteSpace: 'nowrap', letterSpacing: '0.3px',
                                    }}>
                                        {label}
                                    </span>
                                </div>
                                {/* Connector line */}
                                {i < STEPS.length - 1 && (
                                    <div style={{ flex: 1, height: '2px', background: lineClr, margin: '0 4px', marginBottom: '18px', minWidth: '20px', transition: 'background 0.3s' }} />
                                )}
                            </React.Fragment>
                        )
                    })}
                </div>

                {/* ── Card ── */}
                <div style={{ background: C.white, borderRadius: '18px', boxShadow: '0 4px 24px rgba(42,30,24,.10)', border: `1px solid ${C.border}`, padding: '32px 36px' }}>

                    {/* ─── STEP 1: Basic Info ─── */}
                    {step === 1 && (
                        <>
                            <SectionHead icon="☕" title="Basic Information" sub="Enter your café's core details" />
                            <Field label="Café Name *" name="name" placeholder="e.g. The Brew House" value={formData.name} onChange={handleChange} />
                            <Field label="Owner Name" name="ownerName" placeholder="Your full name" value={formData.ownerName} onChange={handleChange} />
                            <Field label="Contact Number *" name="contactNumber" placeholder="+91 9xxxxxxxxx" value={formData.contactNumber} onChange={handleChange} />
                            <Field label="Email Address" name="email" placeholder="cafe@example.com" value={formData.email} onChange={handleChange} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <Field label="Opening Time" name="openingTime" type="time" value={formData.openingTime} onChange={handleChange} />
                                <Field label="Closing Time" name="closingTime" type="time" value={formData.closingTime} onChange={handleChange} />
                            </div>
                        </>
                    )}

                    {/* ─── STEP 2: Address ─── */}
                    {step === 2 && (
                        <>
                            <SectionHead icon="📍" title="Café Address" sub="Where is your café located?" />
                            <Field label="Street / Area *" name="street" placeholder="123, MG Road" value={formData.street} onChange={handleChange} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <Field label="City *" name="city" placeholder="Bengaluru" value={formData.city} onChange={handleChange} />
                                <Field label="State *" name="state" placeholder="Karnataka" value={formData.state} onChange={handleChange} />
                            </div>
                            <Field label="Pincode *" name="pincode" placeholder="560001" value={formData.pincode} onChange={handleChange} />
                        </>
                    )}

                    {/* ─── STEP 3: Business ─── */}
                    {step === 3 && (
                        <>
                            <SectionHead icon="🏢" title="Business Details" sub="Legal and compliance information" />
                            <Field label="Business Type" name="businessType" placeholder="e.g. Café, Bakery, Bistro" value={formData.businessType} onChange={handleChange} />
                            <Field label="FSSAI Number" name="fssaiNumber" placeholder="14-digit FSSAI licence" value={formData.fssaiNumber} onChange={handleChange} />
                            <Field label="GST Number" name="gstNumber" placeholder="22AAAAA0000A1Z5" value={formData.gstNumber} onChange={handleChange} />
                        </>
                    )}

                    {/* ─── STEP 4: Bank ─── */}
                    {step === 4 && (
                        <>
                            <SectionHead icon="🏦" title="Bank Details" sub="For payments and settlements" />
                            <Field label="Account Holder Name" name="accountHolderName" placeholder="Name as on bank" value={formData.accountHolderName} onChange={handleChange} />
                            <Field label="Account Number" name="accountNumber" placeholder="Account number" value={formData.accountNumber} onChange={handleChange} />
                            <Field label="IFSC Code" name="ifscCode" placeholder="e.g. SBIN0001234" value={formData.ifscCode} onChange={handleChange} />
                            <Field label="UPI ID (optional)" name="upiId" placeholder="cafe@ybl" value={formData.upiId} onChange={handleChange} />
                        </>
                    )}

                    {/* ─── STEP 5: Services ─── */}
                    {step === 5 && (
                        <>
                            <SectionHead icon="⚙️" title="Services & Facilities" sub="Tell customers what you offer" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <Field label="Total Tables" type="number" name="totalTables" placeholder="e.g. 20" value={formData.totalTables} onChange={handleChange} />
                                <Field label="Seating Capacity" type="number" name="seatingCapacity" placeholder="e.g. 80" value={formData.seatingCapacity} onChange={handleChange} />
                            </div>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px' }}>Available Services</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                {[
                                    { name: 'parkingAvailable', label: '🚗 Parking' },
                                    { name: 'freeWifi', label: '📶 Free WiFi' },
                                    { name: 'airConditioned', label: '❄️ AC' },
                                    { name: 'homeDelivery', label: '🛵 Home Delivery' },
                                    { name: 'takeaway', label: '🥡 Takeaway' },
                                    { name: 'dineIn', label: '🍽️ Dine In' },
                                ].map(s => (
                                    <CheckCard key={s.name} label={s.label} name={s.name} checked={formData[s.name]} onChange={handleChange} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* ─── STEP 6: Review ─── */}
                    {step === 6 && (
                        <>
                            <SectionHead icon="📋" title="Review Your Application" sub="Check everything before submitting" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div style={{ background: '#faf8f5', borderRadius: '12px', padding: '20px', border: `1px solid ${C.border}` }}>
                                    <p style={{ margin: '0 0 12px', fontWeight: 800, fontSize: '0.82rem', color: C.brown, textTransform: 'uppercase' }}>Basic Info</p>
                                    <ReviewRow label="Café Name" value={formData.name} />
                                    <ReviewRow label="Contact" value={formData.contactNumber} />
                                    <ReviewRow label="Email" value={formData.email} />
                                    <ReviewRow label="Hours" value={`${formData.openingTime} – ${formData.closingTime}`} />
                                </div>
                                <div style={{ background: '#faf8f5', borderRadius: '12px', padding: '20px', border: `1px solid ${C.border}` }}>
                                    <p style={{ margin: '0 0 12px', fontWeight: 800, fontSize: '0.82rem', color: C.brown, textTransform: 'uppercase' }}>Location</p>
                                    <ReviewRow label="Street" value={formData.street} />
                                    <ReviewRow label="City" value={`${formData.city}, ${formData.state}`} />
                                    <ReviewRow label="Pincode" value={formData.pincode} />
                                </div>
                                <div style={{ background: '#faf8f5', borderRadius: '12px', padding: '20px', border: `1px solid ${C.border}` }}>
                                    <p style={{ margin: '0 0 12px', fontWeight: 800, fontSize: '0.82rem', color: C.brown, textTransform: 'uppercase' }}>Business</p>
                                    <ReviewRow label="Type" value={formData.businessType} />
                                    <ReviewRow label="FSSAI" value={formData.fssaiNumber} />
                                    <ReviewRow label="GST" value={formData.gstNumber} />
                                </div>
                                <div style={{ background: '#faf8f5', borderRadius: '12px', padding: '20px', border: `1px solid ${C.border}` }}>
                                    <p style={{ margin: '0 0 12px', fontWeight: 800, fontSize: '0.82rem', color: C.brown, textTransform: 'uppercase' }}>Status</p>
                                    <ReviewRow label="Submitted" value={new Date().toLocaleDateString('en-IN')} />
                                    <ReviewRow label="Status" value="Pending Review" />
                                    <ReviewRow label="Verified" value="No — pending admin approval" />
                                </div>
                            </div>
                            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '14px 18px', fontSize: '0.85rem', color: '#92400e', fontWeight: 500 }}>
                                ⚠️ After submitting, your café will be reviewed by the Brew &amp; Co admin team. You will be notified once verified.
                            </div>
                        </>
                    )}

                    {/* ─── STEP 7: Photos ─── */}
                    {step === 7 && (
                        <>
                            <SectionHead icon="📸" title="Upload Photos" sub="Add photos to make your café listing attractive" />
                            {[
                                { name: 'logo', label: 'Logo / Brand Image' },
                                { name: 'exterior', label: 'Exterior Photo' },
                                { name: 'interior', label: 'Interior Photo' },
                                { name: 'menuPhoto', label: 'Menu Photo' },
                                { name: 'foodPhoto', label: 'Featured Food Photo' },
                            ].map(f => (
                                <div key={f.name} style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                                        {f.label}
                                    </label>
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '12px 16px', border: `1.5px dashed ${C.border}`,
                                        borderRadius: '10px', cursor: 'pointer', background: '#fafaf9',
                                        fontSize: '0.87rem', color: C.muted,
                                    }}>
                                        📁&nbsp;{formData[f.name] ? formData[f.name].name : 'Click to select a file'}
                                        <input type="file" name={f.name} accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            ))}
                        </>
                    )}

                    {/* ── Navigation Buttons ── */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${C.border}` }}>
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                style={{
                                    padding: '12px 28px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
                                    cursor: 'pointer', border: `1.5px solid ${C.border}`,
                                    background: C.white, color: C.brown, fontFamily: 'inherit',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.target.style.background = '#faf5ef'; e.target.style.borderColor = C.accent }}
                                onMouseLeave={e => { e.target.style.background = C.white; e.target.style.borderColor = C.border }}
                            >
                                ← Back
                            </button>
                        ) : <div />}

                        {step < 7 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                style={{
                                    padding: '12px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
                                    cursor: 'pointer', border: 'none',
                                    background: `linear-gradient(135deg, ${C.brown} 0%, ${C.accent} 100%)`,
                                    color: C.white, fontFamily: 'inherit',
                                    boxShadow: '0 4px 14px rgba(111,78,55,0.3)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                style={{
                                    padding: '12px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
                                    cursor: loading ? 'not-allowed' : 'pointer', border: 'none',
                                    background: loading ? '#d4c0a8' : `linear-gradient(135deg, ${C.success} 0%, #16a34a 100%)`,
                                    color: C.white, fontFamily: 'inherit',
                                    boxShadow: loading ? 'none' : '0 4px 14px rgba(39,174,96,0.3)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {loading ? '⏳ Submitting...' : '✅ Submit Application'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Step counter hint */}
                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.78rem', color: C.muted, fontWeight: 500 }}>
                    Step {step} of {STEPS.length} — {STEPS[step - 1]}
                </p>

            </div>
        </div>
    )
}

/* ── Section Header helper ── */
function SectionHead({ icon, title, sub }) {
    return (
        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1.5px solid #f0ebe4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#2e241f' }}>{title}</h2>
                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#8b6f63', fontWeight: 500 }}>{sub}</p>
                </div>
            </div>
        </div>
    )
}