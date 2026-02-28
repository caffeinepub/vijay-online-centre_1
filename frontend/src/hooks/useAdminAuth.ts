import { useState, useEffect } from 'react';

const ADMIN_SESSION_KEY = 'adminSession';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Valid credential pairs: (vijay / 123) and (vijay / 2026)
const VALID_CREDENTIALS = [
  { username: 'vijay', password: '123' },
  { username: 'vijay', password: '2026' },
];

interface AdminSession {
  token: string;
  expiry: number;
  username: string;
}

interface UseAdminAuthReturn {
  isAdminAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getAdminToken: () => string | null;
  adminToken: string | null;
}

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getStoredSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    if (Date.now() > session.expiry) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [session, setSession] = useState<AdminSession | null>(() => getStoredSession());

  useEffect(() => {
    const stored = getStoredSession();
    setSession(stored);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    const isValid = VALID_CREDENTIALS.some(
      (cred) => cred.username === trimmedUsername && cred.password === trimmedPassword
    );

    if (!isValid) {
      return { success: false, error: 'Invalid username or password' };
    }

    const newSession: AdminSession = {
      token: generateToken(),
      expiry: Date.now() + SESSION_DURATION,
      username: trimmedUsername,
    };

    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setSession(null);
  };

  const getAdminToken = (): string | null => {
    const stored = getStoredSession();
    return stored?.token ?? null;
  };

  return {
    isAdminAuthenticated: session !== null,
    login,
    logout,
    getAdminToken,
    adminToken: session?.token ?? null,
  };
}
