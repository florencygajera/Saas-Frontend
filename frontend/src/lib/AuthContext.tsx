'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from './types';
import { authApi } from './api';
import { getToken, setToken as setAuthToken, removeToken, getHomeRoute, redirectToHome } from './auth';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  login: (token: string, userData?: User) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const userData = await authApi.me();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          removeToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (token: string, userData?: User) => {
    setAuthToken(token);
    try {
      const user = userData || await authApi.me();
      setUser(user);
      const homeRoute = getHomeRoute(user.role);
      window.location.href = homeRoute;
    } catch (error) {
      console.error('Failed to fetch user after login:', error);
      window.location.href = '/login';
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    if (getToken()) {
      try {
        const userData = await authApi.me();
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user:', error);
        logout();
      }
    }
  };

  const role = user?.role || null;

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Route guard hook
export const useRouteGuard = (pathname: string) => {
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.href = '/login';
      return;
    }

    // Check role-based access
    const rolePrefix = pathname.startsWith('/saas') 
      ? 'SUPER_ADMIN' 
      : pathname.startsWith('/app') 
        ? 'TENANT_ADMIN' 
        : pathname.startsWith('/book') 
          ? 'CUSTOMER' 
          : null;

    if (role && rolePrefix && role !== rolePrefix) {
      redirectToHome(role);
    }
  }, [user, role, loading, pathname]);

  return { user, role, loading };
};
