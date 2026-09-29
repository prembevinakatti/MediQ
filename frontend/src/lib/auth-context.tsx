"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, User } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mediq_token");
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("mediq_user");
      if (savedUser) {
        try {
          return JSON.parse(savedUser) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return Boolean(localStorage.getItem("mediq_token"));
    }
    return false;
  });

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mediq_token");
      localStorage.removeItem("mediq_user");
    }
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("mediq_token");
    if (savedToken) {
      api
        .getMe()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem("mediq_user", JSON.stringify(freshUser));
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [logout]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem("mediq_token", res.access_token);
    const userInfo: User = {
      user_id: res.user_id,
      name: res.name,
      email: res.email,
    };
    localStorage.setItem("mediq_user", JSON.stringify(userInfo));
    setToken(res.access_token);
    setUser(userInfo);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    localStorage.setItem("mediq_token", res.access_token);
    const userInfo: User = {
      user_id: res.user_id,
      name: res.name,
      email: res.email,
    };
    localStorage.setItem("mediq_user", JSON.stringify(userInfo));
    setToken(res.access_token);
    setUser(userInfo);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
