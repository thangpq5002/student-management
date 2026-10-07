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

  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const SESSION_KEY = 'student_management_session';
const AUTH_SESSION_INVALIDATED_EVENT = 'student-management:auth-session-invalidated';

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const binary = window.atob(
      normalizedPayload.padEnd(
        Math.ceil(normalizedPayload.length / 4) * 4,
        '=',
      ),
    );
    const decodedBytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    const decoded = JSON.parse(
      new TextDecoder().decode(decodedBytes),
    ) as Record<string, unknown>;

    return decoded;
  } catch {
    return null;
  }
};

const decodeRoleFromJwt = (token: string): UserRole | null => {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const role = String(payload.role ?? '').toUpperCase();
  if (role === 'ADMIN') return 'admin';
  if (role === 'TEACHER') return 'teacher';

  return null;
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const sessionData =
          localStorage.getItem(SESSION_KEY) ??
          sessionStorage.getItem(SESSION_KEY);

        if (!sessionData) {
          setIsLoading(false);
          return;
        }

        const session: StoredSession = JSON.parse(sessionData);
        const tokenRole = decodeRoleFromJwt(session.token);

        if (
          !tokenRole ||
          session.user.role !== tokenRole ||
          (session.expiresAt &&
            new Date(session.expiresAt).getTime() <= Date.now())
        ) {
          localStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(SESSION_KEY);
          setIsLoading(false);
          return;
        }

        setToken(session.token);
        setUser(session.user);
      } catch {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    const handleInvalidatedSession = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    };

    window.addEventListener(
      AUTH_SESSION_INVALIDATED_EVENT,
      handleInvalidatedSession,
    );

    return () => {
      window.removeEventListener(
        AUTH_SESSION_INVALIDATED_EVENT,
        handleInvalidatedSession,
      );
    };
  }, []);

  const login = async (
    username: string,
    password: string,
    rememberMe = true,
  ): Promise<boolean> => {
    const session = await authService.login({ username, password, rememberMe });
    const tokenRole = decodeRoleFromJwt(session.token);

    if (!tokenRole || session.user.role !== tokenRole) {
      throw new Error('Đăng nhập trả về một vai trò không hợp lệ.');
    }

    const loggedUser: User = {
      ...session.user,
      avatarText: session.user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    };

    const storedSession: StoredSession = {
      token: session.token,
      expiresAt: session.expiresAt,
      user: loggedUser,
    };

    setUser(loggedUser);
    setToken(session.token);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(SESSION_KEY, JSON.stringify(storedSession));

    if (rememberMe) {
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }

    return true;
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