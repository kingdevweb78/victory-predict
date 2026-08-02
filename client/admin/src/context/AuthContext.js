import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('vp_token'));

  useEffect(() => {
    if (token) { api.defaults.headers.common['Authorization'] = `Bearer ${token}`; fetchUser(); }
    else setLoading(false);
  }, [token]);

  const fetchUser = async () => {
    try { const res = await api.get('/api/auth/me'); setUser(res.data.user); }
    catch { logout(); }
    finally { setLoading(false); }
  };

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('vp_token', res.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('vp_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null); setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);