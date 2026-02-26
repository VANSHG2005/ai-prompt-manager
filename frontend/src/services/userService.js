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
};
