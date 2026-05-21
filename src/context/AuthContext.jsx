import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAdmin = async () => {
    if (!localStorage.getItem('adminToken')) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/api/admin/me');
      setAdmin(data.admin);
    } catch {
      setAdmin(null);
      localStorage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (username, password) => {
    const { data } = await api.post('/api/admin/login', { username, password });
    localStorage.setItem('adminToken', data.token);
    setAdmin(data.admin);
    return data.admin;
  };

  const logout = async () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    setUser(null);
  };

  useEffect(() => {
    refreshAdmin();
  }, []);

  const value = useMemo(
    () => ({ user, admin, loading, refreshAdmin, adminLogin, logout, setUser }),
    [user, admin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
