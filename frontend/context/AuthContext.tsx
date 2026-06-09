"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  login as loginService,
  register as registerService,
  getCurrentUser,
  logout as logoutService,
} from "@/services/auth";

interface AuthContextType {
  user: any;
  loading: boolean;
  authenticated: boolean;

  login: (email: string, password: string) => Promise<any>;

  register: (payload: any) => Promise<any>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_TIMEOUT = 1000 * 60 * 60 * 8; // 8 hours

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch {}

    localStorage.removeItem("token");
    localStorage.removeItem("lastActivity");

    setUser(null);

    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await getCurrentUser();

      setUser(profile);
    } catch {
      await logout();
    }
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginService({
        email,
        password,
      });

      localStorage.setItem("token", data.token);

      const now = Date.now().toString();

      localStorage.setItem("lastActivity", now);
      localStorage.setItem("loginTime", now);

      setUser(data.user);

      return data;
    },
    []
  );

  const register = useCallback(async (payload: any) => {
    return registerService(payload);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getCurrentUser();

        setUser(profile);
      } catch {
        localStorage.removeItem("token");
      }

      setLoading(false);
    };

    initialize();
  }, []);

  useEffect(() => {
    const updateActivity = () => {
      localStorage.setItem(
        "lastActivity",
        Date.now().toString()
      );
    };

    const events = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) =>
      window.addEventListener(event, updateActivity)
    );

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, updateActivity)
      );
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const lastActivity =
        localStorage.getItem("lastActivity");

      if (!lastActivity) return;

      const inactiveFor =
        Date.now() - Number(lastActivity);

      if (inactiveFor > SESSION_TIMEOUT) {
        logout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      loading,

      authenticated: !!user,

      login,

      register,

      logout,

      refreshUser,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}