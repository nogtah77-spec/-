import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useData, User, DEFAULT_STAFF_USERS } from "./DataContext";
import { api, type ApiError } from "@/lib/api";
import { supabaseService } from "@/lib/supabaseService";

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
    const idClean = identifier.trim().toLowerCase().replace(/^@+/, "");
    const passClean = password.trim();
    if (!idClean || !passClean) return { ok: false, error: "يرجى إدخال اسم المستخدم وكلمة المرور" };

    // 1. Try API server first
    try {
      const user = await api.post<User>("/auth/login", { identifier: idClean, password: passClean });
      if (user && user.id) {
        setCurrentUser(user);
        try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user)); } catch {}
        await reload().catch(() => {});
        return { ok: true };
      }
    } catch {
      /* Fallback to local / cached authentication */
    }

    // 2. Gather all known users (from state, localStorage, defaults, and Supabase cloud)
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

    // Real-time Cloud Sync from Supabase so any user added from another device logs in instantly
    try {
      const cloudUsers = await supabaseService.fetchUsers();
      if (cloudUsers && cloudUsers.length > 0) {
        cloudUsers.forEach(u => userMap.set(u.id, u));
      }
    } catch (e) {
      console.warn("Supabase fetch during login warning:", e);
    }

    const allUsers = Array.from(userMap.values());

    // 3. Match user by username, email, email prefix, or full name
    const matchedUser = allUsers.find(u => {
      const uUsername = (u.username || "").trim().toLowerCase().replace(/^@+/, "");
      const uEmail = (u.email || "").trim().toLowerCase();
      const uEmailPrefix = uEmail.split("@")[0];
      const uName = (u.name || "").trim().toLowerCase();

      return (
        (uUsername && uUsername === idClean) ||
        (uEmail && uEmail === idClean) ||
        (uEmailPrefix && uEmailPrefix === idClean) ||
        (idClean.includes("@") && idClean.split("@")[0] === uUsername) ||
        (uName && uName === idClean) ||
        (idClean === "admin" && (u.role === "admin" || uUsername === "saeed"))
      );
    });

    if (matchedUser) {
      if (matchedUser.active === false) {
        return { ok: false, error: "هذا الحساب غير مفعّل. يرجى التواصل مع الإدارة." };
      }

      const isDefaultStaff = DEFAULT_STAFF_USERS.some(ds => ds.id === matchedUser.id);
      const isDefaultPassword =
        passClean === "admin1234" ||
        passClean === "admin" ||
        passClean === "123456" ||
        passClean === "password";

      const isMatch = matchedUser.password
        ? matchedUser.password === passClean
        : isDefaultPassword || passClean.length >= 4;

      if (isMatch) {
        const { password: _p, ...safeUser } = matchedUser;
        const loggedUser: User = {
          ...safeUser,
          active: true,
        };
        setCurrentUser(loggedUser);
        try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser)); } catch {}

        // Persist password to local storage so future logins match consistently
        if (!matchedUser.password) {
          const updatedList = allUsers.map(x => (x.id === matchedUser.id ? { ...x, password: passClean } : x));
          try { localStorage.setItem("alm_users", JSON.stringify(updatedList)); } catch {}
        }

        await reload().catch(() => {});
        return { ok: true };
      }

      return { ok: false, error: "كلمة المرور غير صحيحة" };
    }

    // 4. Emergency fallback for default administrator
    if (
      (idClean === "admin" || idClean === "admin@alamoudi.com" || idClean === "saeed") &&
      (passClean === "admin1234" || passClean === "admin" || passClean === "123456")
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

    return { ok: false, error: "اسم المستخدم أو البريد الإلكتروني غير موجود" };
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
