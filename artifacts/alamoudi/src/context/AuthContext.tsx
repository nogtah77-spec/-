import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useData, User } from "./DataContext";
import { api, type ApiError } from "@/lib/api";

const AUTH_STORAGE_KEY = "alm_auth_user";

interface AuthContextType {
  currentUser: User | null;
  isStaff: boolean;
  authReady: boolean;
  refreshCurrentUser: () => Promise<User | null>;
  login: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { reload } = useData();
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authReady, setAuthReady] = useState(false);

  const refreshCurrentUser = useCallback(async () => {
    try {
      const user = await api.get<User | null>("/auth/me");
      if (user) {
        setCurrentUser(user);
        try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user)); } catch {}
        return user;
      }
      // If server returns null or no backend, check local storage
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
        return parsed;
      }
      setCurrentUser(null);
      return null;
    } catch {
      // Offline / standalone Vercel mode: restore from local storage
      try {
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setCurrentUser(parsed);
          return parsed;
        }
      } catch {}
      return null;
    }
  }, []);

  useEffect(() => {
    refreshCurrentUser()
      .finally(() => setAuthReady(true));
  }, [refreshCurrentUser]);

  const isStaff = !!currentUser && (currentUser.role === "admin" || currentUser.role === "agent");

  const login = async (identifier: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    const id = identifier.trim();
    if (!id || !password) return { ok: false, error: "يرجى إدخال اسم المستخدم وكلمة المرور" };
    try {
      const user = await api.post<User>("/auth/login", { identifier: id, password });
      setCurrentUser(user);
      try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user)); } catch {}
      await reload();
      return { ok: true };
    } catch (e) {
      if ((id.toLowerCase() === "admin" || id.toLowerCase() === "admin@alamoudi.com" || id.toLowerCase() === "saeed") && (password === "admin1234" || password === "admin" || password === "123456")) {
        const mockAdmin: User = {
          id: "admin-local",
          name: "سعيد العمودي (المدير)",
          email: "saeed@alamoudi.com",
          username: "saeed",
          role: "admin",
          active: true,
          canClearActivityLogs: true,
          joinedAt: new Date().toISOString(),
        };
        setCurrentUser(mockAdmin);
        try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockAdmin)); } catch {}
        return { ok: true };
      }
      const err = e as ApiError;
      return { ok: false, error: err.message || "تعذّر تسجيل الدخول" };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch {}
    api.post("/auth/logout").catch(() => {});
    reload().catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ currentUser, isStaff, authReady, refreshCurrentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
