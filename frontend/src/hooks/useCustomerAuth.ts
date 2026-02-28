import React, { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'customerAuth';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface CustomerAuthState {
  identifier: string;
  mobile: string;
  name: string;
  loginTime: number;
}

export function getLatestAuth(): CustomerAuthState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed: CustomerAuthState = JSON.parse(stored);
    if (Date.now() - parsed.loginTime > SESSION_DURATION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Generates a cryptographically random 6-digit OTP.
 */
export function generateRandomOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const otp = (array[0] % 900000) + 100000;
  return otp.toString();
}

export function useCustomerAuth() {
  const [auth, setAuth] = useState<CustomerAuthState | null>(getLatestAuth);

  useEffect(() => {
    const stored = getLatestAuth();
    setAuth(stored);
  }, []);

  const loginWithMobile = useCallback((phone: string, name: string) => {
    const state: CustomerAuthState = {
      identifier: phone,
      mobile: phone,
      name,
      loginTime: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setAuth(state);
  }, []);

  // Alias for loginWithMobile
  const login = loginWithMobile;

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }, []);

  return {
    auth,
    isAuthenticated: !!auth,
    identifier: auth?.identifier ?? null,
    name: auth?.name ?? null,
    mobile: auth?.mobile ?? null,
    loginWithMobile,
    login,
    logout,
    getLatestAuth,
  };
}
