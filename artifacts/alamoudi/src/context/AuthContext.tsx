import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useData, User } from "./DataContext";

interface AuthContextType {
  currentUser: User | null;
  isStaff: boolean;
  login: (identifier: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "alamoudi_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { users } = useData();
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try { return localStorage.getItem(SESSION_KEY); } catch { return null; }
  });

  useEffect(() => {
    try {
      if (currentUserId) localStorage.setItem(SESSION_KEY, currentUserId);
      else localStorage.removeItem(SESSION_KEY);
    } catch {}
  }, [currentUserId]);

  const currentUser = users.find(u => u.id === currentUserId && u.active) ?? null;
  const isStaff = !!currentUser && (currentUser.role === "admin" || currentUser.role === "agent");

  const login = (identifier: string, password: string): { ok: boolean; error?: string } => {
    const id = identifier.trim().toLowerCase();
    if (!id || !password) return { ok: false, error: "يرجى إدخال اسم المستخدم وكلمة المرور" };
    const user = users.find(
      u =>
        (u.username?.toLowerCase() === id || u.email.toLowerCase() === id) &&
        u.password === password
    );
    if (!user) return { ok: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
    if (!user.active) return { ok: false, error: "هذا الحساب غير مفعّل. تواصل مع الإدارة." };
    if (user.role !== "admin" && user.role !== "agent") {
      return { ok: false, error: "هذه الصفحة مخصّصة للإدارة والموظفين فقط" };
    }
    setCurrentUserId(user.id);
    return { ok: true };
  };

  const logout = () => setCurrentUserId(null);

  return (
    <AuthContext.Provider value={{ currentUser, isStaff, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
