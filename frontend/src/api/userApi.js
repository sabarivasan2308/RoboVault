import client from './client';

export const userApi = {
  getUsers: (params) => client.get('/users', { params }),
  getUserById: (id) => client.get(`/users/${id}`),
  createUser: (data) => client.post('/users', data),
  updateUser: (id, data) => client.put(`/users/${id}`, data),
  toggleStatus: (id, active) => client.patch(`/users/${id}/status`, { active }),
};

export default userApi;
