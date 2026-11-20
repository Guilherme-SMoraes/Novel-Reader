import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { authApi, authStorage } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    authStorage.removeToken();
    setUser(null);
  }, []);

  const loginWithGoogle = async (idToken: string) => {
    const res = await authApi.googleLogin(idToken);
    authStorage.setToken(res.token);
    setUser({
      id: res.userId,
      email: res.email,
      name: res.name,
      avatarUrl: res.avatarUrl,
      role: res.role,
    });
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = authStorage.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authApi.getMe();
        setUser(profile);
      } catch (err) {
        console.warn('Sessão expirada ou inválida:', err);
        authStorage.removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
