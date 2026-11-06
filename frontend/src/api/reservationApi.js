import apiClient from './client';

export const reservationApi = {
  getReservations: async () => {
    const res = await apiClient.get('/reservations');
    return res.data?.data || [];
  },
  createReservation: async (data) => {
    const res = await apiClient.post('/reservations', data);
    return res.data;
  },
  updateReservation: async (id, data) => {
    const res = await apiClient.put(`/reservations/${id}`, data);
    return res.data;
  },
  deleteReservation: async (id) => {
    const res = await apiClient.delete(`/reservations/${id}`);
    return res.data;
  }
};

export default reservationApi;

