import apiClient from './client';

export const faultApi = {
  getFaults: async (page = 0, size = 20, status = '', severity = '') => {
    const params = { page, size };
    if (status) params.status = status;
    if (severity) params.severity = severity;
    const res = await apiClient.get('/faults', { params });
    return res.data?.data;
  },
  getAll: async () => {
    const res = await apiClient.get('/faults/all');
    return res.data?.data || [];
  },
  getById: async (id) => {
    const res = await apiClient.get(`/faults/${id}`);
    return res.data?.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/faults', data);
    return res.data?.data;
  },
  assignTechnician: async (id, technician) => {
    const res = await apiClient.post(`/faults/${id}/assign`, { technician });
    return res.data?.data;
  },
  resolve: async (id, diagnosis, resolution) => {
    const res = await apiClient.post(`/faults/${id}/resolve`, { diagnosis, resolution });
    return res.data?.data;
  },
  close: async (id) => {
    const res = await apiClient.post(`/faults/${id}/close`);
    return res.data?.data;
  },
  convertToMaintenance: async (id, technician = 'Lab Technician') => {
    const res = await apiClient.post(`/faults/${id}/convert-to-maintenance`, { technician });
    return res.data?.data;
  }
};

