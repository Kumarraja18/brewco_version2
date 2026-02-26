import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { registerUser } from '../../api'
import "../../styles/register.css"
import { FaUser, FaCoffee } from "react-icons/fa"

export default function Register() {
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [role, setRole] = useState('')
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        maritalStatus: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        companyName: '',
        designation: '',
        startDate: '',
        endDate: '',
        ctc: '',
        currentlyWorking: false,
        reasonForLeaving: '',
        idType: '',
        idNumber: '',
        idDocument: null,
    })

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
        }))
    }

    const nextStep = () => step < 4 && setStep(step + 1)
    const prevStep = () => step > 0 && setStep(step - 1)
    const progressPercent = (step / 4) * 100

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);

        try {
            // Include the selected role in the submission
            const submissionData = { ...formData, role: role.toUpperCase() };
            
            // Note: If your backend expects a specific RegisterRequest object, 
            // you might need to map these fields to match the DTO exactly.
            // For now, using the registerUser utility from api.js
            const response = await registerUser(submissionData);
            
            toast.success(response.message || "Registration successful! Please check your email.");
            navigate('/login');
        } catch (error) {
            toast.error(error.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="register-page">
            <div className="register-card">
                <div className="register-header">
                    <div className="logo">
                        <img src="/logo.png" alt="logo" />
                        <span>Brew & Co</span>
                    </div>
                </div>

                {step > 0 && (
                    <div className="progress-wrapper">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <span className="step-count">Step {step}/4</span>
                    </div>
                )}

                <div className="form-content">
                    {step === 0 && (
                        <>
                            <h2>Select Your Role</h2>
                            <div className="role-selection">
                                <div
                                    className={`role-card ${role === 'customer' ? 'selected' : ''}`}
                                    onClick={() => setRole('customer')}
                                >
                                    <FaUser className="role-icon" />
                                    <h3>Customer</h3>
                                    <p>Order coffee and reserve tables easily.</p>
                                </div>
                                <div
                                    className={`role-card ${role === 'cafe_owner' ? 'selected' : ''}`}
                                    onClick={() => setRole('cafe_owner')}
                                >
                                    <FaCoffee className="role-icon" />
                                    <h3>Cafe Owner</h3>
                                    <p>Manage your cafe, menu, and orders efficiently.</p>
                                </div>
                            </div>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <h2>Personal Details</h2>
                            <div className="row">
                                <input name="firstName" value={formData.firstName} placeholder="First Name" onChange={handleChange} required />
                                <input name="lastName" value={formData.lastName} placeholder="Last Name" onChange={handleChange} required />
                            </div>
                            <input name="email" type="email" value={formData.email} placeholder="Email" onChange={handleChange} required />
                            <div className="row">
                                <input name="phone" value={formData.phone} placeholder="Phone" onChange={handleChange} required />
                                <input
                                    type="text"
                                    name="dob"
                                    value={formData.dob}
                                    placeholder="Date of Birth (dd-mm-yyyy)"
                                    onFocus={(e) => e.target.type = 'date'}
                                    onBlur={(e) => e.target.type = 'text'}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="row">
                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="">Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                                    <option value="">Marital Status</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                </select>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2>Address Details</h2>
                            <input name="street" value={formData.street} placeholder="Street Address" onChange={handleChange} />
                            <div className="row">
                                <input name="city" value={formData.city} placeholder="City" onChange={handleChange} />
                                <input name="state" value={formData.state} placeholder="State" onChange={handleChange} />
                            </div>
                            <input name="pincode" value={formData.pincode} placeholder="Pincode" onChange={handleChange} />
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <h2>Work Experience</h2>
                            <div className="row">
                                <input name="companyName" value={formData.companyName} placeholder="Company Name" onChange={handleChange} />
                                <input name="designation" value={formData.designation} placeholder="Designation" onChange={handleChange} />
                            </div>
                            <div className="row">
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                            </div>
                            <div className="row">
                                <input name="ctc" value={formData.ctc} placeholder="CTC" onChange={handleChange} />
                                <label className="checkbox">
                                    <input type="checkbox" name="currentlyWorking" checked={formData.currentlyWorking} onChange={handleChange} />
                                    Currently Working
                                </label>
                            </div>
                            <textarea name="reasonForLeaving" value={formData.reasonForLeaving} placeholder="Reason for Leaving" onChange={handleChange} />
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <h2>Government Proof</h2>
                            <select name="idType" value={formData.idType} onChange={handleChange}>
                                <option value="">Select ID Type</option>
                                <option value="aadhar">Aadhar</option>
                                <option value="pan">PAN</option>
                                <option value="voter">Voter ID</option>
                            </select>
                            <input name="idNumber" value={formData.idNumber} placeholder="ID Number" onChange={handleChange} />
                            <input type="file" name="idDocument" onChange={handleChange} />
                        </>
                    )}
                </div>

                <div className="form-actions">
                    <button onClick={prevStep} disabled={step === 0 || loading}>
                        Back
                    </button>
                    {step === 0 ? (
                        <button onClick={() => role && nextStep()} disabled={!role}>
                            Next
                        </button>
                    ) : step < 4 ? (
                        <button onClick={nextStep}>Next</button>
                    ) : (
                        <button className="primary" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}