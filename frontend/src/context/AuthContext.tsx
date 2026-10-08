import React, { createContext, useContext, useEffect, useState } from 'react';
import { Role, User } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { fullName: string; email: string; password: string; phone?: string }) => Promise<User>;
  logout: () => Promise<void>;
  switchDemoUser: (role: Role) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS: Record<
  Role,
  { email: string; pass: string; password: string; title: string; label: string; role: Role }
> = {
  SYSTEM_ADMIN: {
    email: 'admin@civicfix.ai',
    pass: 'Admin@12345',
    password: 'Admin@12345',
    title: 'System Admin',
    label: 'System Admin',
    role: 'SYSTEM_ADMIN',
  },
  DEPARTMENT_ADMIN: {
    email: 'roads.admin@civicfix.ai',
    pass: 'Admin@12345',
    password: 'Admin@12345',
    title: 'Roads Dept Admin',
    label: 'Roads Dept Admin',
    role: 'DEPARTMENT_ADMIN',
  },
  OFFICER: {
    email: 'officer.smith@civicfix.ai',
    pass: 'Officer@12345',
    password: 'Officer@12345',
    title: 'Roads Officer Smith',
    label: 'Officer Smith',
    role: 'OFFICER',
  },
  CITIZEN: {
    email: 'citizen.jane@civicfix.ai',
    pass: 'Citizen@12345',
    password: 'Citizen@12345',
    title: 'Citizen Jane Doe',
    label: 'Jane Citizen',
    role: 'CITIZEN',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('civicfix_access_token');
      if (token) {
        try {
          const profile = await authApi.getCurrentUser();
          setUser(profile);
        } catch (e) {
          localStorage.removeItem('civicfix_access_token');
          localStorage.removeItem('civicfix_refresh_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('civicfix_access_token', res.accessToken);
      localStorage.setItem('civicfix_refresh_token', res.refreshToken);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { fullName: string; email: string; password: string; phone?: string }): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      localStorage.setItem('civicfix_access_token', res.accessToken);
      localStorage.setItem('civicfix_refresh_token', res.refreshToken);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('civicfix_refresh_token') || undefined;
    await authApi.logout(refreshToken);
    localStorage.removeItem('civicfix_access_token');
    localStorage.removeItem('civicfix_refresh_token');
    setUser(null);
  };

  const switchDemoUser = async (roleToSwitch: Role): Promise<User> => {
    const creds = DEMO_CREDENTIALS[roleToSwitch];
    return await login(creds.email, creds.pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
