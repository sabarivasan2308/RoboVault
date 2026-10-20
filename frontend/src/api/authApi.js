import apiClient from './client';

export const authApi = {
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data; // ApiResponse with accessToken & user
  },
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data?.data;
  }
};
