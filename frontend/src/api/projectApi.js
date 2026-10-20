import apiClient from './client';

export const projectApi = {
  getProjects: async (page = 0, size = 20, status = '') => {
    const params = { page, size };
    if (status) params.status = status;
    const res = await apiClient.get('/projects', { params });
    return res.data?.data;
  },
  getAll: async () => {
    const res = await apiClient.get('/projects/all');
    return res.data?.data || [];
  },
  getById: async (id) => {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data?.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/projects', data);
    return res.data?.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/projects/${id}`, data);
    return res.data?.data;
  },
  allocateAsset: async (projectId, assetId, quantity = 1) => {
    const res = await apiClient.post(`/projects/${projectId}/allocations`, { assetId, quantity });
    return res.data?.data;
  },
  releaseAllocation: async (projectId, allocationId) => {
    const res = await apiClient.post(`/projects/${projectId}/allocations/${allocationId}/release`);
    return res.data?.data;
  }
};

