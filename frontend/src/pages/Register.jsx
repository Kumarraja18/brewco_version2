import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "../styles/register.css"
import { FaUser, FaCoffee } from "react-icons/fa"
import { savePersonalDetails, saveAddress, saveWorkExperience, saveGovernmentProof } from '../api'

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [role, setRole] = useState('')
  const [userId, setUserId] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

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
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'file'
            ? files[0]
            : value
    }))
  }

  const nextStep = async () => {
    setSubmitError('')

    // On step 1 -> 2: save personal details
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.gender) {
        setSubmitError('Please fill in all required fields: First Name, Last Name, Email, Gender')
        return
      }
      try {
        setSubmitLoading(true)
        const res = await savePersonalDetails({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender.toUpperCase(),
        })
        setUserId(res.userId)
      } catch (err) {
        setSubmitError(err.message)
        setSubmitLoading(false)
        return
      } finally {
        setSubmitLoading(false)
      }
    }

    // On step 2 -> 3: save address
    if (step === 2 && userId) {
      if (formData.street && formData.city && formData.pincode) {
        try {
          setSubmitLoading(true)
          await saveAddress(userId, {
            street: formData.street,
            city: formData.city,
            postalCode: formData.pincode,
          })
        } catch (err) {
          setSubmitError(err.message)
          setSubmitLoading(false)
          return
        } finally {
          setSubmitLoading(false)
        }
      }
    }

    // On step 3 -> 4: save work experience
    if (step === 3 && userId) {
      if (formData.companyName && formData.designation) {
        try {
          setSubmitLoading(true)
          await saveWorkExperience(userId, {
            companyName: formData.companyName,
            position: formData.designation,
            years: parseInt(formData.ctc) || 0,
          })
        } catch (err) {
          setSubmitError(err.message)
          setSubmitLoading(false)
          return
        } finally {
          setSubmitLoading(false)
        }
      }
    }

    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    setSubmitError('')
    if (step > 0) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setSubmitError('')
    if (!userId) {
      setSubmitError('Registration session expired. Please start over.')
      return
    }

    try {
      setSubmitLoading(true)
      if (formData.idType && formData.idNumber) {
        await saveGovernmentProof(userId, {
          proofType: formData.idType,
          proofNumber: formData.idNumber,
        })
      }
      setSubmitSuccess(true)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="register-page">
        <div className="register-card">
          <div className="register-header">
            <div className="logo">
              <img src="/logo.png" alt="logo" />
              <span>Brew & Co</span>
            </div>
          </div>
          <div className="form-content" style={{ textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ color: '#6f4e37', marginBottom: '1rem' }}>✅ Registration Submitted!</h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a3a30' }}>
              Thank you for registering with <strong>Brew & Co</strong>!
            </p>
            <p style={{ fontSize: '.9rem', color: '#8b6f63', marginTop: '.5rem' }}>
              Your registration is pending admin approval. Once approved, you will receive your login
              credentials via email at <strong>{formData.email}</strong>.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'linear-gradient(135deg, #6f4e37, #a67c52)',
                  color: '#f5e9dc',
                  border: 'none',
                  padding: '.8rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const progressPercent = (step / 4) * 100

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
          {submitError && (
            <div style={{
              background: '#fce4ec',
              color: '#c0392b',
              padding: '.75rem 1rem',
              borderRadius: '8px',
              fontSize: '.85rem',
              fontWeight: 500,
              marginBottom: '1rem',
              borderLeft: '4px solid #c0392b',
            }}>
              {submitError}
            </div>
          )}

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
                <input name="firstName" placeholder="First Name *" value={formData.firstName} onChange={handleChange} />
                <input name="lastName" placeholder="Last Name *" value={formData.lastName} onChange={handleChange} />
              </div>

              <input name="email" placeholder="Email *" value={formData.email} onChange={handleChange} />

              <div className="row">
                <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
                <input
                  type="text"
                  name="dob"
                  placeholder="Date of Birth (dd-mm-yyyy)"
                  value={formData.dob}
                  onFocus={(e) => e.target.type = 'date'}
                  onBlur={(e) => e.target.type = 'text'}
                  onChange={handleChange}
                />
              </div>

              <div className="row">
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Gender *</option>
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

              <input name="street" placeholder="Street Address" value={formData.street} onChange={handleChange} />

              <div className="row">
                <input name="city" placeholder="City" value={formData.city} onChange={handleChange} />
                <input name="state" placeholder="State" value={formData.state} onChange={handleChange} />
              </div>

              <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} />
            </>
          )}

          {step === 3 && (
            <>
              <h2>Work Experience</h2>

              <div className="row">
                <input name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} />
                <input name="designation" placeholder="Designation" value={formData.designation} onChange={handleChange} />
              </div>

              <div className="row">
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
              </div>

              <div className="row">
                <input name="ctc" placeholder="Years of Experience" value={formData.ctc} onChange={handleChange} />

                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="currentlyWorking"
                    checked={formData.currentlyWorking}
                    onChange={handleChange}
                  />
                  Currently Working
                </label>
              </div>

              <textarea
                name="reasonForLeaving"
                placeholder="Reason for Leaving"
                value={formData.reasonForLeaving}
                onChange={handleChange}
              />
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

              <input name="idNumber" placeholder="ID Number" value={formData.idNumber} onChange={handleChange} />

              <input type="file" name="idDocument" onChange={handleChange} />
            </>
          )}

        </div>

        <div className="form-actions">
          <button onClick={prevStep} disabled={step === 0 || submitLoading}>
            Back
          </button>

          {step === 0 ? (
            <button onClick={() => role && nextStep()} disabled={!role}>
              Next
            </button>
          ) : step < 4 ? (
            <button onClick={nextStep} disabled={submitLoading}>
              {submitLoading ? 'Saving...' : 'Next'}
            </button>
          ) : (
            <button className="primary" onClick={handleSubmit} disabled={submitLoading}>
              {submitLoading ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
