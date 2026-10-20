import apiClient from './client';

export const maintenanceApi = {
  getRecords: async (page = 0, size = 20, status = '') => {
    const params = { page, size };
    if (status) params.status = status;
    const res = await apiClient.get('/maintenance', { params });
    return res.data?.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/maintenance/${id}`);
    return res.data?.data;
  },
  getByAssetId: async (assetId) => {
    const res = await apiClient.get(`/maintenance/asset/${assetId}`);
    return res.data?.data || [];
  },
  create: async (data) => {
    const res = await apiClient.post('/maintenance', data);
    return res.data?.data;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/maintenance/${id}`, data);
    return res.data?.data;
  },
  resolve: async (id, resolutionDetails, partsReplaced, repairCost) => {
    const res = await apiClient.post(`/maintenance/${id}/resolve`, {
      resolutionDetails,
      partsReplaced,
      repairCost
    });
    return res.data?.data;
  },
  close: async (id) => {
    const res = await apiClient.post(`/maintenance/${id}/close`);
    return res.data?.data;
  }
};

