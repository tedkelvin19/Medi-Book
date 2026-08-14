import api from './axios';


export const doctorsAPI = {
  list:   ()         => api.get('/doctors/'),
  detail: (id)       => api.get(`/doctors/${id}/`),
  create: (data)     => api.post('/doctors/create/', data),
  update: (id, data) => api.patch(`/doctors/${id}/`, data),
};

export const appointmentsAPI = {
  list:   ()         => api.get('/appointments/'),
  create: (data)     => api.post('/appointments/', data),
  update: (id, data) => api.patch(`/appointments/${id}/`, data),
  delete: (id)       => api.delete(`/appointments/${id}/`),
  rate:   (id, data) => api.post(`/appointments/${id}/rate/`, data),
};

// ✅ Admin only API calls
export const adminAPI = {
  stats:        ()         => api.get('/auth/admin/stats/'),
  users:        ()         => api.get('/auth/admin/users/'),
  deleteUser:   (id)       => api.delete(`/auth/admin/users/${id}/`),
  updateUser:   (id, data) => api.patch(`/auth/admin/users/${id}/`, data),
  auditLogs:    ()         => api.get('/audit/'),
  userAppointments: (id)       => api.get(`/auth/admin/users/${id}/appointments/`),
};

export const availabilityAPI = {
  list:   ()         => api.get('/availability/'),
  create: (data)     => api.post('/availability/', data),
  update: (id, data) => api.patch(`/availability/${id}/`, data),
  delete: (id)       => api.delete(`/availability/${id}/`),
};