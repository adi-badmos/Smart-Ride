import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  loginRequest,
  logoutRequest,
  registerRequest,
  fetchCurrentUser,
} from '../features/auth/authService.js';
import { registerDriverRequest } from '../features/driver/driverService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const { user: loggedInUser } = await loginRequest(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (payload) => {
    const { user: newUser } = await registerRequest(payload);
    setUser(newUser);
    return newUser;
  };

  const registerDriver = async (payload) => {
    const { user: newDriver } = await registerDriverRequest(payload);
    setUser(newDriver);
    return newDriver;
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerDriver, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};