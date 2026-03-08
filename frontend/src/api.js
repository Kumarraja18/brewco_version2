import api from './api/axiosClient';

// ========== Auth API ==========

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

// ========== Admin API ==========

export const getAdminDashboardStats = async () => {
  const response = await api.get('/admin/dashboard-stats')
  return response.data
}

export const getAllUsers = async () => {
  const response = await api.get('/admin/users')
  return response.data
}

export const getPendingUsers = async () => {
  const response = await api.get('/admin/pending-users')
  return response.data
}

export const getUserFullDetails = async (userId) => {
  const response = await api.get(`/admin/user/${userId}`)
  return response.data
}

export const approveUser = async (userId) => {
  const response = await api.put(`/admin/approve/${userId}`)
  return response.data
}

export const rejectUser = async (userId) => {
  const response = await api.delete(`/admin/reject/${userId}`)
  return response.data
}

export const deactivateUser = async (userId) => {
  const response = await api.put(`/admin/deactivate/${userId}`)
  return response.data
}

export const activateUser = async (userId) => {
  const response = await api.put(`/admin/activate/${userId}`)
  return response.data
}

export const getPendingCafes = async () => {
  const response = await api.get('/admin/cafes/pending')
  return response.data
}

export const getAllCafes = async () => {
  const response = await api.get('/admin/cafes/all')
  return response.data
}

export const verifyCafe = async (cafeId) => {
  const response = await api.put(`/admin/cafes/${cafeId}/verify`)
  return response.data
}

export const rejectCafeApp = async (cafeId) => {
  const response = await api.put(`/admin/cafes/${cafeId}/reject`)
  return response.data
}

export const deleteCafe = async (cafeId) => {
  const response = await api.delete(`/admin/cafes/${cafeId}`)
  return response.data
}

// ========== Registration Steps API ==========

export const savePersonalDetails = async (details) => {
  const response = await api.post('/register/step1/personal-details', details)
  return response.data
}

export const saveAddress = async (userId, address) => {
  const response = await api.post(`/register/step2/address/${userId}`, address)
  return response.data
}

export const saveWorkExperience = async (userId, workExp) => {
  const response = await api.post(`/register/step3/work-experience/${userId}`, workExp)
  return response.data
}

export const saveGovernmentProof = async (userId, govProof) => {
  const response = await api.post(`/register/step4/govt-proof/${userId}`, govProof)
  return response.data
}
