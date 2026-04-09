import { useState, useCallback } from 'react';
import { promptService } from '../services/promptService';
import toast from 'react-hot-toast';

const usePrompts = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, favorites: 0, categoryCount: 0 });

  const fetchPrompts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await promptService.getAll(params);
      setPrompts(data.prompts || []);
      setStats(data.stats || { total: 0, favorites: 0, categoryCount: 0 });
    } catch (err) {
      const msg = err.isNetworkError
        ? err.message
        : err.response?.data?.message || 'Failed to load prompts';
      setError(msg);
      toast.error(msg);
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
      toast.success('Prompt created');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create prompt');
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
      toast.success('Prompt updated');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update prompt');
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
      toast.error(err.response?.data?.message || err.message || 'Failed to delete prompt');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const data = await promptService.toggleFavorite(id);
      setPrompts(prev => prev.map(p => p._id === id ? data.prompt : p));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update favourite');
    }
  };

  const duplicatePrompt = async (id) => {
    try {
      const data = await promptService.duplicate(id);
      setPrompts(prev => [data.prompt, ...prev]);
      setStats(prev => ({ ...prev, total: prev.total + 1 }));
      toast.success('Prompt duplicated');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to duplicate prompt');
    }
  };

  return {
    prompts, loading, actionLoading, error, stats,
    fetchPrompts, createPrompt, updatePrompt,
    deletePrompt, toggleFavorite, duplicatePrompt,
  };
};

export default usePrompts;
