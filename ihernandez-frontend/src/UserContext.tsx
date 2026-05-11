import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type UserRole = "customer" | "employee" | "admin";

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: UserRole;
}

interface UserContextValue {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user ?? null);
    } catch (error) {
      console.error("Error fetching current user:", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser().finally(() => setLoading(false));
  }, [loadCurrentUser]);

  const login = async (identifier: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: identifier, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al iniciar sesión");
    }

    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setUser(null);
    }
  };

  const refresh = useCallback(async () => {
    await loadCurrentUser();
  }, [loadCurrentUser]);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, refresh]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
