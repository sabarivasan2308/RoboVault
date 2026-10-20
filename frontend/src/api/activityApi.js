import client from './client';

export const activityApi = {
  getLogs: (params) => client.get('/activity-logs', { params }),
};

export default activityApi;
