import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { isTokenExpired, getTokenRemainingMs } from '../utils/token';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return null;
      }
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const timerRef = useRef(null);

  const clearAuth = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const handleAutoLogout = useCallback((reason = 'expired') => {
    clearAuth();

    if (reason === 'expired') {
      toast.dismiss('session-expired-toast');
      toast.error('Your session has expired. Please sign in again.', {
        id: 'session-expired-toast',
        duration: 4000,
      });

      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      if (currentPath !== '/login' || !currentSearch.includes('expired=true')) {
        navigate('/login?expired=true', { replace: true });
      }
    }
  }, [clearAuth, navigate]);

  const saveAuth = useCallback((data) => {
    if (data.token) localStorage.setItem('token', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    }
  }, []);

  // Validate session on application start
  const validateSession = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      clearAuth();
      setIsInitializing(false);
      return false;
    }

    if (isTokenExpired(token)) {
      handleAutoLogout('expired');
      setIsInitializing(false);
      return false;
    }

    try {
      const res = await authService.getMe();
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
        setUser(res.user);
        return true;
      }
    } catch (err) {
      clearAuth();
      if (err.response?.status === 401) {
        handleAutoLogout('expired');
      }
      return false;
    } finally {
      setIsInitializing(false);
    }
    return false;
  }, [clearAuth, handleAutoLogout]);

  // Run session validation on mount
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // Precise timer: schedule automatic logout the moment the JWT expires
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token || !user) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (isTokenExpired(token)) {
      handleAutoLogout('expired');
      return;
    }

    const remainingMs = getTokenRemainingMs(token);
    if (remainingMs <= 0) {
      handleAutoLogout('expired');
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Guard against 32-bit signed int overflow (max ~24.8 days)
    const MAX_TIMEOUT_MS = 2147483647;
    const timeoutDelay = Math.min(remainingMs, MAX_TIMEOUT_MS);

    timerRef.current = setTimeout(() => {
      if (remainingMs > MAX_TIMEOUT_MS) {
        const currentToken = localStorage.getItem('token');
        if (currentToken && isTokenExpired(currentToken)) {
          handleAutoLogout('expired');
        }
      } else {
        handleAutoLogout('expired');
      }
    }, timeoutDelay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [user, handleAutoLogout]);

  // Safety listeners: visibility, focus, cross-tab storage, and periodic check
  useEffect(() => {
    const checkExpiration = () => {
      const token = localStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        handleAutoLogout('expired');
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkExpiration();
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        handleAutoLogout('expired');
      }
    };

    const handleSessionExpiredEvent = () => {
      handleAutoLogout('expired');
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', checkExpiration);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:session-expired', handleSessionExpiredEvent);

    const interval = setInterval(checkExpiration, 2000);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', checkExpiration);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:session-expired', handleSessionExpiredEvent);
      clearInterval(interval);
    };
  }, [handleAutoLogout]);

  const register = async (formData) => {
    setLoading(true);
    try {
      const data = await authService.register(formData);
      saveAuth(data);
      toast.success(`Welcome to PromptVault, ${data.user.fullName.split(' ')[0]}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
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
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    clearAuth();
    toast.success('Logged out');
  }, [clearAuth]);

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isInitializing,
        register,
        login,
        logout,
        updateUser,
        validateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
