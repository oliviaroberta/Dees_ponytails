import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  admin: AdminUser | null;
}

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: { email: string; fullName: string }) => Promise<void>;
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const STORAGE_KEY = "dees_admin_auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window === "undefined") {
      return { accessToken: null, refreshToken: null, admin: null };
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return { accessToken: null, refreshToken: null, admin: null };
    }

    try {
      return JSON.parse(saved) as AuthState;
    } catch {
      return { accessToken: null, refreshToken: null, admin: null };
    }
  });
  const [isBootstrapping] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      isAuthenticated: !!state.accessToken && !!state.admin,
      isBootstrapping,
      login: async (email, password) => {
        const response = await apiRequest<{
          accessToken: string;
          refreshToken: string;
          admin: AdminUser;
        }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        setState({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          admin: response.admin,
        });
      },
      logout: async () => {
        try {
          if (state.refreshToken) {
            await apiRequest("/auth/logout", {
              method: "POST",
              body: JSON.stringify({ refreshToken: state.refreshToken }),
            });
          }
        } catch (error) {
          if (!(error instanceof ApiError)) {
            throw error;
          }
        } finally {
          setState({
            accessToken: null,
            refreshToken: null,
            admin: null,
          });
        }
      },
      updateProfile: async ({ email, fullName }) => {
        if (!state.accessToken) {
          throw new Error("Authentication required");
        }

        const response = await apiRequest<{
          admin: AdminUser;
          message: string;
        }>("/auth/me", {
          method: "PATCH",
          token: state.accessToken,
          body: JSON.stringify({ email, fullName }),
        });

        setState((current) => ({
          ...current,
          admin: response.admin,
        }));
      },
      changePassword: async ({ currentPassword, newPassword }) => {
        if (!state.accessToken) {
          throw new Error("Authentication required");
        }

        await apiRequest<{ message: string }>("/auth/change-password", {
          method: "PATCH",
          token: state.accessToken,
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        setState({
          accessToken: null,
          refreshToken: null,
          admin: null,
        });
      },
    }),
    [isBootstrapping, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
