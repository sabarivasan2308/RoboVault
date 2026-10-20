import apiClient from './client';

export const assetApi = {
  getAssets: async (page = 0, size = 20, query = '', category = '', status = '') => {
    const params = { page, size };
    if (query) params.query = query;
    if (category) params.category = category;
    if (status) params.status = status;
    const res = await apiClient.get('/assets', { params });
    return res.data?.data;
  },
  getAll: async () => {
    const res = await apiClient.get('/assets/all');
    return res.data?.data || [];
  },
  getById: async (id) => {
    const res = await apiClient.get(`/assets/${id}`);
    return res.data?.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/assets', data);
    return res.data?.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/assets/${id}`, data);
    return res.data?.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/assets/${id}`);
    return res.data;
  },
  search: async (query, category, status) => {
    const params = {};
    if (query) params.query = query;
    if (category) params.category = category;
    if (status) params.status = status;
    const res = await apiClient.get('/assets/search', { params });
    return res.data?.data || [];
  }
};

