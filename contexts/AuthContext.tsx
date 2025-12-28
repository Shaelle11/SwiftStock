'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('swiftstock_token');
    localStorage.removeItem('swiftstock_user');
  }, []);

  const verifyToken = useCallback(async (authToken: string) => {
    try {
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : (process.env.NEXTAUTH_URL || 'http://localhost:3000');
        
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Token is invalid, clear auth state
        logout();
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch {
      console.error('Token verification failed');
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const initializeAuth = () => {
      // Check for stored auth data on mount
      const storedToken = localStorage.getItem('swiftstock_token');
      const storedUser = localStorage.getItem('swiftstock_user');

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        // Verify token is still valid
        verifyToken(storedToken);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [verifyToken]);

  // Helper function to get the base URL
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXTAUTH_URL || 'http://localhost:3000';
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const baseUrl = getBaseUrl();
      console.log('Attempting login with URL:', `${baseUrl}/api/auth/login`);
      
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login response error:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          return { success: false, message: errorData.message || 'Login failed' };
        } catch {
          return { success: false, message: `Login failed with status ${response.status}` };
        }
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('swiftstock_token', data.token);
        localStorage.setItem('swiftstock_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      const baseUrl = getBaseUrl();
      console.log('Attempting register with URL:', `${baseUrl}/api/auth/register`);
      console.log('Registration data:', JSON.stringify(data, null, 2));
      
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Register response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Register response error:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          return { success: false, message: errorData.message || 'Registration failed' };
        } catch {
          return { success: false, message: `Registration failed with status ${response.status}` };
        }
      }

      const result = await response.json();

      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        localStorage.setItem('swiftstock_token', result.token);
        localStorage.setItem('swiftstock_user', JSON.stringify(result.user));
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };



  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}