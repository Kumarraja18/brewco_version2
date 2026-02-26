import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function ProfileCompletion() {
  const [formData, setFormData] = useState({
    phone: '',
    street: '',
    plotNo: '',
    city: '',
    pincode: '',
    academicInfo: [{ school: '', year: '', qualification: '' }],
    workExperience: [{ company: '', position: '', years: '' }]
  })
  const [profileComplete, setProfileComplete] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAcademicChange = (index, field, value) => {
    const newAcademic = [...formData.academicInfo]
    newAcademic[index][field] = value
    setFormData(prev => ({
      ...prev,
      academicInfo: newAcademic
    }))
  }

  const addAcademic = () => {
    setFormData(prev => ({
      ...prev,
      academicInfo: [...prev.academicInfo, { school: '', year: '', qualification: '' }]
    }))
  }

  const removeAcademic = (index) => {
    setFormData(prev => ({
      ...prev,
      academicInfo: prev.academicInfo.filter((_, i) => i !== index)
    }))
  }

  const handleWorkChange = (index, field, value) => {
    const newWork = [...formData.workExperience]
    newWork[index][field] = value
    setFormData(prev => ({
      ...prev,
      workExperience: newWork
    }))
  }

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { company: '', position: '', years: '' }]
    }))
  }

  const removeWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // All fields optional - just save what's filled
    setProfileComplete(true)
    setTimeout(() => {
      navigate('/customer-dashboard')
    }, 1500)
  }

  const handleSkip = () => {
    navigate('/customer-dashboard')
  }

  return (
    <div className="page profile-completion">
      <form className="card large" onSubmit={handleSubmit}>
        <h2>Additional Details</h2>
        <p className="subtitle">Complete your profile with education and work experience</p>

        {profileComplete && <div className="success-message">✓ Profile updated successfully!</div>}

        {/* Contact Information */}
        <section>
          <h3>Contact Information</h3>

          <label className="field">
            Phone Number
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit phone number"
            />
          </label>
        </section>

        {/* Address */}
        <section>
          <h3>Full Address</h3>

          <label className="field">
            Street Address
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Street address"
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label className="field">
              Plot Number
              <input
                type="text"
                name="plotNo"
                value={formData.plotNo}
                onChange={handleChange}
                placeholder="Plot/Apt number"
              />
            </label>

            <label className="field">
              City
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
            </label>
          </div>

          <label className="field">
            Pincode
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="6-digit pincode"
            />
          </label>
        </section>

        {/* Academic Information */}
        <section>
          <h3>Academic Information</h3>

          {formData.academicInfo.map((academic, index) => (
            <div key={index} className="form-group">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label className="field">
                  School/College/University
                  <input
                    type="text"
                    value={academic.school}
                    onChange={(e) => handleAcademicChange(index, 'school', e.target.value)}
                    placeholder="Institution name"
                  />
                </label>

                <label className="field">
                  Qualification
                  <input
                    type="text"
                    value={academic.qualification}
                    onChange={(e) => handleAcademicChange(index, 'qualification', e.target.value)}
                    placeholder="e.g., B.S., M.A., Diploma"
                  />
                </label>
              </div>

              <label className="field">
                Graduation Year
                <input
                  type="number"
                  value={academic.year}
                  onChange={(e) => handleAcademicChange(index, 'year', e.target.value)}
                  placeholder="YYYY"
                  min="1950"
                  max="2030"
                />
              </label>

              {formData.academicInfo.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeAcademic(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn small"
            onClick={addAcademic}
            style={{ marginTop: '1rem' }}
          >
            + Add Education
          </button>
        </section>

        {/* Work Experience */}
        <section>
          <h3>Work Experience (Optional)</h3>

          {formData.workExperience.map((work, index) => (
            <div key={index} className="form-group">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label className="field">
                  Company Name
                  <input
                    type="text"
                    value={work.company}
                    onChange={(e) => handleWorkChange(index, 'company', e.target.value)}
                    placeholder="Company or organization"
                  />
                </label>

                <label className="field">
                  Job Position
                  <input
                    type="text"
                    value={work.position}
                    onChange={(e) => handleWorkChange(index, 'position', e.target.value)}
                    placeholder="Job title"
                  />
                </label>
              </div>

              <label className="field">
                Years of Experience
                <input
                  type="number"
                  value={work.years}
                  onChange={(e) => handleWorkChange(index, 'years', e.target.value)}
                  placeholder="Number of years"
                  min="0"
                  max="70"
                />
              </label>

              {formData.workExperience.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeWorkExperience(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn small"
            onClick={addWorkExperience}
            style={{ marginTop: '1rem' }}
          >
            + Add Work Experience
          </button>
        </section>

        <div className="actions" style={{ marginTop: '2rem' }}>
          <button className="btn primary" type="submit">Save Profile</button>
          <button className="btn" type="button" onClick={handleSkip}>Skip for Now</button>
        </div>
      </form>
    </div>
  )
}

