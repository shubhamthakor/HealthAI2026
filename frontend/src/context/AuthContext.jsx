import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Checks the active user session against the backend
  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.data && response.data.data.role) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.warn('Initial session check: Unauthenticated or expired session.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run checking logic once on mount to handle persistent reloading
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Unified login handler
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.data && response.data.data.user) {
        setUser(response.data.data.user);
        return response.data;
      }
      throw new Error('User data missing in login response.');
    } catch (error) {
      // Propagate the specific backend error message if available
      const message = error.response?.data?.error?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  };

  // Patient registration handler
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      // Extract array details if validation list is returned
      if (error.response?.data?.error?.code === 'VALIDATION_ERROR' && error.response?.data?.error?.details) {
        const validationIssues = error.response.data.error.details.map(d => d.issue).join(', ');
        throw new Error(`Validation failed: ${validationIssues}`);
      }
      const message = error.response?.data?.error?.message || error.message || 'Registration failed';
      throw new Error(message);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error on server:', error.message);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
