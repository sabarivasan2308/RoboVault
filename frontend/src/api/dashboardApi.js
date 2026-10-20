import apiClient from './client';

export const dashboardApi = {
  getSummary: async () => {
    const res = await apiClient.get('/dashboard/summary');
    return res.data?.data;
  }
};

export const userApi = {
  getUsers: async (page = 0, size = 20, role = '') => {
    const params = { page, size };
    if (role) params.role = role;
    const res = await apiClient.get('/users', { params });
    return res.data?.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data?.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/users', data);
    return res.data?.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/users/${id}`, data);
    return res.data?.data;
  },
  toggleStatus: async (id, active) => {
    const res = await apiClient.patch(`/users/${id}/status`, { active });
    return res.data?.data;
  }
};

export const activityApi = {
  getLogs: async (page = 0, size = 20, entityType = '') => {
    const params = { page, size };
    if (entityType) params.entityType = entityType;
    const res = await apiClient.get('/activity-logs', { params });
    return res.data?.data;
  }
};

