import api from './api';

export const userService = {
  getProfile: async () => {
    const res = await api.get('/user/profile');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/user/profile', data);
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/user/stats');
    return res.data;
  },
  deleteAccount: async (password) => {
    const res = await api.delete('/user/account', { data: { password } });
    return res.data;
  },
};
