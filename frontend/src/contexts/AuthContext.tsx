import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserData } from '@/types';
import { setAuthToken, clearAuthToken, authAPI } from '@/lib/api';

interface AuthContextType {
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(() => {
    // Check for existing user data in localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setAuthToken(storedToken);
      return JSON.parse(storedUser);
    }
    return null;
  });

  // on mount, if a token exists but no user object is present, try to fetch /auth/me
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && !storedUser) {
        try {
          setAuthToken(token);
          const res = await authAPI.me();
          if (res?.user) {
            const u: UserData = {
              fullName: res.user.fullName,
              email: res.user.email,
              role: res.user.role,
              token,
            };
            setUser(u);
            localStorage.setItem('user', JSON.stringify(u));
          }
        } catch (err) {
          // failed to fetch user, clear token
          clearAuthToken();
        }
      }
    };
    init();
  }, []);

  // login accepts the backend user object (which may include token)
  const login = (userData: UserData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) {
      setAuthToken(userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    clearAuthToken();
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
