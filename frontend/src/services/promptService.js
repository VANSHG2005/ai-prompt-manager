import api from './api';

export const promptService = {
  getAll: async (params = {}) => {
    const res = await api.get('/prompts', { params });
    return res.data;
  },

  getOne: async (id) => {
    const res = await api.get(`/prompts/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/prompts', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/prompts/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/prompts/${id}`);
    return res.data;
  },

  toggleFavorite: async (id) => {
    const res = await api.put(`/prompts/favorite/${id}`);
    return res.data;
  },

  duplicate: async (id) => {
    const res = await api.post(`/prompts/duplicate/${id}`);
    return res.data;
  },

  getStats: async () => {
    const res = await api.get('/prompts/stats');
    return res.data;
  },
};
