import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login:    (data) => api.post('/auth/login/', data),
  logout:   (data) => api.post('/auth/logout/', data),
  refresh:  (data) => api.post('/auth/refresh/', data),
  me:       ()     => api.get('/auth/me/'),
};