const API_BASE_URL = 'http://localhost:8080/api'

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    return data
  } catch (error) {
    throw error
  }
}

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    return data
  } catch (error) {
    throw error
  }
}

export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user')
    }

    return data
  } catch (error) {
    throw error
  }
}

export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile')
    }

    return data
  } catch (error) {
    throw error
  }
}

// ========== Admin API ==========

export const getAdminDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`)
  if (!response.ok) throw new Error('Failed to fetch stats')
  return response.json()
}

export const getAllUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/users`)
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}

export const getPendingUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/pending-users`)
  if (!response.ok) throw new Error('Failed to fetch pending users')
  return response.json()
}

export const getUserFullDetails = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/admin/user/${userId}`)
  if (!response.ok) throw new Error('Failed to fetch user details')
  return response.json()
}

export const approveUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/admin/approve/${userId}`, {
    method: 'PUT',
  })
  if (!response.ok) throw new Error('Failed to approve user')
  return response.json()
}

export const rejectUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/admin/reject/${userId}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to reject user')
  return response.json()
}

export const deactivateUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/admin/deactivate/${userId}`, {
    method: 'PUT',
  })
  if (!response.ok) throw new Error('Failed to deactivate user')
  return response.json()
}

export const activateUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/admin/activate/${userId}`, {
    method: 'PUT',
  })
  if (!response.ok) throw new Error('Failed to activate user')
  return response.json()
}

// Registration Steps API
export const savePersonalDetails = async (details) => {
  const response = await fetch(`${API_BASE_URL}/register/step1/personal-details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to save personal details')
  }
  return response.json()
}

export const saveAddress = async (userId, address) => {
  const response = await fetch(`${API_BASE_URL}/register/step2/address/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to save address')
  }
  return response.json()
}

export const saveWorkExperience = async (userId, workExp) => {
  const response = await fetch(`${API_BASE_URL}/register/step3/work-experience/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workExp),
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to save work experience')
  }
  return response.json()
}

export const saveGovernmentProof = async (userId, govProof) => {
  const response = await fetch(`${API_BASE_URL}/register/step4/govt-proof/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(govProof),
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Failed to save government proof')
  }
  return response.json()
}
