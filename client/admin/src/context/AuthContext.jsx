import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) { authAPI.me().then(({ data }) => { if (data.success) setUser(data.user); }).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false)); }
    else setLoading(false);
  }, []);
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login(email, password);
    if (data.success) { localStorage.setItem('token', data.token); setUser(data.user); toast.success('Bienvenue! 🇭🇹'); return true; }
    return false;
  }, []);
  const logout = useCallback(() => { localStorage.removeItem('token'); setUser(null); toast.success('Au revoir! 👋'); }, []);
  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
