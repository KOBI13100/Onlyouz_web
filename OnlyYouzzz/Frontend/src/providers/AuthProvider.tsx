"use client";
import React from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  verified?: boolean;
  lastSeen?: string | null;
  description?: string;
  dateOfBirth?: string | null;
  gender?: string | null;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  ready: boolean;
  login: (payload: { token: string; user: AuthUser }) => void;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "oy_auth_token";
const USER_KEY = "oy_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      const u = localStorage.getItem(USER_KEY);
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
    } catch {}
    setReady(true);
  }, []);

  const login = React.useCallback(({ token, user }: { token: string; user: AuthUser }) => {
    setToken(token);
    setUser(user);
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  }, []);

  const logout = React.useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
    try {
      if (typeof window !== 'undefined') {
        const { location } = window;
        if (location.pathname.startsWith('/mon-espace')) {
          location.href = '/';
          return;
        }
      }
    } catch {}
  }, []);

  const updateUser = React.useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...partial } : prev;
      try {
        if (next) localStorage.setItem(USER_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const value = React.useMemo(() => ({ token, user, ready, login, logout, updateUser }), [token, user, ready, login, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


