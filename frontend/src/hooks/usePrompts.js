import { useState, useCallback } from 'react';
import { promptService } from '../services/promptService';
import toast from 'react-hot-toast';

const usePrompts = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, favorites: 0, categoryCount: 0 });

  const fetchPrompts = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await promptService.getAll(params);
      setPrompts(data.prompts);
      setStats(data.stats);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPrompt = async (formData) => {
    setActionLoading(true);
    try {
      const data = await promptService.create(formData);
      setPrompts(prev => [data.prompt, ...prev]);
      setStats(prev => ({ ...prev, total: prev.total + 1 }));
      toast.success('Prompt created!', { icon: '✨' });
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prompt');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const updatePrompt = async (id, formData) => {
    setActionLoading(true);
    try {
      const data = await promptService.update(id, formData);
      setPrompts(prev => prev.map(p => p._id === id ? data.prompt : p));
      toast.success('Prompt updated!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update prompt');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const deletePrompt = async (id) => {
    setActionLoading(true);
    try {
      await promptService.delete(id);
      setPrompts(prev => prev.filter(p => p._id !== id));
      setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      toast.success('Prompt deleted');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete prompt');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const data = await promptService.toggleFavorite(id);
      setPrompts(prev => prev.map(p => p._id === id ? data.prompt : p));
      toast.success(data.message, { icon: data.prompt.isFavorite ? '❤️' : '🤍' });
    } catch (err) {
      toast.error('Failed to update favorite');
    }
  };

  const duplicatePrompt = async (id) => {
    try {
      const data = await promptService.duplicate(id);
      setPrompts(prev => [data.prompt, ...prev]);
      setStats(prev => ({ ...prev, total: prev.total + 1 }));
      toast.success('Prompt duplicated!', { icon: '📋' });
    } catch (err) {
      toast.error('Failed to duplicate prompt');
    }
  };

  return { prompts, loading, actionLoading, stats, fetchPrompts, createPrompt, updatePrompt, deletePrompt, toggleFavorite, duplicatePrompt };
};

export default usePrompts;
