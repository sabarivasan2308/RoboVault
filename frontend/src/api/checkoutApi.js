import apiClient from './client';

export const checkoutApi = {
  getCheckouts: async (page = 0, size = 20, status = '', userEmail = '') => {
    const params = { page, size };
    if (status) params.status = status;
    if (userEmail) params.userEmail = userEmail;
    const res = await apiClient.get('/checkouts', { params });
    return res.data?.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/checkouts/${id}`);
    return res.data?.data;
  },
  request: async (data) => {
    const res = await apiClient.post('/checkouts', data);
    return res.data?.data;
  },
  approve: async (id, reason = '') => {
    const res = await apiClient.post(`/checkouts/${id}/approve`, { approved: true, rejectionReason: reason });
    return res.data?.data;
  },
  reject: async (id, rejectionReason) => {
    const res = await apiClient.post(`/checkouts/${id}/reject`, { approved: false, rejectionReason });
    return res.data?.data;
  },
  issue: async (id) => {
    const res = await apiClient.post(`/checkouts/${id}/issue`);
    return res.data?.data;
  },
  returnItem: async (id, returnCondition, remarks) => {
    const res = await apiClient.post(`/checkouts/${id}/return`, { returnCondition, remarks });
    return res.data?.data;
  },
  cancel: async (id) => {
    const res = await apiClient.post(`/checkouts/${id}/cancel`);
    return res.data?.data;
  }
};
