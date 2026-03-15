import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const saveAuth = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const data = await authService.register(formData);
      saveAuth(data);
      toast.success(`Welcome to PromptVault, ${data.user.fullName.split(' ')[0]}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      // Don't toast here — Login/Register pages show inline errors
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData) => {
    setLoading(true);
    try {
      const data = await authService.login(formData);
      saveAuth(data);
      toast.success(`Welcome back, ${data.user.fullName.split(' ')[0]}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      // Return error to the page — don't toast, page shows inline error instead
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out');
  }, []);

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
