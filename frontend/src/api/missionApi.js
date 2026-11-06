import apiClient from './client';

export const missionApi = {
  getMissions: async () => {
    const res = await apiClient.get('/missions');
    return res.data;
  },
  createMission: async (data) => {
    const res = await apiClient.post('/missions', data);
    return res.data;
  },
  startMission: async (id) => {
    const res = await apiClient.post(`/missions/${id}/start`);
    return res.data;
  },
  pauseMission: async (id) => {
    const res = await apiClient.post(`/missions/${id}/pause`);
    return res.data;
  },
  resumeMission: async (id) => {
    const res = await apiClient.post(`/missions/${id}/resume`);
    return res.data;
  },
  abortMission: async (id) => {
    const res = await apiClient.post(`/missions/${id}/abort`);
    return res.data;
  },
  completeMission: async (id) => {
    const res = await apiClient.post(`/missions/${id}/complete`);
    return res.data;
  },
  relaunchMission: async (id) => {
    const res = await apiClient.post(`/missions/${id}/relaunch`);
    return res.data;
  },
  injectObstacle: async (coord) => {
    const res = await apiClient.post('/missions/inject-obstacle', { coord });
    return res.data;
  },
  clearObstacles: async () => {
    const res = await apiClient.post('/missions/clear-obstacles');
    return res.data;
  }
};

export default missionApi;

