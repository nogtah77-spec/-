import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useData, User, DEFAULT_STAFF_USERS } from "./DataContext";
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
  const { reload, users } = useData();
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
      if (user && user.id) {
        setCurrentUser(user);
        try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user)); } catch {}
        await reload().catch(() => {});
        return { ok: true };
      }
    } catch {
      /* Fallback to local / cached authentication */
    }

    // 1. Gather all known users (from state, localStorage, and defaults)
    const localUsers: User[] = (() => {
      try {
        const raw = localStorage.getItem("alm_users");
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();

    const userMap = new Map<string, User>();
    DEFAULT_STAFF_USERS.forEach(u => userMap.set(u.id, u));
    (users || []).forEach(u => userMap.set(u.id, u));
    localUsers.forEach(u => userMap.set(u.id, u));
    const allUsers = Array.from(userMap.values());

    const cleanId = id.toLowerCase();
    const matchedUser = allUsers.find(u =>
      (u.username && u.username.toLowerCase() === cleanId) ||
      (u.email && u.email.toLowerCase() === cleanId) ||
      (cleanId === "admin" && (u.role === "admin" || u.username === "saeed"))
    );

    if (matchedUser) {
      if (matchedUser.active === false) {
        return { ok: false, error: "هذا الحساب غير مفعّل. يرجى التواصل مع الإدارة." };
      }

      const isDefaultStaff = DEFAULT_STAFF_USERS.some(ds => ds.id === matchedUser.id);
      const isDefaultPassword = password === "admin1234" || password === "admin" || password === "123456" || password === "password";
      const isCustomPasswordMatch = matchedUser.password ? matchedUser.password === password : isDefaultPassword;

      if (isCustomPasswordMatch || (isDefaultStaff && isDefaultPassword)) {
        const { password: _p, ...safeUser } = matchedUser;
        const loggedUser: User = {
          ...safeUser,
          active: true,
        };
        setCurrentUser(loggedUser);
        try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser)); } catch {}
        await reload().catch(() => {});
        return { ok: true };
      }

      return { ok: false, error: "كلمة المرور غير صحيحة" };
    }

    // 2. Emergency fallback for default administrator
    if (
      (cleanId === "admin" || cleanId === "admin@alamoudi.com" || cleanId === "saeed") &&
      (password === "admin1234" || password === "admin" || password === "123456")
    ) {
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

    return { ok: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
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
