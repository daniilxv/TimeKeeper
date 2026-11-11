import { useState, useCallback } from 'react';

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = useCallback((accessToken) => {
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
  }, []);

  return { token, login, logout, isAuthenticated: !!token };
}
