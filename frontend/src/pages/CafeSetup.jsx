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

    const today = new Date().toLocaleDateString()

    const [formData, setFormData] = useState({
        // 1️⃣ Basic Info
        name: '',
        ownerName: user ? `${user.firstName} ${user.lastName}` : '',
        contactNumber: '',
        email: user?.email || '',
        openingTime: '08:00',
        closingTime: '22:00',

        // 2️⃣ Address
        street: '',
        city: '',
        state: '',
        pincode: '',

        // 3️⃣ Business
        businessType: '',
        fssaiNumber: '',
        gstNumber: '',

        // 4️⃣ Bank
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',

        // 5️⃣ Services
        totalTables: '',
        seatingCapacity: '',
        parkingAvailable: false,
        freeWifi: false,
        airConditioned: false,
        homeDelivery: false,
        takeaway: false,
        dineIn: false,

        // 7️⃣ Photos
        logo: null,
        exterior: null,
        interior: null,
        menuPhoto: null,
        foodPhoto: null
    })

    const handleChange = e => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleFileChange = e => {
        const { name, files } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: files[0]
        }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // Prepare the JSON payload to match the backend's expected fields
            const payload = {
                name: formData.name,
                description: `A ${formData.businessType} café with seating for ${formData.seatingCapacity}.`,
                street: formData.street,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                contactNumber: formData.contactNumber,
                email: formData.email,
                openingTime: formData.openingTime,
                closingTime: formData.closingTime,
                gstNumber: formData.gstNumber,
                fssaiNumber: formData.fssaiNumber
            };

            // Use JSON for basic data submission
            await api.post('/cafe-owner/cafes', payload);

            await api.put('/auth/profile', { isProfileComplete: true })

            toast.success('Application submitted successfully!')
            navigate('/cafe-owner-dashboard')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Submission failed')
        }
        setLoading(false)
    }

    const steps = [
        'Basic Info',
        'Address',
        'Business',
        'Bank',
        'Services',
        'Review',
        'Photos'
    ]

    return (
        <div className="dashboard-page">
            <div className="setup-wizard">

                <h1 className="dashboard-page__title">Set Up Your Café</h1>

                {/* Step Indicator */}
                <div className="setup-wizard__steps">
                    {steps.map((label, index) => (
                        <div
                            key={index}
                            className={`setup-wizard__step ${step === index + 1 ? 'setup-wizard__step--active' : ''
                                }`}
                        >
                            <div className="setup-wizard__step-num">
                                {step > index + 1 ? '✓' : index + 1}
                            </div>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>

                <div className="glass-card" style={{ padding: '2rem' }}>

                    {/* 1️⃣ BASIC INFO */}
                    {step === 1 && (
                        <>
                            <h3>Basic Information</h3>
                            <input className="brew-input" name="name" placeholder="Cafe Name" value={formData.name} onChange={handleChange} />
                            <input className="brew-input" name="ownerName" placeholder="Owner Name" value={formData.ownerName} onChange={handleChange} />
                            <input className="brew-input" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} />
                            <input className="brew-input" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input type="time" className="brew-input" name="openingTime" value={formData.openingTime} onChange={handleChange} />
                                <input type="time" className="brew-input" name="closingTime" value={formData.closingTime} onChange={handleChange} />
                            </div>
                        </>
                    )}

                    {/* 2️⃣ ADDRESS */}
                    {step === 2 && (
                        <>
                            <h3>Address</h3>
                            <input className="brew-input" name="street" placeholder="Street" value={formData.street} onChange={handleChange} />
                            <input className="brew-input" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
                            <input className="brew-input" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
                            <input className="brew-input" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} />
                        </>
                    )}

                    {/* 3️⃣ BUSINESS */}
                    {step === 3 && (
                        <>
                            <h3>Business Details</h3>
                            <input className="brew-input" name="businessType" placeholder="Business Type" value={formData.businessType} onChange={handleChange} />
                            <input className="brew-input" name="fssaiNumber" placeholder="FSSAI Number" value={formData.fssaiNumber} onChange={handleChange} />
                            <input className="brew-input" name="gstNumber" placeholder="GST Number" value={formData.gstNumber} onChange={handleChange} />
                        </>
                    )}

                    {/* 4️⃣ BANK */}
                    {step === 4 && (
                        <>
                            <h3>Bank Details</h3>
                            <input className="brew-input" name="accountHolderName" placeholder="Account Holder Name" value={formData.accountHolderName} onChange={handleChange} />
                            <input className="brew-input" name="accountNumber" placeholder="Account Number" value={formData.accountNumber} onChange={handleChange} />
                            <input className="brew-input" name="ifscCode" placeholder="IFSC Code" value={formData.ifscCode} onChange={handleChange} />
                            <input className="brew-input" name="upiId" placeholder="UPI ID" value={formData.upiId} onChange={handleChange} />
                        </>
                    )}

                    {/* 5️⃣ SERVICES */}
                    {step === 5 && (
                        <>
                            <h3 style={{
                                fontWeight: 700,
                                marginBottom: '1.5rem',
                                color: '#2C2C2C'
                            }}>
                                Services & Facilities
                            </h3>

                            {/* Capacity Section */}
                            <div style={{
                                background: '#f9fafb',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                marginBottom: '1.5rem',
                                border: '1px solid #e5e7eb'
                            }}>
                                <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>
                                    Capacity Details
                                </h4>

                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    flexWrap: 'wrap'
                                }}>
                                    <div style={{ flex: 1, minWidth: '220px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Tables</label>
                                        <input
                                            type="number"
                                            name="totalTables"
                                            value={formData.totalTables}
                                            onChange={handleChange}
                                            placeholder="Enter total tables"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                marginTop: '6px',
                                                borderRadius: '8px',
                                                border: '1px solid #d1d5db'
                                            }}
                                        />
                                    </div>

                                    <div style={{ flex: 1, minWidth: '220px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Seating Capacity</label>
                                        <input
                                            type="number"
                                            name="seatingCapacity"
                                            value={formData.seatingCapacity}
                                            onChange={handleChange}
                                            placeholder="Enter seating capacity"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                marginTop: '6px',
                                                borderRadius: '8px',
                                                border: '1px solid #d1d5db'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Facilities Section */}
                            <div style={{
                                background: '#f9fafb',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb'
                            }}>
                                <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>
                                    Available Services
                                </h4>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: '12px'
                                }}>
                                    {[
                                        { name: 'parkingAvailable', label: 'Parking Available' },
                                        { name: 'freeWifi', label: 'Free WiFi' },
                                        { name: 'airConditioned', label: 'Air Conditioned' },
                                        { name: 'homeDelivery', label: 'Home Delivery' },
                                        { name: 'takeaway', label: 'Takeaway' },
                                        { name: 'dineIn', label: 'Dine In' }
                                    ].map(service => (
                                        <label
                                            key={service.name}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 14px',
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb',
                                                background: '#ffffff',
                                                cursor: 'pointer',
                                                fontWeight: 500
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                name={service.name}
                                                checked={formData[service.name]}
                                                onChange={handleChange}
                                                style={{ width: '16px', height: '16px' }}
                                            />
                                            {service.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* 6️⃣ REVIEW */}
                    {step === 6 && (
                        <>
                            <h3>Review Application</h3>
                            <p><strong>Date:</strong> {today}</p>
                            <p><strong>Status:</strong> Pending</p>
                            <p><strong>Verification:</strong> Unverified</p>
                        </>
                    )}

                    {/* 7️⃣ PHOTOS */}
                    {step === 7 && (
                        <>
                            <h3>Upload Photos</h3>
                            <input type="file" name="logo" onChange={handleFileChange} />
                            <input type="file" name="exterior" onChange={handleFileChange} />
                            <input type="file" name="interior" onChange={handleFileChange} />
                            <input type="file" name="menuPhoto" onChange={handleFileChange} />
                            <input type="file" name="foodPhoto" onChange={handleFileChange} />
                        </>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                        {step > 1 ? (
                            <button className="brew-btn brew-btn--secondary" onClick={() => setStep(step - 1)}>← Back</button>
                        ) : <div />}
                        {step < 7 ? (
                            <button className="brew-btn brew-btn--primary" onClick={() => setStep(step + 1)}>Next →</button>
                        ) : (
                            <button className="brew-btn brew-btn--primary" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}