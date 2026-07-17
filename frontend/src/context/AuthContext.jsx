// Provides authentication state (user, token) and login/register/logout actions app-wide.
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';
import { getSavedTheme, applyTheme } from '../utils/theme';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vyapaar_token');
    const savedUser = localStorage.getItem('vyapaar_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Fetch user settings to apply their preferred theme
      api.get('/settings')
        .then((res) => {
          if (res.data?.settings?.theme) {
            applyTheme(res.data.settings.theme);
          }
        })
        .catch(() => {
          const savedTheme = getSavedTheme();
          if (savedTheme) applyTheme(savedTheme);
        });
    } else {
      const savedTheme = getSavedTheme();
      if (savedTheme) applyTheme(savedTheme || 'light');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('vyapaar_token', data.token);
    localStorage.setItem('vyapaar_user', JSON.stringify(data.user));
    setUser(data.user);
    
    // Fetch settings and apply theme
    try {
      const res = await api.get('/settings');
      if (res.data?.settings?.theme) {
        applyTheme(res.data.settings.theme);
      }
    } catch (e) {
      const savedTheme = getSavedTheme();
      if (savedTheme) applyTheme(savedTheme);
    }
    
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('vyapaar_token', data.token);
    localStorage.setItem('vyapaar_user', JSON.stringify(data.user));
    setUser(data.user);
    applyTheme('light'); // Default to light on new registration
    return data;
  };

  const logout = () => {
    localStorage.removeItem('vyapaar_token');
    localStorage.removeItem('vyapaar_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
