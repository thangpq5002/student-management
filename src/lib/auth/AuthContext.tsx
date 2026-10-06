'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { authService } from '@/modules/auth/services/auth.service';

export type UserRole = 'admin' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarText: string;
  title: string;
}

interface StoredSession {
  token: string;
  expiresAt: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (
    username: string,
    password: string,
    role: UserRole,
    rememberMe?: boolean,
  ) => Promise<boolean>;

  switchRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const SESSION_KEY = 'student_management_session';

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * RESTORE SESSION
   */
  useEffect(() => {
    try {
      const sessionData =
        localStorage.getItem(SESSION_KEY) ??
        sessionStorage.getItem(SESSION_KEY);

      if (!sessionData) {
        setIsLoading(false);
        return;
      }

      const session: StoredSession = JSON.parse(sessionData);

      if (
        session.expiresAt &&
        new Date(session.expiresAt).getTime() <= Date.now()
      ) {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        setIsLoading(false);
        return;
      }

      setUser(session.user);
      setToken(session.token);
    } catch (error) {
      console.error('Không thể restore auth session:', error);

      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * LOGIN
   */
  const login = async (
    username: string,
    password: string,
    _role: UserRole,
    rememberMe = true,
  ): Promise<boolean> => {
    const session = await authService.login({
      username,
      password,
      role: _role,
      rememberMe,
    });

    const loggedUser: User = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      avatarText: session.user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      title: session.user.title,
    };

    const storedSession: StoredSession = {
      token: session.token,
      expiresAt: session.expiresAt,
      user: loggedUser,
    };

    setUser(loggedUser);
    setToken(session.token);

    const storage = rememberMe
      ? localStorage
      : sessionStorage;

    storage.setItem(
      SESSION_KEY,
      JSON.stringify(storedSession),
    );

    if (rememberMe) {
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }

    return true;
  };

  /**
   * SWITCH ROLE
   */
  const switchRole = (role: UserRole) => {
    if (!user || !token) return;

    const updatedUser = { ...user, role };
    const storedSession: StoredSession = {
      token,
      expiresAt: new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString(),
      user: updatedUser,
    };

    setUser(updatedUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(storedSession));
  };

  /**
   * LOGOUT
   */
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider',
    );
  }

  return context;
};