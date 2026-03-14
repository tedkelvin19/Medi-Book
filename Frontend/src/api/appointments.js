import api from './axios';

export const doctorsAPI = {
  list:   ()         => api.get('/doctors/'),
  detail: (id)       => api.get(`/doctors/${id}/`),
  create: (data)     => api.post('/doctors/create/', data),
};

export const appointmentsAPI = {
  list:   ()         => api.get('/appointments/'),
  create: (data)     => api.post('/appointments/', data),
  update: (id, data) => api.patch(`/appointments/${id}/`, data),
  delete: (id)       => api.delete(`/appointments/${id}/`),
};